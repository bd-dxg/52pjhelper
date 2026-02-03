/**
 * 功能切换可组合函数
 * 提供统一的功能开关逻辑
 */

import type { Ref } from 'vue'
import { messageHelper } from '@utils/messageHelper'
import { storageHelper } from '@utils/storageHelper'

/**
 * Vue 组件功能配置接口
 */
export interface VueFeatureConfig {
  /** 功能名称 */
  name: string
  /** 功能描述 */
  description: string
  /** 存储键 */
  storageKey: string
  /** 默认启用状态 */
  defaultEnabled: boolean
  /** 消息类型（用于与 content script 通信） */
  messageType: string
}

/**
 * 功能切换返回值接口
 */
export interface UseFeatureToggleReturn {
  /** 功能启用状态 */
  enabled: Ref<boolean>
  /** 切换功能 */
  toggleFeature: () => Promise<void>
  /** 是否正在切换 */
  isToggling: Ref<boolean>
}

/**
 * 使用功能切换
 * @param config 功能配置
 * @param onMessage 消息回调函数
 */
export function useFeatureToggle(
  config: VueFeatureConfig,
  onMessage: (text: string, type: 'success' | 'error') => void,
): UseFeatureToggleReturn {
  const enabled = ref(config.defaultEnabled)
  const isToggling = ref(false) // 添加防抖标志
  const lastClickTime = ref(0) // 记录上次点击时间
  const DEBOUNCE_DELAY = 1000 // 防抖延迟时间（1秒）

  /**
   * 从存储加载配置
   */
  const loadConfigFromStorage = async (): Promise<void> => {
    enabled.value = await storageHelper.loadBoolean(config.storageKey, config.defaultEnabled)
  }

  /**
   * 切换功能
   */
  const toggleFeature = async (): Promise<void> => {
    const currentTime = Date.now()

    // 防抖检查
    if (isToggling.value || currentTime - lastClickTime.value < DEBOUNCE_DELAY) {
      return
    }

    isToggling.value = true
    lastClickTime.value = currentTime

    try {
      await messageHelper.toggleFeature({
        messageType: config.messageType,
        storageKey: config.storageKey,
        currentValue: enabled.value,
        featureName: config.name,
        onSuccess: (newEnabled: boolean) => {
          enabled.value = newEnabled
        },
        onMessage,
      })
    } finally {
      // 确保在操作完成后重置状态
      isToggling.value = false
    }
  }

  // 组件挂载时加载配置
  onMounted(async () => {
    try {
      await loadConfigFromStorage()
    } catch (error) {
      console.error('加载功能配置失败:', error)
      // 使用默认值，已在 loadConfigFromStorage 中处理
    }
  })

  return {
    enabled,
    toggleFeature,
    isToggling,
  }
}
