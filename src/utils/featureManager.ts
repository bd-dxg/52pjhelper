/**
 * 功能管理器基类
 * 提供统一的功能管理模式
 */

import { storageHelper } from './storageHelper'
import { urlMatcher } from './urlMatcher'

/**
 * 功能管理器配置
 */
export interface FeatureConfig {
  /** 存储键 */
  storageKey: string
  /** 默认启用状态 */
  defaultEnabled: boolean
  /** 目标页面列表 */
  targetPages?: string[]
}

/**
 * 功能管理器基础接口
 */
export interface IFeatureManager {
  /**
   * 启用功能
   */
  enable(): Promise<void>

  /**
   * 禁用功能
   */
  disable(): Promise<void>

  /**
   * 切换功能状态
   * @returns 切换后的状态
   */
  toggle(): Promise<boolean>

  /**
   * 获取功能状态
   */
  getStatus(): boolean
}

/**
 * 创建功能管理器的工厂函数选项
 */
export interface CreateFeatureManagerOptions {
  /** 功能配置 */
  config: FeatureConfig
  /** 启用功能时的回调 */
  onEnable: () => void | Promise<void>
  /** 禁用功能时的回调 */
  onDisable: () => void | Promise<void>
  /** 初始化时的回调（可选） */
  onInit?: () => void | Promise<void>
}

/**
 * 创建功能管理器
 * @param options 配置选项
 */
export function createFeatureManager(options: CreateFeatureManagerOptions): IFeatureManager {
  const { config, onEnable, onDisable, onInit } = options

  // 功能启用状态
  let isEnabled = false

  /**
   * 加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(config.storageKey, config.defaultEnabled)
  }

  /**
   * 保存配置
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(config.storageKey, isEnabled)
  }

  /**
   * 检查当前页面是否为目标页面
   */
  const isTargetPage = (): boolean => {
    if (!config.targetPages || config.targetPages.length === 0) {
      return true // 如果没有指定目标页面，则所有页面都是目标页面
    }
    return urlMatcher.isTargetPage(window.location.href, config.targetPages)
  }

  /**
   * 启用功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) {
      return
    }

    isEnabled = true
    await saveConfig()

    if (isTargetPage()) {
      await onEnable()
    }
  }

  /**
   * 禁用功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) {
      return
    }

    isEnabled = false
    await saveConfig()

    if (isTargetPage()) {
      await onDisable()
    }
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
   * 获取功能状态
   */
  const getStatus = (): boolean => {
    return isEnabled
  }

  /**
   * 初始化功能
   */
  const init = async (): Promise<void> => {
    await loadConfig()

    if (onInit) {
      await onInit()
    }

    if (isEnabled && isTargetPage()) {
      await onEnable()
    }
  }

  // 自动初始化
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
  }
}
