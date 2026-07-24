# 快速上手

## 全量注册

在入口文件中通过 `app.use()` 注册整个组件库：

```ts
// main.ts
import { createApp } from 'vue'
import ShDesign from 'sh-design'
import 'sh-design/dist/style.css'
import App from './App.vue'

createApp(App).use(ShDesign).mount('#app')
```

注册后即可在任意模板中直接使用组件：

```vue
<template>
  <ShCopyButton text="Hello sh-design" type="primary" />
</template>
```

## 按需引入

如果只想使用个别组件，可直接从包中导入：

```vue
<script setup lang="ts">
import { ShCopyButton } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShCopyButton text="Hello sh-design" />
</template>
```

## 使用组合式函数

sh-design 也提供了可独立使用的组合式函数（Composables）：

```vue
<script setup lang="ts">
import { useClipboard } from 'sh-design'

const { copied, copy } = useClipboard()

function handleCopy() {
  copy('要复制的内容')
}
</script>

<template>
  <button @click="handleCopy">{{ copied ? '已复制' : '复制' }}</button>
</template>
```

前往 [组件](/components/copy-button) 查看在线示例。
