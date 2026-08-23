import { withInstall } from '../../utils/install'
import Skeleton from './src/skeleton.vue'

export const ShSkeleton = withInstall(Skeleton)
export default ShSkeleton
export * from './src/skeleton'
export * from './src/directive'
export type SkeletonInstance = InstanceType<typeof Skeleton>
