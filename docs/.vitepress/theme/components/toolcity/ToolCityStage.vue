<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Tool } from '../../products/meta'
import { LANDMARKS } from './scene/landmarks'
import {
  createProductStage,
  type CityLabelPosition,
  type ProductStage,
  type WalkDirection
} from './scene/product-stage'

const props = defineProps<{
  tools: Tool[]
  selectedId: string
  reducedMotion: boolean
  dusk: boolean
}>()
const emit = defineEmits<{ ready: []; error: []; select: [id: string] }>()
const rootEl = ref<HTMLDivElement | null>(null)
const positions = shallowRef<CityLabelPosition[]>([])
const hoveredId = ref<string | null>(null)
const ready = ref(false)
const walking = ref(false)
const touch = ref(false)
const firstPerson = ref(false)
const walkAnnounce = ref('')
const nearTip = ref<{ id: string; x: number; y: number } | null>(null)
let stage: ProductStage | null = null
let touchQuery: MediaQueryList | null = null

const labels = computed(() =>
  positions.value.flatMap((position) => {
    const index = props.tools.findIndex((tool) => tool.id === position.id)
    const tool = props.tools[index]
    const spec = LANDMARKS[position.id]
    if (!tool || !spec) return []
    return [
      {
        id: tool.id,
        name: spec.label,
        no: String(index + 1).padStart(2, '0'),
        ariaLabel: `选择 ${tool.name} · ${spec.title}`,
        selected: props.selectedId === tool.id,
        hovered: hoveredId.value === tool.id,
        style: { left: `${position.x}px`, top: `${position.y}px` }
      }
    ]
  })
)

const nearTool = computed(() => {
  const tip = nearTip.value
  if (!tip) return null
  return props.tools.find((tool) => tool.id === tip.id) ?? null
})
const nearTitle = computed(() => {
  const tool = nearTool.value
  return tool ? (LANDMARKS[tool.id]?.title ?? '街区地标') : ''
})
const hintText = computed(() => {
  if (touch.value) return '方向键走动 · 点击建筑查看 · 「退出」返回全景'
  if (firstPerson.value)
    return 'WASD / 方向键走动 · 拖拽环顾 · V 切换等距视角 · 点击建筑查看 · Esc 退出'
  return 'WASD / 方向键走动 · Shift 小跑 · 拖拽转视角 · V 第一人称 · 点击建筑查看 · Esc 退出'
})

function select(id: string) {
  if (id === props.selectedId) stage?.select(id)
  emit('select', id)
}

function setDirection(direction: WalkDirection, pressed: boolean) {
  stage?.setDirection(direction, pressed)
}

function toggleWalk() {
  stage?.setWalk(!walking.value)
}

function toggleView() {
  stage?.setFirstPerson(!firstPerson.value)
}

function exitWalk() {
  if (!stage) return
  if (walking.value) stage.setWalk(false)
  else stage.reset()
}

function syncTouch() {
  touch.value = touchQuery?.matches ?? false
}

onMounted(() => {
  touchQuery = window.matchMedia('(hover: none)')
  touchQuery.addEventListener('change', syncTouch)
  syncTouch()
  if (!rootEl.value) return
  try {
    stage = createProductStage(rootEl.value, {
      ids: props.tools.map((tool) => tool.id),
      selectedId: props.selectedId,
      reducedMotion: props.reducedMotion,
      onSelect: select,
      onHover: (id) => {
        hoveredId.value = id
      },
      onProject: (value) => {
        positions.value = value
        if (!ready.value) {
          ready.value = true
          emit('ready')
        }
      },
      onWalkChange: (on) => {
        walking.value = on
        walkAnnounce.value = on
          ? '已进入街区漫游，使用 WASD 或方向键移动，Esc 退出'
          : '已退出漫游，回到全景视图'
        if (!on) {
          firstPerson.value = false
          nearTip.value = null
        }
      },
      onView: (on) => {
        firstPerson.value = on
        walkAnnounce.value = on ? '已切换第一人称视角' : '已切换等距视角'
      },
      onWalk: (tip) => {
        if (!tip || !tip.nearId) {
          if (nearTip.value) nearTip.value = null
          return
        }
        const current = nearTip.value
        if (current && current.id === tip.nearId && current.x === tip.x && current.y === tip.y)
          return
        nearTip.value = { id: tip.nearId, x: tip.x, y: tip.y }
      },
      onError: () => emit('error')
    })
    if (props.dusk) stage.setDusk(true)
  } catch {
    emit('error')
  }
})

watch(
  () => props.selectedId,
  (id) => stage?.select(id)
)
watch(
  () => props.reducedMotion,
  (value) => stage?.setReducedMotion(value)
)
watch(
  () => props.dusk,
  (value) => stage?.setDusk(value)
)
onBeforeUnmount(() => {
  touchQuery?.removeEventListener('change', syncTouch)
  stage?.dispose()
  stage = null
})
</script>

<template>
  <div
    ref="rootEl"
    class="tc-stage"
    role="group"
    aria-label="产品街区：选择建筑查看产品，也可以使用下方作品索引"
    :aria-busy="!ready"
  >
    <button
      v-for="label in labels"
      v-show="!walking"
      :key="label.id"
      type="button"
      class="tc-stage__label"
      :class="{ 'is-selected': label.selected, 'is-hovered': label.hovered }"
      :style="label.style"
      :aria-label="label.ariaLabel"
      :aria-pressed="label.selected"
      :data-landmark="label.id"
      @click="select(label.id)"
      @pointerenter="stage?.hover(label.id)"
      @pointerleave="stage?.hover(null)"
      @focus="stage?.hover(label.id)"
      @blur="stage?.hover(null)"
    >
      <span class="tc-stage__number">{{ label.no }}</span>
      <span class="tc-stage__name">{{ label.name }}</span>
      <span class="tc-stage__dot" aria-hidden="true" />
    </button>
    <div v-if="ready" class="tc-stage__controls">
      <button
        type="button"
        class="tc-stage__control"
        aria-label="镜头回到街区全景"
        @click="exitWalk"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" stroke="currentColor" stroke-width="1.5" />
          <path d="m8 12 4-3 4 3-4 3-4-3Z" stroke="currentColor" stroke-width="1.5" />
        </svg>
        全景
      </button>
      <button
        v-if="walking"
        type="button"
        class="tc-stage__control"
        :class="{ 'is-active': firstPerson }"
        :aria-pressed="firstPerson"
        :aria-label="firstPerson ? '切换为等距视角' : '切换为第一人称视角'"
        @click="toggleView"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.5" />
        </svg>
        {{ firstPerson ? '等距' : '第一人称' }}
      </button>
      <button
        type="button"
        class="tc-stage__control"
        :class="{ 'is-active': walking }"
        :aria-pressed="walking"
        :aria-label="walking ? '退出漫游，回到全景' : '变成人物进入街区漫游'"
        @click="toggleWalk"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="5.2" r="2.1" stroke="currentColor" stroke-width="1.5" />
          <path
            d="M12 8.4v5.4m0 0-2.4 6.4m2.4-6.4 2.4 6.4M7.6 10.8 12 9.6l4.4 1.2"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        {{ walking ? '退出' : '漫游' }}
      </button>
    </div>
    <button
      v-if="walking && nearTool && nearTip"
      type="button"
      class="tc-stage__tip"
      :style="{ left: `${nearTip.x}px`, top: `${nearTip.y}px` }"
      :aria-label="`查看 ${nearTool.name} · ${nearTitle}`"
      @click="select(nearTool.id)"
    >
      <span class="tc-stage__tip-title">{{ nearTitle }}</span>
      <span class="tc-stage__tip-name">{{ nearTool.name }} · 查看</span>
    </button>
    <p v-if="walking" class="tc-stage__hint">{{ hintText }}</p>
    <div v-if="walking && touch" class="tc-stage__pad" role="group" aria-label="漫游方向键">
      <button
        type="button"
        class="tc-stage__pad-btn tc-stage__pad-btn--up"
        aria-label="向前走"
        @pointerdown.prevent="setDirection('up', true)"
        @pointerup="setDirection('up', false)"
        @pointerleave="setDirection('up', false)"
        @pointercancel="setDirection('up', false)"
        @contextmenu.prevent
      >
        ▲
      </button>
      <button
        type="button"
        class="tc-stage__pad-btn tc-stage__pad-btn--left"
        aria-label="向左走"
        @pointerdown.prevent="setDirection('left', true)"
        @pointerup="setDirection('left', false)"
        @pointerleave="setDirection('left', false)"
        @pointercancel="setDirection('left', false)"
        @contextmenu.prevent
      >
        ◀
      </button>
      <button
        type="button"
        class="tc-stage__pad-btn tc-stage__pad-btn--down"
        aria-label="向后走"
        @pointerdown.prevent="setDirection('down', true)"
        @pointerup="setDirection('down', false)"
        @pointerleave="setDirection('down', false)"
        @pointercancel="setDirection('down', false)"
        @contextmenu.prevent
      >
        ▼
      </button>
      <button
        type="button"
        class="tc-stage__pad-btn tc-stage__pad-btn--right"
        aria-label="向右走"
        @pointerdown.prevent="setDirection('right', true)"
        @pointerup="setDirection('right', false)"
        @pointerleave="setDirection('right', false)"
        @pointercancel="setDirection('right', false)"
        @contextmenu.prevent
      >
        ▶
      </button>
    </div>
    <span class="tc-stage__sr-only" role="status">{{ walkAnnounce }}</span>
  </div>
</template>

<style scoped>
.tc-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: pan-y pinch-zoom;
}
.tc-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
.tc-stage__label {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid rgba(213, 209, 197, 0.8);
  border-radius: 7px;
  background: rgba(255, 254, 250, 0.94);
  box-shadow: 0 3px 8px rgba(74, 67, 47, 0.07);
  color: #57564e;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  cursor: pointer;
  transform: translate(-50%, -100%);
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}
.tc-stage__label::after {
  position: absolute;
  top: 100%;
  left: 50%;
  width: 1px;
  height: 10px;
  background: #c2bfb1;
  content: '';
}
.tc-stage__number {
  color: #8b887d;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
}
.tc-stage__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #b9b5a6;
}
.tc-stage__label.is-selected,
.tc-stage__label.is-hovered {
  z-index: 3;
  border-color: #2563eb;
  background: #fff;
  color: #2563eb;
}
.tc-stage__label.is-selected .tc-stage__dot {
  background: #2563eb;
}
.tc-stage__label.is-selected .tc-stage__number {
  color: #2563eb;
}
.tc-stage__label.is-selected::after {
  background: #2563eb;
}
.tc-stage__controls {
  position: absolute;
  z-index: 2;
  right: 18px;
  bottom: 18px;
  display: flex;
  gap: 8px;
}
.tc-stage__control {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 6px 10px;
  border: 1px solid #dedbd1;
  border-radius: 7px;
  background: rgba(255, 254, 250, 0.92);
  color: #65665c;
  font-size: 11px;
  cursor: pointer;
}
.tc-stage__control.is-active {
  border-color: #2563eb;
  background: #fff;
  color: #2563eb;
}
.tc-stage__tip {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 10px;
  border: 1px solid #dfd9c9;
  border-radius: 8px;
  background: rgba(255, 254, 250, 0.96);
  box-shadow: 0 4px 12px rgba(74, 67, 47, 0.12);
  color: #57564e;
  text-align: left;
  cursor: pointer;
  transform: translate(-50%, -100%);
}
.tc-stage__tip-title {
  font-size: 11px;
  font-weight: 500;
}
.tc-stage__tip-name {
  color: #8b887d;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
}
.tc-stage__hint {
  position: absolute;
  z-index: 2;
  top: 54px;
  left: 50%;
  margin: 0;
  padding: 5px 10px;
  border: 1px solid rgba(222, 219, 209, 0.9);
  border-radius: 7px;
  background: rgba(255, 254, 250, 0.88);
  color: #7b7a70;
  font-size: 10px;
  line-height: 1.6;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
}
.tc-stage__pad {
  position: absolute;
  z-index: 2;
  bottom: 18px;
  left: 18px;
  display: grid;
  grid-template-columns: repeat(3, 44px);
  grid-template-rows: repeat(2, 44px);
  gap: 6px;
}
.tc-stage__pad-btn {
  border: 1px solid #dedbd1;
  border-radius: 10px;
  background: rgba(255, 254, 250, 0.92);
  color: #65665c;
  font-size: 13px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}
.tc-stage__pad-btn--up {
  grid-column: 2;
  grid-row: 1;
}
.tc-stage__pad-btn--left {
  grid-column: 1;
  grid-row: 2;
}
.tc-stage__pad-btn--down {
  grid-column: 2;
  grid-row: 2;
}
.tc-stage__pad-btn--right {
  grid-column: 3;
  grid-row: 2;
}
.tc-stage__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.tc-stage__label:focus-visible,
.tc-stage__control:focus-visible,
.tc-stage__tip:focus-visible,
.tc-stage__pad-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 4px;
}
@media (max-width: 640px) {
  .tc-stage__label {
    min-width: 36px;
    min-height: 36px;
    justify-content: center;
    padding: 7px;
    border-radius: 50%;
  }
  .tc-stage__number {
    font-size: 11px;
  }
  .tc-stage__name,
  .tc-stage__dot {
    display: none;
  }
  .tc-stage__hint {
    top: 46px;
    max-width: calc(100% - 36px);
    text-align: center;
    white-space: normal;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tc-stage__label {
    transition: none;
  }
}
</style>
