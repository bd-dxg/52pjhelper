import { storageHelper } from '../storageHelper'
import type { UserBlacklistData } from './types'
import { loadBlacklistData, saveBlacklistData, shouldAutoUpdate } from './data'
import { injectStyles, removeStyles, cleanupInjectedContent } from './ui'
import { scanAndProcessUsernames, removeHighlights } from './processing'
import { attachEventListeners, removeEventListeners } from './events'
import { STORAGE_KEY } from './config'

export class UserBlacklistManager {
  private isEnabled = false
  private blacklistData: UserBlacklistData = []
  private blacklistIds = new Set<string>() // 用于快速查找的Set

  /**
   * 从存储加载配置
   */
  async loadConfig(defaultEnabled: boolean): Promise<void> {
    this.isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, defaultEnabled)
    await this.loadBlacklistData()
  }

  /**
   * 保存配置到存储
   */
  async saveConfig(): Promise<void> {
    await storageHelper.saveBoolean(STORAGE_KEY, this.isEnabled)
  }

  /**
   * 加载黑名单数据
   */
  async loadBlacklistData(): Promise<void> {
    this.blacklistData = await loadBlacklistData()
    this.blacklistIds = new Set(this.blacklistData.map(item => item.forumId.toLowerCase()))
    console.log(`[用户黑名单] 加载完成，共 ${this.blacklistData.length} 个用户，ID列表:`, Array.from(this.blacklistIds))
  }

  /**
   * 启用用户黑名单功能
   */
  async enable(): Promise<void> {
    if (this.isEnabled) return

    this.isEnabled = true
    await this.saveConfig()
    injectStyles()
    attachEventListeners(this.blacklistIds, this.blacklistData)
  }

  /**
   * 禁用用户黑名单功能
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
   * 手动更新黑名单数据
   */
  async updateData(data: UserBlacklistData): Promise<void> {
    await saveBlacklistData(data)

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      await this.loadBlacklistData()
      attachEventListeners(this.blacklistIds, this.blacklistData)
    }
  }

  /**
   * 获取黑名单数据
   */
  async getData(): Promise<UserBlacklistData> {
    await this.loadBlacklistData()
    return this.blacklistData
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
    console.log('[用户黑名单] 重新加载数据')
    await this.loadBlacklistData()

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      attachEventListeners(this.blacklistIds, this.blacklistData)
    }
  }

  /**
   * 初始化
   */
  async init(defaultEnabled: boolean): Promise<void> {
    await this.loadConfig(defaultEnabled)
    if (this.isEnabled) {
      injectStyles()
      attachEventListeners(this.blacklistIds, this.blacklistData)
    }
  }
}