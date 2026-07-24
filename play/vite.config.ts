import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^sh-design$/,
        replacement: fileURLToPath(new URL('../packages/sh-design/src/index.ts', import.meta.url))
      }
    ]
  }
})
