<div align="center">

<!-- Wordmark: black strokes for light theme, white strokes for dark theme -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/public/logo-bark-dark.png" />
  <img src="docs/public/logo-bark.png" alt="sh-design" width="380" />
</picture>

**面向业务场景的 Vue 3 组件库** — 功能性、开箱即用、TypeScript 友好
<br/>
<sub>A functional & business-oriented Vue 3 component library</sub>

<p>
  <a href="https://www.npmjs.com/package/sh-design"><img src="https://img.shields.io/npm/v/sh-design.svg?color=2563eb&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/sh-design"><img src="https://img.shields.io/npm/dm/sh-design.svg?color=2563eb" alt="npm downloads" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/sh-design.svg?color=2563eb" alt="license" /></a>
  <a href="https://github.com/KTBOY/sh-design/stargazers"><img src="https://img.shields.io/github/stars/KTBOY/sh-design?color=2563eb" alt="GitHub stars" /></a>
  <a href="https://github.com/KTBOY/sh-design/actions/workflows/deploy-docs.yml"><img src="https://github.com/KTBOY/sh-design/actions/workflows/deploy-docs.yml/badge.svg" alt="Deploy Docs" /></a>
</p>

<p>
  <a href="https://ktboy.github.io/sh-design/"><b>📖 文档</b></a> ·
  <a href="https://ktboy.github.io/sh-design/guide/quickstart"><b>🚀 快速上手</b></a> ·
  <a href="https://ktboy.github.io/sh-design/components/copy-button"><b>🧩 在线组件预览</b></a> ·
  <a href="https://www.npmjs.com/package/sh-design"><b>📦 npm</b></a>
</p>

<!-- 👉 建议录制一段 20~30s 的演示 GIF（命名 preview.gif 放到 docs/public/），然后取消下一行注释并替换路径，首屏动图对点击→star 转化影响最大 -->
<!-- <img src="https://ktboy.github.io/sh-design/preview.gif" alt="sh-design 演示" width="760" /> -->

</div>

## ✨ 为什么是 sh-design

- 🧩 **业务组件优先** — 不止是 Button/Input 这类基础原语，更聚焦复制、懒加载图片、导出、权限等**真实业务里反复要写**的功能型组件，开箱即用。
- ⚡ **现代且轻量** — Vue 3 `<script setup>` + Vite 库模式构建，输出 ESM/CJS，支持 Tree-Shaking，只打包你用到的部分。
- 🦾 **TypeScript 优先** — 完整 `.d.ts` 类型声明，Props / Emits / Slots 全程可推导。
- 🎨 **主题可定制** — CSS 变量驱动的设计令牌，覆盖即换肤。
- 🔌 **两种用法** — `app.use(ShDesign)` 全量注册，或按需 `import { ShLazyImage }`。

## 📦 安装

> 环境要求：Vue `>= 3.2`

```bash
npm install sh-design
# 或 pnpm add sh-design / yarn add sh-design
```

## 🚀 快速上手

```ts
// main.ts
import { createApp } from 'vue'
import ShDesign from 'sh-design'
import 'sh-design/dist/style.css'
import App from './App.vue'

createApp(App).use(ShDesign).mount('#app')
```

```vue
<script setup lang="ts">
import { ShLazyImage } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShLazyImage src="https://picsum.photos/400/300" style="width: 200px; height: 140px" />
</template>
```

## 🧩 组件 Components

| 组件 | 说明 | 文档 |
| --- | --- | --- |
| `ShCopyButton` | 一键复制文本，内置成功反馈 | [查看](https://ktboy.github.io/sh-design/components/copy-button) |
| `ShLazyImage` | 懒加载图片：骨架屏 + 淡入 + **失败兜底** + loader 接口取图 / 视口懒加载 / 轮询刷新 | [查看](https://ktboy.github.io/sh-design/components/lazy-image) |
| `ShSeamlessScroll` | 高性能无缝滚动：四向 / 悬停暂停 / 滚轮手动滚 / 步进滚动，每帧零重渲染 | [查看](https://ktboy.github.io/sh-design/components/seamless-scroll) |
| `ShWaterfall` | 高性能虚拟瀑布流：瀑布流/网格双布局 + 虚拟列表 + 触底分页，**零抖动**预留高度，内置懒加载图片 | [查看](https://ktboy.github.io/sh-design/components/waterfall) |

> 组件持续增加中，欢迎 [提 Issue](https://github.com/KTBOY/sh-design/issues) 提需求或 PR。

## 🧑‍💻 本地开发

```bash
pnpm install        # 安装依赖
pnpm play           # 组件调试场
pnpm docs:dev       # 本地预览文档站
pnpm build          # 构建组件库
pnpm docs:build     # 构建文档站
pnpm lint           # 代码检查
```

**新增组件**：参考 `packages/sh-design/src/components/copy-button/`（组件目录约定）→ 在 `src/components/index.ts` 导出 → 在 `docs/components/` 增加文档页。

## 🤝 贡献

欢迎 Issue / PR！如果这个项目对你有帮助，点个 ⭐ 是最好的支持。

## 📄 License

[MIT](./LICENSE) © shukezlc
