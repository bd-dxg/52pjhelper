<template>
  <main class="settings-panel">
    <!-- 用户信息显示区 -->
    <header class="user-info-header">
      <div class="user-avatar">
        <img v-if="userInfo.avatar" :src="userInfo.avatar" :alt="userInfo.username + ' 的头像'" />
        <svg v-else viewBox="0 0 40 40" fill="currentColor">
          <circle cx="20" cy="20" r="20" fill="var(--bg-secondary)" />
          <circle cx="20" cy="15" r="8" fill="var(--text-secondary)" />
          <path
            d="M10 32c0-8 10-13 10-13s10 5 10 13"
            stroke="var(--text-secondary)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round" />
        </svg>
      </div>
      <div class="user-details">
        <div class="username">{{ userInfo.username }}</div>
        <div class="user-level" :class="{ 'not-logged': !userInfo.isLoggedIn }">
          {{ userInfo.level }}
        </div>
      </div>
      <!-- 右上角按钮容器 -->
      <div class="header-buttons-container">
        <VersionCheck />
        <CloudDiskListUpdateButton @update="handleCloudDiskListUpdate" />
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
        @click="switchTab('navigation')">
        导航菜单设置
      </button>
      <button
        role="tab"
        :aria-selected="activeTab === 'quickQuery'"
        :tabindex="activeTab === 'quickQuery' ? 0 : -1"
        class="tab-item"
        :class="{ active: activeTab === 'quickQuery' }"
        @click="switchTab('quickQuery')">
        更多设置
      </button>
    </nav>

    <!-- 选项卡内容 -->
    <div class="tabs-content">
      <!-- 导航菜单设置 -->
      <section v-show="activeTab === 'navigation'" role="tabpanel" class="tab-panel" aria-labelledby="navigation-tab">
        <NavigationSettings />
      </section>

      <!-- 便捷查询设置 -->
      <section v-show="activeTab === 'quickQuery'" role="tabpanel" class="tab-panel" aria-labelledby="quickQuery-tab">
        <GeneralFeaturesToggle />
        <AdminFeaturesToggle v-if="isAdmin" />
      </section>
    </div>

    <!-- 全局通知容器 -->
    <NotificationContainer />
  </main>
</template>

<script setup lang="ts">
import NavigationSettings from '@features/navigation/NavigationSettings.vue'
import GeneralFeaturesToggle from '@com/GeneralFeaturesToggle.vue'
import AdminFeaturesToggle from '@com/AdminFeaturesToggle.vue'
import VersionCheck from '@features/versionCheck/VersionCheck.vue'
import CloudDiskListUpdateButton from '@features/userCloudDiskList/CloudDiskListUpdateButton.vue'
import NotificationContainer from '@com/NotificationContainer.vue'
import { getUserInfoFromCache, type UserInfo } from '@utils/userInfo'
import { useNotification } from '@/composables/useNotification'

defineOptions({
  name: 'SettingsPanel',
})

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
    isRegular: false,
  },
})

const activeTab = ref<'navigation' | 'quickQuery'>('navigation')
const ACTIVE_TAB_STORAGE_KEY = 'activeTab'

// 计算属性：用户是否已登录
const isLoggedIn = computed(() => userInfo.value.isLoggedIn)
// 计算属性：用户显示名称
const userDisplayName = computed(() => userInfo.value.username || '未登录')
// 计算属性：用户是否为管理员
const isAdmin = computed(() => userInfo.value.permissions.isAdmin)

// 从 storage 读取并恢复上次的选项卡状态
const loadActiveTab = async () => {
  const result = await browser.storage.local.get(ACTIVE_TAB_STORAGE_KEY)
  const storedTab = result[ACTIVE_TAB_STORAGE_KEY]
  const validTabs: string[] = ['navigation', 'quickQuery']
  if (storedTab && validTabs.includes(storedTab as string)) {
    activeTab.value = storedTab as 'navigation' | 'quickQuery'
  }
}

// 保存选项卡状态到 storage
const saveActiveTab = async (tab: 'navigation' | 'quickQuery') => {
  await browser.storage.local.set({ [ACTIVE_TAB_STORAGE_KEY]: tab })
}

// 处理黑名单更新事件
const handleCloudDiskListUpdate = () => {
  // 可以在这里添加一些全局处理逻辑，比如刷新页面数据等
  console.log('黑名单数据已更新')
}

// 切换选项卡
const switchTab = (tab: 'navigation' | 'quickQuery') => {
  activeTab.value = tab
  saveActiveTab(tab)
}

// 从 content script 获取用户信息
const updateUserInfo = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_USER_INFO',
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
    // 其他错误时，静默处理，保持默认值
    // 开发环境可以取消注释以便调试
    // console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息和选项卡状态
onMounted(() => {
  updateUserInfo()
  loadActiveTab()
})

// 显示消息（兼容旧接口）
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  const { success, error, warning } = useNotification()

  // 根据消息内容判断是启用还是禁用
  if (type === 'success') {
    if (text.includes('已禁用')) {
      // 功能禁用显示橙色警告
      warning(text, { title: '功能禁用' })
    } else {
      // 功能启用显示绿色成功
      success(text, { title: '功能启用' })
    }
  } else {
    error(text, { title: '操作失败' })
  }

}
</script>

<style scoped>
/*
  注意：CSS 变量已在 src/entries/popup/index.html 中全局定义
  这里直接使用这些变量即可，无需重复定义
*/

.settings-panel {
  /* min-width: 500px;
  max-width: 550px;
  height: 550px; */
  display: flex;
  flex-direction: column;
}

/* 右上角按钮容器 */
.header-buttons-container {
  position: absolute;
  top: 8px; /* 减少上边距 */
  right: 8px; /* 增加右边距 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px; /* 进一步减少间隙 */
  z-index: 10;
}

/* 用户信息头部 */
.user-info-header {
  display: flex;
  align-items: center;
  padding: 12px 16px; /* 从 16px 20px 减少到 12px 16px */
  background-color: var(--bg-secondary);
  gap: 10px; /* 从 12px 减少到 10px */
  position: relative; /* 为绝对定位的子元素提供参考 */
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
  flex-shrink: 0;
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

.message-container {
  min-height: 40px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* 选项卡头部 */
.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.tab-item {
  flex: 1;
  padding: 10px 14px; /* 从 12px 16px 减少到 10px 14px */
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
  max-height: calc(100% - 20px); /* 为其他区域预留空间 */
  overflow-y: auto;
  padding: 16px; /* 从 20px 减少到 16px */
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
  min-height: 40px; /* 从 45px 减少到 40px */
  padding: 8px 16px; /* 调整内边距 */
  background-color: var(--bg-secondary);
}

.message {
  padding: 8px; /* 从 10px 减少到 8px */
  border-radius: 4px;
  font-size: 14px;
  animation: slideIn 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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
