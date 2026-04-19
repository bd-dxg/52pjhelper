<template>
  <transition name="notification">
    <div
      v-if="visible"
      class="notification"
      :class="[type, position, { 'with-action': hasAction }]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="notification-content">
        <div class="notification-icon">
          <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <svg v-else-if="type === 'info'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          <svg v-else-if="type === 'update'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79 2.73 2.71 7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58 3.51-3.47 9.14-3.47 12.65 0L21 3v7.12z" />
          </svg>
        </div>
        <div class="notification-body">
          <div class="notification-title" v-if="title">{{ title }}</div>
          <div class="notification-message">{{ message }}</div>
        </div>
      </div>
      <div class="notification-actions" v-if="hasAction">
        <button
          v-for="(action, index) in actions"
          :key="index"
          class="notification-action"
          :class="action.type"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </button>
      </div>
      <button v-if="dismissible" class="notification-close" @click="dismiss" aria-label="关闭通知">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface NotificationAction {
  label: string
  type?: 'primary' | 'secondary' | 'danger'
  handler: () => void
}

export interface NotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'update'
  message: string
  title?: string
  duration?: number // 自动消失时间（毫秒），0 表示不自动消失
  dismissible?: boolean // 是否可手动关闭
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  actions?: NotificationAction[]
}

const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info',
  duration: 3000,
  dismissible: true,
  position: 'top-right',
  actions: () => [],
})

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'action', action: NotificationAction): void
}>()

const visible = ref(false)
let timeoutId: number | null = null

const hasAction = computed(() => props.actions.length > 0)

const show = () => {
  visible.value = true

  // 清除之前的定时器
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }

  // 设置自动消失
  if (props.duration > 0) {
    timeoutId = window.setTimeout(() => {
      dismiss()
    }, props.duration)
  }
}

const dismiss = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('dismiss')
}

const handleAction = (action: NotificationAction) => {
  action.handler()
  emit('action', action)
}

// 监听 message 变化，自动显示新通知
watch(() => props.message, (newMessage) => {
  if (newMessage) {
    show()
  }
}, { immediate: true })

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

defineExpose({
  show,
  dismiss,
})
</script>

<style scoped>
.notification {
  position: fixed;
  z-index: 9999;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

.notification.top-right {
  top: 20px;
  right: 20px;
}

.notification.top-left {
  top: 20px;
  left: 20px;
}

.notification.bottom-right {
  bottom: 20px;
  right: 20px;
}

.notification.bottom-left {
  bottom: 20px;
  left: 20px;
}

.notification.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.notification.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border-left: 4px solid #2e7d32;
}

.notification.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  border-left: 4px solid #c62828;
}

.notification.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border-left: 4px solid #ef6c00;
}

.notification.info {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border-left: 4px solid #1565c0;
}

.notification.update {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
  border-left: 4px solid #6a1b9a;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon svg {
  width: 100%;
  height: 100%;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  line-height: 1.4;
}

.notification.with-action {
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.notification-action {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.notification-action:hover {
  background: rgba(255, 255, 255, 0.3);
}

.notification-action.primary {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.notification-action.danger {
  background: rgba(255, 0, 0, 0.2);
}

.notification-action.danger:hover {
  background: rgba(255, 0, 0, 0.3);
}

.notification-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  opacity: 1;
}

.notification-close svg {
  width: 16px;
  height: 16px;
}

/* 动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>