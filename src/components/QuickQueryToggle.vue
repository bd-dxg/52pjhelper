<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleQuickQuery" title="鼠标移入头像显示用户违规记录">
      <span>便捷查询</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="quickQueryEnabled" disabled aria-label="便捷查询" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import quickQueryConfig from '@/configs/quickQuery.json'

const quickQueryEnabled = ref(true)
const emit = defineEmits(['show-message'])
const QUICK_QUERY_STORAGE_KEY = quickQueryConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(QUICK_QUERY_STORAGE_KEY)
    return (result[QUICK_QUERY_STORAGE_KEY] as boolean | undefined) ?? quickQueryConfig.defaultEnabled
  } catch (error) {
    console.error('加载便捷查询配置失败:', error)
    return quickQueryConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [QUICK_QUERY_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存便捷查询配置失败:', error)
  }
}

// 切换便捷查询功能
const toggleQuickQuery = async () => {
  console.log('toggleQuickQuery 被调用，当前状态:', quickQueryEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_QUICK_QUERY',
      })

      if (response.success) {
        quickQueryEnabled.value = response.enabled
        emit('show-message', quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用', 'success')
      } else {
        emit('show-message', '切换便捷查询失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !quickQueryEnabled.value
      quickQueryEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !quickQueryEnabled.value
    quickQueryEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    quickQueryEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load quick query settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

