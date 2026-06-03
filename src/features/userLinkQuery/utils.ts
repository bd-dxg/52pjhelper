/**
 * 用户链接查询工具类
 * 功能：在管理页面鼠标移动到用户名链接时显示用户违规记录（悬浮形式）
 */

import userLinkQueryConfig from './config.json'
import { urlMatcher } from '@/utils/urlMatcher'
import { storageHelper } from '@/utils/storageHelper'
import { injectStyles, removeStyles } from './styles'
import { createPopup, removePopup, clearHideTimeout } from './popup'
import {
  setIsTargetPageFn,
  setAttachFn,
  attachEventListeners,
  removeEventListeners,
  setupPageChangeListener,
  removePageChangeListener,
  setupLoadListener,
  removeLoadListener,
} from './events'

const STORAGE_KEY = userLinkQueryConfig.storageKey

/**
 * 用户链接查询管理器接口
 */
export interface IUserLinkQuery {
  enable(): void
  disable(): void
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建用户链接查询管理器实例
 */
export function createUserLinkQuery(): IUserLinkQuery {
  let isEnabled = false

  /**
   * 检查是否在目标页面
   */
  const isTargetPage = (): boolean => {
    return urlMatcher.isTargetPage(window.location.href, userLinkQueryConfig.targetPages)
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    const storedValue = await storageHelper.loadBoolean(STORAGE_KEY, userLinkQueryConfig.defaultEnabled)
    isEnabled = storedValue
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用用户链接查询功能
   */
  const enable = (): void => {
    const wasEnabled = isEnabled
    isEnabled = true

    if (!wasEnabled) {
      void saveConfig()
    }

    injectStyles()
    createPopup()

    const isTargetPageNow = isTargetPage()

    if (isTargetPageNow) {
      attachEventListeners()
      setupLoadListener()
    } else {
      setupPageChangeListener()
    }
  }

  /**
   * 禁用用户链接查询功能
   */
  const disable = (): void => {
    if (!isEnabled) return

    isEnabled = false

    clearHideTimeout()
    removeLoadListener()
    void saveConfig()
    removeStyles()
    removeEventListeners()
    removePopup()
    removePageChangeListener()
  }

  /**
   * 切换功能状态
   */
  const toggle = async (): Promise<boolean> => {
    if (isEnabled) {
      disable()
    } else {
      enable()
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
    setIsTargetPageFn(isTargetPage)
    setAttachFn(attachEventListeners)

    await loadConfig()
    if (isEnabled) {
      enable()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
  }
}
