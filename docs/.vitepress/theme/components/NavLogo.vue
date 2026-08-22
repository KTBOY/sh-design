<script setup lang="ts">
// Nav logo in the "mark / wordmark" style. The mark is pure SVG + CSS (no
// external SDK or assets): the original brand triangle filled with the
// blue→cyan brand gradient, its hues slowly swapping sides while the mark
// breathes with a soft glow.
import { withBase } from 'vitepress'

const wordmark = withBase('/logo-bark-dark.png')
</script>

<template>
  <span class="sh-logo" aria-label="sh-design">
    <svg class="sh-logo__mark" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      <defs>
        <linearGradient id="sh-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop class="sh-logo__stop--a" offset="0" />
          <stop class="sh-logo__stop--b" offset="1" />
        </linearGradient>
      </defs>
      <path d="M14 3.5 L25 23.5 H3 Z" fill="url(#sh-logo-grad)" />
    </svg>
    <!-- Wordmark image (transparent bg, black strokes); dark mode inverts. -->
    <img class="sh-logo__img" :src="wordmark" alt="sh-design" draggable="false" />
  </span>
</template>

<style scoped>
.sh-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
}

.sh-logo__mark {
  display: block;
  flex-shrink: 0;
  animation: sh-logo-breathe 3.2s ease-in-out infinite alternate;
}

/* Brand gradient with the two hues slowly trading places. */
.sh-logo__stop--a {
  stop-color: #2563eb;
  animation: sh-logo-hue-a 4s ease-in-out infinite alternate;
}

.sh-logo__stop--b {
  stop-color: #22d3ee;
  animation: sh-logo-hue-b 4s ease-in-out infinite alternate;
}

@keyframes sh-logo-hue-a {
  to {
    stop-color: #22d3ee;
  }
}

@keyframes sh-logo-hue-b {
  to {
    stop-color: #2563eb;
  }
}

@keyframes sh-logo-breathe {
  from {
    transform: scale(1);
    filter: drop-shadow(0 0 4px rgba(37, 99, 235, 0.35));
  }
  to {
    transform: scale(1.06);
    filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.5));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sh-logo__mark,
  .sh-logo__stop--a,
  .sh-logo__stop--b {
    animation: none;
  }
}

.sh-logo__img {
  display: block;
  height: 16px;
  width: auto;
  filter: invert(1);
}

.dark .sh-logo__img {
  filter: invert(1);
}
</style>
