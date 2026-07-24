<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { lazyImageProps, lazyImageEmits } from './lazy-image'
import type { LazyImageStatus } from './lazy-image'
import { imageErrorDataUrl } from '../../../assets/image-error'

defineOptions({ name: 'ShLazyImage' })

const props = defineProps(lazyImageProps)
const emit = defineEmits(lazyImageEmits)

const root = ref<HTMLElement | null>(null)
const status = ref<LazyImageStatus>(props.lazy === 'observer' ? 'idle' : 'loading')
const displaySrc = ref('')

let currentObjectUrl = ''
let requesting = false
let started = false
let pollTimer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | null = null

const errorImage = computed(() => props.errorSrc || imageErrorDataUrl)
const nativeLoading = computed<'lazy' | 'eager'>(() => (props.lazy === true ? 'lazy' : 'eager'))

function toSize(v: string | number): string | undefined {
  if (v === '' || v === undefined || v === null) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

const wrapperStyle = computed(() => ({
  width: toSize(props.width),
  height: toSize(props.height),
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
}))

// Swap the displayed URL and revoke the previous object URL (if any).
function setUrl(url: string, isObject: boolean) {
  const prev = currentObjectUrl
  displaySrc.value = url
  currentObjectUrl = isObject ? url : ''
  if (prev && prev !== url) URL.revokeObjectURL(prev)
}

async function runLoader(isReload = false) {
  if (!props.loader || requesting) return
  requesting = true
  if (!(isReload && props.keepPreviousOnReload) && status.value !== 'loaded') {
    status.value = 'loading'
  }
  try {
    const res = await props.loader()
    const isBlob = typeof res !== 'string'
    setUrl(isBlob ? URL.createObjectURL(res as Blob) : (res as string), isBlob)
    // `loaded` is finalized by the <img> @load handler once it decodes.
  } catch (e) {
    if (!(props.keepPreviousOnReload && status.value === 'loaded')) {
      status.value = 'error'
    }
    emit('error', { error: e instanceof Error ? e : new Error(String(e)) })
  } finally {
    requesting = false
  }
}

// Begin loading (immediately, or after the observer fires).
function start() {
  if (started) return
  started = true
  if (props.loader) {
    runLoader()
    if (props.pollInterval > 0) {
      pollTimer = setInterval(() => runLoader(true), props.pollInterval)
    }
  } else {
    displaySrc.value = props.src
    if (status.value === 'idle') status.value = 'loading'
  }
}

function onImgLoad() {
  status.value = 'loaded'
  emit('load', { url: displaySrc.value })
}

function onImgError() {
  if (!(props.keepPreviousOnReload && status.value === 'loaded')) {
    status.value = 'error'
  }
  emit('error', {})
}

onMounted(() => {
  if (props.lazy === 'observer' && root.value) {
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start()
          io?.disconnect()
          io = null
        }
      },
      { rootMargin: props.rootMargin, threshold: 0.01 }
    )
    io.observe(root.value)
  } else {
    start()
  }
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (io) io.disconnect()
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})

// URL mode: react to `src` changes (e.g. list reuse / manual refresh).
watch(
  () => props.src,
  (val) => {
    if (props.loader || !started) return
    displaySrc.value = val
    if (!(props.keepPreviousOnReload && status.value === 'loaded')) {
      status.value = 'loading'
    }
  }
)
</script>

<template>
  <div ref="root" class="sh-lazy-image" :class="`is-${status}`" :style="wrapperStyle">
    <!-- Loading placeholder: custom slot > placeholder image > skeleton -->
    <div v-if="status === 'idle' || status === 'loading'" class="sh-lazy-image__placeholder">
      <slot name="placeholder">
        <img
          v-if="placeholderSrc"
          class="sh-lazy-image__placeholder-img"
          :src="placeholderSrc"
          alt=""
          draggable="false"
        />
        <div v-else-if="skeleton" class="sh-lazy-image__skeleton" />
      </slot>
    </div>

    <!-- Error fallback: image + text, fully overridable via the `error` slot -->
    <div v-if="status === 'error'" class="sh-lazy-image__error">
      <slot name="error" :src="errorImage" :text="errorText">
        <img
          v-if="showErrorImage"
          class="sh-lazy-image__error-img"
          :src="errorImage"
          :alt="errorText"
          draggable="false"
        />
        <span class="sh-lazy-image__error-text">{{ errorText }}</span>
      </slot>
    </div>

    <!-- Real image: fades in once loaded/decoded -->
    <img
      v-if="displaySrc && status !== 'error'"
      class="sh-lazy-image__inner"
      :src="displaySrc"
      :alt="alt"
      :style="{ objectFit: fit }"
      :loading="nativeLoading"
      decoding="async"
      draggable="false"
      @load="onImgLoad"
      @error="onImgError"
    />

    <!-- Overlay content (e.g. captions, badges) -->
    <slot />
  </div>
</template>

<style scoped>
.sh-lazy-image {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--sh-color-bg-hover);
}

.sh-lazy-image__inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.sh-lazy-image.is-loaded .sh-lazy-image__inner {
  opacity: 1;
}

.sh-lazy-image__placeholder {
  position: absolute;
  inset: 0;
}

.sh-lazy-image__placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sh-lazy-image__skeleton {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f2f3f5 25%, #e6e8eb 37%, #f2f3f5 63%);
  background-size: 400% 100%;
  animation: sh-lazy-image-shimmer 1.4s ease infinite;
}

.sh-lazy-image__error {
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

.sh-lazy-image__error-img {
  max-width: 60%;
  max-height: 60%;
  object-fit: contain;
}

.sh-lazy-image__error-text {
  font-size: var(--sh-font-size-sm);
  color: var(--sh-color-text-secondary);
}

@keyframes sh-lazy-image-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
