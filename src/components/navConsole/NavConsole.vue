<template>
  <div class="nav-console">
    <!-- 选项卡头部 -->
    <div class="tabs-header">
      <div
        class="tab-item"
        :class="{ active: activeTab === 'navigation' }"
        @click="activeTab = 'navigation'"
      >
        导航菜单设置
      </div>
      <div
        class="tab-item"
        :class="{ active: activeTab === 'quickQuery' }"
        @click="activeTab = 'quickQuery'"
      >
        便捷查询设置
      </div>
    </div>

    <!-- 选项卡内容 -->
    <div class="tabs-content">
      <!-- 导航菜单设置 -->
      <div v-show="activeTab === 'navigation'" class="tab-panel">
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
      </div>

      <!-- 便捷查询设置 -->
      <div v-show="activeTab === 'quickQuery'" class="tab-panel">
        <p class="description">
          鼠标移动到用户头像时，自动显示该用户的违规记录。
        </p>

        <div class="toggle-container">
          <div class="toggle-label">
            <span>启用便捷查询</span>
            <div class="toggle-switch" @click.stop="toggleQuickQuery">
              <input type="checkbox" :checked="quickQueryEnabled" disabled />
              <span class="slider"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div class="message-container">
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
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
const quickQueryEnabled = ref(false)
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
        showMessage(
          quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用',
          'success'
        )
      } else {
        showMessage('切换便捷查询失败', 'error')
      }
    }
  } catch (error) {
    showMessage('切换便捷查询失败', 'error')
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
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'GET_QUICK_QUERY_STATUS',
      })

      if (response.success) {
        quickQueryEnabled.value = response.enabled
      }
    }
  } catch (error) {
    console.error('Failed to load navigation config:', error)
    showMessage('加载配置失败', 'error')
  }
})
</script>

<style scoped>
.nav-console {
  min-width: 350px;
  max-width: 400px;
  height: 450px;
  display: flex;
  flex-direction: column;
}

/* 选项卡头部 */
.tabs-header {
  display: flex;
  border-bottom: 2px solid #e4e7ed;
  background-color: #f5f7fa;
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  user-select: none;
}

.tab-item:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.tab-item.active {
  color: #409eff;
  font-weight: 600;
  border-bottom-color: #409eff;
  background-color: white;
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
  color: #666;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
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
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.toggle-label:hover {
  background-color: #ecf5ff;
}

.toggle-label span {
  font-size: 14px;
  color: #333;
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
  background-color: #ccc;
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
  background-color: #409eff;
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
