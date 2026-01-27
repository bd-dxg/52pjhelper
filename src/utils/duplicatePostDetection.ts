/**
 * 重复发帖检测工具类
 * 功能：在论坛列表页面检测当天发布的重复发帖，高亮显示重复发帖的行
 */

import duplicatePostDetectionConfig from '@/configs/duplicatePostDetection.json'

const DUPLICATE_POST_DETECTION_STORAGE_KEY = duplicatePostDetectionConfig.storageKey

/**
 * 重复发帖检测管理类
 */
export class DuplicatePostDetectionManager {
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
      this.detectDuplicatePosts()
    }
  }

  /**
   * 从存储加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const result = await browser.storage.local.get(DUPLICATE_POST_DETECTION_STORAGE_KEY)
      this.isEnabled = (result[DUPLICATE_POST_DETECTION_STORAGE_KEY] as boolean | undefined) ?? duplicatePostDetectionConfig.defaultEnabled
    } catch (error) {
      console.error('加载重复发帖检测配置失败:', error)
      this.isEnabled = false
    }
  }

  /**
   * 保存配置到存储
   */
  private async saveConfig(): Promise<void> {
    try {
      await browser.storage.local.set({ [DUPLICATE_POST_DETECTION_STORAGE_KEY]: this.isEnabled })
    } catch (error) {
      console.error('保存重复发帖检测配置失败:', error)
    }
  }

  /**
   * 启用重复发帖检测功能
   */
  public async enable(): Promise<void> {
    if (this.isEnabled) return // 如果已经启用，直接返回

    this.isEnabled = true
    await this.saveConfig()
    this.injectStyles()
    this.detectDuplicatePosts()
  }

  /**
   * 禁用重复发帖检测功能
   */
  public async disable(): Promise<void> {
    if (!this.isEnabled) return // 如果已经禁用，直接返回

    this.isEnabled = false
    await this.saveConfig()
    this.removeStyles()
    this.removeHighlights()
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
   * 注入高亮样式
   */
  private injectStyles(): void {
    if (this.styleElement) return

    this.styleElement = document.createElement('style')
    this.styleElement.textContent = `
      .duplicate-post-highlight {
        background-color: #fff3cd !important;
        border: 2px solid #ffc107 !important;
        border-radius: 4px;
      }

      .duplicate-post-highlight:hover {
        background-color: #ffeaa7 !important;
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
   * 移除所有高亮
   */
  private removeHighlights(): void {
    const highlightedRows = document.querySelectorAll('.duplicate-post-highlight')
    highlightedRows.forEach(row => {
      row.classList.remove('duplicate-post-highlight')
    })
  }

  /**
   * 检测重复发帖
   */
  private detectDuplicatePosts(): void {
    // 检查是否是目标页面
    const isTargetPage = duplicatePostDetectionConfig.targetPages.some(page => {
      // 支持精确匹配和模糊匹配
      if (page.includes('*')) {
        // 模糊匹配（简单的通配符支持）
        const regexPattern = page.replace(/\*/g, '.*').replace(/\?/g, '.')
        const regex = new RegExp(`^${regexPattern}$`)
        return regex.test(window.location.href)
      } else {
        // 精确匹配
        return window.location.href === page
      }
    })

    if (!isTargetPage) {
      return
    }

    // 获取当天日期字符串（不含时间）
    const today = new Date()
    const todayStr1 = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const todayStr2 = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

    // 获取所有符合条件的帖子行
    const threadRows = document.querySelectorAll('tbody[id*="normalthread_"] tr')

    // 用于存储当天发布的帖子作者信息
    const todayPosts: { author: string; row: Element }[] = []

    threadRows.forEach(row => {
      // 检查发布日期是否为当天
      const dateSpan = row.querySelector('.by span')

      if (dateSpan && (dateSpan.textContent?.includes(todayStr1) || dateSpan.textContent?.includes(todayStr2))) {
        // 获取作者信息（cite a[c="1"]）
        const authorLink = row.querySelector('th[class="common"] + .by cite a[c="1"]')

        if (authorLink && authorLink.textContent) {
          const author = authorLink.textContent.trim()
          todayPosts.push({
            author: author,
            row: row
          })
        }
      }
    })

    // 查找重复作者的帖子
    const authorCounts: { [key: string]: number } = {}
    todayPosts.forEach(post => {
      authorCounts[post.author] = (authorCounts[post.author] || 0) + 1
    })

    // 高亮重复作者的帖子
    const duplicateAuthors = Object.keys(authorCounts).filter(author => authorCounts[author] > 1)
    todayPosts.forEach(post => {
      if (duplicateAuthors.includes(post.author)) {
        post.row.classList.add('duplicate-post-highlight')
      }
    })
  }
}