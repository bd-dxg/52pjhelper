import type { DriveSockPuppetData } from './types'
import { showUserInfo, hidePopup, getIsPopupHovered } from './ui'
import { USERNAME_SELECTOR } from './config'

let scanDebounceTimer: number | null = null
const SCAN_DEBOUNCE_DELAY = 300 // 防抖延迟时间（毫秒）

/**
 * 处理用户名元素
 */
export const processUsernameElement = (
  element: HTMLAnchorElement,
  sockPuppetIds: Set<string>,
  sockPuppetData: DriveSockPuppetData,
): void => {
  const username = element.textContent?.trim()
  if (!username) return

  // 检查是否在马甲名单中
  if (sockPuppetIds.has(username.toLowerCase())) {
    // 使用 data-attribute 检查是否已处理过，避免重复添加
    if (element.dataset.driveSockPuppetProcessed === 'true') return

    // 标记为已处理
    element.dataset.driveSockPuppetProcessed = 'true'

    // 创建"盘"字标记
    const tagSpan = document.createElement('span')
    tagSpan.className = 'drive-sock-puppet-tag'
    tagSpan.textContent = '盘'

    // 将"盘"字插入到用户名元素后面
    element.parentNode?.insertBefore(tagSpan, element.nextSibling)

    // 使用 AbortController 管理事件监听器，避免内存泄漏
    const abortController = new AbortController()

    // 将鼠标事件绑定到"盘"字上
    tagSpan.addEventListener('mouseenter', () => {
      showUserInfo(tagSpan, username, sockPuppetData)
    }, { signal: abortController.signal })

    tagSpan.addEventListener('mouseleave', () => {
      // 延迟隐藏，避免鼠标移动到弹窗时立即隐藏
      setTimeout(() => {
        if (!getIsPopupHovered()) {
          hidePopup()
        }
      }, 100)
    }, { signal: abortController.signal })

    // 保存 AbortController 引用，以便清理时移除事件监听器
    tagSpan.dataset.driveSockPuppetAbortController = abortController as unknown as string
  }
}

/**
 * 扫描并处理所有用户名元素
 */
export const scanAndProcessUsernames = (
  sockPuppetIds: Set<string>,
  sockPuppetData: DriveSockPuppetData,
): void => {
  const usernameElements = document.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
  usernameElements.forEach(element => {
    processUsernameElement(element, sockPuppetIds, sockPuppetData)
  })
}

/**
 * 防抖扫描
 */
export const debouncedScan = (sockPuppetIds: Set<string>, sockPuppetData: DriveSockPuppetData): void => {
  if (scanDebounceTimer) {
    clearTimeout(scanDebounceTimer)
  }
  scanDebounceTimer = window.setTimeout(() => {
    scanAndProcessUsernames(sockPuppetIds, sockPuppetData)
    scanDebounceTimer = null
  }, SCAN_DEBOUNCE_DELAY)
}

/**
 * 移除所有事件监听器和"盘"字标记
 */
export const removeHighlights = (): void => {
  // 移除"盘"字标记并清理事件监听器
  const tagElements = document.querySelectorAll<HTMLSpanElement>('.drive-sock-puppet-tag')
  tagElements.forEach(element => {
    // 移除事件监听器
    const abortControllerKey = 'driveSockPuppetAbortController'
    if (element.dataset[abortControllerKey]) {
      try {
        const controller = element.dataset[abortControllerKey] as unknown as AbortController
        controller.abort()
      } catch {
        // 忽略错误
      }
    }
    element.remove()
  })

  // 移除已处理标记
  const processedElements = document.querySelectorAll<HTMLAnchorElement>('[data-drive-sock-puppet-processed]')
  processedElements.forEach(element => {
    delete element.dataset.driveSockPuppetProcessed
  })
}
