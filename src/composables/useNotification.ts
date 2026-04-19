import { ref, reactive, computed, onUnmounted } from 'vue'
import {
  type NotificationAction,
  type NotificationOptions,
  type NotificationItem,
  NOTIFICATION_TYPES,
  NOTIFICATION_POSITIONS,
  DEFAULT_NOTIFICATION_CONFIG,
  DEFAULT_NOTIFICATION_TYPE_CONFIGS,
} from '@/constants/notification'

class NotificationManager {
  private notifications = reactive<NotificationItem[]>([])
  private nextId = 1
  private maxNotifications = 5

  show(message: string, options: Omit<NotificationOptions, 'message'> = {}) {
    const type = options.type || NOTIFICATION_TYPES.INFO
    const typeConfig = DEFAULT_NOTIFICATION_TYPE_CONFIGS[type]

    const notification: NotificationItem = {
      id: this.nextId++,
      message,
      type,
      title: options.title,
      duration: options.duration ?? typeConfig.duration ?? DEFAULT_NOTIFICATION_CONFIG.duration,
      dismissible: options.dismissible ?? typeConfig.dismissible ?? DEFAULT_NOTIFICATION_CONFIG.dismissible,
      position: options.position ?? DEFAULT_NOTIFICATION_CONFIG.position,
      actions: options.actions ?? DEFAULT_NOTIFICATION_CONFIG.actions,
      createdAt: Date.now(),
    }

    // 添加到通知列表
    this.notifications.push(notification)

    // 限制最大通知数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift()
    }

    // 设置自动移除
    if (notification.duration > 0) {
      setTimeout(() => {
        this.remove(notification.id)
      }, notification.duration)
    }

    return notification.id
  }

  success(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.SUCCESS })
  }

  error(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.ERROR })
  }

  warning(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.WARNING })
  }

  info(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.INFO })
  }

  update(message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) {
    return this.show(message, { ...options, type: NOTIFICATION_TYPES.UPDATE })
  }

  remove(id: number) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications.splice(index, 1)
    }
  }

  clear() {
    this.notifications.splice(0, this.notifications.length)
  }

  getNotifications() {
    return this.notifications
  }

  getNotificationCount() {
    return this.notifications.length
  }
}

// 全局通知管理器实例
const globalNotificationManager = new NotificationManager()

export function useNotification() {
  const notifications = computed(() => globalNotificationManager.getNotifications())
  const notificationCount = computed(() => globalNotificationManager.getNotificationCount())

  const show = (message: string, options: Omit<NotificationOptions, 'message'> = {}) => {
    return globalNotificationManager.show(message, options)
  }

  const success = (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) => {
    return globalNotificationManager.success(message, options)
  }

  const error = (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) => {
    return globalNotificationManager.error(message, options)
  }

  const warning = (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) => {
    return globalNotificationManager.warning(message, options)
  }

  const info = (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) => {
    return globalNotificationManager.info(message, options)
  }

  const update = (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) => {
    return globalNotificationManager.update(message, options)
  }

  const remove = (id: number) => {
    globalNotificationManager.remove(id)
  }

  const clear = () => {
    globalNotificationManager.clear()
  }

  return {
    notifications,
    notificationCount,
    show,
    success,
    error,
    warning,
    info,
    update,
    remove,
    clear,
  }
}

// 快捷函数，用于在非组件上下文中使用
export const notification = {
  show: (message: string, options: Omit<NotificationOptions, 'message'> = {}) =>
    globalNotificationManager.show(message, options),
  success: (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) =>
    globalNotificationManager.success(message, options),
  error: (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) =>
    globalNotificationManager.error(message, options),
  warning: (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) =>
    globalNotificationManager.warning(message, options),
  info: (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) =>
    globalNotificationManager.info(message, options),
  update: (message: string, options: Omit<NotificationOptions, 'type' | 'message'> = {}) =>
    globalNotificationManager.update(message, options),
  remove: (id: number) => globalNotificationManager.remove(id),
  clear: () => globalNotificationManager.clear(),
}