<template>
  <svg :class="['notification-icon-svg', type]" viewBox="0 0 24 24" fill="currentColor">
    <path v-if="type === 'success'" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    <path v-else-if="type === 'error'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    <path v-else-if="type === 'warning'" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    <path v-else-if="type === 'info'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    <path v-else-if="type === 'update'" d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12z" />
  </svg>
</template>

<script setup lang="ts">
import { NOTIFICATION_TYPES, type NotificationType } from '@/constants/notification'

interface Props {
  type: NotificationType
}

const props = withDefaults(defineProps<Props>(), {
  type: NOTIFICATION_TYPES.INFO,
})
</script>

<style scoped>
.notification-icon-svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.notification-icon-svg.success {
  color: var(--success-color, #10b981);
}

.notification-icon-svg.error {
  color: var(--error-color, #ef4444);
}

.notification-icon-svg.warning {
  color: var(--warning-color, #f59e0b);
}

.notification-icon-svg.info {
  color: var(--info-color, #3b82f6);
}

.notification-icon-svg.update {
  color: var(--update-color, #8b5cf6);
}
</style>