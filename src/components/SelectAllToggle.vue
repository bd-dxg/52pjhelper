<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleSelectAll" title="在管理页面添加全选按钮">
      <span>全选功能</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="selectAllEnabled" disabled aria-label="全选功能" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import selectAllConfig from '@/configs/selectAll.json'

const selectAllEnabled = ref(selectAllConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const SELECT_ALL_STORAGE_KEY = selectAllConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(SELECT_ALL_STORAGE_KEY)
    return (result[SELECT_ALL_STORAGE_KEY] as boolean | undefined) ?? selectAllConfig.defaultEnabled
  } catch (error) {
    console.error('加载全选功能配置失败:', error)
    return selectAllConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [SELECT_ALL_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存全选功能配置失败:', error)
  }
}

// 切换全选功能
const toggleSelectAll = async () => {
  console.log('toggleSelectAll 被调用，当前状态:', selectAllEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_SELECT_ALL',
      })

      if (response.success) {
        selectAllEnabled.value = response.enabled
        emit('show-message', selectAllEnabled.value ? '全选功能已启用' : '全选功能已禁用', 'success')
      } else {
        emit('show-message', '切换全选功能失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !selectAllEnabled.value
      selectAllEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', selectAllEnabled.value ? '全选功能已启用' : '全选功能已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !selectAllEnabled.value
    selectAllEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', selectAllEnabled.value ? '全选功能已启用' : '全选功能已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    selectAllEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load select all settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>