import { ref } from 'vue'

/**
 * 全局复制提示（仿 ant-design-vue message）：共享一条状态，
 * 多处复制按钮（CodeBlock / 安装命令）复用同一个 toast，避免叠加。
 */
const state = ref({ visible: false, text: '复制成功' })
let timer: ReturnType<typeof setTimeout> | null = null

export const copyToast = state

export function showCopyToast(text = '复制成功', duration = 2000) {
  state.value = { visible: true, text }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    state.value.visible = false
  }, duration)
}
