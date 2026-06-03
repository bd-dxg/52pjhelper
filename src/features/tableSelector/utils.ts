/**
 * 分表选择器工具类
 * 功能：将分表选择器替换为按钮式界面，支持隐藏特定分表
 */

import tableSelectorConfig from './config.json'
import { urlMatcher } from '@/utils/urlMatcher'
import { storageHelper } from '@/utils/storageHelper'
import { injectStyles, removeStyles } from './styles'
import {
  setHiddenTableIndexesValue,
  getHiddenTableIndexesValue,
  initTableSelector,
  removeEventListeners,
  cleanupInjectedContent,
} from './selector'

const STORAGE_KEY = tableSelectorConfig.storageKey
const HIDDEN_TABLE_INDEXES_KEY = tableSelectorConfig.hiddenTableIndexesKey

/**
 * 分表选择器管理器接口
 */
export interface ITableSelector {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
  setHiddenTableIndexes(indexes: number[]): Promise<void>
  getHiddenTableIndexes(): number[]
}

/**
 * 创建分表选择器管理器实例
 */
export function createTableSelector(): ITableSelector {
  let isEnabled = false

  /**
   * 检查是否在管理页面
   */
  const isManagementPage = (): boolean => {
    return urlMatcher.isTargetPage(window.location.href, tableSelectorConfig.targetPages)
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    const result = await storageHelper.loadMultiple([STORAGE_KEY, HIDDEN_TABLE_INDEXES_KEY])
    isEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? tableSelectorConfig.defaultEnabled
    const hiddenTableIndexes =
      (result[HIDDEN_TABLE_INDEXES_KEY] as number[] | undefined) ?? tableSelectorConfig.defaultHiddenTableIndexes
    setHiddenTableIndexesValue(hiddenTableIndexes)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveMultiple({
      [STORAGE_KEY]: isEnabled,
      [HIDDEN_TABLE_INDEXES_KEY]: getHiddenTableIndexesValue(),
    })
  }

  /**
   * 设置隐藏分表索引
   */
  const setHiddenTableIndexes = async (indexes: number[]): Promise<void> => {
    setHiddenTableIndexesValue(indexes)
    await saveConfig()
    if (isEnabled) {
      cleanupInjectedContent()
      await attachEventListeners()
    }
  }

  /**
   * 获取隐藏分表索引
   */
  const getHiddenTableIndexes = (): number[] => getHiddenTableIndexesValue()

  /**
   * 附加事件监听器
   */
  const attachEventListeners = async (): Promise<void> => {
    if (!isManagementPage()) return
    await initTableSelector()
  }

  /**
   * 启用分表选择器功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return

    isEnabled = true
    await saveConfig()
    injectStyles()
    await attachEventListeners()
  }

  /**
   * 禁用分表选择器功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return

    isEnabled = false
    await saveConfig()
    removeStyles()
    removeEventListeners()
    cleanupInjectedContent()
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
      await attachEventListeners()
    }
  }

  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
    setHiddenTableIndexes,
    getHiddenTableIndexes,
  }
}
