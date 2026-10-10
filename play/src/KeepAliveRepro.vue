<script setup lang="ts">
import { computed, ref } from 'vue'
import WaterfallList from './repro/WaterfallList.vue'
import DetailView from './repro/DetailView.vue'

const showDetail = ref(false)

// 通过 URL 参数控制截图标签：?label=before / ?label=after
const label = computed(() => {
  const m = /[?&]label=(\w+)/.exec(typeof location !== 'undefined' ? location.search : '')
  return m ? m[1] : ''
})
</script>

<template>
  <div class="repro">
    <div v-if="label === 'before'" class="banner banner--bad">
      修复前 · keep-alive 返回后触底卡死（已显示条数不再增长）
    </div>
    <div v-else-if="label === 'after'" class="banner banner--good">
      修复后 · keep-alive 返回后继续下滚可正常加载下一页
    </div>

    <h1>ShWaterfall · keep-alive 触底卡死复现</h1>
    <p class="hint">
      步骤：① 列表滚到底加载到第 2 页 → ② 点「详情页」→ ③ 点「列表页」返回 → ④ 继续滚到底，看能否加载第 3 页。
    </p>
    <div class="tabs">
      <button :class="{ on: !showDetail }" @click="showDetail = false">列表页</button>
      <button :class="{ on: showDetail }" @click="showDetail = true">详情页</button>
    </div>
    <keep-alive>
      <WaterfallList v-if="!showDetail" />
      <DetailView v-else @back="showDetail = false" />
    </keep-alive>
  </div>
</template>

<style scoped>
.repro {
  max-width: 760px;
  margin: 24px auto;
  padding: 0 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #1f2937;
}
.hint {
  font-size: 13px;
  color: #6b7280;
}
.tabs {
  display: flex;
  gap: 8px;
  margin: 12px 0 16px;
}
.tabs button {
  padding: 6px 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.tabs button.on {
  color: #3b82f6;
  border-color: #3b82f6;
}
.banner {
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
}
.banner--bad {
  color: #b91c1c;
  background: #fee2e2;
  border: 1px solid #fecaca;
}
.banner--good {
  color: #15803d;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}
</style>
