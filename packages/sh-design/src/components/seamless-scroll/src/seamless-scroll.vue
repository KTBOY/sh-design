<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { seamlessScrollProps, seamlessScrollEmits } from './seamless-scroll'

defineOptions({ name: 'ShSeamlessScroll' })

const props = defineProps(seamlessScrollProps)
const emit = defineEmits(seamlessScrollEmits)

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)

// Extra slot copies needed to cover the viewport seamlessly (0 = no scroll).
const copies = ref(1)

const horizontal = computed(() => props.direction === 'left' || props.direction === 'right')

// ---- Animation state. Deliberately NON-reactive: the rAF loop writes the
// transform straight to the DOM node, so Vue never re-renders per frame.
// This is the core perf difference vs. binding `:style` to a reactive ref. ----
let raf = 0
let lastTs = 0
let progress = 0 // scrolled distance within [0, contentSize)
let contentSize = 0 // size of one content copy along the scroll axis
let viewportSize = 0
let canScroll = false
let hovered = false
let inView = true
let waiting = false // paused between steps (singleStep mode)
let started = false // `delay` elapsed
let loops = 0
let waitTimer: ReturnType<typeof setTimeout> | undefined
let delayTimer: ReturnType<typeof setTimeout> | undefined
let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

// Write the current progress to the DOM (GPU-composited transform).
function apply() {
  if (!track.value) return
  // up/left roll forward (0 → -size); down/right roll backward (-size → 0).
  const forward = props.direction === 'up' || props.direction === 'left'
  const t = forward ? -progress : progress - contentSize
  track.value.style.transform = horizontal.value
    ? `translate3d(${t}px, 0, 0)`
    : `translate3d(0, ${t}px, 0)`
}

function shouldRun() {
  return (
    started &&
    canScroll &&
    inView &&
    props.active &&
    !waiting &&
    props.speed > 0 &&
    !(props.hoverPause && hovered)
  )
}

function schedule() {
  if (raf || !shouldRun()) return
  lastTs = 0
  raf = requestAnimationFrame(tick)
}

function stop() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

function advance(delta: number) {
  progress += delta
  if (progress >= contentSize) {
    progress -= contentSize
    loops += 1
    emit('loop', loops)
  }
  apply()
}

function tick(ts: number) {
  raf = 0
  if (!shouldRun()) return
  if (!lastTs) {
    // First frame after (re)start: only take the timestamp, no jump.
    lastTs = ts
    raf = requestAnimationFrame(tick)
    return
  }
  // Time-based speed (px/s); clamp dt so background-tab gaps don't jump.
  const dt = Math.min((ts - lastTs) / 1000, 0.1)
  lastTs = ts
  let delta = props.speed * dt

  // Step mode: land exactly on the next stop line, then wait.
  if (props.singleStep > 0) {
    const stepEnd = (Math.floor(progress / props.singleStep) + 1) * props.singleStep
    if (progress + delta >= stepEnd) {
      delta = stepEnd - progress
      advance(delta)
      waiting = true
      waitTimer = setTimeout(() => {
        waiting = false
        schedule()
      }, props.singleWait)
      return
    }
  }
  advance(delta)
  raf = requestAnimationFrame(tick)
}

// Measure sizes; decide whether scrolling is needed and how many copies.
function measure() {
  if (!root.value || !content.value) return
  viewportSize = horizontal.value ? root.value.clientWidth : root.value.clientHeight
  contentSize = horizontal.value ? content.value.offsetWidth : content.value.offsetHeight
  canScroll = contentSize > 0 && (props.force || contentSize > viewportSize)
  if (canScroll) {
    copies.value = Math.max(1, Math.ceil(viewportSize / contentSize))
    progress = progress % contentSize
    apply()
    schedule()
  } else {
    copies.value = 0
    stop()
    progress = 0
    if (track.value) track.value.style.transform = ''
  }
}

function onEnter() {
  hovered = true
  if (props.hoverPause) stop()
}

function onLeave() {
  hovered = false
  schedule()
}

// Manual wheel scrolling while hovered: adjusts `progress` directly and wraps
// through the seamless loop. Registered with { passive: false } so we can
// prevent the page from scrolling while the pointer is over the marquee.
function onWheelEvt(e: WheelEvent) {
  if (!props.wheel || !hovered || !canScroll) return
  e.preventDefault()
  // Wheel-down always moves content up/left (matches normal scroll intuition).
  const forward = props.direction === 'up' || props.direction === 'left'
  progress += forward ? e.deltaY : -e.deltaY
  progress = ((progress % contentSize) + contentSize) % contentSize
  apply()
}

onMounted(() => {
  measure()

  root.value?.addEventListener('wheel', onWheelEvt, { passive: false })

  // Re-measure on container/content size changes (data updates included).
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measure())
    if (root.value) ro.observe(root.value)
    if (content.value) ro.observe(content.value)
  }

  // Pause entirely while offscreen — zero work for lists below the fold.
  if (typeof IntersectionObserver !== 'undefined' && root.value) {
    io = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting)
      if (inView) schedule()
      else stop()
    })
    io.observe(root.value)
  }

  delayTimer = setTimeout(() => {
    started = true
    schedule()
  }, props.delay)
})

onBeforeUnmount(() => {
  stop()
  if (waitTimer) clearTimeout(waitTimer)
  if (delayTimer) clearTimeout(delayTimer)
  root.value?.removeEventListener('wheel', onWheelEvt)
  ro?.disconnect()
  io?.disconnect()
})

watch(
  () => props.active,
  (val) => (val ? schedule() : stop())
)

watch(
  () => props.direction,
  () => {
    progress = 0
    measure()
  }
)

/** 回到起点并清零轮数 */
function reset() {
  progress = 0
  loops = 0
  apply()
}

defineExpose({ reset })
</script>

<template>
  <div
    ref="root"
    class="sh-seamless-scroll"
    :class="`is-${direction}`"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <div ref="track" class="sh-seamless-scroll__track">
      <div ref="content" class="sh-seamless-scroll__content">
        <slot />
      </div>
      <!-- Clones that make the loop seamless; hidden from a11y tree -->
      <div v-for="i in copies" :key="i" class="sh-seamless-scroll__content" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sh-seamless-scroll {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sh-seamless-scroll__track {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.is-left .sh-seamless-scroll__track,
.is-right .sh-seamless-scroll__track {
  flex-direction: row;
  width: max-content;
  height: 100%;
}

.sh-seamless-scroll__content {
  flex: none;
}

.is-left .sh-seamless-scroll__content,
.is-right .sh-seamless-scroll__content {
  width: max-content;
}
</style>
