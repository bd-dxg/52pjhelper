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
import userBlacklistConfig from '@/configs/userBlacklist.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'

const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()

const config = {
  name: userBlacklistConfig.name,
  description: userBlacklistConfig.description,
  storageKey: userBlacklistConfig.storageKey,
  defaultEnabled: userBlacklistConfig.defaultEnabled,
  messageType: 'TOGGLE_USER_BLACKLIST',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggle(config, (text, type) => {
  emit('show-message', text, type)
})

</script>

<style scoped src="@/styles/toggle.css"></style>