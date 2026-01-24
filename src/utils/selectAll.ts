/**
 * 全选功能工具类
 * 功能：在管理页面添加全选按钮
 */

import selectAllConfig from '@/configs/selectAll.json'

const SELECT_ALL_STORAGE_KEY = selectAllConfig.storageKey

/**
 * 全选功能管理类
 */
export class SelectAllManager {
  private isEnabled: boolean = false
  private selectAllBtn: HTMLButtonElement | null = null
  private deleteBtn: HTMLButtonElement | null = null

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
      this.injectStyles()
      this.attachEventListeners()
    }
  }

  /**
   * 从存储加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await browser.storage.local.get(SELECT_ALL_STORAGE_KEY)
      this.isEnabled = (result[SELECT_ALL_STORAGE_KEY] as boolean | undefined) ?? false
    } catch (error) {
      console.error('加载全选功能配置失败:', error)
      this.isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [SELECT_ALL_STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存全选功能配置失败:', error)
    }
  }

  /**
   * 启用全选功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.injectStyles()
    this.attachEventListeners()
  }

  /**
   * 禁用全选功能
   */
  public async disable(): Promise<void> {
    if (!this.isEnabled) return // 如果已经禁用，直接返回

    this.isEnabled = false
    await this.saveConfig()
    this.removeStyles()
    this.removeEventListeners()
    this.cleanupInjectedContent()
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
   * 注入样式
   */
  private injectStyles(): void {
    // 全选功能不需要额外的CSS样式，使用内联样式
    // 原始油猴脚本只有 button.style.margin = '0 10px'
  }

  /**
   * 移除样式
   */
  private removeStyles(): void {
    // 全选功能没有注入样式，不需要移除
  }

  /**
   * 附加事件监听器
   */
  private attachEventListeners(): void {
    // 检查是否在管理页面
    if (!this.isManagementPage()) return

    // 初始化按钮
    this.initButtons()
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (this.selectAllBtn) {
      this.selectAllBtn.removeEventListener('click', this.handleSelectAll)
      this.selectAllBtn = null
    }
    if (this.deleteBtn) {
      this.deleteBtn.removeEventListener('click', this.handleDelete)
      this.deleteBtn = null
    }
  }

  /**
   * 清理已注入的内容
   */
  private cleanupInjectedContent(): void {
    console.log('清理全选功能注入的内容')

    // 方法1：通过引用移除按钮
    if (this.selectAllBtn) {
      console.log('移除全选按钮（通过引用）')
      this.selectAllBtn.remove()
      this.selectAllBtn = null
    }
    if (this.deleteBtn) {
      console.log('移除删除按钮（通过引用）')
      this.deleteBtn.remove()
      this.deleteBtn = null
    }

    // 方法2：通过选择器查找并移除所有可能残留的按钮
    // 查找文本为"除第一条 全选"的按钮
    const selectAllButtons = document.querySelectorAll('button')
    selectAllButtons.forEach(button => {
      if (button.textContent === '除第一条 全选' && button.style.margin === '0px 10px') {
        console.log('找到并移除残留的全选按钮（通过选择器）')
        button.remove()
      }
    })

    // 查找文本为"删除"的按钮（但不是原始的#deletesubmit）
    const deleteButtons = document.querySelectorAll('button')
    deleteButtons.forEach(button => {
      if (button.textContent === '删除' && button.id !== 'deletesubmit' && button.style.margin === '0px 10px') {
        console.log('找到并移除残留的删除按钮（通过选择器）')
        button.remove()
      }
    })
  }

  /**
   * 检查是否在管理页面
   */
  private isManagementPage(): boolean {
    const url = window.location.href
    return url.includes('forum.php?mod=modcp&action=thread&op=post')
  }

  /**
   * 初始化按钮
   */
  private initButtons(): void {
    const target = document.querySelector('.mtm.mbm')
    if (!target) return

    // 创建"除第一条全选"按钮 - 使用原始油猴脚本的样式
    this.selectAllBtn = document.createElement('button')
    this.selectAllBtn.type = 'button'
    this.selectAllBtn.textContent = '除第一条 全选'
    this.selectAllBtn.style.margin = '0 10px'
    this.selectAllBtn.addEventListener('click', this.handleSelectAll)
    target.appendChild(this.selectAllBtn)

    // 创建"删除"按钮 - 使用原始油猴脚本的样式
    const originalDeleteBtn = document.querySelector('#deletesubmit')
    if (originalDeleteBtn) {
      this.deleteBtn = document.createElement('button')
      this.deleteBtn.type = 'button'
      this.deleteBtn.textContent = '删除'
      this.deleteBtn.style.margin = '0 10px'
      this.deleteBtn.addEventListener('click', this.handleDelete)
      target.appendChild(this.deleteBtn)
    }
  }

  /**
   * 处理全选按钮点击
   */
  private handleSelectAll = (): void => {
    const inputs = document.querySelectorAll('input[name="delete[]"]')
    inputs.forEach((item, index) => {
      if (index !== 0) {
        (item as HTMLInputElement).checked = true
      }
    })
  }

  /**
   * 处理删除按钮点击
   */
  private handleDelete = (): void => {
    const originalDeleteBtn = document.querySelector('#deletesubmit') as HTMLButtonElement
    if (originalDeleteBtn) {
      originalDeleteBtn.click()
    }
  }
}