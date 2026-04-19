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
import floorHighlighterConfig from '@/configs/floorHighlighter.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: floorHighlighterConfig.name,
  description: floorHighlighterConfig.description,
  storageKey: floorHighlighterConfig.storageKey,
  defaultEnabled: floorHighlighterConfig.defaultEnabled,
  messageType: 'TOGGLE_FLOOR_HIGHLIGHTER',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
