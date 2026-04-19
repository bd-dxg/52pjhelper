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
import duplicatePostDetectionConfig from '@/configs/duplicatePostDetection.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'


const config = {
  name: duplicatePostDetectionConfig.name,
  description: duplicatePostDetectionConfig.description,
  storageKey: duplicatePostDetectionConfig.storageKey,
  defaultEnabled: duplicatePostDetectionConfig.defaultEnabled,
  messageType: 'TOGGLE_DUPLICATE_POST_DETECTION',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>

<style scoped src="@/styles/toggle.css"></style>
