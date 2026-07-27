import { withInstall } from '../../utils/install'
import Waterfall from './src/waterfall.vue'

export const ShWaterfall = withInstall(Waterfall)
export default ShWaterfall

export * from './src/waterfall'

export type WaterfallInstance = InstanceType<typeof Waterfall>
