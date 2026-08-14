---
description: uni-app 左右联动菜单 sk-linkage-menu：吸顶标题、受控选中、异步加载、分组级虚拟列表，适用于分类导航/电商菜单。
---

# sk-linkage-menu 左右联动菜单

左右联动菜单（分类导航）：点击左侧分组，右侧内容区平滑滚动联动；右侧滚动时，左侧菜单高亮反向联动。支持**分组吸顶标题**、**受控选中（`v-model:current`）**、**异步加载后自动重新测量**，以及大数据量下的**分组级虚拟渲染**。

> 该组件来自 [shukelab](https://github.com/KTBOY/shukelab)（uni-app 跨端组件库），以 `uni_modules` 形式分发，支持 H5 / 微信小程序。
> 因依赖 uni-app 运行时，本页为**静态文档**（说明 + API），无法在站内在线实玩；体验请前往插件市场或克隆 shukelab 运行 `npm run dev:h5`。

<div style="margin: 20px 0 8px;">
  <a
    href="https://ext.dcloud.net.cn/plugin?id=22894"
    target="_blank"
    style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; background: linear-gradient(120deg, #2563eb, #3b82f6); color: #fff; font-size: 13px; font-weight: 600; line-height: 1; text-decoration: none; box-shadow: 0 6px 18px -8px rgba(37, 99, 235, 0.6);"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.28 7.53-4.95 6.6a1 1 0 0 1-1.5.11l-2.83-2.83a1 1 0 1 1 1.42-1.42l2 2 4.26-5.68a1 1 0 1 1 1.6 1.22Z"/></svg>
    <span>DCloud 插件市场 →</span>
  </a>
</div>

## 预览

<img src="https://github.com/user-attachments/assets/8fa94ecd-31c7-492e-8cc0-0a6b057f4611" alt="sk-linkage-menu 预览" style="zoom: 33%; border-radius: 12px;" />

## 基础用法

组件默认填满父容器，尺寸由父级控制。左侧为分组菜单，右侧为内容区，通过默认插槽渲染每条数据。

```vue
<template>
  <sk-linkage-menu :list="list" :virtual-menu-height="500">
    <template #default="{ data }">
      <view class="class-item">
        <image :src="data.image" class="item-image" />
        <text class="goods-title">{{ data.name }}</text>
      </view>
    </template>
  </sk-linkage-menu>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MenuDataItem } from '@/uni_modules/sk-linkage-menu/components/sk-linkage-menu/sk-linkage-menu.types'

const list = ref<MenuDataItem[]>([])

onMounted(() => {
  for (let i = 0; i < 20; i++) {
    list.value.push({
      name: `${i} 号分类`,
      id: i,
      data: [
        { name: `商品 ${i}-A`, image: 'https://picsum.photos/seed/a/200/200' },
        { name: `商品 ${i}-B`, image: 'https://picsum.photos/seed/b/200/200' },
      ],
    })
  }
})
</script>
```

## 分组吸顶标题

开启 `showTitle` 后，右侧滚动时当前分组名称吸顶展示，可通过 `title` 插槽自定义。

```vue
<sk-linkage-menu :list="list" :show-title="true">
  <template #title="{ item }">
    <text class="my-title">{{ item.name }}</text>
  </template>
  <template #default="{ data }">
    <view>{{ data.name }}</view>
  </template>
</sk-linkage-menu>
```

## 受控选中

通过 `v-model:current` 受控当前选中分组，点击/滚动/方法调用都会派发 `update:current`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const current = ref(0)
</script>

<template>
  <sk-linkage-menu v-model:current="current" :list="list" />
</template>
```

## 自定义左侧菜单项

通过 `menu` 插槽自定义图标 / 角标，`active` 表示是否选中。

```vue
<sk-linkage-menu :list="list">
  <template #menu="{ item, index, active }">
    <view class="menu-item" :class="{ active }">
      <text>{{ item.name }}</text>
      <text v-if="item.badge" class="badge">{{ item.badge }}</text>
    </view>
  </template>
  <template #default="{ data }">
    <view>{{ data.name }}</view>
  </template>
</sk-linkage-menu>
```

## 程序化跳转 & 异步加载

通过 `ref` 调用 `scrollToIndex` 跳转；数据异步加载完成后组件会**自动重新测量**布局，无需手动处理。

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const menuRef = ref()
const list = ref([])

// 异步加载数据，组件会自动 refresh
onMounted(async () => {
  list.value = await fetchMenuData()
})

// 手动跳转到第 3 个分组
const jump = () => menuRef.value?.scrollToIndex(3)
</script>

<template>
  <sk-linkage-menu ref="menuRef" :list="list" />
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `virtualMenuHeight` | `Number` | 窗口高度 - 44 | 组件可视高度（px） |
| `list` | `MenuDataItem[]` | `[]` | 菜单数据，结构见下方 MenuDataItem |
| `virtual` | `Boolean` | `true` | 分组级虚拟渲染开关，大数据量建议保持开启 |
| `current` | `Number` | `0` | 当前选中菜单下标，支持 `v-model:current` |
| `showTitle` | `Boolean` | `false` | 是否显示右侧分组吸顶标题 |
| `menuWidth` | `String` | `'180rpx'` | 左侧菜单宽度 |
| `scrollWithAnimation` | `Boolean` | `true` | 右侧程序化滚动是否使用动画 |
| `leftBarStyle` | `Object` | `-` | 左侧选中滑块样式 |
| `leftBarUnStyle` | `Object` | `-` | 左侧未选中菜单项样式 |
| `itemHeight` | `Number` | `130` | 已废弃：分组高度改为自动测量，保留仅为兼容旧版 |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `change` | 选中分类变化时触发（点击、滚动、方法调用均会触发） | `{ ...item, index, currenIndex, source }`，source 为 `click` / `scroll` / `method` |
| `update:current` | 选中下标变化，配合 `v-model:current` 使用 | `index: number` |
| `scrolltolower` | 右侧内容区滚动触底，可用于分页加载 | 原生事件对象 |

### Slots

| 插槽名 | 说明 | 作用域参数 |
| --- | --- | --- |
| `default` | 右侧内容项，每条数据渲染一次 | `{ data }`（分组与内容项字段合并） |
| `menu` | 左侧菜单项，可自定义图标/角标 | `{ item, index, active }` |
| `title` | 右侧分组吸顶标题（需开启 showTitle） | `{ item, index }` |
| `empty` | `list` 为空时的占位内容 | `-` |

### Methods（通过 ref 调用）

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `scrollToIndex` | 程序化跳转到指定菜单 | `index: number` |
| `refresh` | 重新测量布局。数据变更后组件会自动调用，插槽内容高度变化（如图片撑高）时可手动调用 | `-` |

### MenuDataItem 类型

| 属性名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `String` | 是 | 左侧菜单名称 |
| `data` | `Array` | 是 | 右侧内容列表 |
| `id` | `Number` / `String` | 建议 | 唯一标识，优先作为渲染 key |

## 平台兼容性

| 平台 | 支持 |
| --- | --- |
| H5 | ✅ |
| 微信小程序 | ✅ |
| App | — |

## 相关链接

- 源码与示例：[shukelab](https://github.com/KTBOY/shukelab)
- 插件市场：[sk-linkage-menu](https://ext.dcloud.net.cn/plugin?id=22894)
