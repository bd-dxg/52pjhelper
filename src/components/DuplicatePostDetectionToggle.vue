<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleDuplicatePostDetection" :title="duplicatePostDetectionConfig.description">
      <span>{{ duplicatePostDetectionConfig.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="duplicatePostDetectionEnabled" disabled :aria-label="duplicatePostDetectionConfig.name" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import duplicatePostDetectionConfig from '@/configs/duplicatePostDetection.json'

const duplicatePostDetectionEnabled = ref(duplicatePostDetectionConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const DUPLICATE_POST_DETECTION_STORAGE_KEY = duplicatePostDetectionConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(DUPLICATE_POST_DETECTION_STORAGE_KEY)
    return (result[DUPLICATE_POST_DETECTION_STORAGE_KEY] as boolean | undefined) ?? duplicatePostDetectionConfig.defaultEnabled
  } catch (error) {
    console.error('加载重复发帖检测配置失败:', error)
    return duplicatePostDetectionConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [DUPLICATE_POST_DETECTION_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存重复发帖检测配置失败:', error)
  }
}

// 切换重复发帖检测功能
const toggleDuplicatePostDetection = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_DUPLICATE_POST_DETECTION',
      })

      if (response.success) {
        duplicatePostDetectionEnabled.value = response.enabled
        emit('show-message', duplicatePostDetectionEnabled.value ? '重复发帖检测已启用' : '重复发帖检测已禁用', 'success')
      } else {
        emit('show-message', '切换重复发帖检测失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !duplicatePostDetectionEnabled.value
      duplicatePostDetectionEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', duplicatePostDetectionEnabled.value ? '重复发帖检测已启用' : '重复发帖检测已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !duplicatePostDetectionEnabled.value
    duplicatePostDetectionEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', duplicatePostDetectionEnabled.value ? '重复发帖检测已启用' : '重复发帖检测已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    duplicatePostDetectionEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load duplicate post detection settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>