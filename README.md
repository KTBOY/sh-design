<div align="center">

# sh-design

**A functional & business-oriented Vue 3 component library**

面向功能性 / 业务场景的 Vue 3 组件库

[![npm version](https://img.shields.io/npm/v/sh-design.svg)](https://www.npmjs.com/package/sh-design)
[![license](https://img.shields.io/npm/l/sh-design.svg)](./LICENSE)

[📖 Documentation](https://ktboy.github.io/sh-design/) · [🚀 Getting Started](https://ktboy.github.io/sh-design/guide/quickstart.html)

</div>

## ✨ Features

- 🧩 **Business-oriented** — focuses on functional / business components, not just primitives.
- ⚡ **Vue 3 + Vite** — built with `<script setup>`, Composition API and Vite library mode.
- 🦾 **TypeScript first** — ships full type declarations (`.d.ts`).
- 📦 **Tree-shakeable** — ESM + CommonJS outputs, import only what you use.
- 🎨 **Themeable** — driven by CSS variables.
- 🔌 **Flexible usage** — global registration or on-demand import.

## 📦 Installation

```bash
npm install sh-design
# or
pnpm add sh-design
```

## 🚀 Usage

```ts
// main.ts — full registration
import { createApp } from 'vue'
import ShDesign from 'sh-design'
import 'sh-design/dist/style.css'
import App from './App.vue'

createApp(App).use(ShDesign).mount('#app')
```

```vue
<!-- On-demand import -->
<script setup lang="ts">
import { ShCopyButton } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShCopyButton text="Hello sh-design" />
</template>
```

## 🏗️ Repository Structure

This is a **pnpm monorepo**:

```
sh-design/
├── packages/
│   └── sh-design/      # 📦 the component library (published to npm)
├── docs/               # 📖 VitePress docs & live preview (GitHub Pages)
├── play/               # 🧪 local playground for developing components
└── .github/workflows/  # 🤖 CI: auto-deploy docs to GitHub Pages
```

## 🧑‍💻 Development

```bash
pnpm install        # install all workspace deps
pnpm play           # start the playground
pnpm docs:dev       # start the docs site locally
pnpm build          # build the component library
pnpm docs:build     # build the docs site
pnpm lint           # lint the codebase
```

### Adding a new component

1. Create `packages/sh-design/src/components/<name>/` (see `copy-button` as a template).
2. Export it from `packages/sh-design/src/components/index.ts`.
3. Add a demo page under `docs/components/`.

## 📄 License

[MIT](./LICENSE) © shukezlc
