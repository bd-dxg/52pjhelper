import type { UserBlacklistData } from './types'
import { showUserInfo, hidePopup, getIsPopupHovered } from './ui'
import { USERNAME_SELECTOR } from './config'

let scanDebounceTimer: number | null = null
const SCAN_DEBOUNCE_DELAY = 300 // 防抖延迟时间（毫秒）

/**
 * 处理用户名元素
 */
export const processUsernameElement = (
  element: HTMLAnchorElement,
  blacklistIds: Set<string>,
  blacklistData: UserBlacklistData
): void => {
  const username = element.textContent?.trim()
  if (!username) return

  console.log(`[用户黑名单] 处理用户名: "${username}"`)

  // 检查是否在黑名单中
  if (blacklistIds.has(username.toLowerCase())) {
    console.log(`[用户黑名单] 用户名 "${username}" 在黑名单中，添加高亮样式`)
    // 添加高亮样式
    element.classList.add('user-blacklist-highlight')

    // 添加鼠标事件
    element.addEventListener('mouseenter', () => {
      showUserInfo(element, username, blacklistData)
    })

    element.addEventListener('mouseleave', () => {
      // 延迟隐藏，避免鼠标移动到弹窗时立即隐藏
      setTimeout(() => {
        if (!getIsPopupHovered()) {
          hidePopup()
        }
      }, 100)
    })
  }
}

/**
 * 扫描并处理所有用户名元素
 */
export const scanAndProcessUsernames = (
  blacklistIds: Set<string>,
  blacklistData: UserBlacklistData
): void => {
  console.log('[用户黑名单] 开始扫描用户名元素，选择器:', USERNAME_SELECTOR)
  const usernameElements = document.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
  console.log(`[用户黑名单] 找到 ${usernameElements.length} 个用户名元素`)
  usernameElements.forEach(element => {
    processUsernameElement(element, blacklistIds, blacklistData)
  })
}

/**
 * 防抖扫描
 */
export const debouncedScan = (
  blacklistIds: Set<string>,
  blacklistData: UserBlacklistData
): void => {
  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
  }
  scanDebounceTimer = window.setTimeout(() => {
    scanAndProcessUsernames(blacklistIds, blacklistData)
    scanDebounceTimer = null
  }, SCAN_DEBOUNCE_DELAY)
}

/**
 * 移除所有高亮样式和事件监听器
 */
export const removeHighlights = (): void => {
  const highlightedElements = document.querySelectorAll<HTMLAnchorElement>('.user-blacklist-highlight')
  highlightedElements.forEach(element => {
    element.classList.remove('user-blacklist-highlight')
    // 注意：这里无法直接移除匿名事件监听器，但移除元素时会自动清理
  })
}