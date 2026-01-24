/**
 * 分表选择器工具类
 * 功能：将分表选择器替换为按钮式界面，支持隐藏特定分表
 */

import tableSelectorConfig from '@/configs/tableSelector.json'

const TABLE_SELECTOR_STORAGE_KEY = tableSelectorConfig.storageKey
const HIDDEN_TABLE_INDEXES_KEY = tableSelectorConfig.hiddenTableIndexesKey

/**
 * 分表选择器管理类
 */
export class TableSelectorManager {
  private isEnabled: boolean = false
  private styleElement: HTMLStyleElement | null = null
  private hiddenTableIndexes: number[] = tableSelectorConfig.defaultHiddenTableIndexes
  private container: HTMLDivElement | null = null
  private allButtons: HTMLButtonElement[] = []

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
      const result = await browser.storage.local.get([TABLE_SELECTOR_STORAGE_KEY, HIDDEN_TABLE_INDEXES_KEY])
      this.isEnabled = (result[TABLE_SELECTOR_STORAGE_KEY] as boolean | undefined) ?? false
      this.hiddenTableIndexes = (result[HIDDEN_TABLE_INDEXES_KEY] as number[] | undefined) ?? tableSelectorConfig.defaultHiddenTableIndexes
    } catch (error) {
      console.error('加载分表选择器配置失败:', error)
      this.isEnabled = false
      this.hiddenTableIndexes = tableSelectorConfig.defaultHiddenTableIndexes
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({
        [TABLE_SELECTOR_STORAGE_KEY]: this.isEnabled,
        [HIDDEN_TABLE_INDEXES_KEY]: this.hiddenTableIndexes
      })
    } catch (error) {
      console.error('保存分表选择器配置失败:', error)
    }
  }

  /**
   * 设置隐藏分表索引
   */
  public async setHiddenTableIndexes(indexes: number[]): Promise<void> {
    this.hiddenTableIndexes = indexes
    await this.saveConfig()
    // 重新应用配置
    if (this.isEnabled) {
      this.cleanupInjectedContent()
      this.attachEventListeners()
    }
  }

  /**
   * 获取隐藏分表索引
   */
  public getHiddenTableIndexes(): number[] {
    return [...this.hiddenTableIndexes]
  }

  /**
   * 启用分表选择器功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.injectStyles()
    this.attachEventListeners()
  }

  /**
   * 禁用分表选择器功能
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
    if (this.styleElement) return

    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      #posttableid_ctrl {
        display: none;
      }
      .table-btn-active {
        background-color: #ffbd10;
      }
      .table-btn-container {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .table-btn-container button {
        font-family: monospace !important;
        width: 80px;
        margin: 3px 5px;
      }
      .table-btn-left {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex-shrink: 0;
        background: #a3d0ed;
        border-radius: 5px;
      }
      .table-btn-right {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, auto);
        gap: 5px;
        flex: 1;
      }
      /* 蛇形布局:第二排倒序(强制指定行和列) */
      .table-btn-right button:nth-child(6) { grid-column: 1; grid-row: 2; }
      .table-btn-right button:nth-child(5) { grid-column: 2; grid-row: 2; }
      .table-btn-right button:nth-child(4) { grid-column: 3; grid-row: 2; }
    `
    document.head.appendChild(this.styleElement)
  }

  /**
   * 移除样式
   */
  private removeStyles(): void {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }

  /**
   * 附加事件监听器
   */
  private attachEventListeners(): void {
    // 检查是否在管理页面
    if (!this.isManagementPage()) return

    // 初始化分表选择器
    this.initTableSelector()
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (this.container) {
      this.container.removeEventListener('click', this.handleButtonClick)
      this.container = null
    }
    this.allButtons = []
  }

  /**
   * 清理已注入的内容
   */
  private cleanupInjectedContent(): void {
    console.log('清理分表选择器注入的内容')

    // 方法1：通过引用移除容器
    if (this.container) {
      console.log('移除分表选择器容器（通过引用）')
      this.container.remove()
      this.container = null
    }

    // 方法2：通过选择器查找并移除所有可能残留的容器
    const containers = document.querySelectorAll('.table-btn-container')
    containers.forEach(container => {
      console.log('找到并移除残留的分表选择器容器（通过选择器）')
      container.remove()
    })

    this.allButtons = []

    // 恢复原始的分表选择器显示
    const postTableCtrl = document.querySelector('#posttableid_ctrl') as HTMLElement
    if (postTableCtrl) {
      postTableCtrl.style.display = ''
    }
  }

  /**
   * 检查是否在管理页面
   */
  private isManagementPage(): boolean {
    const url = window.location.href
    return url.includes('forum.php?mod=modcp&action=thread&op=post')
  }

  /**
   * 初始化分表选择器
   */
  private initTableSelector(): void {
    const table = document.querySelector('td[colspan="3"]>span.ftid')
    if (!table) return

    const select = table.querySelector('#posttableid') as HTMLSelectElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
    const menuItems = Array.from(document.querySelectorAll('#posttableid_ctrl_menu ul li'))

    if (!select || !searchSubmit || menuItems.length === 0) return

    // 根据配置过滤需要显示的分表
    const visibleMenuItems = menuItems.filter((_, index) => !this.hiddenTableIndexes.includes(index))

    // 创建容器
    this.container = document.createElement('div')
    this.container.className = 'table-btn-container'

    const leftBox = document.createElement('div')
    leftBox.className = 'table-btn-left'

    const rightBox = document.createElement('div')
    rightBox.className = 'table-btn-right'

    // 创建所有分表按钮
    this.allButtons = []
    visibleMenuItems.forEach((item, visibleIndex) => {
      // 获取原始索引
      const originalIndex = menuItems.indexOf(item)
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = item.textContent
      button.dataset.index = originalIndex.toString()
      this.allButtons.push(button)

      // 第一个和最后一个放左边,其他放右边
      if (visibleIndex === 0 || visibleIndex === visibleMenuItems.length - 1) {
        leftBox.appendChild(button)
      } else {
        rightBox.appendChild(button)
      }
    })

    // 高亮当前选中的分表按钮
    const currentSelectedValue = select.value
    // 检查当前选中的分表是否在可见列表中
    const visibleHighlightIndex = visibleMenuItems.findIndex(item => {
      const tableName = item.textContent.split('post_')[1]
      return tableName === currentSelectedValue
    })
    if (visibleHighlightIndex !== -1) {
      this.allButtons[visibleHighlightIndex].classList.add('table-btn-active')
    }

    // 添加点击事件委托
    this.container.addEventListener('click', this.handleButtonClick)

    this.container.appendChild(leftBox)
    this.container.appendChild(rightBox)
    table.appendChild(this.container)
  }

  /**
   * 处理按钮点击事件
   */
  private handleButtonClick = (event: Event): void => {
    if (!(event.target instanceof HTMLButtonElement)) return

    // 移除所有按钮的高亮
    this.allButtons.forEach(btn => btn.classList.remove('table-btn-active'))

    // 高亮当前点击的按钮
    event.target.classList.add('table-btn-active')

    // 更新选择器并提交搜索
    const tableName = event.target.textContent.split('post_')[1]
    const select = document.querySelector('#posttableid') as HTMLSelectElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement

    if (select && searchSubmit) {
      select.querySelector('option')!.value = tableName
      searchSubmit.click()
    }
  }
}