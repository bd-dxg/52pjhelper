<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="featureConfig.description">
      <span>{{ featureConfig.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled :aria-label="featureConfig.name" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import featureConfig from '@/configs/rowClickToCheck.json'

const enabled = ref(featureConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = featureConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? featureConfig.defaultEnabled
})

const toggleFeature = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_ROW_CLICK_TO_CHECK' })
      if (response?.success) {
        enabled.value = response.enabled
        emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
      } else {
        emit('show-message', '切换功能失败', 'error')
      }
    } else {
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
      emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
    }
  } catch (error) {
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
    emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
  }
}
</script>