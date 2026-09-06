<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PropType } from 'vue'

defineOptions({ name: 'ShImageViewer', inheritAttrs: false })

/**
 * Internal fullscreen viewer used by ShLazyImage's preview.
 * Behavior benchmarks Element Plus `el-image-viewer`: multiplicative zoom,
 * ESC / ←→ / ↑↓ / SPACE shortcuts, wrap-around navigation, drag to pan.
 */
const props = defineProps({
  /** URLs to preview; more than one enables prev/next navigation. */
  urlList: {
    type: Array as PropType<string[]>,
    required: true
  },
  /** Index of `urlList` shown initially. */
  initialIndex: {
    type: Number,
    default: 0
  },
  /** Zoom multiplier per zoom step (applied multiplicatively). */
  zoomRate: {
    type: Number,
    default: 1.2
  },
  /** Minimum zoom scale. */
  minScale: {
    type: Number,
    default: 0.2
  },
  /** Maximum zoom scale. */
  maxScale: {
    type: Number,
    default: 7
  },
  /** Close the viewer when pressing ESC. */
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  /** Close the viewer when clicking the dark backdrop. */
  hideOnClickModal: {
    type: Boolean,
    default: true
  },
  /** Alternative text for the previewed image. */
  alt: {
    type: String,
    default: ''
  }
})

const emit = defineEmits({
  switch: (_payload: { index: number; url: string }) => true,
  close: (_payload: { index: number; url: string }) => true
})

const CLOSE_FADE_MS = 250

const visible = ref(true)
const rootRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const activeIndex = ref(0)
const imgLoading = ref(true)
const imgFailed = ref(false)
const dragging = ref(false)
const isOriginal = ref(false)

const scale = ref(1)
const deg = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const enableTransition = ref(true)

let dragPointerId = -1
let dragStartX = 0
let dragStartY = 0
let dragBaseX = 0
let dragBaseY = 0
let lastKeyZoomAt = 0
let closeTimer: ReturnType<typeof setTimeout> | undefined
let prevBodyOverflow = ''
let leavingEl: HTMLElement | null = null

const len = computed(() => props.urlList.length)
const currentUrl = computed(() => props.urlList[activeIndex.value] ?? '')

const imgStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) rotate(${deg.value}deg) scale(${scale.value})`,
  transition: enableTransition.value ? 'transform 0.3s ease' : 'none'
}))

function round3(n: number): number {
  return Number.parseFloat(n.toFixed(3))
}

function clampIndex(index: number): number {
  if (!len.value) return 0
  return Math.min(Math.max(index, 0), len.value - 1)
}

function applyZoom(factor: number, transition: boolean) {
  const next = Math.min(Math.max(round3(scale.value * factor), props.minScale), props.maxScale)
  if (next === scale.value) return
  scale.value = next
  enableTransition.value = transition
}

function zoomIn() {
  if (scale.value < props.maxScale) applyZoom(props.zoomRate, true)
}

function zoomOut() {
  if (scale.value > props.minScale) applyZoom(1 / props.zoomRate, true)
}

// Wheel: scale by deltaY so mouse notches step one `zoomRate` while trackpads
// zoom smoothly (no transition while wheeling, same as Element Plus).
function onWheel(e: WheelEvent) {
  if (!visible.value) return
  const unit = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1
  const dy = e.deltaY * unit
  if (!dy) return
  applyZoom(Math.pow(props.zoomRate, -dy / 100), false)
}

function rotate(delta: number) {
  deg.value += delta
  enableTransition.value = true
}

// Toggle between fit-to-window (scale 1) and the image's natural pixel size.
function toggleOriginal() {
  const img = imgRef.value
  if (img && img.naturalWidth && img.offsetWidth && !isOriginal.value) {
    scale.value = Math.min(round3(img.naturalWidth / img.offsetWidth), props.maxScale)
    isOriginal.value = true
  } else {
    scale.value = 1
    isOriginal.value = false
  }
  deg.value = 0
  offsetX.value = 0
  offsetY.value = 0
  enableTransition.value = true
}

function resetTransform() {
  scale.value = 1
  deg.value = 0
  offsetX.value = 0
  offsetY.value = 0
  isOriginal.value = false
  enableTransition.value = true
}

function setActiveItem(index: number) {
  if (!len.value) return
  const next = ((index % len.value) + len.value) % len.value
  if (next === activeIndex.value) return
  activeIndex.value = next
  resetTransform()
  imgLoading.value = true
  imgFailed.value = false
  emit('switch', { index: next, url: props.urlList[next] })
}

function prev() {
  setActiveItem(activeIndex.value - 1)
}

function next() {
  setActiveItem(activeIndex.value + 1)
}

function onImgLoad() {
  imgLoading.value = false
  imgFailed.value = false
}

function onImgError() {
  imgLoading.value = false
  imgFailed.value = true
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  dragging.value = true
  dragPointerId = e.pointerId
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragBaseX = offsetX.value
  dragBaseY = offsetY.value
  enableTransition.value = false
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== dragPointerId) return
  offsetX.value = dragBaseX + (e.clientX - dragStartX)
  offsetY.value = dragBaseY + (e.clientY - dragStartY)
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== dragPointerId) return
  dragging.value = false
  dragPointerId = -1
  enableTransition.value = true
}

function requestClose() {
  if (!visible.value) return
  // Stash the element before `visible = false` unbinds the ref: if the leave
  // transition is deferred (e.g. a throttled background tab), the overlay must
  // still be removed when the component unmounts.
  leavingEl = rootRef.value
  visible.value = false
  closeTimer = setTimeout(() => {
    emit('close', { index: activeIndex.value, url: currentUrl.value })
  }, CLOSE_FADE_MS)
}

function onBackdropClick() {
  if (props.hideOnClickModal) requestClose()
}

// Key repeat fires dozens of times per second; throttle zoom steps so holding
// ↑/↓ does not slam into min/max instantly.
function throttledKeyZoom(zoomInStep: boolean) {
  const now = Date.now()
  if (now - lastKeyZoomAt < 100) return
  lastKeyZoomAt = now
  if (zoomInStep) zoomIn()
  else zoomOut()
}

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  switch (e.key) {
    case 'Escape':
      if (props.closeOnPressEscape) {
        e.preventDefault()
        requestClose()
      }
      break
    case 'ArrowLeft':
      e.preventDefault()
      prev()
      break
    case 'ArrowRight':
      e.preventDefault()
      next()
      break
    case 'ArrowUp':
      e.preventDefault()
      throttledKeyZoom(true)
      break
    case 'ArrowDown':
      e.preventDefault()
      throttledKeyZoom(false)
      break
    case ' ':
    case 'Spacebar': {
      // Let SPACE keep activating a focused toolbar button.
      const target = e.target as HTMLElement | null
      if (!target?.closest?.('button')) {
        e.preventDefault()
        toggleOriginal()
      }
      break
    }
  }
}

onMounted(() => {
  activeIndex.value = clampIndex(props.initialIndex)
  // A fully cached image may finish before the load listener attaches.
  if (imgRef.value?.complete) {
    imgLoading.value = imgRef.value.naturalWidth === 0
    imgFailed.value = imgRef.value.naturalWidth === 0
  }
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = prevBodyOverflow
  document.removeEventListener('keydown', onKeydown)
  if (closeTimer) clearTimeout(closeTimer)
  if (leavingEl && leavingEl.isConnected) leavingEl.remove()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sh-image-viewer" appear>
      <div
        v-if="visible"
        ref="rootRef"
        class="sh-image-viewer"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @wheel.prevent="onWheel"
        @click.self="onBackdropClick"
      >
        <img
          ref="imgRef"
          class="sh-image-viewer__img"
          :class="{ 'is-dragging': dragging }"
          :src="currentUrl"
          :alt="alt"
          draggable="false"
          decoding="async"
          :style="imgStyle"
          @load="onImgLoad"
          @error="onImgError"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        />

        <div v-if="imgLoading" class="sh-image-viewer__spinner" aria-hidden="true" />
        <div v-else-if="imgFailed" class="sh-image-viewer__failed">图片加载失败</div>

        <div v-if="len > 1" class="sh-image-viewer__counter">{{ activeIndex + 1 }} / {{ len }}</div>

        <button
          type="button"
          class="sh-image-viewer__btn sh-image-viewer__close"
          title="关闭 (ESC)"
          aria-label="关闭预览"
          @click="requestClose"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <template v-if="len > 1">
          <button
            type="button"
            class="sh-image-viewer__btn sh-image-viewer__prev"
            title="上一张 (←)"
            aria-label="上一张"
            @click="prev"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            class="sh-image-viewer__btn sh-image-viewer__next"
            title="下一张 (→)"
            aria-label="下一张"
            @click="next"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </template>

        <div class="sh-image-viewer__toolbar">
          <button
            type="button"
            class="sh-image-viewer__btn"
            title="放大 (↑ / 滚轮)"
            aria-label="放大"
            :disabled="scale >= maxScale"
            @click="zoomIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button
            type="button"
            class="sh-image-viewer__btn"
            title="缩小 (↓ / 滚轮)"
            aria-label="缩小"
            :disabled="scale <= minScale"
            @click="zoomOut"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button
            type="button"
            class="sh-image-viewer__btn is-text"
            :class="{ 'is-active': isOriginal }"
            title="适应窗口 / 原始尺寸 (空格)"
            aria-label="切换适应窗口或原始尺寸"
            @click="toggleOriginal"
          >
            1:1
          </button>
          <button
            type="button"
            class="sh-image-viewer__btn"
            title="向左旋转"
            aria-label="向左旋转"
            @click="rotate(-90)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button
            type="button"
            class="sh-image-viewer__btn"
            title="向右旋转"
            aria-label="向右旋转"
            @click="rotate(90)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sh-image-viewer {
  position: fixed;
  inset: 0;
  z-index: var(--sh-image-viewer-z-index, 2000);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.sh-image-viewer__img {
  max-width: 92vw;
  max-height: 92vh;
  user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
  cursor: grab;
  will-change: transform;
}

.sh-image-viewer__img.is-dragging {
  cursor: grabbing;
}

.sh-image-viewer__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: sh-image-viewer-spin 0.8s linear infinite;
  pointer-events: none;
}

.sh-image-viewer__failed {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.85);
  font-size: var(--sh-font-size-sm, 14px);
  pointer-events: none;
}

.sh-image-viewer__counter {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: var(--sh-font-size-sm, 14px);
  line-height: 1;
  pointer-events: none;
}

.sh-image-viewer__btn {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sh-image-viewer__btn:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.sh-image-viewer__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.sh-image-viewer__btn svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sh-image-viewer__btn.is-text {
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

.sh-image-viewer__btn.is-active {
  background-color: rgba(255, 255, 255, 0.25);
}

.sh-image-viewer__close {
  top: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
}

.sh-image-viewer__prev {
  top: 50%;
  left: 24px;
  transform: translateY(-50%);
}

.sh-image-viewer__next {
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
}

.sh-image-viewer__toolbar {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 6px;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.55);
}

.sh-image-viewer__toolbar .sh-image-viewer__btn {
  position: static;
}

.sh-image-viewer-enter-active,
.sh-image-viewer-leave-active {
  transition: opacity 0.25s ease;
}

.sh-image-viewer-enter-from,
.sh-image-viewer-leave-to {
  opacity: 0;
}

.sh-image-viewer-leave-active {
  pointer-events: none;
}

@keyframes sh-image-viewer-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
