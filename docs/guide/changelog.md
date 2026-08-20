# 更新日志

本页记录 **sh-design 组件库** 的版本变更，遵循 [语义化版本 SemVer](https://semver.org/lang/zh-CN/)。

> 说明：这里只记录**组件库**相关的改动（组件、Composable、公共 API）。纯文档 / 站点 / CI 等工程改动一般不单独收录。

## 未发布 (Unreleased)

### ✨ 新增

- `ShWaterfall` 新增 `virtual` 属性（默认 `true`）：控制是否启用虚拟列表。`true` 仅渲染视口内（含 `buffer`）卡片，万级数据也流畅；`false` 一次性渲染全部卡片、不按视口裁剪，适用于数据量小或需要完整 DOM（打印 / 截图 / 爬虫 / 测试快照）的场景。布局算法、绝对定位与高度预留机制在两种模式下完全一致，关闭虚拟不影响触底加载与入场动画。

## 0.0.7

### 🔧 修改

- ⚠️ Breaking: 移除 `ShCopyButton` 组件及其文档页。该组件为早期验证工程链路的示例组件，不属于组件库的业务定位。
- ⚠️ Breaking: 同步移除仅由 `ShCopyButton` 使用的 `useClipboard` 组合式函数与 `copyText` 工具方法（两者原从包根导出）。

> 升级提示：仍需复制能力的项目请直接使用原生 `navigator.clipboard.writeText()`，或锁定 `sh-design@0.0.6`。

### 🐛 修复

- `ShWaterfall` 入场动画几乎看不到：原本动画绑在节点挂载上，而虚拟列表会提前在视口外 `buffer` 处创建节点，卡片滑进视口时动画早已播完。现改为卡片**真正进入视口**时才播放，无论数据是本地已有还是分页请求回来的都一致生效。
- `ShWaterfall` 上滚时动画方向错误：入场位移方向现在跟随滚动方向（下滚从下方滑入、上滚从上方滑入），不再出现「倒着飞」。

### ✨ 新增

- `ShWaterfall` 的 `animate` 支持传对象微调入场动画：`{ distance, duration, stagger, once }`（只写需要的字段，其余取默认）；同批卡片错峰入场，`once` 可设为只播一次。`:animate="false"` / 默认 `true` 的写法保持不变，无破坏性变更。
- `ShWaterfall` 适配系统「减少动态效果」偏好（`prefers-reduced-motion`），自动降级为直接显示。

## 0.0.6

`<sub>`2026-07-27`</sub>`

### ✨ 新增

- 新增 `ShWaterfall` 瀑布流组件：
  - **双布局**：`layout="waterfall"` 瀑布流（最矮列优先）/ `layout="grid"` 等高网格（`grid-ratio` 控制单元格比例），支持动态切换列数与间距。
  - **虚拟列表 + 分页加载**：只渲染可视区±`buffer` 内的卡片（每列二分查找）；触底基于 `IntersectionObserver` 哨兵触发 `load-more`，`loading` / `finished` 控制底部状态，内容不足一屏自动续载。
  - **零抖动**：卡片高度布局时一次性确定（真实宽高比 → `ratios` 兜底比例池按下标取模），加载前后 0 回流；`scrollbar-gutter: stable` 防滚动条引起列宽跳变。
  - **双滚动模式**：`scroller="self"`（固定高度容器内滚动）/ `scroller="window"`（自然撑开跟随页面滚动）。
  - **性能**：布局数据绕开深层响应式，分页追加增量布局不重排已有卡片，滚动 rAF 节流，卡片 `translate3d` GPU 合成，容器尺寸变化自动重排（ResizeObserver）。
  - 默认以 `ShLazyImage` 渲染图片（骨架屏 + 淡入 + 失败兜底），`#item` 插槽完全自定义卡片（`extra-height` 预留标题区）；`#loading` / `#finished` / `#empty` 插槽与对应文案属性自定义底部与空状态。
  - 入场动画（上滑回弹）默认开启，`animate` 可关；暴露 `relayout()` / `scrollTo()` / `check()` 方法；事件 `load-more` / `item-click` / `scroll`。

### 🔧 修改

- 放宽 Vue 版本要求：`peerDependencies` 由 `^3.3.0` 放宽至 `^3.2.0`（构建产物仅使用 Vue 3.2 已有的运行时 API，Vue 3.2 项目可正常安装使用）。

## 0.0.5

`<sub>`2026-07-25`</sub>`

### ✨ 新增

- `ShSeamlessScroll` 新增 `wheel` 属性：悬停暂停时支持滚轮手动滚动，进度与自动滚动无缝衔接（滚到边界自动循环），悬停期间不带动页面滚动。

## 0.0.4

`<sub>`2026-07-24`</sub>`

### ✨ 新增

- 新增 `ShSeamlessScroll` 无缝滚动组件：支持上/下/左/右四向滚动、悬停暂停、步进滚动（`single-step` + `single-wait`）、动态启停（`active`）与实时调速（`speed`，px/秒）。
- 性能：动画循环绕开 Vue 响应式（每帧直接写 `transform`，零重渲染），`translate3d` + `will-change` GPU 合成，离开视口自动暂停（IntersectionObserver），内容变化自动重测（ResizeObserver）。

## 0.0.3

`<sub>`2026-07-24`</sub>`

### ✨ 新增

- `ShLazyImage` 新增自定义加载器 `loader`（返回 URL 或 Blob，Blob 自动 `createObjectURL` 并在切换/卸载时回收），可对接鉴权图片接口。
- `ShLazyImage` 新增 `lazy="observer"` 视口懒加载模式（IntersectionObserver + `root-margin` 预加载）。
- `ShLazyImage` 新增 `poll-interval` 轮询刷新与 `keep-previous-on-reload`（刷新时保留上一张、失败不闪断）。
- `ShLazyImage` 新增 `skeleton` 骨架屏开关与 `placeholder-src` 占位图属性。

### 🔧 修改

- ⚠️ `ShLazyImage` 的 `load` / `error` 事件载荷调整为对象：`load` → `{ url }`，`error` → `{ error }`（原为原生 `Event`）。
- `ShLazyImage` 内部状态新增 `idle`（`observer` 模式尚未进入视口时）。

## 0.0.2

`<sub>`2026-07-24`</sub>`

### ✨ 新增

- 新增 `ShLazyImage` 懒加载图片组件：骨架屏占位、原生懒加载、加载淡入；**加载失败兜底**（展示兜底插图 + 文案），支持通过 `#error` 插槽完全自定义（作用域参数 `{ src, text }`），并提供 `error-text` / `error-src` / `show-error-image` 等属性。

## 0.0.1

`<sub>`2026-07-24`</sub>`

### 🎉 首次发布

- 新增 `ShCopyButton` 复制按钮组件：一键复制文本，内置成功反馈，支持 `type` / `size` / 自定义文案。
- 新增 `useClipboard` 组合式函数：响应式 `copied` 状态 + 复制能力。
