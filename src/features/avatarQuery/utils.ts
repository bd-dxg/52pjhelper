/**
 * 头像查询工具类
 * 功能：鼠标移动到头像时显示用户违规记录
 */

import avatarQueryConfig from './config.json'
import { storageHelper } from '@/utils/storageHelper'
import { cleanupPopup } from './popup'
import { attachEventListeners, removeEventListeners } from './observer'

const STORAGE_KEY = avatarQueryConfig.storageKey

/**
 * 头像查询管理器接口
 */
export interface IAvatarQuery {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建头像查询管理器实例
 */
export function createAvatarQuery(): IAvatarQuery {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .p_pop.blk.bui {
        width: 620px !important;
      }
      .avatar-query-popup {
        position: fixed !important;
        width: 632px !important;
        height: auto !important;
        margin: 6px 0 0 -1px;
        padding: 5px 0 10px 5px;
        max-height: 600px !important;
        overflow-y: auto !important;
        background-color: #fdfdfde5 !important;
        backdrop-filter: blur(8px);
        border: 1px solid #ccc !important;
        border-radius: 0 0 5px 5px !important;
        box-shadow: 0 0 10px #0000000a,0 3px 10px #0000002b;
        z-index: 9999 !important;
        display: none !important;
      }
      .avatar-query-popup.show {
        display: block !important;
      }
      .avatar-query-popup table {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed;
      }
      .avatar-query-popup table th,
      .avatar-query-popup table td {
        padding: 5px !important;
        border: 1px solid #e0e0e0 !important;
        text-align: left !important;
        overflow-wrap: break-word;
      }
      .avatar-query-popup table th {
        background-color: #f5f5f5 !important;
        font-weight: bold !important;
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
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, avatarQueryConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用头像查询功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return

    isEnabled = true
    await saveConfig()
    injectStyles()
    attachEventListeners()
  }

  /**
   * 禁用头像查询功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return

    isEnabled = false
    await saveConfig()
    removeStyles()
    removeEventListeners()
    cleanupPopup()
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
      attachEventListeners()
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
