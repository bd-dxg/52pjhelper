/**
 * 全选功能工具类
 * 功能：在管理页面添加全选按钮
 */

import selectAllConfig from '@/configs/selectAll.json'

const STORAGE_KEY = selectAllConfig.storageKey

/**
 * 全选功能管理器接口
 */
export interface ISelectAll {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建全选功能管理器实例
 */
export function createSelectAll(): ISelectAll {
  let isEnabled = false
  let selectAllBtn: HTMLButtonElement | null = null
  let deleteBtn: HTMLButtonElement | null = null

  /**
   * 检查是否在目标页面
   */
  const isTargetPage = (): boolean => {
    const url = window.location.href
    return selectAllConfig.targetPages.some(page => url.includes(page))
  }

  /**
   * 处理全选按钮点击
   */
  const handleSelectAll = (): void => {
    const inputs = document.querySelectorAll('input[name="delete[]"]')
    inputs.forEach((item, index) => {
      if (index !== 0 && item instanceof HTMLInputElement) {
        item.checked = true
      }
    })
  }

  /**
   * 处理删除按钮点击
   */
  const handleDelete = (): void => {
    const originalDeleteBtn = document.querySelector('#deletesubmit') as HTMLButtonElement
    originalDeleteBtn?.click()
  }

  /**
   * 初始化按钮
   */
  const initButtons = (): void => {
    const target = document.querySelector('.mtm.mbm')
    if (!target) return

    // 创建"除第一条全选"按钮 - 使用原始油猴脚本的样式
    selectAllBtn = document.createElement('button')
    selectAllBtn.type = 'button'
    selectAllBtn.textContent = '除第一条 全选'
    selectAllBtn.style.margin = '0 10px'
    selectAllBtn.dataset.featureId = 'select-all-btn'
    selectAllBtn.addEventListener('click', handleSelectAll)
    target.appendChild(selectAllBtn)

    // 创建"删除"按钮 - 使用原始油猴脚本的样式
    const originalDeleteBtn = document.querySelector('#deletesubmit')
    if (originalDeleteBtn) {
      deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.textContent = '删除'
      deleteBtn.style.margin = '0 10px'
      deleteBtn.dataset.featureId = 'select-all-delete-btn'
      deleteBtn.addEventListener('click', handleDelete)
      target.appendChild(deleteBtn)
    }
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = (): void => {
    // 检查是否在目标页面
    if (!isTargetPage()) return

    // 初始化按钮
    initButtons()
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    if (selectAllBtn) {
      selectAllBtn.removeEventListener('click', handleSelectAll)
      selectAllBtn = null
    }
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', handleDelete)
      deleteBtn = null
    }
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    // 方法1：通过引用移除按钮
    if (selectAllBtn) {
      selectAllBtn.remove()
      selectAllBtn = null
    }
    if (deleteBtn) {
      deleteBtn.remove()
      deleteBtn = null
    }

    // 方法2：通过 data 属性查找并移除所有可能残留的按钮（性能优化）
    document.querySelectorAll('[data-feature-id^="select-all-"]')
      .forEach(btn => btn.remove())
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    try {
      const result = await browser.storage.local.get(STORAGE_KEY)
      isEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? selectAllConfig.defaultEnabled
    } catch (error) {
      console.error('加载全选功能配置失败:', error)
      isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: isEnabled })
    } catch (error) {
      console.error('保存全选功能配置失败:', error)
    }
  }

  /**
   * 启用全选功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    attachEventListeners()
  }

  /**
   * 禁用全选功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return // 如果已经禁用，直接返回

    isEnabled = false
    await saveConfig()
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
      attachEventListeners()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus
  }
}

/**
 * 为了保持向后兼容，导出一个类包装器
 * @deprecated 请使用 createSelectAll() 函数
 */
export class SelectAllManager {
  private instance: ISelectAll

  constructor() {
    this.instance = createSelectAll()
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
}
