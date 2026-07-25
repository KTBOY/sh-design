import type { ExtractPropTypes, PropType } from 'vue'

export type SeamlessScrollDirection = 'up' | 'down' | 'left' | 'right'

export const seamlessScrollProps = {
  /** 滚动方向 */
  direction: {
    type: String as PropType<SeamlessScrollDirection>,
    default: 'up'
  },
  /** 滚动速度（px/秒，基于时间而非帧，与屏幕刷新率无关） */
  speed: {
    type: Number,
    default: 40
  },
  /** 是否滚动（可动态启停） */
  active: {
    type: Boolean,
    default: true
  },
  /** 鼠标悬停时暂停 */
  hoverPause: {
    type: Boolean,
    default: true
  },
  /** 悬停时允许滚轮手动滚动（建议搭配 hover-pause 使用） */
  wheel: {
    type: Boolean,
    default: false
  },
  /** 内容未超出容器时也强制滚动 */
  force: {
    type: Boolean,
    default: false
  },
  /** 单步滚动距离（px），大于 0 时启用步进模式（如整行滚动后停顿） */
  singleStep: {
    type: Number,
    default: 0
  },
  /** 步进模式下每步的停顿时长（毫秒） */
  singleWait: {
    type: Number,
    default: 1000
  },
  /** 开始滚动前的延迟（毫秒） */
  delay: {
    type: Number,
    default: 0
  }
} as const

export const seamlessScrollEmits = {
  /** 完整滚过一轮内容时触发，参数为累计轮数 */
  loop: (_count: number) => true
}

export type SeamlessScrollProps = ExtractPropTypes<typeof seamlessScrollProps>
export type SeamlessScrollEmits = typeof seamlessScrollEmits
