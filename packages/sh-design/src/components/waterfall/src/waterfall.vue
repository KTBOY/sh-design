<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { waterfallProps, waterfallEmits } from './waterfall'
import type { WaterfallItemData, WaterfallItemRect } from './waterfall'
import { ShLazyImage } from '../../lazy-image'

defineOptions({ name: 'ShWaterfall' })

const props = defineProps(waterfallProps)
const emit = defineEmits(waterfallEmits)

const container = ref<HTMLElement | null>(null)
const sentinel = ref<HTMLElement | null>(null)

// 视口与滚动状态（经 rAF 节流后写入）。
// window 模式下 scrollTop 为「视口顶到内容区顶」的距离（可为负）。
const viewWidth = ref(0)
const viewHeight = ref(0)
const scrollTop = ref(0)

// 布局结果存普通数组（绕开深层响应式），仅以 layoutVersion 通知视图更新。
// buckets[c] 为第 c 列的矩形列表，列内 y 与 y+h 均单调递增 → 可二分定位可视区。
let buckets: WaterfallItemRect[][] = []
let colHeights: number[] = []
let laidCount = 0
const layoutVersion = ref(0)
const totalHeight = ref(0)

// load-more 触发锁：触发一次后上锁，数据变化 / loading 结束后再解锁
let armed = true

const colWidth = computed(() => {
  const n = Math.max(1, props.cols)
  return Math.max(0, Math.floor((viewWidth.value - props.gap * (n - 1)) / n))
})

/**
 * 布局前预计算卡片高度（防抖动核心）：
 * grid → 固定比例；waterfall → 真实宽高比 > 兜底比例池（按下标取模，前后一致）。
 * 高度一经确定不再改变，图片以 cover 填充，加载前后 0 回流。
 */
function cellHeightOf(index: number, colW: number): number {
  if (props.layout === 'grid') {
    return Math.round(colW * props.gridRatio) + props.extraHeight
  }
  const item = props.items[index]
  if (item && typeof item === 'object') {
    const w = Number(item[props.widthKey])
    const h = Number(item[props.heightKey])
    if (w > 0 && h > 0) return Math.round((colW * h) / w) + props.extraHeight
  }
  const ratios = props.ratios.length ? props.ratios : [1]
  return Math.round(colW * ratios[index % ratios.length]) + props.extraHeight
}

/** 增量布局：只为新增数据计算位置，已有卡片不动 */
function appendLayout(from: number) {
  const colW = colWidth.value
  const n = Math.max(1, props.cols)
  if (colW <= 0) {
    laidCount = props.items.length
    return
  }
  const step = colW + props.gap
  for (let i = from; i < props.items.length; i++) {
    const h = cellHeightOf(i, colW)
    let col: number
    let y: number
    if (props.layout === 'grid') {
      col = i % n
      y = Math.floor(i / n) * (h + props.gap)
    } else {
      // 瀑布流：放入当前最矮列
      col = 0
      for (let c = 1; c < n; c++) {
        if (colHeights[c] < colHeights[col]) col = c
      }
      y = colHeights[col]
    }
    buckets[col].push({ index: i, x: col * step, y, width: colW, height: h })
    colHeights[col] = y + h + props.gap
  }
  laidCount = props.items.length
  let max = 0
  for (let c = 0; c < n; c++) max = Math.max(max, colHeights[c])
  totalHeight.value = Math.max(0, max - props.gap)
  layoutVersion.value++
}

/** 全量重排（数据重置 / 列数、间距、容器宽度变化） */
function rebuild() {
  const n = Math.max(1, props.cols)
  buckets = Array.from({ length: n }, () => [])
  colHeights = new Array(n).fill(0)
  laidCount = 0
  totalHeight.value = 0
  layoutVersion.value++
  appendLayout(0)
}

/** 虚拟列表：每列二分查找首个可视卡片，向后收集到缓冲区下缘为止 */
const visibleRects = computed(() => {
  void layoutVersion.value
  const start = scrollTop.value - props.buffer
  const end = scrollTop.value + viewHeight.value + props.buffer
  const out: WaterfallItemRect[] = []
  for (const bucket of buckets) {
    let lo = 0
    let hi = bucket.length - 1
    let first = bucket.length
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (bucket[mid].y + bucket[mid].height > start) {
        first = mid
        hi = mid - 1
      } else {
        lo = mid + 1
      }
    }
    for (let i = first; i < bucket.length; i++) {
      const r = bucket[i]
      if (r.y >= end) break
      out.push(r)
    }
  }
  return out
})

/** 同步视口尺寸与滚动位置（self 读容器，window 读 getBoundingClientRect） */
function updateScrollState() {
  const el = container.value
  if (!el) return
  if (props.scroller === 'self') {
    scrollTop.value = el.scrollTop
    viewHeight.value = el.clientHeight
  } else {
    scrollTop.value = -el.getBoundingClientRect().top
    viewHeight.value = window.innerHeight
  }
}

/**
 * 触发加载：force 来自底部哨兵（已判定进入视口），否则做几何兜底判断
 * （用于数据变化后「内容不足一屏」的自动续载）。
 */
function maybeLoadMore(force = false) {
  if (!armed || props.loading || props.finished) return
  if (!force) {
    const remain = totalHeight.value - (scrollTop.value + viewHeight.value)
    if (remain >= props.threshold) return
  }
  armed = false
  emit('load-more')
}

// ---------- 滚动监听（驱动虚拟列表），rAF 节流一帧一算 ----------
let rafId = 0
function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    updateScrollState()
    emit('scroll', { scrollTop: scrollTop.value })
  })
}

let scrollTarget: HTMLElement | Window | null = null
function bindScroll() {
  unbindScroll()
  if (props.scroller === 'self') {
    scrollTarget = container.value
    scrollTarget?.addEventListener('scroll', onScroll, { passive: true })
  } else {
    // capture 捕获任意祖先滚动容器的 scroll 事件（scroll 不冒泡）
    scrollTarget = window
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })
  }
}
function unbindScroll() {
  if (!scrollTarget) return
  if (scrollTarget === window) {
    window.removeEventListener('scroll', onScroll, { capture: true })
    window.removeEventListener('resize', onScroll)
  } else {
    scrollTarget.removeEventListener('scroll', onScroll)
  }
  scrollTarget = null
}

// ---------- 触底加载：IntersectionObserver 哨兵，与滚动来源解耦 ----------
let loadIo: IntersectionObserver | null = null
function bindLoadObserver() {
  loadIo?.disconnect()
  loadIo = null
  if (!sentinel.value) return
  loadIo = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        updateScrollState()
        maybeLoadMore(true)
      }
    },
    {
      root: props.scroller === 'self' ? container.value : null,
      rootMargin: `0px 0px ${Math.max(0, props.threshold)}px 0px`
    }
  )
  loadIo.observe(sentinel.value)
}

function srcOf(item: WaterfallItemData): string {
  if (typeof item === 'string') return item
  return item ? String(item[props.srcKey] ?? '') : ''
}

function keyOf(index: number): string | number {
  const item = props.items[index]
  if (item && typeof item === 'object' && item[props.itemKey] != null) {
    return item[props.itemKey] as string | number
  }
  return index
}

function onItemClick(index: number) {
  emit('item-click', { item: props.items[index], index })
}

// 数据变化：同一数组追加 → 增量布局；数组替换 / 变短 → 重建
watch(
  [() => props.items, () => props.items.length],
  ([list, len], [oldList]) => {
    armed = true
    if (list !== oldList || len < laidCount) rebuild()
    else if (len > laidCount) appendLayout(laidCount)
    nextTick(() => {
      updateScrollState()
      maybeLoadMore()
    })
  }
)

// 布局参数变化 → 全量重排
watch(
  [
    () => props.layout,
    () => props.cols,
    () => props.gap,
    () => props.gridRatio,
    () => props.extraHeight,
    () => props.ratios
  ],
  () => {
    rebuild()
    nextTick(() => maybeLoadMore())
  }
)

// loading 结束 / finished 复位后解锁，并补一次检查（内容不足一屏时自动续载）
watch([() => props.loading, () => props.finished], ([loading, finished]) => {
  if (!loading && !finished) {
    armed = true
    nextTick(() => {
      updateScrollState()
      maybeLoadMore()
    })
  }
})

// 滚动模式切换 → 重新绑定监听与哨兵
watch(
  [() => props.scroller, () => props.threshold],
  () => {
    bindScroll()
    bindLoadObserver()
    nextTick(updateScrollState)
  }
)

function measure() {
  const el = container.value
  if (!el) return
  viewWidth.value = el.clientWidth
  updateScrollState()
}

let ro: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  measure()
  rebuild()
  bindScroll()
  bindLoadObserver()
  nextTick(() => maybeLoadMore())
  ro = new ResizeObserver(() => {
    const el = container.value
    if (!el) return
    if (el.clientHeight !== viewHeight.value) updateScrollState()
    if (el.clientWidth !== viewWidth.value) {
      // 宽度变化才需要重排，防抖合并连续 resize
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        measure()
        rebuild()
        nextTick(() => maybeLoadMore())
      }, 120)
    }
  })
  ro.observe(container.value!)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  loadIo?.disconnect()
  loadIo = null
  unbindScroll()
  if (rafId) cancelAnimationFrame(rafId)
  clearTimeout(resizeTimer)
})

defineExpose({
  /** 手动全量重排 */
  relayout: () => {
    measure()
    rebuild()
  },
  /** 滚动到指定位置（如切换分类后回顶）。window 模式请直接操作页面滚动 */
  scrollTo: (top: number, smooth = false) => {
    container.value?.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
  },
  /** 主动检查是否需要触发 load-more */
  check: () => {
    updateScrollState()
    maybeLoadMore()
  }
})
</script>

<template>
  <div
    ref="container"
    class="sh-waterfall"
    :class="{ 'sh-waterfall--window': scroller === 'window', 'sh-waterfall--animate': animate }"
  >
    <!-- 空状态 / 首次加载 -->
    <div v-if="!items.length" class="sh-waterfall__empty">
      <template v-if="loading">
        <slot name="loading">
          <span class="sh-waterfall__spinner" />
          <span>{{ loadingText }}</span>
        </slot>
      </template>
      <slot v-else name="empty">{{ emptyText }}</slot>
    </div>

    <template v-else>
      <!-- 内容区：显式高度撑开滚动条，卡片绝对定位 + translate3d（GPU 合成） -->
      <div class="sh-waterfall__body" :style="{ height: `${totalHeight}px` }">
        <div
          v-for="rect in visibleRects"
          :key="keyOf(rect.index)"
          class="sh-waterfall__item"
          :style="{
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`
          }"
          @click="onItemClick(rect.index)"
        >
          <!-- 入场动画作用在内层，不与外层定位 transform 冲突 -->
          <div class="sh-waterfall__card">
            <slot
              name="item"
              :item="items[rect.index]"
              :index="rect.index"
              :width="rect.width"
              :height="rect.height"
            >
              <ShLazyImage
                :src="srcOf(items[rect.index])"
                lazy="observer"
                :root-margin="`${buffer}px`"
                fit="cover"
                :radius="radius"
              />
            </slot>
          </div>
        </div>
      </div>

      <!-- 底部状态：位于内容区之后，随内容自然滚动 -->
      <div v-if="loading || finished" class="sh-waterfall__footer">
        <template v-if="loading">
          <slot name="loading">
            <span class="sh-waterfall__spinner" />
            <span>{{ loadingText }}</span>
          </slot>
        </template>
        <slot v-else name="finished">{{ finishedText }}</slot>
      </div>
    </template>

    <!-- 触底哨兵：进入视口即触发 load-more（IntersectionObserver） -->
    <div ref="sentinel" class="sh-waterfall__sentinel" aria-hidden="true" />
  </div>
</template>

<style scoped>
.sh-waterfall {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  /* 预留滚动条位置，防止滚动条出现/消失导致列宽跳变 */
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}

/* window 模式：自身不滚动，高度由内容自然撑开，跟随页面/祖先容器滚动 */
.sh-waterfall--window {
  height: auto;
  overflow: visible;
  scrollbar-gutter: auto;
}

.sh-waterfall__body {
  position: relative;
  width: 100%;
}

.sh-waterfall__item {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.sh-waterfall__card {
  width: 100%;
  height: 100%;
}

/* 入场动画：上滑 + 回弹；虚拟列表滚动时新进入的卡片挂载即重放 */
.sh-waterfall--animate .sh-waterfall__card {
  animation: sh-waterfall-in 0.45s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 列数/布局切换时已有卡片平滑归位 */
.sh-waterfall--animate .sh-waterfall__item {
  transition:
    transform 0.3s ease,
    width 0.3s ease,
    height 0.3s ease;
}

.sh-waterfall__sentinel {
  width: 100%;
  height: 1px;
  margin-top: -1px;
  pointer-events: none;
}

.sh-waterfall__footer,
.sh-waterfall__empty {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  font-size: var(--sh-font-size-sm);
  color: var(--sh-color-text-secondary);
}

.sh-waterfall__empty {
  padding: 48px 0;
}

.sh-waterfall__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--sh-color-border);
  border-top-color: var(--sh-color-primary);
  border-radius: 50%;
  animation: sh-waterfall-spin 0.8s linear infinite;
}

@keyframes sh-waterfall-in {
  0% {
    opacity: 0;
    transform: translateY(160px);
  }
  70% {
    opacity: 1;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sh-waterfall-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
