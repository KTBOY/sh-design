import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ShDesign from 'sh-design'
import UniDemo from './components/UniDemo.vue'
import UniDemoDock from './components/UniDemoDock.vue'
import ShowcaseGallery from './components/showcase/ShowcaseGallery.vue'
import ShowcaseDetail from './components/showcase/ShowcaseDetail.vue'
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
  }
} satisfies Theme
