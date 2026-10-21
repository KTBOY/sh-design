<script setup lang="ts">
import * as THREE from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Tool, ToolGroup } from '../products/meta'
import { ToolCity } from './scene/city'
import { createCardRail, type CardRail } from './scene/cards'
import { createCityLinks } from './scene/links'
import { getPalette } from './scene/palette'

const props = defineProps<{ tools: Tool[]; groups: ToolGroup[]; dark?: boolean }>()
const emit = defineEmits<{ ready: []; error: []; hover: [number | null] }>()

const rootEl = ref<HTMLDivElement | null>(null)
const webglHost = ref<HTMLDivElement | null>(null)
const cssHost = ref<HTMLDivElement | null>(null)

let teardown: (() => void) | null = null
let applyTheme: ((dark: boolean) => void) | null = null

onMounted(() => {
  const root = rootEl.value
  const glHost = webglHost.value
  const domHost = cssHost.value
  if (!root || !glHost || !domHost) return

  try {
    teardown = setup(root, glHost, domHost)
    applyTheme?.(!!props.dark)
  } catch (error) {
    console.error('[tool-city] failed to start', error)
    teardown?.()
    teardown = null
    emit('error')
  }
})

onBeforeUnmount(() => {
  teardown?.()
  teardown = null
  applyTheme = null
})

watch(
  () => props.dark,
  (dark) => applyTheme?.(!!dark)
)

function setup(root: HTMLElement, glHost: HTMLElement, domHost: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.domElement.className = 'tc-webgl-canvas'
  glHost.appendChild(renderer.domElement)

  const cssRenderer = new CSS3DRenderer()
  cssRenderer.domElement.className = 'tc-css-root'
  domHost.appendChild(cssRenderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 700)
  camera.position.set(0, 34, 118)
  camera.lookAt(0, 17, -18)

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd7e6f6, 1.6)
  scene.add(hemi)
  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(34, 62, 76)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0xb8d8ff, 0.75)
  rim.position.set(-46, 28, -24)
  scene.add(rim)
  const fill = new THREE.PointLight(0x9ecbff, 9, 220, 2)
  fill.position.set(0, 48, 34)
  scene.add(fill)

  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(3, 0, 54),
      new THREE.Vector3(-4.5, 0, 22),
      new THREE.Vector3(4, 0, -10),
      new THREE.Vector3(-3.5, 0, -42),
      new THREE.Vector3(2.5, 0, -76),
      new THREE.Vector3(-1.5, 0, -114),
      new THREE.Vector3(1.5, 0, -152),
      new THREE.Vector3(0, 0, -190)
    ],
    false,
    'catmullrom',
    0.4
  )
  curve.arcLengthDivisions = 600

  let palette = getPalette(!!props.dark)
  scene.fog = new THREE.Fog(palette.fog, 210, 560)

  const city = new ToolCity(curve, palette)
  scene.add(city.group)

  const links = createCityLinks(city, palette)
  scene.add(links.group)

  city.setGroupSplit(props.groups[0]?.items.length ?? 4)

  const cards: CardRail = createCardRail(props.tools, props.groups, handlePick, handleHover)
  scene.add(cards.group)
  cards.layout(root.clientWidth || 1440)
  cards.group.visible = false

  const rail = root.closest('.htc__rail') as HTMLElement | null
  const STICKY_TOP = 64
  let scroll = 0
  let lastRefined = 0

  function scrollProgress() {
    if (!rail) return 0
    const travel = rail.offsetHeight - root.offsetHeight - STICKY_TOP
    if (travel <= 0) return 0
    const raw = (STICKY_TOP - rail.getBoundingClientRect().top) / travel
    return Math.min(1, Math.max(0, raw))
  }

  const pointer = { x: 0, y: 0 }
  const pointerTarget = { x: 0, y: 0 }
  let elapsed = 0
  let lastTime = 0
  let rafId = 0
  let running = false
  let onScreen = true
  let pageVisible = !document.hidden
  let destroyed = false
  let readySent = false
  let needsRefine = false
  let introElapsed = -1
  let cameraLockUntil = 0

  function updateCamera() {
    const z = 118 - scroll * 30
    const near = city.centerlineX(z - 34)
    const far = city.centerlineX(z - 112)
    camera.position.set(near * 0.55 + pointer.x * 1.5, 34 - scroll * 5 + pointer.y * 0.8, z)
    camera.lookAt(
      far * 0.5 + pointer.x * 0.35,
      17 - scroll * 3.4 + pointer.y * 0.2,
      -18 - scroll * 46
    )
  }

  function introVisible() {
    const rect = root.getBoundingClientRect()
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    return visible > Math.min(rect.height, window.innerHeight) * 0.25
  }

  function ensureLoop() {
    if (running || destroyed || !onScreen || !pageVisible) return
    running = true
    rafId = requestAnimationFrame(tick)
  }

  function tick(now: number) {
    running = false
    if (destroyed || !onScreen || !pageVisible) return

    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016
    lastTime = now
    elapsed += dt
    pointer.x += (pointerTarget.x - pointer.x) * Math.min(1, dt * 4.5)
    pointer.y += (pointerTarget.y - pointer.y) * Math.min(1, dt * 4.5)

    if (performance.now() > cameraLockUntil) scroll = scrollProgress()
    cards.setScroll(scroll)
    if (Math.abs(scroll - lastRefined) > 0.12) {
      lastRefined = scroll
      needsRefine = true
    }
    if (introElapsed < 0 && introVisible()) introElapsed = elapsed
    updateCamera()
    city.update(elapsed)
    if (cards.group.visible) city.setCardShadows(cards.groundFootprints())
    links.update(elapsed, dt, scroll)
    cards.update(elapsed, camera, introElapsed < 0 ? -1 : elapsed - introElapsed)
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera)
    if (needsRefine) {
      needsRefine = false
      cards.refine()
    }

    if (!readySent) {
      readySent = true
      emit('ready')
    }

    running = true
    rafId = requestAnimationFrame(tick)
  }

  function resize() {
    const width = root.clientWidth || 1
    const height = root.clientHeight || 1
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
    cssRenderer.setSize(width, height)
    cards.layout(width)
    needsRefine = true
  }

  function onPointerMove(event: PointerEvent) {
    const rect = root.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    pointerTarget.x = Math.min(
      1,
      Math.max(-1, ((event.clientX - rect.left) / rect.width - 0.5) * 2)
    )
    pointerTarget.y = Math.min(
      1,
      Math.max(-1, ((event.clientY - rect.top) / rect.height - 0.5) * 2)
    )
  }

  function onPointerLeave() {
    pointerTarget.x = 0
    pointerTarget.y = 0
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden
    if (pageVisible) ensureLoop()
    else {
      cancelAnimationFrame(rafId)
      running = false
    }
  }

  function onContextLost(event: Event) {
    event.preventDefault()
    emit('error')
  }

  function handleHover(index: number | null) {
    city.setHoverActive(index !== null)
    city.setDistrict(index)
    if (index !== null) links.fire(index, 1)
    emit('hover', index)
  }

  function handlePick(tool: Tool) {
    cameraLockUntil = performance.now() + 1400
    const escaped = tool.name.replace(/(["\\])/g, '\\$1')
    const target = document.querySelector<HTMLElement>(`.hp-grid [data-tool-card="${escaped}"]`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('is-flash')
    window.setTimeout(() => target.classList.remove('is-flash'), 1600)
  }

  applyTheme = (dark: boolean) => {
    palette = getPalette(dark)
    scene.fog = new THREE.Fog(palette.fog, 210, 560)
    city.setPalette(palette)
    links.setPalette(palette)
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(root)

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting)
      if (onScreen) ensureLoop()
      else {
        cancelAnimationFrame(rafId)
        running = false
      }
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(root)

  document.addEventListener('visibilitychange', onVisibilityChange)
  root.addEventListener('pointermove', onPointerMove)
  root.addEventListener('pointerleave', onPointerLeave)
  renderer.domElement.addEventListener('webglcontextlost', onContextLost)

  resize()
  scroll = scrollProgress()
  cards.setScroll(scroll)
  updateCamera()
  city.update(0)
  links.update(0, 0, scroll)
  cards.update(0, camera, 0)
  renderer.render(scene, camera)
  cssRenderer.render(scene, camera)
  cards.refine()
  emit('ready')
  readySent = true
  ensureLoop()

  return () => {
    destroyed = true
    cancelAnimationFrame(rafId)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    root.removeEventListener('pointermove', onPointerMove)
    root.removeEventListener('pointerleave', onPointerLeave)
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
    cards.dispose()
    links.dispose()
    city.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
    cssRenderer.domElement.remove()
  }
}
</script>

<template>
  <div ref="rootEl" class="tc-stage">
    <div ref="webglHost" class="tc-stage__webgl" />
    <div ref="cssHost" class="tc-stage__css" />
  </div>
</template>

<style scoped>
.tc-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.tc-stage__webgl,
.tc-stage__css {
  position: absolute;
  inset: 0;
}

.tc-stage__webgl {
  pointer-events: none;
}

.tc-stage__css {
  pointer-events: none;
  overflow: hidden;
}

.tc-stage__webgl :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

<style>
.t3-card {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 24px 26px 26px;
  border: 1px solid rgba(188, 210, 236, 0.78);
  border-radius: 18px;
  background: transparent;
  box-shadow:
    0 38px 70px -36px rgba(26, 52, 86, 0.55),
    0 12px 28px -16px rgba(59, 130, 246, 0.3);
  appearance: none;
  color: #0a1e3c;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  pointer-events: auto;
  transform-origin: 50% 50%;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.t3-card:hover,
.t3-card:focus-visible {
  border-color: rgba(59, 130, 246, 0.72);
  box-shadow:
    0 38px 72px -38px rgba(26, 52, 86, 0.52),
    0 12px 30px -16px rgba(59, 130, 246, 0.34);
}

.t3-card:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.8);
  outline-offset: 3px;
}

.t3-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.t3-card__no {
  color: #a6b8cf;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.12em;
}

.t3-card__arrow {
  color: #2563eb;
  font-size: 19px;
  line-height: 1;
}

.t3-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.t3-card__title {
  display: block;
  color: #0a1e3c;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.t3-card__title em {
  display: none;
  margin-left: 8px;
  color: #8ba2bf;
  font-size: 0.65em;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0;
}

.t3-card--lead .t3-card__title em {
  display: inline;
}

.t3-card__zone {
  color: #7f9bbd;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9.5px;
  letter-spacing: 0.16em;
}

.t3-card__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.t3-card__stack span {
  padding: 3px 9px;
  border: 1px solid rgba(177, 200, 227, 0.72);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.38);
  color: #5f7fa6;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9.5px;
  line-height: 1.4;
}

.t3-card--lead {
  padding: 28px 30px 30px;
  border-color: rgba(96, 165, 250, 0.62);
  border-radius: 22px;
  box-shadow:
    0 46px 92px -42px rgba(26, 52, 86, 0.58),
    0 18px 40px -16px rgba(59, 130, 246, 0.4);
}

.t3-card--lead .t3-card__no {
  color: #8ea7c4;
  font-size: 13px;
}

.t3-card--lead .t3-card__arrow {
  font-size: 24px;
}

.t3-card--lead .t3-card__title {
  font-size: 25px;
}

.t3-card--lead .t3-card__zone {
  font-size: 11px;
}

.t3-card--lead .t3-card__stack span {
  padding: 4px 11px;
  font-size: 10.5px;
}

.t3-card--large {
  border-radius: 18px;
}

.t3-card--large .t3-card__title {
  font-size: 20px;
}

.t3-card--large .t3-card__stack span {
  font-size: 9px;
}

.t3-card--medium {
  border-radius: 15px;
}

.t3-card--medium .t3-card__title {
  font-size: 15.5px;
}

.t3-card--medium .t3-card__zone {
  font-size: 8.5px;
}

.t3-card--small {
  padding: 20px 21px 22px;
  border-radius: 10px;
}

.t3-card--small .t3-card__title {
  font-size: 15px;
}

.t3-card--small .t3-card__zone {
  font-size: 8px;
}

.t3-card--small .t3-card__stack span {
  padding: 2px 7px;
  font-size: 9px;
}

.dark .t3-card__title {
  color: #eaf4ff;
}

.dark .t3-card__zone {
  color: #93b0d4;
}

@media (max-width: 767px) {
  .t3-card--lead {
    padding: 24px 24px 26px;
  }

  .t3-card--lead .t3-card__title {
    font-size: 23px;
  }
}
</style>
