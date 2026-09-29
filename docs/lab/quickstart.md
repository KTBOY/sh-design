---
title: shukelab 快速上手
description: '把 shukelab 的 uni_modules 组件接入 uni-app 工程：DCloud 插件市场导入与手动复制两种方式、HBuilderX 与 CLI 工程的目录落点差异、easycom 免注册的最小示例，以及常见坑与本地联调本站演示的方法。'
---

# 快速上手

shukelab 的组件以 `uni_modules` 目录形式分发，**不走 npm**。整个接入过程就是「把插件目录放进工程的 `uni_modules/`」，然后在模板里直接写标签——不需要 `import` 组件，也不需要在 `main.ts` 里注册。

## 环境要求

- uni-app 工程：**HBuilderX 3.x**，或 `@dcloudio/*` **CLI 工程**（Vue 3）
- Vue 3（组件全量为 Composition API + `<script setup>`）
- 编译微信小程序时另需微信开发者工具
- CLI 工程需 Node 18+；HBuilderX 工程不需要额外配置

组件没有第三方运行时依赖，装完 uni-app 工程就能用。唯一的例外是 `sk-camera` 的人脸取景引导（可选能力），需要自托管 MediaPipe 模型，详见插件 readme。

## 方式一：插件市场导入（推荐）

已上架的两个插件走这条路最省事：

1. 打开 [sk-linkage-menu](https://ext.dcloud.net.cn/plugin?id=22894) 或 [sk-tab-bar](https://ext.dcloud.net.cn/plugin?id=24578)
2. HBuilderX：点「导入插件」→ 选目标项目，插件自动落到项目根的 `uni_modules/`
3. CLI 工程：点「下载插件 zip」→ 解压后把 `sk-xxx/` 目录放进工程的 `src/uni_modules/`

::: warning 未上架的插件只能手动复制
`sk-camera`、`sk-flux-capsule`、`sk-swipe-feed` 目前标记为「待发布」，插件市场搜不到，用下面的方式二从仓库复制。功能与将来上架的版本一致。
:::

## 方式二：手动复制

从 [shukelab](https://github.com/KTBOY/shukelab) 仓库复制插件目录，落点随工程类型不同：

::: code-group

```bash [HBuilderX 工程 · 项目根目录]
# uni_modules 在项目根
cp -R /path/to/shukelab/src/uni_modules/sk-tab-bar ./uni_modules/
```

```bash [CLI 工程 · 项目根目录]
# uni_modules 在 src 下
cp -R /path/to/shukelab/src/uni_modules/sk-tab-bar ./src/uni_modules/
```

:::

**整目录复制**，包括 `package.json`、`readme.md`、`changelog.md`——只拷 `components/` 会让插件失去元数据，HBuilderX 也不再把它识别为可更新插件。

复制后的结构（以 CLI 工程为例）：

```
your-project/
└── src/
    └── uni_modules/
        └── sk-tab-bar/
            ├── package.json
            ├── readme.md
            ├── changelog.md
            └── components/
                └── sk-tab-bar/
                    ├── sk-tab-bar.vue
                    ├── sk-tab-bar.type.ts
                    └── ...
```

## 直接使用

easycom 会按 `uni_modules/<插件 id>/components/<同名目录>/<同名>.vue` 自动注册，模板里直接写标签即可。最小示例：

```vue
<template>
  <sk-flux-capsule colors="#5b8cff" title="FLUX" />
</template>
```

带数据的组件（`sk-tab-bar`）：**组件本身不用 import，只有类型需要显式引入**。

```vue
<template>
  <sk-tab-bar v-model:current="current" :data="tabs" @change="onChange" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  SkTabBarItem,
  SkTabBarChangeEvent
} from '@/uni_modules/sk-tab-bar/components/sk-tab-bar/sk-tab-bar.type'

const current = ref(0)
const tabs = ref<SkTabBarItem[]>([
  { text: '首页', icon: '/static/home.png', active: '/static/home-active.png' },
  { text: '我的', icon: '/static/me.png', active: '/static/me-active.png' }
])

const onChange = (e: SkTabBarChangeEvent) => {
  console.log('切到第', e.currentIndex, '项：', e.text)
}
</script>
```

`@` 是 uni-app 工程默认指向 `src/` 的别名。如果你的工程没配这个别名，把类型导入换成相对路径即可。

组件的完整 props / events / slots 见各自文档页：[sk-tab-bar](/lab/sk-tab-bar)、[sk-linkage-menu](/lab/sk-linkage-menu)；未上站的插件看仓库内的 `readme.md`。

## 常见坑

- **模板里组件不渲染、也不报错**：几乎都是 easycom 三层同名被破坏（插件目录名 / `components` 下的子目录名 / `.vue` 文件名不一致）。改名要三层一起改，或者干脆别改。
- **`sk-tab-bar` 点了不跳页**：它是**组件形式**的 tabBar，不依赖也不修改 `pages.json` 的原生 `tabBar` 配置。要跳转得给 item 配 `pagePath` + 组件开 `autoRoute`，或在 `change` 回调里自己处理。注意 `switchMode` 默认是 `reLaunch`——组件形式 tabBar 所在的页面通常不是原生 tabBar 页，用 `switchTab` 会失败。
- **`sk-tab-bar` 的凹口颜色不对**：默认 `mode="concave"` 用伪类实现，光圈需要与页面背景同色；背景是图片、渐变或深色时改用 `mode="plain"`（实心栏，不依赖背景色）或 `mode="canvas"`。
- **`sk-camera` 在 H5 打不开预览**：`getUserMedia` 要求安全上下文（`https://` 或 `localhost` / `127.0.0.1`）。不满足时组件会自动降级为系统拍照兜底，`@fallback` 事件会带上原因，不是 bug。
- **样式覆盖在小程序端不生效**：小程序有组件样式隔离，`:deep()` 穿透不可靠。定制优先用 props 与插槽，H5 端才考虑穿透。
- **升级组件**：市场导入的可在 HBuilderX 里「更新插件」；手动复制的需要重新覆盖目录，覆盖前先看插件的 `changelog.md` 有没有破坏性变更。

## 联调本站的在线演示（可选）

文档站组件页里的手机壳 iframe 默认加载 shukelab 的**线上** H5 构建。要在本站预览你本地改的组件：

```bash
# 1. shukelab 起 H5 dev server（端口 5175，base /shukelab/）
cd /path/to/shukelab
pnpm install
pnpm dev:h5

# 2. 文档站起本地预览
cd /path/to/sh-ui
pnpm docs:dev
```

第 3 步需要把 iframe 的目标地址临时指向本地：改 `docs/.vitepress/theme/components/uni-demo.ts:18`

```ts
// 调试期间
export const uniH5Origin = 'http://localhost:5175/shukelab/'
// 调试结束改回
export const uniH5Origin = 'https://ktboy.github.io/shukelab/'
```

该文件头部注释里保留了这两种写法。**这一行是本地调试用的，不要提交**——提交后线上文档站的演示会指向访问者本机的 5175 端口。
