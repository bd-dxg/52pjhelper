<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="config.description">
      <span>{{ config.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" @click.stop :aria-label="config.name" :disabled="isToggling" />
        <span class="slider"></span>
      </div>
    </label>
    <div class="feature-actions" v-if="enabled">
      <button class="action-button" @click.stop="updateData" :disabled="isUpdating" :title="updateButtonTitle">
        {{ updateButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import userBlacklistConfig from '@/configs/userBlacklist.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()

const config = {
  name: userBlacklistConfig.name,
  description: userBlacklistConfig.description,
  storageKey: userBlacklistConfig.storageKey,
  defaultEnabled: userBlacklistConfig.defaultEnabled,
  messageType: 'TOGGLE_USER_BLACKLIST',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggle(config, (text, type) => {
  emit('show-message', text, type)
})

// 数据更新相关状态
const isUpdating = ref(false)
const lastUpdateTime = ref<number | null>(null)

// 计算属性
const updateButtonText = computed(() => {
  return isUpdating.value ? '更新中...' : '更新数据'
})

const updateButtonTitle = computed(() => {
  if (lastUpdateTime.value) {
    const date = new Date(lastUpdateTime.value)
    return `最后更新: ${date.toLocaleString()}`
  }
  return '手动更新黑名单数据'
})

// 手动更新数据
const updateData = async (): Promise<void> => {
  if (isUpdating.value) return

  isUpdating.value = true
  try {
    // 这里应该调用API或从服务器获取最新数据
    // 目前先模拟一个成功更新
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟网络请求

    lastUpdateTime.value = Date.now()
    emit('show-message', '黑名单数据已更新', 'success')
  } catch (error) {
    console.error('更新黑名单数据失败:', error)
    emit('show-message', '更新失败，请重试', 'error')
  } finally {
    isUpdating.value = false
  }
}

// 组件挂载时加载最后更新时间
import { storageHelper } from '@/utils/storageHelper'
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    lastUpdateTime.value = await storageHelper.loadNumber(
      userBlacklistConfig.lastUpdateKey,
      0
    )
  } catch (error) {
    console.error('加载最后更新时间失败:', error)
  }
})
</script>

<style scoped>
.toggle-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-actions {
  margin-left: 10px;
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>