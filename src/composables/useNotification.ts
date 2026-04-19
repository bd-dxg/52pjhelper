import { ref, reactive, computed, onUnmounted } from 'vue'

export interface NotificationAction {
  label: string
  type?: 'primary' | 'secondary' | 'danger'
  handler: () => void
}

export interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info' | 'update'
  title?: string
  duration?: number
  dismissible?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  actions?: NotificationAction[]
}

export interface NotificationItem {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'update'
  title?: string
  duration: number
  dismissible: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  actions: NotificationAction[]
  createdAt: number
}

class NotificationManager {
  private notifications = reactive<NotificationItem[]>([])
  private nextId = 1
  private maxNotifications = 5

  show(message: string, options: NotificationOptions = {}) {
    const notification: NotificationItem = {
      id: this.nextId++,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration ?? 3000,
      dismissible: options.dismissible ?? true,
      position: options.position || 'top-right',
      actions: options.actions || [],
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

  success(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'success' })
  }

  error(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'error' })
  }

  warning(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'warning' })
  }

  info(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'info' })
  }

  update(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, { ...options, type: 'update' })
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

  const show = (message: string, options: NotificationOptions = {}) => {
    return globalNotificationManager.show(message, options)
  }

  const success = (message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return globalNotificationManager.success(message, options)
  }

  const error = (message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return globalNotificationManager.error(message, options)
  }

  const warning = (message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return globalNotificationManager.warning(message, options)
  }

  const info = (message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
    return globalNotificationManager.info(message, options)
  }

  const update = (message: string, options: Omit<NotificationOptions, 'type'> = {}) => {
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
  show: (message: string, options: NotificationOptions = {}) =>
    globalNotificationManager.show(message, options),
  success: (message: string, options: Omit<NotificationOptions, 'type'> = {}) =>
    globalNotificationManager.success(message, options),
  error: (message: string, options: Omit<NotificationOptions, 'type'> = {}) =>
    globalNotificationManager.error(message, options),
  warning: (message: string, options: Omit<NotificationOptions, 'type'> = {}) =>
    globalNotificationManager.warning(message, options),
  info: (message: string, options: Omit<NotificationOptions, 'type'> = {}) =>
    globalNotificationManager.info(message, options),
  update: (message: string, options: Omit<NotificationOptions, 'type'> = {}) =>
    globalNotificationManager.update(message, options),
  remove: (id: number) => globalNotificationManager.remove(id),
  clear: () => globalNotificationManager.clear(),
}