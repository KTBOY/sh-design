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
  reset: () => void
  dispose: () => void
}

const ANIMATION_MS = 1100
const WATER_FRAME_MS = 40
const CAMERA_POSITION = new THREE.Vector3(30, 40, 46)

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
    const halfHeight = Math.max(19, 26 / aspect)
    camera.left = -halfHeight * aspect
    camera.right = halfHeight * aspect
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()
    renderer?.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 640 ? 1.5 : 2))
    renderer?.setSize(width, height, false)
    if (renderer) renderer.shadowMap.needsUpdate = true
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
    pendingPointer = event
    wake()
  }

  function onPointerLeave() {
    pendingPointer = null
    pointerDown = null
    hover(null)
  }

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return
    pointerDown = { x: event.clientX, y: event.clientY, id: pick(event) }
  }

  function onPointerUp(event: PointerEvent) {
    const start = pointerDown
    pointerDown = null
    if (!start?.id || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return
    if (pick(event) === start.id) options.onSelect(start.id)
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

  function draw(now: number) {
    frame = 0
    if (disposed || !onScreen || document.hidden || !renderer || !district) return
    try {
      const delta = lastFrameAt ? Math.min(0.1, (now - lastFrameAt) / 1000) : 0
      lastFrameAt = now
      if (!reducedMotion) waterElapsed += delta

      // 聚焦切换保持逐帧；河面流纹降到约 25fps，减少常驻 GPU 开销。
      const focusRunning = !reducedMotion && now - animationStart < ANIMATION_MS
      if (!reducedMotion && !focusRunning && !needsResize && now - lastPaintAt < WATER_FRAME_MS) {
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
      camera.position.copy(CAMERA_POSITION).add(focus)
      camera.lookAt(focus)
      camera.updateMatrixWorld()
      district.animate(selectedId, progress)
      district.update(waterElapsed)
      if (!reducedMotion && now - animationStart < ANIMATION_MS + WATER_FRAME_MS) {
        renderer.shadowMap.needsUpdate = true
      }
      renderer.render(scene, camera)
      if (pendingPointer) {
        hover(pick(pendingPointer))
        pendingPointer = null
      }
      const labels: CityLabelPosition[] = []
      district.anchors.forEach((anchor, id) => {
        projected.copy(anchor).project(camera)
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

    scene.add(new THREE.HemisphereLight(0xfffcf5, 0xc7c6b7, 2.8))
    const sunlight = new THREE.DirectionalLight(0xfff4dd, 3.5)
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
    return { select, hover, setReducedMotion, reset, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
