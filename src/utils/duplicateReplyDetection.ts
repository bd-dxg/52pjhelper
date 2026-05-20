/**
 * 重复回帖检测工具类
 * 功能：在帖子详情页面检测当天内同一用户的多次回帖，高亮显示重复回帖的楼层
 */

import duplicateReplyDetectionConfig from '@/configs/duplicateReplyDetection.json'
import { urlMatcher } from './urlMatcher'
import { storageHelper } from './storageHelper'

const STORAGE_KEY = duplicateReplyDetectionConfig.storageKey

interface ReplyInfo {
  element: Element
  uid: string
  username: string
  floor: string
  time: string
}

/**
 * 重复回帖检测管理器接口
 */
export interface IDuplicateReplyDetection {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建重复回帖检测管理器实例
 */
export function createDuplicateReplyDetection(): IDuplicateReplyDetection {
  let isEnabled = false
  let styleElement: HTMLStyleElement | null = null

  /**
   * 注入高亮样式
   */
  const injectStyles = (): void => {
    if (styleElement) return

    styleElement = document.createElement('style')
    styleElement.textContent = `
      .duplicate-reply-highlight {
        background-color: #fff3cd !important;
        border-left: 4px solid #ffc107 !important;
      }

      .duplicate-reply-highlight .plc .pi strong a {
        color: #dc3545 !important;
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
   * 移除所有高亮
   */
  const removeHighlights = (): void => {
    const highlightedPosts = document.querySelectorAll('.duplicate-reply-highlight')
    highlightedPosts.forEach(post => {
      post.classList.remove('duplicate-reply-highlight')
    })
  }

  /**
   * 获取当前日期字符串（标准化格式）
   * 返回 "YYYY-M-D" 格式，与论坛时间格式一致
   */
  const getTodayString = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    return `${year}-${month}-${day}`
  }

  /**
   * 从时间字符串中提取日期部分
   * 论坛时间格式: "2026-5-20 09:39" -> "2026-5-20"
   */
  const extractDateFromTime = (timeStr: string): string => {
    // 按空格分割，取第一部分作为日期
    const parts = timeStr.split(' ')
    return parts[0] ?? ''
  }

  /**
   * 获取所有回帖信息
   * DOM 选择器说明:
   * - [id^="post_"] 匹配所有回帖容器（Discuz 论坛标准结构）
   * - 排除 post_reply, post_new, post_replytmp 等非回帖元素
   * - 排除包含 post_rate 的评分元素
   */
  const getAllReplies = (): ReplyInfo[] => {
    const posts = Array.from(document.querySelectorAll('[id^="post_"]')).filter(p => {
      return !['post_reply', 'post_new', 'post_replytmp'].includes(p.id) &&
        !p.id.includes('post_rate')
    })

    return posts.map(post => {
      // 获取用户名
      const userEl = post.querySelector('.authi a.xw1')
      const username = userEl?.textContent?.trim() ?? 'N/A'

      // 获取用户 UID
      const userLink = userEl?.getAttribute('href') ?? ''
      const uidMatch = userLink.match(/uid=(\d+)/)
      const uid = uidMatch?.[1] ?? 'N/A'

      // 获取楼层号
      const floorEl = post.querySelector('.pi strong a')
      const floor = floorEl?.textContent?.trim() ?? 'N/A'

      // 获取发帖时间
      const timeEl = post.querySelector('em[id^="authorposton"]')
      const time = timeEl?.textContent?.replace('发表于', '').trim() ?? 'N/A'

      return {
        element: post,
        uid,
        username,
        floor,
        time
      }
    })
  }

  /**
   * 检测重复回帖
   */
  const detectDuplicateReplies = (): void => {
    // 检查是否是目标页面
    const isTargetPage = urlMatcher.isTargetPage(window.location.href, duplicateReplyDetectionConfig.targetPages)

    if (!isTargetPage) {
      return
    }

    const todayStr = getTodayString()
    const allReplies = getAllReplies()

    // 筛选今天的回帖（精确匹配日期部分，避免 "5-2" 误匹配 "5-20"）
    const todayReplies = allReplies.filter(reply => {
      const replyDate = extractDateFromTime(reply.time)
      return replyDate === todayStr
    })

    // 统计每个用户今天的回帖次数
    const userReplyCount: Record<string, { count: number; replies: ReplyInfo[] }> = {}

    todayReplies.forEach(reply => {
      if (reply.uid !== 'N/A') {
        if (!userReplyCount[reply.uid]) {
          userReplyCount[reply.uid] = { count: 0, replies: [] }
        }
        userReplyCount[reply.uid].count++
        userReplyCount[reply.uid].replies.push(reply)
      }
    })

    // 找出今天回帖次数 > 1 的用户并高亮
    Object.values(userReplyCount).forEach(userData => {
      if (userData.count > 1) {
        userData.replies.forEach(reply => {
          reply.element.classList.add('duplicate-reply-highlight')
        })
      }
    })
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    isEnabled = await storageHelper.loadBoolean(STORAGE_KEY, duplicateReplyDetectionConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, isEnabled)
  }

  /**
   * 启用重复回帖检测功能
   */
  const enable = async (): Promise<void> => {
    if (isEnabled) return

    isEnabled = true
    await saveConfig()
    injectStyles()
    detectDuplicateReplies()
  }

  /**
   * 禁用重复回帖检测功能
   */
  const disable = async (): Promise<void> => {
    if (!isEnabled) return

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
      detectDuplicateReplies()
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