<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { EFFECTS, KIND_CONFIG, SKILLS } from '../../showcase/meta'
import type { ShowcaseKind } from '../../showcase/meta'
import { getDemoMap } from '../../showcase/demos'
import CodeBlock from './CodeBlock.vue'

/**
 * showcase 详情页：完整尺寸的实时演示 + 可复制的完整源码。
 * 源码通过 demos.ts 的 `?raw` 直接读取演示组件自身文件，
 * 展示内容永远与实际渲染一致；HTML / CSS 从 SFC 源码中切出。
 */
const props = defineProps<{ kind: ShowcaseKind; id?: string }>()

const config = computed(() => KIND_CONFIG[props.kind])
const list = computed(() => (props.kind === 'skills' ? SKILLS : EFFECTS))
const index = computed(() => list.value.findIndex((i) => i.id === props.id))
const item = computed(() => list.value[index.value])
const demo = computed(() => (props.id ? getDemoMap(props.kind)[props.id] : undefined))

const htmlCode = computed(
  () => demo.value?.source.match(/<template>\n?([\s\S]*?)\n<\/template>/)?.[1]?.trim() ?? ''
)
const cssCode = computed(() => demo.value?.source.match(/<style[^>]*>\n?([\s\S]*?)<\/style>/)?.[1]?.trim() ?? '')

const prev = computed(() => (index.value > 0 ? list.value[index.value - 1] : null))
const next = computed(() => (index.value >= 0 && index.value < list.value.length - 1 ? list.value[index.value + 1] : null))

function href(id: string) {
  return withBase(`/${config.value.dir}/${id}`)
}
</script>

<template>
  <div class="showcase-page showcase-detail" :data-kind="kind">
    <!-- 背景：沿用画廊页的深色画布，但更收敛，保证代码区可读 -->
    <div class="showcase-bg" aria-hidden="true">
      <div class="bg-blob bg-blob--a"></div>
      <div class="bg-blob bg-blob--b"></div>
      <div class="bg-grid"></div>
      <div class="bg-vignette"></div>
    </div>

    <template v-if="item && demo">
      <!-- ===== 头部 ===== -->
      <header class="detail-head">
        <a class="detail-back" :href="withBase(`/${config.dir}/`)">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10.78 19.03a.75.75 0 0 1-1.06 0l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 1 1 1.06 1.06L5.31 12l5.47 5.47a.75.75 0 0 1 0 1.06Z"
            />
            <path fill="currentColor" d="M3.75 11.25h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5Z" />
          </svg>
          返回{{ config.name }}
        </a>
        <span class="detail-eyebrow">{{ config.eyebrow }} · {{ String(index + 1).padStart(2, '0') }}</span>
        <h1 class="detail-title">{{ item.title }}</h1>
        <p class="detail-desc">{{ item.desc }}</p>
        <div class="detail-tags">
          <span v-for="t in item.tags" :key="t">{{ t }}</span>
        </div>
      </header>

      <!-- ===== 实时演示舞台 ===== -->
      <section class="detail-stage-wrap">
        <div class="detail-stage">
          <component :is="demo.component" />
        </div>
        <p class="detail-stage-note">
          <i></i>上方为实时渲染效果（非截图），hover 可交互
        </p>
      </section>

      <!-- ===== 完整源码 ===== -->
      <section class="detail-code">
        <h2 class="detail-code__title">
          <span class="detail-code__bar"></span>完整源码
        </h2>
        <CodeBlock lang="html" title="template · HTML 结构" :code="htmlCode" />
        <CodeBlock lang="css" title="style · CSS 完整源码" :code="cssCode" />
      </section>

      <!-- ===== 上一篇 / 下一篇 ===== -->
      <nav class="detail-pn">
        <a v-if="prev" class="detail-pn__item" :href="href(prev.id)">
          <span class="detail-pn__label">← 上一个</span>
          <span class="detail-pn__name">{{ prev.title }}</span>
        </a>
        <span v-else class="detail-pn__item detail-pn__item--empty"></span>
        <a v-if="next" class="detail-pn__item detail-pn__item--next" :href="href(next.id)">
          <span class="detail-pn__label">下一个 →</span>
          <span class="detail-pn__name">{{ next.title }}</span>
        </a>
        <span v-else class="detail-pn__item detail-pn__item--empty"></span>
      </nav>
    </template>

    <!-- id 不存在时的兜底 -->
    <div v-else class="detail-missing">
      <p>未找到该演示，可能已被移除或改名。</p>
      <a :href="withBase(`/${config.dir}/`)">← 返回{{ config.name }}</a>
    </div>
  </div>
</template>

<style scoped>
.showcase-detail {
  position: relative;
  min-height: 100vh;
  background: #070b18;
  color: #e2e8f0;
  overflow: clip;
}

.showcase-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-blob {
  position: absolute;
  width: 42vw;
  height: 42vw;
  min-width: 380px;
  min-height: 380px;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.22;
}
.bg-blob--a {
  left: -14%;
  top: -18%;
  background: radial-gradient(circle, #2563eb, transparent 68%);
}
.bg-blob--b {
  right: -12%;
  top: 4%;
  background: radial-gradient(circle, #7c3aed, transparent 68%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px);
  background-size: 54px 54px;
  -webkit-mask-image: radial-gradient(90% 70% at 50% 0%, #000, transparent 80%);
  mask-image: radial-gradient(90% 70% at 50% 0%, #000, transparent 80%);
}
.bg-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 70%, rgba(4, 7, 15, 0.9) 100%);
}

/* ================= 头部 ================= */
.detail-head {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height, 56px) + 44px) 24px 8px;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  color: rgba(203, 213, 225, 0.9);
  font-size: 13px;
  text-decoration: none;
  background: rgba(15, 23, 42, 0.55);
  transition: all 0.25s ease;
}
.detail-back:hover {
  border-color: rgba(34, 211, 238, 0.55);
  color: #67e8f9;
  transform: translateX(-2px);
}

.detail-eyebrow {
  display: block;
  margin-top: 26px;
  color: rgba(94, 234, 212, 0.75);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.2em;
}

.detail-title {
  margin: 10px 0 12px;
  font-size: clamp(28px, 4.6vw, 42px);
  font-weight: 800;
  background: linear-gradient(92deg, #e0f2fe, #7dd3fc 45%, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.detail-desc {
  margin: 0;
  max-width: 640px;
  color: rgba(148, 163, 184, 0.95);
  font-size: 14px;
  line-height: 1.85;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 16px;
}
.detail-tags span {
  padding: 4px 11px;
  border: 1px solid rgba(34, 211, 238, 0.32);
  border-radius: 7px;
  color: #7dd3fc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}

/* ================= 演示舞台：旋转流光描边 ================= */
.detail-stage-wrap {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 30px auto 0;
  padding: 2px;
  border-radius: 20px;
  overflow: hidden;
}
/* 舞台外圈就是 border-beam 同款流光，页面自身即特效 */
.detail-stage-wrap::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 320%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg 235deg,
    rgba(37, 99, 235, 0.9) 285deg,
    rgba(34, 211, 238, 0.95) 315deg,
    rgba(167, 139, 250, 0.9) 340deg,
    transparent 360deg
  );
  animation: stage-spin 7s linear infinite;
}
@keyframes stage-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.detail-stage {
  position: relative;
  height: clamp(300px, 52vh, 420px);
  border-radius: 18px;
  overflow: hidden;
  background: #0a0f1e;
}

.detail-stage-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 0 0;
  color: rgba(100, 116, 139, 0.95);
  font-size: 12px;
  letter-spacing: 0.05em;
}
.detail-stage-note i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.9);
  animation: note-pulse 1.8s ease-in-out infinite;
}
@keyframes note-pulse {
  50% {
    opacity: 0.3;
  }
}

/* ================= 源码区 ================= */
.detail-code {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 40px auto 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-code__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #f1f5f9;
  font-size: 20px;
  font-weight: 700;
}
.detail-code__bar {
  width: 5px;
  height: 20px;
  border-radius: 3px;
  background: linear-gradient(to bottom, #22d3ee, #2563eb);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.5);
}

/* ================= 上一篇 / 下一篇 ================= */
.detail-pn {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 920px;
  margin: 34px auto 0;
  padding: 0 24px 54px;
}
.detail-pn__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(13, 20, 40, 0.72);
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
}
.detail-pn__item:hover {
  border-color: rgba(34, 211, 238, 0.5);
  transform: translateY(-3px);
}
.detail-pn__item--next {
  text-align: right;
}
.detail-pn__item--empty {
  pointer-events: none;
  visibility: hidden;
}
.detail-pn__label {
  color: rgba(100, 116, 139, 0.95);
  font-size: 12px;
}
.detail-pn__name {
  color: #f1f5f9;
  font-size: 15px;
  font-weight: 700;
}

/* ================= 兜底 ================= */
.detail-missing {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: calc(var(--vp-nav-height, 56px) + 120px) 24px 120px;
  text-align: center;
  color: rgba(148, 163, 184, 0.95);
}
.detail-missing a {
  color: #67e8f9;
}

@media (max-width: 640px) {
  .detail-pn {
    grid-template-columns: 1fr;
  }
  .detail-pn__item--next {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .showcase-detail *,
  .showcase-detail *::before,
  .showcase-detail *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
