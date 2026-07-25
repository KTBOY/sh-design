import type { Plugin } from 'vue'
import { makeInstaller } from './utils/install'
import { ShCopyButton } from './components/copy-button'
import { ShLazyImage } from './components/lazy-image'
import { ShSeamlessScroll } from './components/seamless-scroll'
import { version } from './version'

// Bundled styles (design tokens). Consumers importing the built package should
// additionally import 'sh-design/dist/style.css'.
import './styles/index.css'

const components: Plugin[] = [ShCopyButton, ShLazyImage, ShSeamlessScroll]

const { install } = makeInstaller(components)

/**
 * The sh-design library as a Vue plugin.
 *
 * @example
 * ```ts
 * import { createApp } from 'vue'
 * import ShDesign from 'sh-design'
 * import 'sh-design/dist/style.css'
 *
 * createApp(App).use(ShDesign).mount('#app')
 * ```
 */
const ShDesign = {
  version,
  install
}

export default ShDesign
export { install, version }

// On-demand exports
export * from './components'
export * from './hooks'
export { copyText, withInstall, makeInstaller } from './utils'
export type { SFCWithInstall } from './utils'
