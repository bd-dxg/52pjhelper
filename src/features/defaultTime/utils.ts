/**
 * 默认时间工具类
 * 功能：将查询开始时间默认设置为2008-03-13
 */

import defaultTimeConfig from './config.json'
import { urlMatcher } from '@/utils/urlMatcher'
import { storageHelper } from '@/utils/storageHelper'

const STORAGE_KEY = defaultTimeConfig.storageKey
const START_TIME_KEY = defaultTimeConfig.startTimeKey

/**
 * 默认时间管理器接口
 */
export interface IDefaultTime {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
  setStartTime(time: string): Promise<void>
  getStartTime(): string
}

/**
 * 创建默认时间管理器实例
 */
export function createDefaultTime(): IDefaultTime {
  let isEnabled = false
  let startTime = defaultTimeConfig.defaultStartTime

  /**
   * 检查是否在目标页面
   */
  const isTargetPage = (): boolean => {
    return urlMatcher.isTargetPage(window.location.href, defaultTimeConfig.targetPages)
  }

  /**
   * 应用默认时间
   */
  const applyDefaultTime = (): void => {
    // 检查是否在目标页面
    if (!isTargetPage()) return

    const startTimeInput = document.querySelector('input[name="starttime"]') as HTMLInputElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement

    if (!startTimeInput || !searchSubmit) return

    // 如果当前值不是默认值，则设置为默认值
    if (startTimeInput.value !== startTime) {
      startTimeInput.value = startTime

      // 触发事件，确保页面响应变化
      startTimeInput.dispatchEvent(new Event('change', { bubbles: true }))
      startTimeInput.dispatchEvent(new Event('input', { bubbles: true }))

      // 提交一次保证时间切换生效
      searchSubmit.click()
    }
  }

  /**
   * 移除默认时间设置
   */
  const removeDefaultTime = (): void => {
    // 不需要恢复原始值，因为用户可能已经手动修改
    // 禁用后不再自动设置时间即可
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, defaultTimeConfig.defaultEnabled)
    startTime = await storageHelper.loadString(START_TIME_KEY, defaultTimeConfig.defaultStartTime)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveMultiple({
      [STORAGE_KEY]: isEnabled,
      [START_TIME_KEY]: startTime
    })
  }

  /**
   * 设置开始时间
   */
  const setStartTime = async (time: string): Promise<void> => {
    startTime = time
    await saveConfig()
    // 重新应用配置
    if (isEnabled) {
      applyDefaultTime()
    }
  }

  /**
   * 获取开始时间
   */
  const getStartTime = (): string => startTime

  /**
   * 启用默认时间功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    applyDefaultTime()
  }

  /**
   * 禁用默认时间功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return // 如果已经禁用，直接返回

    isEnabled = false
    await saveConfig()
    removeDefaultTime()
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
      applyDefaultTime()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
    setStartTime,
    getStartTime
  }
}
