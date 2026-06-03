/**
 * 重复回帖检测工具类
 * 功能：在帖子详情页面检测当天内同一用户的多次回帖，高亮显示重复回帖的楼层
 */

import duplicateReplyDetectionConfig from './config.json'
import { storageHelper } from '@/utils/storageHelper'
import { detectDuplicateReplies, removeHighlights } from './detector'
import { scrollToPostWhenReady } from './scroller'

const STORAGE_KEY = duplicateReplyDetectionConfig.storageKey

/**
 * 重复回帖检测管理器接口
 */
export interface IDuplicateReplyDetection {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建重复回帖检测管理器实例
 */
export function createDuplicateReplyDetection(): IDuplicateReplyDetection {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null
  let observer: MutationObserver | null = null
  let observerTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 注入高亮样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .duplicate-reply-highlight {
        background-color: #fff3cd !important;
      }

      .plc .pi {
        position: relative;
      }

      .duplicate-reply-notice {
        position: absolute;
        right: 2.5rem;
        background-color: lightgreen;
        border-radius: 5px;
        padding: 3px 5px;
        user-select: none;
        font: 13px/1.5 sans-serif;
        font-weight: bold;
      }
    `
    document.head.appendChild(styleElement)
  }

  /**
   * 移除样式
   */
  const removeStyles = (): void => {
    if (styleElement) {
      styleElement.remove()
      styleElement = null
    }
  }

  /**
   * 设置 MutationObserver 监听评分区域变化
   * 评分后 Discuz 局部刷新 ratelog，需要重新检测热心值状态
   */
  const setupObserver = (): void => {
    const postList = document.querySelector('#postlist') ?? document.querySelector('#thread')
    if (!postList) return

    observer = new MutationObserver(() => {
      if (observerTimer) clearTimeout(observerTimer)
      observerTimer = setTimeout(() => {
        removeHighlights()
        detectDuplicateReplies()
      }, 300)
    })

    observer.observe(postList, { childList: true, subtree: true })
  }

  /**
   * 断开 MutationObserver 并清理定时器
   */
  const teardownObserver = (): void => {
    observer?.disconnect()
    observer = null
    if (observerTimer) {
      clearTimeout(observerTimer)
      observerTimer = null
    }
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, duplicateReplyDetectionConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用重复回帖检测功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return

    isEnabled = true
    await saveConfig()
    injectStyles()
    detectDuplicateReplies()
    setupObserver()
  }

  /**
   * 禁用重复回帖检测功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return

    isEnabled = false
    await saveConfig()
    teardownObserver()
    removeStyles()
    removeHighlights()
  }

  /**
   * 切换功能状态
   */
  const toggle = async (): Promise<boolean> => {
    if (isEnabled) {
      await disable()
    } else {
      await enable()
    }
    return isEnabled
  }

  /**
   * 获取当前状态
   */
  const getStatus = (): boolean => isEnabled

  /**
   * 初始化
   */
  const init = async (): Promise<void> => {
    await loadConfig()
    if (isEnabled) {
      injectStyles()
      detectDuplicateReplies()
      setupObserver()
      scrollToPostWhenReady()
    }
  }

  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
  }
}
