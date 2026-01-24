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

const quickReplyEnabled = ref(false)
const emit = defineEmits(['show-message'])
const QUICK_REPLY_STORAGE_KEY = quickReplyConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(QUICK_REPLY_STORAGE_KEY)
    return (result[QUICK_REPLY_STORAGE_KEY] as boolean | undefined) ?? false
  } catch (error) {
    console.error('加载快捷回复配置失败:', error)
    return false
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
    // 首先尝试从 storage 读取配置
    const storedValue = await loadConfigFromStorage()
    quickReplyEnabled.value = storedValue

    // 然后尝试从 content script 获取最新状态（如果是 52pojie.cn 页面）
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const quickReplyResponse = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_QUICK_REPLY_STATUS',
        })

        if (quickReplyResponse && quickReplyResponse.success) {
          quickReplyEnabled.value = quickReplyResponse.enabled
        }
      } catch (error) {
        console.error('Failed to get quick reply status from content script:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load quick reply settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

<style scoped>
.toggle-container {
  margin-bottom: 12px;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.toggle-label:hover {
  background-color: var(--bg-hover);
}

.toggle-label span {
  font-size: 14px;
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-bg);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
