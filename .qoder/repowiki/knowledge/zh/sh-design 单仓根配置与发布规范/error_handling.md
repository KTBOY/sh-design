## 1. 采用的方式

仓库是一个 Vue 3 组件库 monorepo，业务代码体量较小（仅 `packages/sh-design/src` 下几个 UI 组件），没有引入任何运行时错误框架。错误处理采用最朴素的模式：

- **JS 原生异常**：通过 `try/catch` 捕获异步 loader 失败，将异常对象标准化后通过 Vue 的 `emit('error', ...)` 上抛给调用方。
- **Vue 原生事件**：`<img>` 的 `@error` 与自定义 loader 的异常统一归一为组件内部 `status = 'error'`，并通过 slot / `error` 事件暴露。
- **构建脚本**：根 `scripts/check-components.mjs` 使用 `console.error` 输出校验失败信息，没有抛出异常或返回错误码。

未发现 sentinel error、自定义 Error 子类、全局错误处理器（如 `window.onerror`、`unhandledrejection`）、错误码枚举、中间件等架构化手段。

## 2. 关键文件

| 文件 | 角色 |
|---|---|
| `packages/sh-design/src/components/lazy-image/src/lazy-image.vue` | 唯一存在 `try/catch` 的业务组件；在 `runLoader` 中捕获 loader 异常，标准化为 `Error` 后 emit |
| `packages/sh-design/src/components/lazy-image/src/image-viewer.vue` | 提供 `onImgError` 占位函数，作为图片加载失败的视觉兜底 |
| `scripts/check-components.mjs` | 构建期校验脚本，用 `console.error` 报告组件元数据不一致 |

## 3. 架构与约定（观察到的事实）

- **错误传播路径**：组件内部 → 通过 `emit('error', payload)` 通知父组件。lazy-image 组件对 payload 有两种形态：
  - loader 异常：`{ error: e instanceof Error ? e : new Error(String(e)) }` —— 强制把非 Error 值包装成 `Error`。
  - `<img>` 原生 error：`{}` —— 空 payload，仅靠状态切换驱动 UI。
- **UI 层**：组件维护 `LazyImageStatus`（idle/loading/loaded/error），error 分支渲染默认 fallback 图与文本，同时暴露 `error` slot 让调用方完全覆盖。
- **资源清理**：`onBeforeUnmount` 中清理 `pollTimer`、`IntersectionObserver`、`URL.revokeObjectURL`，避免内存泄漏——这是该仓库里唯一一处显式“资源错误”处理场景。
- **构建脚本的错误**：`check-components.mjs` 累计 `problems` 数组，最后以 `console.error` 打印并退出，不中断 npm 发布流程（CI 层面才由 GitHub Actions 判定）。

## 4. 约定与约束

- **没有统一的错误类型定义**：仓库内不存在 `errors/`、`ErrorCode`、`AppError` 等集中定义；所有异常均为 JS 原生 `Error`。
- **组件 API 约定**：对外暴露错误的方式是 Vue 事件 `error` 而非返回值或 Promise reject（lazy-image 的 `loader` prop 是 `() => string | Blob`，本身可返回 Promise，但组件内部 catch 后转为事件）。这一约定仅在 lazy-image 中存在证据。
- **错误文本归一化**：`normalizedErrorText` 计算属性把 `errorText` 的 `true/false/null/string` 四种输入归一化为最终文案，体现“错误展示文案必须可配置且可省略”的组件设计约定。
- **未观察到**：`throw` 语句（除标准库外）、`catch (err)` 之外的命名、`finally` 块（除 lazy-image 的 `requesting` 标志重置）、`Promise.reject`、全局错误边界、日志级别、错误上报 SDK 等。