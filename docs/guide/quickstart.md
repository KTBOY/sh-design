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
  <ShLazyImage src="https://picsum.photos/400/300" style="width: 200px; height: 140px" />
</template>
```

## 按需引入

如果只想使用个别组件，可直接从包中导入：

```vue
<script setup lang="ts">
import { ShLazyImage } from 'sh-design'
import 'sh-design/dist/style.css'
</script>

<template>
  <ShLazyImage src="https://picsum.photos/400/300" style="width: 200px; height: 140px" />
</template>
```

前往 [组件](/components/lazy-image) 查看在线示例。
