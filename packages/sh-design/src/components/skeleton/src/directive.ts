import type { Directive } from 'vue'
import { createDeepSkeleton } from './deep-skeleton'

/** v-skeleton 的对象形式参数 */
export interface SkeletonDirectiveValue {
  /** 设为 false 关闭微光动画 */
  animated?: boolean
  /** 深度模式：测量真实文本行、图片与有尺寸的空元素，不改变内容布局 */
  deep?: boolean
}

type SkeletonMode = 'sh-skeleton-mask' | 'sh-skeleton-deep'

interface SkeletonState {
  mode: SkeletonMode
  position: string
  positionPriority: string
  positioned: boolean
  deep?: ReturnType<typeof createDeepSkeleton>
}

const states = new WeakMap<HTMLElement, SkeletonState>()

/** 关闭或切换模式时释放测量资源，并还原指令补充的定位。 */
function clear(el: HTMLElement) {
  const state = states.get(el)
  if (!state) return

  state.deep?.stop()
  el.classList.remove(state.mode, `${state.mode}--static`)
  if (state.positioned) {
    if (state.position) {
      el.style.setProperty('position', state.position, state.positionPriority)
    } else {
      el.style.removeProperty('position')
    }
  }
  states.delete(el)
}

/** 每次更新读取选项值，而非比较对象引用，兼容同一对象内的字段更新。 */
function apply(
  el: HTMLElement,
  value: boolean | SkeletonDirectiveValue | undefined,
  deep: boolean
) {
  if (!value) {
    clear(el)
    return
  }

  const options = typeof value === 'object' ? value : undefined
  const mode: SkeletonMode = deep || options?.deep ? 'sh-skeleton-deep' : 'sh-skeleton-mask'
  let state = states.get(el)
  if (state && state.mode !== mode) {
    clear(el)
    state = undefined
  }

  if (!state) {
    state = {
      mode,
      position: el.style.getPropertyValue('position'),
      positionPriority: el.style.getPropertyPriority('position'),
      positioned: false
    }
    states.set(el, state)
  }
  if (getComputedStyle(el).position === 'static' && (deep || options?.deep || !el.style.position)) {
    state.positioned = true
    el.style.setProperty('position', 'relative', mode === 'sh-skeleton-deep' ? 'important' : '')
  }
  if (!el.classList.contains(mode)) el.classList.add(mode)
  if (mode === 'sh-skeleton-deep' && !state.deep) state.deep = createDeepSkeleton(el)

  const staticClass = `${mode}--static`
  const isStatic = options?.animated === false
  if (el.classList.contains(staticClass) !== isStatic) el.classList.toggle(staticClass, isStatic)
  state.deep?.schedule()
}

/**
 * 骨架屏指令：加载期间骨架化现有元素，不复制、搬移或包裹真实节点。
 *
 * 默认模式保留整块微光遮罩；`.deep` 或对象参数 `deep: true` 则在加载期间
 * 按真实文本行与元素尺寸测量，在独立绘制层显示骨架。可在真实节点上添加
 * data-sh-skeleton-group / data-sh-skeleton-width / data-sh-skeleton-height 提示。
 *
 * @example
 * ```vue
 * <div v-skeleton="loading">异步内容……</div>
 * <div v-skeleton.deep="loading">头像 + 文字的复杂卡片</div>
 * <div v-skeleton="loading && { animated: false, deep: true }">关闭动画 + 深度模式</div>
 * ```
 */
export const vSkeleton: Directive<HTMLElement, boolean | SkeletonDirectiveValue | undefined> = {
  // Vue 在渲染时追踪这两个选项字段，同引用的响应式对象也能触发 updated。
  deep: true,
  mounted(el, { value, modifiers }) {
    apply(el, value, !!modifiers.deep)
  },
  updated(el, { value, modifiers }) {
    apply(el, value, !!modifiers.deep)
  },
  beforeUnmount(el) {
    clear(el)
  }
}

export type SkeletonDirective = typeof vSkeleton
