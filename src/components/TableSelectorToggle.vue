<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleTableSelector" title="将分表选择器替换为按钮式界面">
      <span>分表选择</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="tableSelectorEnabled" disabled aria-label="分表选择" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import tableSelectorConfig from '@/configs/tableSelector.json'

const tableSelectorEnabled = ref(true)
const emit = defineEmits(['show-message'])
const TABLE_SELECTOR_STORAGE_KEY = tableSelectorConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(TABLE_SELECTOR_STORAGE_KEY)
    return (result[TABLE_SELECTOR_STORAGE_KEY] as boolean | undefined) ?? tableSelectorConfig.defaultEnabled
  } catch (error) {
    console.error('加载分表选择器配置失败:', error)
    return tableSelectorConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [TABLE_SELECTOR_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存分表选择器配置失败:', error)
  }
}

// 切换分表选择器功能
const toggleTableSelector = async () => {
  console.log('toggleTableSelector 被调用，当前状态:', tableSelectorEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_TABLE_SELECTOR',
      })

      if (response.success) {
        tableSelectorEnabled.value = response.enabled
        emit('show-message', tableSelectorEnabled.value ? '分表选择器已启用' : '分表选择器已禁用', 'success')
      } else {
        emit('show-message', '切换分表选择器失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !tableSelectorEnabled.value
      tableSelectorEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', tableSelectorEnabled.value ? '分表选择器已启用' : '分表选择器已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !tableSelectorEnabled.value
    tableSelectorEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', tableSelectorEnabled.value ? '分表选择器已启用' : '分表选择器已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    tableSelectorEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load table selector settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>
