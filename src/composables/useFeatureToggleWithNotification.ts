/**
 * 功能切换可组合函数（集成通知系统）
 * 提供统一的功能开关逻辑，自动显示通知
 * 基于 useFeatureToggle 扩展，避免代码重复
 */

import { useNotification } from './useNotification'
import { useFeatureToggle, type VueFeatureConfig, type UseFeatureToggleReturn } from './useFeatureToggle'

/**
 * 使用功能切换（集成通知系统）
 * @param config 功能配置
 */
export function useFeatureToggleWithNotification(
  config: VueFeatureConfig,
): UseFeatureToggleReturn {
  const { success, error, warning } = useNotification()

  // 使用基础功能切换，但自定义消息处理逻辑
  const { enabled, toggleFeature: originalToggleFeature, isToggling } = useFeatureToggle(
    config,
    // 自定义消息处理：显示通知
    (text: string, type: 'success' | 'error') => {
      if (type === 'success') {
        success(text, { title: '操作成功' })
      } else {
        error(text, { title: '操作失败' })
      }
    }
  )

  /**
   * 包装切换功能，添加状态变化通知
   */
  const toggleFeatureWithNotification = async (): Promise<void> => {
    const previousValue = enabled.value

    try {
      await originalToggleFeature()

      // 检查状态是否变化，显示相应的通知
      if (enabled.value !== previousValue) {
        const message = enabled.value ? `${config.name} 已启用` : `${config.name} 已禁用`
        const title = enabled.value ? '功能启用' : '功能禁用'
        const type = enabled.value ? 'success' : 'warning'

        if (type === 'success') {
          success(message, { title })
        } else {
          warning(message, { title })
        }
      }
    } catch (err) {
      // 错误通知已在基础函数中处理
      console.error('切换功能失败:', err)
    }
  }

  return {
    enabled,
    toggleFeature: toggleFeatureWithNotification,
    isToggling,
  }
}