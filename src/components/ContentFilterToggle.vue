<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="config.description">
      <span>{{ config.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" @click.stop :aria-label="config.name" :disabled="isToggling" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import contentFilterConfig from '@/configs/contentFilter.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'

const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()

const config = {
  name: contentFilterConfig.name,
  description: contentFilterConfig.description,
  storageKey: contentFilterConfig.storageKey,
  defaultEnabled: contentFilterConfig.defaultEnabled,
  messageType: 'TOGGLE_CONTENT_FILTER',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggle(config, (text, type) => {
  emit('show-message', text, type)
})
</script>

<style scoped src="@/styles/toggle.css"></style>
