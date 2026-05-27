/**
 * 分表选择器工具类
 * 功能：将分表选择器替换为按钮式界面，支持隐藏特定分表
 */

import tableSelectorConfig from './config.json'
import { urlMatcher } from '@/utils/urlMatcher'
import { storageHelper } from '@/utils/storageHelper'

const STORAGE_KEY = tableSelectorConfig.storageKey
const HIDDEN_TABLE_INDEXES_KEY = tableSelectorConfig.hiddenTableIndexesKey

/**
 * 分表选择器管理器接口
 */
export interface ITableSelector {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
  setHiddenTableIndexes(indexes: number[]): Promise<void>
  getHiddenTableIndexes(): number[]
}

/**
 * 创建分表选择器管理器实例
 */
export function createTableSelector(): ITableSelector {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null
  let hiddenTableIndexes: number[] = tableSelectorConfig.defaultHiddenTableIndexes
  let container: HTMLDivElement | null = null
  let allButtons: HTMLButtonElement[] = []

  /**
   * 检查是否在管理页面
   */
  const isManagementPage = (): boolean => {
    return urlMatcher.isTargetPage(window.location.href, tableSelectorConfig.targetPages)
  }

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
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
        flex-wrap: nowrap;
        width: 380px;
        height: 68px;
      }
      .table-btn-container button {
        font-family: monospace !important;
        width: 80px;
        height: 26px;
        margin: 3px 5px;
        padding: 0;
        box-sizing: border-box;
      }
      .table-btn-left {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex-shrink: 0;
        background: #a3d0ed;
        border-radius: 5px;
        padding: 3px;
      }
      .table-btn-right {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, auto);
        gap: 5px;
        flex: 1;
        padding: 3px;
      }
      /* 蛇形布局:第二排倒序(强制指定行和列) */
      .table-btn-right button:nth-child(6) { grid-column: 1; grid-row: 2; }
      .table-btn-right button:nth-child(5) { grid-column: 2; grid-row: 2; }
      .table-btn-right button:nth-child(4) { grid-column: 3; grid-row: 2; }
    `
    document.head.appendChild(styleElement)
  }

  /**
   * 移除样式
   */
  const removeStyles = (): void => {
    if (styleElement) {
      styleElement.remove()
      styleElement = null
    }
  }

  /**
   * 处理按钮点击事件
   */
  const handleButtonClick = (event: Event): void => {
    if (!(event.target instanceof HTMLButtonElement)) return

    // 移除所有按钮的高亮
    allButtons.forEach(btn => btn.classList.remove('table-btn-active'))

    // 高亮当前点击的按钮
    event.target.classList.add('table-btn-active')

    // 更新选择器并提交搜索
    const tableName = event.target.textContent?.split('post_')[1]
    const select = document.querySelector('#posttableid') as HTMLSelectElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement

    if (select && searchSubmit && tableName) {
      const option = select.querySelector('option')
      if (option) {
        option.value = tableName
      }
      searchSubmit.click()
    }
  }

  /**
   * 等待元素加载
   */
  const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise(resolve => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        return
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector)
        if (element) {
          observer.disconnect()
          resolve(element)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      // 超时处理
      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, timeout)
    })
  }

  /**
   * 查找包含 posttableid 的 span.ftid 容器
   */
  const findPostTableContainer = (): Element | null => {
    // 查找所有 span.ftid 元素
    const ftidSpans = Array.from(document.querySelectorAll('span.ftid'))

    // 找到包含 #posttableid 的那个 span
    for (const span of ftidSpans) {
      if (span.querySelector('#posttableid')) {
        return span
      }
    }

    return null
  }

  /**
   * 初始化分表选择器
   */
  const initTableSelector = async (): Promise<void> => {
    // 等待 #posttableid 元素加载
    await waitForElement('#posttableid')

    // 查找包含 posttableid 的 span.ftid 容器
    const spanContainer = findPostTableContainer()
    if (!spanContainer) return

    const select = spanContainer.querySelector('#posttableid') as HTMLSelectElement
    const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
    const menuItems = Array.from(document.querySelectorAll('#posttableid_ctrl_menu ul li'))

    if (!select || !searchSubmit || menuItems.length === 0) return

    // 根据配置过滤需要显示的分表
    const visibleMenuItems = menuItems.filter((_, index) => !hiddenTableIndexes.includes(index))

    // 创建容器
    container = document.createElement('div')
    container.className = 'table-btn-container'
    container.dataset.featureId = 'table-selector-container'

    const leftBox = document.createElement('div')
    leftBox.className = 'table-btn-left'

    const rightBox = document.createElement('div')
    rightBox.className = 'table-btn-right'

    // 创建所有分表按钮
    allButtons = []
    visibleMenuItems.forEach((item, visibleIndex) => {
      // 获取原始索引
      const originalIndex = menuItems.indexOf(item)
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = item.textContent
      button.dataset.index = originalIndex.toString()
      allButtons.push(button)

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
      const tableName = item.textContent?.split('post_')[1]
      return tableName === currentSelectedValue
    })
    if (visibleHighlightIndex !== -1) {
      allButtons[visibleHighlightIndex].classList.add('table-btn-active')
    }

    // 添加点击事件委托
    container.addEventListener('click', handleButtonClick)

    container.appendChild(leftBox)
    container.appendChild(rightBox)

    // 将按钮容器添加到 span.ftid 容器中
    spanContainer.appendChild(container)
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = async (): Promise<void> => {
    // 检查是否在管理页面
    if (!isManagementPage()) return

    // 初始化分表选择器
    await initTableSelector()
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    if (container) {
      container.removeEventListener('click', handleButtonClick)
      container = null
    }
    allButtons = []
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    // 方法1：通过引用移除容器
    if (container) {
      container.remove()
      container = null
    }

    // 方法2：通过 data 属性查找并移除所有可能残留的容器（性能优化）
    document.querySelectorAll('[data-feature-id="table-selector-container"]').forEach(container => container.remove())

    allButtons = []

    // 恢复原始的分表选择器显示
    const postTableCtrl = document.querySelector('#posttableid_ctrl') as HTMLElement
    if (postTableCtrl) {
      postTableCtrl.style.display = ''
    }
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    const result = await storageHelper.loadMultiple([STORAGE_KEY, HIDDEN_TABLE_INDEXES_KEY])
    isEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? tableSelectorConfig.defaultEnabled
    hiddenTableIndexes =
      (result[HIDDEN_TABLE_INDEXES_KEY] as number[] | undefined) ?? tableSelectorConfig.defaultHiddenTableIndexes
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveMultiple({
      [STORAGE_KEY]: isEnabled,
      [HIDDEN_TABLE_INDEXES_KEY]: hiddenTableIndexes,
    })
  }

  /**
   * 设置隐藏分表索引
   */
  const setHiddenTableIndexes = async (indexes: number[]): Promise<void> => {
    hiddenTableIndexes = indexes
    await saveConfig()
    // 重新应用配置
    if (isEnabled) {
      cleanupInjectedContent()
      await attachEventListeners()
    }
  }

  /**
   * 获取隐藏分表索引
   */
  const getHiddenTableIndexes = (): number[] => [...hiddenTableIndexes]

  /**
   * 启用分表选择器功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    injectStyles()
    await attachEventListeners()
  }

  /**
   * 禁用分表选择器功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return // 如果已经禁用，直接返回

    isEnabled = false
    await saveConfig()
    removeStyles()
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
      injectStyles()
      await attachEventListeners()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus,
    setHiddenTableIndexes,
    getHiddenTableIndexes,
  }
}