<script setup lang="ts">
const emit = defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div class="detail">
    <button class="back" @click="emit('back')">← 返回列表</button>
    <h2>卡片详情</h2>
    <p>这里是详情页。切回「列表页」后继续向下滚动，观察触底是否还能加载更多。</p>
    <div v-for="i in 6" :key="i" class="filler">详情区块 {{ i }}</div>
  </div>
</template>

<style scoped>
.detail {
  padding: 16px;
}
.back {
  padding: 6px 14px;
  color: #3b82f6;
  cursor: pointer;
  background: #fff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
}
.filler {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  margin-top: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 8px;
}
</style>
