<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleUserLinkQuery" title="在审核页面鼠标移入用户名链接显示用户违规记录">
      <span>审核查询</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="userLinkQueryEnabled" disabled aria-label="审核查询" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import userLinkQueryConfig from '@/configs/userLinkQuery.json'

const userLinkQueryEnabled = ref(userLinkQueryConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const USER_LINK_QUERY_STORAGE_KEY = userLinkQueryConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(USER_LINK_QUERY_STORAGE_KEY)
    return (result[USER_LINK_QUERY_STORAGE_KEY] as boolean | undefined) ?? userLinkQueryConfig.defaultEnabled
  } catch (error) {
    console.error('加载用户链接查询配置失败:', error)
    return userLinkQueryConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [USER_LINK_QUERY_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存用户链接查询配置失败:', error)
  }
}

// 切换用户链接查询功能
const toggleUserLinkQuery = async () => {
  console.log('toggleUserLinkQuery 被调用，当前状态:', userLinkQueryEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_USER_LINK_QUERY',
      })

      if (response.success) {
        userLinkQueryEnabled.value = response.enabled
        emit('show-message', userLinkQueryEnabled.value ? '管理页面查询已启用' : '管理页面查询已禁用', 'success')
      } else {
        emit('show-message', '切换管理页面查询失败', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !userLinkQueryEnabled.value
      userLinkQueryEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', userLinkQueryEnabled.value ? '管理页面查询已启用' : '管理页面查询已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !userLinkQueryEnabled.value
    userLinkQueryEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', userLinkQueryEnabled.value ? '管理页面查询已启用' : '管理页面查询已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    userLinkQueryEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load user link query settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

<style scoped src="@/styles/toggle.css"></style>
