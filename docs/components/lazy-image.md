# LazyImage 懒加载图片

带骨架屏占位、原生懒加载、加载淡入与**加载失败兜底**的图片组件。失败时默认展示"兜底插图 + 文案"，也可通过插槽完全自定义，适用于列表、卡片、头像墙等业务场景。

<script setup>
import { ref } from 'vue'

const v = ref(0)
const refresh = () => (v.value += 1)
const seeds = ['forest', 'ocean', 'city', 'desert']
</script>

## 基础用法

组件默认填满父容器，尺寸由父级控制。加载中显示**骨架屏**，加载完成后**淡入**。点击「刷新」会改变图片地址触发重新加载，可直观看到「骨架屏 → 淡入」的过程。

<div class="sh-demo" style="flex-direction: column; align-items: stretch; gap: 16px;">
  <div>
    <button
      style="padding: 6px 14px; border: none; border-radius: 6px; background: var(--vp-c-brand-1); color: #fff; font-size: 13px; cursor: pointer;"
      @click="refresh"
    >🔄 刷新重新加载</button>
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
// 改变 src（这里用查询参数 ?v= 破缓存）即可触发组件重新加载，展示骨架屏
</script>

<template>
  <button @click="v++">🔄 刷新</button>
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

## API

### Props

| 属性              | 说明                             | 类型                                              | 默认值    |
| ----------------- | -------------------------------- | ------------------------------------------------- | --------- |
| `src`             | 图片地址                         | `string`                                          | `''`      |
| `alt`             | 无障碍描述                       | `string`                                          | `''`      |
| `fit`             | 填充方式（CSS object-fit）       | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` |
| `lazy`            | 是否启用原生懒加载               | `boolean`                                         | `true`    |
| `radius`          | 圆角（数字按 px 处理）           | `string \| number`                                | `0`       |
| `width`           | 容器宽度（数字按 px；默认撑满）  | `string \| number`                                | `''`      |
| `height`          | 容器高度（数字按 px；默认撑满）  | `string \| number`                                | `''`      |
| `error-text`      | 加载失败时的文案                 | `string`                                          | `'加载失败'` |
| `error-src`       | 加载失败时的兜底图（默认内置图） | `string`                                          | `''`      |
| `show-error-image`| 失败时是否展示兜底图             | `boolean`                                         | `true`    |

### Events

| 事件名  | 说明             | 回调参数        |
| ------- | ---------------- | --------------- |
| `load`  | 图片加载成功触发 | `(e: Event)`    |
| `error` | 图片加载失败触发 | `(e: Event)`    |

### Slots

| 插槽名        | 说明                       | 作用域参数                          |
| ------------- | -------------------------- | ----------------------------------- |
| `placeholder` | 自定义加载占位（默认骨架屏）| -                                   |
| `error`       | 自定义加载失败内容         | `{ src: string; text: string }`     |
| `default`     | 叠加在图片上的内容（遮罩等）| -                                   |
