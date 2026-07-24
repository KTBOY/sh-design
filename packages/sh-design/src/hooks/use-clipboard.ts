import { ref } from 'vue'
import type { Ref } from 'vue'
import { copyText } from '../utils/clipboard'

export interface UseClipboardOptions {
  /** How long (ms) `copied` stays `true` after a successful copy. */
  copiedDuring?: number
}

export interface UseClipboardReturn {
  /** Whether a copy has just succeeded (auto-resets after `copiedDuring`). */
  copied: Ref<boolean>
  /** The last error thrown while copying, if any. */
  error: Ref<Error | null>
  /** Copy the given text; resolves to `true` on success. */
  copy: (text: string) => Promise<boolean>
}

/**
 * Reactive clipboard helper. Wraps {@link copyText} and exposes a `copied`
 * flag that automatically resets, which is handy for "Copied!" feedback.
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { copiedDuring = 2000 } = options

  const copied = ref(false)
  const error = ref<Error | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  const copy = async (text: string): Promise<boolean> => {
    error.value = null
    try {
      await copyText(text)
      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, copiedDuring)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      copied.value = false
      return false
    }
  }

  return { copied, error, copy }
}
