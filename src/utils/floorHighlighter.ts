/**
 * 楼层ID高亮工具类
 * 功能：根据URL参数高亮指定楼层，提高管理效率
 */

import floorHighlighterConfig from '@/configs/floorHighlighter.json'

const FLOOR_HIGHLIGHTER_STORAGE_KEY = floorHighlighterConfig.storageKey

/**
 * 楼层ID高亮管理类
 */
export class FloorHighlighter {
  private isEnabled: boolean = false

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
      this.highlightTargetFloor()
    }
  }

  /**
   * 从存储加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await browser.storage.local.get(FLOOR_HIGHLIGHTER_STORAGE_KEY)
      this.isEnabled = (result[FLOOR_HIGHLIGHTER_STORAGE_KEY] as boolean | undefined) ?? true
    } catch (error) {
      console.error('加载楼层高亮配置失败:', error)
      this.isEnabled = true // 默认启用
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [FLOOR_HIGHLIGHTER_STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存楼层高亮配置失败:', error)
    }
  }

  /**
   * 启用楼层高亮功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.highlightTargetFloor()
  }

  /**
   * 禁用楼层高亮功能
   */
  public async disable(): Promise<void> {
    if (!this.isEnabled) return // 如果已经禁用，直接返回

    this.isEnabled = false
    await this.saveConfig()
    this.removeHighlight()
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
   * 高亮目标楼层
   */
  public highlightTargetFloor(): void {
    // 获取楼层id
    const pidMatch = window.location.href.match(/pid(\d+)/)
    const pid = pidMatch ? pidMatch[1] : null

    if (pid) {
      // 获取需要高亮楼层的地址
      const highlight = document.querySelector(`.plc .pi strong a[id="postnum${pid}"]`)
      // 高亮楼层
      if (highlight) {
        highlight.closest('tbody')?.style.setProperty('background-color', 'rgb(255 152 0 / 20%)')
      }
    }
  }

  /**
   * 移除高亮
   */
  public removeHighlight(): void {
    // 获取楼层id
    const pidMatch = window.location.href.match(/pid(\d+)/)
    const pid = pidMatch ? pidMatch[1] : null

    if (pid) {
      // 获取需要移除高亮的楼层
      const highlight = document.querySelector(`.plc .pi strong a[id="postnum${pid}"]`)
      // 移除高亮
      if (highlight) {
        highlight.closest('tbody')?.style.removeProperty('background-color')
      }
    }
  }
}
