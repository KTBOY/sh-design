import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/build-options.html#build-lib
export default defineConfig({
  plugins: [
    vue(),
    dts({
      // Emit type declarations mirroring the `src` structure into `dist`.
      entryRoot: 'src',
      outDir: 'dist',
      // Generate a single `dist/index.d.ts` entry that matches package.json `types`.
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      // Only build declarations for the library source.
      include: ['src/**/*.ts', 'src/**/*.vue']
    })
  ],
  build: {
    // Keep readable output; consumers do their own minification.
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ShDesign',
      formats: ['es', 'cjs'],
      fileName: (format) => `sh-design.${format === 'es' ? 'js' : 'cjs'}`,
      cssFileName: 'style'
    },
    rollupOptions: {
      // Do not bundle Vue; consumers provide it.
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named'
      }
    }
  }
})
