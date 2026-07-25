# SeamlessScroll 无缝滚动

高性能的**无缝循环滚动**容器，适用于大屏看板、公告轮播、榜单、合作伙伴 Logo 墙等场景。

::: tip 为什么流畅
动画循环**完全绕开 Vue 响应式**（每帧直接写 `transform`，组件零重渲染）、`translate3d` 走 GPU 合成、速度按 **px/秒** 计算与刷新率无关、离开视口自动暂停（`IntersectionObserver`）、内容尺寸变化自动重测（`ResizeObserver`）。
:::

<script setup>
import { ref } from 'vue'

const news = [
  '🎉 sh-design 0.0.4 发布：新增 SeamlessScroll 无缝滚动',
  '📈 ShLazyImage 支持 loader / 视口懒加载 / 轮询刷新',
  '🚀 文档站已部署至 GitHub Pages，欢迎 Star',
  '🧩 组件按需引入，全量 gzip 仅 ~9KB',
  '🔧 发布流程支持 OIDC Trusted Publishing'
]
const logos = ['Vue', 'Vite', 'TypeScript', 'VitePress', 'pnpm', 'ESLint', 'Prettier']
const active = ref(true)
const speed = ref(40)
</script>

## 基础用法

组件尺寸由父容器决定；把列表放进默认插槽即可，内容超出容器时自动开始滚动，**悬停暂停**（默认开启）。

<div class="sh-demo" style="display:block">
  <div style="height: 150px; width: 320px; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 0 12px;">
    <ShSeamlessScroll :speed="40">
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li v-for="item in news" :key="item" style="padding: 9px 0; font-size: 13px; border-bottom: 1px dashed var(--vp-c-divider);">{{ item }}</li>
      </ul>
    </ShSeamlessScroll>
  </div>
</div>

```vue
<script setup lang="ts">
import { ShSeamlessScroll } from 'sh-design'

const news = ['公告一', '公告二', '公告三', '公告四', '公告五']
</script>

<template>
  <div style="height: 150px">
    <ShSeamlessScroll :speed="40">
      <ul>
        <li v-for="item in news" :key="item">{{ item }}</li>
      </ul>
    </ShSeamlessScroll>
  </div>
</template>
```

## 横向滚动

`direction` 支持 `up` / `down` / `left` / `right`。横向时插槽内容需要是横向布局（如 `display: flex`）。本例内容未超出容器，所以用 `force` 强制滚动。

<div class="sh-demo" style="display:block">
  <div style="height: 44px; border: 1px solid var(--vp-c-divider); border-radius: 8px;">
    <ShSeamlessScroll direction="left" :speed="60" force>
      <div style="display: flex; gap: 12px; padding: 8px 6px;">
        <span v-for="l in logos" :key="l" style="flex: none; padding: 4px 14px; border-radius: 999px; background: var(--vp-c-bg-soft); font-size: 13px;">{{ l }}</span>
      </div>
    </ShSeamlessScroll>
  </div>
</div>

```vue
<template>
  <div style="height: 44px">
    <ShSeamlessScroll direction="left" :speed="60" force>
      <div style="display: flex; gap: 12px">
        <span v-for="l in logos" :key="l">{{ l }}</span>
      </div>
    </ShSeamlessScroll>
  </div>
</template>
```

## 步进滚动

`single-step` 设置为一行的高度，即可实现「滚一行 → 停一会」的公告栏效果，停顿时长由 `single-wait` 控制。

<div class="sh-demo" style="display:block">
  <div style="height: 38px; width: 320px; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 0 12px;">
    <ShSeamlessScroll :speed="120" :single-step="38" :single-wait="1500">
      <div>
        <div v-for="item in news" :key="item" style="height: 38px; line-height: 38px; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ item }}</div>
      </div>
    </ShSeamlessScroll>
  </div>
</div>

```vue
<template>
  <!-- 每行 38px：滚 38px 停 1.5s -->
  <div style="height: 38px">
    <ShSeamlessScroll :speed="120" :single-step="38" :single-wait="1500">
      <div v-for="item in news" :key="item" style="height: 38px">{{ item }}</div>
    </ShSeamlessScroll>
  </div>
</template>
```

## 启停与调速

`active` 可动态启停；`speed` 是 px/秒，可实时调整。

<div class="sh-demo" style="display:block">
  <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
    <button
      style="padding: 6px 14px; border: none; border-radius: 6px; background: var(--vp-c-brand-1); color: #fff; font-size: 13px; cursor: pointer;"
      @click="active = !active"
    >{{ active ? '暂停' : '继续' }}</button>
    <label style="font-size: 13px; display: flex; align-items: center; gap: 6px;">
      速度 {{ speed }} px/s
      <input v-model.number="speed" type="range" min="10" max="200" />
    </label>
  </div>
  <div style="height: 120px; width: 320px; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 0 12px;">
    <ShSeamlessScroll :active="active" :speed="speed" :hover-pause="false">
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li v-for="item in news" :key="item" style="padding: 8px 0; font-size: 13px; border-bottom: 1px dashed var(--vp-c-divider);">{{ item }}</li>
      </ul>
    </ShSeamlessScroll>
  </div>
</div>

```vue
<template>
  <button @click="active = !active">{{ active ? '暂停' : '继续' }}</button>
  <div style="height: 120px">
    <ShSeamlessScroll :active="active" :speed="speed" :hover-pause="false">
      <ul>...</ul>
    </ShSeamlessScroll>
  </div>
</template>
```

## 悬停滚轮手动滚动

开启 `wheel` 后，鼠标悬停（自动滚动已暂停）时可用**滚轮上下翻看**，滚到头会无缝循环衔接；离开后从当前位置继续自动滚。悬停期间页面不会跟着滚动。

<div class="sh-demo" style="display:block">
  <div style="height: 150px; width: 320px; border: 1px solid var(--vp-c-divider); border-radius: 8px; padding: 0 12px;">
    <ShSeamlessScroll :speed="40" wheel>
      <ul style="margin: 0; padding: 0; list-style: none;">
        <li v-for="item in news" :key="item" style="padding: 9px 0; font-size: 13px; border-bottom: 1px dashed var(--vp-c-divider);">{{ item }}</li>
      </ul>
    </ShSeamlessScroll>
  </div>
</div>

```vue
<template>
  <div style="height: 150px">
    <ShSeamlessScroll :speed="40" wheel>
      <ul>...</ul>
    </ShSeamlessScroll>
  </div>
</template>
```

## 与 vue3-seamless-scroll 的差异

| | vue3-seamless-scroll | ShSeamlessScroll |
| --- | --- | --- |
| 每帧更新方式 | 响应式 `offset` → 组件重渲染 | 直接写 DOM `transform`，零重渲染 |
| 合成方式 | `translateY` + transition 叠加 | `translate3d` + `will-change`，纯 GPU 合成 |
| 速度基准 | px/帧（高刷屏更快） | px/秒（任何刷新率一致） |
| 离屏行为 | 持续滚动 | `IntersectionObserver` 自动暂停 |
| 内容变化 | 需手动调 `reset/add/remove` | `ResizeObserver` 自动重测 |
| 数据传入 | `list` prop + 作用域插槽 | 直接写默认插槽，自由布局 |

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `direction` | 滚动方向 | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` |
| `speed` | 滚动速度（px/秒，与刷新率无关） | `number` | `40` |
| `active` | 是否滚动（可动态启停） | `boolean` | `true` |
| `hover-pause` | 鼠标悬停时暂停 | `boolean` | `true` |
| `wheel` | 悬停时允许滚轮手动滚动（建议搭配 `hover-pause`） | `boolean` | `false` |
| `force` | 内容未超出容器时也强制滚动 | `boolean` | `false` |
| `single-step` | 单步滚动距离（px），`> 0` 启用步进模式 | `number` | `0` |
| `single-wait` | 步进模式每步停顿时长（ms） | `number` | `1000` |
| `delay` | 开始滚动前的延迟（ms） | `number` | `0` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `loop` | 完整滚过一轮内容时触发 | `(count: number)` 累计轮数 |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 滚动内容（组件会自动复制以实现无缝衔接） |

### Expose

| 方法 | 说明 |
| --- | --- |
| `reset()` | 回到起点并清零轮数 |

::: warning 使用注意
- 组件自身 `width/height: 100%`，**父容器必须有确定的尺寸**；
- 插槽内容会被复制 1~N 份用于无缝衔接，**避免在插槽内使用带唯一 id 的元素**；
- 内容未超出容器时默认不滚动（避免无意义动画），需要时用 `force` 强制开启。
:::
