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
</template>

<script setup lang="ts">
import config from '@conf/versionCheck.json'

const showBanner = ref(false)
const latestVersion = ref('')
const currentVersion = ref('')

onMounted(async () => {
  try {
    // 获取更新信息
    const response = await browser.runtime.sendMessage({ type: 'GET_UPDATE_INFO' })

    if (response?.success && response.hasUpdate && !response.isDismissed) {
      showBanner.value = true
      latestVersion.value = response.latestVersion
      currentVersion.value = response.currentVersion
    }
  } catch (error) {
    // 静默处理错误，background script 可能还未加载
    // console.error('获取更新信息失败:', error)
  }
})

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
</style>
