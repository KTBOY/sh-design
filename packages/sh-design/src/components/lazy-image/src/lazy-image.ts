import type { ExtractPropTypes, PropType } from 'vue'

export type LazyImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
export type LazyImageStatus = 'loading' | 'loaded' | 'error'

export const lazyImageProps = {
  /** Image URL. */
  src: {
    type: String,
    default: ''
  },
  /** Alternative text for accessibility. */
  alt: {
    type: String,
    default: ''
  },
  /** How the image fills its box (CSS `object-fit`). */
  fit: {
    type: String as PropType<LazyImageFit>,
    default: 'cover'
  },
  /** Enable native lazy loading. */
  lazy: {
    type: Boolean,
    default: true
  },
  /** Border radius (a number is treated as px). */
  radius: {
    type: [String, Number],
    default: 0
  },
  /** Wrapper width (a number is treated as px). Defaults to filling the parent. */
  width: {
    type: [String, Number],
    default: ''
  },
  /** Wrapper height (a number is treated as px). Defaults to filling the parent. */
  height: {
    type: [String, Number],
    default: ''
  },
  /** Text shown when the image fails to load. */
  errorText: {
    type: String,
    default: '加载失败'
  },
  /** Fallback image shown on error. Defaults to a built-in illustration. */
  errorSrc: {
    type: String,
    default: ''
  },
  /** Whether to show the fallback image on error. */
  showErrorImage: {
    type: Boolean,
    default: true
  }
}

export type LazyImageProps = ExtractPropTypes<typeof lazyImageProps>

export const lazyImageEmits = {
  /** Emitted when the image finishes loading. */
  load: (e: Event) => e instanceof Event,
  /** Emitted when the image fails to load. */
  error: (e: Event) => e instanceof Event
}

export type LazyImageEmits = typeof lazyImageEmits
