<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Tool } from '../../products/meta'
import { LANDMARKS } from './scene/landmarks'
import {
  createProductStage,
  type CityLabelPosition,
  type ProductStage
} from './scene/product-stage'

const props = defineProps<{
  tools: Tool[]
  selectedId: string
  reducedMotion: boolean
}>()
const emit = defineEmits<{ ready: []; error: []; select: [id: string] }>()
const rootEl = ref<HTMLDivElement | null>(null)
const positions = shallowRef<CityLabelPosition[]>([])
const hoveredId = ref<string | null>(null)
const ready = ref(false)
let stage: ProductStage | null = null

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

function select(id: string) {
  if (id === props.selectedId) stage?.select(id)
  emit('select', id)
}

onMounted(() => {
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
      onError: () => emit('error')
    })
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
onBeforeUnmount(() => {
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
    <button
      v-if="ready"
      type="button"
      class="tc-stage__reset"
      aria-label="镜头回到街区全景"
      @click="stage?.reset()"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" stroke="currentColor" stroke-width="1.5" />
        <path d="m8 12 4-3 4 3-4 3-4-3Z" stroke="currentColor" stroke-width="1.5" />
      </svg>
      全景
    </button>
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
.tc-stage__reset {
  position: absolute;
  right: 18px;
  bottom: 18px;
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
.tc-stage__label:focus-visible,
.tc-stage__reset:focus-visible {
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
}
@media (prefers-reduced-motion: reduce) {
  .tc-stage__label {
    transition: none;
  }
}
</style>
