import type { ExtractPropTypes, PropType } from 'vue'

export type CopyButtonType = 'primary' | 'default' | 'text'
export type CopyButtonSize = 'small' | 'default' | 'large'

export const copyButtonProps = {
  /** The text to be copied to the clipboard. */
  text: {
    type: String,
    default: ''
  },
  /** Visual style of the button. */
  type: {
    type: String as PropType<CopyButtonType>,
    default: 'default'
  },
  /** Size of the button. */
  size: {
    type: String as PropType<CopyButtonSize>,
    default: 'default'
  },
  /** Label shown in the idle state. */
  label: {
    type: String,
    default: '复制'
  },
  /** Label shown briefly after a successful copy. */
  successLabel: {
    type: String,
    default: '已复制'
  },
  /** How long (ms) the success state stays visible. */
  successDuration: {
    type: Number,
    default: 2000
  },
  /** Whether the button is disabled. */
  disabled: {
    type: Boolean,
    default: false
  }
}

export type CopyButtonProps = ExtractPropTypes<typeof copyButtonProps>

export const copyButtonEmits = {
  /** Emitted after the text is successfully copied. */
  success: (payload: { text: string }) => typeof payload.text === 'string',
  /** Emitted when copying fails. */
  error: (payload: { error: Error }) => payload.error instanceof Error
}

export type CopyButtonEmits = typeof copyButtonEmits
