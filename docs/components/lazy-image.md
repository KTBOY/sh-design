---
description: Vue3 图片懒加载组件 ShLazyImage：骨架屏占位、视口懒加载、加载失败兜底、loader 接口取图与轮询刷新，适用于列表、卡片、头像墙。
---

# LazyImage 懒加载图片

带骨架屏占位、原生懒加载、加载淡入与**加载失败兜底**的图片组件。失败时默认展示“兜底插图 + 文案”，也可通过插槽完全自定义，适用于列表、卡片、头像墙等业务场景。

<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'

const v = ref(0)
const refresh = () => (v.value += 1)
const seeds = ['forest', 'ocean', 'city', 'desert']
</script>

<div style="margin: 20px 0 8px;">
  <a
    :href="withBase('/components/sk-image-waterfall')"
    style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: linear-gradient(120deg, #2563eb, #3b82f6); color: #fff; font-size: 13px; font-weight: 600; line-height: 1; text-decoration: none; box-shadow: 0 6px 18px -8px rgba(37, 99, 235, 0.6);"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.28 7.53-4.95 6.6a1 1 0 0 1-1.5.11l-2.83-2.83a1 1 0 1 1 1.42-1.42l2 2 4.26-5.68a1 1 0 1 1 1.6 1.22Z"/></svg>
    <span>小程序版 ImageWaterfall →</span>
  </a>
</div>

## 基础用法

组件默认填满父容器，尺寸由父级控制。加载中显示**骨架屏**，加载完成后**淡入**。点击「刷新」会改变图片地址触发重新加载，可直观看到「骨架屏 → 淡入」的过程。

<div class="sh-demo" style="flex-direction: column; align-items: stretch; gap: 16px;">
  <div>
    <button
      style="padding: 6px 14px; border: none; border-radius: 6px; background: var(--vp-c-brand-1); color: #fff; font-size: 13px; cursor: pointer;"
      @click="refresh"
    >刷新</button>
  </div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <div
      v-for="s in seeds"
      :key="s"
      style="width: 150px; height: 110px; border-radius: 8px; overflow: hidden;"
    >
      <ShLazyImage :src="'https://picsum.photos/seed/' + s + '/300/220?v=' + v" :alt="s" />
    </div>
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ShLazyImage } from 'sh-design'

const v = ref(0)
const seeds = ['forest', 'ocean', 'city', 'desert']
</script>

<template>
  <button @click="v++">刷新</button>
  <div v-for="s in seeds" :key="s" style="width: 150px; height: 110px">
    <ShLazyImage :src="`https://picsum.photos/seed/${s}/300/220?v=${v}`" />
  </div>
</template>
```

## 填充方式

通过 `fit` 设置图片填充方式，与 CSS `object-fit` 一致：`fill` / `contain` / `cover` / `none` / `scale-down`。

<div class="sh-demo">
  <div style="width: 140px; height: 140px; border: 1px dashed var(--vp-c-divider)">
    <ShLazyImage src="https://picsum.photos/seed/fit/300/200" fit="contain" />
  </div>
  <div style="width: 140px; height: 140px; border: 1px dashed var(--vp-c-divider)">
    <ShLazyImage src="https://picsum.photos/seed/fit/300/200" fit="cover" />
  </div>
</div>

```vue
<template>
  <ShLazyImage src="..." fit="contain" />
  <ShLazyImage src="..." fit="cover" />
</template>
```

## 圆角

通过 `radius` 设置圆角（数字按 px 处理）。

<div class="sh-demo">
  <div style="width: 150px; height: 150px">
    <ShLazyImage src="https://picsum.photos/seed/radius/300/300" :radius="16" />
  </div>
</div>

```vue
<template>
  <ShLazyImage src="..." :radius="16" />
</template>
```

## 加载失败兜底

当图片加载失败时，默认展示内置的**兜底插图 + 文案**（文案可通过 `error-text` 自定义）。

<div class="sh-demo">
  <div style="width: 220px; height: 150px">
    <ShLazyImage src="https://example.com/does-not-exist.png" error-text="图片走丢了" />
  </div>
</div>

```vue
<template>
  <ShLazyImage src="/broken.png" error-text="图片走丢了" />
</template>
```

## 自定义失败内容

通过 `#error` 插槽完全自定义兜底内容，插槽提供 `src`（兜底图地址）与 `text`（兜底文案）作用域参数。

<div class="sh-demo">
  <div style="width: 240px; height: 160px">
    <ShLazyImage src="https://example.com/does-not-exist.png">
      <template #error="{ src }">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--vp-c-text-2)">
          <img :src="src" style="width:54px;height:54px;object-fit:contain" />
          <span>加载失败，请稍后重试</span>
        </div>
      </template>
    </ShLazyImage>
  </div>
</div>

```vue
<template>
  <ShLazyImage src="/broken.png">
    <template #error="{ src, text }">
      <div class="my-fallback">
        <img :src="src" />
        <span>{{ text }}，请稍后重试</span>
      </div>
    </template>
  </ShLazyImage>
</template>
```

## 进阶用法：接口取图 / 轮询 / 视口懒加载

对接**鉴权图片接口**（返回 Blob）、需要**近实时轮询**或**长列表视口懒加载**时，用 `loader` + `lazy="observer"` + `poll-interval`。`loader` 返回 `Blob` 时组件会自动 `createObjectURL` 并在切换/卸载时回收，无需手动管理内存。

```vue
<script setup lang="ts">
import { ShLazyImage } from 'sh-design'
import { screenshot } from '@/api/screenshot'

const props = defineProps<{ classroomCode: string }>()
</script>

<template>
  <ShLazyImage
    :loader="() => screenshot({ classroomCode: props.classroomCode })"
    lazy="observer"
    :poll-interval="300000"
    keep-previous-on-reload
    placeholder-src="/loading.png"
    @load="({ url }) => console.log('loaded', url)"
    @error="({ error }) => console.warn(error)"
  />
</template>
```

- `keep-previous-on-reload`：轮询刷新时保留上一张图、失败也不闪断。
- `lazy="observer"`：进入视口（含 `root-margin` 预加载）才开始加载，适合长列表 / 大屏。

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `src` | 图片地址（URL 模式；提供 `loader` 时忽略） | `string` | `''` |
| `loader` | 自定义加载器，返回 URL 或 Blob（对接鉴权接口）；Blob 自动创建/回收 objectURL | `() => Promise<string \| Blob>` | `undefined` |
| `alt` | 无障碍描述 | `string` | `''` |
| `fit` | 填充方式（CSS object-fit） | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` |
| `lazy` | 懒加载策略：`true` 原生懒加载 / `'observer'` 视口懒加载 / `false` 立即 | `boolean \| 'observer'` | `true` |
| `root-margin` | 视口懒加载预加载边距（`lazy="observer"` 时） | `string` | `'200px'` |
| `poll-interval` | 轮询刷新间隔（毫秒，loader 模式）；`0` 关闭 | `number` | `0` |
| `keep-previous-on-reload` | 刷新/轮询时保留上一张图，不闪占位 | `boolean` | `false` |
| `skeleton` | 是否显示内置骨架屏 | `boolean` | `true` |
| `placeholder-src` | 加载中占位图（优先级高于骨架屏） | `string` | `''` |
| `radius` | 圆角（数字按 px） | `string \| number` | `0` |
| `width` | 容器宽度（数字按 px；默认撑满） | `string \| number` | `''` |
| `height` | 容器高度（数字按 px；默认撑满） | `string \| number` | `''` |
| `error-text` | 加载失败文案 | `string` | `'加载失败'` |
| `error-src` | 加载失败兜底图（默认内置图） | `string` | `''` |
| `show-error-image` | 失败时是否展示兜底图 | `boolean` | `true` |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `load` | 加载成功 | `({ url: string })` |
| `error` | 加载失败 | `({ error?: Error })` |

### Slots

| 插槽名 | 说明 | 作用域参数 |
| --- | --- | --- |
| `placeholder` | 自定义加载占位（默认骨架屏 / `placeholder-src`） | - |
| `error` | 自定义加载失败内容 | `{ src: string; text: string }` |
| `default` | 叠加在图片上的内容（遮罩等） | - |
