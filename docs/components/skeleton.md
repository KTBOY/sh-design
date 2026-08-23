---
description: Vue3 骨架屏 ShSkeleton：组件 + v-skeleton 自定义指令双用法，微光扫过动画，头像/标题/段落组合与单形状变体，loading 切换真实内容，适用于异步加载占位。
---

# Skeleton 骨架屏

加载期间的**过渡占位**：组件模式用 `loading` 一键切换「骨架 ↔ 真实内容」；指令模式 `v-skeleton` 直接骨架化现有元素，零模板成本。微光扫过动画与 [ShLazyImage](/components/lazy-image) 的骨架一致，颜色 / 时长可通过 CSS 变量定制。

:::: tip 两种用法怎么选
**`ShSkeleton` 组件** —— 适合"整块区域"的占位（文章、卡片、评论），`loading` 切换真实内容，结构与 `Vant / Element Plus / Ant Design` 的 Skeleton 对齐：`rows` / `row-width` / `avatar` / `title` / `count` / `throttle` 一应俱全。
**`v-skeleton` 指令** —— 适合"已有布局"的临时遮罩：给任意元素挂 `v-skeleton="loading"`，子内容隐藏、原位覆盖微光遮罩，尺寸零偏移，不用再写一份骨架模板。
::::

<script setup>
import { onMounted, ref } from 'vue'

// ===== 基础用法：loading 切换 =====
const basicLoading = ref(true)
const basicText = ref('')

async function reloadBasic() {
  basicLoading.value = true
  await new Promise((r) => setTimeout(r, 1500))
  basicText.value =
    '这是一段异步加载完成后的真实内容。骨架屏的作用是在数据到达前稳定布局、缓解等待焦虑——你现在看到的文字就是默认插槽的内容，loading 变为 false 后自动替换掉骨架。'
}

// ===== 指令演示：骨架化现有卡片 =====
const cardLoading = ref(true)
const card = ref({
  name: 'shuke',
  bio: '前端工程师 / 开源爱好者',
  tags: ['Vue 3', 'TypeScript', 'uni-app']
})

async function reloadCard() {
  cardLoading.value = true
  await new Promise((r) => setTimeout(r, 1500))
  cardLoading.value = false
}

// ===== 指令深度模式演示 =====
const deepLoading = ref(false)

async function reloadDeep() {
  deepLoading.value = true
  await new Promise((r) => setTimeout(r, 1500))
  deepLoading.value = false
}

// ===== throttle 防闪演示 =====
const throttleLoading = ref(false)
const throttleCount = ref(0)
const throttleText = ref('点击按钮发起一次 300ms 的"闪请求"：开启防闪后骨架不出现，直接呈现内容。')

async function quickFetch() {
  throttleLoading.value = true
  await new Promise((r) => setTimeout(r, 300))
  throttleLoading.value = false
  throttleCount.value++
  throttleText.value = `第 ${throttleCount.value} 次快速请求完成（300ms）。throttle 生效时骨架没有闪现。`
}

onMounted(() => {
  reloadBasic()
  setTimeout(() => (cardLoading.value = false), 1500)
})
</script>

## 基础用法

<style>
.sh-doc-btn { padding: 3px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; font-size: 13px; background: var(--vp-c-bg); cursor: pointer; }
.sh-doc-btn.on { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
</style>

`loading` 为 `true` 渲染骨架，为 `false` 渲染默认插槽的真实内容。默认是「标题 + 3 行段落」组合。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px;">
    <button class="sh-doc-btn" :class="{ on: basicLoading }" @click="reloadBasic">重新加载</button>
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
    <button class="sh-doc-btn" @click="quickFetch">发起 300ms 闪请求</button>
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
    <button class="sh-doc-btn" :class="{ on: cardLoading }" @click="reloadCard">重新加载</button>
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
    <img src="./avatar.png" />
    <div>{{ user.name }}</div>
  </div>

  <!-- 关闭微光动画 -->
  <div v-skeleton="{ animated: false }">...</div>
</template>
```

按需引入（未全量 `app.use(ShDesign)`）时手动注册指令：

```ts
import { vSkeleton } from 'sh-design'

app.directive('Skeleton', vSkeleton)
```

## 指令深度模式（v-skeleton.deep）

默认模式盖一整块遮罩，适合简单区域；**结构复杂的卡片**用 `.deep`——不整块覆盖，而是让每个子元素按**自身形状**变成微光块：圆形头像自然是圆形、文字按行高变条、胶囊标签变胶囊，间距布局原样保留，得到接近真实结构的骨架。同样零测量、零布局偏移。

<div class="sh-demo" style="display:block">
  <div style="margin-bottom: 10px;">
    <button class="sh-doc-btn" :class="{ on: deepLoading }" @click="reloadDeep">重新加载</button>
    <span style="color: var(--vp-c-text-2); font-size: 13px; margin-left: 8px;">同一张卡片：头像 / 标题 / 段落 / 胶囊标签各自按形状骨架化</span>
  </div>
  <div
    v-skeleton.deep="deepLoading"
    style="max-width: 420px; display: flex; gap: 14px; align-items: center; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 10px;"
  >
    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(120deg,#2563eb,#22d3ee);flex:none;"></div>
    <div style="min-width:0;">
      <b>{{ card.name }}</b>
      <p style="margin:2px 0 8px;color:var(--vp-c-text-2);font-size:13px;">{{ card.bio }}</p>
      <span v-for="t in card.tags" :key="t" style="display:inline-block;margin-right:6px;padding:1px 8px;border:1px solid var(--vp-c-divider);border-radius:999px;font-size:12px;color:var(--vp-c-brand-1);background:var(--vp-c-bg);">{{ t }}</span>
    </div>
  </div>
</div>

```vue
<div v-skeleton.deep="loading" class="user-card">
  <img class="avatar" src="./avatar.png" />
  <div>
    <b>{{ user.name }}</b>
    <p>{{ user.bio }}</p>
  </div>
</div>
```

:::: warning 深度模式的生成规则与边界
- **铺微光的元素**：常见文本标签（`h1-h6` / `p` / `li` / `b` / `span` / `a` / `button` 等）按自身行盒变条，**空元素**（带圆角的空 `div`、`input` 等）按自身形状变块——圆形头像就是圆形微光块；**容器型元素不铺底**，留白原样保留，所以看得到结构。
- `img` / `video` / `canvas` / `iframe` 的**内容**无法透明化，深度模式下仅保留其占位空间（`fill="currentColor"` 的 svg 图标会随文字一起隐身）；
- 规则使用 `!important` 覆盖后代样式，加载结束即整体还原，不影响正常态。
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
| `v-skeleton.deep="loading"` | 深度模式：逐后代骨架化，每个子元素按自身形状（圆角/行高/间距）变微光块，适合结构复杂的卡片 |
| `v-skeleton="{ animated: false, deep: true }"` | 对象参数：`animated` 关闭微光动画，`deep` 开启深度模式 |

### CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--sh-skeleton-bg` | `#f2f3f5` | 骨架底色 |
| `--sh-skeleton-highlight` | `#e6e8eb` | 微光高亮色 |
| `--sh-skeleton-duration` | `1.4s` | 单次扫过时长 |
