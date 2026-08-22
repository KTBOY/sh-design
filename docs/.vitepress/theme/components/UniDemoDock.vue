<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { resolveUniSrc } from './uni-demo'

interface DemoItem {
  /** shukelab H5 站内页面路径（pages.json 中的 path），或完整 http(s) 地址 */
  src: string
  /** Tab 标题，缺省展示页面路径 */
  title?: string
}

/**
 * 右侧停靠的手机演示面板：超宽屏（≥1792px）固定在页面右侧，随滚动常驻，Tab 切换多个示例；
 * 窄屏回落为正文内嵌的单个手机壳。每页最多放一个（fixed 定位会叠放）。
 * 宽屏下给所在 .content 挂 has-uni-demo-dock 类，配合 custom.css 恢复正文 688px 限宽
 * （VitePress 仅在页面有 aside 时才限宽，lab 页面需 aside: false 给面板让位；
 * 旧内核不支持 :has() 的浏览器靠这个类兜底。断点取 1792：实测 1440–1728 宽度下
 * 即使限宽，正文右缘仍会压到面板）。
 */
const props = withDefaults(
  defineProps<{
    demos: DemoItem[]
    /** 窄屏内联模式下的视口高度 */
    height?: string
  }>(),
  { height: '640px' }
)

const active = ref(0)
const currentSrc = computed(() =>
  props.demos[active.value] ? resolveUniSrc(props.demos[active.value].src) : ''
)

const loading = ref(true)
const reloadKey = ref(0)
const root = ref<HTMLElement | null>(null)
let hostContent: HTMLElement | null = null

function switchTo(i: number) {
  if (i === active.value) return
  active.value = i
  loading.value = true
}

function reload() {
  loading.value = true
  reloadKey.value++
}

onMounted(() => {
  hostContent = root.value?.closest('.content') ?? null
  hostContent?.classList.add('has-uni-demo-dock')
})

onBeforeUnmount(() => hostContent?.classList.remove('has-uni-demo-dock'))
</script>

<template>
  <div ref="root" class="uni-demo-dock">
     <div class="uni-demo-dock__bar">
    
      <span class="uni-demo-dock__actions">
        <button class="uni-demo-dock__action" type="button" title="重新加载" @click="reload">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z"/></svg>
        </button>
        <a class="uni-demo-dock__action" :href="currentSrc" target="_blank" rel="noopener" title="新窗口打开">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7ZM5 5h4V3H3v18h18v-6h-2v4H5V5Z"/></svg>
        </a>
      </span>
    </div>
    <div class="uni-demo-dock__viewport" :style="{ '--uni-demo-dock-h': height }">
      <Transition name="uni-demo-dock-fade">
        <div v-if="loading" class="uni-demo-dock__loading">
          <span class="uni-demo-dock__spinner" aria-hidden="true"></span>
          <span>演示加载中…</span>
        </div>
      </Transition>
      <iframe
        :key="`${active}-${reloadKey}`"
        :src="currentSrc"
        class="uni-demo-dock__frame"
        title="uni-app H5 组件演示"
        @load="loading = false"
      />
    </div>
  </div>
</template>

<style scoped>
.uni-demo-dock {
  width: min(375px, 100%);
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 32px -16px rgba(15, 23, 42, 0.25);
}

.uni-demo-dock__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px 7px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.uni-demo-dock__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
}

.uni-demo-dock__tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}

.uni-demo-dock__tabs::-webkit-scrollbar {
  display: none;
}

.uni-demo-dock__tab {
  flex: none;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 4px 10px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.uni-demo-dock__tab:hover {
  color: var(--vp-c-text-1);
}

.uni-demo-dock__tab.is-active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
  font-weight: 600;
}

.uni-demo-dock__actions {
  display: flex;
  gap: 4px;
}

.uni-demo-dock__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.uni-demo-dock__action:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.uni-demo-dock__viewport {
  position: relative;
  height: var(--uni-demo-dock-h, 640px);
  background: var(--vp-c-bg);
}

.uni-demo-dock__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.uni-demo-dock__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
}

.uni-demo-dock__spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  animation: uni-demo-dock-rotate 0.8s linear infinite;
}

@keyframes uni-demo-dock-rotate {
  to {
    transform: rotate(360deg);
  }
}

.uni-demo-dock-fade-leave-active {
  transition: opacity 0.25s ease;
}

.uni-demo-dock-fade-leave-to {
  opacity: 0;
}

/* 超宽屏：停靠在页面右侧常驻（VitePress 右侧 outline 需通过页面 frontmatter `aside: false` 让位） */
@media (min-width: 1792px) {
  .uni-demo-dock {
    position: fixed;
    top: calc(var(--vp-nav-height, 56px) + 20px);
    right: 24px;
    width: 375px;
    margin: 0;
    z-index: 20;
  }

  .uni-demo-dock__viewport {
    height: clamp(480px, calc(100dvh - var(--vp-nav-height, 56px) - 104px), 720px);
  }
}
</style>
