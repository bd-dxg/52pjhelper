import { storageHelper } from '../storageHelper'
import type { UserCloudDiskListData } from './types'
import { loadCloudDiskListData, saveCloudDiskListData, shouldAutoUpdate } from './data'
import { injectStyles, removeStyles, cleanupInjectedContent } from './ui'
import { scanAndProcessUsernames, removeHighlights } from './processing'
import { attachEventListeners, removeEventListeners } from './events'
import { STORAGE_KEY } from './config'

export class UserCloudDiskListManager {
  private isEnabled = false
  private CloudDiskListData: UserCloudDiskListData = []
  private CloudDiskListIds = new Set<string>() // 用于快速查找的Set

  /**
   * 从存储加载配置
   */
  async loadConfig(defaultEnabled: boolean): Promise<void> {
    this.isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, defaultEnabled)
    await this.loadCloudDiskListData()
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
  async loadCloudDiskListData(): Promise<void> {
    this.CloudDiskListData = await loadCloudDiskListData()
    this.CloudDiskListIds = new Set(this.CloudDiskListData.map(item => item.forumId.toLowerCase()))
    // console.log(`[用户黑名单] 加载完成，共 ${this.CloudDiskListData.length} 个用户，ID列表:`, Array.from(this.CloudDiskListIds))
  }

  /**
   * 启用用户黑名单功能
   */
  async enable(): Promise<void> {
    if (this.isEnabled) return

    this.isEnabled = true
    await this.saveConfig()
    injectStyles()
    attachEventListeners(this.CloudDiskListIds, this.CloudDiskListData)
    // 立即扫描现有的用户名元素
    scanAndProcessUsernames(this.CloudDiskListIds, this.CloudDiskListData)
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
  async updateData(data: UserCloudDiskListData): Promise<void> {
    await saveCloudDiskListData(data)

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      await this.loadCloudDiskListData()
      attachEventListeners(this.CloudDiskListIds, this.CloudDiskListData)
    }
  }

  /**
   * 获取黑名单数据
   */
  async getData(): Promise<UserCloudDiskListData> {
    await this.loadCloudDiskListData()
    return this.CloudDiskListData
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
    await this.loadCloudDiskListData()

    // 如果功能已启用，重新处理用户名元素
    if (this.isEnabled) {
      removeEventListeners()
      attachEventListeners(this.CloudDiskListIds, this.CloudDiskListData)
    }
  }

  /**
   * 初始化
   */
  async init(defaultEnabled: boolean): Promise<void> {
    await this.loadConfig(defaultEnabled)
    if (this.isEnabled) {
      injectStyles()
      attachEventListeners(this.CloudDiskListIds, this.CloudDiskListData)
      // 立即扫描现有的用户名元素
      scanAndProcessUsernames(this.CloudDiskListIds, this.CloudDiskListData)
    }
  }
}
