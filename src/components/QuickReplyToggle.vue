<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleQuickReply" title="举报处理页面添加快捷回复短语">
      <span>快捷回复</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="quickReplyEnabled" disabled aria-label="快捷回复" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import quickReplyConfig from '@/configs/quickReply.json'

const quickReplyEnabled = ref(true)
const emit = defineEmits(['show-message'])
const QUICK_REPLY_STORAGE_KEY = quickReplyConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(QUICK_REPLY_STORAGE_KEY)
    return (result[QUICK_REPLY_STORAGE_KEY] as boolean | undefined) ?? quickReplyConfig.defaultEnabled
  } catch (error) {
    console.error('加载快捷回复配置失败:', error)
    return quickReplyConfig.defaultEnabled
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [QUICK_REPLY_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存快捷回复配置失败:', error)
  }
}

// 切换快捷回复功能
const toggleQuickReply = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_QUICK_REPLY',
        })

        if (response && response.success) {
          quickReplyEnabled.value = response.enabled
          emit('show-message', quickReplyEnabled.value ? '快捷回复已启用' : '快捷回复已禁用', 'success')
        } else {
          emit('show-message', '切换快捷回复失败', 'error')
        }
      } catch (error) {
        console.error('Message error:', error)
        emit('show-message', '无法连接到页面，请刷新页面后重试', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !quickReplyEnabled.value
      quickReplyEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', quickReplyEnabled.value ? '快捷回复已启用' : '快捷回复已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !quickReplyEnabled.value
    quickReplyEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', quickReplyEnabled.value ? '快捷回复已启用' : '快捷回复已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    quickReplyEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load quick reply settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

