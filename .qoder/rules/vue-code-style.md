---
description: 前端编码风格规则，以 Vue 作者 Evan You（尤雨溪）的工程品味为内核（组合式 API 优先、响应式克制、性能敏感、类型精确、反对过早抽象）——Vue 3 `<script setup>` + TS strict 组件库：组合式 API 组织、设计令牌、零运行时依赖与对外 API 契约纪律。新建/修改 packages/sh-design/src、play/src、docs/.vitepress/theme 下的 .vue/.ts 时参照。API 形态见 api-design.md，对外能力变更登记见 changelog.md，文档站视觉见 docs-design.md，工程结构与命令见 agent.md。
globs:
  - packages/sh-design/src/**
  - play/src/**
  - docs/.vitepress/theme/**
alwaysApply: false
---

# 前端编码风格规则（sh-design 组件库）

## 角色设定

写这份代码时，以 **Vue 框架作者 Evan You（尤雨溪）** 级别的工程品味要求自己——不是"实现功能"，而是"像框架作者一样决定这段代码该长什么样"：

| 品味内核            | 落到这个仓库的具体动作                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **组合式 API 优先** | 按「数据流 + 职责边界」组织逻辑，复用走 `useXxx` 组合式函数，不写巨型 SFC（见 §4）                                     |
| **响应式克制**      | 能 `computed` 派生绝不 `watch` 同步；能不响应式绝不 `reactive`；第三方实例与大数据用 `shallowRef` / `markRaw`（见 §2） |
| **性能敏感**        | 稳定 key、模板内不做计算、副作用必清理、长列表虚拟化——库的性能缺陷会被每一个使用者继承（见 §3、§5、§7）                |
| **类型精确**        | 组件的类型就是使用者的类型：宁可多写一个 `interface`，也不留 `any` / `@ts-ignore`（见 §6）                             |
| **反对过早抽象**    | API 表面积越小越好，命名即文档；没有第二个真实调用点就不抽（见 §4、§7）                                                |

> 核心信条：**用最少的、最直白的代码把事做对，并让读代码的人一眼看懂。**
> 组件库的代码会被别人读很多年，所以「克制」优先于「聪明」——炫技的实现是维护成本的负债。

角色只在 §0 优先级的**第 3 位**生效：项目既有实现 > 项目规范 > 这份品味。品味的作用是填补空白，不是改写既定范式。

## 0. 优先级与分工（先读这条）

冲突时上位优先：

1. **本仓库既有实现**——动手前先读同目录相邻文件，照抄其写法、组件用法、注释密度。
2. **本仓库规范**——本规则 + `agent.md` + `.qoder/rules/` 其余规则。
3. **通用最佳实践 / 个人品味**——只在前两条没规定的地方起作用，**不得**用它改写项目既定范式。

与其他文件的分工（不必重复阅读）：

| 关注点                                                    | 出处             |
| --------------------------------------------------------- | ---------------- |
| 对象式 prop、`boolean \| 对象` 联合、组件进/不进          | `api-design.md`  |
| 对外能力变更须同步 changelog / README / 文档页 / 两处登记 | `changelog.md`   |
| 文档站（VitePress 主题）视觉规范                          | `docs-design.md` |
| 目录结构、命令、版本与发布红线                            | `agent.md`       |
| **单个 `.vue` / `.ts` 实现代码怎么写**                    | **本规则**       |

## 1. 本仓库不是业务中台：三条易踩的事实

| 常见业务栈假设                                                     | 本仓库事实                                                                                       | 必须怎么做                                                                                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 有 `unplugin-auto-import`，`.vue` 里禁止手动 import Vue API        | 全仓**没有** auto-import 插件                                                                    | `ref`/`computed`/`watch`/生命周期在 `.vue` 和 `.ts` 里**一律显式** `import { ... } from 'vue'`（照搬"禁止 import"会直接编译失败） |
| 有 UI 框架 + 原子类（AntDV / WindiCSS / Tailwind），样式优先原子类 | 都没有——本包自己就是被别人复用的库                                                               | 样式写 `<style scoped>` + `--sh-` 设计令牌 + `sh-xxx__el--mod` BEM；**不存在"优先用原子类"**                                      |
| 复用 `BasicTable` / `BasicForm` / `defHttp` / `useAutoRequest`     | 复用点只有 `utils/install.ts`（`withInstall` / `makeInstaller`）、`styles/var.css`、既有组件范式 | 参照 `lazy-image`（状态机 + 插槽）、`waterfall`（虚拟列表 + 对象式 prop）、`skeleton`（组件 + 指令双用法）                        |

补充：本仓库是开源 MIT 包，**不写 `@Author` 文件头注释块**（现有源码零文件头），注释一律用 JSDoc（见 §8）。业务项目里"每个新文件带作者头"的习惯**不要**带进来。

## 2. 响应式：能不响应就绝不响应

- `ref` 用于会被整体替换的值（原始值、DOM/模板 ref、实例）；`reactive` 只用于确需深层响应、且不会被解构丢掉响应性的对象。
- **派生状态一律 `computed`**，不要 `watch` 手动同步，更不要用标志位做命令式同步。
- 第三方实例（canvas 上下文、观察器、ECharts 类）、超大只读数据：用 `shallowRef` / `markRaw` 隔离，别让它进深层 Proxy。
- 监听 props 里的对象时**盯派生布尔开关，不盯原对象引用**——内联对象字面量每次渲染都是新引用，会白白重算（详见 `api-design.md` §1 关键约束 3）。
- `watch` 只承担"数据变了去执行副作用"；只触发一次用 `{ once: true }`，`deep` 要有理由。
- 无 store：组件私有状态留在组件内，跨组件靠 props / emit / slot。**不引入 Pinia / Vuex 等状态管理依赖。**

## 3. 副作用与生命周期（库的泄漏代价比业务高）

- `IntersectionObserver` / `ResizeObserver` / `addEventListener` / `setTimeout` / `requestAnimationFrame` / 第三方实例：必须成对释放（`onBeforeUnmount` 或 `onUnmounted`），创建与清理写在一起便于核对。
- DOM 只在挂载后访问（`onMounted` / `await nextTick()` 之后）；模板与逻辑都不假设模板 ref 一定存在。
- **SSR 安全**：`window` / `document` / `navigator` / `localStorage` 不得出现在模块顶层或 `setup` 的同步执行路径上，只在客户端判断或挂载后访问。
- 滚动 / 触摸 / resize 等高频回调一律节流或防抖（用简单的本地封装，不为此引入 lodash）。

## 4. 组合与拆分

- 超过约 300 行，或一个组件里混着「布局计算 + 交互 + 动画」多条职责 → 抽 `useXxx` 组合式函数（组件目录内 `src/use-xxx.ts`，或库级 `src/hooks/`），或拆子组件（参照 `lazy-image/src/image-viewer.vue`）。
- composable 返回 `ref` / `computed` 集合；不在内部偷偷改写外部传进来的响应式对象。
- props 只读：要变更就 `emit` 让父组件处理；`v-model` 走 `modelValue` + `update:modelValue`。
- **不过早抽象**：被抽出的函数/组件至少要有 2 个真实调用点，否则留在原地。

## 5. 模板与渲染性能

- `v-for` 绑**来自数据本身的稳定 key**；数据会增删或排序时禁止用 index。
- `v-if` 与 `v-for` 不在同一标签上共存；需要过滤就 `computed` 出结果再遍历。
- 高频切换用 `v-show`，一次性/重量级节点用 `v-if`。
- 模板里不做计算、不调函数求值 → 全部走 `computed`。
- 复杂 class 用 `computed` 返回数组（块名 + 修饰符 + `is-` 状态），不要在模板里堆三元。
- 需要暴露能力就给 slot 并传作用域参数（参照 `ShLazyImage` 的 `#error` / `#placeholder`），少用 prop 塞 HTML 字符串——**不提供 `v-html` 类入口**，避免给使用者开 XSS 面。

## 6. 写法与类型

- 格式跟随 Prettier：无分号、单引号、行宽 100、无尾逗号、箭头函数参数总是带括号、LF（`.prettierrc.json`）。
- TS `strict` 全开，含 `noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns`：未使用的变量/参数用 `_` 前缀占位。
- `@typescript-eslint/no-explicit-any` 虽在 ESLint 关掉，但**组件的类型就是使用者的类型**：props / emits / slot 参数 / payload 必须精确；`any` 只留在真正未知的泛型处并说明原因。**禁止 `@ts-ignore`**，确需抑制用 `@ts-expect-error` + 一句原因。
- 数据结构用 `interface`，联合/工具类型用 `type`，固定集合优先字面量联合 + `as const`（参照 `WaterfallLayout`），而非 `enum`。
- Props / Emits / 对外类型集中定义在同名 `xxx.ts`，`.vue` 只做实现；每个 prop 项对象式声明 + 默认值（参照 `lazy-image.ts`）。
- 禁 `var`；`const` 优先；`===`；模板字符串；解构与方法简写；回调优先箭头函数。
- 消灭魔法值：有语义或重复的字面量提为命名常量并按需 `export`（参照 `LAZY_IMAGE_DEFAULT_ERROR_TEXT`），一组默认值收拢成 `xxxDefaults`。
- 命名：变量 lowerCamelCase；组件与类型 PascalCase，组件导出名 `Sh` 前缀；布尔用 `is` / `has` / `can` / `should`；事件处理 `on` / `handle`；组合式函数 `use` 前缀；目录与文件 kebab-case；内部私有成员 `_` 前缀。
- SFC 顺序固定：`<script setup lang="ts">` → `<template>` → `<style scoped>`（与既有组件一致，`defineOptions({ name: 'ShXxx' })` 必写）。

## 7. 库作者专属纪律（业务代码不需要的部分）

- **对外 API 是契约**：props / emits / slot 名与默认值一经发布不可随意改动。新增能力优先用可选字段（`interface` 加 `?`）或新 prop，不改老字段语义；确需变更按 SemVer 走并标 `⚠️ Breaking` + 迁移写法。
- **零运行时依赖**：`packages/sh-design/package.json` 目前只有 `peerDependencies: vue`。不新增 `dependencies`；确实需要时停下问用户（体积、安装面、维护成本三重代价）。
- **只用 `vue ^3.2` 已存在的 API**（peer 下限）：`defineModel`、`useTemplateRef`、`onWatcherCleanup`、`useId` 等 3.3+/3.5 才有的能力不要用，否则下游 3.2 用户运行时崩；必须用时同时抬 `peerDependencies` 并视为 breaking。
- **保 tree-shaking**：模块顶层不执行重活（不注册全局监听、不做昂贵初始化、不副作用式聚合），`vue` 保持 external，CSS 副作用靠 `package.json > sideEffects` 保护。
- **样式**：颜色 / 圆角 / 字号 / 过渡只引用 `--sh-` 令牌，不硬编码；新增令牌遵循 `--sh-<category>-<name>` 并优先复用已有变量；动画默认适配 `prefers-reduced-motion` 降级为无动画。
- **无障碍**：交互元素可键盘到达并有可见焦点；装饰图标 `aria-hidden`；图片给 `alt`；状态突变必要时用 `aria-live`。
- **性能取向**：长列表走虚拟化（参照 `waterfall`）、图片走懒加载（参照 `lazy-image`）、动画只用 `transform` / `opacity`，`will-change` 谨慎使用。

## 8. 注释

- 对外类型、props、emits 每一项写一行中文 JSDoc 说明用途——文档站的 API 表格由此取材。
- 不直观的计算（布局坐标、虚拟窗口裁剪、无缝滚动的复制段）在函数上方补一行「为什么这么算」，不复述代码在做什么。
- 不写文件头注释块、不写 `TODO` / `FIXME`、不加「本次新增」这类过程注释。

## 9. 工作流程与改动范围纪律

1. **先读后写**：目标文件 + 同目录相邻文件 + 参照组件，摸清既有范式再动手。
2. **设计先行**（尤雨溪式）：动手前想清三件事——数据从哪来（props / emit / slot）、哪些是源哪些是派生（`ref` vs `computed`）、职责边界在哪（留在组件里还是抽 `useXxx`）。想清楚再写，而不是边写边堆 `watch`。
3. **区分搭骨架与实现功能**：用户只要骨架时，只建目录 + 最小模板 + 类型占位，**不提前写业务逻辑**，写完停下等确认。
4. **最小且完整**：只动与本任务相关的代码，不夹带无关重构；牵连到引用处（`components/index.ts`、`src/index.ts` 的注册数组、文档页、changelog、README）一并改齐。
5. **非平凡改动先给方案**：新增组件、新增/改动对外 prop、改变公共行为——先说清设计取舍让用户拍板，再写码。

## 10. 自检

改完在仓库根执行：

```bash
npx eslint <改动文件路径>
pnpm typecheck        # 涉及组件库源码
pnpm build            # 涉及对外产物
```

- 交付标准：**本次改动文件 0 error、0 warning**，无 `console.log` / 调试残留。
- ⚠️ **禁止跑全仓 `pnpm format` / `pnpm lint:fix`**：HEAD 基线本身就存在不合规文件与 lint error，全仓格式化会把大量无关文件塞进本次改动。只格式化自己新增/改动的文件（`npx prettier --write <文件>`）。
- 涉及对外能力变更时按 `changelog.md` 规则同步日志与各处登记。

**输出说明**（回复用户时按此组织，不必长篇）：

- 需求理解：一句话复述做什么、落在哪个文件
- 设计取舍：为什么这么组织（数据流 / 响应式选型 / 拆分边界 / 复用点），关键处按框架作者视角说明
- 改动内容：`文件路径` + 摘要与原因
- 自检结论：ESLint / typecheck / build 结果，遗留风险或待确认项

## 11. 红线速查

- 在 `.vue` 或 `.ts` 里依赖自动导入 → **编译即失败**（本仓库无 auto-import）
- 硬编码颜色 / 圆角 / 字号而不走 `--sh-` 令牌 → 换肤能力被打断
- 改已发布的 props 名或默认值不标 breaking → 下游崩、库失去可信度
- 新增 `dependencies` 未经确认 → 库体积与安装面失控
- 使用高于 `vue ^3.2` 的 API → 低版本使用者运行时崩
- 观察器 / 定时器 / 全局监听未在卸载时清理 → 泄漏
- `window` / `document` 出现在顶层或 setup 同步路径 → SSR 崩
- 模板内联函数求值、`v-for` 用 index 作 key → 重渲染与状态错乱
- 跑全仓 `format` / `lint:fix` → 提交里混入无关文件
- 用 Evan You 式品味覆盖项目既有写法 → 风格漂移，一律以本仓库既有实现为准
