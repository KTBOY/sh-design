<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { EFFECTS, KIND_CONFIG, SKILLS } from '../../showcase/meta'
import type { ShowcaseKind } from '../../showcase/meta'
import { getDemoMap } from '../../showcase/demos'
import CodeBlock from './CodeBlock.vue'
import CopyToast from './CopyToast.vue'
import { showCopyToast } from '../../showcase/copyToast'

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

const installCopied = ref(false)
async function copyInstall() {
  try {
    await navigator.clipboard.writeText(item.value?.install ?? '')
    installCopied.value = true
    showCopyToast('安装命令已复制到剪贴板')
    setTimeout(() => (installCopied.value = false), 1600)
  } catch {
    showCopyToast('复制失败，请手动选择复制')
  }
}
</script>

<template>
  <div class="showcase-page showcase-detail" :data-kind="kind">
    <!-- 背景：仅 effects 沿用深色极光画布；skills 为浅色页，无背景层 -->
    <div v-if="kind === 'effects'" class="showcase-bg" aria-hidden="true">
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
          <a v-if="item.repo" class="detail-repo" :href="item.repo" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            GitHub 源码 ↗
          </a>
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

      <!-- ===== 安装命令 ===== -->
      <section v-if="item.install" class="detail-install">
        <h2 class="detail-code__title">
          <span class="detail-code__bar"></span>安装命令
        </h2>
        <div class="detail-install__box">
          <span class="detail-install__prompt" aria-hidden="true">$</span>
          <code class="detail-install__cmd">{{ item.install }}</code>
          <button class="detail-install__copy" type="button" @click="copyInstall">
            {{ installCopied ? '已复制 ✓' : '复制命令' }}
          </button>
        </div>
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

    <CopyToast />
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

.detail-repo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  border-radius: 7px;
  color: #67e8f9;
  font-size: 11.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}
.detail-repo:hover {
  border-color: rgba(34, 211, 238, 0.8);
  transform: translateY(-1px);
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

/* ================= 安装命令 ================= */
.detail-install {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 40px auto 0;
  padding: 0 24px;
}
.detail-install__box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: #0b0d14;
  box-shadow: 0 12px 32px -16px rgba(10, 10, 11, 0.12);
}
.detail-install__prompt {
  color: #6ee7a0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  font-weight: 700;
}
.detail-install__cmd {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  scrollbar-width: none;
}
.detail-install__cmd::-webkit-scrollbar {
  display: none;
}
.detail-install__copy {
  flex: none;
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
.detail-install__copy:hover {
  border-color: rgba(34, 211, 238, 0.6);
  color: #67e8f9;
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

/* ================= skills：浅色极简覆写 ================= */
.showcase-detail[data-kind='skills'] {
  background: #fafafa;
  color: #111214;
  -webkit-font-smoothing: antialiased;
}

.showcase-detail[data-kind='skills'] .detail-back {
  border-color: #e7e7ea;
  background: #fff;
  color: #6b7280;
}
.showcase-detail[data-kind='skills'] .detail-back:hover {
  border-color: #d4d4d8;
  color: #111214;
}

.showcase-detail[data-kind='skills'] .detail-eyebrow {
  color: #6b7280;
}

.showcase-detail[data-kind='skills'] .detail-title {
  background: none;
  color: #0a0a0b;
  letter-spacing: -0.02em;
}

.showcase-detail[data-kind='skills'] .detail-desc {
  color: #6b7280;
}

.showcase-detail[data-kind='skills'] .detail-tags span {
  border: 1px solid #ececef;
  border-radius: 999px;
  background: #fff;
  color: #6b7280;
}

.showcase-detail[data-kind='skills'] .detail-repo {
  border: 1px solid rgba(37, 99, 235, 0.35);
  border-radius: 999px;
  color: #2563eb;
}
.showcase-detail[data-kind='skills'] .detail-repo:hover {
  border-color: rgba(37, 99, 235, 0.7);
}

/* 舞台：去掉流光外圈，改为白卡内嵌深色圆角面板（与画廊卡片同款语言） */
.showcase-detail[data-kind='skills'] .detail-stage-wrap {
  padding: 10px;
  border: 1px solid #e7e7ea;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 32px -16px rgba(10, 10, 11, 0.1);
}
.showcase-detail[data-kind='skills'] .detail-stage-wrap::before {
  display: none;
}
.showcase-detail[data-kind='skills'] .detail-stage {
  border-radius: 12px;
  background: #0b0d14;
}

.showcase-detail[data-kind='skills'] .detail-stage-note {
  color: #9ca3af;
}

.showcase-detail[data-kind='skills'] .detail-code__title {
  color: #0a0a0b;
}

.showcase-detail[data-kind='skills'] .detail-pn__item {
  border-color: #e7e7ea;
  background: #fff;
}
.showcase-detail[data-kind='skills'] .detail-pn__item:hover {
  border-color: #d4d4d8;
  box-shadow: 0 12px 32px -16px rgba(10, 10, 11, 0.14);
}
.showcase-detail[data-kind='skills'] .detail-pn__label {
  color: #9ca3af;
}
.showcase-detail[data-kind='skills'] .detail-pn__name {
  color: #0a0a0b;
}

.showcase-detail[data-kind='skills'] .detail-missing {
  color: #6b7280;
}
.showcase-detail[data-kind='skills'] .detail-missing a {
  color: #2563eb;
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
