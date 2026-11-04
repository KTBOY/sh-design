import * as THREE from 'three'
import { createDistrict, type District } from './district'
import { LANDMARKS } from './landmarks'
import { createWalker, type Walker } from './walker'

export interface CityLabelPosition {
  id: string
  x: number
  y: number
}

export type WalkDirection = 'up' | 'down' | 'left' | 'right'

export interface WalkTip {
  nearId: string | null
  x: number
  y: number
}

interface StageOptions {
  ids: string[]
  selectedId: string
  reducedMotion: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  onProject: (labels: CityLabelPosition[]) => void
  onWalk?: (tip: WalkTip | null) => void
  onWalkChange?: (walking: boolean) => void
  onView?: (firstPerson: boolean) => void
  onError: () => void
}

export interface ProductStage {
  select: (id: string) => void
  hover: (id: string | null) => void
  setReducedMotion: (reduced: boolean) => void
  setDusk: (on: boolean) => void
  setWalk: (on: boolean) => void
  setDirection: (direction: WalkDirection, pressed: boolean) => void
  /** 漫游内切换第一人称/等距视角；非漫游态调用无效。 */
  setFirstPerson: (on: boolean) => void
  reset: () => void
  dispose: () => void
}

const ANIMATION_MS = 1100
const WATER_FRAME_MS = 40
const CAMERA_POSITION = new THREE.Vector3(30, 40, 46)
/** 手动拖拽的角度上限：方位 ±18°，俯仰 ±8° */
const AZIMUTH_LIMIT = 0.32
const TILT_LIMIT = 0.14
const DRAG_THRESHOLD = 8
/** 漫游：视距缩放、出生点、步速与近建筑提示半径。 */
const WALK_SCALE = 0.3
const WALK_SPAWN = { x: 0, z: 7 }
const WALK_SPEED = 3.4
const WALK_SPRINT = 5.4
const NEAR_DISTANCE = 5.5
const MOVE_CODES = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight'
])

const SUN_WARM = new THREE.Color(0xfff4dd)
const SUN_AMBER = new THREE.Color(0xffd2a0)
const SKY_WARM = new THREE.Color(0xfffcf5)
const SKY_DUSK = new THREE.Color(0xffe9cf)
const GROUND_WARM = new THREE.Color(0xc7c6b7)
const GROUND_DUSK = new THREE.Color(0xd9c1a6)

/** 只在客户端创建；河面流动时低频绘制，离屏、后台和减少动态时停止循环。 */
export function createProductStage(host: HTMLElement, options: StageOptions): ProductStage {
  let renderer: THREE.WebGLRenderer | null = null
  let district: District | null = null
  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let frame = 0
  let disposed = false
  let onScreen = true
  let reducedMotion = options.reducedMotion
  let selectedId = options.selectedId
  let hoveredId: string | null = null
  let animationStart = -Infinity
  let waterElapsed = 0
  let lastFrameAt = 0
  let lastPaintAt = 0
  let pointerDown: { x: number; y: number; id: string | null } | null = null
  let pendingPointer: PointerEvent | null = null
  let drag: {
    startX: number
    startY: number
    lastX: number
    lastY: number
    active: boolean
  } | null = null
  let azimuth = 0
  let elevation = 0
  let zoom = 1
  let introStartedAt = -1
  let introRunning = true
  let dusk = 0
  let duskTarget = 0
  let hemiLight: THREE.HemisphereLight | null = null
  let sunlight: THREE.DirectionalLight | null = null
  let width = 1
  let height = 1
  let needsResize = true
  let walkMode = false
  let walker: Walker | null = null
  let walkAppear = 0
  let walkAppearTarget = 0
  let viewScale = 1
  let viewScaleTarget = 1
  let walkHeading = Math.PI
  let firstPerson = false
  let lookYaw = 0
  let lookPitch = 0
  let walkMoving = false
  const walkPos = new THREE.Vector3(WALK_SPAWN.x, 0.05, WALK_SPAWN.z)
  const walkVelocity = new THREE.Vector2()
  const keys = new Set<string>()
  const directions: Record<WalkDirection, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false
  }
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-26, 26, 20, -20, 0.1, 200)
  const fpCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const focus = new THREE.Vector3()
  const focusFrom = new THREE.Vector3()
  const focusTo = new THREE.Vector3()
  const projected = new THREE.Vector3()

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', wake)
    window.removeEventListener('resize', requestResize)
    host.removeEventListener('pointermove', onPointerMove)
    host.removeEventListener('pointerleave', onPointerLeave)
    host.removeEventListener('pointerdown', onPointerDown)
    host.removeEventListener('pointerup', onPointerUp)
    host.removeEventListener('pointercancel', onPointerLeave)
    host.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', clearKeys)
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost)
    district?.dispose()
    walker?.dispose()
    walker = null
    scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) object.shadow.dispose()
    })
    if (renderer) {
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
    scene.clear()
    host.style.cursor = ''
  }

  function fail() {
    dispose()
    options.onError()
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    fail()
  }

  function wake() {
    if (document.hidden) clearKeys()
    if (disposed || frame || !onScreen || document.hidden) return
    frame = requestAnimationFrame(draw)
  }

  function requestResize() {
    needsResize = true
    wake()
  }

  function resize() {
    width = Math.max(1, host.clientWidth)
    height = Math.max(1, host.clientHeight)
    const aspect = width / height
    const halfHeight = Math.max(19, 26 / aspect) * zoom * viewScale
    camera.left = -halfHeight * aspect
    camera.right = halfHeight * aspect
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()
    fpCamera.aspect = aspect
    fpCamera.updateProjectionMatrix()
    renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2))
    renderer?.setSize(width, height, false)
    if (renderer) renderer.shadowMap.needsUpdate = true
  }

  const cameraOffset = new THREE.Vector3()
  const baseDirection = CAMERA_POSITION.clone().normalize()
  const baseRadius = CAMERA_POSITION.length()
  const baseTheta = Math.atan2(baseDirection.x, baseDirection.z)
  const basePhi = Math.asin(baseDirection.y)

  /** 正交相机绕焦点做小幅轨道旋转；俯仰只改高度角，不翻滚。 */
  function applyCamera() {
    const theta = baseTheta + azimuth
    const phi = basePhi + elevation
    cameraOffset.set(
      Math.sin(theta) * Math.cos(phi) * baseRadius,
      Math.sin(phi) * baseRadius,
      Math.cos(theta) * Math.cos(phi) * baseRadius
    )
    camera.position.copy(focus).add(cameraOffset)
    camera.lookAt(focus)
    camera.updateMatrixWorld()
  }

  /** 第一人称：眼位贴人物头部，俯仰/偏航由拖拽控制；行走时轻微起伏。 */
  function applyFirstPerson() {
    const bob = walkMoving && !reducedMotion ? Math.sin(waterElapsed * 9.5) * 0.03 : 0
    const eyeY = walkPos.y + 1.02 + bob
    const cosPitch = Math.cos(lookPitch)
    fpCamera.position.set(walkPos.x, eyeY, walkPos.z)
    fpCamera.lookAt(
      walkPos.x - Math.sin(lookYaw) * cosPitch,
      eyeY + Math.sin(lookPitch),
      walkPos.z - Math.cos(lookYaw) * cosPitch
    )
    fpCamera.updateMatrixWorld()
    return fpCamera
  }

  function viewCamera() {
    if (walkMode && firstPerson) return applyFirstPerson()
    applyCamera()
    return camera
  }

  function applyDusk() {
    if (!sunlight || !hemiLight) return
    sunlight.color.copy(SUN_WARM).lerp(SUN_AMBER, dusk)
    sunlight.intensity = 3.5 - dusk * 1.45
    sunlight.position.set(-15 + dusk * 14, 35 - dusk * 12, 20)
    hemiLight.color.copy(SKY_WARM).lerp(SKY_DUSK, dusk)
    hemiLight.groundColor.copy(GROUND_WARM).lerp(GROUND_DUSK, dusk)
    hemiLight.intensity = 2.8 - dusk * 0.85
    if (renderer) {
      renderer.toneMappingExposure = 1.25 + dusk * 0.1
      renderer.shadowMap.needsUpdate = true
    }
  }

  function hover(id: string | null) {
    // DOM 铭牌进入或聚焦后，旧 canvas 事件不能在下一帧覆盖它的高亮。
    pendingPointer = null
    if (disposed || hoveredId === id) return
    hoveredId = id
    district?.setHover(id)
    host.style.cursor = id ? 'pointer' : ''
    options.onHover(id)
    wake()
  }

  function pick(event: PointerEvent) {
    if (!district || !(event.target instanceof HTMLCanvasElement)) return null
    const rect = host.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    )
    raycaster.setFromCamera(pointer, walkMode && firstPerson ? fpCamera : camera)
    const hit = raycaster.intersectObjects(district.pickables, true)[0]
    let object: THREE.Object3D | null = hit?.object ?? null
    while (object) {
      if (typeof object.userData.toolId === 'string') return object.userData.toolId as string
      object = object.parent
    }
    return null
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch' || !(event.target instanceof HTMLCanvasElement)) return
    if (drag) {
      const totalDx = event.clientX - drag.startX
      const totalDy = event.clientY - drag.startY
      const dx = event.clientX - drag.lastX
      const dy = event.clientY - drag.lastY
      drag.lastX = event.clientX
      drag.lastY = event.clientY
      if (!drag.active && Math.hypot(totalDx, totalDy) > DRAG_THRESHOLD) drag.active = true
      if (drag.active) {
        if (walkMode && firstPerson) {
          // 第一人称：逐事件增量环顾，不回到默认角度
          lookYaw -= dx * 0.0035
          lookPitch = THREE.MathUtils.clamp(lookPitch - dy * 0.0028, -0.5, 0.5)
        } else {
          azimuth = THREE.MathUtils.clamp(totalDx * 0.0024, -AZIMUTH_LIMIT, AZIMUTH_LIMIT)
          elevation = THREE.MathUtils.clamp(-totalDy * 0.0016, -TILT_LIMIT, TILT_LIMIT)
        }
        pendingPointer = null
        wake()
        return
      }
    }
    pendingPointer = event
    wake()
  }

  function onPointerLeave() {
    pendingPointer = null
    pointerDown = null
    drag = null
    hover(null)
  }

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return
    pointerDown = { x: event.clientX, y: event.clientY, id: pick(event) }
    if (event.pointerType !== 'touch' && event.target instanceof HTMLCanvasElement) {
      drag = {
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        active: false,
      }
    }
  }

  function onPointerUp(event: PointerEvent) {
    const start = pointerDown
    const wasDragging = drag?.active ?? false
    pointerDown = null
    drag = null
    if (wasDragging) {
      if (reducedMotion) {
        azimuth = 0
        elevation = 0
      }
      wake()
      return
    }
    if (!start?.id || Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_THRESHOLD)
      return
    if (pick(event) === start.id) options.onSelect(start.id)
  }

  /** 只在按住 Ctrl/⌘ 时接管滚轮，避免抢掉页面滚动。 */
  function onWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey) return
    event.preventDefault()
    zoom = THREE.MathUtils.clamp(zoom * Math.exp(event.deltaY * 0.0012), 0.78, 1.45)
    if (walkMode && firstPerson) {
      // 第一人称下滚轮改为调视野，保持等距时的手感一致
      fpCamera.fov = THREE.MathUtils.clamp(55 / zoom, 40, 78)
      fpCamera.updateProjectionMatrix()
      wake()
      return
    }
    needsResize = true
    wake()
  }

  function beginTransition() {
    focusFrom.copy(focus)
    animationStart = reducedMotion ? -Infinity : performance.now()
    wake()
  }

  function select(id: string) {
    if (disposed || !district) return
    district.animate(selectedId, 1)
    selectedId = id
    district.setSelection(id)
    if (walkMode) return
    const anchor = district.anchors.get(id)
    focusTo.set((anchor?.x ?? 0) * 0.055, 0, (anchor?.z ?? 0) * 0.055)
    beginTransition()
  }

  function reset() {
    focusTo.set(0, 0, 0)
    zoom = 1
    azimuth = 0
    elevation = 0
    needsResize = true
    beginTransition()
  }

  function setReducedMotion(reduced: boolean) {
    reducedMotion = reduced
    if (reduced) animationStart = -Infinity
    wake()
  }

  function setDusk(on: boolean) {
    duskTarget = on ? 1 : 0
    wake()
  }

  function clearKeys() {
    keys.clear()
    directions.up = false
    directions.down = false
    directions.left = false
    directions.right = false
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!walkMode) return
    if (event.code === 'Escape') {
      setWalk(false)
      return
    }
    const target = event.target
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    )
      return
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      keys.add(event.code)
      return
    }
    if (event.code === 'KeyV') {
      setFirstPerson(!firstPerson)
      return
    }
    if (!MOVE_CODES.has(event.code)) return
    keys.add(event.code)
    event.preventDefault()
    wake()
  }

  function onKeyUp(event: KeyboardEvent) {
    keys.delete(event.code)
  }

  function setWalk(on: boolean) {
    if (disposed || !district || walkMode === on) return
    walkMode = on
    clearKeys()
    firstPerson = false
    azimuth = 0
    elevation = 0
    if (on) {
      walkPos.set(WALK_SPAWN.x, district.groundY(WALK_SPAWN.x, WALK_SPAWN.z), WALK_SPAWN.z)
      walkVelocity.set(0, 0)
      walkHeading = Math.PI
      walker?.setPosition(walkPos.x, walkPos.y, walkPos.z)
      walker?.setHeading(walkHeading)
      viewScaleTarget = WALK_SCALE
      walkAppearTarget = 1
    } else {
      walkVelocity.set(0, 0)
      viewScaleTarget = 1
      walkAppearTarget = 0
      zoom = 1
      options.onWalk?.(null)
    }
    focusTo.set(walkMode ? walkPos.x : 0, 0, walkMode ? walkPos.z : 0)
    needsResize = true
    beginTransition()
    options.onWalkChange?.(on)
    wake()
  }

  function setDirection(direction: WalkDirection, pressed: boolean) {
    if (disposed) return
    directions[direction] = pressed
    wake()
  }

  function setFirstPerson(on: boolean) {
    if (disposed || !walkMode || firstPerson === on) return
    firstPerson = on
    drag = null
    if (on) {
      // 朝向当前行走方向：walkHeading 的 +z 约定换算到视线 yaw 的 -z 约定
      lookYaw = walkHeading + Math.PI
      lookPitch = 0
    }
    options.onView?.(on)
    wake()
  }

  function draw(now: number) {
    frame = 0
    if (disposed || !onScreen || document.hidden || !renderer || !district) return
    try {
      const delta = lastFrameAt ? Math.min(0.1, (now - lastFrameAt) / 1000) : 0
      lastFrameAt = now
      if (!reducedMotion) waterElapsed += delta

      if (introStartedAt < 0) introStartedAt = now
      if (introRunning) introRunning = district.intro(now - introStartedAt, reducedMotion)

      // 漫游：相机相对方向换算到地面位移，逐轴试探实现贴墙滑动。
      let walkBusy = false
      if (walkMode) {
        const up = directions.up || keys.has('KeyW') || keys.has('ArrowUp')
        const down = directions.down || keys.has('KeyS') || keys.has('ArrowDown')
        const left = directions.left || keys.has('KeyA') || keys.has('ArrowLeft')
        const right = directions.right || keys.has('KeyD') || keys.has('ArrowRight')
        const ix = (right ? 1 : 0) - (left ? 1 : 0)
        const iz = (up ? 1 : 0) - (down ? 1 : 0)
        let wishX = 0
        let wishZ = 0
        if (ix || iz) {
          const theta = firstPerson ? lookYaw : baseTheta + azimuth
          const sin = Math.sin(theta)
          const cos = Math.cos(theta)
          const norm = 1 / Math.hypot(ix, iz)
          // 屏幕：上 = (-sin, -cos)，右 = (cos, -sin)
          wishX = (ix * cos - iz * sin) * norm
          wishZ = (-ix * sin - iz * cos) * norm
        }
        const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? WALK_SPRINT : WALK_SPEED
        const accel = Math.min(1, delta * 12)
        walkVelocity.x += (wishX * speed - walkVelocity.x) * accel
        walkVelocity.y += (wishZ * speed - walkVelocity.y) * accel
        if (!ix && !iz && Math.hypot(walkVelocity.x, walkVelocity.y) < 0.06) walkVelocity.set(0, 0)
        const stepX = walkVelocity.x * delta
        const stepZ = walkVelocity.y * delta
        if (stepX && district.canWalk(walkPos.x + stepX, walkPos.z)) walkPos.x += stepX
        else if (stepX) walkVelocity.x = 0
        if (stepZ && district.canWalk(walkPos.x, walkPos.z + stepZ)) walkPos.z += stepZ
        else if (stepZ) walkVelocity.y = 0
        const ground = district.groundY(walkPos.x, walkPos.z)
        walkPos.y += (ground - walkPos.y) * Math.min(1, delta * 10)
        walkMoving = Math.hypot(walkVelocity.x, walkVelocity.y) > 0.2
        if (walkMoving) {
          const target = Math.atan2(walkVelocity.x, walkVelocity.y)
          const diff = ((target - walkHeading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
          walkHeading += diff * Math.min(1, delta * 10)
        }
        if (walker) {
          walker.setPosition(walkPos.x, walkPos.y, walkPos.z)
          walker.setHeading(walkHeading)
          walker.update(reducedMotion ? 0 : waterElapsed, walkMoving && !reducedMotion)
          walker.group.visible = walkAppear > 0.001 && !firstPerson
        }
        walkBusy = walkMoving || walkVelocity.x !== 0 || walkVelocity.y !== 0
      }
      if (walkAppear !== walkAppearTarget) {
        walkAppear += (walkAppearTarget - walkAppear) * Math.min(1, reducedMotion ? 1 : delta * 6)
        if (Math.abs(walkAppearTarget - walkAppear) < 0.005) walkAppear = walkAppearTarget
        walker?.setAppear(walkAppear)
        walkBusy = true
      }
      if (viewScale !== viewScaleTarget) {
        viewScale += (viewScaleTarget - viewScale) * Math.min(1, reducedMotion ? 1 : delta * 5)
        if (Math.abs(viewScaleTarget - viewScale) < 0.002) viewScale = viewScaleTarget
        needsResize = true
        walkBusy = true
      }

      // 松手后回正视角；减少动态时直接归零。第一人称保持当前视线不回调。
      if (!(walkMode && firstPerson) && !drag?.active && (azimuth !== 0 || elevation !== 0)) {
        if (reducedMotion) {
          azimuth = 0
          elevation = 0
        } else {
          const k = Math.min(1, delta * 6)
          azimuth += (0 - azimuth) * k
          elevation += (0 - elevation) * k
          if (Math.abs(azimuth) < 0.001) azimuth = 0
          if (Math.abs(elevation) < 0.001) elevation = 0
        }
      }

      // 聚焦、入场、轨道回正、元宝线、天色任一在跑就逐帧；否则河面流纹降到约 25fps。
      const focusRunning = !reducedMotion && now - animationStart < ANIMATION_MS
      const orbitSettling = !reducedMotion && (azimuth !== 0 || elevation !== 0)
      const districtBusy = district.update(waterElapsed, delta)
      const duskRunning = dusk !== duskTarget
      if (duskRunning) {
        dusk += (duskTarget - dusk) * Math.min(1, reducedMotion ? 1 : delta * 3)
        if (Math.abs(duskTarget - dusk) < 0.004) dusk = duskTarget
        applyDusk()
      }
      const firstPersonLooking = walkMode && firstPerson && drag?.active === true
      const fullRate =
        focusRunning ||
        introRunning ||
        orbitSettling ||
        districtBusy ||
        duskRunning ||
        needsResize ||
        walkBusy ||
        firstPersonLooking
      if (!reducedMotion && !fullRate && now - lastPaintAt < WATER_FRAME_MS) {
        frame = requestAnimationFrame(draw)
        return
      }
      lastPaintAt = now

      if (needsResize) {
        resize()
        needsResize = false
      }
      const progress = reducedMotion ? 1 : Math.min(1, (now - animationStart) / ANIMATION_MS)
      if (walkMode) focusTo.set(walkPos.x, 0, walkPos.z)
      const eased = 1 - Math.pow(1 - progress, 3)
      focus.lerpVectors(focusFrom, focusTo, eased)
      const view = viewCamera()
      district.animate(selectedId, progress)
      const shadowBusy =
        !reducedMotion &&
        (now - animationStart < ANIMATION_MS + WATER_FRAME_MS ||
          introRunning ||
          duskRunning ||
          walkBusy)
      if (shadowBusy) renderer.shadowMap.needsUpdate = true
      renderer.render(scene, view)
      if (pendingPointer) {
        hover(pick(pendingPointer))
        pendingPointer = null
      }
      const labels: CityLabelPosition[] = []
      district.anchors.forEach((anchor, id) => {
        // 铭牌跟着屋顶长起来，否则入场那 0.8 秒里它会悬在半空
        projected.set(anchor.x, anchor.y * district.growthOf(id), anchor.z).project(view)
        labels.push({
          id,
          x: Math.max(30, Math.min(width - 30, ((projected.x + 1) / 2) * width)),
          y: Math.max(58, Math.min(height - 48, ((1 - projected.y) / 2) * height))
        })
      })
      options.onProject(labels)
      if (walkMode && walker && options.onWalk) {
        if (firstPerson) {
          options.onWalk(null)
        } else {
          let nearId: string | null = null
          let near = NEAR_DISTANCE
          for (const id of options.ids) {
            const landmark = LANDMARKS[id]
            if (!landmark) continue
            const distance = Math.hypot(
              walkPos.x - landmark.position[0],
              walkPos.z - landmark.position[1]
            )
            if (distance < near) {
              near = distance
              nearId = id
            }
          }
          projected.set(walkPos.x, walkPos.y + 1.7, walkPos.z).project(view)
          options.onWalk({
            nearId,
            x: Math.round(Math.max(40, Math.min(width - 40, ((projected.x + 1) / 2) * width))),
            y: Math.round(Math.max(40, Math.min(height - 40, ((1 - projected.y) / 2) * height)))
          })
        }
      }
      if (!reducedMotion) wake()
    } catch {
      fail()
    }
  }

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    })
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.25
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    // 静态街区只在镜头聚焦动画和尺寸变化时重算阴影，河面流纹复用同一张阴影图。
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = true
    renderer.domElement.setAttribute('aria-hidden', 'true')
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    host.prepend(renderer.domElement)

    hemiLight = new THREE.HemisphereLight(0xfffcf5, 0xc7c6b7, 2.8)
    scene.add(hemiLight)
    sunlight = new THREE.DirectionalLight(0xfff4dd, 3.5)
    sunlight.position.set(-15, 35, 20)
    sunlight.castShadow = true
    sunlight.shadow.mapSize.set(1024, 1024)
    sunlight.shadow.camera.left = -30
    sunlight.shadow.camera.right = 30
    sunlight.shadow.camera.top = 30
    sunlight.shadow.camera.bottom = -30
    sunlight.shadow.camera.far = 100
    sunlight.shadow.normalBias = 0.06
    sunlight.shadow.bias = -0.0002
    sunlight.shadow.radius = 3
    scene.add(sunlight)
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6))

    district = createDistrict(options.ids)
    scene.add(district.group)
    district.setSelection(selectedId)
    walker = createWalker()
    walker.setAppear(0)
    scene.add(walker.group)
    host.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onPointerLeave)
    host.addEventListener('pointerdown', onPointerDown, { passive: true })
    host.addEventListener('pointerup', onPointerUp, { passive: true })
    host.addEventListener('pointercancel', onPointerLeave)
    host.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('visibilitychange', wake)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(requestResize)
      resizeObserver.observe(host)
    } else {
      window.addEventListener('resize', requestResize, { passive: true })
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting)
        if (onScreen) wake()
        else {
          cancelAnimationFrame(frame)
          frame = 0
        }
      })
      intersectionObserver.observe(host)
    }
    wake()
    return {
      select,
      hover,
      setReducedMotion,
      setDusk,
      setWalk,
      setDirection,
      setFirstPerson,
      reset,
      dispose
    }
  } catch (error) {
    dispose()
    throw error
  }
}
