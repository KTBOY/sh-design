<script setup lang="ts">
import { onActivated, onDeactivated, ref, shallowReactive } from 'vue'
import { ShWaterfall } from 'sh-design'

interface Card {
  id: number
  title: string
  hue: number
}

const TOTAL = 120
const PAGE_SIZE = 20

const items = shallowReactive<Card[]>([])
const loading = ref(false)
const finished = ref(false)
let page = 0

// keep-alive 失活守卫：失活期间禁止翻页（精确复刻 headcount 的 useCardWaterfall 场景）
const active = ref(true)
onActivated(() => (active.value = true))
onDeactivated(() => (active.value = false))

function makePage(p: number): Card[] {
  const list: Card[] = []
  for (let i = 0; i < PAGE_SIZE; i++) {
    const id = p * PAGE_SIZE + i
    if (id >= TOTAL) break
    list.push({ id, title: `卡片 #${id}`, hue: (id * 47) % 360 })
  }
  return list
}

async function onLoadMore() {
  // 复现关键：失活态下的那次 load-more 被直接吞掉——loading 不翻转、items 不追加
  if (!active.value || loading.value || finished.value) return
  loading.value = true
  await new Promise((r) => setTimeout(r, 400))
  if (!active.value) {
    loading.value = false
    return
  }
  items.push(...makePage(page++))
  loading.value = false
  if (items.length >= TOTAL) finished.value = true
}
</script>

<template>
  <div class="list-box">
    <ShWaterfall
      :items="items"
      scroller="self"
      :cols="3"
      :gap="12"
      :loading="loading"
      :finished="finished"
      :extra-height="0"
      :grid-ratio="0.7"
      :animate="false"
      @load-more="onLoadMore"
    >
      <template #item="{ item, height }">
        <div class="cell" :style="{ height: `${height}px`, background: `hsl(${item.hue} 72% 90%)` }">
          <span class="cell-title">{{ item.title }}</span>
        </div>
      </template>
      <template #footer="{ loading, finished }">
        <span v-if="loading">加载中…</span>
        <span v-else-if="finished">—— 已经到底了 ——</span>
        <span v-else>共 {{ TOTAL }} 条，已显示 {{ items.length }} 条，向下滚动加载更多</span>
      </template>
    </ShWaterfall>
  </div>
</template>

<style scoped>
.list-box {
  height: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.cell {
  display: flex;
  align-items: flex-end;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 8px;
}
.cell-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}
</style>
