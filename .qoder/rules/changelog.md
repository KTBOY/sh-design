---
description: 组件库组件发生新增/修改/修复时，必须同步更新更新日志 docs/guide/changelog.md（记录版本、日期、新增、修改、修复）
globs:
  - packages/sh-design/src/components/**
  - packages/sh-design/src/hooks/**
alwaysApply: false
---

# 更新日志自动维护规则

## 触发条件

当本次改动涉及**组件库对外能力**时必须执行本规则，包括：

- 新增 / 删除 / 重命名组件（`packages/sh-design/src/components/**`）
- 修改已有组件的 props / emits / slots / 默认值 / 行为
- 新增或修改组合式函数（`packages/sh-design/src/hooks/**`）等对外 API

> 纯文档、演示（docs）、样式站点、构建 / CI 等改动**不强制**记录。

## 必须做什么

同步更新 [`docs/guide/changelog.md`](/guide/changelog)，在文件**顶部按版本倒序**新增/补充条目。每个版本条目包含：

1. **版本号**：遵循 SemVer —— 新增组件/能力用 `minor`（0.x 阶段可用 `minor` 承载新功能），修复用 `patch`，破坏性变更用 `major`。
2. **发布日期**：`<sub>YYYY-MM-DD</sub>`。
3. **分类小节**（有则写、无则省略）：
   - `### ✨ 新增` —— 新增的组件 / 属性 / 事件 / 插槽 / 能力（增加内容）
   - `### 🔧 修改` —— 已有组件的行为 / API / 默认值变更（修改内容；破坏性变更前缀 `⚠️ Breaking:`）
   - `### 🐛 修复` —— 修复了什么问题

## 条目写法

- 用反引号标注组件名，例如 `` `ShLazyImage` ``。
- 一句话说清「改了什么 + 影响 / 价值」，面向使用者。
- 参考文件中已有条目的风格保持一致。

## 与版本发布联动

- 发版前：先在 changelog 顶部补齐当前版本条目，再执行 `npm version <patch|minor|major>`（会自动同步 `src/version.ts`）。
- 保持三处版本号一致：`changelog.md` 顶部版本 = `package.json` version = 文档站 nav 版本徽标。
- 尚未发布的累积改动，可先记在顶部的 `## 未发布 (Unreleased)` 小节，发版时替换为正式「版本号 + 日期」。
