<template>
  <div class="notification-container">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :type="notification.type"
      :message="notification.message"
      :title="notification.title"
      :duration="notification.duration"
      :dismissible="notification.dismissible"
      :position="notification.position"
      :actions="notification.actions"
      @dismiss="() => remove(notification.id)"
      @action="(action) => handleAction(notification.id, action)"
    />
  </div>
</template>

<script setup lang="ts">
import Notification from '@com/Notification.vue'
import { useNotification } from '@/composables/useNotification'

const { notifications, remove } = useNotification()

const handleAction = (notificationId: number, action: any) => {
  // 执行动作后自动移除通知
  remove(notificationId)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9998;
}

.notification-container > * {
  pointer-events: auto;
}
</style>