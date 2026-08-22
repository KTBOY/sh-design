# 优化首页 6 张特性卡的 UI（玻璃拟态 + 融合背景动效）

## 背景 / 根因

- 卡片现在的样式（`custom.css` 的 `.VPHome .VPFeature`）虽然写了半透明白 + `blur(8px)`，但特性区位于英雄区视频背景（100vh、底部渐隐）之下，背后是纯白页面背景，毛玻璃无内容可透 → 视觉上就是 6 块平板白盒子，与上方蓝色动画背景割裂。
- 项目里已有写好但未启用的 `CursorGlow.vue`（品牌蓝极光光斑缓慢漂移 + 鼠标跟随光晕 + 上浮猫爪剪影，呼应英雄区 CatPaw 视频；已适配暗色模式与 prefers-reduced-motion）。

## 改动

### 1. `docs/.vitepress/theme/Layout.vue` — 启用 CursorGlow

在 `<HeroBg v-if="isHome" />` 旁渲染 `<CursorGlow v-if="isHome" />`（import + 模板各加一处）。它是 `position: fixed; z-index: 0` 的全屏层，配合已有的 `.VPHome { z-index: 1 }`，滚动时始终衬在内容之下，为玻璃卡片提供可透出的动态背景。

### 2. `docs/.vitepress/theme/custom.css` — 重写特性卡样式

替换现有 `.VPHome .VPFeature` / `.dark .VPHome .VPFeature` / hover 三个规则块：

- **亮色玻璃**：`background: linear-gradient(160deg, rgba(255,255,255,.72), rgba(255,255,255,.38) 45%, rgba(219,234,254,.32))`（白→浅蓝玻璃），`backdrop-filter: blur(18px) saturate(1.4)`（含 -webkit- 前缀），圆角 16px，蓝色发丝边框 `rgba(37,99,235,.14)`。
- **玻璃质感阴影**：`inset 0 1px 0 rgba(255,255,255,.9)`（顶部高光棱）+ `0 12px 32px -16px rgba(37,99,235,.18)`（蓝色环境投影）。
- **Hover**：保持现有上浮语言（translateY(-4px)），边框提亮为 `rgba(37,99,235,.4)`、蓝色光晕加深；`.title` 悬停时染品牌色 `var(--vp-c-brand-1)`。
- **暗色玻璃**：深海军蓝渐变 `rgba(30,41,66,.66) → rgba(15,23,42,.45)`，边框 `rgba(96,165,250,.16)`，顶部高光换为淡蓝 `rgba(148,197,255,.14)`。
- **图标徽章**（`.VPHome .VPFeature .icon`，覆盖 VitePress 默认的不透明 `--vp-c-default-soft` 底）：品牌渐变玻璃底 `linear-gradient(135deg, rgba(37,99,235,.14), rgba(34,211,238,.12))` + 蓝色细边 + 12px 圆角 + 内侧白高光；暗色对应蓝色调版本；卡片 hover 时图标轻微放大（scale 1.06）。

全部使用品牌既有色值（#2563eb / #3b82f6 / #60a5fa / #22d3ee），与英雄区渐变、Logo 重着色方案一致。

## 验证

1. dev server（5199 端口已在跑）HMR 后，用应用内浏览器截图检查亮色/暗色两种模式下：卡片呈蓝调玻璃、透出模糊的极光光斑/猫爪动效、hover 上浮发光。
2. `pnpm docs:build` 确认生产构建通过。

## 不做的事

- 不改 `index.md` 的 features 内容（图标 emoji、文案保持原样）。
- 不动 HeroBg 视频背景与英雄区样式。
- 不移除 VitePress 默认样式文件，仅以 custom.css 覆盖（沿用项目现有覆盖模式）。