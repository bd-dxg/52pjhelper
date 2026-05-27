<template>
  <div class="features-section">
    <h3 class="section-title">通用功能</h3>
    <div class="toggle-grid">
      <FloorHighlighterToggle />
      <NativeFloorDisplayToggle />
      <!-- <DuplicatePostDetectionToggle /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import FloorHighlighterToggle from '@features/floorHighlighter/FloorHighlighterToggle.vue'
import NativeFloorDisplayToggle from '@features/nativeFloorDisplay/NativeFloorDisplayToggle.vue'
// import DuplicatePostDetectionToggle from '@features/duplicatePostDetection/DuplicatePostDetectionToggle.vue'

defineOptions({
  name: 'GeneralFeaturesToggle',
})
</script>

<style scoped>
.features-section {
  margin-bottom: 16px; /* 从 24px 减少到 16px */
}

.section-title {
  font-size: 14px; /* 从 16px 减少到 14px */
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0; /* 从 16px 减少到 12px */
  padding-bottom: 6px; /* 从 8px 减少到 6px */
  border-bottom: 2px solid var(--border-color);
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px; /* 从 16px 减少到 12px */
}
</style>
