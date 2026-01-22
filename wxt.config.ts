import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  targetBrowsers: ['chrome'],
  entrypointsDir: 'entries',
  modules: ['@wxt-dev/module-vue'],
  manifestVersion: 3,
  manifest: {
    name: '吾爱管理效率助手',
    description: '提升论坛管理效率',
    version: '1.2.0',
    action: {
      default_icon: 'images/icon-128.png',
    },
    icons: {
      '16': 'images/icon-16.png',
      '48': 'images/icon-48.png',
      '128': 'images/icon-128.png',
    },
    permissions: ['storage'],
    host_permissions: ['https://www.52pojie.cn/*'],
    content_scripts: [
      {
        matches: ['https://www.52pojie.cn/*'],
        js: ['contents.js'],
      },
    ],
  },
})
