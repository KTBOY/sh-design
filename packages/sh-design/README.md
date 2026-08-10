# sh-design

> A functional & business-oriented Vue 3 component library.

📖 **[Documentation & Live Demos](https://ktboy.github.io/sh-design/)**

## Installation

> Requires Vue `>= 3.2`.

```bash
npm install sh-design
# or
pnpm add sh-design
```

## Usage

### Full registration

```ts
import { createApp } from 'vue'
import ShDesign from 'sh-design'
import 'sh-design/dist/style.css'
import App from './App.vue'

createApp(App).use(ShDesign).mount('#app')
```

### On-demand import

```vue
<script setup lang="ts">
import { ShLazyImage } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShLazyImage src="https://picsum.photos/400/300" style="width: 200px; height: 140px" />
</template>
```

## Components

| Component          | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| `ShLazyImage`      | Lazy-loaded image with skeleton, fade-in, error fallback, custom loader and polling.  |
| `ShSeamlessScroll` | High-performance seamless marquee: 4 directions, hover pause, wheel and step scroll.  |
| `ShWaterfall`      | Virtualized waterfall / grid with paged loading and jitter-free reserved card height. |

## License

[MIT](https://github.com/KTBOY/sh-design/blob/main/LICENSE) © shukezlc
