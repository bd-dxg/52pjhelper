<template>
  <div class="features-section">
    <h3 class="section-title">后台管理功能</h3>
    <div class="toggle-grid">
      <AvatarQueryToggle @show-message="handleShowMessage" />
      <QuickReplyToggle @show-message="handleShowMessage" />
      <AutoFillToggle @show-message="handleShowMessage" />
      <SelectAllToggle @show-message="handleShowMessage" />
      <TableSelectorToggle @show-message="handleShowMessage" />
      <DefaultTimeToggle @show-message="handleShowMessage" />
      <UserLinkQueryToggle @show-message="handleShowMessage" />
      <RowClickToCheckToggle @show-message="handleShowMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AvatarQueryToggle from '@com/AvatarQueryToggle.vue'
import QuickReplyToggle from '@com/QuickReplyToggle.vue'
import AutoFillToggle from '@com/AutoFillToggle.vue'
import SelectAllToggle from '@com/SelectAllToggle.vue'
import TableSelectorToggle from '@com/TableSelectorToggle.vue'
import DefaultTimeToggle from '@com/DefaultTimeToggle.vue'
import UserLinkQueryToggle from '@com/UserLinkQueryToggle.vue'
import RowClickToCheckToggle from '@com/RowClickToCheckToggle.vue'

defineOptions({
  name: 'AdminFeaturesToggle',
})

const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()

const handleShowMessage = (text: string, type: 'success' | 'error' = 'success') => {
  emit('show-message', text, type)
}
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
