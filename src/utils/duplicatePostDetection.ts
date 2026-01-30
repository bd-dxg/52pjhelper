/**
 * 重复发帖检测工具类
 * 功能：在论坛列表页面检测当天发布的重复发帖，高亮显示重复发帖的行
 */

import duplicatePostDetectionConfig from '@/configs/duplicatePostDetection.json'
import { urlMatcher } from './urlMatcher'
import { storageHelper } from './storageHelper'

const STORAGE_KEY = duplicatePostDetectionConfig.storageKey

/**
 * 重复发帖检测管理器接口
 */
export interface IDuplicatePostDetection {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建重复发帖检测管理器实例
 */
export function createDuplicatePostDetection(): IDuplicatePostDetection {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null

  /**
   * 注入高亮样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .duplicate-post-highlight {
        background-color: #fff3cd !important;
        border: 2px solid #ffc107 !important;
        border-radius: 4px;
      }

      .duplicate-post-highlight:hover {
        background-color: #ffeaa7 !important;
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
   * 移除所有高亮
   */
  const removeHighlights = (): void => {
    const highlightedRows = document.querySelectorAll('.duplicate-post-highlight')
    highlightedRows.forEach(row => {
      row.classList.remove('duplicate-post-highlight')
    })
  }

  /**
   * 检测重复发帖
   */
  const detectDuplicatePosts = (): void => {
    // 检查是否是目标页面
    const isTargetPage = urlMatcher.isTargetPage(window.location.href, duplicatePostDetectionConfig.targetPages)

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

        if (authorLink?.textContent) {
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
      authorCounts[post.author] ??= 0
      authorCounts[post.author]++
    })

    // 高亮重复作者的帖子
    const duplicateAuthors = Object.keys(authorCounts).filter(author => authorCounts[author] > 1)
    todayPosts.forEach(post => {
      if (duplicateAuthors.includes(post.author)) {
        post.row.classList.add('duplicate-post-highlight')
      }
    })
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, duplicatePostDetectionConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用重复发帖检测功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return // 如果已经启用，直接返回

    isEnabled = true
    await saveConfig()
    injectStyles()
    detectDuplicatePosts()
  }

  /**
   * 禁用重复发帖检测功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return // 如果已经禁用，直接返回

    isEnabled = false
    await saveConfig()
    removeStyles()
    removeHighlights()
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
      detectDuplicatePosts()
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