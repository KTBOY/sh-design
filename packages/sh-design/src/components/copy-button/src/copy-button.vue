<script setup lang="ts">
import { computed } from 'vue'
import { copyButtonProps, copyButtonEmits } from './copy-button'
import { useClipboard } from '../../../hooks/use-clipboard'

defineOptions({ name: 'ShCopyButton' })

const props = defineProps(copyButtonProps)
const emit = defineEmits(copyButtonEmits)

const { copied, error, copy } = useClipboard({ copiedDuring: props.successDuration })

const classes = computed(() => [
  'sh-copy-button',
  `sh-copy-button--${props.type}`,
  `sh-copy-button--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-copied': copied.value
  }
])

async function handleClick(): Promise<void> {
  if (props.disabled) return
  const ok = await copy(props.text)
  if (ok) {
    emit('success', { text: props.text })
  } else {
    emit('error', { error: error.value ?? new Error('Failed to copy text') })
  }
}
</script>

<template>
  <button :class="classes" type="button" :disabled="disabled" @click="handleClick">
    <span class="sh-copy-button__icon" aria-hidden="true">
      <svg v-if="copied" viewBox="0 0 24 24" width="1em" height="1em">
        <path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="1em" height="1em">
        <path
          fill="currentColor"
          d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m0 16H8V7h11z"
        />
      </svg>
    </span>
    <span class="sh-copy-button__label">
      <slot :copied="copied">{{ copied ? successLabel : label }}</slot>
    </span>
  </button>
</template>

<style scoped>
.sh-copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  border: 1px solid var(--sh-color-border);
  border-radius: var(--sh-radius);
  background: var(--sh-color-bg);
  color: var(--sh-color-text);
  font-size: var(--sh-font-size-base);
  line-height: 1;
  padding: 8px 14px;
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--sh-transition),
    border-color var(--sh-transition),
    color var(--sh-transition),
    opacity var(--sh-transition);
}

.sh-copy-button:hover {
  background: var(--sh-color-bg-hover);
}

.sh-copy-button:active {
  background: var(--sh-color-bg-active);
}

.sh-copy-button__icon {
  display: inline-flex;
  align-items: center;
  font-size: 1.1em;
}

/* Types */
.sh-copy-button--primary {
  background: var(--sh-color-primary);
  border-color: var(--sh-color-primary);
  color: var(--sh-color-white);
}

.sh-copy-button--primary:hover {
  background: var(--sh-color-primary-hover);
  border-color: var(--sh-color-primary-hover);
}

.sh-copy-button--primary:active {
  background: var(--sh-color-primary-active);
  border-color: var(--sh-color-primary-active);
}

.sh-copy-button--text {
  background: transparent;
  border-color: transparent;
  color: var(--sh-color-primary);
  padding-left: 6px;
  padding-right: 6px;
}

.sh-copy-button--text:hover {
  background: var(--sh-color-bg-hover);
}

/* Sizes */
.sh-copy-button--small {
  font-size: var(--sh-font-size-sm);
  padding: 5px 10px;
  border-radius: var(--sh-radius-sm);
}

.sh-copy-button--large {
  font-size: var(--sh-font-size-lg);
  padding: 11px 20px;
}

/* States */
.sh-copy-button.is-copied {
  color: var(--sh-color-success);
  border-color: var(--sh-color-success);
}

.sh-copy-button--primary.is-copied {
  background: var(--sh-color-success);
  border-color: var(--sh-color-success);
  color: var(--sh-color-white);
}

.sh-copy-button.is-disabled,
.sh-copy-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
