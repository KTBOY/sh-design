---
title: shukelab 项目指南
description: 'shukelab 的设计与工程约定：为什么以 uni_modules 目录分发而不是发布 npm、easycom 命名约束、插件目录结构、跨端条件编译策略、主题定制的真实机制、插件级版本与 changelog 约定。'
---

# 项目指南

这一页讲 shukelab 是怎么组织的、为什么这样组织，以及改动或接入前需要知道的约定。安装步骤在[快速上手](/lab/quickstart)，组件清单在[总览](/lab/)，单个组件的 props / events / slots 在各自文档页里，这里不重复。

## 技术栈

| 能力     | 方案                                               |
| -------- | -------------------------------------------------- |
| 跨端框架 | uni-app 3.x（`@dcloudio/*`）                       |
| 前端     | Vue 3 Composition API + `<script setup lang="ts">` |
| 语言     | TypeScript                                         |
| 构建     | Vite 5 + `@dcloudio/vite-plugin-uni`               |
| 样式     | SCSS，尺寸单位优先 `rpx`                           |
| 目标端   | H5、微信小程序（App 端未纳入验证范围）             |
| 分发     | `uni_modules` 目录，DCloud 插件市场                |

组件不引入任何第三方运行时依赖，只依赖 uni-app 框架本身——这是为了不把体积和端兼容性问题转嫁给使用方。`sk-camera` 的人脸取景引导会用到 MediaPipe 模型（约 230KB），属于**可选能力**，模型与 wasm 走 H5 专用静态目录自托管，不会被打进小程序包。

## 为什么以 uni_modules 分发

uni-app 生态里组件有两种主流分发方式，shukelab 选 `uni_modules`：

- **免配置**：easycom 按目录约定自动注册，使用方不需要写 `import`、不需要在 `main.ts` 里 `app.use()`、不需要配 babel / vite 插件。
- **HBuilderX 友好**：插件市场一键导入即落到工程里，对不用 CLI 的团队同样可用。
- **源码可见**：复制进工程的就是源码，需要微调时直接改文件，不受包版本锁死。

代价也要讲清楚：

- **升级不是 `pnpm up`**。插件市场的组件可以在 HBuilderX 里「更新插件」，手动复制的只能重新覆盖目录，因此**改动对外 API（props / events）必须保持向后兼容**——已上架市场的 `sk-linkage-menu`、`sk-tab-bar` 尤其如此。
- **没有 tree-shaking 概念**。取舍粒度是「插件」，用哪个就复制哪个目录，不必也不能整仓引入。

## 插件目录结构

每个插件是一个自包含目录，元数据、文档、更新日志都随目录走：

```
src/uni_modules/sk-tab-bar/
├── package.json               # uni_modules 元数据：id / displayName / version
├── readme.md                  # 插件市场展示的文档
├── changelog.md               # 插件级更新日志
└── components/
    └── sk-tab-bar/
        ├── sk-tab-bar.vue     # 组件本体
        ├── sk-tab-bar.type.ts # 对外类型（SkTabBarItem / SkTabBarChangeEvent …）
        ├── sk-tab-bar.css     # 样式
        ├── sk-tab-bar-canvas.ts
        └── use-tab-bar.ts     # 组合式函数（多页面选中态同步）
```

一个插件目录可以包含多个组件。`sk-swipe-feed` 就是这种形态，`components/` 下并列 `sk-swipe-page`、`sk-scroll-tabs`、`sk-scroll-list` 三个组件，三者零运行时耦合，可单独使用也可组合。

::: warning 目录名与组件名不可单独改
easycom 的匹配规则是 `uni_modules/<插件 id>/components/<同名目录>/<同名>.vue`，即三层同名。手动复制时如果把目录或 `.vue` 改名（`sk-tab-bar` → `tabbar`），编译器找不到组件，模板里会**静默不渲染**而不报错。要改名必须三层一起改。
:::

## 跨端策略

- 跨端 API 一律走 `uni.xxx`，不直接调浏览器或微信专有 API；确有端差异才用条件编译 `#ifdef H5 / MP-WEIXIN / APP-PLUS` 分支。
- 尺寸用 `rpx`，避免 H5 与小程序的像素基准差异。
- 条件编译是**兜底手段而不是默认写法**，实测密度也印证了这点：`sk-camera` 23 处、`sk-flux-capsule` 6 处、`sk-tab-bar` 4 处、`sk-scroll-list` 3 处，而 `sk-linkage-menu`、`sk-scroll-tabs`、`sk-swipe-page` 为 0。只有强依赖平台能力的组件（摄像头、WebGL、原生滚动层）才需要分支，其余靠 uni-app 自身抹平。

## 主题定制

shukelab **没有全局 CSS 变量主题层**，定制走三条既有路径：

1. **props**：颜色、尺寸、模式类配置由组件显式暴露（如 `sk-scroll-tabs` 的 `active-color`、`sk-tab-bar` 的 `mode`）。
2. **插槽**：需要完全换外观时用作用域插槽，例如 `sk-tab-bar` 的 tab 内容插槽、`sk-scroll-list` 的空态 / 错误态 / 刷新头插槽。
3. **样式覆盖**：H5 端可在外层加 class 配合 `:deep()` 穿透；**小程序端受组件样式隔离限制，穿透不可靠**，需要定制时优先回到前两条路径，而不是依赖覆盖。

各插件的样式都在自己的 `components/<id>/` 目录下，改一个插件不会影响其他插件。

## 版本与更新

版本以**插件为单位**，不看仓库版本：

| 插件            | 版本  | 最近更新时间 |
| --------------- | ----- | ------------ |
| sk-linkage-menu | 1.0.6 | 2026-07-26   |
| sk-tab-bar      | 1.0.6 | 2026-09-06   |
| sk-camera       | 1.1.0 | 2026-08-31   |
| sk-flux-capsule | 1.1.0 | 2026-07-29   |
| sk-swipe-feed   | 1.0.0 | 2026-09-05   |

改插件功能时同步更新该插件的 `changelog.md` 与 `package.json` 的 `version`。文档侧的权威出处分两处：已上站的组件看本站文档页，未上站的看插件自带 `readme.md`——两边不重复维护同一份 API 表。

## 演示是怎么做到实时的

组件页里的手机壳由 `<UniDemoDock :demos="..." />` 渲染，iframe 加载 shukelab 的 H5 真实构建，不是截图。`demos` 里每项带 `anchor`，对应正文的 `##` 标题，滚动到该节时面板自动切到对应示例。

iframe 的目标地址在 `docs/.vitepress/theme/components/uni-demo.ts`，当前固定指向生产构建 `https://ktboy.github.io/shukelab/`。要联调本地 shukelab 改动，需要临时改这一行，具体步骤见[快速上手](/lab/quickstart)。

## 怎么验证改动

shukelab 没有单元测试脚本，验证方式是跑端：

```bash
pnpm dev:h5           # H5，浏览器直接看
pnpm dev:mp-weixin    # 微信小程序，产物在 dist/dev/mp-weixin，用微信开发者工具打开
```

文档站这边：`pnpm docs:dev` 起本地预览，`pnpm docs:build` 校验构建（VitePress 会对失效内链报错）。
