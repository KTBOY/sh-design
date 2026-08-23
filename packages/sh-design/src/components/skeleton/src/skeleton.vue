<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { skeletonProps } from './skeleton'

defineOptions({ name: 'ShSkeleton' })

const props = defineProps(skeletonProps)
const slots = useSlots()

/** throttle 生效后的"是否显示骨架"（loading 变 true 延迟生效，变 false 立即隐藏） */
const showSkeleton = ref(props.loading)
let throttleTimer: ReturnType<typeof setTimeout> | null = null

function clearThrottleTimer() {
  if (throttleTimer) {
    clearTimeout(throttleTimer)
    throttleTimer = null
  }
}

watch(
  () => props.loading,
  (loading) => {
    clearThrottleTimer()
    if (!loading || props.throttle <= 0) {
      showSkeleton.value = loading
      return
    }
    throttleTimer = setTimeout(() => {
      showSkeleton.value = true
    }, props.throttle)
  }
)

onBeforeUnmount(clearThrottleTimer)

const hasTemplate = computed(() => !!slots.template)

const countList = computed(() => Array.from({ length: Math.max(1, props.count) }, (_, i) => i))

/** 每行宽度：数组按行下发；单值统一应用；缺省时末行 60% 其余 100% */
const rowWidths = computed<string[]>(() => {
  const n = Math.max(0, props.rows)
  if (Array.isArray(props.rowWidth)) {
    const list = props.rowWidth
    return Array.from({ length: n }, (_, i) => list[i] ?? '100%')
  }
  const single = props.rowWidth
  return Array.from({ length: n }, (_, i) => single || (i === n - 1 && n > 1 ? '60%' : '100%'))
})

const avatarStyle = computed(() => ({
  width: props.avatarSize,
  height: props.avatarSize
}))

/** 单形状模式尺寸：circle 用 height 同时作宽高；其余铺满宽度，缺省高度按变体取默认 */
const variantStyle = computed(() => {
  if (props.variant === 'circle') {
    const size = props.height || '40px'
    return { width: size, height: size }
  }
  return {
    width: '100%',
    height: props.height || (props.variant === 'image' ? '200px' : '16px')
  }
})
</script>

<template>
  <component :is="tag" class="sh-skeleton" :class="{ 'is-static': !animated }">
    <template v-if="showSkeleton">
      <!-- 自定义骨架布局 -->
      <slot v-if="hasTemplate" name="template" />
      <div
        v-for="c in countList"
        v-else
        :key="c"
        class="sh-skeleton__group"
        :class="{ 'is-round': round }"
      >
        <div
          v-if="variant"
          class="sh-skeleton__block sh-skeleton__variant"
          :class="`is-${variant}`"
          :style="variantStyle"
        />
        <template v-else>
          <div v-if="avatar" class="sh-skeleton__block sh-skeleton__avatar" :style="avatarStyle" />
          <div class="sh-skeleton__content">
            <div v-if="title" class="sh-skeleton__block sh-skeleton__title" :style="{ width: titleWidth }" />
            <div
              v-for="(w, i) in rowWidths"
              :key="i"
              class="sh-skeleton__block sh-skeleton__row"
              :style="{ width: w }"
            />
          </div>
        </template>
      </div>
    </template>
    <!-- 真实内容 -->
    <slot v-else />
  </component>
</template>

<style scoped>
.sh-skeleton__group {
  display: flex;
  align-items: flex-start;
}

.sh-skeleton__group + .sh-skeleton__group {
  margin-top: 20px;
}

.sh-skeleton__avatar {
  flex: none;
  margin-right: 12px;
  border-radius: 50%;
}

.sh-skeleton__content {
  flex: 1;
  min-width: 0;
}

.sh-skeleton__title,
.sh-skeleton__row {
  height: 16px;
  border-radius: var(--sh-radius-sm, 4px);
}

.sh-skeleton__title {
  margin-bottom: 12px;
}

.sh-skeleton__row + .sh-skeleton__row {
  margin-top: 12px;
}

.is-round .sh-skeleton__title,
.is-round .sh-skeleton__row {
  border-radius: 999px;
}

.sh-skeleton__variant.is-image {
  border-radius: var(--sh-radius, 8px);
}

/* 骨架块的微光背景与默认圆角在全局样式中定义（styles/skeleton.css 的
 * .sh-skeleton__block）#template 插槽内容属于父作用域，scoped 样式无法命中 */

.sh-skeleton.is-static .sh-skeleton__block {
  animation: none;
}

@keyframes sh-skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sh-skeleton__block {
    animation: none;
  }
}
</style>
