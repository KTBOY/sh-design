<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'

// A promotional "mini-program" trigger button that opens a silky-smooth dialog.
// The dialog body is designed to host a GIF preview; the GIF/address are passed
// in via props so they can be filled in later without touching the component.
const props = withDefaults(
  defineProps<{
    // Text shown on the trigger button.
    label?: string
    // Dialog title.
    title?: string
    // Mini-program address; rendered as a link when it looks like a URL.
    address?: string
    // GIF (or any image) source shown inside the dialog. Empty → placeholder.
    gif?: string
    // QR-code image source shown inside the dialog. Empty → placeholder.
    qrcode?: string
    // Short description under the media area.
    desc?: string
    // Hint text under the QR code.
    qrText?: string
  }>(),
  {
    label: '小程序版',
    title: '小程序版',
    address: 'xx',
    gif: '',
    qrcode: '',
    desc: '扫码或点击下方地址，即可体验小程序版',
    qrText: '微信扫一扫'
  }
)

const open = ref(false)
// Teleport target ('body') only exists on the client — gate it behind mount.
const mounted = ref(false)
const dialogRef = ref<HTMLElement | null>(null)

const isLink = computed(() => /^(https?:)?\/\//.test(props.address))

// Root-relative assets live in docs/public and must be prefixed with the site
// base; external URLs (http/https/protocol-relative/data) are used as-is.
const resolveAsset = (src: string) => {
  if (!src) return ''
  if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('data:')) return src
  return src.startsWith('/') ? withBase(src) : src
}

const gifSrc = computed(() => resolveAsset(props.gif))
const qrcodeSrc = computed(() => resolveAsset(props.qrcode))

const show = () => (open.value = true)
const hide = () => (open.value = false)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') hide()
}

watch(open, async (val) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) {
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    dialogRef.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

// Mark mounted on the client so the Teleport renders without SSR mismatch.
nextTick(() => (mounted.value = true))

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <button class="mp-trigger" type="button" @click="show">
    <svg class="mp-trigger__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.28 7.53-4.95 6.6a1 1 0 0 1-1.5.11l-2.83-2.83a1 1 0 1 1 1.42-1.42l2 2 4.26-5.68a1 1 0 1 1 1.6 1.22Z"
      />
    </svg>
    <span>{{ label }}</span>
  </button>

  <Teleport v-if="mounted" to="body">
    <Transition name="mp-fade">
      <div v-if="open" class="mp-mask" @click.self="hide">
        <Transition name="mp-pop">
          <div
            v-if="open"
            ref="dialogRef"
            class="mp-dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            tabindex="-1"
          >
            <button class="mp-close" type="button" aria-label="关闭" @click="hide">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M18.3 5.71 12 12l6.3 6.29-1.42 1.42L12 12l-6.29 6.29L4.29 18.3 12 12 4.29 5.71 5.71 4.3 12 12l6.29-6.3 1.42 1.41Z"
                />
              </svg>
            </button>

            <div class="mp-header">
              <h3 class="mp-title">{{ title }}</h3>
            </div>

            <div class="mp-body">
              <div class="mp-media">
                <img v-if="gifSrc" :src="gifSrc" :alt="title" />
                <div v-else class="mp-placeholder" aria-hidden="true">
                  <div class="mp-placeholder__shimmer" />
                  <span class="mp-placeholder__title">GIF 预览占位</span>
                  <small class="mp-placeholder__hint">提供 GIF 后自动展示</small>
                </div>
              </div>

              <p v-if="desc" class="mp-desc">{{ desc }}</p>

              <div class="mp-qr">
                <div class="mp-qr__frame">
                  <img v-if="qrcodeSrc" :src="qrcodeSrc" alt="二维码" />
                  <div v-else class="mp-placeholder" aria-hidden="true">
                    <div class="mp-placeholder__shimmer" />
                    <span class="mp-placeholder__title">二维码占位</span>
                    <small class="mp-placeholder__hint">放入二维码后展示</small>
                  </div>
                </div>
                <span v-if="qrText" class="mp-qr__hint">{{ qrText }}</span>
              </div>

              <div class="mp-address">
                <span class="mp-address__label">地址</span>
                <a v-if="isLink" :href="address" target="_blank" rel="noreferrer">{{ address }}</a>
                <code v-else>{{ address }}</code>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Trigger button — brand gradient CTA with a subtle hover lift. */
.mp-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(120deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 18px -8px rgba(37, 99, 235, 0.6);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;
}

.mp-trigger:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 10px 26px -8px rgba(37, 99, 235, 0.55);
}

.mp-trigger:active {
  transform: translateY(0);
}

.mp-trigger__icon {
  flex: none;
}

/* Mask — dimmed, blurred backdrop covering the viewport. */
.mp-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Dialog card. */
.mp-dialog {
  position: relative;
  width: min(92vw, 360px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px 22px 22px;
  border-radius: 16px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 24px 60px -18px rgba(15, 23, 42, 0.45);
  outline: none;
}

.mp-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.mp-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.mp-header {
  margin-bottom: 16px;
  padding-right: 28px;
}

.mp-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.mp-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Media area — hosts the GIF (or an animated placeholder). */
.mp-media {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.mp-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* QR-code area — a smaller, centered square for scanning. */
.mp-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.mp-qr__frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.mp-qr__frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mp-qr__hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.mp-placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  color: var(--vp-c-text-2);
}

.mp-placeholder__shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 20%,
    rgba(37, 99, 235, 0.12) 42%,
    rgba(59, 130, 246, 0.2) 50%,
    rgba(37, 99, 235, 0.12) 58%,
    transparent 80%
  );
  background-size: 220% 100%;
  animation: mp-shimmer 1.6s ease-in-out infinite;
}

.mp-placeholder__title {
  z-index: 1;
  font-size: 14px;
  font-weight: 600;
}

.mp-placeholder__hint {
  z-index: 1;
  font-size: 12px;
  opacity: 0.75;
}

@keyframes mp-shimmer {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}

.mp-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  text-align: center;
}

.mp-address {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
}

.mp-address__label {
  flex: none;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}

.mp-address a,
.mp-address code {
  word-break: break-all;
  color: var(--vp-c-brand-1);
}

.mp-address code {
  background: transparent;
  padding: 0;
}

/* ── Silky transitions ─────────────────────────────────────────────── */
/* Backdrop fade. */
.mp-fade-enter-active,
.mp-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mp-fade-enter-from,
.mp-fade-leave-to {
  opacity: 0;
}

/* Dialog pop — expo ease-out on enter, quicker ease-in on leave. */
.mp-pop-enter-active {
  transition:
    transform 0.42s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.mp-pop-leave-active {
  transition:
    transform 0.26s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.26s cubic-bezier(0.4, 0, 1, 1);
}

.mp-pop-enter-from,
.mp-pop-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.94);
}

/* Respect reduced-motion preferences. */
@media (prefers-reduced-motion: reduce) {
  .mp-trigger,
  .mp-fade-enter-active,
  .mp-fade-leave-active,
  .mp-pop-enter-active,
  .mp-pop-leave-active {
    transition: none;
  }

  .mp-placeholder__shimmer {
    animation: none;
  }

  .mp-pop-enter-from,
  .mp-pop-leave-to {
    transform: none;
  }
}
</style>
