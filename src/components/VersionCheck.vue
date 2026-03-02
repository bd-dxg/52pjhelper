<template>
  <div v-if="showBanner" class="update-banner">
    <div class="update-content">
      <div class="update-text">
        <strong>发现新版本 {{ latestVersion }}</strong>
        <span class="current-version">当前版本: {{ currentVersion }}</span>
      </div>
    </div>
    <div class="update-actions">
      <button class="btn-update" @click="openUpdatePage">立即更新</button>
      <button class="btn-dismiss" @click="dismissUpdate">忽略</button>
    </div>
  </div>
  <!-- 调试按钮：手动检查更新 -->
  <div v-else class="check-update-container">
    <button class="btn-check" @click="checkUpdateNow" :disabled="isChecking">
      {{ isChecking ? '检查中...' : '检查更新' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import config from '@conf/versionCheck.json'

const showBanner = ref(false)
const latestVersion = ref('')
const currentVersion = ref('')
const isChecking = ref(false)

const loadUpdateInfo = async () => {
  try {
    const response = await browser.runtime.sendMessage({ type: 'GET_UPDATE_INFO' })

    if (response?.success && response.hasUpdate && !response.isDismissed) {
      showBanner.value = true
      latestVersion.value = response.latestVersion
      currentVersion.value = response.currentVersion
    }
  } catch (error) {
    // 静默处理错误，background script 可能还未加载
    console.error('获取更新信息失败:', error)
  }
}

onMounted(loadUpdateInfo)

const openUpdatePage = () => {
  browser.tabs.create({ url: config.threadUrl })
  showBanner.value = false
}

const dismissUpdate = async () => {
  try {
    await browser.runtime.sendMessage({
      type: 'DISMISS_UPDATE',
      version: latestVersion.value,
    })
    showBanner.value = false
  } catch (error) {
    console.error('忽略更新失败:', error)
  }
}

const checkUpdateNow = async () => {
  if (isChecking.value) return

  isChecking.value = true
  try {
    // 清除忽略标记（用户主动检查更新，应该显示所有可用更新）
    await browser.runtime.sendMessage({ type: 'CLEAR_DISMISSED' })

    // 发送立即检查更新的消息
    await browser.runtime.sendMessage({ type: 'CHECK_UPDATE_NOW' })

    // 等待 2 秒后重新加载更新信息
    setTimeout(async () => {
      await loadUpdateInfo()
      isChecking.value = false
    }, 2000)
  } catch (error) {
    console.error('检查更新失败:', error)
    isChecking.value = false
  }
}
</script>

<style scoped>
.update-banner {
  position: absolute;
  top: 0px;
  right: 0px;
  height: 80px;
  padding: 0 10px;
  gap: 10px;
  background: linear-gradient(135deg, transparent 30%, var(--border-color-light) 50%, var(--primary-color) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.update-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.update-text {
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  text-align: right;
  gap: 4px;
}

.update-text strong {
  font-size: 14px;
  font-weight: 600;
}

.current-version {
  font-size: 12px;
  opacity: 0.9;
}

.update-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-update,
.btn-dismiss {
  color: var(--text-primary);
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-update {
  background: rgba(255, 255, 255, 0.2);
}
.btn-update:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-dismiss {
  background: rgba(255, 255, 255, 0.2);
}

.btn-dismiss:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-update:active,
.btn-dismiss:active {
  transform: translateY(0);
}

/* 检查更新按钮容器 */
.check-update-container {
  position: absolute;
  top: 10px;
  right: 10px;
}

.btn-check {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.btn-check::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-check:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-check:hover:not(:disabled)::before {
  left: 100%;
}

.btn-check:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-check:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #999 0%, #777 100%);
}
</style>
