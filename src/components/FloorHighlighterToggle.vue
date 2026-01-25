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

const floorHighlighterEnabled = ref(true)
const emit = defineEmits(['show-message'])
const FLOOR_HIGHLIGHTER_STORAGE_KEY = floorHighlighterConfig.storageKey

// 从 storage 读取配置
const loadConfigFromStorage = async (): Promise<boolean> => {
  try {
    const result = await browser.storage.local.get(FLOOR_HIGHLIGHTER_STORAGE_KEY)
    return (result[FLOOR_HIGHLIGHTER_STORAGE_KEY] as boolean | undefined) ?? floorHighlighterConfig.defaultEnabled
  } catch (error) {
    console.error('加载楼层高亮配置失败:', error)
    return floorHighlighterConfig.defaultEnabled
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
    // 只从 storage 读取配置，避免与 content script 通信失败导致的错误
    const storedValue = await loadConfigFromStorage()
    floorHighlighterEnabled.value = storedValue
  } catch (error) {
    console.error('Failed to load floor highlighter settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

