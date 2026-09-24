<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { FoldBarChart, FoldBarChartConfig } from 'sk-chart-duo'

/**
 * sk-chart FoldBarChart 通用预览单元：接收一份 config，onMounted 时动态 import
 * 库并在容器内挂载真实 SVG 图表，onBeforeUnmount 时 destroy。文档页的每个案例
 * 都复用它，只在 markdown 的 <script setup> 里换 config。
 *
 * dark 为真时容器给深色底，用于展示 theme: 'dark' 预设（SVG 本身透明，底色由宿主控制）。
 */
const props = defineProps<{
  config: FoldBarChartConfig
  dark?: boolean
}>()

const el = ref<HTMLElement | null>(null)
let chart: FoldBarChart | null = null

async function mount(): Promise<void> {
  if (!el.value) return
  const { FoldBarChart: Ctor } = await import('sk-chart-duo')
  chart = new Ctor(el.value, props.config)
}

onMounted(mount)
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="chart-preview" :class="{ 'chart-preview--dark': dark }">
    <div ref="el" class="chart-preview__canvas"></div>
  </div>
</template>

<style scoped>
.chart-preview {
  margin: 20px 0;
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.chart-preview--dark {
  background: #0f1115;
}
.chart-preview__canvas {
  width: 100%;
  min-height: 240px;
  overflow-x: auto;
}
</style>
