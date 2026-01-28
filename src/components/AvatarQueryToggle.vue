<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleAvatarQuery" title="鼠标移入头像显示用户违规记录">
      <span>头像查询</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="avatarQueryEnabled" disabled aria-label="头像查询" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import avatarQueryConfig from '@/configs/avatarQuery.json'

const avatarQueryEnabled = ref(avatarQueryConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const AVATAR_QUERY_STORAGE_KEY = avatarQueryConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(AVATAR_QUERY_STORAGE_KEY)
    return (result[AVATAR_QUERY_STORAGE_KEY] as boolean | undefined) ?? avatarQueryConfig.defaultEnabled
  } catch (error) {
    console.error('加载头像查询配置失败:', error)
    return avatarQueryConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [AVATAR_QUERY_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存头像查询配置失败:', error)
  }
}

// 切换头像查询功能
const toggleAvatarQuery = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_AVATAR_QUERY',
      })

      if (response.success) {
        avatarQueryEnabled.value = response.enabled
        emit('show-message', avatarQueryEnabled.value ? '头像查询已启用' : '头像查询已禁用', 'success')
      } else {
        emit('show-message', '切换头像查询失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !avatarQueryEnabled.value
      avatarQueryEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', avatarQueryEnabled.value ? '头像查询已启用' : '头像查询已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !avatarQueryEnabled.value
    avatarQueryEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', avatarQueryEnabled.value ? '头像查询已启用' : '头像查询已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    avatarQueryEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load avatar query settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

<style scoped src="@/styles/toggle.css"></style>
