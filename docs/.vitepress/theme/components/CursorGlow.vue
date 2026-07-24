<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Cursor-following spotlight background (inspired by meituancatpaw.com):
// a warm radial glow + a dot-grid "revealed" around the cursor, over
// slowly drifting ambient brand blobs. Pure CSS + rAF-throttled mousemove.
const root = ref<HTMLElement | null>(null)
let lastX = 0
let lastY = 0
let raf = 0

function apply() {
  raf = 0
  const el = root.value
  if (!el) return
  el.style.setProperty('--mx', `${lastX}px`)
  el.style.setProperty('--my', `${lastY}px`)
}

function onMove(e: MouseEvent) {
  lastX = e.clientX
  lastY = e.clientY
  if (!raf) raf = requestAnimationFrame(apply)
}

onMounted(() => {
  lastX = window.innerWidth / 2
  lastY = window.innerHeight * 0.4
  apply()
  window.addEventListener('mousemove', onMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div ref="root" class="cg-root" aria-hidden="true">
    <div class="cg-aurora" />
    <div class="cg-grid" />
    <div class="cg-spot" />
  </div>
</template>

<style scoped>
.cg-root {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  --mx: 50vw;
  --my: 40vh;
}

/* Ambient, slowly drifting brand-colored blobs. */
.cg-aurora {
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(38vw 38vw at 18% 22%, rgba(37, 99, 235, 0.2), transparent 60%),
    radial-gradient(32vw 32vw at 82% 18%, rgba(245, 158, 11, 0.18), transparent 60%),
    radial-gradient(42vw 42vw at 68% 82%, rgba(96, 165, 250, 0.16), transparent 62%);
  filter: blur(30px);
  animation: cg-drift 24s ease-in-out infinite alternate;
}

@keyframes cg-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(2.5%, -2%, 0) scale(1.06);
  }
  100% {
    transform: translate3d(-2%, 2.5%, 0) scale(1.03);
  }
}

/* Dot grid, revealed only around the cursor (spotlight reveal). */
.cg-grid {
  position: absolute;
  inset: 0;
  color: rgba(110, 118, 140, 0.28);
  background-image: radial-gradient(currentColor 1px, transparent 1.6px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(
    260px 260px at var(--mx) var(--my),
    #000 0%,
    rgba(0, 0, 0, 0.5) 45%,
    transparent 72%
  );
  mask-image: radial-gradient(
    260px 260px at var(--mx) var(--my),
    #000 0%,
    rgba(0, 0, 0, 0.5) 45%,
    transparent 72%
  );
}

/* Signature warm glow that follows the cursor. */
.cg-spot {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    280px 280px at var(--mx) var(--my),
    rgba(255, 140, 0, 0.2) 0%,
    rgba(255, 165, 0, 0.16) 20%,
    rgba(255, 200, 0, 0.1) 40%,
    rgba(255, 200, 0, 0.04) 62%,
    transparent 76%
  );
}

.dark .cg-grid {
  color: rgba(180, 190, 220, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .cg-aurora {
    animation: none;
  }
}
</style>
