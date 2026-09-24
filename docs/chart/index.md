---
title: sk-chart · 轻量 SVG 图表库
description: "sk-chart（npm 包名 sk-chart-duo）——零依赖、gzip ~8KB 的 SVG-first 图表库，首版提供折纸漏斗柱状图 FoldBarChart，G2Plot 风格命令式 API，TypeScript strict，多实例安全。"
---
# sk-chart 图表库

`sk-chart` 是一个**轻量、SVG-first** 的图表库，主打手工打磨的视觉风格。零依赖、gzip **~8KB**，viewBox 设计空间任意容器宽度自适应，G2Plot 风格命令式 API（`new Chart(el, config)` + `update` / `resize` / `destroy` / `on`），TypeScript strict，几何与比例尺全部纯函数 + 单测覆盖。

## 特性

- **零依赖**，gzip ~8KB，直接引入构建产物（ESM / CJS）或 npm 安装
- **SVG 渲染**，viewBox 设计空间，容器宽度自适应；SVG 本身透明，底色由宿主页面控制
- **G2Plot 风格 API**：`new FoldBarChart(el, config)` + `update` / `resize` / `destroy` / `on`
- **多实例安全**：`defs` id 与样式按实例隔离，同页多图互不干扰
- **主题系统**：内置 `light` / `dark` 预设，`registerTheme` 注册自定义主题包，皮肤 / token / 格式化三层可配
- **导出与无障碍**：`toSVGString` / `getDataURL` / `download`；键盘 `←` `→` `Home` `End` 导航，`prefers-reduced-motion` 自动降级

## 安装

::: code-group

```bash
npm install sk-chart-duo
```

```bash
pnpm add sk-chart-duo
```

```bash
yarn add sk-chart-duo
```

:::

也可直接引入构建产物：`dist/index.js`（ESM）/ `dist/index.cjs`（CJS）/ `dist/index.d.ts`（类型）。

## 快速上手

首版提供 **FoldBarChart**：折纸漏斗柱状图——渐变柱体由"折面"相连，闲置列呈条纹纸感，高亮列浮起 wash 与 tooltip。

```ts
import { FoldBarChart } from 'sk-chart-duo'

const chart = new FoldBarChart('#container', {
  data: [
    { label: '发起支付', value: 65.2 },
    { label: '授权支付', value: 54.8 },
    { label: '支付成功', value: 48.6 },
    { label: '商户打款', value: 38.3 },
    { label: '完成交易', value: 32.9 }
  ],
  scale: { exponent: 2 }, // 折纸漏斗轮廓；默认 1 = 线性
  state: { defaultActive: 2 }, // 闲置时高亮第 3 列
  title: { text: '支付' }
})

chart.on('column:click', ({ index, datum }) => console.log(index, datum))
chart.update({ data: nextData }) // 全量重绘
chart.resize(960, 430) // 变更 viewBox 设计空间
chart.destroy() // 清理 DOM 与事件
```

## 在线体验

下面是一张**实时挂载**的真实 `FoldBarChart`（非图片）：可悬停/点击切换高亮列，用 `随机数据`/`还原` 体验 `update`，用 `深色主题` 切换内置 `theme` 预设，用 `导出 PNG` 触发 `download`。

<FoldBarDemo />

## 示例

以下每个案例都是**实时挂载**的真实 `FoldBarChart`（非截图），复用同一个 `<ChartPreview :config="..." />` 预览单元，只换 config 即可渲染不同图表。

<script setup>
const PAYMENTS = [
  { label: '发起支付', value: 65.2 },
  { label: '授权支付', value: 54.8 },
  { label: '支付成功', value: 48.6 },
  { label: '商户打款', value: 38.3 },
  { label: '完成交易', value: 32.9 }
]

const WEEK = [
  { label: '周一', value: 12.4 },
  { label: '周二', value: 18.2 },
  { label: '周三', value: 15.7 },
  { label: '周四', value: 24.9 },
  { label: '周五', value: 31.5 },
  { label: '周六', value: 27.8 },
  { label: '周日', value: 21.3 }
]

// 转化率 tooltip：数值 + 相对上一列的环节转化率
const convFormatter = (d, i, data) => {
  const prev = i > 0 ? data[i - 1].value : null
  const conv = prev ? Math.round((d.value / prev) * 100) : 100
  return [
    { text: `${d.value.toFixed(1)}k`, tone: 'b' },
    { text: ' 笔交易', tone: 'n' },
    { text: '  |  ', tone: 's' },
    { text: '环节转化 ', tone: 'n' },
    { text: `${conv}%`, tone: 'b' }
  ]
}

// 底部语义行：阶段序号 + 环节转化率（返回数组则逐行渲染）
const stageLabels = (d, i, data) => {
  const prev = i > 0 ? data[i - 1].value : d.value
  const pct = prev > 0 ? Math.round((d.value / prev) * 100) : 0
  return [`第 ${i + 1} 阶段`, `${pct}%`]
}

// 青绿（teal）换肤：柱体渐变 / 折面 / pill 全部可换
const TEAL_ACTIVE = [[0, '#0E7A6C'], [0.42, '#17A38F'], [0.82, '#BDEBE2'], [1, '#EAFBF7']]
const TEAL_NORMAL = [[0, '#0F8A7A'], [0.42, '#27B39D'], [0.82, '#C8EFE7'], [1, '#EDFCF9']]
const TEAL_FOLD = [[0, '#8ADCD0'], [0.38, '#BDEAE2'], [1, '#F1FAF8']]
const TEAL_PILL = {
  gradient: [[0, '#F1FEFB'], [0.45, '#B5F0E4'], [1, '#34C4AC']],
  shadow: { color: '#2E8F7F', opacity: 0.75 }
}

const funnelCfg = { data: PAYMENTS, scale: { exponent: 2 }, state: { defaultActive: 2 }, title: { text: 'exponent: 2 —— 折纸漏斗轮廓' } }
const linearCfg = { data: PAYMENTS, scale: { exponent: 1 }, state: { defaultActive: 2 }, title: { text: 'exponent: 1 —— 线性高度' } }
const cleanCfg = { data: PAYMENTS, scale: { exponent: 1 }, title: { text: '普通柱状图（关闭装饰）' }, style: { stripePattern: { enabled: false }, pill: { enabled: false }, washEnabled: false, fadeMask: { enabled: false } } }
const tealCfg = { data: WEEK, title: { text: '一周活跃（自定义配色）' }, style: { barGradient: { active: TEAL_ACTIVE, normal: TEAL_NORMAL }, foldGradient: TEAL_FOLD, pill: TEAL_PILL } }
const axisCfg = { data: PAYMENTS, height: 430, scale: { exponent: 2 }, title: { text: '支付（含坐标轴）' }, tooltip: { formatter: convFormatter }, xAxis: { showLine: true, showTick: true, bottomLabels: stageLabels, title: { text: '支付阶段 →' } } }
const tooltipCfg = { data: PAYMENTS, scale: { exponent: 2 }, state: { defaultActive: 2 }, title: { text: '自定义 tooltip（环节转化率）' }, tooltip: { formatter: convFormatter } }
const darkCfg = { data: PAYMENTS, scale: { exponent: 2 }, state: { defaultActive: 2 }, title: { text: '暗色主题' }, theme: 'dark' }
</script>

### 折纸轮廓与线性映射（`scale.exponent`）

同一组数据，`exponent` 决定柱高映射的幂次：`2` 还原折纸漏斗的加速收窄轮廓，`1` 是普通线性高度。

<ChartPreview :config="funnelCfg" />
<ChartPreview :config="linearCfg" />

```ts
{ scale: { exponent: 2 } } // 折纸漏斗轮廓（默认 1 = 线性）
```

### 普通柱状图（关闭装饰）

把 `style` 里的条纹 / pill / wash / 渐隐遮罩逐项 `enabled: false`，就得到一张干净的普通柱状图——同一套 API，既能做折纸风也能做常规风。

<ChartPreview :config="cleanCfg" />

```ts
{
  scale: { exponent: 1 },
  style: {
    stripePattern: { enabled: false },
    pill: { enabled: false },
    washEnabled: false,
    fadeMask: { enabled: false }
  }
}
```

### 自定义配色换肤（`style`）

柱体渐变（`barGradient.active` / `normal`）、折面渐变（`foldGradient`）、pill 与阴影全部可换，示例用青绿主题渲染一周活跃数据。

<ChartPreview :config="tealCfg" />

```ts
style: {
  barGradient: { active: TEAL_ACTIVE, normal: TEAL_NORMAL },
  foldGradient: TEAL_FOLD,
  pill: { gradient: TEAL_PILL_GRADIENT, shadow: { color: '#2E8F7F', opacity: 0.75 } }
}
```

### 完整坐标轴（`xAxis`）

`showLine` / `showTick` 打开柱底基线与列刻度，`bottomLabels` 在渐隐带下方渲染语义行（阶段序号 + 环节转化率），`title` 补一行轴标题。

<ChartPreview :config="axisCfg" />

```ts
{
  height: 430, // 给底部坐标轴带预留空间
  xAxis: {
    showLine: true,
    showTick: true,
    bottomLabels: (d, i, data) => [`第 ${i + 1} 阶段`, `${pct}%`],
    title: { text: '支付阶段 →' }
  }
}
```

### 自定义 tooltip（`tooltip.formatter`）

`formatter` 返回 `TooltipPart[]`，`tone` 用 `'b'`（加粗墨色）/ `'s'`（分隔符）/ `'n'`（常规）排版——悬停高亮列即显示数值与相对上一列的环节转化率。

<ChartPreview :config="tooltipCfg" />

```ts
tooltip: {
  formatter: (d, i, data) => {
    const prev = i > 0 ? data[i - 1].value : null
    const conv = prev ? Math.round((d.value / prev) * 100) : 100
    return [
      { text: `${d.value.toFixed(1)}k`, tone: 'b' },
      { text: ' 笔交易  |  环节转化 ', tone: 'n' },
      { text: `${conv}%`, tone: 'b' }
    ]
  }
}
```

### 暗色主题（`theme`）

`theme: 'dark'` 一键切到内置暗色预设（SVG 本身透明，这里给容器铺了深色底）。

<ChartPreview :config="darkCfg" dark />

```ts
{ theme: 'dark' } // 内置 light / dark 预设；也可传主题包名或内联 token
```

## API

### `FoldBarChartConfig`

| 字段                        | 类型                                                 | 默认                         | 说明                                                      |
| --------------------------- | ---------------------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| `data`                    | `FoldBarDatum[]`                                   | 必填                         | `{ label, value, ...extra }`                            |
| `xField` / `yField`     | `string`                                           | `label` / `value`        | 数据字段映射                                              |
| `width` / `height`      | `number`                                           | `860` / `386`            | viewBox 设计空间                                          |
| `valueFormat`             | `(v) => string`                                    | `v => v.toFixed(1)+'k'`    | 柱头数值格式                                              |
| `padding`                 | `Partial<{top,right,bottom,left}>`                 | `64/29/26/73`              | 绘图区留白；启用 `xAxis.bottomLabels` 时底部自动扩高    |
| `stair`                   | `{ bottomOffset?, topOffset? }`                    | `30` / `74`              | 柱顶阶梯锚点（value=0 与 max 的柱顶位置）                 |
| `scale.exponent`          | `number`                                           | `1`                        | 高度映射幂次；`2` 还原折纸漏斗轮廓                      |
| `fold.run`                | `number`                                           | `20`                       | 折面水平跨度                                              |
| `fold.creaseColor/Width`  | —                                                   | 白 /`1.2`                  | 折痕高光                                                  |
| `axis.ticks`              | `number[]`                                         | 自动（nice）                 | y 轴刻度值；位置按 `barTopOf` 真实映射                  |
| `axis.tickFormat`         | `(v) => string`                                    | `v => v+'k'`               | 刻度文案                                                  |
| `xAxis.labelFormat`       | `(d, i, data) => string`                           | xField 值                    | 顶部类目行文案                                            |
| `xAxis.bottomLabels`      | `(d, i, data) => string \| string[]`                | 无                           | 底部语义行（如阶段序号 + 环节转化率），渲染在渐隐遮罩之外 |
| `xAxis.title`             | `{ text?, x?, y? }`                                | 无                           | X 轴标题，位于底部语义行之后的下一行，默认水平居中        |
| `xAxis.showLine/showTick` | `boolean`                                          | `false`                    | 柱底基线 / 列中心刻度线（均在渐隐带下方）                 |
| `xAxis.showGrid`          | `boolean`                                          | `true`                     | 竖直分列线                                                |
| `tooltip.enabled`         | `boolean`                                          | `true`                     |                                                           |
| `tooltip.formatter`       | `(datum, i, data) => TooltipPart[]`                | 类目 + 数值                  | 自定义 tooltip 内容                                       |
| `state.defaultActive`     | `number`                                           | 最后一列                     | 闲置高亮列                                                |
| `title`                   | `{ text?, x?, y? }`                                | 无标题                       | 左上标题                                                  |
| `style`                   | `FoldBarStyleConfig`                               | 原稿配色                     | 条纹/渐变/pill/阴影/渐隐等全部可换肤                      |
| `theme`                   | `'light' \| 'dark' \| ThemePack \| DeepPartialTokens` | 原稿外观（等价 `'light'`） | 预设名 / 内联主题包 / 旧版字体 token 局部                 |

### 主题预设

```ts
import { registerTheme, FoldBarChart } from 'sk-chart-duo'

registerTheme('brand', {
  style: { barGradient: { normal: myStops } }, // 视觉皮肤
  tokens: { title: { fill: '#0A0A0A' } }, // 字体/颜色/过渡 token
  formats: { valueFormat: (v) => `${v}k` } // 默认数值/刻度格式化
})

new FoldBarChart(el, { data, theme: 'dark' }) // 内置预设
new FoldBarChart(el, { data, theme: 'brand' }) // 自定义预设
new FoldBarChart(el, { data, theme: { tokens: { ... } } }) // 内联主题包
```

- 内置 `light`（原稿折纸皮肤）与 `dark` 两个预设
- 解析顺序：内置默认 → 主题包 → config 显式字段，后者优先
- 旧写法 `theme: { number: { fontSize: 22 } }`（直接传 token 局部）完全兼容
- 未知预设名回退默认并 `console.warn`

### 事件

| 事件名           | 回调参数             | 触发时机                                         |
| ---------------- | -------------------- | ------------------------------------------------ |
| `column:enter` | `{ index, datum }` | 鼠标 / 触摸进入某列                              |
| `column:leave` | `{ index, datum }` | 移出某列                                         |
| `column:click` | `{ index, datum }` | 点击列，或 SVG 聚焦后 `Enter` / `Space` 触发 |

### 方法

| 方法                                             | 说明                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `update(partial)`                              | 合并部分 config 并全量重绘                                                                     |
| `resize(width, height)`                        | 变更 viewBox 设计空间并重绘                                                                    |
| `on(event, handler)` / `off(event, handler)` | 绑定 / 解绑事件                                                                                |
| `setActive(index)`                             | 编程式高亮指定列                                                                               |
| `activeIndex`                                  | 当前高亮列下标（只读 getter）                                                                  |
| `toSVGString()`                                | 独立 SVG 文本（内嵌样式与 defs），可直接存 `.svg` 或内联                                     |
| `getDataURL(options?)`                         | 当前图表 data URL，默认 PNG 2x；`options`：`type` / `scale` / `background`（缺省透明） |
| `download(options?)`                           | 触发浏览器下载，默认 `sk-chart.png`；`options` 同上另加 `filename`                       |
| `destroy()`                                    | 清理 DOM 与事件                                                                                |

### 交互与无障碍

悬停/触摸切换高亮列；SVG 聚焦后 `←` / `→` / `Home` / `End` 导航，`Enter` / `Space` 触发 `column:click`；移出回落到 `defaultActive`。列具备 `role="listitem"` 与同步的 `aria-selected`；`prefers-reduced-motion: reduce` 下自动关闭过渡动画。

## 相关链接

- 源码与示例：[KTBOY/sk-chart](https://github.com/KTBOY/sk-chart)
- npm 包：[sk-chart-duo](https://www.npmjs.com/package/sk-chart-duo)
