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
import quickReplyConfig from './config.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: quickReplyConfig.name,
  description: quickReplyConfig.description,
  storageKey: quickReplyConfig.storageKey,
  defaultEnabled: quickReplyConfig.defaultEnabled,
  messageType: 'TOGGLE_QUICK_REPLY',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
