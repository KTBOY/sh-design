<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * 深色代码窗（macOS 风格）：轻量高亮 + 一键复制。
 * 只做保守的注释 / 字符串 / 选择器 / 属性等着色，不追求完整语法分析。
 */
const props = withDefaults(defineProps<{ code: string; lang: 'html' | 'css'; title?: string }>(), {
  title: ''
})

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* 剪贴板不可用（如非安全上下文）时静默失败 */
  }
}

/* —— 极简高亮：先转义，再逐条规则包 span；已生成的片段用哨兵替换，避免被后续规则二次匹配 —— */
const TOKEN = '\uE000'
const store: string[] = []
const wrap = (cls: string, text: string) => `<span class="tok-${cls}">${text}</span>`
function keep(html: string) {
  store.push(html)
  return `${TOKEN}t${store.length - 1}x${TOKEN}`
}
function restore(out: string) {
  return out.replace(new RegExp(`${TOKEN}t(\\d+)x${TOKEN}`, 'g'), (_m, i: string) => store[+i])
}
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightCss(code: string) {
  store.length = 0
  let out = escapeHtml(code)
  out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => keep(wrap('com', m)))
  out = out.replace(/('[^'\n]*'|"[^"\n]*")/g, (m) => keep(wrap('str', m)))
  out = out.replace(/@[a-zA-Z-]+/g, (m) => keep(wrap('kw', m)))
  // 选择器：行内 “{” 之前的整段（含 keyframes 的 50% 等）
  out = out.replace(/^([^\n{}]*?)(?=[ \t]*\{)/gm, (m, sel: string) =>
    sel.trim() === '' ? m : keep(wrap('sel', sel))
  )
  // 属性名：行首缩进 + 名称 + 冒号
  out = out.replace(
    /^([ \t]*)([-\w]+)([ \t]*:)/gm,
    (m, indent: string, prop: string, colon: string) => indent + keep(wrap('prop', prop)) + colon
  )
  return restore(out)
}

function highlightHtml(code: string) {
  store.length = 0
  let out = escapeHtml(code)
  out = out.replace(/&lt;!--[\s\S]*?--&gt;/g, (m) => keep(wrap('com', m)))
  out = out.replace(
    /([\w-]+)(=)("[^"]*"|'[^']*')/g,
    (_m, name: string, eq: string, value: string) => keep(wrap('attr', name) + eq + wrap('str', value))
  )
  out = out.replace(/(&lt;\/?)([\w-]+)/g, (_m, bracket: string, tag: string) => bracket + keep(wrap('tag', tag)))
  return restore(out)
}

const highlighted = computed(() => (props.lang === 'css' ? highlightCss(props.code) : highlightHtml(props.code)))
</script>

<template>
  <div class="codeblock">
    <div class="codeblock__bar">
      <span class="codeblock__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="codeblock__title">{{ title || (lang === 'css' ? 'style.css' : 'index.html') }}</span>
      <span class="codeblock__lang">{{ lang.toUpperCase() }}</span>
      <button class="codeblock__copy" type="button" @click="copy">
        {{ copied ? '已复制 ✓' : '复制代码' }}
      </button>
    </div>
    <!-- 代码先经 escapeHtml 再注入自身的高亮 span，内容全部来自本地源码文件，无 XSS 风险 -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre class="codeblock__pre"><code v-html="highlighted"></code></pre>
  </div>
</template>

<style scoped>
.codeblock {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  overflow: hidden;
  background: #0b1120;
  box-shadow: 0 18px 40px -22px rgba(2, 6, 23, 0.9);
}

.codeblock__bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.85);
}

.codeblock__dots {
  display: inline-flex;
  gap: 6px;
}
.codeblock__dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.codeblock__dots i:nth-child(1) {
  background: #f87171;
}
.codeblock__dots i:nth-child(2) {
  background: #fbbf24;
}
.codeblock__dots i:nth-child(3) {
  background: #34d399;
}

.codeblock__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(148, 163, 184, 0.9);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.codeblock__lang {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(34, 211, 238, 0.35);
  color: #67e8f9;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
}

.codeblock__copy {
  padding: 4px 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  background: transparent;
  color: rgba(203, 213, 225, 0.9);
  font-size: 12px;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
}
.codeblock__copy:hover {
  border-color: rgba(34, 211, 238, 0.6);
  color: #67e8f9;
}

.codeblock__pre {
  margin: 0;
  padding: 18px 20px;
  overflow-x: auto;
  color: #cbd5e1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  tab-size: 2;
}

/* token 配色 */
.codeblock__pre :deep(.tok-com) {
  color: #64748b;
  font-style: italic;
}
.codeblock__pre :deep(.tok-str) {
  color: #fbbf24;
}
.codeblock__pre :deep(.tok-kw) {
  color: #c4b5fd;
}
.codeblock__pre :deep(.tok-prop) {
  color: #7dd3fc;
}
.codeblock__pre :deep(.tok-sel) {
  color: #6ee7b7;
}
.codeblock__pre :deep(.tok-tag) {
  color: #60a5fa;
}
.codeblock__pre :deep(.tok-attr) {
  color: #38bdf8;
}
</style>
