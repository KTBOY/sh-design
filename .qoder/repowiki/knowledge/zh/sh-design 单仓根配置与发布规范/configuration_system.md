## 概述

本仓库是一个 Vue 3 组件库 monorepo，不存在传统意义上的“运行时配置文件”（如 `.env`、`application.properties`）。所有“配置”集中在根级工作区文件与 GitHub Actions 工作流中，用于统一开发工具链、构建产物、包发布流程。核心思路是：**pnpm workspace 管理多子包，Vite/VitePress 作为各子包的构建器，ESLint + TypeScript + Prettier 提供统一的代码质量规则，GitHub Actions 负责文档部署与 npm 发布。**

## 关键文件与职责

- `package.json`：根工作区声明（`private: true`，`type: module`），集中定义 `dev`/`build`/`docs:*`/`lint`/`format`/`typecheck` 等脚本，通过 `pnpm --filter` 路由到子包；声明 `engines.node >= 18.0.0`、`engines.pnpm >= 8.0.0`。
- `pnpm-workspace.yaml`：workspace 成员为 `packages/*`、`docs`、`play`；`allowBuilds.esbuild: false`（跳过 esbuild postinstall）、`vue-demi: true`；`minimumReleaseAgeExclude` 允许 `sk-chart-duo@0.1.1` 立即发布。
- `.npmrc`：`auto-install-peers=true`、`strict-peer-dependencies=false`——放宽 peer dependency 校验。
- `tsconfig.json`：根级 TS 配置，`moduleResolution: "Bundler"`、`strict: true`、`noUnusedLocals/Parameters/ImplicitReturns` 开启；`paths` 将 `sh-design` 和 `sh-design/*` 映射到 `packages/sh-design/src/*`，供 play/docs 使用。
- `eslint.config.js`：ESLint Flat Config（配合 `@eslint/js`、`typescript-eslint`、`eslint-plugin-vue`、`eslint-config-prettier`）。
- `.prettierrc.json`、`.prettierignore`：Prettier 格式化规则。
- `docs/.vitepress/config.ts`：VitePress 站点配置。
- `packages/sh-design/vite.config.ts`：组件库的 Vite 构建配置。
- `play/vite.config.ts`：本地演示站点的 Vite 配置。
- `.github/workflows/deploy-docs.yml`：push 到 `main` 或手动触发时构建并部署 VitePress 到 GitHub Pages。
- `.github/workflows/publish-npm.yml`：push `v*` tag 或手动触发，使用 npm OIDC Trusted Publishing（无需 NPM_TOKEN）发布 `sh-design`，成功后自动创建 GitHub Release。

## 架构与约定

### 1. Monorepo 结构

```text
.
├── packages/sh-design/   # 组件库源码（被 `pnpm build` 构建）
├── docs/                 # VitePress 文档站
├── play/                 # 本地 dev 演示站点
└── .github/workflows/    # CI/CD 工作流
```

根 `package.json` 仅作为工作区入口，不发布任何包（`private: true`）。

### 2. 版本发布约定

- **文档部署**：push 到 `main` 分支即触发 `deploy-docs.yml`，构建 `docs/.vitepress/dist` 并部署到 GitHub Pages。
- **npm 发布**：push `v*` 标签（如 `v0.1.0`）触发 `publish-npm.yml`，执行 `pnpm build` → `npm publish --access public`（在 `packages/sh-design` 下），然后调用 `gh release create` 自动创建 GitHub Release。注释明确要求先在 npmjs.com 配置 Trusted Publisher 指向本仓库与工作流。

### 3. 构建工具链

- 组件库使用 Vite（`packages/sh-design/vite.config.ts`），文档使用 VitePress（`docs/.vitepress/config.ts`），play 站点也使用 Vite（`play/vite.config.ts`）。
- TypeScript 编译由 `vue-tsc` 驱动（`typecheck` 脚本路由到 sh-design 包）。
- 根 `tsconfig.json` 通过 `paths` 别名统一解析 `sh-design` 模块，避免子包间相对路径依赖。

### 4. 环境与安全

- 无 `.env` 文件或运行时配置加载逻辑。环境变量仅在 CI 中使用（`GITHUB_TOKEN`、OIDC token）。
- npm 认证采用 **Trusted Publishing (OIDC)**，工作流注释明确说明“无需 NPM_TOKEN”，并通过 `id-token: write` 权限启用。
- Node 与 pnpm 版本锁定：CI 固定 `node 22`、`pnpm 11.7.0`；根 `engines` 要求 `node >= 18`、`pnpm >= 8`。

## 约定与约束

- **workspace 成员范围**：仅 `packages/*`、`docs`、`play` 三个位置会被 pnpm 识别（`pnpm-workspace.yaml` 显式列出）。
- **Node/pnpm 版本**：根 `package.json` 的 `engines` 字段声明最低版本要求；CI 固定更高版本（Node 22、pnpm 11.7.0）。
- **TypeScript 严格模式**：根 `tsconfig.json` 启用 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns`、`isolatedModules`，所有 `.ts`/`.vue` 均受此约束。
- **ESLint/Prettier 统一规则**：根级 `eslint.config.js` 与 `.prettierrc.json` 覆盖整个 monorepo，脚本 `pnpm lint`、`pnpm format` 在根目录执行。
- **构建产物输出目录**：文档构建产物位于 `docs/.vitepress/dist`（见 `deploy-docs.yml` 的 `upload artifact` step）。
- **发布命名约定**：只有以 `v` 开头的 git tag 才会触发 npm 发布（`publish-npm.yml` 中 `on.push.tags: ['v*']`）。
- **peerDependency 策略**：`.npmrc` 设置 `strict-peer-dependencies=false`，允许安装时忽略 peer 冲突。
- **esbuild 预构建二进制跳过**：`pnpm-workspace.yaml` 中 `allowBuilds.esbuild: false`，因为 esbuild 的 prebuilt binary 由可选依赖提供，不需要运行其 postinstall 脚本。

## 未发现的配置形式

仓库中没有发现以下运行时配置机制：
- 没有 `.env`/`.env.*` 文件
- 没有 `application.properties`、`config.yaml`、`config.toml` 等运行时配置文件
- 没有在源码中发现读取环境变量或外部配置文件的逻辑
- 没有 feature flag 系统或远程配置中心集成

因此，本仓库的“配置系统”实质上是 **构建期与 CI/CD 期的静态配置**，而非应用运行时的动态配置加载。