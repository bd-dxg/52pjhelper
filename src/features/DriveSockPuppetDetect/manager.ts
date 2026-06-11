import { storageHelper } from '@utils/storageHelper'
import type { DriveSockPuppetData } from './types'
import { loadSockPuppetData, saveSockPuppetData, shouldAutoUpdate } from './data'
import { injectStyles, removeStyles, cleanupInjectedContent } from './ui'
import { scanAndProcessUsernames, removeHighlights } from './processing'
import { attachEventListeners, removeEventListeners } from './events'
import { STORAGE_KEY } from './config'

export class DriveSockPuppetManager {
  private isEnabled = false
  private sockPuppetData: DriveSockPuppetData = []
  private sockPuppetIds = new Set<string>() // 用于快速查找的Set

  /**
   * 从存储加载配置
   */
  async loadConfig(defaultEnabled: boolean): Promise<void> {
    this.isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, defaultEnabled)
    await this.loadSockPuppetData()
  }

  /**
   * 保存配置到存储
   */
  async saveConfig(): Promise<void> {
    await storageHelper.saveBoolean(STORAGE_KEY, this.isEnabled)
  }

  /**
   * 加载马甲数据
   */
  async loadSockPuppetData(): Promise<void> {
    this.sockPuppetData = await loadSockPuppetData()
    this.sockPuppetIds = new Set(this.sockPuppetData.map(item => item.forumId.toLowerCase()))
  }

  /**
   * 启用检测网盘马甲功能
   */
  async enable(): Promise<void> {
    if (this.isEnabled) return

    this.isEnabled = true
    await this.saveConfig()
    injectStyles()
    attachEventListeners(this.sockPuppetIds, this.sockPuppetData)
    // 立即扫描现有的用户名元素
    scanAndProcessUsernames(this.sockPuppetIds, this.sockPuppetData)
  }

  /**
   * 禁用检测网盘马甲功能
   */
  async disable(): Promise<void> {
    if (!this.isEnabled) return

    this.isEnabled = false
    await this.saveConfig()
    removeStyles()
    removeEventListeners()
    removeHighlights()
    cleanupInjectedContent()
  }

  /**
   * 切换功能状态
   */
  async toggle(): Promise<boolean> {
    if (this.isEnabled) {
      await this.disable()
    } else {
      await this.enable()
    }
    return this.isEnabled
  }

  /**
   * 获取当前状态
   */
  getStatus(): boolean {
    return this.isEnabled
  }

  /**
   * 手动更新马甲数据
   */
  async updateData(data: DriveSockPuppetData): Promise<void> {
    await saveSockPuppetData(data)

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      await this.loadSockPuppetData()
      attachEventListeners(this.sockPuppetIds, this.sockPuppetData)
    }
  }

  /**
   * 获取马甲数据
   */
  async getData(): Promise<DriveSockPuppetData> {
    await this.loadSockPuppetData()
    return this.sockPuppetData
  }

  /**
   * 检查是否需要自动更新
   */
  async checkShouldAutoUpdate(): Promise<boolean> {
    return shouldAutoUpdate()
  }

  /**
   * 重新加载数据并重新扫描
   */
  async reloadData(): Promise<void> {
    console.log('[检测网盘马甲] 重新加载数据')
    await this.loadSockPuppetData()

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      attachEventListeners(this.sockPuppetIds, this.sockPuppetData)
    }
  }

  /**
   * 初始化
   */
  async init(defaultEnabled: boolean): Promise<void> {
    await this.loadConfig(defaultEnabled)
    if (this.isEnabled) {
      injectStyles()
      attachEventListeners(this.sockPuppetIds, this.sockPuppetData)
      // 立即扫描现有的用户名元素
      scanAndProcessUsernames(this.sockPuppetIds, this.sockPuppetData)
    }
  }
}
