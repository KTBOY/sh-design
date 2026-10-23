<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { withBase } from 'vitepress'
import { ALL_TOOLS } from '../../products/meta'
import HomeToolCity from '../toolcity/HomeToolCity.vue'
import ProductCard from './ProductCard.vue'

/** 城市与列表共用产品资料；切换视图释放 WebGL，保留选中的产品。 */
const view = ref<'city' | 'list'>('city')
const selectedId = ref(ALL_TOOLS[0]?.id ?? '')
const failed = ref(false)
const sectionEl = ref<HTMLElement | null>(null)
const listButton = ref<HTMLButtonElement | null>(null)
const products = computed(() =>
  ALL_TOOLS.map((tool, index) => ({
    tool,
    no: String(index + 1).padStart(2, '0')
  }))
)

function changeView(value: 'city' | 'list') {
  failed.value = false
  view.value = value
}

function onStageError() {
  const restoreFocus = sectionEl.value?.querySelector('.district')?.contains(document.activeElement)
  failed.value = true
  view.value = 'list'
  if (restoreFocus) void nextTick(() => listButton.value?.focus())
}
</script>

<template>
  <section ref="sectionEl" class="home-products" aria-labelledby="home-products-title">
    <header class="hp-heading">
      <div>
        <p class="hp-eyebrow"><span aria-hidden="true" /> THE PRODUCT DISTRICT</p>
        <h2 id="home-products-title">把想法，建成作品。</h2>
        <p class="hp-intro">
          {{ ALL_TOOLS.length }} 个项目，一座持续生长的街区。选一栋建筑，看看里面的想法。
        </p>
      </div>
      <div class="hp-views" role="group" aria-label="作品展示方式">
        <button type="button" :aria-pressed="view === 'city'" @click="changeView('city')">
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
            <path
              d="m10 2 7 4v8l-7 4-7-4V6l7-4Zm0 8 7-4M10 10 3 6m7 4v8"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
          城市视图
        </button>
        <button
          ref="listButton"
          type="button"
          :aria-pressed="view === 'list'"
          @click="changeView('list')"
        >
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">
            <path
              d="M3 3h5v5H3V3Zm9 0h5v5h-5V3ZM3 12h5v5H3v-5Zm9 0h5v5h-5v-5Z"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linejoin="round"
            />
          </svg>
          列表视图
        </button>
      </div>
    </header>
    <p v-if="failed" class="hp-fallback" role="status">
      3D 场景暂时不可用，已切换到列表。所有作品入口仍可正常使用。
    </p>
    <HomeToolCity
      v-if="view === 'city'"
      v-model="selectedId"
      :tools="ALL_TOOLS"
      @error="onStageError"
    />
    <div v-else class="hp-grid">
      <ProductCard
        v-for="item in products"
        :key="item.tool.id"
        :tool="item.tool"
        :no="item.no"
        :data-tool-card="item.tool.name"
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
  padding: 36px 24px 80px;
}

.hp-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 28px;
}
.hp-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 12px;
  color: #6b7280;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.16em;
}
.hp-eyebrow span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2563eb;
}
.hp-heading h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 27px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.04em;
}
.hp-intro {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1.8;
}
.hp-views {
  display: flex;
  flex-shrink: 0;
  padding: 4px;
  gap: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.hp-views button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 11px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--vp-c-text-2);
  font-size: 11px;
  cursor: pointer;
}
.hp-views button[aria-pressed='true'] {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
  color: #2563eb;
}
.hp-views button:focus-visible,
.hp-more a:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}
.hp-fallback {
  margin: 0 0 20px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
}

/* ===== 卡片墙：与 /products/ 页同一网格规格 ===== */
.hp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
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
.dark .home-products :deep(.hp-grid .p-card) {
  background: var(--vp-c-bg-soft);
  border-color: #2b2e35;
}
.dark .home-products :deep(.hp-grid .p-card:hover) {
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
    padding: 24px 18px 60px;
  }
  .hp-heading h2 {
    font-size: 24px;
  }
  .hp-views button {
    min-height: 40px;
  }
  .hp-grid {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .home-products :deep(.p-card),
  .home-products :deep(.p-card__links a),
  .hp-more a,
  .hp-more a svg {
    transition: none;
  }
}
</style>
