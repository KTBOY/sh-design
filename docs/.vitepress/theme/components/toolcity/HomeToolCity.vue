<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue'
import type { Tool } from '../../products/meta'
import ProductCard from '../products/ProductCard.vue'
import { LANDMARKS } from './scene/landmarks'

const props = defineProps<{ tools: Tool[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [id: string]; error: [] }>()
const rootEl = ref<HTMLElement | null>(null)
const Stage = shallowRef<Component | null>(null)
const ready = ref(false)
const reducedMotion = ref(false)
const activeIndex = computed(() =>
  Math.max(
    0,
    props.tools.findIndex((tool) => tool.id === props.modelValue)
  )
)
const activeTool = computed(() => props.tools[activeIndex.value])
const activeLandmark = computed(() => LANDMARKS[activeTool.value?.id]?.title ?? '独立作品')
const activeNumber = computed(() => String(activeIndex.value + 1).padStart(2, '0'))
const total = computed(() => String(props.tools.length).padStart(2, '0'))
const navigation = computed(() =>
  props.tools.map((tool, index) => ({
    id: tool.id,
    name: LANDMARKS[tool.id]?.label ?? tool.name,
    no: String(index + 1).padStart(2, '0'),
    selected: tool.id === activeTool.value?.id
  }))
)

let observer: IntersectionObserver | null = null
let motionQuery: MediaQueryList | null = null
let disposed = false
let loading = false

function select(id: string) {
  emit('update:modelValue', id)
}

function step(direction: number) {
  const index = (activeIndex.value + direction + props.tools.length) % props.tools.length
  const tool = props.tools[index]
  if (tool) select(tool.id)
}

function syncMotion() {
  reducedMotion.value = motionQuery?.matches ?? false
}

async function loadStage() {
  if (loading || disposed) return
  loading = true
  observer?.disconnect()
  try {
    const module = await import('./ToolCityStage.vue')
    if (!disposed) Stage.value = markRaw(module.default)
  } catch {
    if (!disposed) emit('error')
  }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', syncMotion)
  syncMotion()
  if (typeof IntersectionObserver === 'undefined') {
    void loadStage()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadStage()
    },
    { rootMargin: '250px' }
  )
  if (rootEl.value) observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  motionQuery?.removeEventListener('change', syncMotion)
})
</script>

<template>
  <div ref="rootEl" class="district">
    <div class="district__body">
      <div class="district__scene">
        <div class="district__map-title" aria-hidden="true">
          <span class="district__map-mark" />
          <span>SHUKE'S NEIGHBORHOOD</span>
          <span class="district__edition">VOL. 01</span>
        </div>
        <div v-if="!ready" class="district__loading" role="status">
          <svg viewBox="0 0 80 64" width="80" height="64" fill="none" aria-hidden="true">
            <path d="m8 39 24-14 39 22-24 14L8 39Z" fill="#e9e5da" />
            <path d="m17 36 14 8V19l-14-8v25Z" fill="#ddd8ca" />
            <path d="m31 44 15-9V10l-15 9v25Z" fill="#f9f7ef" />
            <path d="m17 11 15-9 14 8-15 9-14-8Z" fill="#fffdf8" />
            <path d="m44 47 12 7V32l-12-7v22Z" fill="#d6d1c4" />
            <path d="m56 54 12-7V25l-12 7v22Z" fill="#f9f7ef" />
            <path d="m44 25 12-7 12 7-12 7-12-7Z" fill="#fffdf8" />
          </svg>
          <span>正在搭建街区…</span>
          <small>你也可以直接使用下方作品索引</small>
        </div>
        <component
          :is="Stage"
          v-if="Stage"
          :tools="tools"
          :selected-id="modelValue"
          :reduced-motion="reducedMotion"
          @ready="ready = true"
          @error="emit('error')"
          @select="select"
        />
        <div class="district__map-caption" aria-hidden="true">
          <svg width="25" height="25" viewBox="0 0 28 28" fill="none">
            <path d="m14 3 5 18-5-4-5 4 5-18Z" stroke="currentColor" />
            <path d="M14 3v14" stroke="currentColor" />
          </svg>
          <span>{{ total }} LANDMARKS<span>点击建筑，发现作品</span></span>
        </div>
      </div>
      <aside v-if="activeTool" class="district__detail" aria-label="选中产品详情">
        <div class="district__detail-top">
          <span class="district__building">{{ activeLandmark }}</span>
          <span class="district__count"
            >{{ activeNumber }} <span>/ {{ total }}</span></span
          >
        </div>
        <div class="district__detail-rule" />
        <ProductCard :key="activeTool.id" :tool="activeTool" class="district__product" />
        <div class="district__detail-bottom">
          <span>每一个想法，都有自己的坐标。</span>
          <div class="district__arrows" aria-label="切换作品">
            <button type="button" aria-label="上一个作品" @click="step(-1)">←</button>
            <button type="button" aria-label="下一个作品" @click="step(1)">→</button>
          </div>
        </div>
      </aside>
    </div>
    <nav class="district__index" aria-label="作品索引">
      <button
        v-for="item in navigation"
        :key="item.id"
        type="button"
        class="district__index-item"
        :class="{ 'is-selected': item.selected }"
        :aria-pressed="item.selected"
        :data-city-product="item.id"
        @click="select(item.id)"
      >
        <span class="district__index-no">{{ item.no }}</span>
        <span>{{ item.name }}</span>
        <span class="district__index-dot" aria-hidden="true" />
      </button>
    </nav>
    <span class="district__sr-only" role="status"
      >已选择 {{ activeTool?.name }}，{{ activeLandmark }}</span
    >
  </div>
</template>

<style scoped>
.district {
  --district-border: #e6e3da;
  --district-muted: #7b7a70;
  overflow: hidden;
  border: 1px solid var(--district-border);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 40px -24px rgba(64, 57, 37, 0.18);
}
.district__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  min-height: 500px;
}
.district__scene {
  position: relative;
  min-width: 0;
  min-height: 500px;
  overflow: hidden;
  background:
    radial-gradient(circle at 73% 22%, rgba(255, 250, 235, 0.96), transparent 31%),
    linear-gradient(180deg, #f7f3e9 0%, #f3efe4 58%, #eee9dd 100%);
}
.district__scene::before {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2),
    transparent 24%,
    transparent 70%,
    rgba(102, 88, 59, 0.035)
  );
  content: '';
  pointer-events: none;
}
.district__map-title {
  position: absolute;
  z-index: 3;
  top: 24px;
  right: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6f7165;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  pointer-events: none;
}
.district__map-mark {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #929d7f;
}
.district__edition {
  margin-left: auto;
  color: #929285;
}
.district__map-caption {
  position: absolute;
  bottom: 22px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7b7d6d;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  line-height: 1.8;
  letter-spacing: 0.08em;
  pointer-events: none;
}
.district__map-caption span span {
  display: block;
  font-family: inherit;
  letter-spacing: 0.04em;
}
.district__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #65665c;
  font-size: 12px;
}
.district__loading small {
  color: #7b7a70;
  font-size: 11px;
}
.district__detail {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 28px 26px 18px;
  border-left: 1px solid var(--district-border);
}
.district__detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.district__building {
  color: var(--district-muted);
  font-size: 11px;
  letter-spacing: 0.05em;
}
.district__count {
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 17px;
}
.district__count span {
  color: #a7a79e;
  font-size: 11px;
}
.district__detail-rule {
  height: 1px;
  margin: 20px 0 24px;
  background: var(--district-border);
}
.district__product {
  flex: 1;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.district__product:hover {
  transform: none;
  box-shadow: none;
}
.district__product :deep(.p-card__head) {
  align-items: flex-start;
}
.district__product :deep(.p-card__name) {
  font-size: 23px;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.district__product :deep(.p-card__name em) {
  display: block;
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.6;
}
.district__product :deep(.p-card__desc) {
  flex: initial;
  margin: 22px 0 18px;
  font-size: 12.5px;
  line-height: 1.9;
}
.district__product :deep(.p-card__tags) {
  margin-bottom: 26px;
}
.district__product :deep(.p-card__tags span) {
  font-size: 10px;
}
.district__product :deep(.p-card__links) {
  margin-top: auto;
}
.district__product :deep(.p-card__links a) {
  padding: 6px 11px;
  font-size: 11px;
}
.district__detail-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--district-border);
}
.district__detail-bottom > span {
  color: var(--district-muted);
  font-size: 9px;
}
.district__arrows {
  display: flex;
  gap: 6px;
}
.district__arrows button {
  width: 30px;
  height: 30px;
  border: 1px solid #e7e7ea;
  border-radius: 50%;
  color: #686965;
  cursor: pointer;
}
.district__arrows button:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.district__index {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 14px;
  gap: 4px;
  border-top: 1px solid var(--district-border);
  background: #fdfcf9;
}
.district__index-item {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6a6b63;
  font-size: 11px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}
.district__index-no {
  color: #939286;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
}
.district__index-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: transparent;
}
.district__index-item:hover {
  color: #2563eb;
  background: #f1f3f5;
}
.district__index-item.is-selected {
  border-color: #dfe6f1;
  background: #fff;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.03);
}
.district__index-item.is-selected .district__index-no {
  color: #2563eb;
}
.district__index-item.is-selected .district__index-dot {
  background: #2563eb;
}
.district__index button:focus-visible,
.district__arrows button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.district__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.dark .district {
  --district-border: #353630;
  --district-muted: #a8aa9f;
  background: #20221f;
}
.dark .district__detail :deep(.p-card) {
  background: transparent;
}
.dark .district__index {
  background: #1d1f1c;
}
.dark .district__index-item {
  color: #bcbeb4;
}
.dark .district__index-item.is-selected {
  border-color: #354d76;
  background: #232e40;
  color: #93bbff;
}
.dark .district__index-item:hover {
  background: #2c322c;
}
@media (max-width: 1000px) {
  .district__body {
    grid-template-columns: minmax(0, 1fr) 275px;
  }
  .district__detail {
    padding: 24px 20px 18px;
  }
  .district__product :deep(.p-card__name) {
    font-size: 21px;
  }
}
@media (max-width: 800px) {
  .district__body {
    grid-template-columns: 1fr;
  }
  .district__scene {
    min-height: 400px;
  }
  .district__detail {
    border-top: 1px solid var(--district-border);
    border-left: 0;
  }
  .district__detail-rule {
    margin: 14px 0 18px;
  }
  .district__product :deep(.p-card__desc) {
    margin: 16px 0;
  }
  .district__product :deep(.p-card__tags) {
    margin-bottom: 18px;
  }
  .district__detail-bottom {
    margin-top: 18px;
  }
}
@media (max-width: 640px) {
  .district__scene {
    min-height: 350px;
  }
  .district__map-title {
    top: 18px;
    left: 18px;
    right: 18px;
    font-size: 8px;
  }
  .district__map-caption {
    left: 18px;
    bottom: 18px;
    font-size: 8px;
  }
  .district__index {
    padding: 10px;
  }
  .district__index-item {
    flex: 1 1 40%;
    justify-content: flex-start;
    min-height: 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .district__index-item {
    transition: none;
  }
}
</style>
