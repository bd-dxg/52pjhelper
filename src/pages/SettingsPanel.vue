<template>
  <main class="settings-panel">
    <!-- 选项卡导航 -->
    <nav class="tabs-header" role="tablist">
      <button
        role="tab"
        :aria-selected="activeTab === 'navigation'"
        :tabindex="activeTab === 'navigation' ? 0 : -1"
        class="tab-item"
        :class="{ active: activeTab === 'navigation' }"
        @click="activeTab = 'navigation'">
        导航菜单设置
      </button>
      <button
        role="tab"
        :aria-selected="activeTab === 'quickQuery'"
        :tabindex="activeTab === 'quickQuery' ? 0 : -1"
        class="tab-item"
        :class="{ active: activeTab === 'quickQuery' }"
        @click="activeTab = 'quickQuery'">
        更多设置
      </button>
    </nav>

    <!-- 选项卡内容 -->
    <div class="tabs-content">
      <!-- 导航菜单设置 -->
      <section v-show="activeTab === 'navigation'" role="tabpanel" class="tab-panel" aria-labelledby="navigation-tab">
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
      </section>

      <!-- 便捷查询设置 -->
      <section v-show="activeTab === 'quickQuery'" role="tabpanel" class="tab-panel" aria-labelledby="quickQuery-tab">
        <p class="description">鼠标移动到用户头像时，自动显示该用户的违规记录。</p>

        <div class="toggle-container">
          <label class="toggle-label">
            <span>启用便捷查询</span>
            <div class="toggle-switch" @click.stop="toggleQuickQuery">
              <input type="checkbox" :checked="quickQueryEnabled" disabled aria-label="启用便捷查询" />
              <span class="slider"></span>
            </div>
          </label>
        </div>

        <p class="description">在举报处理页面添加快捷回复短语下拉框，提高管理效率。</p>

        <div class="toggle-container">
          <label class="toggle-label">
            <span>启用快捷回复</span>
            <div class="toggle-switch" @click.stop="toggleQuickReply">
              <input type="checkbox" :checked="quickReplyEnabled" disabled aria-label="启用快捷回复" />
              <span class="slider"></span>
            </div>
          </label>
        </div>
      </section>
    </div>

    <!-- 消息提示 -->
    <aside class="message-container" role="status" aria-live="polite">
      <output v-if="message" class="message" :class="messageType">
        {{ message }}
      </output>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DEFAULT_NAV_MENUS, loadNavConfig, saveNavConfig, toggleMenu as toggleMenuUtil } from '@utils/navigationHider'

const navMenus = DEFAULT_NAV_MENUS
const hiddenMenus = ref<string[]>([])
const message = ref('')
const messageType = ref('')
const quickQueryEnabled = ref(false)
const quickReplyEnabled = ref(false)
const activeTab = ref<'navigation' | 'quickQuery'>('navigation')

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

// 切换便捷查询功能
const toggleQuickQuery = async () => {
  console.log('toggleQuickQuery 被调用，当前状态:', quickQueryEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_QUICK_QUERY',
      })

      if (response.success) {
        quickQueryEnabled.value = response.enabled
        showMessage(quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用', 'success')
      } else {
        showMessage('切换便捷查询失败', 'error')
      }
    }
  } catch (error) {
    showMessage('切换便捷查询失败', 'error')
  }
}

// 切换快捷回复功能
const toggleQuickReply = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_QUICK_REPLY',
        })

        if (response && response.success) {
          quickReplyEnabled.value = response.enabled
          showMessage(quickReplyEnabled.value ? '快捷回复已启用' : '快捷回复已禁用', 'success')
        } else {
          showMessage('切换快捷回复失败', 'error')
        }
      } catch (error) {
        console.error('Message error:', error)
        showMessage('无法连接到页面，请刷新页面后重试', 'error')
      }
    }
  } catch (error) {
    console.error('Tab query error:', error)
    showMessage('切换快捷回复失败', 'error')
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

    // 获取便捷查询状态
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        const quickQueryResponse = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_QUICK_QUERY_STATUS',
        })

        if (quickQueryResponse && quickQueryResponse.success) {
          quickQueryEnabled.value = quickQueryResponse.enabled
        }

        const quickReplyResponse = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_QUICK_REPLY_STATUS',
        })

        if (quickReplyResponse && quickReplyResponse.success) {
          quickReplyEnabled.value = quickReplyResponse.enabled
        }
      } catch (error) {
        console.error('Failed to get status from content script:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load navigation config:', error)
    showMessage('加载配置失败', 'error')
  }
})
</script>

<style scoped>
.settings-panel {
  min-width: 350px;
  max-width: 400px;
  height: 450px;
  display: flex;
  flex-direction: column;
}

/* 选项卡头部 */
.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  user-select: none;
  background-color: var(--bg-secondary);
  border: none;
}

.tab-item:hover {
  color: var(--primary-color);
  background-color: var(--bg-hover);
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: 600;
  border-bottom-color: var(--primary-color);
  background-color: var(--bg-primary);
}

/* 选项卡内容 */
.tabs-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: var(--btn-secondary-bg);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--btn-secondary-hover);
}

.toggle-container {
  margin-bottom: 20px;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.toggle-label:hover {
  background-color: var(--bg-hover);
}

.toggle-label span {
  font-size: 14px;
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-bg);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.message-container {
  min-height: 45px;
  padding: 0 20px 15px;
}

.message {
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  animation: slideIn 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background-color: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.message.error {
  background-color: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
}
</style>
