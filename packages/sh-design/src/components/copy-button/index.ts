import { withInstall } from '../../utils/install'
import CopyButton from './src/copy-button.vue'

export const ShCopyButton = withInstall(CopyButton)
export default ShCopyButton

export * from './src/copy-button'

export type CopyButtonInstance = InstanceType<typeof CopyButton>
