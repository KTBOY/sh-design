# 个人主页新增「UI Design · 界面设计」区块实施计划

**Goal:** 把 `D:\my\test-html\其他设计` 里的司机端小程序设计稿（白班/夜班双模 16 屏 + 两支 30s 动效片 + 设计文档）接入 `/guide/about` 个人主页，新增一个与设计语言一致的 `03 UI Design` 区块；不改动现有 01/02/04 区块的结构、数据与链接。

**当前阶段:** 2026-11-03 阶段 1–4 已交付并完成本地提交（`0afda28` 资源、`e125d11` 代码与文档）；第二轮追加（设计规范撤出菜单 + 深链定位）见第 9 节，已自检待提交。**全程未推送、未获发布许可。**

**源目录:** `D:\my\test-html\其他设计`（365 MB，含第三方渲染工具链 `design/video-lemo/lib` 与逐帧中间产物，不可整体复制）

---

## 1. 资源盘点（已实测）

### 1.1 选用清单

| 类别       | 源路径                                            | 数量 | 源体积  | 站点形态（实测）                           |
| ---------- | ------------------------------------------------- | ---- | ------- | ------------------------------------------ |
| 白班设计稿 | `design/exports/day/*.png`                        | 8    | 1.7 MB  | WebP 750w q80，8 张合计 ~0.29 MB           |
| 夜班设计稿 | `design/exports/night/*.png`                      | 8    | 1.7 MB  | WebP 750w q80，8 张合计 ~0.28 MB           |
| 双模对照板 | `day/07-cover.png`、`night/01-cover.png`          | 2    | 含上行  | 日夜各一张，随分段控件切换                 |
| 白班影片   | `design/video-lemo/day-film/day-mode-30s.mp4`     | 1    | 2.36 MB | 1080×1920 CRF30 → **1.02 MB**，SSIM 0.9962 |
| 夜班影片   | `design/video-lemo/night-film/night-mode-30s.mp4` | 1    | 6.32 MB | 1080×1920 CRF30 → **1.82 MB**，SSIM 0.9899 |
| 影片封面   | `design/video-lemo/*/poster.jpg`                  | 2    | 147 KB  | WebP q85，合计 ~0.06 MB                    |
| 设计文档   | `design/司机端设计文档.md`                        | 1    | 32 KB   | 纯文本，公开为 `/design/driver`（D4 定案） |

**资源净增量实测：3.4 MB**（目录 `du -sh` 结果，低于 3.7 MB 预算）。视频进 Git 历史后不可回收，这是本计划最大的单向成本。

### 1.2 明确不复制

| 源                                                     | 体积    | 不复制原因                                           |
| ------------------------------------------------------ | ------- | ---------------------------------------------------- |
| `design/video-lemo/lib/`                               | ~320 MB | 第三方渲染工具（自带 LICENSE 与 `.git`），站点不需要 |
| `design/video-lemo/*/out/video.mp4`、`review/*`        | ~20 MB  | 逐帧/审片中间产物                                    |
| `design/exports/video-night/grain-overlay.png`         | 3.5 MB  | 影片噪点贴图，非设计稿                               |
| `design/exports/video-night/*.png`（7 张分镜）         | 1.5 MB  | 是影片分镜不是产品界面                               |
| `design/scripts/*.py`、`vibe_images/`                  | 2.2 MB  | 生成脚本与 AI 底图，与作品展示无关                   |
| `design/assets/*-drive-bg.png`、`shenzhen-route-*.png` | 7 MB    | 影片用背景与路线图，站点内无对应版面                 |

### 1.3 屏序归一

日夜两侧文件名序号不同（day `01-hall` ↔ night `02-hall`），落库统一用语义 id，序号只做展示：

```
hall 接单大厅 · detail 订单详情与路线 · mine 我的 · records 接单记录
edit 编辑资料 · login 微信登录 · cover 双模对照板 · system 系统规范页
```

`cover`/`system` 是 3:4 展示板（1125×1500 / 1080×1440），其余 6 张是 375×812 手机屏（导出 1125×2436）；版式分组按此区分，不强行排成同一网格。

---

## 2. 落位方案

### 2.1 资源目录（已按此交付）

```
docs/public/design/driver/
├─ day/    hall detail mine records edit login cover system .webp   （8 张）
├─ night/  同上 8 张
└─ film/   day-30s.mp4 night-30s.mp4 day-poster.webp night-poster.webp
```

- 站点内路径以 `/design/driver/` 开头，组件内一律 `withBase()`，与 `showcase/meta.ts` 里 `UsedProject.media` 的既有约定一致。
- 转换是一次性离线动作（本机 ffmpeg + libwebp），**不把 ffmpeg 变成仓库依赖**，不加构建脚本；产物直接入库。命令见第 6 节。

### 2.2 代码落位

```
docs/.vitepress/theme/
├─ about/meta.ts                        # 追加 UI_DESIGNS 数据（纯数据，不 import .vue）
├─ components/about/AboutShowcase.vue   # 新增 <section id="design" class="sec"> 区块
└─ components/about/UiDesignShowcase.vue # 区块主体，AboutShowcase 引入
```

- 沿用现有 `theme/<area>/meta.ts` + `theme/components/<area>/*.vue` 分层；数据与视图分离，后续换作品只改 meta。
- 不新增全局注册组件（区块只在 about 页使用，直接 import，不进 `theme/index.ts`）。

### 2.3 风格依据（2026-11-03 定案：`cal`）

从 `guo-taste-design-2` 的 72 份风格库中实读比对 `cal` `vercel` `uber` `linear` `framer`，选 **cal** 作为区块外壳依据。

设计判断：**面向招聘方与设计同行的浅色作品集内嵌展陈区块，克制编辑感语言，取 Cal.com 的「产品 UI 碎片直接放进卡片、品牌电压来自字体与留白而非强调色」。**

选它的两条理由：

1. **中性标度与 about 页现状几乎逐条重合**，接入不需要改站点 token：ink `#111111` vs 现 `#0a0a0b`；muted `#6b7280` vs 现 `#6b7280`（全等）；hairline `#e5e7eb` vs 现 `#e7e7ea`；品牌蓝 `#3b82f6` 与现 `#2563eb` 同族。
2. **展陈策略同源**：cal 的定义性动作就是把产品界面片段放进卡片展示，正是设计稿该有的摆法。

落选说明：`vercel` 的整套装饰系统是 mesh 彩色渐变，与黑白/荧光绿的司机端稿子争视觉；`uber` 是这份作品自身的语言（设计文档写明风格依据 uber），拿它当区块外壳等于同页开第二套强调色；`linear`/`framer` 是 near-black canvas，站点 `appearance: false` 固定浅色，直接排除。

**两处有意的偏离，写在前面不藏：**

- 强调色继续用站点的 `#2563eb`，不跟到 cal 的 `#3b82f6`，避免全页出现两个蓝（颜色一致性锁优先于「照搬某一份 DESIGN.md」）。
- 站点 4 个区块统一用「编号 + 英文 + 中文」标题，anti-slop 把它列为 AI tell，但这是既有约定，单独让新区块破坏一致性更糟，沿用。

旋钮取值：VARIANCE 6 / MOTION 3 / DENSITY 5。设计稿自带的黑白与荧光绿只存在于图片像素里，不进入站点配色。

---

## 3. 区块结构

```
03  UI Design  界面设计
├─ 导语卡：项目名 + 一句话定位 + 规格 chips（375×812 基准 / TDesign 主题覆写 / 4 级表面 + 2 信号色 / 零装饰动效）
├─ 双模对照板 cover（区块首图，说明「同一套系统，两种光环境」）
├─ 分段控件 [白班 | 夜班] → 6 张手机屏网格（hall/detail/mine/records/edit/login）
│    点击任意屏 → 放大层（Teleport to body，Esc 关闭，复用 MiniProgramDialog 的挂载门控写法）
└─ 影片带：两张 poster 卡片，点击就地播放 30s mp4（muted 起播 + 原生 controls）
     每张下方一行署名与规格（Design/direction/code/sound: 舒克-KTBOY · 1080×1920 · 24fps · 30s）
```

- 分段控件切换日夜，**同一时刻只加载当前模式**的图片（`v-if` 而非 `v-show`），首屏图片请求减半。
- 全部 `<img>` 带 `loading="lazy" decoding="async"` 与中文 `alt`；放大层给 `role="dialog"` + `aria-modal`。
- 影片 `preload="none"`，只在点击后设 `src`，避免 2.8 MB 视频在首屏被预取。
- 移动端（≤640px）：网格降为 2 列，影片带改为纵向堆叠。
- `prefers-reduced-motion: reduce` 时不自动播放、`reveal` 直接置为可见（沿用现有约定）。

---

## 4. 分阶段任务与验收标准

状态口径：**已设计 ≠ 已接线 ≠ 已交付 ≠ 已验收 ≠ 已获发布许可**。

### 阶段 0 · 资源清点与压缩口径 —— 已验收（离线实测，不进仓库）

- [x] 源目录清点，选出/排除清单见第 1 节
- [x] 图片 WebP 档位实测：750w q80 → 16 张 570 KB；600w q78 → 440 KB（选 750w，放大层需要 2x 清晰度）
- [x] 视频档位实测：CRF30/1080 = 2.84 MB（SSIM 0.990~0.996）、CRF32/1080 = 2.47 MB、CRF30/810 = 2.03 MB

### 阶段 1 · 资源入库 —— 已交付（本地工作区，未提交）

- [x] 按 2.1 目录转换并写入 `docs/public/design/driver/`
- [x] 验收 ① 目录 20 个文件，命名与 1.3 语义 id 一致
- [x] 验收 ② 总体积 3.4 MB ≤ 3.7 MB
- [x] 验收 ③ 最大单图 64.9 KB（阈值 300 KB）、最大单视频 1.82 MB（阈值 1.9 MB）
- [x] 验收 ④ 肉眼核对 `day/hall.webp`：1px 描边、12px 小字、状态绿点均无退化，无色带
- [ ] 验收 ⑤ `git status` 只出现该目录新增（阶段 4 提交前复核）

### 阶段 2 · 数据与组件 —— 进行中

- `about/meta.ts` 追加 `UI_DESIGNS`（项目名、定位、chips、屏序、日夜媒体路径、影片信息与署名）
- 新增 `UiDesignShowcase.vue`，`AboutShowcase.vue` 引入并插在 `id="tools"` 之后、`id="skills"` 之前，编号 `03`（该编号此前被注释掉的 Experience 区块占用，现为空位，04 Toolbox 不动）
- **验收：** ① `pnpm lint` 不新增 error（HEAD 基线本身有 error，只比新增）；② `npx prettier --check` 对本次新增文件全通过，**不对存量文件跑 `--write`**；③ `pnpm docs:build` 成功且 `dist/design/driver/` 资源齐全；④ 无头 Edge 截图自检：1440 / 820 / 390 三档各一张，日夜切换与放大层可用，图片不溢出卡片圆角

### 阶段 3 · 设计文档公开页

- 新增 `docs/design/driver.md`，正文取 `司机端设计文档.md`，去掉 Ardot 内链与业务方指称；`guide` sidebar「关于」组加入口
- **验收：** ① `pnpm docs:build` 通过、sitemap 收录；② 页面内不出现 `ardot.tencent.com`；③ 区块与卡片各留一条入口指向该页

### 阶段 4 · 收尾

- 更新本文件状态；给出人工验证清单（断点、键盘 Tab 顺序、影片首帧、图片 alt 读屏）；按 D7 拆两次提交

---

## 5. 决策点（2026-11-03 全部定案，用户回「按你的来」批量放行）

| #   | 决策点                   | 定案                                                      |
| --- | ------------------------ | --------------------------------------------------------- |
| D1  | 区块落位                 | 只加 `/guide/about` 的 `03 UI Design` 区块                |
| D2  | 视频档位                 | 1080×1920 CRF30，两支共 2.84 MB，SSIM ≥0.989              |
| D3  | 设计稿范围               | 16 张全放（日夜各 8，含双模对照板与系统规范页）           |
| D4  | 设计文档是否公开         | 公开为 `/design/driver`，去掉 Ardot 内链与业务方指称      |
| D5  | 日夜展示方式             | 分段控件切换，同屏只加载一种                              |
| D6  | 是否进 `PROJECTS` 精选卡 | 进，追加为 `05`，链接指向 `#design` 锚点                  |
| D7  | 提交拆分                 | 两次：① 资源入库 ② 组件与文档                             |
| D8  | 推送与发布               | 只提交到本地 `main`，不推送、不发布                       |
| D9  | 风格依据（本轮追加）     | `cal` 当外壳，`uber` 只作为作品自身语言出现在图片与展签里 |

---

## 6. 重跑口径（阶段 1 用的命令，供复核）

```bash
FF=~/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe
SRC="D:/my/test-html/其他设计/design"
OUT=docs/public/design/driver

# 16 张设计稿 → WebP 750w q80（day 与 night 各自按语义 id 重命名）
for m in day night; do for f in "$SRC/exports/$m"/*.png; do
  "$FF" -y -i "$f" -vf "scale=750:-1" -c:v libwebp -quality 80 "$OUT/$m/$(basename "$f" .png).webp"
done; done

# 两支影片 → 1080×1920 CRF30 + AAC 96k
"$FF" -y -i "$SRC/video-lemo/day-film/day-mode-30s.mp4"     -vf scale=1080:1920 -c:v libx264 -preset medium -crf 30 -c:a aac -b:a 96k "$OUT/film/day-30s.mp4"
"$FF" -y -i "$SRC/video-lemo/night-film/night-mode-30s.mp4" -vf scale=1080:1920 -c:v libx264 -preset medium -crf 30 -c:a aac -b:a 96k "$OUT/film/night-30s.mp4"
```

---

## 7. 风险

| 风险                       | 说明                                                                     | 处置                                                       |
| -------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Git 历史单向膨胀           | 3.4 MB 二进制一旦提交即永久留在历史，后续删除不减体积                    | D2 已按 2.84 MB 定案；如需再压只能在历史之外处理           |
| 业务方指称外泄             | 设计文档含 Ardot 文件链接与项目背景                                      | 阶段 3 强制去链；区块文案只写「司机端小程序」这一产品形态  |
| 影片署名与站点署名口径不一 | 影片尾卡为「舒克-KTBOY · ktboy.github.io」，站点 `PROFILE.name` 为 KTBOY | 区块内按影片原样标注，不改写；站点署名不动                 |
| 放大层与文档站快捷键冲突   | VitePress 本地搜索占 `/`、`Esc`                                          | 放大层只在自己打开时接管 `Esc`，关闭后不挂监听             |
| 首屏体积回退               | about 页此前几乎无图片                                                   | 图片 `loading=lazy`、视频 `preload=none`，未进入视口不请求 |

---

## 8. 自检结果（2026-11-03）

### 8.1 门禁

| 项                          | 结果                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eslint` 本次 4 个文件      | 0 error 0 warning（首轮抓到 `play()` 未绑定点击的真实 bug，已修）                                                                                                                           |
| `eslint .` 全仓             | errors 0，warnings 0                                                                                                                                                                        |
| `prettier --check` 新增文件 | 通过（`UiDesignShowcase.vue`、`docs/design/driver.md`、本文件）                                                                                                                             |
| `prettier` 存量文件         | `meta.ts` / `AboutShowcase.vue` / `config.ts` 仍不合规，4 处 diff 全在我没碰的行（hero 标题、CTA 链接、tool-card 名称、readFileSync 换行、SKILLS 内联数组），按基线纪律不做全文件 `--write` |
| `pnpm docs:build`           | 通过 22.5s；`dist/design/driver/` 20 个资源齐全，`design/driver.html` 已生成，sitemap 收录 `/design/driver`                                                                                 |
| 产物脱敏                    | dist 全量 grep `ardot` 零命中                                                                                                                                                               |

### 8.2 出图自检（CDP 直连无头 Edge，1440 / 820 / 390）

DOM 探针实测：三档视口下 6 张样张 `naturalWidth` 均为 750（全部加载完成）；1440 档页面高 5513，`#design` 顶 2237，影片带顶 3903。

首轮截图抓到并已修复的四个缺陷：

1. 影片竖幅被 `aspect-ratio` 加 `max-height` 挤压成窄条，右侧留大片空白 → 改为「176px 竖幅缩略图 + 右侧文案」两列卡，文案垂直居中。
2. 屏名与切换说明直接落在探照背景上，对比度不足 → 切换行改为白卡，屏名收进样张卡内部。
3. 播放徽标在 132px 窄列里折成两行 → `white-space: nowrap`，移动端徽标降字号与内边距。
4. 首版样张墙后两张在截图里空白 → 卡片重构后消失，三档复测 6/6 全部加载。

### 8.3 已知限制（未做机器验证）

- 放大层（点击设计稿、`Esc` 关闭、点遮罩关闭、滚动锁）与影片点击起播只做了代码级检查，**没有真机交互验证**：内置浏览器面板处于隐藏态（0x0 视口）无法截图，Edge CLI 出图探针在本会话已失效，改用的 CDP 脚本只做静态视口截图、不含点击。
- `prefers-reduced-motion` 下区块本就不自动播放，但 reveal 由父组件统一处理，未单独复测。
- 键盘 Tab 顺序未实测，预期为：两个切换按钮 → 8 张展示板与样张按钮 → 2 个播放按钮。

### 8.4 人工验证清单

| 检查点                      | 预期                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| 1440 视口滚到 03            | 导语卡 + 白底切换卡 + 两张 3:4 展示板 + 六张一行样张墙 + 两张横排影片卡 |
| 点「夜班 NIGHT」            | 展示板与样张整体换成夜班，说明文案变为四级表面那句                      |
| 点任意设计稿                | 全屏放大层，图按 78vh 居中，底部显示「白班/夜班 · 屏名」与关闭按钮      |
| 放大层按 `Esc` 或点图外遮罩 | 关闭，页面恢复滚动                                                      |
| 点影片「播放 30 秒」        | 原位换成 video，静音起播，原生控制条可见                                |
| 390 视口                    | 样张墙两列、展示板与影片单列、影片缩略图 132px、徽标不换行              |
| 网络面板                    | 首屏不请求任何 `film/*.mp4`（`preload=none` 且点击才挂 src）            |

---

## 9. 第二轮追加（2026-11-03）

### 9.1 设计规范撤出左侧菜单

`/design/driver` 此前同时挂在 `/guide/` 的「关于」组和新增的 `/design/` sidebar 块里。按要求全部撤掉：它是个人作品的设计规范，不该出现在组件库文档的导航树里。撤后唯一入口是 03 区块的「查看完整设计规范」与精选项目卡的 `Spec`；`config.ts` 留了两行注释说明这是刻意为之，避免以后被当成漏配补回去。

验收：`/sh-design/design/driver` 仍 200 可达，about 页 HTML 里菜单文案 0 命中。

### 9.2 深链定位 `?to=`

口径（用户选定）：query 为主、原生 `#hash` 兼容；参数驱动到「滚到区块 + 顺带切日夜」，不做进页即弹放大层。

| 位置                | 做法                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AboutShowcase.vue` | `SECTION_IDS = ['projects','tools','design','skills']` 白名单；`to = params.get('to') \|\| hash.slice(1)`；命中才 `scrollIntoView({behavior:'auto',block:'start'})` |
| 顺序约束            | **必须先滚再量坐标**：首版把「点亮视口上方区块」写在 `scrollIntoView` 之前，拿到的是滚动前的位置，深链后上方 10–16 个 reveal 元素保持透明，调换顺序后归零           |
| 落位补偿            | `.sec` 加 `scroll-margin-top: calc(var(--vp-nav-height, 56px) + 16px)`，同时修好所有原生锚点被固定导航压住的问题                                                    |
| 模式参数            | `UiDesignShowcase.vue` 在 `onMounted` 读 `mode`，用 `UI_DESIGN.modes.find` 做白名单，非法值保持默认白班                                                             |
| 首屏不用 smooth     | 长页 smooth 会滑好几秒，深链一律 `auto` 直接落位                                                                                                                    |

实测矩阵（CDP 探针，1440×900，dev 服务）：

| URL                     | scrollY | `#design` 顶 | 激活模式   | 首张样张   | 上方未点亮 |
| ----------------------- | ------- | ------------ | ---------- | ---------- | ---------- |
| 无参数                  | 0       | 2237         | 白班 Day   | day/hall   | 0          |
| `?to=design`            | 2158    | 79           | 白班 Day   | day/hall   | 0          |
| `#design`               | 2175    | 62           | 白班 Day   | day/hall   | 0          |
| `?to=design&mode=night` | 2159    | 78           | 夜班 Night | night/hall | 0          |
| `?to=bogus`             | 0       | 2237         | 白班 Day   | day/hall   | 0          |
| `?to=skills`            | 4210    | -1973        | 白班 Day   | day/hall   | 0          |

已知边界（判定为不需要处理，写清不藏）：

- SPA 内停在同页再换 `?to=` 不会重新定位（`onMounted` 只跑一次）。当前站内没有任何这样的入口，要做需引入 `useRoute()` 监听，成本不对等。
- `#design` 落点比 `?to=design` 高 17px：VitePress 的原生 hash 滚动在我方 `scrollIntoView` 之后又调了一次。两者都在导航之下、区块标题不被遮挡，未继续追平。

### 9.3 本轮自伤：对存量文件跑了 `prettier --write`

`prettier --write` 顺手带上了 `AboutShowcase.vue` 与 `config.ts` 两个存量文件，产生 5 处与本次无关的格式化（hero 标题折行、两处 CTA 链接展开、tool-card 名称展开、`readFileSync` 换行）。已逐处手工还原，最终 `git diff` 只含预期改动：config.ts 净 -10 行（撤菜单）、AboutShowcase.vue 净 +16 行、UiDesignShowcase.vue 净 +4 行。复测 `prettier` 剩余告警行号与 HEAD 基线一致，确认没有新增债务。
