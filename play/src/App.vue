<script setup lang="ts">
import { ref } from 'vue'

const log = ref<string[]>([])

// ---------- 瀑布流演示 ----------
interface Card {
  id: number
  src: string
  width: number
  height: number
  title: string
}

const layout = ref<'waterfall' | 'grid'>('waterfall')
const scroller = ref<'self' | 'window'>('self')
const animate = ref(true)
const cols = ref(3)
const items = ref<Card[]>([])
const loading = ref(false)
const finished = ref(false)
let page = 0
const PAGE_SIZE = 20
const TOTAL = 120

// 模拟分页接口：返回带真实宽高的图片数据
function fetchPage(p: number): Promise<Card[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list: Card[] = []
      for (let i = 0; i < PAGE_SIZE; i++) {
        const id = p * PAGE_SIZE + i
        if (id >= TOTAL) break
        const w = 400
        const h = 300 + ((id * 97) % 400) // 伪随机高度，可复现
        list.push({
          id,
          src: `https://picsum.photos/seed/sh-${id}/${w}/${h}`,
          width: w,
          height: h,
          title: `卡片 #${id}`
        })
      }
      resolve(list)
    }, 600)
  })
}

async function onLoadMore() {
  loading.value = true
  const list = await fetchPage(page++)
  items.value.push(...list)
  loading.value = false
  if (items.value.length >= TOTAL) finished.value = true
}

function resetList() {
  page = 0
  items.value = []
  finished.value = false
}

function onItemClick(payload: { item: unknown; index: number }) {
  log.value.unshift(`🖼️ 点击了第 ${payload.index} 张图`)
}
</script>

<template>
  <div class="play">
    <h1>sh-design · playground</h1>
    <p class="hint">在这里快速开发与调试组件。修改 packages/sh-design/src 会实时生效。</p>

    <h2>Waterfall 瀑布流</h2>
    <section>
      <button :class="{ on: layout === 'waterfall' }" @click="layout = 'waterfall'">瀑布流</button>
      <button :class="{ on: layout === 'grid' }" @click="layout = 'grid'">网格</button>
      <button v-for="n in [2, 3, 4]" :key="n" :class="{ on: cols === n }" @click="cols = n">
        {{ n }} 列
      </button>
      <button :class="{ on: scroller === 'self' }" @click="scroller = 'self'">容器滚动</button>
      <button :class="{ on: scroller === 'window' }" @click="scroller = 'window'">页面滚动</button>
      <button :class="{ on: animate }" @click="animate = !animate">动画{{ animate ? '开' : '关' }}</button>
      <button @click="resetList">重置</button>
      <span class="hint">已加载 {{ items.length }} 条</span>
    </section>
    <div class="waterfall-box" :class="{ 'is-window': scroller === 'window' }">
      <ShWaterfall
        :items="items"
        :layout="layout"
        :scroller="scroller"
        :animate="animate ? { distance: 90, stagger: 50 } : false"
        :cols="cols"
        :gap="12"
        :loading="loading"
        :finished="finished"
        :extra-height="30"
        @load-more="onLoadMore"
        @item-click="onItemClick"
      >
        <template #item="{ item, height }">
          <div class="card">
            <ShLazyImage
              :src="item.src"
              lazy="observer"
              fit="cover"
              :radius="8"
              :height="height - 30"
            />
            <div class="card-title">{{ item.title }}</div>
          </div>
        </template>
      </ShWaterfall>
    </div>

    <h2>事件日志</h2>
    <ul>
      <li v-for="(item, i) in log" :key="i">{{ item }}</li>
      <li v-if="log.length === 0" class="hint">（点击上方按钮试试）</li>
    </ul>
  </div>
</template>

<style>
body {
  margin: 0;
}
.play {
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
  color: #1f2937;
}
.play section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}
.play .hint {
  color: #6b7280;
}
.play ul {
  padding-left: 18px;
}
.play section button {
  padding: 4px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.play section button.on {
  border-color: #3b82f6;
  color: #3b82f6;
}
.waterfall-box {
  height: 560px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
/* 页面滚动模式：不限高，组件自然撑开跟随页面滚动 */
.waterfall-box.is-window {
  height: auto;
  overflow: visible;
}
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.card-title {
  height: 30px;
  line-height: 30px;
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
