import { defineConfig } from 'wxt'
import { fileURLToPath } from 'url'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  targetBrowsers: ['chrome'],
  entrypointsDir: 'entries',
  modules: ['@wxt-dev/module-vue'],
  manifestVersion: 3,
  vite: () => ({
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
  }),
  manifest: {
    name: '吾爱管理效率助手',
    description: '提升论坛管理效率',
    version: '2.11.1',
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvjJS8QpooRgV5LJlg5HWnAqrZyuIpyi+qTdq94OOWgBp0zDnlA1VOVhroJ4sLDfAQlgxTm6zlXZl7nnEJ8DKWcsW+5hBdVEWNzMgs1VaqnYOMxjFz1eMI9/S5EfCIHh3VkVbGbOHWq1Nm5b7UHhkArFcAHMf0R9bXjV3WIqFUd21N7RtRAfw/vkLMsaiOGbSxAUFBqwA4vfGhez3Sy0MdGqTceW7ks6iRxIyH6JBC8L57tmRCl4kNGc8acns+IEFa31nVpaMmVhZFR9la0lMlJRw0S0Z+ENGYOYUDEKc1obtFmrE/7M/zcx9+NdKqC8Yyd6KrlqHU5o8WVK3Ul+3OwIDAQAB',
    action: {
      default_icon: 'images/icon-128.png',
    },
    icons: {
      '16': 'images/icon-16.png',
      '48': 'images/icon-48.png',
      '128': 'images/icon-128.png',
    },
    permissions: ['storage', 'alarms', 'notifications'],
    host_permissions: ['https://*.52pojie.cn/*'],
    content_scripts: [
      {
        matches: ['https://www.52pojie.cn/*'],
        js: ['contents.js'],
      },
    ],
  },
})
