<script setup lang="ts">
// Nav logo in the "mark / wordmark" style (inspired by the Next.js logo):
// a small brand mark, a thin slash divider, then the wordmark with a muted suffix.
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
    <span class="sh-logo__word">
      <span class="sh-logo__name">sh</span><span class="sh-logo__muted">-design</span>
    </span>
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

.sh-logo__word {
  font-size: 16px;
  letter-spacing: 0.2px;
}

.sh-logo__name {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.sh-logo__muted {
  font-weight: 500;
  color: var(--vp-c-text-3);
}
</style>
