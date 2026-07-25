# AGENT.md · sh-design

> 本文件是给 AI 编码代理（以及新加入的人类开发者）的“项目操作手册”。它描述了 **sh-design** 的架构、约定、命令与红线，目的是让你在**不破坏现有约定**的前提下高效地完成开发、调试与发布。
>
> 阅读顺序建议：先看「项目概览」→「环境与命令」→「组件开发约定」，再按需查阅其余章节。

---

## 1. 项目概览

**sh-design** 是一个**面向业务场景的 Vue 3 组件库**——强调功能性、开箱即用、TypeScript 友好。它不满足于提供 Button / Input 这类基础原语，而是聚焦“复制、懒加载图片、导出、权限”等真实业务里反复要写的**功能型组件**。

- **包名（npm）**：`sh-design`
- **仓库**：`https://github.com/KTBOY/sh-design`
- **文档站**：`https://ktboy.github.io/sh-design/`（GitHub Pages，base 为 `/sh-design/`）
- **作者 / License**：shukezlc / MIT
- **当前对外版本**：见 [`packages/sh-design/package.json`](packages/sh-design/package.json) 的 `version` 字段
- **核心特性**：
  - 业务组件优先（而非基础原语堆砌）
  - Vue 3 `<script setup>` + Vite 库模式构建，输出 **ESM + CJS**，支持 Tree-Shaking
  - 完整 `.d.ts` 类型声明，Props / Emits / Slots 全程可推导
  - CSS 变量驱动的设计令牌（覆盖即换肤）
  - 两种用法：`app.use(ShDesign)` 全量注册 或 按需 `import { ShLazyImage }`

### 已实现组件

| 组件 | 说明 | 源码目录 |
| --- | --- | --- |
| `ShCopyButton` | 一键复制文本，内置成功反馈 | `packages/sh-design/src/components/copy-button/` |
| `ShLazyImage` | 懒加载图片：骨架屏 + 淡入 + 失败兜底（图 + 文案，可插槽自定义） | `packages/sh-design/src/components/lazy-image/` |

### 已实现 Composable

| Composable | 说明 | 源码 |
| --- | --- | --- |
| `useClipboard` | 响应式剪贴板：`copied` 状态自动复位 + `copy()` 能力 | `packages/sh-design/src/hooks/use-clipboard.ts` |

---

## 2. 技术栈

| 领域 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup lang="ts">`，Composition API） |
| 语言 | TypeScript 5.6（`strict` 模式） |
| 构建（库） | Vite 5 库模式 + `vite-plugin-dts`（生成类型声明） |
| 文档站 | VitePress 1.5 |
| 包管理 | pnpm workspace（Monorepo） |
| 代码规范 | ESLint 9（Flat Config）+ Prettier 3 |
| 类型检查 | `vue-tsc` |
| CI/CD | GitHub Actions（文档部署 + npm 可信发布 OIDC） |

---

## 3. 仓库结构（Monorepo）

pnpm workspace，工作区定义见 [`pnpm-workspace.yaml`](pnpm-workspace.yaml)：`packages/*`、`docs`、`play`。

```
sh-ui/
├── packages/sh-design/        # 【核心】组件库源码，唯一对外发布的包（npm: sh-design）
│   ├── src/
│   │   ├── components/        # 所有组件（每个组件一个子目录）
│   │   │   ├── copy-button/
│   │   │   │   ├── index.ts           # 用 withInstall 包装并导出 ShXxx
│   │   │   │   └── src/
│   │   │   │       ├── copy-button.ts  # props / emits / 类型定义
│   │   │   │       └── copy-button.vue # 组件实现
│   │   │   ├── lazy-image/    # 结构同上
│   │   │   └── index.ts       # 汇总 re-export 所有组件
│   │   ├── hooks/             # 组合式函数（useClipboard 等）
│   │   ├── utils/             # 工具：install.ts（withInstall/makeInstaller）、clipboard.ts
│   │   ├── styles/            # 全局样式与设计令牌（var.css = CSS 变量）
│   │   ├── assets/            # 资源（如 image-error 兜底图，已内联为 data URL）
│   │   ├── index.ts           # 库入口：默认导出插件 + 按需具名导出
│   │   └── version.ts         # ⚠️ 自动生成，勿手改（由 sync-version.mjs 生成）
│   ├── scripts/sync-version.mjs   # 从 package.json 同步 version.ts
│   ├── vite.config.ts         # 库构建配置
│   ├── tsconfig.json
│   └── package.json           # 发布配置（exports / files / publishConfig）
├── docs/                      # VitePress 文档站（@sh-design/docs，private）
│   ├── .vitepress/config.ts   # 站点配置：nav / sidebar / alias(sh-design→src)
│   ├── guide/                 # 指南：introduction/installation/quickstart/changelog
│   ├── components/            # 每个组件一页文档（copy-button.md / lazy-image.md）
│   └── public/                # 静态资源（首页视频等）
├── play/                      # 本地组件调试场（@sh-design/play，private）
│   └── src/App.vue            # 调试用页面，改 src 实时生效
├── .github/workflows/         # deploy-docs.yml（文档部署）+ publish-npm.yml（npm 发布）
├── eslint.config.js           # ESLint Flat Config（根级统一）
├── .prettierrc.json           # Prettier 规则（根级统一）
├── tsconfig.json              # 根 tsconfig（含 sh-design 路径别名）
├── RELEASING.md               # 发布指南（维护者必读）
└── package.json               # 根脚本（dev/build/docs/lint/format/typecheck）
```

**关键点**：
- `packages/sh-design` 是**唯一对外发布**的包；`docs` 与 `play` 均为 `private: true`，仅用于开发。
- `docs` 与 `play` 通过 Vite **alias** 把 `sh-design` 直接指向 `packages/sh-design/src/index.ts`，因此调试 / 文档 demo **无需先构建库**，改源码即时生效。
- 工作区内部依赖使用 `workspace:*` 协议（见 `docs/package.json`、`play/package.json`）。

---

## 4. 环境要求与常用命令

### 环境要求

- `package.json > engines`：**Node ≥ 18、pnpm ≥ 8**（历史下限）。
- **实际环境（推荐 / CI 使用）**：**Node 22、pnpm 11.7**。
- ⚠️ **重要坑**：pnpm 11.7+ 依赖 `node:sqlite`，要求 **Node ≥ 22.13**，否则 `pnpm install` 会因 `node:sqlite` 模块报错。CI 若用 Node 20 会崩。**本地务必使用 Node 22.13+**。
- 包管理器**统一用 pnpm**（安装依赖、跑脚本）。**发布环节例外，见第 9 节：必须用 `npm`。**

### 常用命令（在仓库根目录执行）

| 命令 | 作用 | 底层 |
| --- | --- | --- |
| `pnpm install` | 安装全部工作区依赖 | — |
| `pnpm dev` / `pnpm play` | 启动组件调试场（Vite） | `--filter @sh-design/play dev` |
| `pnpm build` | 构建组件库（产出 `dist/`） | `--filter sh-design build` |
| `pnpm docs:dev` | 本地预览文档站 | `--filter @sh-design/docs docs:dev` |
| `pnpm docs:build` | 构建文档站 | `--filter @sh-design/docs docs:build` |
| `pnpm docs:preview` | 预览已构建的文档站（端口 4173） | — |
| `pnpm lint` | ESLint 检查全仓 | `eslint .` |
| `pnpm lint:fix` | ESLint 自动修复 | `eslint . --fix` |
| `pnpm format` | Prettier 格式化 `ts/tsx/vue/js/json/md` | — |
| `pnpm typecheck` | 组件库类型检查 | `vue-tsc --noEmit`（仅 `sh-design`） |

> `pnpm build` 会先运行 `scripts/sync-version.mjs` 同步 `version.ts`，再执行 `vite build`。

### 提交 / 发布前的“三件套”校验

```bash
pnpm lint
pnpm typecheck
pnpm build
```

---

## 5. 代码规范

规范由根级 [`eslint.config.js`](eslint.config.js) 与 [`.prettierrc.json`](.prettierrc.json) 统一约束。**写代码时务必贴合以下风格**（也可直接 `pnpm format` + `pnpm lint:fix`）。

### Prettier（`.prettierrc.json`）

- **不加分号**（`semi: false`）
- **单引号**（`singleQuote: true`）
- 行宽 **100**（`printWidth: 100`）
- **不加尾逗号**（`trailingComma: "none"`）
- 箭头函数参数**总是带括号**（`arrowParens: "always"`）
- 换行符 **LF**（`endOfLine: "lf"`）
- Vue 的 `<script>` / `<style>` 内容**不额外缩进**

### ESLint（Flat Config）

- 基座：`@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-vue` flat/recommended + `eslint-config-prettier`（关闭与 Prettier 冲突的格式规则）。
- 已放宽的规则：
  - `vue/multi-word-component-names`: `off`
  - `@typescript-eslint/no-explicit-any`: `off`（允许 `any`，但请克制）
  - `@typescript-eslint/no-unused-vars`: `error`，但**忽略以 `_` 开头**的参数 / 变量
- 忽略目录：`**/dist/**`、`**/node_modules/**`、`**/scripts/**`、`**/.vitepress/{cache,dist}/**`

### TypeScript（根 `tsconfig.json`）

- `strict: true`、`noUnusedLocals`、`noUnusedParameters`、`noImplicitReturns` 全开——**不要留未使用的变量/参数**（确需保留用 `_` 前缀）。
- `moduleResolution: "Bundler"`、`target: ES2020`、`module: ESNext`。
- 路径别名：`sh-design` → `packages/sh-design/src/index.ts`（根 tsconfig 已配）。

---

## 6. 组件开发约定（★ 最重要）

所有组件遵循**统一的目录结构与命名约定**。新增组件时**照抄 `copy-button` 的模式**即可。

### 6.1 命名约定

- **组件导出名**：`Sh` + 帕斯卡命名，如 `ShCopyButton`、`ShLazyImage`。
- **组件 `name` 选项**：与导出名一致，在 `.vue` 中用 `defineOptions({ name: 'ShXxx' })` 声明（`app.use` 全量注册时以此作为标签名）。
- **目录名 / 文件名**：kebab-case，如 `copy-button/`、`copy-button.vue`、`copy-button.ts`。
- **CSS 类名**：`sh-` 前缀 + BEM 风格：
  - 块：`.sh-copy-button`
  - 元素：`.sh-copy-button__icon`、`.sh-copy-button__label`
  - 修饰符（类型/尺寸）：`.sh-copy-button--primary`、`.sh-copy-button--small`
  - 状态：`.is-copied`、`.is-disabled`（`is-` 前缀）
- **CSS 变量（设计令牌）**：`--sh-` 前缀，如 `--sh-color-primary`、`--sh-radius`。

### 6.2 单组件目录结构

以 `copy-button` 为例：

```
components/copy-button/
├── index.ts                 # 出口：withInstall 包装 + re-export 类型
└── src/
    ├── copy-button.ts       # props / emits / 相关类型（不含渲染逻辑）
    └── copy-button.vue      # <script setup> 组件实现 + scoped 样式
```

**`index.ts` 模板**（照抄，替换名字即可）：

```ts
import { withInstall } from '../../utils/install'
import CopyButton from './src/copy-button.vue'

export const ShCopyButton = withInstall(CopyButton)
export default ShCopyButton

export * from './src/copy-button'                       // 导出 props/emits/类型

export type CopyButtonInstance = InstanceType<typeof CopyButton>
```

### 6.3 Props / Emits 的写法

Props、Emits、及其派生类型**集中定义在 `xxx.ts`**（与 `.vue` 分离，便于复用与类型导出）：

```ts
import type { ExtractPropTypes, PropType } from 'vue'

export type CopyButtonType = 'primary' | 'default' | 'text'

export const copyButtonProps = {
  /** 每个 prop 都要写 JSDoc 注释，说明用途 */
  text: { type: String, default: '' },
  // 联合字面量类型用 `String as PropType<...>`
  type: { type: String as PropType<CopyButtonType>, default: 'default' },
  disabled: { type: Boolean, default: false }
}
export type CopyButtonProps = ExtractPropTypes<typeof copyButtonProps>

// Emits 用带校验函数的对象形式（同时承担运行时校验 + 类型来源）
export const copyButtonEmits = {
  success: (payload: { text: string }) => typeof payload.text === 'string',
  error: (payload: { error: Error }) => payload.error instanceof Error
}
export type CopyButtonEmits = typeof copyButtonEmits
```

**约定要点**：
- 用**对象式 props**（不是数组），每项写默认值与 JSDoc。
- 联合字面量类型用 `type: String as PropType<Xxx>`。
- Emits 用**校验函数对象**（既是类型来源，又做运行时校验）。
- 尺寸相关的可接受 `string | number`（数字按 px 处理，参考 `lazy-image` 的 `toSize`）。

### 6.4 `.vue` 实现约定

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { copyButtonProps, copyButtonEmits } from './copy-button'
import { useClipboard } from '../../../hooks/use-clipboard'

defineOptions({ name: 'ShCopyButton' })       // ← 必须，等于组件注册名

const props = defineProps(copyButtonProps)
const emit = defineEmits(copyButtonEmits)

// class 用 computed 拼接，块名 + 修饰符 + 状态
const classes = computed(() => [
  'sh-copy-button',
  `sh-copy-button--${props.type}`,
  { 'is-disabled': props.disabled }
])
</script>

<template>
  <!-- 用 slot 提供自定义能力，作用域参数传出内部状态 -->
</template>

<style scoped>
/* 一律使用设计令牌变量，不要写死颜色/圆角/字号 */
.sh-copy-button {
  background: var(--sh-color-bg);
  border-radius: var(--sh-radius);
  transition: background-color var(--sh-transition);
}
</style>
```

**约定要点**：
- `defineOptions({ name: 'ShXxx' })` **必写**。
- 样式用 `<style scoped>`，**颜色/圆角/字号/过渡一律引用 `--sh-` 设计令牌**（见 `styles/var.css`），不要硬编码。
- 交互反馈优先复用 hooks（如复制逻辑用 `useClipboard`）。
- 无障碍：装饰性图标加 `aria-hidden`，图片给 `alt`。
- 尽量提供插槽（`slot`）与作用域参数，便于使用者自定义（如 `ShLazyImage` 的 `#error`、`#placeholder` 插槽）。

### 6.5 设计令牌（`styles/var.css`）

所有可主题化的值集中在 `:root` 下的 CSS 变量，分组：Brand / Neutral / Status / Radius / Typography / Motion。新增令牌请遵循 `--sh-<category>-<name>` 命名，并优先复用已有变量：

```
--sh-color-primary / -hover / -active   品牌色
--sh-color-text / -text-secondary        文本
--sh-color-border / -bg / -bg-hover / -bg-active
--sh-color-success                        状态色
--sh-radius-sm / --sh-radius              圆角
--sh-font-size-sm / -base / -lg           字号
--sh-transition                           过渡
```

样式聚合链路：组件 `scoped` 样式引用变量 → `styles/index.css` `@import './var.css'` → `src/index.ts` 里 `import './styles/index.css'` 打包进库（构建产出 `dist/style.css`，使用者需另行 `import 'sh-design/dist/style.css'`）。

---

## 7. 库入口与打包产物

### 入口 [`src/index.ts`](packages/sh-design/src/index.ts)

- **默认导出**：`ShDesign` 插件对象（`{ version, install }`），供 `app.use(ShDesign)` 全量注册。
- **具名导出**：所有组件（`export * from './components'`）、hooks、部分 utils（`copyText`/`withInstall`/`makeInstaller`）、`version`。
- 入口顶部 `import './styles/index.css'` 把设计令牌打进产物。

### 注册机制 [`utils/install.ts`](packages/sh-design/src/utils/install.ts)

- `withInstall(comp)`：给单个组件挂 `install`，使其**既能 `app.use(单组件)`，又能按需 import**。
- `makeInstaller(components)`：把组件数组聚合成库级 `install`，实现 `app.use(ShDesign)` 一次性注册全部。

### 构建产物（`pnpm build` → `dist/`）

由 [`vite.config.ts`](packages/sh-design/vite.config.ts) 库模式产出：

- `sh-design.js`（ESM）、`sh-design.cjs`（CJS）——`vue` 被 external，不打进包。
- `index.d.ts` 等类型声明（`vite-plugin-dts`，镜像 `src` 结构，含单一入口 `index.d.ts`）。
- `style.css`（设计令牌样式）。
- `minify: false`（保留可读输出，压缩交给使用者）。
- `package.json > exports` 映射：`.`（types/import/require）、`./dist/style.css`、`./style.css`、`./package.json`；`files` 仅发布 `dist` + `README.md`；`sideEffects` 标记 `**/*.css` 以保护 CSS 不被 Tree-Shaking 误删。

---

## 8. 版本管理

- **单一事实来源**：`packages/sh-design/package.json` 的 `version`。
- **`src/version.ts` 是自动生成的**（`scripts/sync-version.mjs` 从 package.json 读取），**严禁手改**：
  - `pnpm build` 前会自动同步；
  - `npm version` 时通过 `version` 生命周期脚本同步并 `git add src/version.ts`（升版本提交自动含它）。
- **版本号需三处一致**：`docs/guide/changelog.md` 顶部版本 = `package.json` version = 文档站 nav 版本徽标（`docs/.vitepress/config.ts`）。
- 遵循 **SemVer**：修复 → `patch`；新增组件/能力 → `minor`（`0.x` 阶段可用 minor 承载新功能）；破坏性变更 → `major`。

---

## 9. 发布流程（维护者，详见 [`RELEASING.md`](RELEASING.md)）

> ⚠️ 发布涉及对外动作，属于不可逆操作，**未获明确授权不要擅自执行发布命令**。

### 关键红线

1. **registry 坑**：本机全局 registry 指向淘宝镜像 `registry.npmmirror.com`（**只读、不能发布**）。无需手动切换——`package.json > publishConfig` 已强制发布到官方源 `https://registry.npmjs.org/`。发布前确认已登录官方源：`npm whoami --registry=https://registry.npmjs.org`。
2. **2FA / OTP 坑**：npm 账户开启了 2FA + 安全密钥（passkey）。
   - **`pnpm publish` 会失败**（`ERR_PNPM_OTP_NON_INTERACTIVE`，非交互终端无法完成安全密钥验证）。
   - **必须改用原生 `npm publish`**，用 `--otp=<6位验证码或恢复码>` 传入。
   - 恢复码是一次性敏感凭据，**绝不提交到仓库或粘贴到公开场合**。

### 手动发布（本地）

```powershell
# 1. 校验
pnpm lint; pnpm typecheck; pnpm build
# 2. 升版本号（在组件库目录内执行；会自动同步 version.ts 并进入升版本提交）
cd packages\sh-design
npm version patch      # 或 minor / major
# 3. 发布（prepublishOnly 会自动重新 build）
npm publish --otp=<验证码或恢复码>
# 4. 推送版本提交与 tag
cd ..\..
git push --follow-tags
```

### 自动发布（推荐：Trusted Publishing / OIDC）

`.github/workflows/publish-npm.yml` 已配置为 **OIDC 可信发布**（`id-token: write`，无需任何 `NPM_TOKEN`）。流程：`npm version` 升版本 → `git push --follow-tags` → 在 GitHub **Releases → Draft a new release** 选中该 tag 发布 → 工作流自动安装依赖、`pnpm build`、`npm publish`（附带 provenance）。

### 发布检查清单

- [ ] `pnpm lint` / `pnpm typecheck` / `pnpm build` 全绿
- [ ] 已更新组件文档页（`docs/components/`）**与更新日志**（见第 11 节）
- [ ] 按 SemVer 正确升级版本号（三处一致）
- [ ] `npm publish` 成功（或 GitHub Release 触发工作流成功）
- [ ] `git push --follow-tags` 已推送
- [ ] `npm view sh-design` 显示新版本

---

## 10. CI / CD（GitHub Actions）

| 工作流 | 触发 | 作用 |
| --- | --- | --- |
| [`deploy-docs.yml`](.github/workflows/deploy-docs.yml) | push 到 `main` / 手动 | `pnpm docs:build` → 部署 GitHub Pages |
| [`publish-npm.yml`](.github/workflows/publish-npm.yml) | Release published / 手动 | OIDC 可信发布到 npm（无 token） |

- 两个工作流均使用 **pnpm 11.7.0 + Node 22**，安装用 `pnpm install --no-frozen-lockfile`。
- ⚠️ GitHub Actions 匿名 API 访问**不返回 CI 错误日志**——排查失败需登录或用 token 拉取日志。

---

## 11. 更新日志规则（★ 强制）

> 触发条件：本次改动涉及**组件库对外能力**时**必须**同步更新 [`docs/guide/changelog.md`](docs/guide/changelog.md)。

**必须记录的改动**：
- 新增 / 删除 / 重命名组件（`packages/sh-design/src/components/**`）
- 修改已有组件的 props / emits / slots / 默认值 / 行为
- 新增或修改 hooks（`packages/sh-design/src/hooks/**`）等对外 API

**不强制记录**：纯文档 / 演示（docs）/ 样式站点 / 构建 / CI 改动。

**写法**（在文件**顶部按版本倒序**新增条目）：
1. 版本号（SemVer）
2. 发布日期：`<sub>YYYY-MM-DD</sub>`
3. 分类小节（按需）：`### ✨ 新增`、`### 🔧 修改`（破坏性变更前缀 `⚠️ Breaking:`）、`### 🐛 修复`
4. 用反引号标注组件名（如 `` `ShLazyImage` ``），一句话说清“改了什么 + 影响/价值”，风格对齐已有条目。
5. 尚未发布的累积改动可先记在顶部 `## 未发布 (Unreleased)`，发版时替换为正式「版本号 + 日期」。

---

## 12. 新增一个组件的完整流程（Checklist）

假设新增 `ShExport`（导出按钮）：

1. **建目录**：`packages/sh-design/src/components/export/`，内含 `index.ts` 与 `src/export.ts` + `src/export.vue`（照抄 `copy-button` 结构）。
2. **写类型**：在 `src/export.ts` 定义 `exportProps` / `exportEmits` 及派生类型（对象式 props + JSDoc）。
3. **写实现**：`src/export.vue` 用 `<script setup>`，`defineOptions({ name: 'ShExport' })`，样式用 `--sh-` 令牌 + `sh-export` BEM 类名。
4. **导出组件**：`index.ts` 用 `withInstall` 包装导出 `ShExport` + re-export 类型。
5. **登记到组件汇总**：在 [`src/components/index.ts`](packages/sh-design/src/components/index.ts) 加 `export * from './export'`。
6. **登记到库入口**：在 [`src/index.ts`](packages/sh-design/src/index.ts) `import { ShExport }` 并加入 `components` 数组（保证 `app.use(ShDesign)` 全量注册包含它）。
7. **加文档页**：新增 `docs/components/export.md`（参考 `copy-button.md`：基础用法 + 各能力演示 + API 表格 Props/Events/Slots），并在 [`docs/.vitepress/config.ts`](docs/.vitepress/config.ts) 的 sidebar 增加入口。
8. **加调试用例**（可选）：在 `play/src/App.vue` 加一个 demo 便于本地联调。
9. **更新日志**：按第 11 节在 `changelog.md` 顶部补条目。
10. **更新 README**：在“组件 Components”表格补一行（对外可见列表）。
11. **校验**：`pnpm lint && pnpm typecheck && pnpm build`。

---

## 13. 重要注意事项 / 红线速查

- 🚫 **不要手改 `src/version.ts`**——它是自动生成的。
- 🚫 **发布不要用 `pnpm publish`**——用 `npm publish --otp=...`（2FA 安全密钥限制）。
- 🚫 **不要在样式里硬编码颜色/圆角/字号**——用 `--sh-` 设计令牌。
- 🚫 **不要漏更新 `changelog.md`**——组件对外能力变化时强制同步。
- 🚫 **不要遗漏组件注册的两处登记**——`components/index.ts`（按需导出）+ `index.ts` 的 `components` 数组（全量注册）。
- ⚠️ **Node 版本**：本地务必 **≥ 22.13**（pnpm 11.7+ 的 `node:sqlite` 依赖）。
- ⚠️ **改组件后要同步文档页**（`docs/components/`）与 nav 版本徽标（发版时）。
- ✅ **调试免构建**：`docs` / `play` 已 alias 到源码，改 `src` 实时生效，无需先 `pnpm build`。
- ✅ **提交前跑三件套**：`pnpm lint` / `pnpm typecheck` / `pnpm build`。
- ✅ **代码风格**：无分号、单引号、行宽 100、无尾逗号、LF——不确定就 `pnpm format`。

---

## 14. 关联资料

- 使用者文档：[`README.md`](README.md) / 文档站 `https://ktboy.github.io/sh-design/`
- 维护者发布指南：[`RELEASING.md`](RELEASING.md)
- 更新日志：[`docs/guide/changelog.md`](docs/guide/changelog.md)
- 组件参考实现：`packages/sh-design/src/components/copy-button/`（最简范式）、`lazy-image/`（含插槽/状态机的进阶范式）
