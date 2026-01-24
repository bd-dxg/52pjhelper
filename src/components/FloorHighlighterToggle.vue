<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFloorHighlighter" title="根据URL参数高亮指定楼层">
      <span>楼层高亮</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="floorHighlighterEnabled" disabled aria-label="楼层高亮" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import floorHighlighterConfig from '@/configs/floorHighlighter.json'

const floorHighlighterEnabled = ref(false)
const emit = defineEmits(['show-message'])
const FLOOR_HIGHLIGHTER_STORAGE_KEY = floorHighlighterConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(FLOOR_HIGHLIGHTER_STORAGE_KEY)
    return (result[FLOOR_HIGHLIGHTER_STORAGE_KEY] as boolean | undefined) ?? true
  } catch (error) {
    console.error('加载楼层高亮配置失败:', error)
    return true
  }
}

// 保存配置到 storage
const saveConfigToStorage = async (enabled: boolean): Promise<void> => {
  try {
    await browser.storage.local.set({ [FLOOR_HIGHLIGHTER_STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存楼层高亮配置失败:', error)
  }
}

// 切换楼层高亮功能
const toggleFloorHighlighter = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const response = await browser.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_FLOOR_HIGHLIGHTER',
        })

        if (response && response.success) {
          floorHighlighterEnabled.value = response.enabled
          emit('show-message', floorHighlighterEnabled.value ? '楼层高亮已启用' : '楼层高亮已禁用', 'success')
        } else {
          emit('show-message', '切换楼层高亮失败', 'error')
        }
      } catch (error) {
        console.error('Message error:', error)
        emit('show-message', '无法连接到页面，请刷新页面后重试', 'error')
      }
    } else {
      // 非 52pojie.cn 页面，直接修改本地存储
      const newEnabled = !floorHighlighterEnabled.value
      floorHighlighterEnabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
      emit('show-message', floorHighlighterEnabled.value ? '楼层高亮已启用' : '楼层高亮已禁用', 'success')
    }
  } catch (error) {
    // 通信失败时直接修改本地存储
    const newEnabled = !floorHighlighterEnabled.value
    floorHighlighterEnabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
    emit('show-message', floorHighlighterEnabled.value ? '楼层高亮已启用' : '楼层高亮已禁用', 'success')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 首先尝试从 storage 读取配置
    const storedValue = await loadConfigFromStorage()
    floorHighlighterEnabled.value = storedValue

    // 然后尝试从 content script 获取最新状态（如果是 52pojie.cn 页面）
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      try {
        const floorHighlighterResponse = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_FLOOR_HIGHLIGHTER_STATUS',
        })

        if (floorHighlighterResponse && floorHighlighterResponse.success) {
          floorHighlighterEnabled.value = floorHighlighterResponse.enabled
        }
      } catch (error) {
        console.error('Failed to get floor highlighter status from content script:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load floor highlighter settings:', error)
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
