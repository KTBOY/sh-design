---
description: uni-app 凹陷弧形底部导航 sk-tab-bar：v-model 受控、角标/红点、beforeChange 切换拦截、autoRoute 路由联动，适用于小程序自定义 tabBar。
aside: left
---

# sk-tab-bar 凹陷弧形导航

组件形式的凹陷弧形 tabBar：选中项自动上浮进入圆形按钮，凹槽随切换平滑移动。不依赖 `pages.json` 原生 tabBar 配置。支持 **`v-model:current` 受控选中**、**item 级角标（数字 / 红点 / 99+ 上限）**、**`beforeChange` 切换守卫（可做登录拦截）**、**`autoRoute` 路由联动 + `useTabBar` 多页面选中态同步**，以及字体图标与插槽完全自定义。

> 该组件来自 [shukelab](https://github.com/KTBOY/shukelab)（uni-app 跨端组件库），以 `uni_modules` 形式分发，支持 H5 / 微信小程序。
> 下方演示实时内嵌 shukelab 的 **H5 在线构建**，可直接交互；本地联调时 shukelab 跑 `npm run dev:h5`、本站跑 `pnpm docs:dev` 即可热更新预览。

## 在线体验

演示通过手机壳 iframe 实时加载 [shukelab H5 版](https://ktboy.github.io/shukelab/)对应页面，可直接操作。宽屏下停靠在**页面右侧**常驻，随正文滚动自动切换对应示例，也可点击面板内 Tab 手动切换；更宽的屏幕下面板左侧会显示本页目录，点击二维码图标可扫码在手机上打开。窄屏下展示在下方。

<script setup>
const tabbarDemos = [
  { src: '/pages/tabBarDemo/index', title: '基础用法', anchor: '基础用法' },
  { src: '/pages/tabBarDemo/badge', title: '角标红点', anchor: '角标与红点' },
  { src: '/pages/tabBarDemo/control', title: '受控拦截', anchor: '受控与切换拦截' },
  { src: '/pages/tabBarDemo/route-a', title: '路由联动', anchor: '路由联动' }
]
</script>

<UniDemoDock :demos="tabbarDemos" />

## 基础用法

`data` 传入 tab 数据（文字 + 图片图标），`v-model:current` 绑定选中下标。

```vue
<template>
  <sk-tab-bar v-model:current="current" :data="list" @change="onChange" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { SkTabBarItem, SkTabBarChangeEvent } from '@/uni_modules/sk-tab-bar/components/sk-tab-bar/sk-tab-bar.type'
import icon1 from '@/static/66.png'
import icon1Active from '@/static/icon1.png'
import icon2 from '@/static/77.png'
import icon2Active from '@/static/icon2.png'

const current = ref(0)
const list = ref<SkTabBarItem[]>([
  { text: '首页', icon: icon1, active: icon1Active },
  { text: '资源列表', icon: icon2, active: icon2Active }
])

const onChange = (e: SkTabBarChangeEvent) => {
  console.log('切换到：', e.currentIndex, e.text)
}
</script>
```

## 角标与红点

角标配置在每个 item 上，互不影响；数字超过 `badgeMax`（默认 99）显示 `99+`，为 `0` 或空时自动隐藏。

```vue
<sk-tab-bar :data="list" :badge-max="99" />
```

```ts
const list = ref<SkTabBarItem[]>([
  { text: '首页', icon: icon1, active: icon1Active },
  { text: '消息', icon: icon2, active: icon2Active, badge: 128 }, // 显示 99+
  { text: '我的', icon: icon3, active: icon3Active, dot: true }   // 红点
])
```

## 受控与切换拦截

`beforeChange` 返回 `false` 或 `Promise<false>` 时阻止切换，常用于登录校验；也可通过 ref 调用 `switchTo` 编程式切换（会走守卫与事件流程）。

```vue
<sk-tab-bar :data="list" :before-change="beforeChange" />
```

```ts
const beforeChange = async (index: number, item: SkTabBarItem) => {
  if (index === 2 && !isLogin.value) {
    uni.navigateTo({ url: '/pages/login/index' })
    return false
  }
  return true
}
```

## 路由联动

item 配置 `pagePath` 并开启 `autoRoute` 后点击自动跳转；多页面场景配合 `useTabBar` 同步选中态。

```vue
<sk-tab-bar auto-route v-model:current="current" :data="items" @change="e => setCurrent(e.currentIndex)" />
```

```ts
import { useTabBar } from '@/uni_modules/sk-tab-bar/components/sk-tab-bar/use-tab-bar'

// 每个页面调用同一份共享状态
const { current, items, setCurrent } = useTabBar([
  { text: '首页', icon: icon1, active: icon1Active, pagePath: '/pages/home/index', switchMode: 'reLaunch' },
  { text: '我的', icon: icon2, active: icon2Active, pagePath: '/pages/mine/index', switchMode: 'reLaunch' }
])
```

## 自定义内容（插槽）

通过 `item` 作用域插槽完全接管 tab 渲染。

```vue
<sk-tab-bar :data="list">
  <template #item="{ item, index, active }">
    <image :src="active ? item.active : item.icon" style="width: 40px; height: 40px" />
    <text v-if="!active">{{ item.text }}</text>
  </template>
</sk-tab-bar>
```

## 字体图标与主题定制

item 配置 `iconType: 'font'` 后 `icon/active` 传字体图标 class，`width` 作为字号；主题样式全量可配。

```ts
const list = ref<SkTabBarItem[]>([
  { text: '首页', iconType: 'font', icon: 'iconfont icon-home', active: 'iconfont icon-home-fill', width: '48rpx' }
])
```

```vue
<sk-tab-bar
  :data="list"
  background="#1f1f1f"
  text-color="#999"
  active-text-color="#fff"
  icon-background-color="#07c160"
  outer-aperture-border-color="#141414"
  height="130rpx"
  :duration="300"
  placeholder
/>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `SkTabBarItem[]` | `[]` | tab 数据源 |
| `current` | `Number` | `0` | 当前选中下标，支持 `v-model:current` |
| `outerApertureBorderColor` | `String` | `#f2f3f7` | 弧形外光圈颜色，需与页面背景一致 |
| `iconBackgroundColor` | `String` | `rgb(3, 3, 3)` | 选中圆形按钮背景色 |
| `background` | `String` | `#fff` | tabBar 背景色 |
| `textColor` | `String` | `#222` | 文字颜色 |
| `activeTextColor` | `String` | `#222` | 选中文字颜色 |
| `fontSize` | `String` | `26rpx` | 文字字号 |
| `height` | `String` | `120rpx` | tabBar 高度，同时决定圆形按钮直径 |
| `zIndex` | `Number` | `10` | 层级 |
| `duration` | `Number` | `500` | 切换动画时长（ms） |
| `fixed` | `Boolean` | `true` | 是否固定在页面底部 |
| `placeholder` | `Boolean` | `false` | fixed 时是否生成同高占位，防止遮挡页面内容 |
| `badgeMax` | `Number` | `99` | 数字角标上限，超出显示 `badgeMax+` |
| `autoRoute` | `Boolean` | `false` | 点击后是否按 `item.pagePath` 自动跳转 |
| `beforeChange` | `(index, item) => boolean \| Promise<boolean>` | `-` | 切换守卫，返回 `false` 阻止切换 |
| `corner` | `String \| Number` | `-` | ⚠️ 已废弃，请使用 `item.badge` |

### SkTabBarItem

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `String` | `-` | 按钮文字 |
| `icon` | `String` | `-` | 未选中图标（图片地址或字体图标 class） |
| `active` | `String` | `-` | 选中图标（图片地址或字体图标 class） |
| `iconType` | `'image' \| 'font'` | `image` | 图标类型 |
| `width` | `String` | `36px` | 图标宽度（字体图标时作为字号） |
| `height` | `String` | `36px` | 图标高度 |
| `badge` | `String \| Number` | `-` | 角标内容，`0` 或空时隐藏 |
| `dot` | `Boolean` | `false` | 红点角标，优先级高于 badge |
| `disabled` | `Boolean` | `false` | 是否禁用 |
| `pagePath` | `String` | `-` | 页面路径，配合 `autoRoute` 使用 |
| `switchMode` | `'switchTab' \| 'reLaunch' \| 'navigateTo' \| 'redirectTo'` | `reLaunch` | 跳转方式 |
| `cornerMark` | `Boolean` | `-` | ⚠️ 已废弃，请使用 `badge` |

### Events

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| `change` | `SkTabBarChangeEvent`（item 全量字段 + `currentIndex`） | tab 切换后触发 |
| `update:current` | `index: number` | 选中变化，配合 `v-model:current` |

### Slots

| 插槽名 | 作用域参数 | 说明 |
| --- | --- | --- |
| `item` | `{ item, index, active }` | 自定义每个 tab 的内容 |

### Methods（通过 ref 调用）

| 方法名 | 说明 | 参数 |
| --- | --- | --- |
| `switchTo` | 编程式切换，会执行 `beforeChange` 守卫与事件流程 | `index: number` |

## 平台兼容性

| 平台 | 支持 |
| --- | --- |
| H5 | ✅ |
| 微信小程序 | ✅ |
| App | — |

## 相关链接

- 源码与示例：[shukelab](https://github.com/KTBOY/shukelab)
- 组件目录：[sk-tab-bar](https://github.com/KTBOY/shukelab/tree/main/src/uni_modules/sk-tab-bar)
