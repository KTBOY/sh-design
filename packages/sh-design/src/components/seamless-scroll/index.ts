import { withInstall } from '../../utils/install'
import SeamlessScroll from './src/seamless-scroll.vue'

export const ShSeamlessScroll = withInstall(SeamlessScroll)
export default ShSeamlessScroll

export * from './src/seamless-scroll'

export type SeamlessScrollInstance = InstanceType<typeof SeamlessScroll>
