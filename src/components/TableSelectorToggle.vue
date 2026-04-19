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
import tableSelectorConfig from '@/configs/tableSelector.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: tableSelectorConfig.name,
  description: tableSelectorConfig.description,
  storageKey: tableSelectorConfig.storageKey,
  defaultEnabled: tableSelectorConfig.defaultEnabled,
  messageType: 'TOGGLE_TABLE_SELECTOR',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
