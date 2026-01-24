<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleDefaultTime" title="将查询开始时间默认设置为2008-03-13">
      <span>默认时间</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="defaultTimeEnabled" disabled aria-label="默认时间" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import defaultTimeConfig from '@/configs/defaultTime.json'

const defaultTimeEnabled = ref(false)
const emit = defineEmits(['show-message'])
const DEFAULT_TIME_STORAGE_KEY = defaultTimeConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(DEFAULT_TIME_STORAGE_KEY)
    return (result[DEFAULT_TIME_STORAGE_KEY] as boolean | undefined) ?? defaultTimeConfig.defaultEnabled
  } catch (error) {
    console.error('加载默认时间配置失败:', error)
    return defaultTimeConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [DEFAULT_TIME_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存默认时间配置失败:', error)
  }
}

// 切换默认时间功能
const toggleDefaultTime = async () => {
  console.log('toggleDefaultTime 被调用，当前状态:', defaultTimeEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_DEFAULT_TIME',
      })

      if (response.success) {
        defaultTimeEnabled.value = response.enabled
        emit('show-message', defaultTimeEnabled.value ? '默认查询时间已启用' : '默认查询时间已禁用', 'success')
      } else {
        emit('show-message', '切换默认查询时间失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !defaultTimeEnabled.value
      defaultTimeEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', defaultTimeEnabled.value ? '默认查询时间已启用' : '默认查询时间已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !defaultTimeEnabled.value
    defaultTimeEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', defaultTimeEnabled.value ? '默认查询时间已启用' : '默认查询时间已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    defaultTimeEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load default time settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>
