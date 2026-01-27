/**
 * 用户链接查询工具类
 * 功能：在管理页面鼠标移动到用户名链接时显示用户违规记录（悬浮形式）
 */

import userLinkQueryConfig from '@/configs/userLinkQuery.json'
import { fetchUserViolation, extractUidFromHref } from './userViolationFetcher'

const STORAGE_KEY = userLinkQueryConfig.storageKey

/**
 * 用户链接查询管理器接口
 */
export interface IUserLinkQuery {
  enable(): void
  disable(): void
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建用户链接查询管理器实例
 */
export function createUserLinkQuery(): IUserLinkQuery {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null
  let popupElement: HTMLDivElement | null = null
  let pageChangeListener: (() => void) | null = null
  let hideTimeout: number | null = null
  let isMouseOverPopup = false
  let loadEventListener: (() => void) | null = null

  /**
   * 检查是否在管理页面
   */
  const isManagementPage = (): boolean => {
    return window.location.href.includes('https://www.52pojie.cn/forum.php?mod=modcp&action=moderate')
  }

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .user-link-popup {
        position: fixed;
        background: #fff;
        border: 1px solid #d1d5da;
        border-radius: 6px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 99999;
        width: 620px;
        max-height: 400px;
        overflow-y: auto;
        display: none;
        font-size: 12px;
        line-height: 1.4;
        color: #24292f;
        pointer-events: auto; /* 允许鼠标事件 */
      }
      .user-link-popup.show {
        display: block;
      }
      .user-link-popup #pcr {
        background: transparent;
        padding: 0;
        margin: 0;
        border: none;
        width: 100%;
      }
      .user-link-popup #pcr td {
        padding: 4px 8px;
        border-bottom: 1px solid #e1e4e8;
      }
      .user-link-popup #pcr tr:last-child td {
        border-bottom: none;
      }
      .user-link-popup #pcr th {
        background-color: #f6f8fa;
        font-weight: 600;
        padding: 8px;
        border-bottom: 2px solid #d1d5da;
      }
      .user-link-popup .no-violation {
        color: #57606a;
        font-style: italic;
        text-align: center;
        padding: 20px;
      }
      .user-link-popup .loading {
        color: #57606a;
        text-align: center;
        padding: 20px;
      }
      .user-link-popup .error {
        color: #cf222e;
        text-align: center;
        padding: 20px;
      }
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
   * 悬浮层鼠标移入处理
   */
  const onPopupMouseEnter = (): void => {
    isMouseOverPopup = true

    // 取消隐藏定时器
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  }

  /**
   * 悬浮层鼠标移出处理
   */
  const onPopupMouseLeave = (): void => {
    isMouseOverPopup = false

    // 延迟隐藏悬浮层
    scheduleHidePopup()
  }

  /**
   * 创建悬浮层
   */
  const createPopup = (): void => {
    if (popupElement) return

    popupElement = document.createElement('div')
    popupElement.className = 'user-link-popup'

    // 添加悬浮层鼠标事件
    popupElement.addEventListener('mouseenter', onPopupMouseEnter)
    popupElement.addEventListener('mouseleave', onPopupMouseLeave)

    document.body.appendChild(popupElement)
  }

  /**
   * 移除悬浮层
   */
  const removePopup = (): void => {
    if (popupElement) {
      // 移除事件监听器
      popupElement.removeEventListener('mouseenter', onPopupMouseEnter)
      popupElement.removeEventListener('mouseleave', onPopupMouseLeave)

      popupElement.remove()
      popupElement = null
    }
  }

  /**
   * 更新悬浮层位置
   */
  const updatePopupPosition = (target: HTMLElement): void => {
    if (!popupElement) return

    const rect = target.getBoundingClientRect()
    const popupRect = popupElement.getBoundingClientRect()
    const popupWidth = 620
    const popupHeight = popupRect.height || 200
    const gap = 8

    // 水平位置：左对齐到目标元素
    let left = rect.left
    // 右侧空间不够则右对齐
    if (left + popupWidth > document.documentElement.clientWidth) {
      left = document.documentElement.clientWidth - popupWidth - 20
    }
    if (left < 10) left = 10

    // 垂直位置：默认在下方
    let top = rect.bottom + gap
    // 下方空间不够则在上方
    if (top + popupHeight > document.documentElement.clientHeight) {
      top = rect.top - popupHeight - gap
    }
    if (top < 5) top = 5

    popupElement.style.left = `${left}px`
    popupElement.style.top = `${top}px`
  }

  /**
   * 安排隐藏悬浮层
   */
  const scheduleHidePopup = (): void => {
    // 如果鼠标在悬浮层上，不隐藏
    if (isMouseOverPopup) {
      return
    }

    // 取消之前的定时器
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    // 设置新的定时器
    hideTimeout = window.setTimeout(() => {
      if (popupElement) {
        popupElement.classList.remove('show')
      }
      hideTimeout = null
    }, 300) // 300ms 延迟，让用户有时间移动到悬浮层
  }

  /**
   * 鼠标移入处理（使用 mouseover 事件委托）
   */
  const onMouseOver = async (e: Event): Promise<void> => {
    // 事件委托：检查事件目标是否是我们关心的用户链接
    const target = e.target as HTMLElement
    if (!target) return

    // 查找最近的用户链接元素
    const userLink = target.closest('#moderate .um a[href*="uid="]') as HTMLAnchorElement
    if (!userLink?.href) return

    const uid = extractUidFromHref(userLink.href)
    if (!uid) return

    // 确保悬浮层存在
    if (!popupElement) {
      createPopup()
    }

    // 显示加载状态
    popupElement!.innerHTML = '<div class="loading">加载中...</div>'
    popupElement!.classList.add('show')

    // 更新悬浮层位置
    updatePopupPosition(userLink)

    try {
      const info = await fetchUserViolation(uid)

      popupElement!.innerHTML = ''
      if (info) {
        // 复制违规信息表格
        const clonedInfo = info.cloneNode(true) as HTMLElement
        popupElement!.appendChild(clonedInfo)
      } else {
        // 显示无违规记录
        const noViolationDiv = document.createElement('div')
        noViolationDiv.className = 'no-violation'
        noViolationDiv.textContent = '没有违规记录'
        popupElement!.appendChild(noViolationDiv)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      popupElement!.innerHTML = '<div class="error">获取用户信息失败</div>'
    }
  }

  /**
   * 鼠标移出处理（使用 mouseout 事件委托）
   */
  const onMouseOut = (e: Event): void => {
    // 检查鼠标是否移出到用户链接之外
    const mouseEvent = e as MouseEvent
    const target = e.target as HTMLElement
    const relatedTarget = mouseEvent.relatedTarget as HTMLElement | null

    // 如果鼠标从用户链接移出，并且没有移动到另一个用户链接或悬浮层
    const fromUserLink = target.closest('#moderate .um a[href*="uid="]')
    const toUserLink = relatedTarget?.closest('#moderate .um a[href*="uid="]')
    const toPopup = relatedTarget?.closest('.user-link-popup')

    if (fromUserLink && !toUserLink && !toPopup) {
      // 延迟隐藏悬浮层
      scheduleHidePopup()
    }
  }

  /**
   * 尝试附加事件监听器
   */
  const tryAttachEventListeners = (): void => {
    const moderateContainer = document.querySelector('#moderate')
    if (!moderateContainer) {
      return
    }

    // 检查是否已经附加了事件委托监听器
    const hasMouseOver = moderateContainer.hasAttribute('data-user-link-query-mouseover')
    const hasMouseOut = moderateContainer.hasAttribute('data-user-link-query-mouseout')

    if (!hasMouseOver) {
      moderateContainer.addEventListener('mouseover', onMouseOver)
      moderateContainer.setAttribute('data-user-link-query-mouseover', 'true')
    }

    if (!hasMouseOut) {
      moderateContainer.addEventListener('mouseout', onMouseOut)
      moderateContainer.setAttribute('data-user-link-query-mouseout', 'true')
    }
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = (): void => {
    if (!isManagementPage()) {
      return
    }

    // 使用事件委托，为整个 moderate 容器添加事件监听器
    tryAttachEventListeners()

    // 如果 DOM 可能还没有完全加载，设置一个延迟重试
    setTimeout(() => {
      tryAttachEventListeners()
    }, 1000)

    // 再设置一个更长的延迟重试，确保页面完全加载
    setTimeout(() => {
      tryAttachEventListeners()
    }, 3000)
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    const moderateContainer = document.querySelector('#moderate')
    if (!moderateContainer) {
      return
    }

    // 检查是否有我们添加的事件委托监听器标记
    const hasMouseOver = moderateContainer.hasAttribute('data-user-link-query-mouseover')
    const hasMouseOut = moderateContainer.hasAttribute('data-user-link-query-mouseout')

    if (hasMouseOver) {
      moderateContainer.removeEventListener('mouseover', onMouseOver)
      moderateContainer.removeAttribute('data-user-link-query-mouseover')
    }

    if (hasMouseOut) {
      moderateContainer.removeEventListener('mouseout', onMouseOut)
      moderateContainer.removeAttribute('data-user-link-query-mouseout')
    }
  }

  /**
   * 设置页面变化监听器
   */
  const setupPageChangeListener = (): void => {
    // 移除现有的监听器
    if (pageChangeListener) {
      window.removeEventListener('popstate', pageChangeListener)
      pageChangeListener = null
    }

    // 创建新的监听器
    pageChangeListener = () => {
      if (isManagementPage()) {
        attachEventListeners()
      } else {
        removeEventListeners()
      }
    }

    // 添加监听器
    window.addEventListener('popstate', pageChangeListener)

    // 同时监听 hashchange 事件（用于单页应用导航）
    window.addEventListener('hashchange', pageChangeListener)
  }

  /**
   * 移除页面变化监听器
   */
  const removePageChangeListener = (): void => {
    if (pageChangeListener) {
      window.removeEventListener('popstate', pageChangeListener)
      window.removeEventListener('hashchange', pageChangeListener)
      pageChangeListener = null
    }
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    try {
      const result = await browser.storage.local.get(STORAGE_KEY)
      const storedValue = result[STORAGE_KEY] as boolean | undefined
      isEnabled = storedValue ?? userLinkQueryConfig.defaultEnabled
    } catch (error) {
      console.error('加载用户链接查询配置失败:', error)
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
      console.error('保存用户链接查询配置失败:', error)
    }
  }

  /**
   * 启用用户链接查询功能
   */
  const enable = (): void => {
    // 即使 isEnabled 已经是 true，也需要执行初始化逻辑
    // 因为可能在初始化时配置已经是 true，但还没有执行实际的启用逻辑
    const wasEnabled = isEnabled
    isEnabled = true

    // 如果之前不是启用状态，保存配置
    if (!wasEnabled) {
      void saveConfig()
    }

    // 确保样式和悬浮层已创建
    injectStyles()
    createPopup()

    // 检查当前页面是否是管理页面
    const isManagementPageNow = isManagementPage()

    if (isManagementPageNow) {
      attachEventListeners()

      // 额外：在页面完全加载后再次检查
      if (document.readyState !== 'complete') {
        // 移除现有的 load 事件监听器
        if (loadEventListener) {
          window.removeEventListener('load', loadEventListener)
          loadEventListener = null
        }

        // 创建新的 load 事件监听器
        loadEventListener = () => {
          attachEventListeners()
        }

        window.addEventListener('load', loadEventListener)
      }
    } else {
      // 监听页面变化，当导航到管理页面时附加事件监听器
      setupPageChangeListener()
    }
  }

  /**
   * 禁用用户链接查询功能
   */
  const disable = (): void => {
    if (!isEnabled) return

    isEnabled = false

    // 清除隐藏定时器
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }

    // 移除 load 事件监听器
    if (loadEventListener) {
      window.removeEventListener('load', loadEventListener)
      loadEventListener = null
    }

    void saveConfig()
    removeStyles()
    removeEventListeners()
    removePopup()
    removePageChangeListener()
  }

  /**
   * 切换功能状态
   */
  const toggle = async (): Promise<boolean> => {
    if (isEnabled) {
      disable()
    } else {
      enable()
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
      enable()
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
 * @deprecated 请使用 createUserLinkQuery() 函数
 */
export class UserLinkQueryManager {
  private instance: IUserLinkQuery

  constructor() {
    this.instance = createUserLinkQuery()
  }

  enable(): void {
    return this.instance.enable()
  }

  disable(): void {
    return this.instance.disable()
  }

  async toggle(): Promise<boolean> {
    return this.instance.toggle()
  }

  getStatus(): boolean {
    return this.instance.getStatus()
  }
}
