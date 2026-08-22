<script setup lang="ts">
// Ambient background layer (inspired by meituancatpaw.com), tuned to sh-design:
// gentle brand-blue ambient blobs and slowly floating cat paws. Pure CSS.

// Floating cat paws (subtle, brand-blue). Negative delays pre-distribute them.
const paws = [
  { left: '7%', size: 30, delay: -2, duration: 30, rotate: -18 },
  { left: '23%', size: 20, delay: -16, duration: 36, rotate: 12 },
  { left: '39%', size: 34, delay: -9, duration: 32, rotate: -8 },
  { left: '56%', size: 22, delay: -24, duration: 38, rotate: 20 },
  { left: '71%', size: 27, delay: -13, duration: 34, rotate: -14 },
  { left: '87%', size: 18, delay: -30, duration: 40, rotate: 10 }
]
</script>

<template>
  <div class="cg-root" aria-hidden="true">
    <div class="cg-aurora" />
    <div class="cg-paws">
      <span
        v-for="(p, i) in paws"
        :key="i"
        class="cg-paw"
        :style="{
          left: p.left,
          width: `${p.size}px`,
          height: `${p.size}px`,
          '--r': `${p.rotate}deg`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.duration}s`
        }"
      />
    </div>
  </div>
</template>

<style scoped>
.cg-root {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Subtle ambient brand-blue blobs. */
.cg-aurora {
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(40vw 40vw at 18% 22%, rgba(37, 99, 235, 0.1), transparent 60%),
    radial-gradient(36vw 36vw at 82% 20%, rgba(96, 165, 250, 0.09), transparent 62%),
    radial-gradient(44vw 44vw at 66% 84%, rgba(59, 130, 246, 0.08), transparent 62%);
  filter: blur(40px);
  animation: cg-drift 28s ease-in-out infinite alternate;
}

@keyframes cg-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(-2%, 2%, 0) scale(1.04);
  }
}

/* Floating cat paws. */
.cg-paws {
  position: absolute;
  inset: 0;
}

.cg-paw {
  position: absolute;
  bottom: -8%;
  background-color: rgba(37, 99, 235, 0.5);
  -webkit-mask: var(--paw) center / contain no-repeat;
  mask: var(--paw) center / contain no-repeat;
  opacity: 0;
  animation-name: cg-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
  --paw: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Cg%20fill='%23000'%3E%3Cellipse%20cx='50'%20cy='64'%20rx='24'%20ry='20'/%3E%3Cellipse%20cx='24'%20cy='42'%20rx='9'%20ry='12'/%3E%3Cellipse%20cx='42'%20cy='28'%20rx='9'%20ry='13'/%3E%3Cellipse%20cx='62'%20cy='28'%20rx='9'%20ry='13'/%3E%3Cellipse%20cx='80'%20cy='44'%20rx='9'%20ry='12'/%3E%3C/g%3E%3C/svg%3E");
}

@keyframes cg-float {
  0% {
    transform: translateY(0) rotate(var(--r));
    opacity: 0;
  }
  12% {
    opacity: 0.1;
  }
  88% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-112vh) rotate(calc(var(--r) + 16deg));
    opacity: 0;
  }
}

.dark .cg-paw {
  background-color: rgba(96, 165, 250, 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .cg-aurora,
  .cg-paw {
    animation: none;
  }
  .cg-paw {
    opacity: 0.08;
  }
}
</style>
