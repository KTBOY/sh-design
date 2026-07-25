<script setup lang="ts">
// Nav logo in the "mark / wordmark" style (inspired by the Next.js logo):
// a small brand mark, a thin slash divider, then the wordmark image.
import { withBase } from 'vitepress'

const wordmark = withBase('/logo-bark.png')
</script>

<template>
  <span class="sh-logo" aria-label="sh-design">
    <svg class="sh-logo__mark" viewBox="0 0 28 28" width="20" height="20" aria-hidden="true">
      <defs>
        <linearGradient id="sh-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563eb" />
          <stop offset="1" stop-color="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M14 3.5 L25 23.5 H3 Z" fill="url(#sh-logo-grad)" />
    </svg>
    <span class="sh-logo__slash">/</span>
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
}

.sh-logo__slash {
  color: var(--vp-c-divider);
  font-size: 20px;
  font-weight: 200;
  transform: translateY(-1px);
}

.sh-logo__img {
  display: block;
  height: 13px;
  width: auto;
}

.dark .sh-logo__img {
  filter: invert(1);
}
</style>
