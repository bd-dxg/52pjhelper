/**
 * 用户黑名单工具类
 * 功能：高亮显示黑名单用户，鼠标悬停显示网盘信息
 */

import userBlacklistConfig from '@/configs/userBlacklist.json'
import { storageHelper } from './storageHelper'

/**
 * 网盘记录接口
 * @property provider 网盘厂商（如"百度"、"夸克"、"迅雷"等）
 * @property id 网盘ID（可能包含*号隐藏部分）
 * @property postLink 帖子链接（可能为空）
 * @property recorder 记录者（管理员用户名）
 */
interface CloudStorageRecord {
  provider: string
  id: string
  postLink: string
  recorder: string
}

/**
 * 用户黑名单条目接口
 * @property forumId 论坛ID（唯一标识）
 * @property cloudStorages 网盘记录数组
 * @property note 备注信息（可选）
 */
interface UserBlacklistItem {
  forumId: string
  cloudStorages: CloudStorageRecord[]
  note?: string
}

/**
 * 黑名单数据类型
 */
type UserBlacklistData = UserBlacklistItem[]

// 存储键常量
const STORAGE_KEY = userBlacklistConfig.storageKey
const DATA_STORAGE_KEY = userBlacklistConfig.dataStorageKey
const LAST_UPDATE_KEY = userBlacklistConfig.lastUpdateKey
const AUTO_UPDATE_INTERVAL = userBlacklistConfig.autoUpdateInterval
const USERNAME_SELECTOR = userBlacklistConfig.usernameSelector

// 默认黑名单数据（示例数据）
const DEFAULT_BLACKLIST_DATA: UserBlacklistData = [
  {
    forumId: 'wucloudbai',
    cloudStorages: [
      {
        provider: '百度',
        id: 'wucloudbai',
        postLink: 'https://www.52pojie.cn/thread-2090559-1-1.html',
        recorder: 'bian96'
      },
      {
        provider: '百度',
        id: '库小**72',
        postLink: 'https://www.52pojie.cn/thread-2054816-1-1.html',
        recorder: 'bian96'
      },
      {
        provider: '夸克',
        id: '乐观*朗的猫头鹰',
        postLink: '',
        recorder: ''
      }
    ]
  }
]

/**
 * 用户黑名单管理器接口
 */
export interface IUserBlacklist {
  /** 启用功能 */
  enable(): Promise<void>
  /** 禁用功能 */
  disable(): Promise<void>
  /** 切换功能状态 */
  toggle(): Promise<boolean>
  /** 获取功能状态 */
  getStatus(): boolean
  /** 手动更新黑名单数据 */
  updateData(data: UserBlacklistData): Promise<void>
  /** 获取黑名单数据 */
  getData(): Promise<UserBlacklistData>
  /** 检查是否需要自动更新 */
  shouldAutoUpdate(): Promise<boolean>
}

/**
 * 创建用户黑名单管理器实例
 */
export function createUserBlacklist(): IUserBlacklist {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null
  let currentPopup: HTMLDivElement | null = null
  let observers: MutationObserver[] = []
  let isPopupHovered = false
  let blacklistData: UserBlacklistData = []
  let blacklistIds = new Set<string>() // 用于快速查找的Set
  let scanDebounceTimer: number | null = null
  const SCAN_DEBOUNCE_DELAY = 300 // 防抖延迟时间（毫秒）

  /**
   * 加载黑名单数据
   */
  const loadBlacklistData = async (): Promise<void> => {
    blacklistData = await storageHelper.loadArray<UserBlacklistItem>(
      DATA_STORAGE_KEY,
      DEFAULT_BLACKLIST_DATA
    )
    // 更新快速查找Set
    blacklistIds = new Set(blacklistData.map(item => item.forumId.toLowerCase()))
  }

  /**
   * 保存黑名单数据
   */
  const saveBlacklistData = async (data: UserBlacklistData): Promise<void> => {
    await storageHelper.saveArray(DATA_STORAGE_KEY, data)
    blacklistData = data
    blacklistIds = new Set(data.map(item => item.forumId.toLowerCase()))

    // 更新最后更新时间
    await storageHelper.saveNumber(LAST_UPDATE_KEY, Date.now())
  }

  /**
   * 检查是否需要自动更新
   */
  const shouldAutoUpdate = async (): Promise<boolean> => {
    const lastUpdate = await storageHelper.loadNumber(LAST_UPDATE_KEY, 0)
    const now = Date.now()
    return now - lastUpdate > AUTO_UPDATE_INTERVAL
  }

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .user-blacklist-highlight {
        background-color: black !important;
        color: white !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        cursor: help !important;
      }
      .user-blacklist-popup {
        position: fixed !important;
        width: 400px !important;
        max-height: 300px !important;
        overflow-y: auto !important;
        background-color: #fdfdfde5 !important;
        backdrop-filter: blur(8px);
        border: 1px solid #ccc !important;
        border-radius: 5px !important;
        box-shadow: 0 0 10px #0000000a,0 3px 10px #0000002b;
        z-index: 9999 !important;
        display: none !important;
        padding: 10px !important;
        font-size: 12px !important;
      }
      .user-blacklist-popup.show {
        display: block !important;
      }
      .user-blacklist-popup table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin-top: 5px !important;
      }
      .user-blacklist-popup table th,
      .user-blacklist-popup table td {
        padding: 4px !important;
        border: 1px solid #e0e0e0 !important;
        text-align: left !important;
      }
      .user-blacklist-popup table th {
        background-color: #f5f5f5 !important;
        font-weight: bold !important;
      }
      .user-blacklist-popup .no-data {
        text-align: center !important;
        color: #666 !important;
        padding: 10px !important;
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
      currentPopup.className = 'user-blacklist-popup'
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
   * 显示用户信息
   */
  const showUserInfo = (usernameElement: HTMLAnchorElement, forumId: string): void => {
    const popup = getOrCreatePopup()

    // 查找用户数据
    const userData = blacklistData.find(item =>
      item.forumId.toLowerCase() === forumId.toLowerCase()
    )

    // 清空现有内容
    popup.innerHTML = ''

    if (userData && userData.cloudStorages.length > 0) {
      // 创建表格显示网盘信息
      const table = document.createElement('table')

      // 表头
      const thead = document.createElement('thead')
      const headerRow = document.createElement('tr')
      ;['网盘厂商', '网盘ID', '帖子链接', '记录者'].forEach(text => {
        const th = document.createElement('th')
        th.textContent = text
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)

      // 表格内容
      const tbody = document.createElement('tbody')
      userData.cloudStorages.forEach(storage => {
        const row = document.createElement('tr')

        // 网盘厂商
        const providerCell = document.createElement('td')
        providerCell.textContent = storage.provider || '-'
        row.appendChild(providerCell)

        // 网盘ID
        const idCell = document.createElement('td')
        idCell.textContent = storage.id || '-'
        row.appendChild(idCell)

        // 帖子链接
        const linkCell = document.createElement('td')
        if (storage.postLink) {
          const link = document.createElement('a')
          link.href = storage.postLink
          link.textContent = '查看帖子'
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          linkCell.appendChild(link)
        } else {
          linkCell.textContent = '-'
        }
        row.appendChild(linkCell)

        // 记录者
        const recorderCell = document.createElement('td')
        recorderCell.textContent = storage.recorder || '-'
        row.appendChild(recorderCell)

        tbody.appendChild(row)
      })
      table.appendChild(tbody)

      // 备注信息
      if (userData.note) {
        const noteDiv = document.createElement('div')
        noteDiv.style.marginTop = '10px'
        noteDiv.style.fontSize = '11px'
        noteDiv.style.color = '#666'
        noteDiv.textContent = `备注: ${userData.note}`
        popup.appendChild(noteDiv)
      }

      popup.appendChild(table)
    } else {
      // 没有数据
      const noDataDiv = document.createElement('div')
      noDataDiv.className = 'no-data'
      noDataDiv.textContent = '没有网盘记录'
      popup.appendChild(noDataDiv)
    }

    // 计算弹窗位置（复用头像查询的定位逻辑）
    const rect = usernameElement.getBoundingClientRect()
    const popupRect = popup.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const gap = 10

    // 默认显示在用户名右侧
    let left = rect.right + gap
    let top = rect.top

    // 如果右侧空间不足，显示在左侧
    if (left + popupRect.width > viewportWidth - 10) {
      left = rect.left - popupRect.width - gap
    }

    // 如果左侧空间也不足，显示在下方
    if (left < 10) {
      left = 10
      top = rect.bottom + gap
    }

    // 确保弹窗在视口范围内
    if (top + popupRect.height > viewportHeight - 10) {
      top = viewportHeight - popupRect.height - 10
    }

    if (top < 10) {
      top = 10
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
   * 处理用户名元素
   */
  const processUsernameElement = (element: HTMLAnchorElement): void => {
    const username = element.textContent?.trim()
    if (!username) return

    // 检查是否在黑名单中
    if (blacklistIds.has(username.toLowerCase())) {
      // 添加高亮样式
      element.classList.add('user-blacklist-highlight')

      // 添加鼠标事件
      element.addEventListener('mouseenter', () => {
        showUserInfo(element, username)
      })

      element.addEventListener('mouseleave', () => {
        // 延迟隐藏，避免鼠标移动到弹窗时立即隐藏
        setTimeout(() => {
          if (!isPopupHovered) {
            hidePopup()
          }
        }, 100)
      })
    }
  }

  /**
   * 扫描并处理所有用户名元素
   */
  const scanAndProcessUsernames = (): void => {
    const usernameElements = document.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
    usernameElements.forEach(processUsernameElement)
  }

  /**
   * 防抖扫描
   */
  const debouncedScan = (): void => {
    if (scanDebounceTimer) {
      clearTimeout(scanDebounceTimer)
    }
    scanDebounceTimer = window.setTimeout(() => {
      scanAndProcessUsernames()
      scanDebounceTimer = null
    }, SCAN_DEBOUNCE_DELAY)
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = (): void => {
    // 初始扫描
    scanAndProcessUsernames()

    // 创建 MutationObserver 监听DOM变化
    const observer = new MutationObserver(mutations => {
      let hasUsernameChanges = false

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // 检查新增的节点中是否有用户名元素
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              // 检查元素本身
              if (element.matches && element.matches(USERNAME_SELECTOR)) {
                hasUsernameChanges = true
              }
              // 检查元素后代
              const usernameElements = element.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
              if (usernameElements.length > 0) {
                hasUsernameChanges = true
              }
            }
          })
        }
      })

      // 如果有用户名变化，进行防抖扫描
      if (hasUsernameChanges) {
        debouncedScan()
      }
    })

    // 监听整个文档的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    observers.push(observer)
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    // 断开所有 MutationObserver
    observers.forEach(observer => {
      observer.disconnect()
    })
    observers = []

    // 移除所有高亮样式和事件监听器
    const highlightedElements = document.querySelectorAll<HTMLAnchorElement>('.user-blacklist-highlight')
    highlightedElements.forEach(element => {
      element.classList.remove('user-blacklist-highlight')
      // 注意：这里无法直接移除匿名事件监听器，但移除元素时会自动清理
    })
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
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, userBlacklistConfig.defaultEnabled)
    await loadBlacklistData()
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用用户黑名单功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return

    isEnabled = true
    await saveConfig()
    injectStyles()
    attachEventListeners()
  }

  /**
   * 禁用用户黑名单功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return

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
   * 手动更新黑名单数据
   */
  const updateData = async (data: UserBlacklistData): Promise<void> => {
    await saveBlacklistData(data)

    // 如果功能已启用，重新处理用户名元素
    if (isEnabled) {
      removeEventListeners()
      await loadBlacklistData()
      attachEventListeners()
    }
  }

  /**
   * 获取黑名单数据
   */
  const getData = async (): Promise<UserBlacklistData> => {
    await loadBlacklistData()
    return blacklistData
  }

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
    getStatus,
    updateData,
    getData,
    shouldAutoUpdate,
  }
}