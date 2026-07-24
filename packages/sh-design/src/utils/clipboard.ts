/**
 * Copy a string to the system clipboard.
 *
 * Prefers the async Clipboard API in secure contexts, and falls back to a
 * hidden `<textarea>` + `execCommand('copy')` for http / older browsers.
 *
 * @param text - The text to copy.
 * @throws When copying fails in all strategies.
 */
export async function copyText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const ok = document.execCommand('copy')
    if (!ok) {
      throw new Error('Failed to copy text using execCommand.')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}
