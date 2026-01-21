<template>
  <div class="nav-console">
    <h2>导航菜单设置</h2>
    <p class="description">
      点击菜单按钮切换显示/隐藏状态，蓝色背景表示显示，灰色背景表示隐藏。
    </p>

    <div class="menu-grid">
      <button
        v-for="menu in navMenus"
        :key="menu.id"
        class="menu-btn"
        :class="{ 'is-hidden': isMenuHidden(menu.id) }"
        @click="toggleMenu(menu.id)"
      >
        {{ menu.name }}
      </button>
    </div>

    <div class="actions">
      <button class="btn btn-secondary" @click="resetConfig">
        重置为默认
      </button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  DEFAULT_NAV_MENUS,
  loadNavConfig,
  saveNavConfig,
  toggleMenu as toggleMenuUtil,
} from '../../utils/navigationHider'

const navMenus = DEFAULT_NAV_MENUS
const hiddenMenus = ref<string[]>([])
const message = ref('')
const messageType = ref('')

// 检查菜单是否被隐藏
const isMenuHidden = (menuId: string) => {
  return hiddenMenus.value.includes(menuId)
}

// 切换菜单显示/隐藏
const toggleMenu = async (menuId: string) => {
  try {
    const config = await toggleMenuUtil(menuId)
    hiddenMenus.value = config.hiddenMenus
    showMessage('设置已更新', 'success')

    // 发送消息到 content script，通知其更新网页 DOM
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'UPDATE_NAVIGATION',
        config,
      })
    }
  } catch (error) {
    showMessage('更新设置失败', 'error')
  }
}

// 重置为默认配置
const resetConfig = async () => {
  try {
    const defaultConfig = { hiddenMenus: [] }
    await saveNavConfig(defaultConfig)
    hiddenMenus.value = []
    showMessage('配置已重置为默认', 'success')

    // 发送消息到 content script，通知其更新网页 DOM
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'UPDATE_NAVIGATION',
        config: defaultConfig,
      })
    }
  } catch (error) {
    showMessage('重置配置失败', 'error')
  }
}

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 加载用户配置
onMounted(async () => {
  try {
    const config = await loadNavConfig()
    hiddenMenus.value = config.hiddenMenus
  } catch (error) {
    console.error('Failed to load navigation config:', error)
    showMessage('加载配置失败', 'error')
  }
})
</script>

<style scoped>
.nav-console {
  min-width: 300px;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.description {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
}

.menu-btn {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background-color: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.menu-btn.is-hidden {
  background-color: #f0f0f0;
  color: #999;
  border-color: #e4e7ed;
}

.menu-btn.is-hidden:hover {
  background-color: #e4e7ed;
  border-color: #dcdee2;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.message.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.message.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}
</style>
