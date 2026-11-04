---
name: guo-taste-design-2
version: 1.0.0707
agent_created: true
description: |
  网页/UI 设计一体化 skill：先选风格，再做审美优化。两段式工作流——
  (1) 从 72 个知名站点的 DESIGN.md 风格库中挑一份当生成依据（颜色/字体/间距/版式的权威 token）；
  (2) 用 anti-slop 审美原则 + 出稿前 Pre-Flight 检查打磨，确保不出 AI 味、不出版式硬伤。
  触发：网页设计、Landing Page、品牌站、营销站、作品集、UI demo、风格仿写、视觉规范、design system、
  「仿 xxx 风格」「像 linear/claude/clay 那样」「帮我挑个风格」「优化一下设计」。
read_when:
  - 用户要生成或修改网页 / Landing Page / 营销站 / 作品集 / 仪表盘 UI
  - 用户提到「按 xxx 风格」「像 xxx 那样」「参考 xxx 的设计」
  - 用户说「帮我挑一个风格」「我不知道用什么风格」「优化一下审美」
  - 用户要做 A/B 风格对照
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# guo-taste-design — 选风格 + 审美优化 一体化设计 skill

这个 skill 做两件事，按顺序走：

1. **选风格（来自 guo-awesome-design）**：从本地 72 个知名站点的 `DESIGN.md` 库里挑一份最契合的，作为颜色、字体、间距、组件、版式的**权威 token 来源**。不要凭空脑补品牌色和字体。
2. **审美优化（来自 taste-skill）**：拿到风格后，用 anti-slop 原则约束生成，出稿前跑一遍 Pre-Flight 检查，把 AI 味和版式硬伤全部过滤掉。

> 适用范围：Landing Page、品牌/营销站、作品集、about 页。**不适用**于密集仪表盘、数据表格、多步表单（那些另寻专用方案）。

---

## 资源位置（重要）

本 skill **自包含**：风格库与 SKILL.md 同目录。

- **案例目录**：`<本 skill 目录>/design-md/<品牌名>/DESIGN.md`
- **本项目安装位置**：`<repo>/.qoder/skills/guo-taste-design-2/design-md/<品牌>/DESIGN.md`
- **案例数量**：72 个（来源 https://github.com/VoltAgent/awesome-design-md）

读取示例：`Read ~/.workbuddy/skills/guo-taste-design/design-md/linear.app/DESIGN.md`

如果 `design-md/` 缺失，告诉用户：「风格库丢了，从 https://github.com/VoltAgent/awesome-design-md 的 design-md 子目录重新拷回本 skill 目录即可。」

---

# 第一段 · 选风格

## 全量风格索引（按调性分组）

避免每次 `ls`，下面是预归类的风格地图。需要精确选择时再 Read 对应 DESIGN.md。

### 极简 / 编辑设计风
`claude` `vercel` `linear.app` `apple` `notion` `mintlify` `cal` `wise` `theverge` `wired` `runwayml`

### 暗色 / 开发者 / 终端美学
`cursor` `expo` `warp` `voltagent` `opencode.ai` `raycast` `superhuman` `ollama` `posthog` `sentry` `together.ai` `clickhouse` `hashicorp`

### 鲜艳渐变 / 未来感
`framer` `lovable` `replicate` `cohere` `mistral.ai` `minimax` `x.ai` `webflow` `composio` `sanity`

### 大牌奢华 / 汽车 / 时尚
`apple` `bmw` `bmw-m` `bugatti` `ferrari` `lamborghini` `tesla` `renault` `nike` `starbucks`

### 加密 / 金融 / 严肃数据
`binance` `coinbase` `kraken` `revolut` `stripe` `mastercard` `wise`

### 社交 / 媒体 / 内容
`airbnb` `pinterest` `meta` `spotify` `playstation` `nike` `theverge` `wired`

### 企业 / B 端 / 文档站
`ibm` `mongodb` `supabase` `shopify` `slack` `intercom` `zapier` `airtable` `miro`  `notion`

### 太空 / 工业 / 极客
`spacex` `nvidia` `tesla` `voltagent` `warp`

### 新粗野主义 / Brutalism
`neo-brutalism` *(热粉 #ff90e8 + 纯黑边框 + 硬阴影 + 0 圆角)*

完整列表：`ls ~/.workbuddy/skills/guo-taste-design/design-md/`

## 选风格工作流（默认：直接挑最匹配的就开做）

默认偏好：**不打断、AI 自动选风格并说明原因，做完可换。**

1. **理解需求**：什么页面（Landing / 作品集 / 仪表盘 / 营销 / 文档）？受众、行业、调性关键词（赛博朋克 / 极简 / 奢华 / 开发者 / 编辑感）？
2. **从索引匹配 1 个最契合的风格**：
   - 「AI 工具营销站」→ `claude` `cohere`
   - 「开发者工具」→ `linear.app` `vercel` `cursor`
   - 「作品集 / 个人站」→ `linear.app` `framer` `cal`
   - 「赛博朋克 / 暗黑霓虹」→ `voltagent` `warp` `cursor`
   - 「金融 / 严肃」→ `stripe` `linear.app`
   - 「奢华品牌」→ `apple` `bugatti` `ferrari`
   - 「编辑 / 刊物感」→ `theverge` `wired` `runwayml`
3. **Read 选中的 DESIGN.md**（必须真读，不靠记忆复述）。
4. **一句话告诉用户「我选了 X 风格，理由是 …」**，简短不啰嗦。
5. **严格遵循该 DESIGN.md 的 token**：colors.* 直接作 CSS 变量；typography.* 映射 font-family / size / weight / line-height / letter-spacing；间距、圆角、hairline、surface 层级照搬。**不要混入其它 DESIGN.md 的色卡。**
6. **完成后告知「不喜欢可以换一个」**，方便 A/B。

### 备用模式
- **模式 B（推荐几个让用户挑）**：用户说「给我推荐几个」→ 选 2-3 个，每个一句话说明。
- **模式 C（用户指定风格）**：直接跳过匹配，Read 对应 DESIGN.md。
- **模式 D（反向沉淀）**：用户要把自己的风格存成 DESIGN.md → 参考 `linear.app/DESIGN.md` 的 YAML frontmatter 格式（version/name/description/colors/typography）写一份，存到用户项目的 `design-md/<风格名>/DESIGN.md`。
- **模式 E（A/B 对照）**：在项目 `design-md/` 下建多个子目录，同一份 HTML 用 CSS 变量切换。

---

# 第二段 · 审美优化（anti-slop）

拿到风格后，**生成与改稿都受下面这套审美原则约束**。核心理念：大多数 AI 设计难看，是因为模型跳向默认审美、堆砌套路。每条规则都是为了反这个默认。

## A. 先读懂需求，再动手（Brief Inference）

动代码前，先用一句话声明设计判断（Design Read）：
> **「我把它读成：面向 <受众> 的 <页面类型>，<调性> 语言，倾向 <风格/设计系统>。」**

如果判断确实有分歧，**只问一个问题**，不要连环追问。能从上下文自信推断就**别问**，直接声明判断开做。

**反默认纪律**：不要无脑用 AI 紫渐变、深色 mesh 上居中 hero、三个等宽功能卡、满屏玻璃拟态、到处无限循环微动画、Inter + slate-900。这些是 LLM 默认套路，要刻意绕开。

## B. 三档旋钮（每次生成前定值）

- **DESIGN_VARIANCE（版式张力）**：1=完全对称，10=艺术化混乱。基线 **7-8**。
- **MOTION_INTENSITY（动效强度）**：1=静态，10=电影级物理。基线 **6**。
- **VISUAL_DENSITY（信息密度）**：1=画廊留白，10=驾驶舱密集。基线 **4**。

按需求覆写：极简/编辑感 → 6/4/3；高端消费/奢华 → 8/6/4；Awwwards/实验性 → 10/9/4；公共部门/无障碍优先 → 4/2/5。

**「声明了动效就要真有动效」**：MOTION_INTENSITY > 4 时页面必须真的动（hero 入场、关键 section 滚动揭示、CTA hover）。做不出就把旋钮降到 3，交一个干净的静态页，别留半成品破动画。

## C. 字体纪律

- 标题默认 `text-4xl md:text-6xl tracking-tighter leading-none`；正文 `text-base text-gray-600 leading-relaxed max-w-[65ch]`。
- **少用 Inter 当默认**（公共部门/中性需求除外）。优先 Geist / Outfit / Cabinet Grotesk / Satoshi 或品牌专属。
- **衬线极度克制**：除非品牌明确点名、或确属编辑/奢华/出版/复古调性且能说清为什么，否则**默认无衬线 display**。`Fraunces` 和 `Instrument_Serif` 明确禁用为默认。
- 标题内强调某词用**同字体的斜体或粗体**，不要往无衬线标题里塞一个随机衬线词。
- **斜体降部留白**：display 斜体若含 `y g j p q`，`leading-none` 会切掉降部 → 最小 `leading-[1.1]` + `pb-1`。

## D. 颜色纪律

- **最多 1 个强调色**，饱和度默认 < 80%。中性底（Zinc/Slate/Stone）+ 高对比单一强调色。
- **LILA 规则**：默认禁 AI 紫/蓝光晕、随机霓虹渐变（品牌明确要紫色则放行，但要克制成体系）。
- **颜色一致性锁**：一旦定了强调色，全页统一，不能第 7 屏突然冒出蓝色 CTA。
- **高端消费禁用套路色**：cookware/wellness/artisan/luxury 别默认 米色+黄铜+暗红+浓咖（`#f5f1ea`/`#b08947`/`#1a1714` 这类）。换冷奢银灰、森林绿+骨白、纯黑+暖棕、钴蓝+奶油 等，且不连续两个项目用同一套。
- **表面层级要拉开**：卡片、面板、浮层等"面"必须和它所在的底有可感知的明度差，靠 surface 阶梯（而非只靠阴影）建立层级。暗色 UI 尤其常翻车——近黑卡片叠在近黑背景上会糊成一片。做法：定义一套 surface token（如底 → 卡 → 浮层逐级提亮 8–12%），相邻层级明度差至少肉眼可辨；对比仍不够时叠一道 1px 微亮 hairline 描边补足边界，而不是把阴影开到很重。


## E. 版式纪律（硬规则，违反即破稿）

- **反居中偏好**：VARIANCE > 4 时避免居中 hero，改 split / 左文右图 / 不对称留白 / 滚动钉住。
- **Hero 必须落在首屏**：标题 ≤ 2 行，副文 ≤ 20 词且 ≤ 4 行，CTA 不滚动就可见。hero 顶 padding 最多 `pt-24`。
- **Hero 最多 4 个文字元素**：(眉标 OR 品牌条，二选一或都不要) + 标题 + 副文 + CTA(1 主 + 最多 1 次)。禁在 hero 里塞 CTA 下小字、信任微条、定价预告、特性列表。
- **「Used by / Trusted by」logo 墙放 hero 下方**，用真实 SVG logo（Simple Icons / devicon）或生成的字母 mark，**不要纯文字 wordmark**，且 logo 下不要再标行业类别。
- **导航单行**，桌面高度 ≤ 80px。
- **眉标克制**（生产测试第一高频违规）：每 3 个 section 最多 1 个 `uppercase tracking` 小眉标，hero 算 1 个。机械检查：眉标数 ≤ ceil(section 数 / 3)。多数时候直接删掉，标题本身就够。
- **禁 split-header**：「左大标题 + 右小解释段」当 section 头部默认禁用，改纵向堆叠（标题在上、正文在下，max-width 65ch）。
- **Zigzag 上限**：连续「左图右文 / 左文右图」最多 2 段，第 3 段连续即破稿，换全宽/纵堆/bento/marquee 打断。
- **Section 版式不重复**：同一种版式家族每页最多出现 1 次；8 个 section 至少 4 种不同家族。
- **Bento 要有节奏 + 精确格数**：N 个内容就 N 格，不留空格；至少 2-3 格要有真实视觉变化（图片/品牌渐变/纹理），不能全是白底白字文本卡。
- **禁三个等宽功能卡**：改 2 列 zig-zag / 不对称网格 / 滚动钉住 / 横向滚动。
- **横向卡片等高**：用 `display: grid` 自动等高；同行卡正文行数差 ≤ 1 行。
- **形状一致性锁**：全页统一一套圆角尺度（全直角 / 全圆角 12-16px / 全胶囊），混用必须有成文规则。
- **移动端塌缩显式声明**：每个多列布局都要写 `< 768px` 的回退，不要假设「Tailwind 自动处理」。

## F. 文字 / padding / 内容密度

- **文字不溢出容器**：长 URL/英文用 `overflow-wrap: anywhere`；中文不贴边。卡片 padding ≥ 24px，按钮左右 ≥ 24px 上下 ≥ 12px，输入框 ≥ `12px 16px`。
- **内容狠删**：每个 section 默认 短标题(≤8 词) + 短副段(≤25 词) + 一个视觉或一个 CTA。
- **长列表换组件**：> 5 项不要默认 `<ul> + divide-y`，改 2 列分组 / 卡片网格 / tabs / 横向 scroll-snap / carousel。规格表别每行都 `border-t + border-b`。
- **引用 ≤ 3 行**，署名 = 姓名 + 角色（+ 公司），不要只写名字。

## G. 图片策略

1. **优先用图像生成工具**（如有）造 section 专属素材：hero 摄影、产品图、纹理背景。
2. 没有生成工具 → 真实图源：`https://picsum.photos/seed/{描述性seed}/{w}/{h}`，或品牌提供的真图。
3. 都没有 → 留**明确标注的占位槽** `<!-- TODO: hero 产品图 1600x1200 -->`，结尾告诉用户需要哪些图。
- **即使极简站也要 2-3 张真图**，纯文字页不是极简、是没做完。
- **禁 div 拼的假截图**（假任务列表、假终端、假仪表盘）——这是 AI 设计头号 Tell。
- **禁手绘装饰 SVG 当默认**；图标用 Phosphor / HugeIcons / Radix / Tabler，别手画 path。

## H. EM-DASH 全面禁用（最高频 Tell）

**破折号 `—` 完全禁用，零容忍。** 没有「少量使用」「正文里可以」的余地。标题、眉标、pill、按钮、正文、引用、署名、图注、alt 文本——一个都不能有。`–`（en-dash）当分隔符也禁。

- 标题里：用句号或逗号。
- 正文里：拆成两句、或用逗号/括号/冒号。
- 署名里：用带空格的普通连字符 ` - ` 或换行。
- 日期/数字范围（`2018-2026`、`¥40-80k`）：用普通连字符 `-`。

页面里只要出现一个 `—` 或 `–`，就算未过 Pre-Flight，必须重写。

## I. AI Tells 黑名单（除非 brief 明确要求，一律禁用）

- 纯黑 `#000000` / 纯白 → 用 off-black（zinc-950）/ off-white。
- 霓虹外发光、过饱和强调色、大标题渐变文字、自定义鼠标光标。
- hero 里的版本标 `V0.6 / BETA / EARLY ACCESS`（非发布页）。
- section 编号眉标 `00 / INDEX`、`001 · Capabilities`、`06 · how it works`。
- 通用人名（John Doe / Sarah Chan）、通用头像、假完美数字（99.99% / 50%）、套路品牌名（Acme / Nexus / SmartFlow）、空话动词（Elevate / Seamless / Unleash / Next-Gen）。
- 装饰性状态点（每个 nav/list/badge 前的彩色圆点）——仅在表达真实语义状态时用，每段最多一个。
- 中点 `·` 限量：metadata 条每行最多 1 个，别当万能分隔符。
- 地点/时间/天气条（「Lisbon 14:23 · 18°C」）、滚动提示（「Scroll ↓」）、hero 底部装饰文字条（`BRAND. MOTION. SPATIAL.`）、图上叠 pill 标签、假图注（`Field study no.12 · Ines`）、营销页版本页脚（`v1.4.2 / Build 0048`）——全禁。
- 「Quietly trusted by」「Field notes」「We respect the French ones」这类表演式工匠腔 → 用朴素功能标签或直接删。

## J. 动效与性能护栏

- 只动 `transform` 和 `opacity`，绝不动 `top/left/width/height`。
- **禁 `window.addEventListener('scroll')`** → 用 Motion `useScroll()` / GSAP ScrollTrigger / IntersectionObserver / CSS scroll-driven。
- 连续值（鼠标位置、滚动进度）**禁用 `useState`** → 用 `useMotionValue` / `useTransform`。
- MOTION_INTENSITY > 3 的动效必须尊重 `prefers-reduced-motion`，无限循环/视差/滚动劫持要能塌缩成静态。
- **每个动画要能用一句话说清意图**（层级 / 叙事 / 反馈 / 状态变化），说不清就删。
- marquee 每页最多 1 个；grain/noise 只加在 `fixed pointer-events-none` 伪元素上。
- Hero 全高用 `min-h-[100dvh]`，绝不用 `h-screen`；布局用 CSS Grid，别用 `w-[calc(33%-1rem)]` 的 flex 数学。

---

# 🔍 出稿前 Pre-Flight 检查（硬性，每次生成完必须逐条自检并在回复里报告）

生成 HTML 后、说「做完了」之前，AI 必须逐条自检。任意一条不过 → 主动修复后再交付，不要把已知问题推给用户。

- [ ] **设计判断**已用一句话声明？三档旋钮已定值且有理由？
- [ ] **选了哪份 DESIGN.md**？token（颜色/字体/间距/圆角）严格遵循、未混入其它色卡？
- [ ] **零 em-dash `—`/`–`**（标题/眉标/正文/引用/署名/按钮/alt 全检）？
- [ ] **单一主题锁**（全页 light 或 dark 或 auto，不中途反转）？
- [ ] **颜色一致性锁**（一个强调色贯穿全页）？**形状一致性锁**（一套圆角）？
- [ ] **CTA 对比度**（无白底白字，WCAG AA 4.5:1）？**CTA 不换行**（桌面单行）？**表单对比度**达标？
- [ ] **Hero 落首屏**（标题 ≤ 2 行，副文 ≤ 20 词且 ≤ 4 行，CTA 免滚动可见，顶 padding ≤ pt-24）？
- [ ] **Hero ≤ 4 个文字元素**，无 CTA 下小字 / 信任微条 / 装饰文字条？
- [ ] **眉标计数** ≤ ceil(section 数 / 3)？无 split-header？无 section 编号眉标？
- [ ] **Zigzag ≤ 2 连**？**版式不重复**（8 section ≥ 4 种家族）？
- [ ] **无重复意图 CTA**（「联系我们」「聊聊」不能同页各来一个）？
- [ ] **Bento 精确格数 + 至少 2-3 格视觉变化**？**无三等宽功能卡**？**横向卡等高**？
- [ ] **logo 墙在 hero 下方**，用真实 SVG，logo 下无类别标签？
- [ ] **用了真图**（生成 / picsum-seed / 占位槽），无 div 假截图、无手绘装饰 SVG、无纯文字伪极简？
- [ ] **长列表用对组件**（> 5 项不用 `divide-y`），规格表不每行双 border？
- [ ] **文案自审**（每个可见字符串无语病、无 AI 幻觉腔、无假精确数字）？
- [ ] **动效有动机**（每个能一句话说清），声明的动效真有动效，marquee ≤ 1？
- [ ] **无 `window.addEventListener('scroll')`**，reduced-motion 已处理？
- [ ] **暗色模式** token 已定、两种模式都测过？**移动端塌缩**显式写明？
- [ ] **无 AI Tells**（Inter 默认 / AI 紫 / 装饰点 / 地点时间条 / 滚动提示 / 版本页脚 / 工匠腔）？
- [ ] **图标**仅用 Phosphor/HugeIcons/Radix/Tabler，无手画 path？**容器 padding 齐全**？
- [ ] **设计完成度**（无重叠文字 / 无空方块·空圆占位 / 无默认灰块，所有元素都是完成态）？
- [ ] **自动布局 + 对齐**（按钮·卡片·列表·导航用自动布局，对齐符合意图：按钮居中、卡片左对齐统一内边距，不靠手动拖拽和空格凑）？
- [ ] **列对齐统一**（对比表 / 列表以列为单位锁定对齐，表头与该列所有单元格同一种对齐，不出现表头居中而内容左对齐）？
- [ ] **不超出容器**（文字·图形·图表包围盒 ⊆ 容器边界，图表峰值 ≤ 绘图区 85–90% 留顶部余量；除非标注「有意出血 / 破出」）？
- [ ] **生成图片一致**（同套 UI 所有图共用一套风格，内容贴合页面主题，设计完成后逐张走查，不符的重新生成）？
- [ ] **表面层级对比**（卡片 / 面板 / 浮层与其所在底色之间有可感知的明度差，层级清晰拉开，不是近黑叠近黑、近白叠近白"糊成一片"；暗色 UI 用 surface 阶梯如 #0a0a0a 底 → #1a1a1a 卡 → #242424 浮层，必要时叠 1px 微亮描边强化边界）？



### 报告格式（必须给用户）

```
### 设计交付
- 风格：选用 claude（理由：AI 工具营销站，克制编辑感）
- 旋钮：VARIANCE 6 / MOTION 4 / DENSITY 3
### Pre-Flight 自检
- [✓] 零 em-dash
- [✓] 单一主题 + 颜色/形状一致性锁
- [✓] Hero 落首屏，≤4 文字元素
- [✓] 眉标 2 个（6 section，未超 ceil(6/3)=2）
- [✓] 图标用 Phosphor inline SVG（6 处），无假截图
- [✓] 暗色两模式已测，移动端塌缩已写
```

某项不过 → 标 ⚠️ 说明原因并**主动修复**。

---

## 常见错误避免

1. 不要把多份 DESIGN.md 的颜色混用——会失去原品牌的克制感。
2. 不要忽略 typography 的 letter-spacing——这是高级感关键（linear/vercel/apple 尤甚）。
3. 不要拿暗色 DESIGN.md 配亮色页或反之——对比度算不准会出事。
4. 不要假装读过——必须真 Read 对应 DESIGN.md，不靠记忆复述。
5. 不要用 Emoji 当 icon——必须 SVG。
6. 不要跳过 Pre-Flight——这是硬性流程，不是建议。
7. 资源路径变更要用 SkillManage 更新本文档「资源位置」段落。
