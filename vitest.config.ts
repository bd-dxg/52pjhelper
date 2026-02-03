import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [WxtVitest(), vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@com': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@ent': path.resolve(__dirname, './src/entries'),
      '@pages': path.resolve(__dirname, './src/pages'),
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
      exclude: [
        'node_modules/**',
        '.wxt/**',
        '**/*.config.*',
        '**/dist/**',
        '**/*.d.ts',
        'tests/**',
      ],
    },
  },
})
