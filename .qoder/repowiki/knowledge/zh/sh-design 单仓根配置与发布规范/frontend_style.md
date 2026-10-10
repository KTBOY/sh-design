## 1. 采用的体系

仓库包含两套前端样式系统：
- **组件库 sh-design**（`packages/sh-design/`）：纯原生 CSS + CSS 自定义属性，无预处理器、无 Tailwind，通过 `:root` 变量集中声明设计令牌。
- **VitePress 文档站点**（`docs/.vitepress/theme/`）：在官方 VitePress 主题之上用全局 `custom.css` 覆盖布局、品牌色、交互动效和响应式排版。

组件库没有引入任何 UI 框架或原子化 CSS；文档站也没有使用 Tailwind，而是直接改写 VitePress 的 CSS 变量和选择器。

## 2. 关键文件

- `packages/sh-design/src/styles/var.css` — 设计令牌入口，定义品牌色、中性色、状态色、圆角、字号、过渡等 `--sh-*` 变量。
- `packages/sh-design/src/styles/skeleton.css` — 骨架屏指令 `v-skeleton` 的全局样式（微光 shimmer、遮罩、deep 模式），含 `prefers-reduced-motion` 无障碍适配。
- `packages/sh-design/src/styles/index.css` — 仅做 `@import` 聚合，统一导出 `var.css` 与 `skeleton.css`。
- `packages/sh-design/src/index.ts` — 插件入口，注释明确约定消费者需额外 `import 'sh-design/dist/style.css'` 以加载设计令牌。
- `docs/.vitepress/theme/custom.css` — 文档站全局样式，覆盖 `:root` 下的 `--vp-*` 变量、Hero 标题背景图、Feature 卡片、按钮、demo 容器、右侧 UniDemoDock 停靠面板、showcase 画廊、图表页代码表格等。
- `docs/.vitepress/theme/Layout.vue` / `index.ts` — VitePress 主题挂载点，负责注入上述 `custom.css`。

## 3. 架构与设计决策

### 3.1 设计令牌（Design Tokens）
令牌全部集中在 `var.css` 的 `:root` 下，按语义分组（Brand / Neutral / Status / Radius / Typography / Motion），命名空间为 `--sh-*`。组件样式只消费这些变量，不写死颜色或尺寸，便于主题化。

### 3.2 样式组织方式
- 组件库采用「单文件样式」：每个组件自带 `.vue` + 可选同目录 `.css`（如 skeleton 的全局样式独立成文件，因为指令作用于任意宿主元素，无法 scoped）。
- 所有组件样式走原生 CSS，不使用 `<style scoped>` 以外的预处理器，保证产物体积小、无需额外依赖。
- 聚合入口 `styles/index.css` 仅做 `@import`，方便被打包为单一 `dist/style.css`。

### 3.3 文档站主题策略
`custom.css` 通过覆盖 VitePress 的 `--vp-*` CSS 变量来定制品牌色（主色 `#2563eb` → `#60a5fa` 渐变）、侧栏宽度、正文最大宽度、Home Hero 名称背景图（用图片替代渐变文字，暗色模式 `filter: invert(1)`）。

布局层面大量使用 `:has()` 进行页面级作用域控制（例如 `.VPContent:has(.showcase-page)`、`.vp-doc:has(.fold-demo) table code`），避免给路由或 JS 加标记类；对不支持 `:has()` 的场景回退到 JS 动态添加的 `has-uni-demo-dock` 类（见 `UniDemoDock.vue`）。这是本仓库文档样式最突出的选择：CSS-first、JS 仅兜底。

### 3.4 响应式策略
- 文档站使用 `@media (min-width: ...)` 断点控制 Dock 面板、正文限宽、showcase 页 padding 等。
- 骨架屏遵循 `prefers-reduced-motion: reduce` 关闭 shimmer 动画。
- 组件库未引入移动端专用样式，面向桌面端为主；文档站的 dock 面板在 ≥1440px 时激活。

## 4. 约定与约束

- **令牌命名空间**：组件库设计令牌统一以 `--sh-` 前缀声明于 `:root`，样式中通过 `var(--sh-*)` 引用。（来源：`src/styles/var.css`）
- **文档主题变量**：文档站通过覆盖 `--vp-*` 变量（如 `--vp-c-brand-*`、`--vp-sidebar-width`、`--vp-layout-max-width`、`--vp-content-width`）实现主题定制，而非重写选择器。（来源：`docs/.vitepress/theme/custom.css`）
- **样式入口约定**：组件库的 `index.ts` 中注释明确要求使用者额外 `import 'sh-design/dist/style.css'` 以加载设计令牌；该约定由包发布产物强制生效。（来源：`packages/sh-design/src/index.ts` 注释）
- **骨架屏全局样式**：`v-skeleton` 指令相关样式放在非 scoped 的 `skeleton.css`，因为指令可能挂载到任意宿主元素且 slot 内容属于父作用域；同时提供 `is-static` / `--static` 变体关闭动画，并尊重 `prefers-reduced-motion`。（来源：`src/styles/skeleton.css` 及组件模板注释）
- **CSS-only 作用域**：文档站优先使用 CSS `:has()` 选择器限定样式作用域（如 `.vp-doc:has(.fold-demo) table code`），仅在浏览器不支持时回退 JS 类名。（来源：`docs/.vitepress/theme/custom.css` 内多处注释说明）
- **品牌色规范**：组件库主色 `#3b82f6`（hover `#2563eb`，active `#1d4ed8`），文档站主色 `#2563eb` → `#60a5fa` 渐变，两者保持视觉一致但命名空间分离（`--sh-*` vs `--vp-*`）。
- **字体与字号**：组件库暴露 `--sh-font-size-sm/base/lg` 三个字号层级（12/14/16px），其余细节（字重、行高）未集中管理，按需使用浏览器默认值。
- **无原子化 CSS**：仓库未发现 Tailwind、UnoCSS 或其他原子化样式配置；所有视觉规则均以传统 CSS 选择器编写。
- **无 SCSS/Less**：未见 `.scss` / `.less` 文件或对应 loader 配置；样式全部为原生 CSS。
