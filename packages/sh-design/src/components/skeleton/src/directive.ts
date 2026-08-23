import type { Directive } from 'vue'

/** v-skeleton 的对象形式参数 */
export interface SkeletonDirectiveValue {
  /** 关闭微光动画 */
  animated?: boolean
  /** 深度模式：逐后代骨架化，每个子元素按自身形状（圆角/尺寸）变灰 */
  deep?: boolean
}

function apply(el: HTMLElement, value: boolean | SkeletonDirectiveValue | undefined, deep: boolean) {
  const on = !!value
  // 两种模式互斥：整块遮罩（mask）/ 逐后代骨架化（deep）
  const mode = deep ? 'sh-skeleton-deep' : 'sh-skeleton-mask'
  el.classList.remove('sh-skeleton-mask', 'sh-skeleton-deep')
  el.classList.remove('sh-skeleton-mask--static', 'sh-skeleton-deep--static')

  if (on) {
    el.classList.add(mode)
    if (typeof value === 'object' && value.animated === false) {
      el.classList.add(`${mode}--static`)
    }
    // 整块遮罩的 ::after 需要 containing block；仅当元素未定位时补 relative，关闭时还原
    if (mode === 'sh-skeleton-mask' && !el.style.position && getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
      el.dataset.shSkeletonPos = '1'
    }
  } else if (el.dataset.shSkeletonPos) {
    el.style.position = ''
    delete el.dataset.shSkeletonPos
  }
}

/**
 * 骨架屏指令：加载期间"骨架化"现有元素。
 *
 * 默认（整块遮罩）：子内容隐藏、原位覆盖一层微光遮罩，遮罩尺寸与圆角自动跟随元素自身
 * （圆形元素 → 圆形遮罩），布局零偏移。
 *
 * 深度模式 `.deep`（逐后代骨架化）：不盖整块遮罩，而是让每个后代元素按**自身形状**
 * （各自的圆角/行高/间距）变成微光块，文字透明、边框阴影清除——适合结构较复杂的卡片，
 * 得到"头像圆 + 文字条"式的真实骨架结构，同样零测量、零布局偏移。
 *
 * @example
 * ```vue
 * <div v-skeleton="loading">异步内容……</div>
 * <div v-skeleton.deep="loading">头像 + 文字的复杂卡片</div>
 * <div v-skeleton="{ animated: false, deep: true }">关闭动画 + 深度模式</div>
 * ```
 */
export const vSkeleton: Directive<HTMLElement, boolean | SkeletonDirectiveValue | undefined> = {
  mounted(el, { value, modifiers }) {
    apply(el, value, !!modifiers.deep)
  },
  updated(el, { value, oldValue, modifiers }) {
    if (value !== oldValue) apply(el, value, !!modifiers.deep)
  },
  unmounted(el) {
    apply(el, false, false)
  }
}

export type SkeletonDirective = typeof vSkeleton
