---
version: alpha
name: Neo-Brutalism
description: |
  A defiant, hard-edged design system rooted in the neo-brutalist movement, distilled from Gumroad's commerce-flavored boldness and Rubens Cantuni's portfolio restraint. The system anchors on a paper-white canvas (#fefcf5) framed by raw 2-3px pure-black borders and signature offset hard shadows (no blur, full opacity) — every filled card and button looks like a sticker pressed onto the page. A single saturated brand pink (#ff90e8, Gumroad's hot pink) carries the chromatic load, supported by candy-coral, mint, and butter-yellow surface tints used as flat fills, never gradients. Type voice runs ABC Diatype / Inter — geometric grotesque, 700-900 weight at display sizes, all-caps for section headers and nav, generous -2% letter-spacing on hero. The whole system reads like a hand-printed risograph zine that learned commerce — playful but unmistakably brutal.

  ## CRITICAL — hard shadows are non-negotiable
  Hard shadows (offset, zero blur, opaque #000) are THE signature of this style. If a layout has no visible offset shadow, it is NOT neo-brutalism — it's just a flat outlined design. Generation rule:
  - EVERY filled card / button / pricing tile / testimonial / callout / featured tag MUST carry a hard shadow from the `shadows` token group (`hard-sm` 4px / `hard-md` 6px / `hard-lg` 8px / `hard-xl` 12px). Default to `hard-md` 6px+ for cards.
  - Hover state SHOULD increase shadow + translate(-2px, -2px) so the card "jumps off the page". Active/pressed = translate to opposite side + shadow shrinks to 0.
  - When in doubt, apply a heavier shadow rather than a lighter one. Shadow density IS the personality.
  - Page-level shadow density target: at least 60% of layout-level rectangles (cards, buttons, badges) should carry a hard shadow visible above the fold.

  ## CRITICAL — where black borders + hard shadows apply
  The 2-3px pure-black border + offset hard shadow combo is reserved for FILLED, TANGIBLE surfaces — things that read as "physical objects pinned on the page":
  - ✅ Apply on: cards (any color fill incl. white), buttons (filled or outlined-on-white), pricing tiles, badges, callouts, image frames, testimonial blocks, input fields with bg, featured tags, code blocks with bg.
  - ❌ Do NOT apply on: bare text headings, icon glyphs floating without a chip, transparent-background nav links, plain bullet items, inline links, body paragraphs, divider lines, decorative shapes lacking fill.
  - Rule of thumb: if the element has no `background-color` (or `transparent`), it should NOT carry the border+shadow combo. Give it a fill first, then border+shadow earns its place.
  - Exception: hairline section dividers may use a 2-3px black bottom border without shadow — that's structure, not a card.

  ## CRITICAL — corner radius is allowed and encouraged for variety
  The earlier "0px everywhere" rule is too restrictive. Neo-brutalism celebrates RAW SHAPE VARIETY, not just rectangles. Use the `rounded` token group deliberately:
  - Default for cards/buttons/inputs: `rounded.sm` (6-10px) gives a tactile sticker feel and is the new default. Use `rounded.md` (14-18px) for softer, friendlier cards (Gumroad uses ~16px on featured cards).
  - Use `rounded.lg` (24-32px) for hero callouts, oversized blob-like banners, and "pill" badge containers.
  - Use `rounded.full` (9999px) for circular badges, profile chips, sticker-style stamps, oversized pill CTAs.
  - Pure 0px right-angles still allowed and powerful, but should be a CHOICE per element, not the default everywhere. Mix them on the same page for shape rhythm.

  ## CRITICAL — shape vocabulary, not just rectangles
  Strong neo-brutalist layouts feature a ROSTER of geometric shapes, not endless rectangle grids. When generating, intentionally vary:
  - **Rectangles** with 0-8px radius — workhorse cards
  - **Pills / capsules** (rounded.full) — tags, status chips, oversized CTA pills
  - **Circles** — badges, profile rings, decorative dots, "stamp" stickers (rotate -8deg to -15deg)
  - **Hexagons / diamonds / parallelograms** — accent decoration, feature icons, "process step" markers (use SVG or `clip-path`)
  - **Stars / starbursts** — promotional badges, "NEW!" stamps (SVG, 5-12 points, rotated)
  - **Asymmetric blobs** — hero background fills, section dividers (SVG)
  - **Arrow shapes** (chevron, broken arrow, curved arrow) — decorative pointers between sections (SVG)
  - **Squiggle / wavy underlines** — under headlines, hand-drawn feeling (SVG path)
  - Encourage 2-4 distinct shape families per page; rotate badges/stickers ±2-15deg for hand-made energy.

  Together: hard shadows are the gravity, varied rounded corners are the personality, mixed shape vocabulary is the soul. A page that is all 0-radius rectangles with no offset shadows is NOT this style.

colors:
  primary: "#ff90e8"
  primary-active: "#e864c5"
  primary-disabled: "#ffcdf0"
  on-primary: "#000000"
  ink: "#000000"
  body: "#1a1a1a"
  body-strong: "#000000"
  muted: "#4a4a4a"
  muted-soft: "#7a7a7a"
  hairline: "#000000"
  hairline-strong: "#000000"
  hairline-soft: "#e8e8e8"
  canvas: "#fefcf5"
  canvas-pure: "#ffffff"
  surface-1: "#ffffff"
  surface-2: "#f5f5f5"
  surface-card: "#ffffff"
  surface-pink-soft: "#ffe1f5"
  surface-mint: "#c4f0c5"
  surface-coral: "#ffb8a8"
  surface-yellow: "#fef266"
  surface-blue: "#a4e8ff"
  surface-lavender: "#d4c5ff"
  surface-dark: "#000000"
  on-dark: "#fefcf5"
  on-dark-soft: "#9a9a9a"
  shadow-hard: "#000000"
  semantic-success: "#1f9c4d"
  semantic-warning: "#f5b800"
  semantic-error: "#e63946"
  semantic-info: "#0066ff"

typography:
  display-xl:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 80px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: -2.4px
  display-lg:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -1.8px
  display-md:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1.2px
  display-sm:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.8px
  headline:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.4px
  title-lg:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.2px
  title-md:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0px
  title-sm:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0px
  body-md:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0px
  body-sm:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0px
  caption:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.2px
  caption-uppercase:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 1.6px
  code:
    fontFamily: "JetBrains Mono, IBM Plex Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0px
  button:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.2px
  button-uppercase:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 1.4px
  nav-link:
    fontFamily: "ABC Diatype, Inter, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.4px

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 14px
  lg: 22px
  xl: 32px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  section: 96px
  hero: 120px

shadows:
  hard-xs: "2px 2px 0px #000000"
  hard-sm: "4px 4px 0px #000000"
  hard-md: "6px 6px 0px #000000"
  hard-lg: "8px 8px 0px #000000"
  hard-xl: "12px 12px 0px #000000"
  hard-pink: "6px 6px 0px #ff90e8"
  hard-yellow: "6px 6px 0px #fef266"

borders:
  hairline: "1px solid #e8e8e8"
  thin: "2px solid #000000"
  default: "3px solid #000000"
  thick: "4px solid #000000"

components:
  # ============================================================
  # GROUP 1 — FILLED SURFACES (border + hard shadow REQUIRED)
  # 凡有 backgroundColor 的物理对象，都必须带 black border + hard shadow
  # ============================================================
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"        # 8px — 默认有圆角不是 0
    padding: 16px 28px
    height: 52px
    boxShadow: "{shadows.hard-md}"  # 默认 6px，权重加重
    hover:
      transform: "translate(-2px, -2px)"
      boxShadow: "{shadows.hard-lg}"
    active:
      backgroundColor: "{colors.primary-active}"
      transform: "translate(2px, 2px)"
      boxShadow: "0px 0px 0px #000000"
  button-secondary:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"
    padding: 16px 28px
    height: 52px
    boxShadow: "{shadows.hard-sm}"   # 二级阴影也至少 4px
    hover:
      transform: "translate(-2px, -2px)"
      boxShadow: "{shadows.hard-md}"
  button-tertiary:
    backgroundColor: "{colors.surface-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"
    padding: 16px 28px
    boxShadow: "{shadows.hard-md}"
  button-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-uppercase}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"
    padding: 16px 28px
    boxShadow: "{shadows.hard-md}"
  button-pill:                       # 新增：胶囊型按钮（圆角变体）
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    border: "{borders.default}"
    rounded: "{rounded.pill}"       # 9999px 全圆胶囊
    padding: 14px 32px
    height: 52px
    boxShadow: "{shadows.hard-md}"
  feature-card:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"          # 14px — 默认略带圆角
    padding: 32px
    boxShadow: "{shadows.hard-lg}"   # 8px 阴影起跳
    hover:
      transform: "translate(-3px, -3px)"
      boxShadow: "{shadows.hard-xl}"
  feature-card-accent:
    backgroundColor: "{colors.surface-pink-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  feature-card-mint:
    backgroundColor: "{colors.surface-mint}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  feature-card-yellow:
    backgroundColor: "{colors.surface-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  feature-card-sharp:                # 变体：保留方角，混排用
    backgroundColor: "{colors.surface-coral}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.none}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  product-card:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 24px
    boxShadow: "{shadows.hard-md}"
    hover:
      transform: "translate(-3px, -3px)"
      boxShadow: "{shadows.hard-xl}"
  pricing-tier-card:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 40px 32px
    boxShadow: "{shadows.hard-lg}"
  pricing-tier-card-featured:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.title-lg}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 40px 32px
    boxShadow: "{shadows.hard-xl}"   # 推荐卡阴影最重 12px
    transform: "rotate(-1deg)"
  callout-card-pink:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    border: "{borders.default}"
    rounded: "{rounded.lg}"         # 22px 大圆角，blob 感
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  callout-card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.headline}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  testimonial-card:
    backgroundColor: "{colors.surface-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    border: "{borders.default}"
    rounded: "{rounded.lg}"
    padding: 32px
    boxShadow: "{shadows.hard-lg}"
  tag-active:                          # 有填充的 tag 也带阴影
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-uppercase}"
    border: "{borders.thin}"
    rounded: "{rounded.sm}"
    padding: 6px 12px
    boxShadow: "{shadows.hard-xs}"
  tag-pill:                          # 胶囊型 tag
    backgroundColor: "{colors.surface-mint}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-uppercase}"
    border: "{borders.thin}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
    boxShadow: "{shadows.hard-xs}"
  input-field:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
    height: 52px
    boxShadow: "{shadows.hard-xs}"   # 默认就有轻阴影
    focus:
      boxShadow: "{shadows.hard-sm}"
      transform: "translate(-2px, -2px)"
  contact-block:
    backgroundColor: "{colors.canvas-pure}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    border: "{borders.default}"
    rounded: "{rounded.md}"
    padding: 48px
    boxShadow: "{shadows.hard-xl}"
  image-frame:                       # 新增：图片必须装在带边框带阴影的"相框"里
    backgroundColor: "{colors.canvas-pure}"
    border: "{borders.default}"
    rounded: "{rounded.sm}"
    padding: 8px
    boxShadow: "{shadows.hard-lg}"

  # ============================================================
  # GROUP 2 — SHAPE VOCABULARY (geometry beyond rectangles)
  # 形状词汇库：圆/胶囊/六边形/星/星爆/blob/箭头/squiggle
  # ============================================================
  badge-circle:                      # 圆形徽章 — 经典 sticker
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.full}"
    border: "{borders.default}"
    size: 96px
    boxShadow: "{shadows.hard-md}"
    transform: "rotate(-12deg)"
  badge-starburst:                   # 星爆徽章 — promotional stamp
    type: svg
    points: 12                       # 12-pointed sunburst
    backgroundColor: "{colors.surface-yellow}"
    border: "{borders.default}"
    size: 120px
    boxShadow: "{shadows.hard-md}"
    transform: "rotate(-8deg)"
    note: "用 SVG <polygon> 或 clip-path 生成；标签写 'NEW!' '50% OFF' 'BETA' 之类"
  badge-hexagon:                     # 六边形徽章 — 流程节点
    type: svg
    backgroundColor: "{colors.surface-blue}"
    border: "{borders.default}"
    size: 80px
    boxShadow: "{shadows.hard-sm}"
    note: "用 clip-path: polygon(...) 或内联 SVG 实现"
  badge-diamond:                     # 菱形装饰块
    type: svg
    backgroundColor: "{colors.surface-coral}"
    border: "{borders.default}"
    size: 64px
    boxShadow: "{shadows.hard-sm}"
    transform: "rotate(45deg)"
  blob-hero-bg:                      # blob 形 hero 背景斑块（SVG）
    type: svg
    fill: "{colors.primary}"
    note: "SVG path 不规则圆弧，承担 hero 区色块；不必带边框/阴影（装饰性，非物理对象）"
  arrow-pointer:                     # 箭头装饰（连接 section）
    type: svg
    stroke: "{colors.ink}"
    strokeWidth: 3px
    note: "粗笔触手绘感箭头/弯曲箭头，引导视觉流；无填充无阴影"
  squiggle-underline:                # 波浪线装饰（标题下方）
    type: svg
    stroke: "{colors.primary}"
    strokeWidth: 4px
    fill: none
    note: "<path d='M0 5 Q 10 0, 20 5 T 40 5 T 60 5' /> 重复，画在 h1/h2 下方"
  process-step-circle:               # 圆形步骤标号
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.headline}"
    rounded: "{rounded.full}"
    border: "{borders.default}"
    size: 64px
    boxShadow: "{shadows.hard-sm}"

  # ============================================================
  # GROUP 3 — TRANSPARENT / NO-FILL ELEMENTS
  # 这些元素无填充色，**严禁**套用 black border + hard shadow
  # ============================================================
  text-link:
    backgroundColor: transparent      # ❌ 不要 border / boxShadow
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    textDecoration: "underline"
    textDecorationThickness: 2px
    underlineOffset: 4px
  nav-link:                          # 顶导文字链接
    backgroundColor: transparent      # ❌ 不要 border / boxShadow
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    hover:
      textDecoration: "underline"
      textDecorationThickness: 2px
  body-paragraph:
    backgroundColor: transparent      # ❌ 不要 border / boxShadow
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
  bullet-item:                       # 列表项
    backgroundColor: transparent      # ❌ 不要 border / boxShadow
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  inline-icon:                       # 文字旁的图标（必须 SVG）
    backgroundColor: transparent      # ❌ 不要 border / boxShadow
    stroke: "{colors.ink}"
    strokeWidth: 2px
    size: 18-24px
    note: "若图标需要 chip 化（外加方框），用 icon-chip 组件，不要直接给 svg 套 border+shadow"
  icon-chip:                         # 图标外加方形/圆形容器，这时才能带 border+shadow
    backgroundColor: "{colors.canvas-pure}"
    border: "{borders.thin}"
    rounded: "{rounded.sm}"
    size: 56px
    padding: 14px
    boxShadow: "{shadows.hard-xs}"

  # ============================================================
  # GROUP 4 — STRUCTURAL (有 border 但不要 shadow)
  # 结构线条用 border 不用 shadow
  # ============================================================
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 72px
    borderBottom: "{borders.default}"  # 只有底边线，不是卡片
    boxShadow: none
    padding: 16px 32px
  section-divider:
    backgroundColor: transparent
    borderBottom: "{borders.default}"
    boxShadow: none
  section-header:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.caption-uppercase}"
    paddingBottom: 16px
    borderBottom: "{borders.default}"
    boxShadow: none
  experience-item:                   # 时间线项目（左竖线）
    backgroundColor: transparent      # ❌ 没 fill，所以不带 border+shadow 套装
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    borderLeft: "4px solid #000000"   # 仅左侧装饰线
    boxShadow: none
    padding: 16px 24px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: 120px 32px
    textAlign: left
    boxShadow: none                   # hero 区本身是 canvas，不是 card

