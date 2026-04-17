<template>
  <div class="blacklist-update-container">
    <button class="blacklist-update-button" @click="updateBlacklistData" :disabled="isUpdating">
      {{ isUpdating ? '更新中...' : '更新黑名单' }}
    </button>
    <div v-if="message" class="blacklist-update-message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  update: []
}>()

const isUpdating = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')

// 数据源页面URL
const DATA_SOURCE_URL = 'https://www.52pojie.cn/thread-2094795-1-1.html'

// 更新黑名单数据
const updateBlacklistData = async (): Promise<void> => {
  if (isUpdating.value) return

  isUpdating.value = true
  message.value = '正在打开数据源页面...'
  messageType.value = ''

  try {
    // 创建新标签页打开数据源页面
    const dataSourceTab = await browser.tabs.create({
      url: DATA_SOURCE_URL,
      active: false, // 在后台打开
    })

    // 等待页面加载完成
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 发送消息给content script提取表格数据
    const extractResponse = await browser.tabs.sendMessage(dataSourceTab.id!, {
      type: 'EXTRACT_TABLE_DATA',
    })

    if (!extractResponse || !extractResponse.success) {
      throw new Error('提取表格数据失败: ' + (extractResponse?.message || '未知错误'))
    }

    // 关闭数据源标签页
    await browser.tabs.remove(dataSourceTab.id!)

    // 直接更新成功，不依赖当前页面
    message.value = '黑名单数据已更新'
    messageType.value = 'success'

    // 触发更新事件
    emit('update')

    // 3秒后清除成功消息
    setTimeout(() => {
      message.value = ''
      messageType.value = ''
    }, 3000)
  } catch (error) {
    console.error('更新黑名单数据失败:', error)
    message.value = error instanceof Error ? error.message : '更新失败，请重试'
    messageType.value = 'error'

    // 5秒后清除错误消息
    setTimeout(() => {
      message.value = ''
      messageType.value = ''
    }, 5000)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.blacklist-update-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blacklist-update-button {
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
  white-space: nowrap; /* 防止文字换行 */
  min-width: 100px; /* 确保按钮有足够宽度 */
}

.blacklist-update-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.blacklist-update-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.blacklist-update-button:hover:not(:disabled)::before {
  left: 100%;
}

.blacklist-update-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.blacklist-update-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #999 0%, #777 100%);
}

.blacklist-update-message {
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  animation: slideIn 0.3s ease-in;
  max-width: 200px;
}

.blacklist-update-message.success {
  background-color: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.blacklist-update-message.error {
  background-color: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
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
</style>