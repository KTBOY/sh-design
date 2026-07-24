import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ShDesign from 'sh-design'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Register all sh-design components so markdown demos can use them directly.
    app.use(ShDesign)
  }
} satisfies Theme
