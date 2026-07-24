# sh-design

> A functional & business-oriented Vue 3 component library.

📖 **[Documentation & Live Demos](https://ktboy.github.io/sh-design/)**

## Installation

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
import { ShCopyButton } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShCopyButton text="Hello sh-design" type="primary" />
</template>
```

## Components

| Component      | Description                                      |
| -------------- | ------------------------------------------------ |
| `ShCopyButton` | Click-to-copy button with success feedback.      |

## Composables

| Composable     | Description                                      |
| -------------- | ------------------------------------------------ |
| `useClipboard` | Reactive clipboard helper with a `copied` state. |

## License

[MIT](https://github.com/KTBOY/sh-design/blob/main/LICENSE) © shukezlc
