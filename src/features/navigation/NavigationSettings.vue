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
    </footer>
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_NAV_MENUS, loadNavConfig, saveNavConfig, toggleMenu as toggleMenuUtil } from './navigationHider'
import { useNotification } from '@/composables/useNotification'

const navMenus = DEFAULT_NAV_MENUS
const hiddenMenus = ref<string[]>([])
const { success, error } = useNotification()

// 检查菜单是否被隐藏
const isMenuHidden = (menuId: string) => {
  return hiddenMenus.value.includes(menuId)
}

// 切换菜单显示/隐藏
const toggleMenu = async (menuId: string) => {
  try {
    const config = await toggleMenuUtil(menuId)
    hiddenMenus.value = config.hiddenMenus
    success('设置已更新', { title: '操作成功' })

    // 发送消息到 content script，通知其更新网页 DOM（仅在 52pojie.cn 页面）
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'UPDATE_NAVIGATION',
        config,
      })
    }
  } catch (err) {
    error('更新设置失败', { title: '操作失败' })
  }
}

// 重置为默认配置
const resetConfig = async () => {
  try {
    const defaultConfig = { hiddenMenus: [] }
    await saveNavConfig(defaultConfig)
    hiddenMenus.value = []
    success('配置已重置为默认', { title: '操作成功' })

    // 发送消息到 content script，通知其更新网页 DOM（仅在 52pojie.cn 页面）
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'UPDATE_NAVIGATION',
        config: defaultConfig,
      })
    }
  } catch (err) {
    error('重置配置失败', { title: '操作失败' })
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    const config = await loadNavConfig()
    hiddenMenus.value = config.hiddenMenus
  } catch (err) {
    console.error('Failed to load navigation config:', err)
    error('加载配置失败', { title: '操作失败' })
  }
})
</script>

<style scoped>
.navigation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.description {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  flex: 1;
}

.menu-btn {
  padding: 8px 12px;
  border: 1px solid var(--border-color-light);
  border-radius: 6px;
  background-color: var(--primary-color);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.menu-btn:hover {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

.menu-btn.is-hidden {
  background-color: var(--menu-hidden-bg);
  color: var(--text-tertiary);
  border-color: var(--border-color);
}

.menu-btn.is-hidden:hover {
  background-color: var(--menu-hidden-hover);
  border-color: var(--border-color-light);
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 32px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 32px;
  box-sizing: border-box;
}

.btn-secondary {
  background-color: var(--btn-secondary-bg);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--btn-secondary-hover);
}
</style>
