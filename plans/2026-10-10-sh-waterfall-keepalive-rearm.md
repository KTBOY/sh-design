# ShWaterfall keep-alive / 隐藏容器下触底加载卡死 修复计划

**Goal:** 修复 `ShWaterfall` 在 keep-alive 失活（或祖先 `display:none`）后返回、滚动触底不再触发 `load-more` 的缺陷——根因是内部 `armed` 触发锁在容器不可见时被"幽灵 load-more"空耗且再也无法复位。

**背景（为什么会出现）:** 业务方 headcount-front「满载分析」卡片流实测：进入卡片详情（keep-alive 失活）→ 返回列表页 → 明明还有数据（共 145 条、已显示 40 条），向下滚动触底却不再加载下一页。

定位到组件内部 `armed` 锁的复位链路（`waterfall.vue`）：

- `armed` 初值 `true`，**只在 `maybeLoadMore()` 真正派发 `load-more` 时被消耗**（L279 `armed = false`）。
- 复位（`armed = true`）只有两个来源：① `items` 变化（L357-368）；② `[loading, finished]` 由真变假（L387-395）。
- **二者都隐含一个假设：父组件收到 `load-more` 后一定会「追加数据」或「翻转 loading」。** 一旦父组件忽略了这次 `load-more`，`armed` 就永久卡在 `false`。

失活瞬间恰好制造了"父组件必然忽略"的场景：keep-alive 把列表容器从 DOM 摘除 → 容器 `clientWidth` 归 0 → `ResizeObserver` 回调（L424-437）触发 `measure()`（`viewWidth=0`）→ `rebuild()`（`totalHeight=0`）→ `nextTick(maybeLoadMore())`。此时非强制分支的几何判定 `remain = totalHeight - (scrollTop + viewHeight)` 因 `totalHeight=0` 恒为负、必然 `< threshold`，于是**消耗 `armed=false` 并派发一次无意义的 `load-more`**。而业务侧分页状态机（如 `useCardWaterfall`）通常带有"失活期间禁止加载"的守卫（防止失活态无限翻页），会把这次 `load-more` 直接吞掉——`loading` 不翻转、`items` 不追加，`armed` 再也等不到复位。返回列表页后，滚动路径 `onScroll`（L285-292）只更新视口状态、不做触底复查，哨兵 IntersectionObserver 又因"一直在视口内、没有新的交叉边"而不再回调，于是触底彻底失效。

**Architecture（修复策略：三层防御，核心是第 1 层）:**

1. **不可见即不消耗（根因阻断）**：`maybeLoadMore()` 入口增加"容器宽度归 0 直接 return、不碰 `armed`"的守卫。失活/隐藏时几何判定本就失真，此时不派发、不消耗，`armed` 保持原状；恢复可见后由 `ResizeObserver`（宽度 0→真实）自然重排复查。
2. **恢复可见即复位（keep-alive 快速自愈）**：新增 `onActivated` 钩子——回到缓存页时立即 `measure()` + `rebuild()` + `armed = true` + 复查触底，不依赖 `ResizeObserver` 的 120ms 防抖，返回瞬间即可续载。对非 keep-alive 使用无副作用（钩子不触发）。
3. **滚动即触发通道（通用兜底）**：`onScroll` 的 rAF 回调里补一次非强制 `maybeLoadMore()`，让"滚到底"永远是一条活的触发路径，覆盖"哨兵停在视口内、IO 不再产生新交叉边"这类漏触发。`armed` + `remain>=threshold` 双重去重，不会级联。

> 三层叠加后：即便某个父组件的 `load-more` 处理被吞、或 IO 交叉边被错过，组件也能在"重新可见 / 继续滚动"时自愈，不再出现永久卡死。

**Tech Stack:** Vue 3 `<script setup>`、TypeScript、Vite 库构建、VitePress 文档站、pnpm workspace、playground（`play/` 通过别名直连 `packages/sh-design/src` 源码，改源码即时生效）。

---

## 文件结构与责任

| 文件 | 责任 | 动作 |
| --- | --- | --- |
| `packages/sh-design/src/components/waterfall/src/waterfall.vue` | 触底锁与触发链路 | 改 `maybeLoadMore` 守卫、加 `onActivated`、`onScroll` 补复查 |
| `docs/components/waterfall.md` | 组件文档 | 「分页加载 / 触底」章节补 keep-alive 与隐藏容器行为说明 |
| `docs/guide/changelog.md` | 更新日志 | 顶部新增 `0.1.1` 修复条目 |
| `packages/sh-design/package.json` + `src/version.ts` | 版本号 | `0.1.0` → `0.1.1`（patch，随发布流程） |
| `play/src/App.vue`（或新增 `play/src/KeepAliveRepro.vue`） | 复现 / 验证 | 搭 keep-alive + 失活守卫的最小复现，供修复前后截图对比 |
| headcount-front `useCardWaterfall.ts` + 3 个卡片页 | 使用方 | 升级 `sh-design@0.1.1` 后，回退临时 `finished` 脉冲 workaround（可选，双保险亦可留） |

---

### Task 1: waterfall.vue —— 三层防御

**Files:**
- Modify: `packages/sh-design/src/components/waterfall/src/waterfall.vue`

- [ ] **Step 1: `maybeLoadMore` 增加"不可见即跳过"守卫（L273-281）**

改为：

```ts
function maybeLoadMore(force = false) {
  // 容器不可见（keep-alive 失活 / 祖先 display:none）时宽度归 0，几何判定失真：
  // 若照常消耗 armed 派发 load-more，父组件多半忽略（如自身带失活守卫），
  // 而 loading/items 均不变 → armed 再也无法复位，恢复可见后触底永久失效。
  // 故不可见时直接跳过、保持 armed 原状，待重新可见时再评估。
  if (viewWidth.value <= 0) return
  if (!armed || props.loading || props.finished) return
  if (!force) {
    const remain = totalHeight.value - (scrollTop.value + viewHeight.value)
    if (remain >= props.threshold) return
  }
  armed = false
  emit('load-more')
}
```

- [ ] **Step 2: `onScroll` 的 rAF 回调补一次非强制触底复查（L285-292）**

改为：

```ts
function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    updateScrollState()
    emit('scroll', { scrollTop: scrollTop.value })
    // 滚动即"用户正在接近底部"的信号，补一次非强制检查：
    // 覆盖哨兵一直停在视口内、IO 不再产生新交叉边的场景，
    // 让滚到底始终是活的触发通道（armed + remain 双重去重，不级联）
    maybeLoadMore()
  })
}
```

- [ ] **Step 3: 新增 `onActivated` 复位钩子（import 补 `onActivated`，钩子放在 `onMounted` 附近）**

`import { computed, nextTick, onBeforeUnmount, onMounted, onActivated, ref, watch } from 'vue'`

```ts
// keep-alive 恢复可见：立即重测 + 解锁 + 复查触底，
// 不依赖 ResizeObserver 的 120ms 防抖，回到页面瞬间即可续载。
// 非 keep-alive 场景该钩子不触发，无副作用。
onActivated(() => {
  measure()
  rebuild()
  armed = true
  nextTick(() => {
    updateScrollState()
    maybeLoadMore()
  })
})
```

- [ ] **Step 4: 类型检查 + 构建**

Run: `cd packages/sh-design && pnpm typecheck && pnpm build`
Expected: PASS（无新增类型错误，dist 产物更新）

---

### Task 2: 复现与验证（playground）

**Files:**
- Modify/Create: `play/src/App.vue`（新增 keep-alive 复现区块）或 `play/src/KeepAliveRepro.vue`

- [ ] **Step 1: 搭最小复现**

结构：`<keep-alive>` 缓存一个"列表"子组件（内含 `ShWaterfall` + 一个**带失活守卫**的分页函数：`onDeactivated` 置 `active=false`，`load-more` 里 `if(!active) return`——精确复刻 useCardWaterfall 的吞逻辑），配"详情"子组件；顶部按钮在 列表 / 详情 间 `v-if` 切换模拟路由跳转。

- [ ] **Step 2: 修复前基线（先临时回退三层防御，确认能复现）**

`pnpm dev` → 列表滚到底加载到第 2 页 → 点「进详情」→ 点「返回列表」→ 继续滚到底。
预期（未修复）：底部停在「已显示 40 条」不再增长（卡死）→ 截图 `before-stuck.png`。

- [ ] **Step 3: 修复后验证**

恢复修复代码 → 同样操作 → 返回后滚到底能继续加载第 3、4 页 → 截图 `after-load.png`；录一段返回后滚动续屏的 GIF `keepalive-rearm.gif`。

---

### Task 3: 文档与 changelog 同步

**Files:**
- Modify: `docs/components/waterfall.md`（分页 / 触底章节）
- Modify: `docs/guide/changelog.md`（顶部）

- [ ] **Step 1: waterfall.md 增加行为说明**

在「分页加载 / 触底」相关段落后补一句：组件对 keep-alive 失活、祖先 `display:none` 等"容器宽度归 0"场景已做防护——不可见期间不消耗触底锁，恢复可见（`onActivated` / 尺寸回弹）或继续滚动时自动复查，无需业务方额外处理。

- [ ] **Step 2: changelog.md 顶部新增 0.1.1**

在 `## 0.1.0` 之前插入：

```markdown
## 0.1.1

2026-10-10

### 🐛 修复

- `ShWaterfall` 修复 keep-alive 失活（或祖先 `display:none`）返回后，滚动触底不再触发 `load-more` 的卡死问题。根因：容器宽度归 0 时内部重排会派发一次"幽灵 load-more"并消耗触底锁 `armed`，若父组件此时忽略该事件（如带失活守卫防无限翻页），`armed` 因 loading/items 均不变而永久无法复位。现三层防御：① 容器不可见时不消耗 `armed`；② `onActivated` 恢复可见即复位并复查；③ 滚动路径补一次触底检查，使"滚到底"始终是活的触发通道。
```

- [ ] **Step 3: 版本号 bump（随发布）**

`packages/sh-design/package.json` `0.1.0` → `0.1.1`；`pnpm build` 会经 `sync-version.mjs` 同步 `src/version.ts`。发布 npm 由 zlc 按既有流程手动执行，本计划不自动发布。

---

### Task 4: headcount-front 联动（升级后，可选）

- [ ] **Step 1:** 升级 `sh-design@0.1.1`（发布前可 `pnpm link` 本地验证）。
- [ ] **Step 2:** 回退 `useCardWaterfall.ts` 里为规避本 bug 临时加的 `finishedPulse` 激活脉冲（组件已原生自愈）；如求稳可保留作双保险。
- [ ] **Step 3:** 回归「满载分析 / 教室利用 / 排课利用-new」三卡片：进详情→返回→触底续载正常。

---

## 自检记录

- **根因覆盖**：幽灵 load-more 消耗 armed（Task 1 Step 1 阻断）✓；返回后无复位来源（Step 3 onActivated）✓；IO 交叉边漏触发（Step 2 onScroll 兜底）✓。
- **不破坏既有行为**：`loading`/`finished` props 与 armed 复位 watch 全部保留；首屏"内容不足一屏自动续载"依赖 `viewWidth>0` 的正常几何路径，守卫只拦 `viewWidth<=0`（不可见）不影响；`onScroll` 追加的非强制检查有 `remain>=threshold` 早退，顶部滚动不误触发。
- **onActivated 安全性**：非 keep-alive 场景该钩子永不触发，零副作用。
- **影响面**：仅 `waterfall.vue` 逻辑改动，无 props/emits/slots 契约变化 → 非破坏性，patch 版本。
- **文档有效性**：复现需"失活守卫吞 load-more"才能稳定触发，故 Task 2 明确复刻该父组件守卫；截图 before/after 均出自 playground，可复现。
