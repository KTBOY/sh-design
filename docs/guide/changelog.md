# 更新日志

本页记录 **sh-design 组件库** 的版本变更，遵循 [语义化版本 SemVer](https://semver.org/lang/zh-CN/)。

> 说明：这里只记录**组件库**相关的改动（组件、Composable、公共 API）。纯文档 / 站点 / CI 等工程改动一般不单独收录。

## 0.0.6

<sub>2026-07-25</sub>

### 🔧 修改

- 放宽 Vue 版本要求：`peerDependencies` 由 `^3.3.0` 放宽至 `^3.2.0`（构建产物仅使用 Vue 3.2 已有的运行时 API，Vue 3.2 项目可正常安装使用）。

## 0.0.5

<sub>2026-07-25</sub>

### ✨ 新增

- `ShSeamlessScroll` 新增 `wheel` 属性：悬停暂停时支持滚轮手动滚动，进度与自动滚动无缝衔接（滚到边界自动循环），悬停期间不带动页面滚动。

## 0.0.4

<sub>2026-07-24</sub>

### ✨ 新增

- 新增 `ShSeamlessScroll` 无缝滚动组件：支持上/下/左/右四向滚动、悬停暂停、步进滚动（`single-step` + `single-wait`）、动态启停（`active`）与实时调速（`speed`，px/秒）。
- 性能：动画循环绕开 Vue 响应式（每帧直接写 `transform`，零重渲染），`translate3d` + `will-change` GPU 合成，离开视口自动暂停（IntersectionObserver），内容变化自动重测（ResizeObserver）。

## 0.0.3

<sub>2026-07-24</sub>

### ✨ 新增

- `ShLazyImage` 新增自定义加载器 `loader`（返回 URL 或 Blob，Blob 自动 `createObjectURL` 并在切换/卸载时回收），可对接鉴权图片接口。
- `ShLazyImage` 新增 `lazy="observer"` 视口懒加载模式（IntersectionObserver + `root-margin` 预加载）。
- `ShLazyImage` 新增 `poll-interval` 轮询刷新与 `keep-previous-on-reload`（刷新时保留上一张、失败不闪断）。
- `ShLazyImage` 新增 `skeleton` 骨架屏开关与 `placeholder-src` 占位图属性。

### 🔧 修改

- ⚠️ `ShLazyImage` 的 `load` / `error` 事件载荷调整为对象：`load` → `{ url }`，`error` → `{ error }`（原为原生 `Event`）。
- `ShLazyImage` 内部状态新增 `idle`（`observer` 模式尚未进入视口时）。

## 0.0.2

<sub>2026-07-24</sub>

### ✨ 新增

- 新增 `ShLazyImage` 懒加载图片组件：骨架屏占位、原生懒加载、加载淡入；**加载失败兜底**（展示兜底插图 + 文案），支持通过 `#error` 插槽完全自定义（作用域参数 `{ src, text }`），并提供 `error-text` / `error-src` / `show-error-image` 等属性。

## 0.0.1

<sub>2026-07-24</sub>

### 🎉 首次发布

- 新增 `ShCopyButton` 复制按钮组件：一键复制文本，内置成功反馈，支持 `type` / `size` / 自定义文案。
- 新增 `useClipboard` 组合式函数：响应式 `copied` 状态 + 复制能力。
