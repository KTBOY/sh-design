import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ShDesign from 'sh-design'
import UniDemo from './components/UniDemo.vue'
import UniDemoDock from './components/UniDemoDock.vue'
import ShowcaseGallery from './components/showcase/ShowcaseGallery.vue'
import ShowcaseDetail from './components/showcase/ShowcaseDetail.vue'
import ProductsGallery from './components/products/ProductsGallery.vue'
import ProductCard from './components/products/ProductCard.vue'
import HomeProducts from './components/products/HomeProducts.vue'
import AboutShowcase from './components/about/AboutShowcase.vue'
import FoldBarDemo from './components/chart/FoldBarDemo.vue'
import ChartPreview from './components/chart/ChartPreview.vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Register all sh-design components so markdown demos can use them directly.
    app.use(ShDesign)
    // Phone-frame iframe player for shukelab (uni-app) H5 demo pages, used as <UniDemo> in markdown.
    app.component('UniDemo', UniDemo)
    // Right-docked variant with demo tabs, used as <UniDemoDock> in markdown.
    app.component('UniDemoDock', UniDemoDock)
    // /skills/ 与 /css/ 特效画廊页及动态路由详情页，在 markdown 中直接使用。
    app.component('ShowcaseGallery', ShowcaseGallery)
    app.component('ShowcaseDetail', ShowcaseDetail)
    // /products/ 更多工具聚合页：在线产品 + 开源项目卡片墙。
    app.component('ProductsGallery', ProductsGallery)
    // 共享产品卡片单元与主页「更多工具」区块（数据同源 theme/products/meta.ts）。
    app.component('ProductCard', ProductCard)
    app.component('HomeProducts', HomeProducts)
    // /guide/about 个人项目 + 简历展示页（京都风视频背景）。
    app.component('AboutShowcase', AboutShowcase)
    // /chart/ sk-chart 图表库实时演示（挂载真实 FoldBarChart）。
    app.component('FoldBarDemo', FoldBarDemo)
    // /chart/ 各案例复用的通用预览单元（传入不同 config 渲染不同图表）。
    app.component('ChartPreview', ChartPreview)
  }
} satisfies Theme
