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
import driveSockPuppetConfig from './config.json'
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'

const config = {
  name: driveSockPuppetConfig.name,
  description: driveSockPuppetConfig.description,
  storageKey: driveSockPuppetConfig.storageKey,
  defaultEnabled: driveSockPuppetConfig.defaultEnabled,
  messageType: 'TOGGLE_DRIVE_SOCK_PUPPET',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
