/**
 * 消息通信辅助工具
 * 提供统一的浏览器消息通信接口
 */

import { storageHelper } from './storageHelper'

/**
 * 消息响应类型
 */
export interface MessageResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  enabled?: boolean
  message?: string
}

/**
 * 消息通信辅助工具接口
 */
export interface IMessageHelper {
  /**
   * 检查当前标签页是否为目标网站
   * @param domain 目标域名（默认 52pojie.cn）
   */
  isTargetSite(domain?: string): Promise<boolean>

  /**
   * 向当前标签页发送消息
   * @param type 消息类型
   * @param payload 消息负载
   */
  sendToCurrentTab<T>(type: string, payload?: unknown): Promise<MessageResponse<T>>

  /**
   * 切换功能状态（封装通用逻辑）
   * @param options 切换选项
   */
  toggleFeature(options: {
    messageType: string
    storageKey: string
    currentValue: boolean
    featureName: string
    onSuccess: (enabled: boolean) => void
    onMessage: (text: string, type: 'success' | 'error') => void
  }): Promise<void>
}

/**
 * 创建消息通信辅助工具实例
 */
export function createMessageHelper(): IMessageHelper {
  /**
   * 检查当前标签页是否为目标网站
   */
  const isTargetSite = async (domain = '52pojie.cn'): Promise<boolean> => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      return !!(tab.id && tab.url?.includes(domain))
    } catch (error) {
      console.error('检查目标网站失败:', error)
      return false
    }
  }

  /**
   * 向当前标签页发送消息
   */
  const sendToCurrentTab = async <T>(
    type: string,
    payload?: unknown,
  ): Promise<MessageResponse<T>> => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })

      if (!tab.id) {
        return {
          success: false,
          error: '无法获取当前标签页 ID',
        }
      }

      const response = await browser.tabs.sendMessage(tab.id, {
        type,
        payload,
      })

      return response as MessageResponse<T>
    } catch (error) {
      console.error('发送消息失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }
  }

  /**
   * 切换功能状态（封装通用逻辑）
   */
  const toggleFeature = async (options: {
    messageType: string
    storageKey: string
    currentValue: boolean
    featureName: string
    onSuccess: (enabled: boolean) => void
    onMessage: (text: string, type: 'success' | 'error') => void
  }): Promise<void> => {
    const { messageType, storageKey, currentValue, featureName, onSuccess, onMessage } = options

    try {
      // 检查是否在目标网站
      const isTarget = await isTargetSite()

      if (isTarget) {
        // 在目标网站，尝试与 content script 通信
        const response = await sendToCurrentTab<{ enabled: boolean }>(messageType)

        if (response.success && typeof response.enabled === 'boolean') {
          onSuccess(response.enabled)
          onMessage(
            response.enabled ? `${featureName}已启用` : `${featureName}已禁用`,
            'success',
          )
        } else {
          onMessage(`切换${featureName}失败`, 'error')
        }
      } else {
        // 非目标网站，直接修改本地存储
        const newEnabled = !currentValue
        onSuccess(newEnabled)
        await storageHelper.saveBoolean(storageKey, newEnabled)
        onMessage(newEnabled ? `${featureName}已启用` : `${featureName}已禁用`, 'success')
      }
    } catch (error) {
      // 通信失败时，直接修改本地存储
      console.error(`切换${featureName}失败:`, error)
      const newEnabled = !currentValue
      onSuccess(newEnabled)
      await storageHelper.saveBoolean(storageKey, newEnabled)
      onMessage(newEnabled ? `${featureName}已启用` : `${featureName}已禁用`, 'success')
    }
  }

  return {
    isTargetSite,
    sendToCurrentTab,
    toggleFeature,
  }
}

/**
 * 默认导出单例实例
 */
export const messageHelper = createMessageHelper()
