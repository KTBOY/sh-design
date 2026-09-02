<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { ALL_TOOLS, TOOL_GROUPS } from '../../products/meta'
import ProductCard from './ProductCard.vue'

/**
 * /products/ 更多工具页：浅色极简风格与 /skills/ 画廊页同一套视觉语言
 * （#fafafa 底、细边框白卡、蓝色强调、等宽字体编号），按「在线产品 /
 * 开源项目」两组收纳全部作品，卡片外链直达 GitHub / 站点。
 * 卡片单元为共享组件 ProductCard（个人主页「更多产品」区块复用同一模块）。
 */
const total = ALL_TOOLS.length

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
    <section v-for="(group, gi) in TOOL_GROUPS" :id="group.id" :key="group.id" class="p-group">
      <div class="p-group__head reveal">
        <span class="p-group__no">0{{ gi + 1 }}</span>
        <h2 class="p-group__title">{{ group.title }}</h2>
        <span class="p-group__zh">{{ group.zh }}</span>
      </div>
      <div class="p-grid">
        <ProductCard
          v-for="(item, i) in group.items"
          :key="item.name"
          class="reveal"
          :tool="item"
          :no="String(i + 1).padStart(2, '0')"
        />
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

/* ===== 卡片墙（卡片单元见共享组件 ProductCard.vue） ===== */
.p-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
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
