/**
 * 默认时间工具类
 * 功能：将查询开始时间默认设置为2008-03-13
 */

import defaultTimeConfig from '@/configs/defaultTime.json'

const DEFAULT_TIME_STORAGE_KEY = defaultTimeConfig.storageKey
const START_TIME_KEY = defaultTimeConfig.startTimeKey

/**
 * 默认时间管理类
 */
export class DefaultTimeManager {
  private isEnabled: boolean = false
  private startTime: string = defaultTimeConfig.defaultStartTime

  constructor() {
    // 异步初始化，不阻塞构造函数
    void this.init()
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    await this.loadConfig()
    if (this.isEnabled) {
      this.applyDefaultTime()
    }
  }

  /**
   * 从存储加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await browser.storage.local.get([DEFAULT_TIME_STORAGE_KEY, START_TIME_KEY])
      this.isEnabled = (result[DEFAULT_TIME_STORAGE_KEY] as boolean | undefined) ?? false
      this.startTime = (result[START_TIME_KEY] as string | undefined) ?? defaultTimeConfig.defaultStartTime
    } catch (error) {
      console.error('加载默认时间配置失败:', error)
      this.isEnabled = false
      this.startTime = defaultTimeConfig.defaultStartTime
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({
        [DEFAULT_TIME_STORAGE_KEY]: this.isEnabled,
        [START_TIME_KEY]: this.startTime
      })
    } catch (error) {
      console.error('保存默认时间配置失败:', error)
    }
  }

  /**
   * 设置开始时间
   */
  public async setStartTime(time: string): Promise<void> {
    this.startTime = time
    await this.saveConfig()
    // 重新应用配置
    if (this.isEnabled) {
      this.applyDefaultTime()
    }
  }

  /**
   * 获取开始时间
   */
  public getStartTime(): string {
    return this.startTime
  }

  /**
   * 启用默认时间功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.applyDefaultTime()
  }

  /**
   * 禁用默认时间功能
   */
  public async disable(): Promise<void> {
    if (!this.isEnabled) return // 如果已经禁用，直接返回

    this.isEnabled = false
    await this.saveConfig()
    this.removeDefaultTime()
  }

  /**
   * 切换功能状态
   */
  public async toggle(): Promise<boolean> {
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
  public getStatus(): boolean {
    return this.isEnabled
  }

  /**
   * 应用默认时间
   */
  private applyDefaultTime(): void {
    // 检查是否在管理页面
    if (!this.isManagementPage()) return

    const startTimeInput = document.querySelector('input[name="starttime"]') as HTMLInputElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement

    if (!startTimeInput || !searchSubmit) return

    // 如果当前值不是默认值，则设置为默认值
    if (startTimeInput.value !== this.startTime) {
      startTimeInput.value = this.startTime

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
  private removeDefaultTime(): void {
    console.log('清理默认时间设置')
    // 不需要恢复原始值，因为用户可能已经手动修改
    // 禁用后不再自动设置时间即可
  }

  /**
   * 检查是否在管理页面
   */
  private isManagementPage(): boolean {
    const url = window.location.href
    return url.includes('forum.php?mod=modcp&action=thread&op=post')
  }
}