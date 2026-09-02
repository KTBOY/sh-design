<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Tool, ToolLink } from '../../products/meta'

/**
 * 产品卡片 —— /products/ 聚合页与个人主页「更多产品」区块共用的最小卡片单元。
 * 数据来自 theme/products/meta.ts；纯展示组件，含完整 hover / 暗色适配。
 */
defineProps<{ tool: Tool; no?: string }>()

function hrefOf(link: ToolLink) {
  return link.internal ? withBase(link.href) : link.href
}
</script>

<template>
  <article class="p-card">
    <div class="p-card__head">
      <h3 class="p-card__name">
        {{ tool.name }}<em>{{ tool.nameZh }}</em>
      </h3>
      <span v-if="no" class="p-card__no">{{ no }}</span>
    </div>
    <p class="p-card__desc">{{ tool.desc }}</p>
    <div class="p-card__tags">
      <span v-for="t in tool.tags" :key="t">{{ t }}</span>
    </div>
    <div class="p-card__links">
      <a
        v-for="link in tool.links"
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
</template>

<style scoped>
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
</style>
