<template>
  <div class="CloudDiskList-update-container">
    <button class="btn-update" @click="updateCloudDiskListData" :disabled="isUpdating">
      {{ isUpdating ? '更新中...' : '更新网盘名单' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

const emit = defineEmits<{
  update: []
}>()

const isUpdating = ref(false)

const { success, error } = useNotification()

// 数据源页面URL
const DATA_SOURCE_URL = 'https://www.52pojie.cn/thread-2094795-1-1.html'

// 更新网盘名单数据
const updateCloudDiskListData = async (): Promise<void> => {
  if (isUpdating.value) return

  isUpdating.value = true

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

    // 显示成功通知
    success('网盘名单数据已更新', { title: '数据更新' })

    // 触发更新事件
    emit('update')
  } catch (err) {
    console.error('更新网盘名单数据失败:', err)
    const message = err instanceof Error ? err.message : '更新失败，请重试'
    error(message, { title: '更新失败' })
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.CloudDiskList-update-container {
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
  min-width: 100px;
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
</style>
