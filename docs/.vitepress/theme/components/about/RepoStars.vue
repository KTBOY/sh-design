<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * GitHub 星标数：客户端取一次，sessionStorage 缓存一小时。
 * 取不到（离线、限流、404）就整块不渲染，卡片不留空壳。
 */
const props = defineProps<{ repo: string }>()
const stars = ref<number | null>(null)
let aborted = false

const CACHE_TTL = 60 * 60 * 1000

function readCache(): number | null {
  try {
    const raw = sessionStorage.getItem(`gh:stars:${props.repo}`)
    if (!raw) return null
    const cached = JSON.parse(raw) as { count?: unknown; at?: unknown }
    if (typeof cached.count !== 'number' || typeof cached.at !== 'number') return null
    return Date.now() - cached.at > CACHE_TTL ? null : cached.count
  } catch {
    return null
  }
}

onMounted(async () => {
  const cached = readCache()
  if (cached !== null) {
    stars.value = cached
    return
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${props.repo}`, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) return
    const data = (await res.json()) as { stargazers_count?: unknown }
    if (aborted || typeof data.stargazers_count !== 'number') return
    stars.value = data.stargazers_count
    try {
      sessionStorage.setItem(
        `gh:stars:${props.repo}`,
        JSON.stringify({ count: data.stargazers_count, at: Date.now() })
      )
    } catch {
      // 隐私模式下写入会抛错，跳过缓存即可
    }
  } catch {
    // 离线或限流：保持不渲染
  }
})

onBeforeUnmount(() => {
  aborted = true
})
</script>

<template>
  <span v-if="stars !== null" class="repo-stars" role="img" :aria-label="`GitHub 星标 ${stars}`">
    <svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"
      />
    </svg>
    {{ stars }}
  </span>
</template>

<style scoped>
.repo-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  transition: color 0.2s ease;
}

.proj-card:hover .repo-stars {
  color: #6b7280;
}
</style>
