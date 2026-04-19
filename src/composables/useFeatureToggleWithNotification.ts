/**
 * 功能切换可组合函数（集成通知系统）
 * 提供统一的功能开关逻辑，自动显示通知
 */

import type { Ref } from 'vue'
import { messageHelper } from '@utils/messageHelper'
import { storageHelper } from '@utils/storageHelper'
import { useNotification } from './useNotification'
import type { VueFeatureConfig, UseFeatureToggleReturn } from './useFeatureToggle'

/**
 * 使用功能切换（集成通知系统）
 * @param config 功能配置
 */
export function useFeatureToggleWithNotification(
  config: VueFeatureConfig,
): UseFeatureToggleReturn {
  const enabled = ref(config.defaultEnabled)
  const isToggling = ref(false)
  const lastClickTime = ref(0)
  const DEBOUNCE_DELAY = 1000

  const { success, error, warning } = useNotification()

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
          // 显示通知：启用用绿色，禁用用橙色
          if (newEnabled) {
            success(`${config.name} 已启用`, { title: '功能启用' })
          } else {
            warning(`${config.name} 已禁用`, { title: '功能禁用' })
          }
        },
        onMessage: (text: string, type: 'success' | 'error') => {
          // 忽略 onMessage，因为我们已经通过 onSuccess 显示了正确颜色的通知
          // 保留这个回调只是为了兼容性
        },
      })
    } catch (err) {
      // 显示错误通知
      error('切换功能失败，请重试', { title: '操作失败' })
      console.error('切换功能失败:', err)
    } finally {
      // 确保在操作完成后重置状态
      isToggling.value = false
    }
  }

  // 组件挂载时加载配置
  onMounted(async () => {
    try {
      await loadConfigFromStorage()
    } catch (err) {
      error('加载功能配置失败', { title: '加载失败' })
      console.error('加载功能配置失败:', err)
    }
  })

  return {
    enabled,
    toggleFeature,
    isToggling,
  }
}