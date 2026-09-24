<script setup lang="ts">
import { withBase } from 'vitepress'
import { ALL_TOOLS } from '../../products/meta'
import ProductCard from './ProductCard.vue'

/**
 * 个人主页「更多工具」区块：与 /products/ 聚合页共用
 * theme/products/meta.ts 数据源和 ProductCard 卡片单元，
 * 经 Layout 的 home-features-after 插槽插入主页 features 之后。
 * 主页跟随站点明暗主题，暗色样式在此用 :deep 适配（/products/ 页自身锁定浅色）。
 */
</script>

<template>
  <section class="home-products">
    <div class="hp-head">
      <span class="hp-eyebrow"><i></i>More Products</span>
      <h2 class="hp-title">更多工具<span class="hp-title__dot">.</span></h2>
      <p class="hp-desc">独立开发的产品、组件与开源项目，一站式全部收纳。</p>
    </div>

    <div class="hp-grid">
      <ProductCard
        v-for="(item, i) in ALL_TOOLS"
        :key="item.name"
        :tool="item"
        :no="String(i + 1).padStart(2, '0')"
      />
    </div>

    <div class="hp-more">
      <a :href="withBase('/products/')">
        查看全部作品
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.22 5.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H4.75a.75.75 0 0 1 0-1.5h12.44l-3.97-3.97a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </a>
    </div>
  </section>
</template>

<style scoped>
.home-products {
  max-width: 1152px;
  margin: 0 auto;
  padding: 16px 24px 80px;
}

/* ===== 区块标题：与 /products/ 页同款浅色极简头部 ===== */
.hp-head {
  margin-bottom: 34px;
  text-align: center;
}

.hp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.hp-eyebrow i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
}

.hp-title {
  margin: 14px 0 10px;
  font-size: clamp(26px, 4vw, 36px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--vp-c-text-1);
}
.hp-title__dot {
  color: #2563eb;
}

.hp-desc {
  margin: 0 auto;
  max-width: 520px;
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

/* ===== 卡片墙：与 /products/ 页同一网格规格 ===== */
.hp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* ===== 查看全部入口 ===== */
.hp-more {
  margin-top: 32px;
  text-align: center;
}
.hp-more a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-1);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.hp-more a:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
  box-shadow: 0 8px 24px -12px rgba(37, 99, 235, 0.4);
}
.hp-more a svg {
  transition: transform 0.25s ease;
}
.hp-more a:hover svg {
  transform: translateX(3px);
}

/* ===== 暗色适配：主页跟随站点主题；ProductCard 为浅色锁定组件，
       这里仅在本区块作用域内覆盖（不影响 /products/ 页的浅色锁定） ===== */
.dark .home-products .hp-title {
  color: #f4f4f5;
}
.dark .home-products .hp-desc,
.dark .home-products .hp-eyebrow {
  color: #a1a1aa;
}
.dark .home-products :deep(.p-card) {
  background: var(--vp-c-bg-soft);
  border-color: #2b2e35;
}
.dark .home-products :deep(.p-card:hover) {
  border-color: #3f434c;
  box-shadow:
    0 12px 32px -16px rgba(0, 0, 0, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.4);
}
.dark .home-products :deep(.p-card__name) {
  color: #f4f4f5;
}
.dark .home-products :deep(.p-card__name em) {
  color: #a1a1aa;
}
.dark .home-products :deep(.p-card__no) {
  color: #52525b;
}
.dark .home-products :deep(.p-card__desc) {
  color: #a1a1aa;
}
.dark .home-products :deep(.p-card__tags span) {
  border-color: #2b2e35;
  background: #1b1e24;
  color: #a1a1aa;
}
.dark .home-products :deep(.p-card__links a) {
  border-color: #2b2e35;
  color: #e4e4e7;
}
.dark .home-products :deep(.p-card__links a:hover) {
  color: #60a5fa;
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.12);
}
.dark .home-products :deep(.p-card__links a.primary) {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}
.dark .home-products :deep(.p-card__links a.primary:hover) {
  background: #1d4ed8;
  color: #fff;
}

@media (max-width: 640px) {
  .home-products {
    padding: 8px 18px 60px;
  }
  .hp-grid {
    grid-template-columns: 1fr;
  }
}
</style>
