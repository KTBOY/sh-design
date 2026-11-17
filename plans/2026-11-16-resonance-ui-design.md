# Resonance HUD 迁入 UI Design

**目标:** 将 `Resonance HUD-ui skill` 从个人主页精选项目移到 UI Design 区块，按「设计语言」而不是普通项目卡呈现。

**当前阶段:** 已完成。

**非目标:** 不从 `/products` 下架，不移除 `/skills/` 画廊，不新增图片或视频资产，不改首页街区。

---

## 1. 方案

- 从 `PROJECTS` 删除 `Resonance HUD-ui skill`，精选项目不再出现。
- 在 `UI_DESIGN` 区块顶部新增「Design Language · 设计语言」条目，沿用白卡、细边框、蓝色强调与等宽字体编号。
- 预览直接复用 `showcase/demos/skill-resonance-hud.vue` 的纯 CSS HUD 演示，不新增截图；预览容器使用 `inert` + `aria-hidden`，避免演示里的空按钮进入交互和无障碍树。
- 条目保留 `GitHub` 与站内 `画廊` 两个入口。
- `More Tools` 继续按名称过滤 Resonance，避免同一项目在个人主页出现两次；`/products` 仍完整列出。
- 桌面双列：左实时预览、右说明；窄屏改为上下堆叠。

## 2. 验收

| 项目 | 标准 |
| --- | --- |
| 精选项目 | 不再出现 Resonance HUD |
| UI Design | 出现 Resonance 设计语言条目、纯 CSS 预览、GitHub 与画廊入口 |
| More Tools | 不重复出现 Resonance HUD |
| 响应式 | 820px 以下由双列改为单列 |
| 门禁 | eslint、`docs:build`、`git diff --check` 通过 |

## 3. 状态

- 2026-11-16：方案成文，开始实施。
- 2026-11-16：完成。`PROJECTS` 移除 Resonance；UI Design 顶部新增设计语言条目，复用纯 CSS HUD 演示，提供 GitHub 与站内画廊入口；More Tools 继续去重、`/products` 保留。相关文件 eslint 通过，`docs:build` 15.89s 通过。
