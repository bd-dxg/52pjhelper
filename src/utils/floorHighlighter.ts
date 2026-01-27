/**
 * 楼层ID高亮工具
 * 功能：根据URL参数高亮指定楼层，提高管理效率
 */

import floorHighlighterConfig from '@/configs/floorHighlighter.json'

const FLOOR_HIGHLIGHTER_STORAGE_KEY = floorHighlighterConfig.storageKey

/**
 * 楼层ID高亮管理器接口
 */
export interface IFloorHighlighter {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
  highlightTargetFloor(): void
  removeHighlight(): void
}

/**
 * 创建楼层高亮管理器实例
 */
export function createFloorHighlighter(): IFloorHighlighter {
  let isEnabled = false

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    try {
      const result = await browser.storage.local.get(FLOOR_HIGHLIGHTER_STORAGE_KEY)
      isEnabled = (result[FLOOR_HIGHLIGHTER_STORAGE_KEY] as boolean | undefined) ?? true
    } catch (error) {
      console.error('加载楼层高亮配置失败:', error)
      isEnabled = true // 默认启用
    }
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    try {
      await browser.storage.local.set({ [FLOOR_HIGHLIGHTER_STORAGE_KEY]: isEnabled })
    } catch (error) {
      console.error('保存楼层高亮配置失败:', error)
    }
  }

  /**
   * 高亮目标楼层
   */
  const highlightTargetFloor = (): void => {
    // 获取楼层id
    const pidMatch = window.location.href.match(/pid(\d+)/)
    const pid = pidMatch?.[1] ?? null

    if (pid) {
      // 获取需要高亮楼层的地址
      const highlight = document.querySelector(`.plc .pi strong a[id="postnum${pid}"]`)
      // 高亮楼层
      highlight?.closest('tbody')?.style.setProperty('background-color', 'rgb(255 152 0 / 20%)')
    }
  }

  /**
   * 移除高亮
   */
  const removeHighlight = (): void => {
    // 获取楼层id
    const pidMatch = window.location.href.match(/pid(\d+)/)
    const pid = pidMatch?.[1] ?? null

    if (pid) {
      // 获取需要移除高亮的楼层
      const highlight = document.querySelector(`.plc .pi strong a[id="postnum${pid}"]`)
      // 移除高亮
      highlight?.closest('tbody')?.style.removeProperty('background-color')
    }
  }

  /**
   * 启用楼层高亮功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    highlightTargetFloor()
  }

  /**
   * 禁用楼层高亮功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return // 如果已经禁用，直接返回

    isEnabled = false
    await saveConfig()
    removeHighlight()
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
      highlightTargetFloor()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
    highlightTargetFloor,
    removeHighlight
  }
}

/**
 * 为了保持向后兼容，导出一个类包装器
 * @deprecated 请使用 createFloorHighlighter() 函数
 */
export class FloorHighlighter {
  private instance: IFloorHighlighter

  constructor() {
    this.instance = createFloorHighlighter()
  }

  async enable(): Promise<void> {
    return this.instance.enable()
  }

  async disable(): Promise<void> {
    return this.instance.disable()
  }

  async toggle(): Promise<boolean> {
    return this.instance.toggle()
  }

  getStatus(): boolean {
    return this.instance.getStatus()
  }

  highlightTargetFloor(): void {
    return this.instance.highlightTargetFloor()
  }

  removeHighlight(): void {
    return this.instance.removeHighlight()
  }
}
