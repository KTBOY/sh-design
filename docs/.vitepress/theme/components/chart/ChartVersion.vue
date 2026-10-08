<script setup lang="ts">
import pkg from 'sk-chart-duo/package.json'

/**
 * 本页文档的版本徽标。
 *
 * 正文的 `@include` 与所有 demo 的动态 import 读的是同一份 node_modules 里的
 * `sk-chart-duo`，所以这里显示的数字就是「文案依据的版本 = demo 运行的版本」。
 * 库发了新版而 docs 忘了 bump 依赖时，这一行会停在旧版本号，失真变成肉眼可见。
 */
const version = (pkg as { version: string }).version
</script>

<template>
  <p class="chart-version">
    本页文档与下方所有 demo 均基于 <code>sk-chart-duo</code> v{{ version }}
  </p>
</template>

<style scoped>
.chart-version {
  margin: 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
</style>
