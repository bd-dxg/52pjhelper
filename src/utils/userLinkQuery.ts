/**
 * 用户链接查询工具类
 * 功能：在管理页面鼠标移动到用户名链接时显示用户违规记录
 */

import userLinkQueryConfig from '@/configs/userLinkQuery.json'

const USER_LINK_QUERY_STORAGE_KEY = userLinkQueryConfig.storageKey

/**
 * 用户链接查询管理类
 */
export class UserLinkQueryManager {
  private isEnabled: boolean = false

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
      this.attachEventListeners()
    }
  }

  /**
   * 从存储加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await browser.storage.local.get(USER_LINK_QUERY_STORAGE_KEY)
      this.isEnabled = (result[USER_LINK_QUERY_STORAGE_KEY] as boolean | undefined) ?? false
    } catch (error) {
      console.error('加载用户链接查询配置失败:', error)
      this.isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [USER_LINK_QUERY_STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存用户链接查询配置失败:', error)
    }
  }

  /**
   * 启用用户链接查询功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.attachEventListeners()
  }

  /**
   * 禁用用户链接查询功能
   */
  public async disable(): Promise<void> {
    if (!this.isEnabled) return // 如果已经禁用，直接返回

    this.isEnabled = false
    await this.saveConfig()
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
   * 附加事件监听器
   */
  private attachEventListeners(): void {
    // 检查是否在管理页面
    if (!this.isManagementPage()) return

    // 处理用户名链接
    const userLinks = document.querySelectorAll('#moderate .um .pbn span[class="xi2"] a')
    if (userLinks) {
      userLinks.forEach((link) => {
        link.addEventListener('mouseenter', this.handleUserLinkMouseEnter)
        link.addEventListener('mouseleave', this.handleUserLinkMouseLeave)
      })
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    // 检查是否在管理页面
    if (!this.isManagementPage()) return

    // 移除用户名链接事件监听器
    const userLinks = document.querySelectorAll('#moderate .um .pbn span[class="xi2"] a')
    if (userLinks) {
      userLinks.forEach((link) => {
        link.removeEventListener('mouseenter', this.handleUserLinkMouseEnter)
        link.removeEventListener('mouseleave', this.handleUserLinkMouseLeave)
      })
    }
  }

  /**
   * 清理已注入的内容
   */
  private cleanupInjectedContent(): void {
    // 清理用户名链接的悬浮层
    const popups = document.querySelectorAll('.quick-query-popup')
    popups.forEach((popup) => {
      popup.remove()
    })
  }

  /**
   * 检查是否在管理页面
   */
  private isManagementPage(): boolean {
    const url = window.location.href
    return url.includes('forum.php?mod=modcp&action=moderate&op=threads')
  }

  /**
   * 用户名链接鼠标移出事件处理
   */
  private handleUserLinkMouseLeave = (e: Event): void => {
    const target = e.target as HTMLAnchorElement
    const popup = target.querySelector('.quick-query-popup')
    if (popup) {
      popup.remove()
    }
  }

  /**
   * 用户名链接鼠标移入事件处理
   */
  private handleUserLinkMouseEnter = async (e: Event): Promise<void> => {
    const target = e.target as HTMLAnchorElement

    if (!target || !target.href) {
      console.error('未找到用户链接')
      return
    }

    const uidMatch = target.href.match(/uid=(\d+)/)
    if (!uidMatch || !uidMatch[1]) {
      console.error('未匹配到uid')
      return
    }

    const uid = uidMatch[1]
    const userInfoUrl = `https://www.52pojie.cn/home.php?mod=space&uid=${uid}&do=profile&from=space`

    try {
      const response = await fetch(userInfoUrl)
      const blob = await response.blob()

      // 使用 FileReader 将 blob 转换为 GBK 编码的文本
      const reader = new FileReader()
      reader.readAsText(blob, 'gbk')

      reader.onload = () => {
        const parser = new DOMParser()
        const pageHtml = parser.parseFromString(reader.result as string, 'text/html')
        const violationInfo = pageHtml.querySelector('#pcr')
        this.showUserLinkInfo(target, violationInfo)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  /**
   * 显示用户链接的违规信息
   * @param dom 当前链接节点
   * @param info 当前用户违规信息
   */
  private showUserLinkInfo(dom: HTMLAnchorElement, info: Element | null): void {
    // 检查是否已经有悬浮层
    let popup = dom.querySelector('.quick-query-popup') as HTMLDivElement
    if (!popup) {
      // 创建悬浮层
      popup = document.createElement('div') as HTMLDivElement
      popup.className = 'quick-query-popup'
      popup.style.cssText = `
        position: absolute;
        background: #fdfdfd;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 99999;
        width: 620px;
        word-wrap: break-word;
        margin-top: 5px;
      `
      dom.style.position = 'relative'
      dom.appendChild(popup)
    }

    if (info) {
      // 有违规记录
      popup.innerHTML = ''
      popup.appendChild(info.cloneNode(true))
    } else {
      // 没有违规记录
      popup.innerText = '没有违规记录'
    }

    // 调整悬浮层位置
    popup.style.left = '0'
    popup.style.top = '100%'
  }
}
