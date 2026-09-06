import type { ExtractPropTypes, PropType } from 'vue'

export type LazyImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
export type LazyImageStatus = 'idle' | 'loading' | 'loaded' | 'error'
export type LazyImageLazy = boolean | 'observer'
export type LazyImageLoader = () => Promise<string | Blob>

/** Default error text, also used when `error-text` is `true` (feature on). */
export const LAZY_IMAGE_DEFAULT_ERROR_TEXT = '加载失败'

export interface LazyImageLoadPayload {
  /** The URL currently displayed (an object URL when a Blob loader is used). */
  url: string
}

export interface LazyImageErrorPayload {
  /** The underlying error, if any (loader failure or image decode failure). */
  error?: Error
}

export interface LazyImagePreviewPayload {
  /** Index of the image currently previewed within the preview list. */
  index: number
  /** URL of the image currently previewed. */
  url: string
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
  /**
   * Text shown when the image fails to load.
   * - string → shown as-is; `''` omits the text node entirely
   * - `true` → default text (`'加载失败'`)
   * - `false` / `null` → no text node (fallback image only)
   */
  errorText: {
    type: [String, Boolean] as PropType<string | boolean | null>,
    default: LAZY_IMAGE_DEFAULT_ERROR_TEXT
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
  },
  /** Enable the fullscreen preview (hover eye mask + click to open). */
  preview: {
    type: Boolean,
    default: false
  },
  /**
   * URLs to preview in the viewer. Empty (default) previews just the current
   * image; multiple URLs enable prev/next navigation inside the viewer.
   */
  previewSrcList: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /** Index of `preview-src-list` opened initially. */
  previewInitialIndex: {
    type: Number,
    default: 0
  },
  /** Zoom multiplier per zoom step in the viewer (applied multiplicatively). */
  previewZoomRate: {
    type: Number,
    default: 1.2
  },
  /** Minimum zoom scale in the viewer. */
  previewMinScale: {
    type: Number,
    default: 0.2
  },
  /** Maximum zoom scale in the viewer. */
  previewMaxScale: {
    type: Number,
    default: 7
  },
  /** Close the viewer when pressing ESC. */
  previewCloseOnPressEscape: {
    type: Boolean,
    default: true
  },
  /** Close the viewer when clicking the dark backdrop. */
  previewHideOnClickModal: {
    type: Boolean,
    default: true
  }
}

export type LazyImageProps = ExtractPropTypes<typeof lazyImageProps>

export const lazyImageEmits = {
  /** Emitted when the image finishes loading. */
  load: (_payload: LazyImageLoadPayload) => true,
  /** Emitted when loading fails. */
  error: (_payload: LazyImageErrorPayload) => true,
  /** Emitted when the preview switches to another image in the list. */
  switch: (_payload: LazyImagePreviewPayload) => true,
  /** Emitted when the preview viewer closes. */
  close: (_payload: LazyImagePreviewPayload) => true
}

export type LazyImageEmits = typeof lazyImageEmits
