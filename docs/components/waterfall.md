---
description: Vue3 瀑布流组件 ShWaterfall：虚拟列表 + 触底分页无限滚动，零抖动预留高度，支持瀑布流/网格双布局、图片懒加载，适用于图片流、商品流、内容 Feed。
---

# Waterfall 瀑布流

高性能**虚拟瀑布流 / 网格**容器：内置 [ShLazyImage](/components/lazy-image) 懒加载、触底分页加载、双滚动模式，专为图片流、商品流、内容 Feed 设计。

::: tip 为什么不抖动、为什么快
**零抖动** —— 卡片高度在布局阶段一次性确定（真实宽高比 → 兜底比例池按下标取模），图片以 `cover` 填充，加载前后 0 回流；`scrollbar-gutter: stable` 防止滚动条出现引起列宽跳变。
**高性能** —— 布局数据绕开深层响应式；虚拟列表每列**二分查找**可视区间，滚动 rAF 节流一帧一算；卡片绝对定位 + `translate3d` GPU 合成；分页追加走**增量布局**，已有卡片不重排。
**可靠触底** —— 加载更多基于 `IntersectionObserver` 哨兵，与滚动来源解耦，容器滚动 / 页面滚动都能触发；内容不足一屏自动续载首屏。
:::

<script setup>
import { ref } from 'vue'

const layout = ref('waterfall')
const cols = ref(3)
const items = ref([])
const loading = ref(false)
const finished = ref(false)
let page = 0
const PAGE_SIZE = 20
const TOTAL = 80

function fetchPage(p) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = []
      for (let i = 0; i < PAGE_SIZE; i++) {
        const id = p * PAGE_SIZE + i
        if (id >= TOTAL) break
        const w = 400
        const h = 300 + ((id * 97) % 400)
        list.push({ id, src: `https://picsum.photos/seed/sh-${id}/${w}/${h}`, width: w, height: h, title: `卡片 #${id}` })
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
</script>

## 基础用法

传入 `items`，监听 `load-more` 加载下一页（追加进数组即可，组件做**增量布局**）；用 `loading` / `finished` 控制底部状态。默认插槽缺省时，组件直接用 `ShLazyImage` 渲染图片。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
    <button class="sh-doc-btn" :class="{ on: layout === 'waterfall' }" @click="layout = 'waterfall'">瀑布流</button>
    <button class="sh-doc-btn" :class="{ on: layout === 'grid' }" @click="layout = 'grid'">网格</button>
    <button v-for="n in [2, 3, 4]" :key="n" class="sh-doc-btn" :class="{ on: cols === n }" @click="cols = n">{{ n }} 列</button>
    <span style="color: var(--vp-c-text-2); font-size: 13px; line-height: 26px;">已加载 {{ items.length }} 条</span>
  </div>
  <div style="height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden;">
    <ShWaterfall
      :items="items"
      :layout="layout"
      :cols="cols"
      :gap="12"
      :loading="loading"
      :finished="finished"
      @load-more="onLoadMore"
    />
  </div>
</div>

<style>
.sh-doc-btn { padding: 3px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; font-size: 13px; }
.sh-doc-btn.on { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
</style>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ShWaterfall } from 'sh-design'

const items = ref<any[]>([])
const loading = ref(false)
const finished = ref(false)
let page = 0

async function onLoadMore() {
  loading.value = true
  const list = await api.fetchList(page++) // [{ id, src, width, height }]
  items.value.push(...list)
  loading.value = false
  if (list.length === 0) finished.value = true
}
</script>

<template>
  <!-- 默认 scroller="self"：由父容器给定高度，组件内部滚动 -->
  <div style="height: 600px">
    <ShWaterfall
      :items="items"
      :cols="3"
      :gap="12"
      :loading="loading"
      :finished="finished"
      @load-more="onLoadMore"
    />
  </div>
</template>
```

## 自定义卡片（#item 插槽）

`#item` 插槽提供 `{ item, index, width, height }`。卡片有图片下方的固定区域（标题/操作栏）时，用 `extra-height` 告知组件，布局时会为每张卡片预留该高度。

```vue
<ShWaterfall :items="items" :cols="3" :extra-height="34" @load-more="onLoadMore">
  <template #item="{ item, height }">
    <div class="card">
      <ShLazyImage :src="item.src" lazy="observer" fit="cover" :radius="8" :height="height - 34" />
      <div class="card-title">{{ item.title }}</div>
    </div>
  </template>
</ShWaterfall>
```

## 双滚动模式

- `scroller="self"`（默认）：组件自身是滚动容器，需要父级给定高度——适合后台工作区、弹窗、固定面板。
- `scroller="window"`：组件自然撑开、不产生内部滚动条，跟随页面（或任意祖先滚动容器）滚动——适合 C 端长页 Feed 流。

两种模式的触底加载都由 `IntersectionObserver` 哨兵驱动，虚拟列表照常工作。

```vue
<!-- 页面滚动模式：无需给高度 -->
<ShWaterfall scroller="window" :items="items" :cols="2" @load-more="onLoadMore" />
```

## 网格布局

`layout="grid"` 切换为等高网格，单元格比例由 `grid-ratio`（height / width）控制，如 `1` 为正方形、`0.75` 为 4:3 横图。

```vue
<ShWaterfall layout="grid" :grid-ratio="0.75" :items="items" :cols="4" @load-more="onLoadMore" />
```

## 零抖动的高度策略

按优先级取卡片高度，**布局时一次定死，加载前后不变**：

1. 数据带真实尺寸（`width` / `height` 字段，字段名可用 `width-key` / `height-key` 改）→ 按真实宽高比精确计算，与图片完全一致；
2. 没有尺寸 → 从 `ratios` 比例池按**下标取模**取值（确定性：重排/回看结果一致），图片 `cover` 填充。

> 建议接口尽量返回图片原始宽高（大多图床/OSS 都有），可获得像素级还原的瀑布流。

## 入场动画

默认开启 `animate`：新进入视口的卡片上滑 + 回弹入场，列数/布局切换时已有卡片平滑归位。追求极简可关闭：

```vue
<ShWaterfall :animate="false" :items="items" />
```

## 底部与空状态自定义

文案用属性改：`loading-text` / `finished-text` / `empty-text`；结构用插槽换：

```vue
<ShWaterfall :items="items" :loading="loading" :finished="finished" @load-more="onLoadMore">
  <template #loading><MySpinner /> 拼命加载中</template>
  <template #finished>—— 我也是有底线的 ——</template>
  <template #empty><MyEmpty description="什么都没有" /></template>
</ShWaterfall>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `items` | 数据列表（对象或图片 URL 字符串），分页时往数组追加即可 | `(object \| string)[]` | `[]` |
| `layout` | 布局模式 | `'waterfall' \| 'grid'` | `'waterfall'` |
| `cols` | 列数 | `number` | `2` |
| `gap` | 卡片间距（px） | `number` | `12` |
| `scroller` | 滚动容器：`self` 组件内滚动（父级给高度）/ `window` 跟随页面滚动 | `'self' \| 'window'` | `'self'` |
| `loading` | 是否加载中（触底后不重复触发） | `boolean` | `false` |
| `finished` | 是否已全部加载完 | `boolean` | `false` |
| `animate` | 卡片入场动画（上滑回弹） | `boolean` | `true` |
| `src-key` | 图片地址字段名（默认渲染时用） | `string` | `'src'` |
| `item-key` | 唯一 key 字段名（虚拟列表节点复用） | `string` | `'id'` |
| `width-key` / `height-key` | 原始宽/高字段名，存在时按真实比例零抖动布局 | `string` | `'width'` / `'height'` |
| `ratios` | 无真实宽高时的兜底比例池（height/width），按下标取模 | `number[]` | `[0.75, 0.9, 1, 1.2, 1.35]` |
| `grid-ratio` | grid 布局单元格比例（height/width） | `number` | `1` |
| `extra-height` | 每张卡片的额外固定高度（如标题区，px） | `number` | `0` |
| `buffer` | 视口外额外渲染缓冲（px） | `number` | `300` |
| `threshold` | 哨兵提前量（px），距底部多远触发加载 | `number` | `200` |
| `radius` | 默认渲染 ShLazyImage 的圆角 | `string \| number` | `8` |
| `loading-text` / `finished-text` / `empty-text` | 底部/空状态文案 | `string` | — |

### Events

| 事件 | 说明 | 参数 |
| --- | --- | --- |
| `load-more` | 触底（或内容不足一屏）时触发，在此加载下一页 | — |
| `item-click` | 点击卡片 | `{ item, index }` |
| `scroll` | 滚动（rAF 节流） | `{ scrollTop }` |

### Slots

| 插槽 | 说明 | 作用域参数 |
| --- | --- | --- |
| `item` | 自定义卡片内容，缺省渲染 `ShLazyImage` | `{ item, index, width, height }` |
| `loading` | 底部加载中内容 | — |
| `finished` | 底部加载完成内容 | — |
| `empty` | 空数据内容 | — |

### Expose

| 方法 | 说明 |
| --- | --- |
| `relayout()` | 手动全量重排 |
| `scrollTo(top, smooth?)` | 滚动到指定位置（`self` 模式） |
| `check()` | 主动检查是否需要触发 `load-more` |
