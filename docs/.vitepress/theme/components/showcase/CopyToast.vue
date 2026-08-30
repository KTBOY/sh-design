<script setup lang="ts">
import { copyToast } from '../../showcase/copyToast'
</script>

<template>
  <Teleport to="body">
    <Transition name="copy-toast">
      <div v-if="copyToast.visible" class="copy-toast" role="status">
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm5.03 7.47-5.8 5.8a.75.75 0 0 1-1.06 0l-2.7-2.7a.75.75 0 1 1 1.06-1.06l2.17 2.17 5.27-5.27a.75.75 0 0 1 1.06 1.06Z"
          />
        </svg>
        <span>{{ copyToast.text }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.copy-toast {
  position: fixed;
  top: calc(var(--vp-nav-height, 56px) + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border: 1px solid #ececef;
  border-radius: 10px;
  background: #fff;
  color: #111214;
  font-size: 13.5px;
  box-shadow:
    0 8px 24px -8px rgba(10, 10, 11, 0.18),
    0 2px 6px rgba(10, 10, 11, 0.06);
}
.copy-toast svg {
  flex: none;
  color: #16a34a;
}

.copy-toast-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.copy-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.copy-toast-enter-from,
.copy-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
.copy-toast-enter-to,
.copy-toast-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (prefers-reduced-motion: reduce) {
  .copy-toast,
  .copy-toast-enter-active,
  .copy-toast-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
