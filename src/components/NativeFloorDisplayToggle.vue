<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleNativeFloorDisplay" title="显示已结帖的原生楼层，方便管理悬赏贴">
      <span>原生楼层</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled aria-label="原生楼层" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 功能状态和加载状态
const enabled = ref(false)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = 'nativeFloorDisplayEnabled'

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    return (result[STORAGE_KEY] as boolean | undefined) ?? true
  } catch (error) {
    console.error('加载原生楼层显示配置失败:', error)
    return true
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存原生楼层显示配置失败:', error)
  }
}

// 切换功能
const toggleNativeFloorDisplay = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_NATIVE_FLOOR_DISPLAY',
      })

      if (response.success) {
        enabled.value = response.enabled
        emit('show-message', enabled.value ? '原生楼层已启用' : '原生楼层已禁用', 'success')
      } else {
        emit('show-message', '切换原生楼层显示失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', enabled.value ? '原生楼层已启用' : '原生楼层已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', enabled.value ? '原生楼层显示已启用' : '原生楼层显示已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    enabled.value = storedValue
  } catch (error) {
    console.error('Failed to load native floor display settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

