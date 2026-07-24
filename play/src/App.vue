<script setup lang="ts">
import { ref } from 'vue'

const log = ref<string[]>([])

function onSuccess(payload: { text: string }) {
  log.value.unshift(`✅ 已复制: ${payload.text}`)
}
</script>

<template>
  <div class="play">
    <h1>sh-design · playground</h1>
    <p class="hint">在这里快速开发与调试组件。修改 packages/sh-design/src 会实时生效。</p>

    <section>
      <ShCopyButton text="Hello sh-design" type="primary" @success="onSuccess" />
      <ShCopyButton text="default button" @success="onSuccess" />
      <ShCopyButton text="text button" type="text" @success="onSuccess" />
      <ShCopyButton text="disabled" disabled />
    </section>

    <h2>事件日志</h2>
    <ul>
      <li v-for="(item, i) in log" :key="i">{{ item }}</li>
      <li v-if="log.length === 0" class="hint">（点击上方按钮试试）</li>
    </ul>
  </div>
</template>

<style>
body {
  margin: 0;
}
.play {
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
  color: #1f2937;
}
.play section {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}
.play .hint {
  color: #6b7280;
}
.play ul {
  padding-left: 18px;
}
</style>
