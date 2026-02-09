import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [WxtVitest(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@com': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@ent': fileURLToPath(new URL('./src/entries', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@conf': fileURLToPath(new URL('./src/configs', import.meta.url)),
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['node_modules/**', '.wxt/**', '**/*.config.*', '**/dist/**', '**/*.d.ts', 'tests/**'],
    },
  },
})
