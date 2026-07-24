import type { ExtractPropTypes, PropType } from 'vue'

export type LazyImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
export type LazyImageStatus = 'idle' | 'loading' | 'loaded' | 'error'
export type LazyImageLazy = boolean | 'observer'
export type LazyImageLoader = () => Promise<string | Blob>

export interface LazyImageLoadPayload {
  /** The URL currently displayed (an object URL when a Blob loader is used). */
  url: string
}

export interface LazyImageErrorPayload {
  /** The underlying error, if any (loader failure or image decode failure). */
  error?: Error
}

export const lazyImageProps = {
  /** Image URL (URL mode). Ignored when `loader` is provided. */
  src: {
    type: String,
    default: ''
  },
  /**
   * Custom loader returning a URL string or a Blob (e.g. an authorized API).
   * A Blob is wrapped via `URL.createObjectURL` and revoked automatically on
   * swap / unmount.
   */
  loader: {
    type: Function as PropType<LazyImageLoader>,
    default: undefined
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
  /**
   * Lazy strategy:
   * - `true`       → native `loading="lazy"`
   * - `'observer'` → IntersectionObserver (loads when near viewport)
   * - `false`      → eager
   */
  lazy: {
    type: [Boolean, String] as PropType<LazyImageLazy>,
    default: true
  },
  /** IntersectionObserver `rootMargin` (only when `lazy="observer"`). */
  rootMargin: {
    type: String,
    default: '200px'
  },
  /** Auto-refresh interval in ms (loader mode). `0` disables polling. */
  pollInterval: {
    type: Number,
    default: 0
  },
  /** On reload/poll, keep the previous image instead of flashing the placeholder. */
  keepPreviousOnReload: {
    type: Boolean,
    default: false
  },
  /** Show the built-in skeleton shimmer while loading. */
  skeleton: {
    type: Boolean,
    default: true
  },
  /** Placeholder image URL shown while loading (takes priority over the skeleton). */
  placeholderSrc: {
    type: String,
    default: ''
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
  load: (_payload: LazyImageLoadPayload) => true,
  /** Emitted when loading fails. */
  error: (_payload: LazyImageErrorPayload) => true
}

export type LazyImageEmits = typeof lazyImageEmits
