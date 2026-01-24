<template>
  <main class="settings-panel">
    <!-- 用户信息显示区 -->
    <header class="user-info-header">
      <div class="user-avatar">
        <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.username + ' 的头像'" />
        <svg v-else viewBox="0 0 40 40" fill="currentColor">
          <circle cx="20" cy="20" r="20" fill="var(--bg-secondary)" />
          <circle cx="20" cy="15" r="8" fill="var(--text-secondary)" />
          <path d="M10 32c0-8 10-13 10-13s10 5 10 13" stroke="var(--text-secondary)" stroke-width="3" fill="none" stroke-linecap="round" />
        </svg>
      </div>
      <div class="user-details">
        <div class="username">{{ userInfo.username }}</div>
        <div class="user-level" :class="{ 'not-logged': !userInfo.isLoggedIn }">
          {{ userInfo.level }}
        </div>
      </div>
    </header>

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
        <NavigationSettings @show-message="showMessage" />
      </section>

      <!-- 便捷查询设置 -->
      <section v-show="activeTab === 'quickQuery'" role="tabpanel" class="tab-panel" aria-labelledby="quickQuery-tab">
        <QuickQueryToggle @show-message="showMessage" />
        <QuickReplyToggle @show-message="showMessage" />
        <FloorHighlighterToggle @show-message="showMessage" />
        <NativeFloorDisplayToggle @show-message="showMessage" />
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
import NavigationSettings from '@com/NavigationSettings.vue'
import QuickQueryToggle from '@com/QuickQueryToggle.vue'
import QuickReplyToggle from '@com/QuickReplyToggle.vue'
import FloorHighlighterToggle from '@com/FloorHighlighterToggle.vue'
import NativeFloorDisplayToggle from '@com/NativeFloorDisplayToggle.vue'
import type { UserInfo } from '@utils/userInfo'
import { getUserInfoFromCache } from '@utils/userInfo'

// 用户信息
const userInfo = ref<UserInfo>({
  username: '未登录',
  level: '游客',
  avatar: '',
  isLoggedIn: false,
  permissions: {
    isAdmin: false,
    isModerator: false,
    isVIP: false,
    isRegular: false
  }
})

const message = ref('')
const messageType = ref('')
const activeTab = ref<'navigation' | 'quickQuery'>('navigation')

// 从 content script 获取用户信息
const updateUserInfo = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_USER_INFO'
        })

        if (response && response.success) {
          userInfo.value = response.data
        } else {
          // 从缓存读取用户信息
          const cachedUserInfo = await getUserInfoFromCache()
          if (cachedUserInfo) {
            userInfo.value = cachedUserInfo
          }
        }
      } catch (error) {
        // 通信失败时，不显示错误信息，直接从缓存读取
        const cachedUserInfo = await getUserInfoFromCache()
        if (cachedUserInfo) {
          userInfo.value = cachedUserInfo
        }
      }
    } else {
      // 非 52pojie.cn 页面，直接从缓存读取
      const cachedUserInfo = await getUserInfoFromCache()
      if (cachedUserInfo) {
        userInfo.value = cachedUserInfo
      }
    }
  } catch (error) {
    // 其他错误时，不显示错误信息，保持默认值
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  updateUserInfo()
})

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.settings-panel {
  min-width: 350px;
  max-width: 400px;
  height: 550px;
  display: flex;
  flex-direction: column;
}

/* 用户信息头部 */
.user-info-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar svg {
  width: 100%;
  height: 100%;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-level {
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.user-level.not-logged {
  color: var(--error-color);
  background-color: var(--error-bg);
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
  max-height: calc(100% - 180px); /* 为消息提示和其他区域预留空间 */
  overflow-y: auto;
  padding: 20px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
  height: 100%;
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

/* 子组件通用样式 - 使用 :deep() 穿透选择器 */

/* Toggle 组件样式 */
:deep(.toggle-container) {
  margin-bottom: 12px;
}

:deep(.toggle-label) {
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

:deep(.toggle-label:hover) {
  background-color: var(--bg-hover);
}

:deep(.toggle-label span) {
  font-size: 14px;
  color: var(--text-primary);
}

:deep(.toggle-switch) {
  position: relative;
  width: 50px;
  height: 24px;
}

:deep(.toggle-switch input) {
  opacity: 0;
  width: 0;
  height: 0;
}

:deep(.slider) {
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

:deep(.slider:before) {
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

:deep(input:checked + .slider) {
  background-color: var(--primary-color);
}

:deep(input:checked + .slider:before) {
  transform: translateX(26px);
}

/* NavigationSettings 组件样式 */
:deep(.navigation-container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.description) {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

:deep(.menu-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  flex: 1;
}

:deep(.menu-btn) {
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

:deep(.menu-btn:hover) {
  background-color: var(--primary-hover);
  border-color: var(--primary-hover);
}

:deep(.menu-btn.is-hidden) {
  background-color: var(--menu-hidden-bg);
  color: var(--text-tertiary);
  border-color: var(--border-color);
}

:deep(.menu-btn.is-hidden:hover) {
  background-color: var(--menu-hidden-hover);
  border-color: var(--border-color-light);
}

:deep(.actions) {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 32px; /* 设置最小高度，防止出现和消失时页面抖动 */
}

:deep(.btn) {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 32px; /* 设置固定高度，确保按钮高度一致 */
  box-sizing: border-box;
}

:deep(.btn-secondary) {
  background-color: var(--btn-secondary-bg);
  color: white;
}

:deep(.btn-secondary:hover) {
  background-color: var(--btn-secondary-hover);
}

/* NavigationSettings 组件的消息样式 */
:deep(.actions .message) {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  height: 32px; /* 与按钮高度一致 */
  line-height: 16px; /* 垂直居中 */
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

:deep(.actions .message.success) {
  background-color: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

:deep(.actions .message.error) {
  background-color: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
}
</style>
