<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { FoldBarChart, FoldBarChartConfig, FoldBarDatum } from 'sk-chart-duo'

/**
 * sk-chart FoldBarChart 实时演示。
 *
 * 该库是命令式（G2Plot 风格）API：new FoldBarChart(el, config)。组件在 onMounted
 * 里通过动态 import 挂载真实 SVG 图表（避开 VitePress 构建期的 SSR——库只在构造时
 * 触碰 DOM），onBeforeUnmount 时 destroy 清理。提供「随机数据 / 还原 / 主题切换 /
 * 导出 PNG」四个交互，覆盖 update / theme / download 三个常用能力。
 */
const BASE_DATA: FoldBarDatum[] = [
  { label: '发起支付', value: 65.2 },
  { label: '授权支付', value: 54.8 },
  { label: '支付成功', value: 48.6 },
  { label: '商户打款', value: 38.3 },
  { label: '完成交易', value: 32.9 }
]

const el = ref<HTMLElement | null>(null)
const dark = ref(false)
const hint = ref('悬停或用 ← / → 键切换高亮列')

// 库类型来自 sk-chart-duo 的 type-only import（构建期擦除，不触发 SSR）。
let chart: FoldBarChart | null = null

function buildConfig(): FoldBarChartConfig {
  return {
    data: BASE_DATA,
    scale: { exponent: 2 },
    state: { defaultActive: 2 },
    title: { text: '支付转化漏斗' },
    ariaLabel: '支付转化漏斗图',
    theme: dark.value ? 'dark' : 'light'
  }
}

async function mount(): Promise<void> {
  if (!el.value) return
  const { FoldBarChart } = await import('sk-chart-duo')
  chart = new FoldBarChart(el.value, buildConfig())
}

function randomize(): void {
  const next = BASE_DATA.map((d) => ({
    ...d,
    value: Math.round((20 + Math.random() * 50) * 10) / 10
  }))
  next.sort((a, b) => b.value - a.value)
  chart?.update({ data: next })
  hint.value = 'update：已替换为随机递减数据'
}

function restore(): void {
  chart?.update({ data: BASE_DATA })
  hint.value = 'update：已还原原稿数据'
}

async function toggleTheme(): Promise<void> {
  dark.value = !dark.value
  chart?.update({ theme: dark.value ? 'dark' : 'light' })
  hint.value = `theme：切换到 ${dark.value ? 'dark' : 'light'} 预设`
}

async function exportPng(): Promise<void> {
  if (!chart) return
  try {
    await chart.download({ filename: 'sk-chart-fold-bar' })
    hint.value = 'download：已导出 PNG（2x）'
  } catch (err) {
    hint.value = `导出失败：${(err as Error).message}`
  }
}

onMounted(mount)
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="fold-demo" :class="{ 'fold-demo--dark': dark }">
    <div class="fold-demo__bar">
      <button type="button" @click="randomize">随机数据</button>
      <button type="button" @click="restore">还原</button>
      <button type="button" @click="toggleTheme">
        {{ dark ? '浅色主题' : '深色主题' }}
      </button>
      <button type="button" @click="exportPng">导出 PNG</button>
      <span class="fold-demo__hint">{{ hint }}</span>
    </div>
    <div ref="el" class="fold-demo__chart"></div>
  </div>
</template>

<style scoped>
.fold-demo {
  margin: 24px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: background 0.3s ease;
}
.fold-demo--dark {
  background: #0f1115;
}
.fold-demo__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.fold-demo__bar button {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}
.fold-demo__bar button:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.fold-demo__hint {
  flex: 1;
  min-width: 160px;
  color: var(--vp-c-text-3);
  font-size: 12.5px;
}
.fold-demo__chart {
  width: 100%;
  overflow-x: auto;
}
</style>
