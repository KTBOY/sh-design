---
description: 文档站（VitePress 主题）视觉设计规范——沉浸式探照背景页（/products/、/guide/about）的文字可读性磨砂底板语言与浅色极简基调。改动 docs/.vitepress/theme 下页面视觉时参照。这是文档站的规范，不是 sh-design 组件库的 API 规范（后者见 api-design.md）。
globs:
  - docs/.vitepress/theme/**
alwaysApply: false
---

# 文档站视觉设计规范（VitePress 主题）

> 本规范只约束**文档站**（`docs/.vitepress/theme/`）的视觉设计，与 `api-design.md`
> （sh-design 组件库对外 API 规范）互不相干——组件库的 API 形态看那边，文档站长什么样看这里。

## 适用页面

- 沉浸式「探照背景」页：`products/ProductsGallery.vue`（/products/）、
  `about/AboutShowcase.vue`（/guide/about）——共用 `MaskBackground.vue`
  （fixed、z-index:-1 的鼠标探照背景：蓝色爪印底图常驻 + 橙色代码点阵随鼠标探照露出）。

## 基调（浅色极简）

- 细边框白卡 + 蓝色强调（`#2563eb`）+ 等宽字体编号 / 标签。
- 正文墨色 `#0a0a0b` / `#111214`，次级灰 `#6b7280`，分隔线 `#ececef` / `#e7e7ea`。

## 核心规则：探照背景上的文字可读性（磨砂底板语言）

`MaskBackground` 是高频点阵图案，**浅灰小字直接压在图案上会看不清**。遇到
「背景太花导致文字不明显」时：

1. **禁止**通过改动 / 遮盖 / 调暗背景来解决问题——背景是设计资产，必须保持不动。
2. **改为给文字加一块自己的前景表面（磨砂底板）**，与背景解耦：

   ```css
   background: rgba(255, 255, 255, 0.72);
   backdrop-filter: blur(6px);
   -webkit-backdrop-filter: blur(6px);
   border: 1px solid rgba(255, 255, 255, 0.6);
   box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
   color: #4b5563; /* 深字，白底上约 7:1 对比 */
   font-weight: 500;
   ```

3. 按文字形态选底板形状：
   - **单行说明文字**（如页脚）→ 一块圆角矩形底板，`border-radius: 12px`
     （不要用 999px 胶囊——小屏换行会变形）。
   - **一排短标签**（如 Hero meta「N 个项目 / 开源 + 在线产品 / …」）→ 每项做成
     独立磨砂胶囊 `border-radius: 999px`，用 `flex-wrap + gap` 排布，不必再加点分隔符；
     其中 CTA 项用蓝色强调变体：

     ```css
     color: #2563eb;
     border-color: rgba(37, 99, 235, 0.22);
     background: rgba(219, 234, 254, 0.72);
     ```

4. **降级安全**：`rgba` 白底本身已保证对比，`backdrop-filter` 只是锦上添花，不支持时仍可读。
5. **大标题 / 粗字**（如 Hero 标题）字号与字重已自带对比，可直接压在背景上，无需底板；
   底板语言只服务于小号 / 浅色文字。

## 响应式

- 底板 / 胶囊行一律 `flex-wrap: wrap`，窄屏自然换行堆叠。
- 可能换行的单行文字用圆角矩形（非胶囊）。
- ≤640px 收紧容器 padding 与底板 padding，避免贴边。

## 一致性

- 同一套表面参数（背景色 / blur / 边框 / 投影）在 /products/ 与 /guide/about 之间复用，
  让所有探照背景页读起来是同一个系统。
