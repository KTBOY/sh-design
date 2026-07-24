# 介绍

**sh-design** 是一个面向 **功能性 / 业务场景** 的 Vue 3 组件库。

与通用 UI 库不同，sh-design 更关注在真实业务中反复出现的“功能型”需求（如复制、导出、水印、鉴权控制等），把它们沉淀为可复用、可组合、可定制的组件与组合式函数（Composables）。

## 设计目标

- **业务优先**：优先提供解决实际业务问题的组件，而非仅仅是基础 UI 原语。
- **工程规范**：采用 pnpm monorepo + Vite 库模式 + TypeScript，对标主流开源组件库的工程结构。
- **易于扩展**：清晰的目录约定与组件模板，新增组件成本极低。
- **类型完备**：所有组件、Props、Emits、Composables 均带完整类型声明。

## 技术栈

| 能力      | 方案                          |
| --------- | ----------------------------- |
| 框架      | Vue 3（`<script setup>`）     |
| 构建      | Vite（library mode）          |
| 语言      | TypeScript                    |
| 包管理    | pnpm workspace（monorepo）    |
| 文档      | VitePress（本站）             |
| 类型声明  | vite-plugin-dts               |

## 仓库结构

```
sh-design/
├── packages/
│   └── sh-design/      # 组件库本体（发布到 npm）
├── docs/               # VitePress 文档与在线预览（GitHub Pages）
├── play/               # 本地组件开发调试场
└── .github/workflows/  # CI：自动部署文档到 GitHub Pages
```

准备好了吗？前往 [安装](/guide/installation) 开始使用。
