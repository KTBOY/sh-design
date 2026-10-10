## 1. 使用的系统与工具

- **包管理器 / Monorepo**：pnpm workspace（`pnpm-workspace.yaml`），工作区包含 `packages/*`、`docs`、`play` 三个子项目。根 `package.json` 通过 `scripts` 以 `pnpm --filter <pkg>` 分派任务，无自定义 Makefile 或 shell 脚本作为入口。
- **组件库打包**：Vite（`packages/sh-design/vite.config.ts`），产物为 ESM (`dist/sh-design.js`) + CJS (`dist/sh-design.cjs`) + d.ts 类型声明（`vite-plugin-dts`）+ 样式 (`dist/style.css`)；`exports` 字段同时暴露 `.` 和 `./style.css` 两个入口。
- **文档站**：VitePress（`docs/.vitepress/config.ts`），本地开发/构建/预览由 `pnpm docs:dev|build|preview` 驱动。
- **代码质量**：ESLint 9（Flat Config，`eslint.config.js`）+ TypeScript（`vue-tsc`）+ Prettier（`.prettierrc.json`），统一在根 `package.json` 的 `lint` / `format` / `typecheck` 脚本中调用。
- **CI / 发布**：GitHub Actions（`.github/workflows/deploy-docs.yml`、`.github/workflows/publish-npm.yml`）；Windows 本地辅助脚本 `release.bat`。

## 2. 关键文件

- 根级编排：`package.json`（workspace scripts）、`pnpm-workspace.yaml`（工作区 + `allowBuilds` 白名单）、`.npmrc`、`tsconfig.json`、`eslint.config.js`、`.prettierrc.json`。
- 组件包：`packages/sh-design/package.json`（`main`/`module`/`types`/`exports`/`files`/`publishConfig`）、`packages/sh-design/vite.config.ts`、`packages/sh-design/scripts/sync-version.mjs`。
- 校验脚本：`scripts/check-components.mjs`（组件目录 → README/文档/侧边栏三处同步检查）。
- CI：`.github/workflows/deploy-docs.yml`（push main → build docs → deploy Pages）、`.github/workflows/publish-npm.yml`（push `v*` tag → OIDC Trusted Publishing → npm publish → 自动创建 GitHub Release）。
- 本地流程：`release.bat`（环境检查 → changelog 检查 → typecheck/lint/build/docs → 组件信息同步 → git add/commit/push → 可选打 tag 发版）。中文规范文档：`发布npm指南.md`、`组件发布流程.md`。

## 3. 架构与约定

### 3.1 版本与构建生命周期
- 版本号只维护在 `packages/sh-design/package.json` 中。
- `version` 钩子（`node ./scripts/sync-version.mjs && git add src/version.ts`）在 `npm version` 时自动把版本号写入 `src/version.ts`；`build` 钩子同样先执行 `sync-version.mjs`，保证 `dist` 中的 `version.ts` 与 package.json 一致。
- `prepublishOnly` 钩子执行 `npm run build`，确保 `npm publish` 前先完成构建。

### 3.2 组件发现与多源一致性约束
`scripts/check-components.mjs` 强制要求每个 `packages/sh-design/src/components/<name>/` 目录必须同时出现在三处：
1. 根 `README.md` 的组件表行
2. `docs/components/<name>.md` 文档页
3. `docs/.vitepress/config.ts` 侧边栏条目
任一缺失即 `process.exit(1)`，该检查被 `release.bat` 列为第 5 步，CI 未直接运行但可通过本地流程拦截。

### 3.3 pnpm workspace 安装策略
`pnpm-workspace.yaml` 显式 `allowBuilds` 白名单：默认允许所有依赖的 install/build 脚本，但关闭 `esbuild` 的 postinstall（其预编译二进制由 `@esbuild/<platform>` 提供），仅允许 `vue-demi` 的纯 JS postinstall。这构成“除白名单外禁止任意 postinstall”的约束。

### 3.4 运行时环境约束
- 根 `package.json` 的 `engines` 要求 `node >= 18.0.0`、`pnpm >= 8.0.0`。
- `release.bat` 额外要求 Node ≥ 22.13（因为 pnpm 11.7+ 需要该版本），并在不满足时直接中止。
- CI 固定使用 pnpm `11.7.0` + Node `22`。

### 3.5 发布流程（两条路径）
- **文档发布**：push 到 `main` 分支触发 `deploy-docs.yml`，安装依赖后执行 `pnpm docs:build`，将 `docs/.vitepress/dist` 上传并部署到 GitHub Pages。
- **npm 发布**：push `v*` 标签触发 `publish-npm.yml`，使用 npm OIDC Trusted Publishing（无需 NPM_TOKEN，仓库已在 npmjs.com 配置 Trusted Publisher），构建后 `npm publish --access public`，成功后用 `gh release create` 自动创建 GitHub Release。

### 3.6 本地发布助手
`release.bat` 串联完整验证链：Node 版本检查 → 读取当前版本 → 检查 `docs/guide/changelog.md` 是否存在对应版本条目（交互式确认）→ typecheck → lint → 组件库构建 → 文档构建 → 组件信息同步检查 → `git add -A` 并提交推送 → 可选打 `v<VER>` tag 触发 CI 发版。脚本会阻止重复 tag（`git rev-parse "v%VER%"` 失败则中止）。

## 4. 约定与规则

- **Monorepo 脚本必须经根 `package.json` 分发**：所有可执行命令均通过 `pnpm --filter <pkg>` 调用子包脚本，根脚本不直接调用 Vite/TSC 等工具。
- **版本号唯一来源是 `packages/sh-design/package.json`**：`src/version.ts` 由 `sync-version.mjs` 生成，不应手动编辑；`version` 钩子会自动 `git add` 变更。
- **新增组件必须补齐三处引用**：`scripts/check-components.mjs` 对 `README.md`、`docs/components/<name>.md`、`docs/.vitepress/config.ts` 做存在性检查，非零退出码会被 `release.bat` 阻断。
- **提交前需通过本地五步验证**：`release.bat` 明确列出 `typecheck → lint → build → docs:build → check-components` 的顺序，任何一步失败即中断。
- **npm 发布只能通过 tag 触发**：`publish-npm.yml` 监听 `tags: ['v*']`，且 `release.bat` 在打 tag 前会拒绝已存在的同名 tag。
- **pnpm install 禁止未知 postinstall**：`pnpm-workspace.yaml` 的 `allowBuilds` 白名单机制（`esbuild: false`、`vue-demi: true`）是显式策略，未在白名单中的依赖 postinstall 将被跳过。
- **CI 环境与 Node/pnpm 版本锁定**：两个 workflow 分别固定 `pnpm/action-setup@v4` with `version: 11.7.0` 和 `actions/setup-node@v4` with `node-version: 22`，与 `release.bat` 的 Node ≥ 22.13 要求保持一致。
- **文档站点构建产物目录固定**：`deploy-docs.yml` 上传 `docs/.vitepress/dist`，这是 VitePress 默认的 dist 路径，不得修改。
- **npm 包元数据**：`packages/sh-design/package.json` 定义 `main`/`module`/`types`/`exports`/`files`/`sideEffects`/`peerDependencies.vue ^3.2.0`/`publishConfig.access=public`，发布产物仅限 `dist` 与 `README.md`。

## 5. 适用性说明

本仓库是一个 Vue 3 组件库 monorepo，具备完整的构建（Vite）、测试（ESLint + vue-tsc）、打包（d.ts + CSS）、文档（VitePress）、CI（GitHub Actions Pages + npm OIDC Trusted Publishing）以及本地发布脚本（`release.bat`）链路，因此本分类完全适用。
