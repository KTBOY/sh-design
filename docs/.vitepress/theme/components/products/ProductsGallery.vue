<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { ALL_TOOLS, TOOL_GROUPS } from '../../products/meta'
import type { ToolLink } from '../../products/meta'

/**
 * /products/ 更多工具页：浅色极简风格与 /skills/ 画廊页同一套视觉语言
 * （#fafafa 底、细边框白卡、蓝色强调、等宽字体编号），按「在线产品 /
 * 开源项目」两组收纳全部作品，卡片外链直达 GitHub / 站点。
 */
const total = ALL_TOOLS.length

function hrefOf(link: ToolLink) {
  return link.internal ? withBase(link.href) : link.href
}

let observer: IntersectionObserver | undefined

onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const targets = document.querySelectorAll('.products-page .reveal')
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in'))
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  targets.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="products-page">
    <!-- ===== 头部：与 /skills/ 同款浅色 Hero ===== -->
    <header class="p-hero reveal">
      <span class="p-eyebrow"><i></i>More Products · 全部作品</span>
      <h1 class="p-title">更多工具<span class="p-title__dot">.</span></h1>
      <p class="p-slogan">独立开发的产品、组件与开源项目，一站式全部收纳。</p>
      <p class="p-desc">
        从 Vue3 组件库到桌面工具、AI 工作台与 Agent Skill——每一个都从想法走到可用的成品，
        开源仓库与在线站点在这里直达。
      </p>
      <div class="p-meta">
        <span>{{ total }} 个项目</span><i></i>
        <span>开源 + 在线产品</span><i></i>
        <span>持续增加中</span><i></i>
        <span class="p-meta__hl">点击卡片直达 ↗</span>
      </div>
    </header>

    <!-- ===== 分组卡片墙 ===== -->
    <section v-for="(group, gi) in TOOL_GROUPS" :key="group.id" class="p-group" :id="group.id">
      <div class="p-group__head reveal">
        <span class="p-group__no">0{{ gi + 1 }}</span>
        <h2 class="p-group__title">{{ group.title }}</h2>
        <span class="p-group__zh">{{ group.zh }}</span>
      </div>
      <div class="p-grid">
        <article v-for="(item, i) in group.items" :key="item.name" class="p-card reveal">
          <div class="p-card__head">
            <h3 class="p-card__name">
              {{ item.name }}<em>{{ item.nameZh }}</em>
            </h3>
            <span class="p-card__no">{{ String(i + 1).padStart(2, '0') }}</span>
          </div>
          <p class="p-card__desc">{{ item.desc }}</p>
          <div class="p-card__tags">
            <span v-for="t in item.tags" :key="t">{{ t }}</span>
          </div>
          <div class="p-card__links">
            <a
              v-for="link in item.links"
              :key="link.label"
              :class="{ primary: link.primary }"
              :href="hrefOf(link)"
              :target="link.internal ? undefined : '_blank'"
              :rel="link.internal ? undefined : 'noreferrer'"
            >
              {{ link.label }}
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
                />
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>

    <footer class="p-foot reveal">
      <p>持续更新中 · 全部开源项目见 GitHub @KTBOY</p>
    </footer>
  </div>
</template>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #fafafa;
  color: #111214;
  -webkit-font-smoothing: antialiased;
}

/* ===== Hero ===== */
.p-hero {
  max-width: 1120px;
  margin: 0 auto;
  padding: calc(var(--vp-nav-height, 56px) + 52px) 32px 56px;
}

.p-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.p-eyebrow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
}

.p-title {
  margin: 18px 0 16px;
  font-size: clamp(36px, 6vw, 52px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.12;
  color: #0a0a0b;
}
.p-title__dot {
  color: #2563eb;
}

.p-slogan {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 500;
  color: #111214;
}

.p-desc {
  max-width: 560px;
  font-size: 15px;
  line-height: 1.8;
  color: #6b7280;
}

.p-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  color: #6b7280;
}
.p-meta i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d1d5db;
}
.p-meta__hl {
  color: #2563eb;
  font-weight: 500;
}

/* ===== 分组 ===== */
.p-group {
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 32px 28px;
}

.p-group__head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin: 26px 0 22px;
}

.p-group__no {
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  letter-spacing: 0.1em;
}

.p-group__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0a0a0b;
}

.p-group__zh {
  color: #9ca3af;
  font-size: 13px;
  letter-spacing: 0.28em;
}

.p-group__head::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #ececef;
  align-self: center;
}

/* ===== 卡片墙 ===== */
.p-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.p-card {
  display: flex;
  flex-direction: column;
  padding: 22px 22px 20px;
  border: 1px solid #e7e7ea;
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}
.p-card:hover {
  transform: translateY(-3px);
  border-color: #d4d4d8;
  box-shadow:
    0 12px 32px -16px rgba(10, 10, 11, 0.14),
    0 2px 8px rgba(10, 10, 11, 0.05);
}

.p-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.p-card__name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #0a0a0b;
}
.p-card__name em {
  margin-left: 8px;
  font-style: normal;
  font-weight: 400;
  font-size: 12.5px;
  color: #6b7280;
}

.p-card__no {
  color: #c7c9cf;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
}

.p-card__desc {
  flex: 1;
  margin: 10px 0 14px;
  font-size: 13px;
  line-height: 1.75;
  color: #6b7280;
}

.p-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.p-card__tags span {
  padding: 3px 9px;
  border: 1px solid #ececef;
  border-radius: 999px;
  background: #fafafa;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}

.p-card__links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.p-card__links a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border: 1px solid #e7e7ea;
  border-radius: 999px;
  color: #111214;
  font-size: 12.5px;
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}
.p-card__links a:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}
.p-card__links a.primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
.p-card__links a.primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #fff;
}
.p-card__links a.primary svg {
  color: #fff;
}
.p-card__links a svg {
  color: #2563eb;
  transition: transform 0.25s ease;
}
.p-card__links a:hover svg {
  transform: translateX(3px);
}

/* ===== 页脚 ===== */
.p-foot {
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px 32px 52px;
  border-top: 1px solid #ececef;
  text-align: center;
  color: #9ca3af;
  font-size: 12.5px;
  letter-spacing: 0.04em;
}
.p-foot p {
  margin: 0;
}

/* ===== 滚动浮现 ===== */
.reveal {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.reveal.in {
  opacity: 1;
  transform: none;
}

@media (max-width: 640px) {
  .p-hero {
    padding: calc(var(--vp-nav-height, 56px) + 40px) 18px 40px;
  }
  .p-group {
    padding: 8px 18px 20px;
  }
  .p-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
