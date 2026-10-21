<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue'
import { useData, withBase } from 'vitepress'
import type { Tool, ToolGroup } from '../products/meta'

const props = defineProps<{ tools: Tool[]; groups: ToolGroup[] }>()
const { isDark } = useData()

const rootEl = ref<HTMLElement | null>(null)
const Stage = shallowRef<Component | null>(null)
const reducedMotion = ref(false)
const failed = ref(false)
const stageReady = ref(false)
const staticMode = computed(() => reducedMotion.value || failed.value)
const posterUrl = withBase('/tool-city-poster.webp')
const posterStyle = computed(() => ({ '--htc-poster': `url("${posterUrl}")` }))
const hoverIndex = ref<number | null>(null)

const activeGroup = computed(() => {
  const index = hoverIndex.value
  if (index === null) return -1
  let acc = 0
  for (let i = 0; i < props.groups.length; i++) {
    acc += props.groups[i].items.length
    if (index < acc) return i
  }
  return -1
})

const hintText = computed(() => {
  const index = hoverIndex.value
  if (index === null) return `${props.tools.length} 座片区 · 沿大道分布`
  const tool = props.tools[index]
  return tool ? `${tool.name} · 第 ${index + 1} 片区` : ''
})

function scrollToGrid() {
  document
    .querySelector<HTMLElement>('.hp-grid [data-tool-card]')
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

let loadPromise: Promise<void> | null = null
let stageComponent: Component | null = null
let observer: IntersectionObserver | null = null
let reducedQuery: MediaQueryList | null = null

function ensureStage() {
  if (staticMode.value || Stage.value || loadPromise) return
  loadPromise = import('./ToolCityStage.vue')
    .then((module) => {
      stageComponent = markRaw(module.default)
      if (!staticMode.value) Stage.value = stageComponent
    })
    .catch((error) => {
      console.warn('[tool-city] 3D chunk failed, fallback to poster', error)
      failed.value = true
    })
}

function setupObserver() {
  observer?.disconnect()
  observer = null
  if (staticMode.value || Stage.value || !rootEl.value) return
  if (typeof IntersectionObserver === 'undefined') {
    ensureStage()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      ensureStage()
      observer?.disconnect()
      observer = null
    },
    { rootMargin: '500px 0px' }
  )
  observer.observe(rootEl.value)
}

function syncMode() {
  reducedMotion.value = reducedQuery?.matches ?? false
  if (reducedMotion.value) {
    Stage.value = null
    stageReady.value = false
    observer?.disconnect()
    observer = null
    return
  }
  if (stageComponent) {
    Stage.value = stageComponent
    return
  }
  setupObserver()
}

function onStageReady() {
  stageReady.value = true
}

function onStageError() {
  failed.value = true
  Stage.value = null
  stageReady.value = false
}

onMounted(() => {
  reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedQuery.addEventListener('change', syncMode)
  syncMode()
})

onBeforeUnmount(() => {
  reducedQuery?.removeEventListener('change', syncMode)
  reducedQuery = null
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section
    ref="rootEl"
    class="htc"
    :class="{ 'htc--static': staticMode }"
    aria-label="工具之城 3D 展示"
  >
    <div class="htc__rail">
      <div class="htc__frame">
        <div
          class="htc__poster"
          :class="{ 'is-hidden': stageReady }"
          :style="posterStyle"
          aria-hidden="true"
        />
        <component
          :is="Stage"
          v-if="Stage && !staticMode"
          :tools="props.tools"
          :groups="props.groups"
          :dark="isDark"
          class="htc__stage"
          @ready="onStageReady"
          @error="onStageError"
          @hover="hoverIndex = $event"
        />
        <button v-if="staticMode" type="button" class="htc__fallback" @click="scrollToGrid">
          查看 {{ props.tools.length }} 个工具
        </button>
        <div v-if="!staticMode" class="htc__legend" aria-hidden="true">
          <span
            v-for="(group, i) in props.groups"
            :key="group.id"
            class="htc__zone"
            :class="{ 'is-active': activeGroup === i }"
          >
            <i></i>{{ group.zh }}
          </span>
          <span class="htc__hint">{{ hintText }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 全出血区块比内容容器宽，用 clip 吃掉滚动条宽度带来的几像素横向溢出 */
:global(html:has(.htc)),
:global(body:has(.htc)) {
  overflow-x: clip;
}

.htc {
  --tc-frame: clamp(560px, 82vh, 900px);
  --tc-travel: 64vh;
  position: relative;
  width: 100vw;
  margin-top: 12px;
  margin-left: calc(50% - 50vw);
  overflow-x: clip;
  background:
    radial-gradient(52% 54% at 50% 36%, rgba(37, 99, 235, 0.06), transparent 72%),
    radial-gradient(38% 32% at 70% 66%, rgba(34, 211, 238, 0.045), transparent 72%);
}

@supports (width: 100dvw) {
  .htc {
    width: 100dvw;
    margin-left: calc(50% - 50dvw);
  }
}

.htc__rail {
  position: relative;
  height: calc(var(--tc-frame) + var(--tc-travel));
}

.htc__frame {
  position: sticky;
  top: 64px;
  height: var(--tc-frame);
  overflow: hidden;
}

.htc__frame::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  height: 72px;
  pointer-events: none;
  background: linear-gradient(to bottom, transparent, var(--vp-c-bg));
}

.htc__poster {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image:
    var(--htc-poster, none),
    radial-gradient(60% 52% at 50% 44%, rgba(37, 99, 235, 0.12), transparent 72%);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover, auto;
  opacity: 0.94;
  transition: opacity 0.8s ease;
}

.htc__poster.is-hidden {
  opacity: 0;
}

.htc__stage {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.htc__legend {
  position: absolute;
  bottom: 20px;
  left: 26px;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #8ea7c4;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  pointer-events: none;
}

.htc__zone {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s ease;
}

.htc__zone i {
  width: 6px;
  height: 6px;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.htc__zone.is-active {
  color: #2563eb;
}

.htc__zone.is-active i {
  background: currentColor;
}

.htc__hint {
  color: #a6bcd6;
}

.htc__fallback {
  position: absolute;
  bottom: 46px;
  left: 26px;
  z-index: 4;
  padding: 8px 16px;
  border: 1px solid rgba(37, 99, 235, 0.34);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #1d4ed8;
  font-size: 12.5px;
  cursor: pointer;
}

.htc__fallback:hover {
  border-color: rgba(37, 99, 235, 0.62);
  background: #fff;
}

.dark .htc {
  background:
    radial-gradient(52% 54% at 50% 36%, rgba(37, 99, 235, 0.16), transparent 72%),
    radial-gradient(38% 32% at 70% 66%, rgba(34, 211, 238, 0.08), transparent 72%);
}

.dark .htc__legend {
  color: #7f9cc0;
}

.dark .htc__hint {
  color: #6f8cb2;
}

.dark .htc__fallback {
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(12, 18, 28, 0.6);
  color: #93c5fd;
}

@media (max-width: 767px) {
  .htc {
    --tc-frame: clamp(440px, 72vh, 620px);
    --tc-travel: 30vh;
  }

  .htc__legend {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .htc__poster {
    transition: none;
  }
}
</style>
