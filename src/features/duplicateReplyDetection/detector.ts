/**
 * 重复回帖检测 - 检测逻辑
 */

import duplicateReplyDetectionConfig from './config.json'
import { urlMatcher } from '@/utils/urlMatcher'

const ADMIN_GROUPS = duplicateReplyDetectionConfig.adminGroups

interface ReplyInfo {
  element: Element
  uid: string
  username: string
  group: string
  floor: string
  time: string
  hasHotValue: boolean
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
    return !['post_reply', 'post_new', 'post_replytmp'].includes(p.id) && !p.id.includes('post_rate')
  })

  return posts.map(post => {
    const userEl = post.querySelector('.authi a.xw1')
    const username = userEl?.textContent?.trim() ?? 'N/A'

    const userLink = userEl?.getAttribute('href') ?? ''
    const uidMatch = userLink.match(/uid=(\d+)/)
    const uid = uidMatch?.[1] ?? 'N/A'

    const groupEl = post.querySelector('.side-group')
    const group = groupEl?.textContent?.trim() ?? ''

    const floorEl = post.querySelector('.pi strong a')
    const floor = floorEl?.textContent?.trim() ?? 'N/A'

    const timeEl = post.querySelector('em[id^="authorposton"]')
    const time = timeEl?.textContent?.replace('发表于', '').trim() ?? 'N/A'

    const rateLogEl = post.querySelector('[id^="ratelog_"]')
    const hasHotValue = rateLogEl?.textContent?.includes('热心值') ?? false

    return {
      element: post,
      uid,
      username,
      group,
      floor,
      time,
      hasHotValue,
    }
  })
}

/**
 * 检测重复回帖
 */
export const detectDuplicateReplies = (): void => {
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, duplicateReplyDetectionConfig.targetPages)

  if (!isTargetPage) {
    return
  }

  const todayStr = getTodayString()
  const allReplies = getAllReplies()

  const todayReplies = allReplies.filter(reply => {
    const replyDate = extractDateFromTime(reply.time)
    return replyDate === todayStr && !ADMIN_GROUPS.includes(reply.group)
  })

  const userReplyCount: Record<string, ReplyInfo[]> = {}

  todayReplies.forEach(reply => {
    if (reply.uid !== 'N/A') {
      if (!userReplyCount[reply.uid]) {
        userReplyCount[reply.uid] = []
      }
      userReplyCount[reply.uid].push(reply)
    }
  })

  Object.values(userReplyCount).forEach(replies => {
    if (replies.length > 1) {
      const userHasHotValue = replies.some(reply => reply.hasHotValue)

      replies.forEach(reply => {
        reply.element.classList.add('duplicate-reply-highlight')

        if (userHasHotValue) {
          const notice = document.createElement('div')
          notice.className = 'duplicate-reply-notice'
          notice.textContent = '今日已获热心值'

          const floorInfoEl = reply.element.querySelector('.plc .pi')
          if (floorInfoEl) {
            floorInfoEl.insertBefore(notice, floorInfoEl.firstChild)
          }
        }
      })
    }
  })
}

/**
 * 移除所有高亮和提示
 */
export const removeHighlights = (): void => {
  const highlightedPosts = document.querySelectorAll('.duplicate-reply-highlight')
  highlightedPosts.forEach(post => {
    post.classList.remove('duplicate-reply-highlight')
  })

  const notices = document.querySelectorAll('.duplicate-reply-notice')
  notices.forEach(notice => notice.remove())
}
