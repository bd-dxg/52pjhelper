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
import selectAllConfig from '@/configs/selectAll.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: selectAllConfig.name,
  description: selectAllConfig.description,
  storageKey: selectAllConfig.storageKey,
  defaultEnabled: selectAllConfig.defaultEnabled,
  messageType: 'TOGGLE_SELECT_ALL',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
