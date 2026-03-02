/**
 * 头像查询工具类
 * 功能：鼠标移动到头像时显示用户违规记录
 */

import avatarQueryConfig from '@/configs/avatarQuery.json'
import { fetchUserViolation, extractUidFromHref } from './userViolationFetcher'
import { storageHelper } from './storageHelper'

const STORAGE_KEY = avatarQueryConfig.storageKey

/**
 * 头像查询管理器接口
 */
export interface IAvatarQuery {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建头像查询管理器实例
 */
export function createAvatarQuery(): IAvatarQuery {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null
  let currentPopup: HTMLDivElement | null = null
  let observers: MutationObserver[] = []
  let isPopupHovered = false

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .avatar-query-popup {
        position: fixed !important;
        width: 620px !important;
        height: auto !important;
        max-height: 600px !important;
        overflow-y: auto !important;
        background-color: #fdfdfd !important;
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        z-index: 2147483647 !important;
        padding: 10px !important;
        display: none !important;
      }
      .avatar-query-popup.show {
        display: block !important;
      }
      .avatar-query-popup table {
        width: 100% !important;
        border-collapse: collapse !important;
      }
      .avatar-query-popup table th,
      .avatar-query-popup table td {
        padding: 5px !important;
        border: 1px solid #e0e0e0 !important;
        text-align: left !important;
      }
      .avatar-query-popup table th {
        background-color: #f5f5f5 !important;
        font-weight: bold !important;
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
   * 创建或获取弹窗元素
   */
  const getOrCreatePopup = (): HTMLDivElement => {
    if (!currentPopup) {
      currentPopup = document.createElement('div')
      currentPopup.className = 'avatar-query-popup'
      document.body.appendChild(currentPopup)

      // 鼠标进入弹窗时设置标志
      currentPopup.addEventListener('mouseenter', () => {
        isPopupHovered = true
      })

      // 鼠标离开弹窗时清除标志并隐藏
      currentPopup.addEventListener('mouseleave', () => {
        isPopupHovered = false
        hidePopup()
      })
    }
    return currentPopup
  }

  /**
   * 显示违规信息
   */
  const showInfo = (dom: HTMLImageElement, info: Element | null): void => {
    const popup = getOrCreatePopup()

    // 清空现有内容
    popup.innerHTML = ''

    if (info) {
      // 有违规记录
      popup.appendChild(info)
    } else {
      // 没有违规记录
      const div = document.createElement('div')
      div.innerText = '没有违规记录'
      popup.appendChild(div)
    }

    // 计算弹窗位置
    const rect = dom.getBoundingClientRect()

    // 尝试找到左侧容器(.pls)来对齐
    const avatarContainer = dom.closest('.pls.cl.favatar')
    const leftContainer = avatarContainer?.closest('.pls') as HTMLElement
    const containerRect = leftContainer?.getBoundingClientRect()

    const popupWidth = 620
    const popupHeight = popup.offsetHeight || 400

    // 默认显示在头像下方,左对齐到左侧容器
    let left = containerRect ? containerRect.left : rect.left
    let top = rect.bottom + 10

    // 如果右侧空间不足,向左调整
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - 10
    }

    // 确保不超出视口左侧
    if (left < 0) {
      left = 10
    }

    // 如果下方空间不足,显示在头像上方
    if (top + popupHeight > window.innerHeight) {
      top = rect.top - popupHeight - 10
    }

    // 如果上方也不够,固定在视口底部
    if (top < 0) {
      top = window.innerHeight - popupHeight - 10
    }

    popup.style.left = `${left}px`
    popup.style.top = `${top}px`
    popup.classList.add('show')
  }

  /**
   * 隐藏弹窗
   */
  const hidePopup = (): void => {
    if (currentPopup) {
      currentPopup.classList.remove('show')
    }
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = (): void => {
    // 查找所有系统卡片
    const systemCards = document.querySelectorAll('.p_pop.blk.bui')

    systemCards.forEach((card) => {
      const cardElement = card as HTMLElement

      // 创建 MutationObserver 监听 style 属性变化
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const display = cardElement.style.display

            if (display !== 'none') {
              // 系统卡片显示,显示违规记录弹窗
              const avatarContainer = cardElement.closest('.pls.cl.favatar')
              const img = avatarContainer?.querySelector('.avatar img') as HTMLImageElement

              if (img) {
                const parentLink = img.parentNode as HTMLAnchorElement
                if (parentLink?.href) {
                  const uid = extractUidFromHref(parentLink.href)
                  if (uid) {
                    fetchUserViolation(uid).then((violationInfo) => {
                      showInfo(img, violationInfo)
                    }).catch((error) => {
                      console.error('获取用户信息失败:', error)
                    })
                  }
                }
              }
            } else {
              // 系统卡片隐藏,只有在鼠标不在弹窗上时才隐藏
              if (!isPopupHovered) {
                hidePopup()
              }
            }
          }
        })
      })

      // 监听 style 属性变化
      observer.observe(cardElement, {
        attributes: true,
        attributeFilter: ['style']
      })

      observers.push(observer)
    })
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    // 断开所有 MutationObserver
    observers.forEach((observer) => {
      observer.disconnect()
    })
    observers = []
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    // 移除弹窗元素
    if (currentPopup) {
      currentPopup.remove()
      currentPopup = null
    }
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, avatarQueryConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用头像查询功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    injectStyles()
    attachEventListeners()
  }

  /**
   * 禁用头像查询功能
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