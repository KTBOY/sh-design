<script setup lang="ts">
import { computed, ref } from 'vue'
import { resolveUniSrc } from './uni-demo'

interface Props {
  /**
   * shukelab H5 站内页面路径（pages.json 中的 path，如 /pages/virtualMenuGanged/basic）；
   * 传入完整 http(s) 地址时原样嵌入。
   */
  src: string
  /** 演示视口高度 */
  height?: string
  /** 标题栏文案，缺省展示页面路径 */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '640px'
})

const frameSrc = computed(() => resolveUniSrc(props.src))

const loading = ref(true)
const reloadKey = ref(0)

function reload() {
  loading.value = true
  reloadKey.value++
}
</script>

<template>
  <div class="uni-demo">
    <div class="uni-demo__bar">
      <span class="uni-demo__dot" aria-hidden="true"></span>
      <span class="uni-demo__title" :title="src">{{ title ?? src }}</span>
      <span class="uni-demo__actions">
        <button class="uni-demo__action" type="button" title="重新加载" @click="reload">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35Z"/></svg>
        </button>
        <a class="uni-demo__action" :href="frameSrc" target="_blank" rel="noopener" title="新窗口打开">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7ZM5 5h4V3H3v18h18v-6h-2v4H5V5Z"/></svg>
        </a>
      </span>
    </div>
    <div class="uni-demo__viewport" :style="{ height }">
      <Transition name="uni-demo-fade">
        <div v-if="loading" class="uni-demo__loading">
          <span class="uni-demo__spinner" aria-hidden="true"></span>
          <span>演示加载中…</span>
        </div>
      </Transition>
      <iframe
        :key="reloadKey"
        :src="frameSrc"
        class="uni-demo__frame"
        title="uni-app H5 组件演示"
        loading="lazy"
        @load="loading = false"
      />
    </div>
  </div>
</template>

<style scoped>
.uni-demo {
  width: min(375px, 100%);
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  overflow: hidden;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 32px -16px rgba(15, 23, 42, 0.25);
}

.uni-demo__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px 7px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.uni-demo__dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
}

.uni-demo__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.uni-demo__actions {
  display: flex;
  gap: 4px;
}

.uni-demo__action {
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

.uni-demo__action:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.uni-demo__viewport {
  position: relative;
  background: var(--vp-c-bg);
}

.uni-demo__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.uni-demo__loading {
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

.uni-demo__spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  border-top-color: var(--vp-c-brand-1);
  animation: uni-demo-rotate 0.8s linear infinite;
}

@keyframes uni-demo-rotate {
  to {
    transform: rotate(360deg);
  }
}

.uni-demo-fade-leave-active {
  transition: opacity 0.25s ease;
}

.uni-demo-fade-leave-to {
  opacity: 0;
}
</style>
