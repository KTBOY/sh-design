<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

/**
 * 跟随鼠标的「探照」背景层（美团猫爪同款多段径向渐变 mask + 缓动拖尾）。
 * 两层图：底图常驻显示，上层平时被 mask 完全遮住，鼠标经过处才「探照」露出。
 * 固定铺满全屏、垫在所有内容底下（z-index: -1），纯装饰、不拦截指针。
 * /products/ 与 /guide/about 个人主页共用同一份实现。
 */
const bgImg = withBase('/6235cc15-c95a-40b3-aee6-d6f4b6bb1b98.webp') // 底图：蓝色爪印（常驻）
const fgImg = withBase('/layer2_small_2.webp') // 上层：橙色代码点阵，鼠标探照露出

const fgRef = ref<HTMLElement | null>(null)
const maskRef = ref<HTMLElement | null>(null)

let raf = 0
let ro: ResizeObserver | undefined
let onMove: ((e: MouseEvent) => void) | undefined
let onLeave: (() => void) | undefined

onMounted(() => {
  const fg = fgRef.value
  if (!fg) return

  let tx = -999
  let ty = -999 // 鼠标真实位置
  let x = -999
  let y = -999 // 缓动后的渲染位置
  let active = false

  onMove = (e) => {
    tx = e.clientX
    ty = e.clientY
    if (!active) {
      // 首次进入直接跳到鼠标处，避免从远处飞过来
      x = tx
      y = ty
      active = true
    }
    fg.style.opacity = '1'
  }
  onLeave = () => {
    fg.style.opacity = '0'
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseleave', onLeave)

  const render = () => {
    x += (tx - x) * 0.15 // 0.15 越小拖尾越明显
    y += (ty - y) * 0.15

    // 多段径向渐变 mask：中心全显、往外逐级衰减
    const mask =
      `radial-gradient(circle at ${x}px ${y}px, ` +
      'black 0%, rgba(0,0,0,0.6) 56px, rgba(0,0,0,0.4) 112px, ' +
      'rgba(0,0,0,0.2) 168px, rgba(0,0,0,0.1) 224px, ' +
      'rgba(0,0,0,0.05) 252px, transparent 280px)'
    fg.style.webkitMaskImage = mask
    fg.style.maskImage = mask

    raf = requestAnimationFrame(render)
  }
  raf = requestAnimationFrame(render)

  // 背景图随视口尺寸保持 cover 比例，避免拉伸变形
  ro = new ResizeObserver(() => fitLayers())
  ro.observe(document.documentElement)
  fitLayers()
})

function fitLayers() {
  const el = maskRef.value
  if (!el) return
  el.style.setProperty('--cover-w', `${Math.max(window.innerWidth, window.innerHeight * (1920 / 1080))}px`)
  el.style.setProperty('--cover-h', `${Math.max(window.innerHeight, window.innerWidth * (1080 / 1920))}px`)
}

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  ro?.disconnect()
  if (onMove) document.removeEventListener('mousemove', onMove)
  if (onLeave) document.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div ref="maskRef" class="mask-image-container background-mask" aria-hidden="true">
    <div class="image-layer background-layer" :style="{ backgroundImage: `url(${bgImg})` }" />
    <div ref="fgRef" class="image-layer foreground-layer" :style="{ backgroundImage: `url(${fgImg})` }" />
  </div>
</template>

<style scoped>
/* ===== 背景容器：固定铺满全屏，垫在所有内容底下 ===== */
.mask-image-container {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: var(--bg-mask-color, #fffdfd);
  /* --cover-w / --cover-h 由 JS 按视口计算，保证两张图同比例 cover */
  --cover-w: 100vw;
  --cover-h: 100vh;
}
.dark .mask-image-container {
  --bg-mask-color: #0a0a0b;
}

.image-layer {
  position: absolute;
  inset: 0;
  background-position: center top;
  background-size: var(--cover-w) var(--cover-h);
  background-repeat: no-repeat;
}

/* 上层图：橙色代码点阵，平时被 mask 完全遮住，鼠标经过才露出 */
.foreground-layer {
  -webkit-mask-image: radial-gradient(circle at -999px -999px, black 0%, transparent 0%);
  mask-image: radial-gradient(circle at -999px -999px, black 0%, transparent 0%);
  opacity: 0;
  transition: opacity 0.5s ease;
}
</style>
