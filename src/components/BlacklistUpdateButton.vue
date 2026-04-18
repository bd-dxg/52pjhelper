<template>
  <div class="blacklist-update-container">
    <button class="btn-update" @click="updateBlacklistData" :disabled="isUpdating">
      {{ isUpdating ? '更新中...' : '更新黑名单' }}
    </button>
    <!-- 成功消息提示 -->
    <div v-if="showSuccessMessage" class="update-status-message success">
      <span>✓ 黑名单数据已更新</span>
    </div>
    <!-- 错误消息提示 -->
    <div v-else-if="showErrorMessage" class="update-status-message error">
      <span>✗ {{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  update: []
}>()

const isUpdating = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const errorMessage = ref('')

// 数据源页面URL
const DATA_SOURCE_URL = 'https://www.52pojie.cn/thread-2094795-1-1.html'

// 更新黑名单数据
const updateBlacklistData = async (): Promise<void> => {
  if (isUpdating.value) return

  isUpdating.value = true
  showSuccessMessage.value = false
  showErrorMessage.value = false
  errorMessage.value = ''

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

    // 显示成功消息
    showSuccessMessage.value = true

    // 触发更新事件
    emit('update')

    // 3秒后清除成功消息
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    console.error('更新黑名单数据失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '更新失败，请重试'
    showErrorMessage.value = true

    // 5秒后清除错误消息
    setTimeout(() => {
      showErrorMessage.value = false
      errorMessage.value = ''
    }, 5000)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.blacklist-update-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px; /* 减少间隙 */
  min-width: 100px; /* 确保容器有足够宽度 */
}

/* 按钮样式 */
.btn-update {
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  min-width: 90px;
}

.btn-update::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-update:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-update:hover:not(:disabled)::before {
  left: 100%;
}

.btn-update:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.btn-update:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #999 0%, #777 100%);
}

/* 更新状态消息提示 */
.update-status-message {
  position: absolute;
  top: 0;
  padding: 6px;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
  text-align: center;
  width: 100%;
}

.update-status-message span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 成功消息 */
.update-status-message.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

/* 错误消息 */
.update-status-message.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
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
</style>
