/**
 * 头像查询工具类
 * 功能：鼠标移动到头像时显示用户违规记录
 */

import avatarQueryConfig from '@/configs/avatarQuery.json'
import { fetchUserViolation, extractUidFromHref } from './userViolationFetcher'

const AVATAR_QUERY_STORAGE_KEY = avatarQueryConfig.storageKey

/**
 * 头像查询管理类
 */
export class AvatarQueryManager {
  private isEnabled: boolean = false
  private styleElement: HTMLStyleElement | null = null

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
      const result = await browser.storage.local.get(AVATAR_QUERY_STORAGE_KEY)
      this.isEnabled = (result[AVATAR_QUERY_STORAGE_KEY] as boolean | undefined) ?? avatarQueryConfig.defaultEnabled
    } catch (error) {
      console.error('加载头像查询配置失败:', error)
      this.isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [AVATAR_QUERY_STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存头像查询配置失败:', error)
    }
  }

  /**
   * 启用头像查询功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.injectStyles()
    this.attachEventListeners()
  }

  /**
   * 禁用头像查询功能
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
      .p_pop.blk.bui {
        width: 620px !important;
        height: unset !important;
        background-color: #fdfdfd8f !important;
        z-index: 99999 !important;
      }
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
    // 处理头像链接
    const imgs = document.querySelectorAll('.avatar>a>img')
    if (imgs) {
      imgs.forEach((img) => {
        img.addEventListener('mouseenter', this.handleMouseEnter)
      })
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    // 移除头像链接事件监听器
    const imgs = document.querySelectorAll('.avatar>a>img')
    if (imgs) {
      imgs.forEach((img) => {
        img.removeEventListener('mouseenter', this.handleMouseEnter)
      })
    }
  }

  /**
   * 清理已注入的内容
   */
  private cleanupInjectedContent(): void {
    // 查找所有用户卡片
    const cards = document.querySelectorAll('.p_pop.blk.bui')
    cards.forEach((card) => {
      // 移除我们添加的违规信息表格
      const injectedTable = card.querySelector('table')
      if (injectedTable) {
        injectedTable.remove()
      }

      // 移除我们添加的"没有违规记录"提示
      const injectedDiv = card.querySelector('div[data-avatar-query]')
      if (injectedDiv) {
        injectedDiv.remove()
      }
    })
  }

  /**
   * 鼠标移入事件处理
   */
  private handleMouseEnter = async (e: Event): Promise<void> => {
    const target = e.target as HTMLImageElement
    const parentLink = target.parentNode as HTMLAnchorElement

    if (!parentLink || !parentLink.href) {
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
      this.showInfo(target, violationInfo)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  /**
   * 显示违规信息
   * @param dom 当前图像节点
   * @param info 当前用户违规信息
   */
  private showInfo(dom: HTMLImageElement, info: Element | null): void {
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
}
