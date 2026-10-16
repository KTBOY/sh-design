---
description: Vue3 骨架屏 ShSkeleton：组件 + v-skeleton 自定义指令双用法，微光扫过动画，头像/标题/段落组合与单形状变体，loading 切换真实内容，深度模式测量真实文本行与图片，支持可选尺寸提示。
---

# Skeleton 骨架屏

加载期间的**过渡占位**：组件模式用 `loading` 一键切换「骨架 ↔ 真实内容」；指令模式 `v-skeleton` 直接骨架化现有元素，不必另写占位模板。微光扫过动画与 [ShLazyImage](/components/lazy-image) 的骨架一致，颜色 / 时长可通过 CSS 变量定制。

:::: tip 两种用法怎么选
**`ShSkeleton` 组件** —— 适合"整块区域"的占位（文章、卡片、评论），`loading` 切换真实内容，结构与 `Vant / Element Plus / Ant Design` 的 Skeleton 对齐：`rows` / `row-width` / `avatar` / `title` / `count` / `throttle` 一应俱全。
**`v-skeleton` 指令** —— 适合"已有布局"的临时遮罩：默认整块覆盖；`.deep` 测量真实文本行、图片与有尺寸的空元素，在独立层绘制骨架，真实 DOM 原位保留。
::::

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const timers = new Set()

/** 演示用延迟统一回收，避免离开页面后继续更新。 */
function delay(duration) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      resolve()
    }, duration)
    timers.add(timer)
  })
}

const basicLoading = ref(true)
const basicText = ref('')

async function reloadBasic() {
  basicLoading.value = true
  await delay(1500)
  basicText.value =
    '这是一段异步加载完成后的真实内容。骨架屏的作用是在数据到达前稳定布局、缓解等待焦虑——你现在看到的文字就是默认插槽的内容，loading 变为 false 后自动替换掉骨架。'
  basicLoading.value = false
}

const cardLoading = ref(true)
const card = ref({
  name: 'shuke',
  bio: '前端工程师 / 开源爱好者',
  tags: ['Vue 3', 'TypeScript', 'uni-app']
})

async function reloadCard() {
  cardLoading.value = true
  await delay(1500)
  cardLoading.value = false
}

const deepLoading = ref(false)
const deepFilled = ref(false)
const deepOptions = ref({ deep: true, animated: true })
const deepBinding = computed(() => deepLoading.value && deepOptions.value)
const deepComparisons = [
  { id: 'measured', title: '无提示：忠实于真实内容', hinted: false },
  { id: 'hinted', title: '有提示：只调整骨架绘制尺寸', hinted: true }
]
const kpiImage = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 35 35%22%3E%3Cpath d=%22M9 25V17M17 25V9M25 25V13%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%223%22/%3E%3C/svg%3E'
const metrics = computed(() => [
  { id: 'visits', label: '累计访问次数', value: deepFilled.value ? '123,456' : '--', unit: '次' },
  { id: 'tasks', label: deepFilled.value ? '累计完成的任务数量（含本周新增）' : '完成任务', value: deepFilled.value ? '256' : '--', unit: '项' },
  { id: 'rate', label: '有效比率', value: deepFilled.value ? '98.5' : '--', unit: '%' },
  { id: 'duration', label: '平均耗时', value: deepFilled.value ? '12.8' : '--', unit: '秒' }
])
const metricNotes = computed(() => [
  { id: 'today', label: '今日', value: deepFilled.value ? '128' : '--' },
  { id: 'yesterday', label: '昨日', value: deepFilled.value ? '96' : '--' }
])

function toggleDeep() {
  deepLoading.value = !deepLoading.value
}

function changeDeepData() {
  deepFilled.value = !deepFilled.value
}

function toggleDeepAnimation() {
  deepOptions.value.animated = !deepOptions.value.animated
}

const throttleLoading = ref(false)
const throttleCount = ref(0)
const throttleText = ref('点击按钮发起一次 300ms 的"闪请求"：开启防闪后骨架不出现，直接呈现内容。')

async function quickFetch() {
  throttleLoading.value = true
  await delay(300)
  throttleLoading.value = false
  throttleCount.value++
  throttleText.value = `第 ${throttleCount.value} 次快速请求完成（300ms）。throttle 生效时骨架没有闪现。`
}

onMounted(() => {
  reloadBasic()
  reloadCard()
})

onBeforeUnmount(() => {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
})
</script>

## 基础用法

<style>
.sh-doc-btn { padding: 3px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; font-size: 13px; background: var(--vp-c-bg); cursor: pointer; }
.sh-doc-btn.on { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.sh-skeleton-doc__controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.sh-skeleton-doc__comparison + .sh-skeleton-doc__comparison { margin-top: 24px; }
.sh-skeleton-doc__caption { margin-bottom: 10px; color: var(--sh-color-text-secondary); font-size: var(--sh-font-size-base); }
.sh-skeleton-doc__cards { display: flex; flex-wrap: wrap; gap: 12px; }
.sh-skeleton-doc__card { flex: 1 1 230px; min-width: 0; padding: 16px; border: 1px solid var(--sh-color-border); border-radius: var(--sh-radius); background: var(--sh-color-bg); color: var(--sh-color-text); }
.sh-skeleton-doc__main { display: flex; align-items: center; gap: 14px; }
.sh-skeleton-doc__image { flex: none; width: 35px; height: 35px; border-radius: 50%; background: var(--sh-color-bg-hover); }
.sh-skeleton-doc__text { min-width: 0; }
.sh-skeleton-doc__value { display: block; font-size: var(--sh-font-size-lg); line-height: 1.5; font-weight: 600; }
.sh-skeleton-doc__label { display: block; margin-top: 6px; font-size: var(--sh-font-size-base); line-height: 1.6; }
.sh-skeleton-doc__unit { margin-left: 3px; font-size: var(--sh-font-size-sm); }
.sh-skeleton-doc__notes { --sh-skeleton-bg: var(--sh-color-bg-active); --sh-skeleton-highlight: var(--sh-color-border); display: grid; grid-template-columns: auto 1fr; column-gap: 12px; row-gap: 8px; margin-top: 16px; padding: 10px; border-radius: var(--sh-radius-sm); background: var(--sh-color-bg-hover); font-size: var(--sh-font-size-sm); line-height: 1.5; }
.sh-skeleton-doc__note { display: contents; }
.sh-skeleton-doc__subnum { justify-self: end; }
</style>

`loading` 为 `true` 渲染骨架，为 `false` 渲染默认插槽的真实内容。默认是「标题 + 3 行段落」组合。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px;">
    <button class="sh-doc-btn" :class="{ on: basicLoading }" :disabled="basicLoading" @click="reloadBasic">重新加载</button>
  </div>
  <div style="max-width: 560px;">
    <ShSkeleton :loading="basicLoading" :rows="3">
      <p style="margin: 0; line-height: 1.9;">{{ basicText }}</p>
    </ShSkeleton>
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ShSkeleton } from 'sh-design'

const loading = ref(true)
</script>

<template>
  <ShSkeleton :loading="loading">
    <p>异步加载完成后的真实内容……</p>
  </ShSkeleton>
</template>
```

## 头像 + 组合 / 行宽 / 圆角

`avatar` 开启圆形头像；`row-width` 传数组按行下发宽度（单值则统一应用）；`round` 让文字行变成胶囊。

<div class="sh-demo" style="display:block">
  <div style="max-width: 560px; display: grid; gap: 28px;">
    <ShSkeleton avatar :rows="2" title-width="30%" />
    <ShSkeleton :rows="3" :row-width="['100%', '80%', '52%']" round />
  </div>
</div>

```vue
<ShSkeleton avatar :rows="2" title-width="30%" />
<ShSkeleton :rows="3" :row-width="['100%', '80%', '52%']" round />
```

## 单形状变体（variant）

只需要一个占位块时用 `variant`：`text` / `rect` / `circle` / `image`（`image` 默认高 200px），`height` 控制高度（`circle` 时同时作为宽度）。

<div class="sh-demo" style="display:block">
  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; max-width: 640px;">
    <ShSkeleton variant="circle" height="64px" style="flex:none" />
    <ShSkeleton variant="rect" height="120px" style="flex:1; min-width: 160px;" />
    <ShSkeleton variant="image" height="120px" style="flex:1; min-width: 160px;" />
  </div>
</div>

```vue
<ShSkeleton variant="circle" height="64px" />
<ShSkeleton variant="rect" height="120px" />
<ShSkeleton variant="image" height="120px" />
```

## 列表占位（count）

`count` 重复渲染整组骨架，常配合 `avatar` 做列表项占位。

<div class="sh-demo" style="display:block">
  <div style="max-width: 560px;">
    <ShSkeleton avatar :rows="1" :count="3" :title="true" />
  </div>
</div>

```vue
<ShSkeleton avatar :rows="1" :count="3" />
```

## 自定义骨架布局（#template）

默认组合不够用时，`#template` 插槽完全接管骨架的内部结构，块元素加 `sh-skeleton__block` 类即可获得微光效果。

<div class="sh-demo" style="display:block">
  <div style="max-width: 560px;">
    <ShSkeleton :loading="basicLoading">
      <div style="display:flex; gap:12px; align-items:center;">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(120deg,#2563eb,#22d3ee);flex:none;"></div>
        <div>
          <b>shuke</b>
          <p style="margin:4px 0 0;color:var(--vp-c-text-2);font-size:13px;">这条内容也在 loading 切换演示的控制之下。</p>
        </div>
      </div>
      <template #template>
        <div style="display:flex; gap:12px; align-items:center;">
          <div class="sh-skeleton__block" style="width:56px;height:56px;border-radius:50%;"></div>
          <div style="flex:1;">
            <div class="sh-skeleton__block" style="height:16px;width:120px;margin-bottom:10px;"></div>
            <div class="sh-skeleton__block" style="height:12px;width:70%;"></div>
          </div>
        </div>
      </template>
    </ShSkeleton>
  </div>
</div>

```vue
<ShSkeleton :loading="loading">
  <MyCard />
  <template #template>
    <div class="sh-skeleton__block" style="height: 16px; width: 40%" />
    <div class="sh-skeleton__block" style="height: 12px; width: 70%" />
  </template>
</ShSkeleton>
```

## 防闪（throttle）

请求很快返回时骨架闪一下反而干扰：`throttle` 让骨架在 loading 持续超过指定毫秒后才出现（loading 结束立即隐藏）。下面左右两块对比，右边开启了 `throttle: 500`。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px;">
    <button class="sh-doc-btn" :disabled="throttleLoading" @click="quickFetch">发起 300ms 闪请求</button>
    <span style="color: var(--vp-c-text-2); font-size: 13px; margin-left: 8px;">{{ throttleText }}</span>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 640px;">
    <div>
      <div style="font-size:12px;color:var(--vp-c-text-3);margin-bottom:8px;">无 throttle（骨架闪现）</div>
      <ShSkeleton :loading="throttleLoading" :rows="2" />
    </div>
    <div>
      <div style="font-size:12px;color:var(--vp-c-text-3);margin-bottom:8px;">throttle 500ms（不闪）</div>
      <ShSkeleton :loading="throttleLoading" :rows="2" :throttle="500" />
    </div>
  </div>
</div>

```vue
<ShSkeleton :loading="loading" :rows="2" :throttle="500" />
```

## 指令用法（v-skeleton）

已有成品布局、只想加载期间打个"占位补丁"时，指令最省事：`v-skeleton="loading"` 骨架化整个元素——子内容隐藏、原位覆盖微光遮罩，**尺寸与布局零偏移**。传对象 `{ animated: false }` 可关闭动画。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px;">
    <button class="sh-doc-btn" :class="{ on: cardLoading }" :disabled="cardLoading" @click="reloadCard">重新加载</button>
  </div>
  <div
    v-skeleton="cardLoading"
    style="max-width: 420px; display: flex; gap: 14px; align-items: center; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 10px;"
  >
    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(120deg,#2563eb,#22d3ee);flex:none;"></div>
    <div style="min-width:0;">
      <b>{{ card.name }}</b>
      <p style="margin:2px 0 8px;color:var(--vp-c-text-2);font-size:13px;">{{ card.bio }}</p>
      <span v-for="t in card.tags" :key="t" style="display:inline-block;margin-right:6px;padding:1px 8px;border:1px solid var(--vp-c-divider);border-radius:999px;font-size:12px;color:var(--vp-c-brand-1);">{{ t }}</span>
    </div>
  </div>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <!-- 布局零偏移：加载完内容原位显现 -->
  <div v-skeleton="loading" class="user-card">
    <img src="./avatar.png" alt="头像" />
    <div>{{ user.name }}</div>
  </div>

  <!-- 对象本身为真值，用 loading && 对象 控制关闭 -->
  <div v-skeleton="loading && { animated: false }">...</div>
</template>
```

按需引入（未全量 `app.use(ShDesign)`）时手动注册指令：

```ts
import { vSkeleton } from 'sh-design'

app.directive('Skeleton', vSkeleton)
```

## 指令深度模式（v-skeleton.deep）

默认模式盖一整块遮罩；`.deep`（或对象参数 `deep: true`）则**测量现有内容**，在独立绝对定位层绘制。真实节点不复制、不搬移、不包裹：容器继续负责布局、背景、圆角与留白，文本通过 `Range` 按文本流 / 视觉行合并，图片及有尺寸的空元素按真实盒子生成块。

下面两组使用同一份 KPI 数据：35×35 的真实图片、block 两行文本、grid 两列小注、`display: contents` 行和嵌套小字号单位。可以一直保持 loading，再改变数据，观察无提示时 `--` 的短条、嵌套单位合行及长文案换行；动画按钮原位修改同一个选项对象。

<div class="sh-demo" style="display:block">
  <div class="sh-skeleton-doc__controls">
    <button class="sh-doc-btn" :class="{ on: deepLoading }" @click="toggleDeep">{{ deepLoading ? '结束 loading' : '开启 loading' }}</button>
    <button class="sh-doc-btn" @click="changeDeepData">{{ deepFilled ? '恢复 --' : '填入数据与长文案' }}</button>
    <button class="sh-doc-btn" :class="{ on: deepOptions.animated }" @click="toggleDeepAnimation">{{ deepOptions.animated ? '关闭动画' : '开启动画' }}</button>
  </div>
  <div v-for="comparison in deepComparisons" :key="comparison.id" class="sh-skeleton-doc__comparison">
    <div class="sh-skeleton-doc__caption">{{ comparison.title }}</div>
    <div class="sh-skeleton-doc__cards">
      <div v-for="metric in metrics" :key="metric.id" v-skeleton="deepBinding" class="sh-skeleton-doc__card">
        <div class="sh-skeleton-doc__main">
          <img
            :src="kpiImage"
            alt="指标图标"
            class="sh-skeleton-doc__image"
            :data-sh-skeleton-width="comparison.hinted ? 40 : null"
            :data-sh-skeleton-height="comparison.hinted ? 40 : null"
          />
          <div class="sh-skeleton-doc__text">
            <span
              class="sh-skeleton-doc__value"
              :data-sh-skeleton-width="comparison.hinted ? 74 : null"
              :data-sh-skeleton-height="comparison.hinted ? 18 : null"
            >{{ metric.value }}<span class="sh-skeleton-doc__unit">{{ metric.unit }}</span></span>
            <span
              class="sh-skeleton-doc__label"
              :data-sh-skeleton-width="comparison.hinted ? 92 : null"
              :data-sh-skeleton-height="comparison.hinted ? 14 : null"
            >{{ metric.label }}</span>
          </div>
        </div>
        <div v-if="metric.id === 'visits'" class="sh-skeleton-doc__notes">
          <span
            v-for="note in metricNotes"
            :key="note.id"
            class="sh-skeleton-doc__note"
            :data-sh-skeleton-group="comparison.hinted ? '' : null"
            :data-sh-skeleton-width="comparison.hinted ? 64 : null"
            :data-sh-skeleton-height="comparison.hinted ? 12 : null"
          >
            <span>{{ note.label }}</span>
            <span class="sh-skeleton-doc__subnum">{{ note.value }}<span class="sh-skeleton-doc__unit">次</span></span>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

### 可选提示：标注真实节点，不另写占位模板

无提示时位置和宽高来自真实内容，**不会把 `--` 猜成 74px**。需要统一视觉尺寸时，在真实节点上标注正数 px：下面把图片绘制为 **40×40**，两行文本绘制为 **74×18 / 92×14**，小注每行绘制为 **64×12**。这些是调用方的设计选择，不是指令的默认值。

```vue
<div v-skeleton.deep="loading" class="kpi-card">
  <div style="display: flex; gap: 14px; align-items: center">
    <img
      src="./metric.svg"
      alt="指标图标"
      style="width: 35px; height: 35px; border-radius: 50%"
      data-sh-skeleton-width="40"
      data-sh-skeleton-height="40"
    />
    <div>
      <span style="display: block" data-sh-skeleton-width="74" data-sh-skeleton-height="18">
        {{ value }}<span style="font-size: var(--sh-font-size-sm)">次</span>
      </span>
      <span style="display: block; margin-top: 6px" data-sh-skeleton-width="92" data-sh-skeleton-height="14">
        累计访问次数
      </span>
    </div>
  </div>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 12px">
    <span
      v-for="note in notes"
      :key="note.id"
      style="display: contents"
      data-sh-skeleton-group
      data-sh-skeleton-width="64"
      data-sh-skeleton-height="12"
    >
      <span>{{ note.label }}</span>
      <span>{{ note.value }}<span style="font-size: var(--sh-font-size-sm)">次</span></span>
    </span>
  </div>
</div>
```

:::: warning 生成规则与支持边界
- **文本按文本流 / 行合并**：同一主题、同一行的数值与嵌套单位只画一条，多行仍是多条。flex / grid 包装本身不涂大块；独立子项不会仅因同高就自动合并。
- **`display: contents` 递归遍历**：它没有自身盒子；加 `data-sh-skeleton-group` 后，同一组的可见后代按视觉行合并（可跨 grid 列），不是把整个多行区域铺成一块。嵌套 group 由最外层分组负责。
- **尺寸提示只管绘制**：文本节点的提示应用于该文本流的每一行；组的提示应用于组内每一视觉行；图片 / 空元素应用于自身块。保持左上角，超出宿主可视区域会裁剪，不修改真实宽高、间距和滚动范围。没有盒子的空节点无法凭提示生成位置。
- **保留容器外观**：背景、边框与圆角不统一清空。图片（以及 video / canvas / iframe / SVG / 表单控件）按外框占位，不解析内部像素；有尺寸的空元素保留外框圆角。`display:none`、`visibility:hidden`、`opacity:0` 的内容不绘制。
- **只在加载期按需测量**：DOM / 文本 / 尺寸变化、图片加载、字体加载、滚动及窗口 resize 经 rAF 合并，先读后写；不是零测量，也不是逐帧轮询。关闭、切换模式和卸载时清理观察器、监听、帧与绘制层，恢复定位和相关属性。
- **适用常规水平排版与正向二维缩放**：宿主必须是可容纳绘制层的普通盒子（如 div），支持其边框和滚动。不支持宿主本身为 `display:contents` / 多行 inline / 替换元素、旋转 / 倾斜 / 3D、竖排、伪元素生成内容、Shadow DOM 或脱离宿主的浮层；持续 CSS 动画引起的位置变化不会逐帧追踪。复杂特殊布局仍可用 `ShSkeleton #template`。
- `animated: false` 与系统 `prefers-reduced-motion: reduce` 都关闭骨架微光。对象本身为真值，需使用 `loading && options` 结束加载。
::::

## 主题定制

通过 CSS 变量定制骨架外观（`ShSkeleton` 与 `v-skeleton` 共用同一套变量）：

```css
/* 换成暗色主题 */
.your-scope {
  --sh-skeleton-bg: hsl(220 14% 22%);
  --sh-skeleton-highlight: hsl(220 14% 30%);
  --sh-skeleton-duration: 1.8s;
}
```

深度模式保留实际文本流、媒体或显式 group **来源作用域**的 `--sh-skeleton-bg` / `--sh-skeleton-highlight` / `--sh-skeleton-duration` / `--sh-radius-sm`，包括中间祖先上的局部覆盖与 `var(...)` 引用；只在绘制块传递必要的已解析 token，不复制整套样式。同主题的嵌套单位仍合行，inline 主题变化时才分段；显式 group 合并后统一使用 group 自身作用域的主题。

删除局部覆盖后会清理绘制块的旧 token，回退到继承主题或默认值。与宿主相同的变量直接继承，不固化宿主快照；祖先（含根节点）的主题属性变化、head 内样式节点更新及系统配色切换会触发合帧重读。上方小注示例仅在 `.sh-skeleton-doc__notes` 内使用已有 `--sh-color-bg-active` / `--sh-color-border` 调整骨架颜色，与浅灰容器背景区分，不修改全局主题。

## API

### Props（ShSkeleton）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `loading` | 是否加载中：`true` 渲染骨架，`false` 渲染默认插槽内容 | `Boolean` | `true` |
| `rows` | 段落行数（组合模式） | `Number` | `3` |
| `row-width` | 行宽：单值统一应用；数组按行下发；缺省时末行 60%、其余 100% | `String \| String[]` | `-` |
| `title` | 是否显示标题行 | `Boolean` | `true` |
| `title-width` | 标题行宽度 | `String` | `'38%'` |
| `avatar` | 是否显示圆形头像 | `Boolean` | `false` |
| `avatar-size` | 头像尺寸（宽高一致） | `String` | `'40px'` |
| `round` | 文字行是否为胶囊圆角 | `Boolean` | `false` |
| `variant` | 单形状模式：`text` / `rect` / `circle` / `image`，指定后忽略组合配置 | `String` | `-` |
| `height` | 单形状高度（`circle` 时同时作为宽度） | `String` | `-` |
| `count` | 骨架组重复次数（列表占位） | `Number` | `1` |
| `throttle` | loading 变 `true` 后延迟多少毫秒再显示骨架，防快请求闪现；loading 变 `false` 立即隐藏 | `Number` | `0` |
| `animated` | 是否开启微光扫过动画 | `Boolean` | `true` |
| `tag` | 渲染的根元素标签 | `String` | `'div'` |

### Slots（ShSkeleton）

| 插槽名 | 说明 |
| --- | --- |
| `default` | 真实内容，`loading: false` 时渲染 |
| `template` | 完全自定义骨架布局（内部块元素加 `sh-skeleton__block` 类获得微光效果） |

### 指令（v-skeleton）

| 用法 | 说明 |
| --- | --- |
| `v-skeleton="loading"` | 值为真值时骨架化元素：子内容隐藏，原位覆盖微光遮罩（遮罩尺寸与圆角自动跟随元素自身，圆形元素即圆形遮罩） |
| `v-skeleton.deep="loading"` | 测量真实文本流 / 行、图片与有尺寸的空元素，独立绘制，不改变真实节点布局 |
| `v-skeleton="loading && { animated: false, deep: true }"` | 对象参数：`animated: false` 关闭微光动画，`deep: true` 开启深度模式；也支持原位修改同一选项对象 |

### 真实节点提示（仅 deep）

| 属性 | 值 | 说明 |
| --- | --- | --- |
| `data-sh-skeleton-group` | 属性存在即生效 | 将可见后代按视觉行合并，支持 `display: contents`；删除属性取消分组 |
| `data-sh-skeleton-width` | 正数像素，如 `74` / `74px` | 可选绘制宽度；不接受百分比、负数、零或表达式，无效值忽略 |
| `data-sh-skeleton-height` | 正数像素，如 `18` / `18px` | 可选绘制高度；规则同 width，均不改变真实布局 |

### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--sh-skeleton-bg` | `#f2f3f5` | 骨架底色 |
| `--sh-skeleton-highlight` | `#e6e8eb` | 微光高亮色 |
| `--sh-skeleton-duration` | `1.4s` | 单次扫过时长 |
| `--sh-radius-sm` | `4px` | 文字骨架默认圆角；deep 媒体或已有圆角的文本流保留来源外框圆角 |
