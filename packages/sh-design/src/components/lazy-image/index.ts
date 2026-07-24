import { withInstall } from '../../utils/install'
import LazyImage from './src/lazy-image.vue'

export const ShLazyImage = withInstall(LazyImage)
export default ShLazyImage

export * from './src/lazy-image'

export type LazyImageInstance = InstanceType<typeof LazyImage>
