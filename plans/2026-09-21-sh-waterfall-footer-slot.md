# ShWaterfall 常驻 `#footer` 插槽改造 实施计划

**Goal:** 移除 `#loading` / `#finished` 插槽与 `loading-text` / `finished-text` props，改为常驻 `#footer` 作用域插槽，底部「加载中 / 统计 / 完成」三态完全交由业务方一处控制。

**背景（为什么要改）:** 现设计下 footer 容器由 `v-if="loading || finished"` 门控，并按 `loading` 在 `#loading` / `#finished` 两个插槽间二选一渲染。业务方若使用自带三态的提示组件（如 headcount-front 的 `LoadMore`），必须拆挂两处插槽，且「有更多数据但空闲」的中间态 footer 整体不渲染，统计条无处安放——headcount-front 实测四态里只有「加载中」能显示。

**Architecture:**
- `loading` / `finished` **props 保留**（`maybeLoadMore` 触发锁与 watch 解锁逻辑依赖它们，见 waterfall.vue L273-281、L387-395），本次只删「插槽按状态二选一」的模板逻辑。
- 新增常驻 `#footer` 作用域插槽：`v-if="$slots.footer"` 即渲染，透传 `{ loading, finished }`，业务方自行决定三态文案。
- 空态区（`items` 为空）简化：`loading` 时一律渲染内置 spinner（纯图形，不再走插槽与文案），否则渲染 `#empty` / `empty-text`。
- Breaking change：版本 `0.0.9` → `0.1.0`（0.x 下 minor 表 breaking，遵循仓库 changelog 既有的 `⚠️ Breaking` 记法）。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Vite 库构建、VitePress 文档站、pnpm workspace。

---

## 文件结构与责任

| 文件 | 责任 | 动作 |
| --- | --- | --- |
| `packages/sh-design/src/components/waterfall/src/waterfall.ts` | props 定义 | 删 `loadingText` / `finishedText` |
| `packages/sh-design/src/components/waterfall/src/waterfall.vue` | 模板渲染 | 空态块简化 + 常驻 `#footer` |
| `docs/components/waterfall.md` | 组件文档 | 示例与 API 表同步 |
| `docs/guide/changelog.md` | 更新日志 | 顶部新增 `0.1.0` 条目 |
| `packages/sh-design/package.json` | 版本号 | `0.0.9` → `0.1.0` |
| headcount-front `fillLoadAnalysListCard.vue` | 使用方 | 升级后两插槽并一为 `#footer` |

---

### Task 1: waterfall.ts —— 删除文案 props

**Files:**
- Modify: `packages/sh-design/src/components/waterfall/src/waterfall.ts:155-179`

- [ ] **Step 1: 修改 `finished` prop 注释并删除两个文案 prop**

删除 `loadingText`（L165-169）与 `finishedText`（L170-174）两个 prop，同时把 `finished` 注释中「展示 finished 文案」的描述去掉（footer 文案不再由组件负责）。改动后 L150-179 区域为：

```ts
  /** 是否加载中（父组件控制；为 true 时不会重复触发 `load-more`） */
  loading: {
    type: Boolean,
    default: false
  },
  /** 是否已全部加载完（为 true 时不再触发 `load-more`） */
  finished: {
    type: Boolean,
    default: false
  },
  /** 默认插槽渲染 ShLazyImage 时的圆角 */
  radius: {
    type: [String, Number],
    default: 8
  },
  /** 空数据文案 */
  emptyText: {
    type: String,
    default: '暂无数据'
  }
}
```

- [ ] **Step 2: 运行类型检查确认 waterfall.vue 报错（预期失败，驱动 Task 2）**

Run: `cd packages/sh-design && pnpm typecheck`
Expected: FAIL，报 `loadingText` / `finishedText` 在 waterfall.vue 模板中不存在（这正是下一步要删的引用）。

---

### Task 2: waterfall.vue —— 空态简化 + 常驻 `#footer`

**Files:**
- Modify: `packages/sh-design/src/components/waterfall/src/waterfall.vue:475-534`

- [ ] **Step 1: 替换空态块（L475-484）**

空态 loading 不再走 `#loading` 插槽与 `loadingText`，一律渲染内置 spinner：

```html
    <!-- 空状态 / 首次加载 -->
    <div v-if="!items.length" class="sh-waterfall__empty">
      <span v-if="loading" class="sh-waterfall__spinner" />
      <slot v-else name="empty">{{ emptyText }}</slot>
    </div>
```

- [ ] **Step 2: 替换 footer 块（L525-534）**

业务提供 `#footer` 即常驻渲染（含「有更多但空闲」的中间态），三态判定完全下放：

```html
      <!-- 底部状态：业务提供 #footer 即常驻渲染，loading/finished 透传给业务自行展示 -->
      <div v-if="$slots.footer" class="sh-waterfall__footer">
        <slot name="footer" :loading="loading" :finished="finished" />
      </div>
```

- [ ] **Step 3: 类型检查通过**

Run: `cd packages/sh-design && pnpm typecheck`
Expected: PASS（0 errors）

- [ ] **Step 4: 构建通过**

Run: `cd packages/sh-design && pnpm build`
Expected: PASS，dist 产物与 `dist/index.d.ts` 中不再出现 `loadingText` / `finishedText`

---

### Task 3: 文档同步（waterfall.md + changelog.md）

**Files:**
- Modify: `docs/components/waterfall.md:59-62,301-326,361,376-377`
- Modify: `docs/guide/changelog.md:7`（顶部插入）

- [ ] **Step 1: 改造文档演示状态（waterfall.md script 区 L59-62）**

**关键：footer 必须搭配真实分页数据才能演示**——`items` 为空走的是空态分支，footer 根本不渲染；原静态演示状态 `bottomLoading` / `bottomFinished` 挂空数组只能演示空态 spinner。把 L59-62 替换为独立的小分页源（复用文件内既有 `fetchPage`；独立数组避免与共用 `items` 互相干扰滚动状态）：

```ts
// ===== 底部状态演示：独立分页数据（footer 常驻，随滚动呈现三态）=====
const FEED_TOTAL = 40
const feedItems = ref([])
const feedLoading = ref(false)
const feedFinished = ref(false)
let feedPage = 0

async function onFeedLoadMore() {
  feedLoading.value = true
  const list = await fetchPage(feedPage++)
  feedItems.value.push(...list)
  feedLoading.value = false
  if (feedItems.value.length >= FEED_TOTAL) feedFinished.value = true
}
```

- [ ] **Step 2: 重写「底部与空状态自定义」章节（waterfall.md L301-326）**

左侧空数据演示空态分支；右侧挂常驻 `#footer` + 40 条分页数据，滚到底依次见「已显示统计（空闲）→ 加载中… → 加载完成」三态轮换且 footer 全程不消失：

    ## 底部与空状态自定义

    空状态文案用 `empty-text` 或 `#empty` 插槽；底部状态由 `#footer` 插槽整体接管——**提供即常驻渲染**（不再按 loading/finished 二选一），组件透传作用域参数 `{ loading, finished }`，三态文案完全由业务决定。右侧示例带真实分页数据：向下滚动到底，footer 随内容滚动依次呈现「已显示统计 → 加载中 → 加载完成」：

    <div class="sh-demo" style="display:block">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <div style="height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden;">
          <ShWaterfall :items="emptyItems" :cols="2" />
        </div>
        <div style="height: 480px; border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden;">
          <ShWaterfall
            :items="feedItems"
            :cols="2"
            :gap="12"
            :loading="feedLoading"
            :finished="feedFinished"
            @load-more="onFeedLoadMore"
          >
            <template #footer="{ loading, finished }">
              <span v-if="loading">加载中…</span>
              <span v-else-if="finished">—— 我也是有底线的 ——</span>
              <span v-else>向下滚动加载更多（已显示 {{ feedItems.length }} / {{ FEED_TOTAL }}）</span>
            </template>
          </ShWaterfall>
        </div>
      </div>
      <p style="color: var(--vp-c-text-2); font-size: 13px; margin-top: 8px;">左：空状态（空态分支）｜ 右：常驻 footer，三态随滚动轮换</p>
    </div>

    ```vue
    <ShWaterfall :items="items" :loading="loading" :finished="finished" @load-more="onLoadMore">
      <template #footer="{ loading, finished }">
        <span v-if="loading">加载中…</span>
        <span v-else-if="finished">—— 我也是有底线的 ——</span>
        <span v-else>共 {{ total }} 条，已显示 {{ items.length }} 条，向下滚动加载更多</span>
      </template>
      <template #empty><MyEmpty description="什么都没有" /></template>
    </ShWaterfall>
    ```

- [ ] **Step 3: 更新 API 表（waterfall.md L361、L376-377）**

Props 表 L361 行替换为：

```markdown
| `empty-text` | 空状态文案 | `string` | `'暂无数据'` |
```

Slots 表 L376-377 两行（`loading` / `finished`）替换为一行：

```markdown
| `footer` | 底部状态（提供即常驻渲染，替代原 `loading` / `finished` 插槽） | `{ loading, finished }` |
```

- [ ] **Step 4: changelog.md 顶部新增 0.1.0 条目**

在 `# 更新日志` 说明段之后、`## 0.0.9` 之前插入：

```markdown
## 0.1.0

2026-09-21

### 🔧 修改

- ⚠️ Breaking: `ShWaterfall` 移除 `#loading` / `#finished` 插槽与 `loading-text` / `finished-text` props，改为常驻 `#footer` 作用域插槽（提供即渲染，透传 `{ loading, finished }`）。原设计按状态在两插槽间二选一，业务方使用自带三态的底部提示组件时「有更多但空闲」的中间态无处展示。
- `ShWaterfall` 空态区（`items` 为空）的加载态简化为一律渲染内置 spinner，不再走插槽与文案。

> 升级提示：原 `#loading` / `#finished` 两插槽的内容合并进单个 `#footer`，用作用域参数 `loading` / `finished` 自行分支；仅改文案的场景改在 `#footer` 内写死即可。暂不升级可锁定 `sh-design@0.0.9`。
```

- [ ] **Step 5: 文档站构建 + 人工验证三态**

Run: `cd docs && pnpm build`
Expected: PASS（vitepress 构建无死链报错）

Run: `cd docs && pnpm dev`，打开 Waterfall 页「底部与空状态自定义」右侧 demo，滚动到底逐项确认：
1. 初始 footer 常驻显示「向下滚动加载更多（已显示 20 / 40）」（**中间态常驻正是本次改造的核心效果**）；
2. 触底瞬间变「加载中…」且 footer 不消失、不跳位；
3. 第二页并入后显示「已显示 40 / 40」，随即「—— 我也是有底线的 ——」；
4. 来回滚动 footer 始终在同一位置，只有文案轮换。

---

### Task 4: 版本升级 0.0.9 → 0.1.0 并提交

**Files:**
- Modify: `packages/sh-design/package.json:3`

- [ ] **Step 1: 修改版本号**

`"version": "0.0.9"` → `"version": "0.1.0"`。

- [ ] **Step 2: 同步 version.ts 并复验构建**

Run: `cd packages/sh-design && pnpm build`
Expected: PASS（`build` 脚本会先跑 `sync-version.mjs` 把 `src/version.ts` 同步为 0.1.0）

- [ ] **Step 3: 提交**

```bash
git add packages/sh-design/src/components/waterfall docs/components/waterfall.md docs/guide/changelog.md packages/sh-design/package.json packages/sh-design/src/version.ts
git commit -m "feat(waterfall)!: 常驻 #footer 插槽替代 #loading/#finished"
```

> 发布 npm 由 zlc 按仓库既有流程手动执行（`release.bat` / 根目录《发布npm指南.md》），本计划不自动发布。

---

### Task 5: headcount-front 联动升级（发布 / 本地 link 之后）

**Files:**
- Modify: headcount-front `src/views/order/fullLoadAnalysisGw/module/fillLoadAnalysListCard.vue:51-60`

- [ ] **Step 1: 升级依赖**

Run（headcount-front 根目录）: `yarn add sh-design@0.1.0`
（未发布前可用 `pnpm link` / `npm pack` 本地验证）

- [ ] **Step 2: 两插槽并一为 `#footer`**

现有 `#loading` / `#finished` 两个插槽（内容完全相同的两份 LoadMore）替换为：

```vue
          <!-- 常驻 #footer：三态（加载中/统计/没有更多了）由 LoadMore 一处自分支 -->
          <template #footer>
            <LoadMore :loading="loading" :has-more="hasMore" :length="items.length" :page="pageInfo" :min-length="0" />
          </template>
```

- [ ] **Step 3: 校验**

Run（headcount-front 根目录）: `npx prettier --check` + `npx eslint` + `GetProblems` 三道全绿。

- [ ] **Step 4: 人工验证三态**

`yarn dev` 打开「教室排课利用分析-new」卡片视图，逐项确认：
1. 触底加载时显示「加载中」spinner；
2. 加载完成回空闲（还有更多）时显示「共X条，已显示Y条，向下滚动显示更多数据」（**本态为本次改造新增可见**）；
3. 最后一页加载完显示「没有更多了」；
4. 筛选到空结果显示空态；首载显示空态区 spinner。

---

## 自检记录

- **Spec 覆盖**：移除 `#loading`/`#finished`（Task 2）✓、移除 `loading-text`/`finished-text`（Task 1）✓、常驻 `#footer`（Task 2）✓、文档（Task 3）✓、版本（Task 4）✓、前端联动（Task 5）✓。
- **保留项确认**：`loading`/`finished` props 必须保留——`maybeLoadMore`（触发锁）与 watch（armed 解锁）依赖，删除会破坏触底加载。
- **命名一致**：`#footer` 插槽与作用域参数 `{ loading, finished }` 在 Task 2 / 3 / 5 与 changelog 中写法一致。
- **影响面扫描**：仓库内引用 `#loading`/`#finished`/`loadingText`/`finishedText` 仅 waterfall.vue、waterfall.ts、docs/components/waterfall.md 三处（changelog L69 为历史条目不动）；`play/` 无引用；已知外部使用方为 headcount-front（Task 5 覆盖）。
- **文档示例有效性**：footer demo 必须携带真实分页数据（空数组走空态分支、footer 不渲染），故 Task 3 新增独立 `feedItems` 分页源并给出滚到底的人工验证清单，确保「常驻 footer + 三态轮换」在文档站肉眼可验。
