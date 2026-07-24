<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { imageProps, imageEmits } from './image'
import type { ImageStatus } from './image'
import { imageErrorDataUrl } from '../../../assets/image-error'

defineOptions({ name: 'ShImage' })

const props = defineProps(imageProps)
const emit = defineEmits(imageEmits)

const status = ref<ImageStatus>('loading')

function toSize(v: string | number): string | undefined {
  if (v === '' || v === undefined || v === null) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

const wrapperStyle = computed(() => ({
  width: toSize(props.width),
  height: toSize(props.height),
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
}))

const errorImage = computed(() => props.errorSrc || imageErrorDataUrl)

function onLoad(e: Event) {
  status.value = 'loaded'
  emit('load', e)
}

function onError(e: Event) {
  status.value = 'error'
  emit('error', e)
}

// Reset to the loading state when the source changes (e.g. list virtualization).
watch(
  () => props.src,
  () => {
    status.value = 'loading'
  }
)
</script>

<template>
  <div class="sh-image" :class="`is-${status}`" :style="wrapperStyle">
    <!-- Skeleton / placeholder while loading -->
    <div v-if="status !== 'loaded'" class="sh-image__placeholder">
      <slot name="placeholder">
        <div class="sh-image__skeleton" />
      </slot>
    </div>

    <!-- Error fallback: image + text, fully overridable via the `error` slot -->
    <div v-if="status === 'error'" class="sh-image__error">
      <slot name="error" :src="errorImage" :text="errorText">
        <img
          v-if="showErrorImage"
          class="sh-image__error-img"
          :src="errorImage"
          :alt="errorText"
          draggable="false"
        />
        <span class="sh-image__error-text">{{ errorText }}</span>
      </slot>
    </div>

    <!-- Real image: native lazy loading + async decode, fades in once loaded -->
    <img
      v-if="src && status !== 'error'"
      class="sh-image__inner"
      :src="src"
      :alt="alt"
      :style="{ objectFit: fit }"
      :loading="lazy ? 'lazy' : 'eager'"
      decoding="async"
      draggable="false"
      @load="onLoad"
      @error="onError"
    />

    <!-- Overlay content (e.g. captions, badges) -->
    <slot />
  </div>
</template>

<style scoped>
.sh-image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--sh-color-bg-hover);
}

.sh-image__inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.sh-image.is-loaded .sh-image__inner {
  opacity: 1;
}

.sh-image__placeholder {
  position: absolute;
  inset: 0;
}

.sh-image__skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f2f3f5 25%, #e6e8eb 37%, #f2f3f5 63%);
  background-size: 400% 100%;
  animation: sh-image-shimmer 1.4s ease infinite;
}

.sh-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: var(--sh-color-bg-hover);
}

.sh-image__error-img {
  max-width: 60%;
  max-height: 60%;
  object-fit: contain;
}

.sh-image__error-text {
  font-size: var(--sh-font-size-sm);
  color: var(--sh-color-text-secondary);
}

@keyframes sh-image-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
