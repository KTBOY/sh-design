# 更新日志

本页记录 **sh-design 组件库** 的版本变更，遵循 [语义化版本 SemVer](https://semver.org/lang/zh-CN/)。

> 说明：这里只记录**组件库**相关的改动（组件、Composable、公共 API）。纯文档 / 站点 / CI 等工程改动一般不单独收录。

## 0.0.2

<sub>2026-07-24</sub>

### ✨ 新增

- 新增 `ShLazyImage` 懒加载图片组件：骨架屏占位、原生懒加载、加载淡入；**加载失败兜底**（展示兜底插图 + 文案），支持通过 `#error` 插槽完全自定义（作用域参数 `{ src, text }`），并提供 `error-text` / `error-src` / `show-error-image` 等属性。

## 0.0.1

<sub>2026-07-24</sub>

### 🎉 首次发布

- 新增 `ShCopyButton` 复制按钮组件：一键复制文本，内置成功反馈，支持 `type` / `size` / 自定义文案。
- 新增 `useClipboard` 组合式函数：响应式 `copied` 状态 + 复制能力。
