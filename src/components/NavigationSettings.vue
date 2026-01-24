<template>
  <div class="navigation-container">
    <p class="description">点击菜单按钮切换显示/隐藏状态，蓝色背景表示显示，灰色背景表示隐藏。</p>

    <div class="menu-grid">
      <button
        v-for="menu in navMenus"
        :key="menu.id"
        class="menu-btn"
        :class="{ 'is-hidden': isMenuHidden(menu.id) }"
        :aria-pressed="!isMenuHidden(menu.id)"
        @click="toggleMenu(menu.id)">
        {{ menu.name }}
      </button>
    </div>

    <footer class="actions">
      <button class="btn btn-secondary" @click="resetConfig">重置为默认</button>
      <span v-if="message" class="message" :class="messageType">{{ message }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DEFAULT_NAV_MENUS, loadNavConfig, saveNavConfig, toggleMenu as toggleMenuUtil } from '@utils/navigationHider'

const navMenus = DEFAULT_NAV_MENUS
const hiddenMenus = ref<string[]>([])
const message = ref('')
const messageType = ref('')
const emit = defineEmits(['show-message'])

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

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

