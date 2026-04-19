/**
 * 通知系统常量定义
 * 统一管理通知相关的类型、常量、配置
 */

// 通知类型常量
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  UPDATE: 'update',
} as const

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

// 通知位置常量
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  CENTER: 'center',
} as const

export type NotificationPosition = typeof NOTIFICATION_POSITIONS[keyof typeof NOTIFICATION_POSITIONS]

// 动作类型常量
export const ACTION_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
} as const

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES]

// 通知动作接口
export interface NotificationAction {
  label: string
  type?: ActionType
  handler: () => void
}

// 通知基础配置接口
export interface NotificationBase {
  type: NotificationType
  title?: string
  duration: number
  dismissible: boolean
  position: NotificationPosition
  actions: NotificationAction[]
}

// 通知选项接口（用于创建通知）
export interface NotificationOptions extends Partial<NotificationBase> {
  message: string
}

// 通知项接口（用于内部存储）
export interface NotificationItem extends NotificationBase {
  id: number
  message: string
  createdAt: number
}

// 默认配置
export const DEFAULT_NOTIFICATION_CONFIG: Omit<NotificationBase, 'type'> = {
  duration: 3000,
  dismissible: true,
  position: NOTIFICATION_POSITIONS.TOP_RIGHT,
  actions: [],
}

// 默认通知类型配置
export const DEFAULT_NOTIFICATION_TYPE_CONFIGS: Record<NotificationType, Partial<NotificationBase>> = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    duration: 3000,
    dismissible: true,
  },
  [NOTIFICATION_TYPES.ERROR]: {
    duration: 5000,
    dismissible: false,
  },
  [NOTIFICATION_TYPES.WARNING]: {
    duration: 4000,
    dismissible: true,
  },
  [NOTIFICATION_TYPES.INFO]: {
    duration: 3000,
    dismissible: true,
  },
  [NOTIFICATION_TYPES.UPDATE]: {
    duration: 5000,
    dismissible: false,
  },
}