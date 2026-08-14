---
description: 微信小程序瀑布流组件 sk-image-waterfall：预留高度防抖动零 CLS、骨架屏淡入、多列分配、触底加载，纯原生实现无第三方依赖。
---

# ImageWaterfall 图片瀑布流 <Badge type="tip" text="小程序" />

微信小程序通用**图片瀑布流**组件 —— 预留高度防抖动（零 CLS）+ 高端骨架屏 + 淡入 + 多列分配 + 触底加载。不依赖任何第三方库，纯原生 `<image>` 实现，CSS 变量即可主题化。

<p>
  <a href="https://github.com/KTBOY/sk-image-waterfall" target="_blank" rel="noreferrer"><img src="https://img.shields.io/github/stars/KTBOY/sk-image-waterfall?style=flat&logo=github&label=Star&color=2563eb" alt="GitHub" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/sk-image-waterfall" target="_blank" rel="noreferrer"><img src="https://img.shields.io/npm/v/sk-image-waterfall.svg?color=2563eb&label=npm" alt="npm" /></a>&nbsp;
  <a href="https://github.com/KTBOY/sk-image-waterfall" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/仓库-sk--image--waterfall-24292f?logo=github" alt="repo" /></a>
</p>

::: tip 为什么没有在线演示？
这是**微信小程序组件**（基于 `scroll-view` / 原生 `image`），无法在网页中直接运行。下面提供**真机录屏**与**扫码体验**，效果一目了然。
:::

## 效果演示

<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; margin: 16px 0;">
  <div style="flex: 0 1 300px;">
    <img src="/mini-program-demo.gif" alt="瀑布流真机演示" style="width: 100%; border-radius: 12px; border: 1px solid var(--vp-c-divider); box-shadow: 0 12px 32px -12px rgba(15,23,42,.25);" />
    <p style="margin: 8px 0 0; text-align: center; font-size: 13px; color: var(--vp-c-text-2);">真机演示：骨架屏 → 淡入 → 触底加载</p>
  </div>
  <div style="flex: 0 1 240px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 16px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft);">
    <strong style="font-size: 15px;">📱 扫码体验</strong>
    <img src="/shanhu-qrcode.png" alt="微信扫码体验小程序" style="width: 180px; border-radius: 8px;" />
    <span style="font-size: 12px; color: var(--vp-c-text-2); text-align: center;">微信扫一扫，在「珊瑚打码」小程序中体验瀑布流效果</span>
  </div>
</div>

## 特性

- **零布局抖动**：图片返回前用「确定性宽高比」预留高度，加载前后高度一致，彻底消除 CLS 跳动
- **高端骨架屏**：底色 + 斜向流光 + 中心微光，图片加载完成后平滑淡入
- **多列瀑布流**：任意列数（默认 2 列），按「最矮列优先」分配，排布均衡
- **触底加载 & 切换重建**：内置无限滚动事件；切换分类/搜索时整体原子替换并自动回顶
- **加载失败回退**：可配置回退字段（如缩略图），失败自动降级
- **主题化**：CSS 自定义属性控制圆角、间距、骨架配色、标题样式，适配深色/浅色

## 安装

### 方式一：npm（推荐）

```bash
npm i sk-image-waterfall
```

安装后在微信开发者工具执行「工具 → 构建 npm」，然后在页面/组件的 `.json` 注册：

```json
{
  "usingComponents": {
    "image-waterfall": "sk-image-waterfall/image-waterfall/image-waterfall"
  }
}
```

### 方式二：手动拷贝

将仓库的 `image-waterfall/` 目录拷贝到项目 `components/` 下并注册：

```json
{
  "usingComponents": {
    "image-waterfall": "/components/image-waterfall/image-waterfall"
  }
}
```

::: warning 容器高度
组件根节点是 `scroll-view`，高度取父容器。请给它一个确定高度（如 flex 纵向布局中设 `flex: 1; min-height: 0`）。
:::

## 快速使用

```html
<view class="page">
  <image-waterfall
    class="flow"
    list="{{list}}"
    reset-token="{{token}}"
    image-key="url"
    title-key="name"
    bind:itemtap="onItemTap"
    bind:loadmore="onLoadMore"
  >
    <!-- 默认插槽渲染在列表底部：放 loading / 空态 / 没有更多 -->
    <view wx:if="{{loading}}" class="tip">加载中…</view>
  </image-waterfall>
</view>
```

```css
.page { height: 100vh; display: flex; flex-direction: column; }
.flow { flex: 1; min-height: 0; }
```

```js
Page({
  data: { list: [], token: 0, loading: false },

  onLoad() { this.reload() },

  async reload() {
    const data = await fetchData(/* page 1 */)
    // 切换分类/搜索：更新数据并「改变 reset-token」触发重建+回顶
    this.setData({ list: data, token: this.data.token + 1 })
  },

  onLoadMore() {
    // 加载更多：往 list 尾部追加，组件自动增量渲染
    fetchData(/* next page */).then((more) => {
      this.setData({ list: this.data.list.concat(more) })
    })
  },

  onItemTap(e) {
    const item = e.detail.item // 原始数据项
  }
})
```

### 约定（重要）

- **加载更多** → 往 `list` 尾部 `concat` 新数据，`reset-token` 保持不变，组件只渲染新增部分
- **切换分类 / 搜索** → 更新 `list` 的同时**改变 `reset-token`**（如 +1），组件整体重建并回到顶部

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `list` | 数据源，元素为对象或图片 URL 字符串 | `Array` | `[]` |
| `columns` | 列数 | `Number` | `2` |
| `gap` | 间距(rpx)，用于外边距/列间距/卡片下边距 | `Number` | `20` |
| `image-key` | 取图片 URL 的字段名（元素为字符串时忽略） | `String` | `'src'` |
| `fallback-key` | 图片加载失败时回退的字段名 | `String` | `'thumb'` |
| `title-key` | 标题字段名 | `String` | `'title'` |
| `show-title` | 是否展示标题 | `Boolean` | `true` |
| `ratios` | 预留宽高比集合，如 `[0.72, 1, 1.3]`，越多档错落越丰富 | `Array` | 内置 |
| `reset-token` | 值变化即整体重建并回到顶部 | `any` | `0` |
| `lower-threshold` | 触底触发距离(px) | `Number` | `120` |

### Events

| 事件名 | 说明 | `event.detail` |
| --- | --- | --- |
| `itemtap` | 点击某张图 | `{ item, index }`，`item` 为原始数据项 |
| `loadmore` | 滚动触底（父组件取下一页并追加到 `list`） | - |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 渲染在瀑布流底部（滚动容器内），放「加载中 / 空态 / 没有更多」提示 |

### 主题（CSS 变量）

在**父级**给组件设置即可穿透生效：

```css
.flow {
  --wf-radius: 16rpx;
  --wf-card-bg: #0f1526;
  --wf-skeleton-base: #121a2e;
  --wf-skeleton-shine: rgba(255, 255, 255, 0.07);
  --wf-fade: 0.45s;
  --wf-title-color: #cbd5e1;
}
```

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--wf-gap` | 取 `gap` 属性 | 间距 |
| `--wf-radius` | `16rpx` | 卡片圆角 |
| `--wf-card-bg` | `transparent` | 卡片背景 |
| `--wf-card-border` | 无 | 卡片边框 |
| `--wf-skeleton-base` | `#edf0f5` | 骨架底色 |
| `--wf-skeleton-shine` | `rgba(255,255,255,.55)` | 骨架流光色 |
| `--wf-skeleton-glow` | `rgba(0,0,0,.05)` | 骨架中心微光 |
| `--wf-fade` | `.45s` | 图片淡入时长 |
| `--wf-title-color` | `#333` | 标题颜色 |
| `--wf-title-size` | `24rpx` | 标题字号 |

## 源码与反馈

- GitHub 仓库：[KTBOY/sk-image-waterfall](https://github.com/KTBOY/sk-image-waterfall)
- 问题反馈：[提 Issue](https://github.com/KTBOY/sk-image-waterfall/issues)，欢迎 PR 与 ⭐
