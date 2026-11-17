# pla7-mod 个人主页收录计划

**目标:** 将 `pla7-mod` 作为「可下载的 Windows 桌面成品」收录到作品目录与个人主页「更多工具」，补足现有作品集中在组件库、小程序、设计语言与 WebGL 实验上的空白。

**当前阶段:** 阶段 1、1.1、1.2 已完成。阶段 2、3 不随本轮上线。

**非目标:** 首页街区保持现有 7 个地标，本轮不新增第八栋建筑；不新增独立案例页面、不修改 `Resonance HUD` 现有内容。

---

## 1. 项目事实（已核实）

| 事实 | 来源 |
| --- | --- |
| Electron + Vue 3，Windows 便携版，源码无构建步骤 | `KTBOY/pla7-mod` README |
| 最新 Release `v1.3.0`，便携包约 152MB，解压即用 | GitHub Releases |
| 支持内容哈希去重、文件夹批量导入、同槽位互斥替换、缺失签名补齐与路径检测 | README + 提交记录 |
| 界面采用 `resonance-hud` 深色金调设计语言，已有主界面、MOD 库、大图预览三张截图 | 仓库 `docs/screenshots/` |
| 仓库当前 0 star，未配置 LICENSE 与 topics | GitHub API |

## 2. 定位与排序（D4 取代 D1）

- 最初定案：个人主页 `Selected Projects` 可见第 03 位。
- 2026-11-16 调整：从 `Selected Projects` 移除，通过 `Open Source & Desktop` 工具数据进入个人主页 `More Tools`，同时保留 `/products` 目录入口。
- 对外文案先讲工程与交付，再讲游戏场景，避免只被理解为兴趣项目。

## 3. 卡片内容（D2/D4 定案）

- 名称：`pla7-mod`
- 中文名：`仙剑七 MOD 管理器`
- 标签：`Electron`、`Vue 3`、`Windows 便携版`、`本地文件管理`
- 链接：`GitHub` 指向源码仓库，强调按钮 `下载软件` 指向 GitHub `releases/latest`。
- 描述强调：主游戏 / DLC 双库、哈希去重、批量导入、同槽位自动替换、签名补齐、`resonance-hud` 设计语言落地。
- 不配置 `repo` 星标字段：当前 0 star 会在卡片上显示，削弱第一印象；有真实关注后再开。

## 3.1 作品目录入口（D3 定案）

- 在 `/products` 的 `Open Source & Desktop` 分组新增 `pla7-mod`，卡片提供 `GitHub` 与强调样式的 `下载软件` 两个入口，下载仍指向 GitHub `releases/latest`。
- 工具项标记 `catalogOnly`：只在作品目录和个人主页「更多工具」收录，不进入首页 3D 街区。
- 首页城市与列表改用街区专用的 `DISTRICT_TOOLS`，继续展示 7 个已有地标，避免出现「索引有项目、场景无建筑」的不一致。
- 个人主页「更多工具」按精选项目名称去重，避免 `pla7-mod` 同时出现在精选项目卡与更多工具区。

## 4. 分阶段实施

| 阶段 | 内容 | 状态 | 验收 |
| --- | --- | --- | --- |
| 1 | 精选项目卡：数据、文案、下载与 GitHub 入口 | 已完成 | 可见顺序第 03 位；eslint 与 `docs:build` 通过 |
| 1.1 | `/products` 的 Open Source & Desktop 入口 + 目录专属标记 | 已完成 | 卡片含 GitHub 与下载按钮；首页街区仍为 7 地标 |
| 1.2 | 将个人主页入口从 Selected Projects 调整到 More Tools | 已完成 | 精选项目不再出现该项目；More Tools 出现 GitHub 与下载按钮 |
| 2 | 小案例展示：三张界面截图 + 三条工程决策 | 待启动 | 需先确定展示位置、资产压缩与移动端布局 |
| 3 | 首页街区第八个地标 | 暂缓 | 移除 `catalogOnly` 时，需同时补 `LANDMARKS`、`BUILDINGS`、碰撞与视觉验收 |

## 5. 后续风险

- **双入口同步**：`/products` 和首页街区都消费 `VISIBLE_TOOLS`。当前由 `catalogOnly` 把目录项目挡在街区外；阶段 3 若要让项目进入城市，必须移除标记并同时补 `LANDMARKS`、`BUILDINGS` 与碰撞，否则会出现索引有项目、场景无建筑的半残状态。
- **素材版权**：截图用于产品界面展示，仓库不包含 MOD 文件；案例页文案需明确工具不主张第三方 MOD 素材版权。
- **下载资产**：152MB 便携包继续走 GitHub Release，不进入本站仓库。
- **星标变化**：只有当项目获得真实关注后再加入 `repo` 字段，避免为了装饰提前展示 0 star。

## 6. 状态记录

- 2026-11-16：方案成文，阶段 1 开始实现。
- 2026-11-16：阶段 1 完成。`PROJECTS` 可见顺序第 03 位新增 `pla7-mod`，下载指向 GitHub 最新 Release，未配置星标字段；变更文件 eslint 通过，`docs:build` 17.58s 通过。
- 2026-11-16：追加阶段 1.1。按用户要求在 `/products` 的 `Open Source & Desktop` 增加 GitHub 与下载入口，同时引入 `catalogOnly` / `DISTRICT_TOOLS` 保持首页街区仍为 7 个地标；个人主页「更多工具」按名称去重。相关文件 eslint 通过，`docs:build` 11.73s 通过。
- 2026-11-16：阶段 1.2 完成。按用户要求从 `Selected Projects` 移除，并解除「更多工具」去重，使其通过 `Open Source & Desktop` 数据出现在个人主页 More Tools；`/products` 入口保持不变。eslint 通过，`docs:build` 13.30s 通过。
