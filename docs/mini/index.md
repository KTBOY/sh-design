---
description: 珊瑚打码微信小程序说明 —— 扫码体验、功能简介，以及内置组件 ImageWaterfall 图片瀑布流的入口。
---

# 珊瑚打码小程序 <Badge type="tip" text="微信小程序" />

「珊瑚打码」是一款工具小程序，NASA壁纸、二次元壁纸、头像制作

## 扫码体验

<div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; margin: 16px 0;">
  <div style="flex: 0 1 300px;">
    <img src="/mini-program-demo.gif" alt="珊瑚打码小程序真机演示" style="width: 100%; border-radius: 12px; border: 1px solid var(--vp-c-divider); box-shadow: 0 12px 32px -12px rgba(15,23,42,.25);" />
    <p style="margin: 8px 0 0; text-align: center; font-size: 13px; color: var(--vp-c-text-2);">真机演示：骨架屏 → 淡入 → 触底加载</p>
  </div>
  <div style="flex: 0 1 240px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 16px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft);">
    <strong style="font-size: 15px;">📱 扫码体验</strong>
    <img src="/shanhu-qrcode.png" alt="微信扫码体验珊瑚打码小程序" style="width: 180px; border-radius: 8px;" />
    <span style="font-size: 12px; color: var(--vp-c-text-2); text-align: center;">微信扫一扫，在「珊瑚打码」小程序中体验组件效果</span>
  </div>
</div>

## 内置组件

珊瑚打码小程序内置了一系列通用组件，点击下方按钮查看组件详情与 API。

<div id="组件" style="scroll-margin-top: 80px;"></div>

### ImageWaterfall 图片瀑布流

微信小程序通用**图片瀑布流**组件 —— 预留高度防抖动（零 CLS）+ 高端骨架屏 + 淡入 + 多列分配 + 触底加载。完整用法、特性与 API 见 [ImageWaterfall 图片瀑布流](/mini/sk-image-waterfall) 页面。
