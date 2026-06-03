/**
 * 重复回帖检测 - 滚动逻辑
 */

import duplicateReplyDetectionConfig from './config.json'

/**
 * 检查当前页面是否匹配目标页面
 */
const isTargetPage = (): boolean => {
  const targetPages = duplicateReplyDetectionConfig.targetPages
  if (!targetPages || targetPages.length === 0) return true

  const currentUrl = window.location.href
  return targetPages.some(pattern => {
    // 支持 * 通配符匹配
    const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`)
    return regex.test(currentUrl)
  })
}

/**
 * 获取目标帖子元素
 */
const getTargetPost = (): Element | null => {
  const postIndex = duplicateReplyDetectionConfig.scrollToPost
  if (!postIndex || postIndex <= 0) return null

  const posts = Array.from(document.querySelectorAll('#postlist [id^="post_"]')).filter(p => {
    return !['post_reply', 'post_new', 'post_replytmp'].includes(p.id) && !p.id.includes('post_rate')
  })
  return posts[postIndex - 1] ?? null
}

/**
 * 计算目标帖子的绝对滚动位置
 */
const getTargetScrollTop = (): number | null => {
  const target = getTargetPost()
  if (!target) return null

  const rect = target.getBoundingClientRect()
  return rect.top + window.scrollY - 20 // 留 20px 上边距
}

/**
 * 滚动到指定序号的帖子
 */
const scrollToPost = (behavior: ScrollBehavior = 'smooth'): void => {
  const scrollTop = getTargetScrollTop()
  if (scrollTop !== null) {
    window.scrollTo({ top: scrollTop, behavior })
  }
}

/**
 * 等待 DOM 高度稳定后滚动到指定帖子
 */
export const scrollToPostWhenReady = (): void => {
  // 仅在目标页面执行滚动
  if (!isTargetPage()) return

  const postIndex = duplicateReplyDetectionConfig.scrollToPost
  if (!postIndex || postIndex <= 0) return

  let lastHeight = document.body.scrollHeight
  let stableCount = 0
  const requiredStableFrames = 3

  const check = (): void => {
    const currentHeight = document.body.scrollHeight
    if (currentHeight === lastHeight) {
      stableCount++
      if (stableCount >= requiredStableFrames) {
        scrollToPost('instant')
        return
      }
    } else {
      stableCount = 0
      lastHeight = currentHeight
    }
    requestAnimationFrame(check)
  }

  requestAnimationFrame(check)
}
