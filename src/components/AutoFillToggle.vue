<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleAutoFill" title="监控评分表单，当满足条件时自动填充回复内容">
      <span>自动填充</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled aria-label="自动填充" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import autoFillConfig from '@/configs/autoFill.json'

const enabled = ref(autoFillConfig.defaultEnabled)
const STORAGE_KEY = autoFillConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? autoFillConfig.defaultEnabled
})

const toggleAutoFill = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_AUTO_FILL' })
      if (response?.success) {
        enabled.value = response.enabled
      }
    } else {
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
    }
  } catch (error) {
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
  }
}
</script>
