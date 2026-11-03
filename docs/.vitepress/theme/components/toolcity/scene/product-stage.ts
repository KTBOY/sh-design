import * as THREE from 'three'
import { createDistrict, type District } from './district'

export interface CityLabelPosition {
  id: string
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
  onError: () => void
}

export interface ProductStage {
  select: (id: string) => void
  hover: (id: string | null) => void
  setReducedMotion: (reduced: boolean) => void
  setDusk: (on: boolean) => void
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
  let drag: { x: number; y: number; active: boolean } | null = null
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
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-26, 26, 20, -20, 0.1, 200)
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
    renderer?.domElement.removeEventListener('webglcontextlost', onContextLost)
    district?.dispose()
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
    const halfHeight = Math.max(19, 26 / aspect) * zoom
    camera.left = -halfHeight * aspect
    camera.right = halfHeight * aspect
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()
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
    raycaster.setFromCamera(pointer, camera)
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
      const dx = event.clientX - drag.x
      const dy = event.clientY - drag.y
      if (!drag.active && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.active = true
      if (drag.active) {
        azimuth = THREE.MathUtils.clamp(dx * 0.0024, -AZIMUTH_LIMIT, AZIMUTH_LIMIT)
        elevation = THREE.MathUtils.clamp(-dy * 0.0016, -TILT_LIMIT, TILT_LIMIT)
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
      drag = { x: event.clientX, y: event.clientY, active: false }
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
    const anchor = district.anchors.get(id)
    focusTo.set((anchor?.x ?? 0) * 0.055, 0, (anchor?.z ?? 0) * 0.055)
    beginTransition()
  }

  function reset() {
    focusTo.set(0, 0, 0)
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

  function draw(now: number) {
    frame = 0
    if (disposed || !onScreen || document.hidden || !renderer || !district) return
    try {
      const delta = lastFrameAt ? Math.min(0.1, (now - lastFrameAt) / 1000) : 0
      lastFrameAt = now
      if (!reducedMotion) waterElapsed += delta

      if (introStartedAt < 0) introStartedAt = now
      if (introRunning) introRunning = district.intro(now - introStartedAt, reducedMotion)

      // 松手后回正视角；减少动态时直接归零
      if (!drag?.active && (azimuth !== 0 || elevation !== 0)) {
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
      const fullRate =
        focusRunning || introRunning || orbitSettling || districtBusy || duskRunning || needsResize
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
      const eased = 1 - Math.pow(1 - progress, 3)
      focus.lerpVectors(focusFrom, focusTo, eased)
      applyCamera()
      district.animate(selectedId, progress)
      if (
        !reducedMotion &&
        (now - animationStart < ANIMATION_MS + WATER_FRAME_MS || introRunning || duskRunning)
      ) {
        renderer.shadowMap.needsUpdate = true
      }
      renderer.render(scene, camera)
      if (pendingPointer) {
        hover(pick(pendingPointer))
        pendingPointer = null
      }
      const labels: CityLabelPosition[] = []
      district.anchors.forEach((anchor, id) => {
        // 铭牌跟着屋顶长起来，否则入场那 0.8 秒里它会悬在半空
        projected.set(anchor.x, anchor.y * district.growthOf(id), anchor.z).project(camera)
        labels.push({
          id,
          x: Math.max(30, Math.min(width - 30, ((projected.x + 1) / 2) * width)),
          y: Math.max(58, Math.min(height - 48, ((1 - projected.y) / 2) * height))
        })
      })
      options.onProject(labels)
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
    host.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onPointerLeave)
    host.addEventListener('pointerdown', onPointerDown, { passive: true })
    host.addEventListener('pointerup', onPointerUp, { passive: true })
    host.addEventListener('pointercancel', onPointerLeave)
    host.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('visibilitychange', wake)
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
    return { select, hover, setReducedMotion, setDusk, reset, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
