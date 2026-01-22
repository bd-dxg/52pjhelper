/**
 * 便捷查询工具类
 * 功能：鼠标移动到头像时显示用户违规记录
 */

const STORAGE_KEY = 'quickQueryEnabled'

/**
 * 便捷查询管理类
 */
export class QuickQueryManager {
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
      const result = await browser.storage.local.get(STORAGE_KEY)
      this.isEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? false
    } catch (error) {
      console.error('加载便捷查询配置失败:', error)
      this.isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存便捷查询配置失败:', error)
    }
  }

  /**
   * 启用便捷查询功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.injectStyles()
    this.attachEventListeners()
  }

  /**
   * 禁用便捷查询功能
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
        width: 600px !important;
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
      const injectedDiv = card.querySelector('div[data-quick-query]')
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

    const uidMatch = parentLink.href.match(/uid=(\d+)/)
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
        this.showInfo(target, violationInfo)
      }
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
    const existingDiv = card.querySelector('div[data-quick-query]')

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
      div.setAttribute('data-quick-query', 'true')
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
