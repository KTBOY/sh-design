## 概述

本项目使用 **pnpm** 作为包管理器，采用 **pnpm workspace** 组织 monorepo；npm registry 指向官方 `registry.npmjs.org`，无私有仓库或代理配置。

## 关键文件与职责

- `package.json`（根）：声明 monorepo 根、统一脚本入口（`dev` / `build` / `docs:*` / `lint` / `format` / `typecheck`），并通过 `engines.node >=18.0.0`、`engines.pnpm >=8.0.0` 强制运行环境。
- `pnpm-workspace.yaml`：定义三个 workspace 目录 `packages/*`、`docs`、`play`；通过 `allowBuilds` 显式允许/禁止某些包的构建脚本（esbuild 的 postinstall 被禁用，vue-demi 被允许）；`minimumReleaseAgeExclude` 对 `sk-chart-duo@0.1.1` 豁免发布年龄限制。
- `pnpm-lock.yaml`：pnpm 锁文件，锁定所有 workspace 内依赖的精确版本。
- `.npmrc`：全局 pnpm/npm 行为——`auto-install-peers=true`、`strict-peer-dependencies=false`。
- `packages/sh-design/package.json`：组件库发行包，声明 `peerDependencies.vue ^3.2.0`、`publishConfig.registry=https://registry.npmjs.org/`、`publishConfig.access=public`，以及 `prepublishOnly` 自动执行 build。
- `play/package.json`：本地开发预览应用，通过 `workspace:*` 引用本仓库的 `sh-design` 包，体现 workspace 内联引用约定。
- `scripts/sync-version.mjs`：在 `version` 钩子中同步 `src/version.ts` 与 package.json 的版本号，确保发布产物版本一致。

## 架构与约定

1. **Workspace 结构**：根 `package.json` 标记 `private: true`，不对外发布；真正的可发布包位于 `packages/sh-design`。`docs` 和 `play` 是辅助 workspace。
2. **依赖版本策略**：根与工作区内的依赖全部使用 `^` 语义化版本范围（如 `^5.4.11`、`^3.5.13`），由 pnpm 解析到具体安装版本并写入 `pnpm-lock.yaml`。
3. **Peer dependency**：组件库将 `vue` 声明为 peerDependency（`^3.2.0`），要求使用者自行提供 Vue 运行时。
4. **导出契约**：组件库通过 `exports` 字段同时暴露 ESM (`./dist/sh-design.js`)、CJS (`./dist/sh-design.cjs`)、类型 (`./dist/index.d.ts`) 和样式 (`./dist/style.css`) 入口，供上层消费者按模块系统选择。
5. **构建脚本白名单**：根 workspace 通过 `allowBuilds.esbuild: false` 阻止 esbuild 预编译二进制安装脚本，但允许 vue-demi 的纯 JS postinstall，这是一种有意的安全/性能取舍。
6. **发布流程约束**：`packages/sh-design/package.json` 的 `prepublishOnly` 脚本会先执行 `npm run build`，确保发布前已构建；`version` 脚本调用 `sync-version.mjs` 同步版本号后 `git add src/version.ts`，保证源码中的版本常量与包版本一致。
7. **Node/pnpm 版本门槛**：根 `engines` 字段要求 Node ≥18、pnpm ≥8，CI 或本地安装时会被校验。

## 观察到的规则（来源）

- 运行环境约束：`engines.node >=18.0.0, engines.pnpm >=8.0.0`（`package.json`）。
- 依赖安装行为：`auto-install-peers=true`、`strict-peer-dependencies=false`（`.npmrc`）。
- Workspace 成员：仅 `packages/*`、`docs`、`play` 三处（`pnpm-workspace.yaml`）。
- 构建脚本白名单：仅 `vue-demi` 被允许执行 postinstall，`esbuild` 被明确禁止（`pnpm-workspace.yaml` 的 `allowBuilds`）。
- 组件库只发布 `dist` 与 `README.md`（`packages/sh-design/package.json` 的 `files` 字段）。
- 组件库通过 `publishConfig.registry=https://registry.npmjs.org/`、`access=public` 发布到官方 npm（`packages/sh-design/package.json`）。
- 内部包通过 `workspace:*` 形式引用（`play/package.json` 中 `"sh-design": "workspace:*"`）。