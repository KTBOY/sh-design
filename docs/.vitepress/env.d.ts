/// <reference types="vitepress/client" />

// demos.ts 通过 `?raw` 同时导入演示组件与其源码字符串（详情页展示源码用）
declare module '*.vue?raw' {
  const source: string
  export default source
}
