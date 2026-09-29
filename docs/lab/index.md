---
title: shukelab · 组件总览
description: 'shukelab —— uni-app + Vue 3 + TypeScript 跨端组件集，以 uni_modules 目录形式分发（不发布 npm）。含左右联动菜单、自定义凹陷弧形 tabBar、H5 拍照相机、WebGL 流体胶囊、频道页三件套，目标端为 H5 与微信小程序。'
---

# shukelab 组件总览

**shukelab** 是一套 **uni-app + Vue 3 + TypeScript** 的跨端组件集，以 `uni_modules` **目录形式**分发：把插件目录放进工程即被 easycom 自动识别，**不发布 npm、无需 `import`、无需注册**。目标端为 **H5 与微信小程序**，端差异用条件编译隔离。

::: tip 与 sh-design 的区别
本站还有另一条产品线 [sh-design](/components/lazy-image)：那是发布到 npm 的 Vue 3 Web 组件库，用 `app.use()` 或按需 `import` 使用。shukelab 面向 uni-app 工程，两者安装方式与运行环境都不通用，别把 `npm i` 的思路带过来。
:::

## 组件目录

| 组件            | 说明                                                                                                                           | 版本  | 插件市场                                              | 文档                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| sk-linkage-menu | 左右联动菜单：分组吸顶标题、受控选中、异步加载后自动重测、分组级虚拟渲染                                                       | 1.0.6 | [id=22894](https://ext.dcloud.net.cn/plugin?id=22894) | [sk-linkage-menu](/lab/sk-linkage-menu)                                                              |
| sk-tab-bar      | 组件形式凹陷弧形 tabBar：角标/红点、`beforeChange` 守卫、`autoRoute` 路由联动 + `useTabBar`                                    | 1.0.6 | [id=24578](https://ext.dcloud.net.cn/plugin?id=24578) | [sk-tab-bar](/lab/sk-tab-bar)                                                                        |
| sk-camera       | H5 拍照相机：`getUserMedia` 前后置切换 / 固定区域裁剪 / 人脸取景引导，不可预览环境自动降级系统拍照                             | 1.1.0 | 待发布                                                | [插件 readme](https://github.com/KTBOY/shukelab/blob/main/src/uni_modules/sk-camera/readme.md)       |
| sk-flux-capsule | WebGL 域扭曲 FBM 流体色彩胶囊：1~6 色调色板、按压/搅动交互、视口懒激活                                                         | 1.1.0 | 待发布                                                | [插件 readme](https://github.com/KTBOY/shukelab/blob/main/src/uni_modules/sk-flux-capsule/readme.md) |
| sk-swipe-feed   | 频道页三件套：整页横滑 `sk-swipe-page` + 滚动标签栏 `sk-scroll-tabs` + 滚动列表 `sk-scroll-list`，附 `usePagedList` 分页状态机 | 1.0.0 | 待发布                                                | [插件 readme](https://github.com/KTBOY/shukelab/blob/main/src/uni_modules/sk-swipe-feed/readme.md)   |

版本号取自各插件目录下的 `package.json`。「待发布」表示源码已在仓库内、DCloud 插件市场尚未上架——功能与市场版一致，按[快速上手](/lab/quickstart)里的手动复制方式引入即可。

`sk-swipe-feed` 是一个插件目录内打包的三个组件加一个组合式函数，导入时以**整个插件**为单位，三个组件之间零运行时耦合，可单独使用，也可拼成频道页。

## 平台兼容性

| 组件            | H5  |      微信小程序       | App |
| --------------- | :-: | :-------------------: | :-: |
| sk-linkage-menu | ✅  |          ✅           |  —  |
| sk-tab-bar      | ✅  |          ✅           |  —  |
| sk-camera       | ✅  | ✅（原生 `<camera>`） |  —  |
| sk-flux-capsule | ✅  |          ✅           |  —  |
| sk-swipe-feed   | ✅  |          ✅           |  —  |

> ✅ 已验证　·　— 未纳入验证范围

App 端目前不作为支持目标。`sk-camera` 在小程序 / App 会降级为原生 `<camera>`，对外 props 与事件保持一致；H5 端 `getUserMedia` 要求安全上下文（`https://` 或 `localhost`），不满足时自动走「微信 JSSDK → `<input capture>`」兜底拍照链路。

## 在线演示

两个已上站的组件页里，手机壳 iframe 加载的是 shukelab 的 **H5 真实构建**（非截图），可直接交互。演示页即下表中的 `pages.json` 路由，hash 模式下可拼成完整地址打开：

```
https://ktboy.github.io/shukelab/#/pages/tabBarDemo/badge
```

| 组件            | H5 演示页（shukelab `src/pages.json` 注册路径）                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| sk-linkage-menu | `pages/virtualMenuGanged/*` — basic / style / sticky / control / loadmore / with-tabbar                                                    |
| sk-tab-bar      | `pages/tabBarDemo/*` — index / corner / badge / control / route-a / route-b / filter                                                       |
| sk-camera       | `pages/skCameraDemo/*` — basic / switch / control / crop / face                                                                            |
| sk-flux-capsule | `pages/skFluxCapsuleDemo/*` — basic / props / themes / events                                                                              |
| sk-swipe-feed   | `pages/skSwipeFeedDemo/*` — index / combo-custom-icon / swipe-page / scroll-tabs / scroll-list / refresher / custom-indicator / paged-list |

## 下一步

- [项目指南](/lab/introduction)：分发模式、插件目录结构、跨端策略、主题定制与版本约定
- [快速上手](/lab/quickstart)：两种引入方式与本地联调
- [源码仓库](https://github.com/KTBOY/shukelab)：MIT License
