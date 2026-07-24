import { withInstall } from '../../utils/install'
import Image from './src/image.vue'

export const ShImage = withInstall(Image)
export default ShImage

export * from './src/image'

export type ImageInstance = InstanceType<typeof Image>
