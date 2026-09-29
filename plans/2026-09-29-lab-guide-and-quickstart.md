# /lab/（shukelab）项目指南 + 快速上手 + 组件总览页 实施计划

**Goal:** 为文档站 `/lab/` 区补三页——`/lab/` 组件总览（当前访问 404）、`/lab/introduction` 项目指南、`/lab/quickstart` 快速上手，并按 `/guide/` 既有的侧栏分层语言接入导航；同时把 shukelab 在站内的全部入口收敛到总览页。

**背景（为什么现在缺）:**

- `/lab/` 侧栏在 `docs/.vitepress/config.ts:112-120`，标题「shukelab 组件」，底下只有两条组件页 `docs/lab/sk-linkage-menu.md`、`docs/lab/sk-tab-bar.md`。**没有 index 页，`/lab/` 是 404**；`/products/` 卡片 `theme/products/meta.ts:77` 只能直链单个组件页 `lab/sk-linkage-menu`，用户从「更多工具」进来落在组件 API 页上，看不到 shukelab 是什么、怎么装。
- 现有两页都是「组件 API + 在线演示」，安装/分发/端差异这类**项目级信息没有任何一页承载**：两页引言（`sk-tab-bar.md:10-11`、`sk-linkage-menu.md:10-11`）只写了一句「以 uni_modules 形式分发」，没有安装步骤，也没有指向别处。
- shukelab 的分发路径和 sh-design 完全不同（uni_modules 而非 npm），**不能复用 `docs/guide/installation.md` / `quickstart.md`**，内容必须单写。

---

## 事实核对（写页面前已验证，避免把 README 的口径抄进来）

| 结论                                                       | 证据                                                                                                                                                                                                                 | 对文档的影响                                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 组件清单与状态                                             | `shukelab/README.md:22-32`：sk-linkage-menu（市场 id=22894）、sk-tab-bar（id=24578）、sk-camera、sk-flux-capsule、sk-swipe-feed 均标 `待发布`                                                                        | 总览页要区分「已发布 npm/市场」与「源码在仓库但未上站」                                           |
| 另有 3 个插件未进 README                                   | `ls src/uni_modules/`：还有 `sh-loading`、`take-photos`、`uni-icons`、`uni-scss`；`shukelab/agent.md:12-19` 把 sh-loading、take-photos 列为已发布插件                                                                | 总览页只列 sk-* 自有插件，`uni-icons`/`uni-scss` 是官方依赖，不列                                 |
| **README 的「CSS 变量驱动 — 主题定制只需覆盖变量」不成立** | 全仓 `grep -rE 'var\(--' src/uni_modules --include=*.vue` 只命中 `sh-loading/components/sh-loading/modules/triangle.vue`；sk-tab-bar / sk-linkage-menu / sk-camera / sk-flux-capsule / sk-swipe-feed **零 CSS 变量** | 指南页**不写这条卖点**，改写实际机制：props 配置 + `rpx` 尺寸 + 条件编译隔离端差异（见决策点 D1） |
| easycom 免注册的硬约束                                     | `shukelab/agent.md:80`：插件目录必须 `uni_modules/<id>/components/<id>/<id>.vue`，组件名与插件 id 一致才被自动引入；实测 5 个 sk-* 均符合                                                                            | 快速上手要写这条命名约束——手动复制时改目录名就会「组件找不到」，是最常见的坑                      |
| uni_modules 落点目录分两种工程                             | HBuilderX 项目在根 `uni_modules/`，CLI（本项目）在 `src/uni_modules/`                                                                                                                                                | 见 D4：两种工程路径分开写                                                                         |
| 端支持以组件为单位差异                                     | `shukelab/README.md:166-176` 兼容性表（H5 / 微信小程序 / App），条件编译出现次数：sk-camera 23 处、sk-flux-capsule 6 处、sk-tab-bar 4 处、sk-scroll-list 3 处                                                        | 总览页保留兼容性表，但按实测口径标注，不写「全端通用」                                            |
| 本地联调的真实地址                                         | `docs/.vitepress/theme/components/uni-demo.ts:15-16`：dev 态 `http://localhost:5175/shukelab/`，生产 `https://ktboy.github.io/shukelab/`                                                                             | 快速上手写端口 5175 与 `/shukelab/` 前缀，不凭空写 5173                                           |
| shukelab 侧命令                                            | `shukelab/agent.md:29-40`：`pnpm dev:h5`、`pnpm dev:mp-weixin`；README L196-207 写的是 `npm`                                                                                                                         | 站内统一写 `pnpm`（agent.md 明确「优先使用 pnpm」），避免两套命令                                 |
| 无单元测试，验证靠跑端                                     | `shukelab/agent.md:42`                                                                                                                                                                                               | 指南页「如何验证改动」一段如实写 H5 预览 + 微信开发者工具，不假称有测试                           |

---

## 文件结构与责任

| 文件                                                                | 责任                                                                                                                                          | 动作  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `docs/lab/index.md`                                                 | `/lab/` 落地页：一句话定位 + 插件目录表（名称/用途/分发状态/市场或源码链接/站内文档页链接/H5 demo 路径）+ 平台兼容性表 + 下一步导流           | 新建  |
| `docs/lab/introduction.md`                                          | 项目指南：shukelab 定位与技术栈、为什么用 uni_modules 而非 npm、插件目录结构与命名约束、端差异与条件编译策略、版本与 changelog 约定、贡献流程 | 新建  |
| `docs/lab/quickstart.md`                                            | 快速上手：环境要求 → 两种导入方式（插件市场 / 手动复制，HBuilderX 与 CLI 落点分开）→ easycom 免注册最小示例 → 常见坑 → 与本站演示场联调       | 新建  |
| `docs/.vitepress/config.ts:112-120`                                 | `/lab/` 侧栏分层：新增「开始」分组（总览 / 项目指南 / 快速上手），原「shukelab 组件」分组保留在后                                             | 修改  |
| `docs/lab/sk-linkage-menu.md:10-11`、`docs/lab/sk-tab-bar.md:10-11` | 引言块去掉重复的分发说明，改为指向 `/lab/quickstart` 的指针（单一出处原则）                                                                   | 修改  |
| `docs/.vitepress/theme/products/meta.ts:77`                         | shukelab 卡片入口 `href` 从 `/lab/sk-linkage-menu` 改为 `/lab/`                                                                               | 修改  |
| `agent.md:77-90` 文档站目录树                                       | 现只列 `guide/` `components/`，缺 `lab/ chart/ mini/ products/ skills/ css/`                                                                  | 见 D5 |

**不改动**：`theme/index.ts`（三页都是纯静态 + 现有组件，无需注册新的实时预览组件）；`docs/guide/changelog.md`（纯文档改动，`agent.md:399` 明确不强制）；shukelab 仓库本体（跨仓库，见 D1/D3）。

---

## 分阶段任务

### Task 1：`docs/lab/index.md` 组件总览页

内容要求：

- frontmatter 写 `description`（SEO，站点已开 `sitemap` + `cleanUrls`）。**不写 `aside: left`**——该属性是组件页为 `<UniDemoDock>` 手机壳让位才用的（`sk-tab-bar.md:3`），本页无演示，用默认右侧「本页目录」。
- H1 定位段：uni-app + Vue3 + TS 的跨端组件集合，以 `uni_modules` 分发，零第三方运行时依赖。
- 插件目录表：5 个 sk-* 插件（sk-linkage-menu、sk-tab-bar、sk-camera、sk-flux-capsule、sk-swipe-feed）+ sh-loading、take-photos；每行含用途、分发状态（`已发布市场 id=xxxxx` / `待发布`）、站内文档页链接（只有前两页有，其余写「文档筹备中」而不是编造链接）、shukelab H5 demo 页路径。
- 平台兼容性表照 `README.md:166-176` 的实测口径。
- 末尾「下一步」链到 `/lab/introduction` 与 `/lab/quickstart`。

验收标准：`/lab/` 可访问；表内每条外链（市场 id、GitHub tree 路径）与仓库实际一致；「待发布」字样与 README 状态一致，不出现「已发布 npm」。

### Task 2：`docs/lab/introduction.md` 项目指南

内容要求（章节即本页目录项，`outline: [2,3]` 已在 `config.ts:128` 配好）：

- `## 这是什么` / `## 技术栈`（uni-app 3.x、Vue 3 `<script setup lang="ts">`、TS 4.7、Vite 5 + `@dcloudio/vite-plugin-uni`、SCSS、rpx）
- `## 为什么以 uni_modules 分发` —— 免 npm 配置、HBuilderX 拖入即用、官方 easycom 约定；代价是版本随目录复制、升级要手动替换。
- `## 插件目录结构` —— 真实结构（含 `components/<id>/<id>.vue`、`package.json`、`readme.md`、`changelog.md`，sk-tab-bar 另有 `sk-tab-bar.type.ts` / `use-tab-bar.ts` / `sk-tab-bar.css`）；点明命名一致是 easycom 生效前提。
- `## 跨端策略` —— `uni.xxx` API + `#ifdef H5 / MP-WEIXIN / APP-PLUS` 条件编译；用实测的条件编译密度说明 sk-camera 是端差异最重的插件。
- `## 主题定制` —— 按实际机制写（props + 每插件自带样式文件），**不写 CSS 变量**（见事实核对）。
- `## 版本与更新` —— 插件级 `changelog.md` + `package.json.version`（当前 sk-tab-bar 1.0.6、sk-linkage-menu 1.0.6、sk-camera 1.1.0、sk-flux-capsule 1.1.0、sk-swipe-feed 1.0.0），与文档站的关系。
- `## 在线演示场怎么做到实时的` —— 说明 `<UniDemoDock>` / `<UniDemo>` 手机壳 iframe 加载 H5 构建，dev 态可接本地 5175（指针到 `theme/components/uni-demo.ts`，不重复实现细节）。

验收标准：全章零虚构；与 `shukelab/agent.md` 口径不冲突；不与两组件页的 API 表重复（API 细节只留组件页一个出处）。

### Task 3：`docs/lab/quickstart.md` 快速上手

内容要求：

- `## 环境要求`：uni-app（HBuilderX 3.x 或 `@dcloudio/*` CLI 工程）、Vue 3；微信小程序需微信开发者工具。
- `## 方式一 · 插件市场导入（推荐）`：ext.dcloud.net.cn 搜组件名 → 导入插件 → 落到 `uni_modules/`。
- `## 方式二 · 手动复制`：`::: code-group` 分开 **HBuilderX 工程**（复制到项目根 `uni_modules/`）与 **CLI 工程**（复制到 `src/uni_modules/`）；强调 `<id>/components/<id>/<id>.vue` 三层结构必须整体保留。
- `## 直接使用（无需注册）`：easycom 免 import 的模板示例（`<sk-tab-bar :items="..." v-model:current="..." />`），并给一段「显式 import」备用写法。
- `## 常见坑`：目录改名导致组件不识别；`rpx` 与 H5 缩放；微信小程序自定义 tabBar 与原生 `tabBar` 配置的关系（sk-tab-bar 是组件形式，不依赖 `pages.json` 原生配置——见 `sk-tab-bar.md:8`）。
- `## 联调本站演示`：shukelab 跑 `pnpm dev:h5`、本站跑 `pnpm docs:dev`，iframe 指向 `http://localhost:5175/shukelab/`。

验收标准：照页面步骤在 CLI 工程可跑通（人工执行）；命令一律 `pnpm`；不出现 `npm install sk-xxx`。

### Task 4：导航接线

- `config.ts:112-120` 的 `/lab/` 改为两个分组：`开始`（shukelab 总览 → `/lab/`、项目指南、快速上手）+ `shukelab 组件`（现有两条保留不动）；分组 `text` + `link` 的写法沿用 `/mini/` 已有范式（`config.ts:102-106`）。
- 两组件页引言块改为指针（Task 2/3 完成后引用才成立）。
- `meta.ts:77` 卡片入口指向 `/lab/`。

验收标准：`/lab/`、`/lab/introduction`、`/lab/quickstart` 三页在侧栏可见且高亮正确（`activeMatch` 由前缀 key 自动生效）；`grep -rn "'/lab/sk-linkage-menu'" docs/.vitepress/theme/products/meta.ts` 无残留旧入口。

### Task 5：校验

- `pnpm docs:build`（单独执行并打印退出码，不接管道，避免管道吞退出码）。
- 静态检查：新页所有站内链接目标文件存在；`pnpm lint`、`prettier --check` 覆盖新增 md/ts。
- 按既定偏好默认只做静态检查 + 清单核对，浏览器实测（`/lab/` 渲染截图、侧栏目检）等你开口再跑。

---

## 决策点（原始提案，结论见下一节）

- **D1（口径订正，默认不改跨仓库）**：shukelab `README.md:19` 的「CSS 变量驱动 — 主题定制只需覆盖变量，无需修改源码」与源码不符（sk-* 插件零 CSS 变量）。本站文档按实际机制写；**是否另开一轮去 shukelab 仓库改 README？** 默认不动。
- **D2（总览页收录范围）**：`sh-loading`、`take-photos` 在 `agent.md:12-19` 算已发布插件，但 README 组件表没列它们，且站内没有文档页。**默认收录进总览表并标「无站内文档」**；若要更克制，可只列 5 个 sk-* 插件。
- **D3（sk-swipe-feed 展示粒度）**：它是三件套（sk-swipe-page / sk-scroll-tabs / sk-scroll-list）合成一个 uni_module。**默认总览页按一个插件一行、备注三件套组件名**；不拆成三行（拆了会和实际导入单位不一致，误导安装）。
- **D4（快速上手是否写 HBuilderX / CLI 双路径）**：默认写（`::: code-group`）。代价是篇幅 +8 行左右，收益是覆盖最常见的手动复制踩坑。
- **D5（是否顺带补 `agent.md:77-90` 的文档站目录树）**：该树缺 `lab/ chart/ mini/ products/ skills/ css/`，已与实际不符。**默认本次顺带补齐**（纯文档，一次改到位）；不补也行，另开一轮。
- **D6（可选清理）**：`docs/docs_dev.err`（0 字节空文件）当前被 git 跟踪。**默认不动**，只报告。

---

## 决策点结果（2026-09-29 已拍板）

| 编号 | 结论                                                       | 落地情况                                                                                                                                                                                                                                                   |
| ---- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1   | **要改**，且强调 shukelab 是 uni-app 组件、不通过 npm 引入 | 已订正 `shukelab/README.md`：删「CSS 变量驱动」改为 props + 插槽；快速开始区分 HBuilderX / CLI 落点；easycom 三层同名规则写明；`npm` 命令改 `pnpm`；项目结构补 sk-swipe-feed / take-photos；兼容性表加 App 未验证与 sk-camera 降级脚注；顶部加在线文档指针 |
| D2   | 只列 5 个 sk-*，可参考 shukelab 已有组件文档               | 总览表 5 行；内容取自各插件 `readme.md` + `package.json` 版本 + `pages.json` 演示路径，未收 sh-loading / take-photos                                                                                                                                       |
| D3   | sk-swipe-feed 只展示一行                                   | 一行，正文补一句「以整个插件为单位导入，三组件零运行时耦合」                                                                                                                                                                                               |
| D4   | 按推荐来                                                   | 快速上手用 `::: code-group` 分开 HBuilderX（根 `uni_modules/`）与 CLI（`src/uni_modules/`）                                                                                                                                                                |
| D5   | 可以                                                       | `agent.md` 文档站目录树补齐 lab / chart / mini / products / skills / css + theme                                                                                                                                                                           |
| D6   | 不处理                                                     | `docs/docs_dev.err` 原样保留                                                                                                                                                                                                                               |

**计划外订正**：`agent.md` 有 3 处指向不存在的 `RELEASING.md`（L88 目录树、第 9 节标题、文末链接清单），实际文件是 `发布npm指南.md` 与 `组件发布流程.md`，已一并改正。

---

## 当前状态

| 阶段                                                             | 状态                                                                                                                                                                                                                   |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 位置分析与事实核对                                               | 已完成                                                                                                                                                                                                                 |
| Task 1 `docs/lab/index.md`                                       | 已交付（本地）                                                                                                                                                                                                         |
| Task 2 `docs/lab/introduction.md`                                | 已交付（本地）                                                                                                                                                                                                         |
| Task 3 `docs/lab/quickstart.md`                                  | 已交付（本地）                                                                                                                                                                                                         |
| Task 4 接线（config.ts 侧栏 / 两组件页引言指针 / products 卡片） | 已交付（本地）                                                                                                                                                                                                         |
| Task 5 跨仓库订正 shukelab README                                | 已交付（本地，未提交）                                                                                                                                                                                                 |
| Task 6 agent.md 目录树 + 校验                                    | 已交付（本地）                                                                                                                                                                                                         |
| 门禁：`pnpm docs:build`                                          | 已通过（EXIT=0，7.08s；`/lab/`、`/lab/introduction`、`/lab/quickstart` 三页均产出 HTML 并进 sitemap）                                                                                                                  |
| 门禁：渲染静态核对                                               | 已通过（index 3 表 18 行、introduction 2 表 14 行、quickstart 0 表；无泄漏的 markdown 表格语法；code-group 双 tab 正常）                                                                                               |
| 门禁：prettier                                                   | 3 个新页已格式化通过；`sk-tab-bar.md` / `sk-linkage-menu.md` / `agent.md` / shukelab `README.md` 在 HEAD 就已不满足 prettier，本次**不整文件格式化**以免污染 diff                                                      |
| 门禁：`pnpm lint`                                                | **失败（EXIT=1），2 个既有错误，非本次引入**：`ProductsGallery.vue:14` `total` 未使用（HEAD 即存在）、`AboutShowcase.vue:4` `EXPERIENCE` 未使用（源于工作区未提交的 8 行删除）；另有 1 个既有 warning `UniDemo.vue:14` |
| 提交 / 推送                                                      | 未执行，等指令（两仓库均为工作区改动）                                                                                                                                                                                 |
| 浏览器实测                                                       | 未执行（按既定偏好：默认静态检查 + 清单，需要时再跑）                                                                                                                                                                  |
| 发布许可                                                         | 未获                                                                                                                                                                                                                   |
