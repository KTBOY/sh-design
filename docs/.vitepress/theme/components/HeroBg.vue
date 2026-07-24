<script setup lang="ts">
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

// Background videos live in docs/public and are served under the site base.
// Green gradient is the base layer; white code lines are blended on top,
// recreating the CatPaw-style "green + code" hero background.
const greenSrc = withBase('/hero-bg.mp4')
const codeSrc = withBase('/hero-code.mp4')

onMounted(() => {
  // Respect reduced-motion: pause videos (their first frame stays visible).
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    document
      .querySelectorAll<HTMLVideoElement>('.hero-bg__video')
      .forEach((v) => v.pause())
  }
})
</script>

<template>
  <div class="hero-bg" aria-hidden="true">
    <video class="hero-bg__video" :src="greenSrc" autoplay muted loop playsinline preload="auto" />
    <div class="hero-bg__tint" />
    <video
      class="hero-bg__video hero-bg__code"
      :src="codeSrc"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    />
    <div class="hero-bg__scrim" />
    <div class="hero-bg__fade" />
  </div>
</template>

<style scoped>
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  min-height: 620px;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
}

.hero-bg__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Light placeholder for the base video: before it decodes there is no frame,
   so the `color` blend above would otherwise sit on black and show as DARK
   blue. A light backdrop keeps it light blue, matching the loaded state. */
.hero-bg__video:not(.hero-bg__code) {
  background-color: #cfe6ff;
}

/* White code lines composited over the green base. */
.hero-bg__code {
  mix-blend-mode: screen;
}

/* Recolor the (green) base video to the brand blue theme. `color` blend keeps
   the video's luminance/detail but replaces its hue with the brand gradient. */
.hero-bg__tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2563eb, #22d3ee);
  mix-blend-mode: color;
}

/* Soft scrim to keep hero text readable over the video. */
.hero-bg__scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(70% 60% at 50% 42%, rgba(255, 255, 255, 0.3), transparent 72%);
}

.dark .hero-bg__scrim {
  background: radial-gradient(70% 60% at 50% 42%, rgba(0, 0, 0, 0.32), transparent 72%);
}

/* Fade the bottom into the page background. */
.hero-bg__fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 52%, var(--vp-c-bg) 98%);
}
</style>
