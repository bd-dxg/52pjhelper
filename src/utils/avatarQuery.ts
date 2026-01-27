/**
 * 头像查询工具类
 * 功能：鼠标移动到头像时显示用户违规记录
 */

import avatarQueryConfig from '@/configs/avatarQuery.json'
import { fetchUserViolation, extractUidFromHref } from './userViolationFetcher'

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

  /**
   * 注入样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .p_pop.blk.bui {
        width: 620px !important;
        height: unset !important;
        background-color: #fdfdfd8f !important;
        z-index: 99999 !important;
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
   * 显示违规信息
   */
  const showInfo = (dom: HTMLImageElement, info: Element | null): void => {
    const card = dom.closest('.pls.cl.favatar')?.querySelector('.p_pop.blk.bui')
    if (!card) {
      console.error('未找到卡片容器')
      return
    }

    const existingTable = card.querySelector('table')
    const existingDiv = card.querySelector('div[data-avatar-query]')

    if (info) {
      // 有违规记录
      if (existingTable) {
        existingTable.replaceWith(info)
      } else if (existingDiv) {
        existingDiv.replaceWith(info)
      } else {
        card.appendChild(info)
      }
    } else {
      // 没有违规记录
      const div = document.createElement('div')
      div.setAttribute('data-avatar-query', 'true')
      div.innerText = '没有违规记录'

      if (existingTable) {
        existingTable.replaceWith(div)
      } else if (existingDiv) {
        existingDiv.replaceWith(div)
      } else {
        card.appendChild(div)
      }
    }
  }

  /**
   * 鼠标移入事件处理
   */
  const handleMouseEnter = async (e: Event): Promise<void> => {
    const target = e.target as HTMLImageElement
    const parentLink = target.parentNode as HTMLAnchorElement

    if (!parentLink?.href) {
      console.error('未找到父级链接')
      return
    }

    const uid = extractUidFromHref(parentLink.href)
    if (!uid) {
      console.error('未匹配到uid')
      return
    }

    try {
      const violationInfo = await fetchUserViolation(uid)
      showInfo(target, violationInfo)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  /**
   * 附加事件监听器
   */
  const attachEventListeners = (): void => {
    // 处理头像链接
    const imgs = document.querySelectorAll('.avatar>a>img')
    imgs?.forEach((img) => {
      img.addEventListener('mouseenter', handleMouseEnter)
    })
  }

  /**
   * 移除事件监听器
   */
  const removeEventListeners = (): void => {
    // 移除头像链接事件监听器
    const imgs = document.querySelectorAll('.avatar>a>img')
    imgs?.forEach((img) => {
      img.removeEventListener('mouseenter', handleMouseEnter)
    })
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    // 查找所有用户卡片
    const cards = document.querySelectorAll('.p_pop.blk.bui')
    cards.forEach((card) => {
      // 移除我们添加的违规信息表格
      const injectedTable = card.querySelector('table')
      injectedTable?.remove()

      // 移除我们添加的"没有违规记录"提示
      const injectedDiv = card.querySelector('div[data-avatar-query]')
      injectedDiv?.remove()
    })
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    try {
      const result = await browser.storage.local.get(STORAGE_KEY)
      isEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? avatarQueryConfig.defaultEnabled
    } catch (error) {
      console.error('加载头像查询配置失败:', error)
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
      console.error('保存头像查询配置失败:', error)
    }
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

/**
 * 为了保持向后兼容，导出一个类包装器
 * @deprecated 请使用 createAvatarQuery() 函数
 */
export class AvatarQueryManager {
  private instance: IAvatarQuery

  constructor() {
    this.instance = createAvatarQuery()
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
