import type { ExtractPropTypes, PropType } from 'vue'

/** 骨架形状变体（单形状模式） */
export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'image'

export const skeletonProps = {
  /** 是否处于加载中：true 渲染骨架，false 渲染默认插槽的真实内容 */
  loading: {
    type: Boolean,
    default: true
  },
  /** 段落行数（组合模式） */
  rows: {
    type: Number,
    default: 3
  },
  /** 行宽：单值应用到所有行；数组按行下发；缺省时末行 60% 其余 100% */
  rowWidth: {
    type: [String, Array] as PropType<string | string[]>,
    default: ''
  },
  /** 是否显示标题行 */
  title: {
    type: Boolean,
    default: true
  },
  /** 标题行宽度 */
  titleWidth: {
    type: String,
    default: '38%'
  },
  /** 是否显示头像（圆形） */
  avatar: {
    type: Boolean,
    default: false
  },
  /** 头像尺寸（宽高一致） */
  avatarSize: {
    type: String,
    default: '40px'
  },
  /** 行是否为胶囊圆角 */
  round: {
    type: Boolean,
    default: false
  },
  /** 单形状模式：指定后忽略 rows/title/avatar 组合，只渲染一个形状块 */
  variant: {
    type: String as PropType<SkeletonVariant>,
    default: ''
  },
  /** 单形状模式的高度（circle 时同时作为宽度） */
  height: {
    type: String,
    default: ''
  },
  /** 骨架块重复次数，用于列表占位 */
  count: {
    type: Number,
    default: 1
  },
  /** loading 由 false 变 true 后延迟多少毫秒再显示骨架（防请求短闪） */
  throttle: {
    type: Number,
    default: 0
  },
  /** 是否开启微光扫过动画 */
  animated: {
    type: Boolean,
    default: true
  },
  /** 渲染的根元素标签 */
  tag: {
    type: String,
    default: 'div'
  }
} as const

export type SkeletonProps = ExtractPropTypes<typeof skeletonProps>
