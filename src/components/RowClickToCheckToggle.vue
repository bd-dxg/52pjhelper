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
import rowClickToCheckConfig from '@/configs/rowClickToCheck.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: rowClickToCheckConfig.name,
  description: rowClickToCheckConfig.description,
  storageKey: rowClickToCheckConfig.storageKey,
  defaultEnabled: rowClickToCheckConfig.defaultEnabled,
  messageType: 'TOGGLE_ROW_CLICK_TO_CHECK',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
