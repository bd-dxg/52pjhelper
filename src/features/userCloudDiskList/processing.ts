import type { UserCloudDiskListData } from './types'
import { showUserInfo, hidePopup, getIsPopupHovered } from './ui'
import { USERNAME_SELECTOR } from './config'

let scanDebounceTimer: number | null = null
const SCAN_DEBOUNCE_DELAY = 300 // 防抖延迟时间（毫秒）

/**
 * 处理用户名元素
 */
export const processUsernameElement = (
  element: HTMLAnchorElement,
  CloudDiskListIds: Set<string>,
  CloudDiskListData: UserCloudDiskListData,
): void => {
  const username = element.textContent?.trim()
  if (!username) return

  // 检查是否在黑名单中
  if (CloudDiskListIds.has(username.toLowerCase())) {
    // 添加高亮样式
    element.classList.add('user-CloudDiskList-highlight')

    // 添加鼠标事件
    element.addEventListener('mouseenter', () => {
      showUserInfo(element, username, CloudDiskListData)
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
  CloudDiskListIds: Set<string>,
  CloudDiskListData: UserCloudDiskListData,
): void => {
  const usernameElements = document.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
  usernameElements.forEach(element => {
    processUsernameElement(element, CloudDiskListIds, CloudDiskListData)
  })
}

/**
 * 防抖扫描
 */
export const debouncedScan = (CloudDiskListIds: Set<string>, CloudDiskListData: UserCloudDiskListData): void => {
  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
  }
  scanDebounceTimer = window.setTimeout(() => {
    scanAndProcessUsernames(CloudDiskListIds, CloudDiskListData)
    scanDebounceTimer = null
  }, SCAN_DEBOUNCE_DELAY)
}

/**
 * 移除所有高亮样式和事件监听器
 */
export const removeHighlights = (): void => {
  const highlightedElements = document.querySelectorAll<HTMLAnchorElement>('.user-CloudDiskList-highlight')
  highlightedElements.forEach(element => {
    element.classList.remove('user-CloudDiskList-highlight')
  })
}
