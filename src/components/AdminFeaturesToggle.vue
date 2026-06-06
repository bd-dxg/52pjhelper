<template>
  <div class="features-section">
    <h3 class="section-title">后台管理功能</h3>
    <div class="toggle-grid">
      <AvatarQueryToggle />
      <QuickReplyToggle />
      <AutoFillToggle />
      <SelectAllToggle />
      <TableSelectorToggle />
      <DefaultTimeToggle />
      <UserLinkQueryToggle />
      <RowClickToCheckToggle />
      <DuplicateReplyDetectionToggle />
      <ContentFilterToggle />
      <UserCloudDiskListToggle />
      <PopupQuickReplyToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import AvatarQueryToggle from '@features/avatarQuery/AvatarQueryToggle.vue'
import QuickReplyToggle from '@features/quickReply/QuickReplyToggle.vue'
import AutoFillToggle from '@features/autofills/AutoFillToggle.vue'
import SelectAllToggle from '@features/selectAll/SelectAllToggle.vue'
import TableSelectorToggle from '@features/tableSelector/TableSelectorToggle.vue'
import DefaultTimeToggle from '@features/defaultTime/DefaultTimeToggle.vue'
import UserLinkQueryToggle from '@features/userLinkQuery/UserLinkQueryToggle.vue'
import RowClickToCheckToggle from '@features/rowClickToCheck/RowClickToCheckToggle.vue'
import DuplicateReplyDetectionToggle from '@features/duplicateReplyDetection/DuplicateReplyDetectionToggle.vue'
import ContentFilterToggle from '@features/contentFilter/ContentFilterToggle.vue'
import UserCloudDiskListToggle from '@features/userCloudDiskList/UserCloudDiskListToggle.vue'
import PopupQuickReplyToggle from '@features/popupQuickReply/PopupQuickReplyToggle.vue'

defineOptions({
  name: 'AdminFeaturesToggle',
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
