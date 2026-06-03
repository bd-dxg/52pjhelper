/**
 * 用户链接查询 - 事件处理
 */

import { extractUidFromHref } from '@/utils/userViolationFetcher'
import { scheduleHidePopup, showViolationInfo } from './popup'

let pageChangeListener: (() => void) | null = null
let loadEventListener: (() => void) | null = null

/**
 * 检查是否在目标页面（外部传入）
 */
let isTargetPageFn: () => boolean = () => false

/**
 * 设置目标页面检查函数
 */
export const setIsTargetPageFn = (fn: () => boolean): void => {
  isTargetPageFn = fn
}

/**
 * 设置页面加载后附加事件的函数
 */
let attachFn: () => void = () => {}

/**
 * 设置附加事件函数
 */
export const setAttachFn = (fn: () => void): void => {
  attachFn = fn
}

/**
 * 鼠标移入处理（使用 mouseover 事件委托）
 */
const onMouseOver = async (e: Event): Promise<void> => {
  const target = e.target as HTMLElement
  if (!target) return

  const userLink = target.closest('#moderate .um a[href*="uid="]') as HTMLAnchorElement
  if (!userLink?.href) return

  const uid = extractUidFromHref(userLink.href)
  if (!uid) return

  await showViolationInfo(userLink, uid)
}

/**
 * 鼠标移出处理（使用 mouseout 事件委托）
 */
const onMouseOut = (e: Event): void => {
  const mouseEvent = e as MouseEvent
  const target = e.target as HTMLElement
  const relatedTarget = mouseEvent.relatedTarget as HTMLElement | null

  const fromUserLink = target.closest('#moderate .um a[href*="uid="]')
  const toUserLink = relatedTarget?.closest('#moderate .um a[href*="uid="]')
  const toPopup = relatedTarget?.closest('.user-link-popup')

  if (fromUserLink && !toUserLink && !toPopup) {
    scheduleHidePopup()
  }
}

/**
 * 尝试附加事件监听器
 */
const tryAttachEventListeners = (): void => {
  const moderateContainer = document.querySelector('#moderate')
  if (!moderateContainer) return

  const hasMouseOver = moderateContainer.hasAttribute('data-user-link-query-mouseover')
  const hasMouseOut = moderateContainer.hasAttribute('data-user-link-query-mouseout')

  if (!hasMouseOver) {
    moderateContainer.addEventListener('mouseover', onMouseOver)
    moderateContainer.setAttribute('data-user-link-query-mouseover', 'true')
  }

  if (!hasMouseOut) {
    moderateContainer.addEventListener('mouseout', onMouseOut)
    moderateContainer.setAttribute('data-user-link-query-mouseout', 'true')
  }
}

/**
 * 附加事件监听器
 */
export const attachEventListeners = (): void => {
  if (!isTargetPageFn()) return

  tryAttachEventListeners()

  setTimeout(() => {
    tryAttachEventListeners()
  }, 1000)

  setTimeout(() => {
    tryAttachEventListeners()
  }, 3000)
}

/**
 * 移除事件监听器
 */
export const removeEventListeners = (): void => {
  const moderateContainer = document.querySelector('#moderate')
  if (!moderateContainer) return

  const hasMouseOver = moderateContainer.hasAttribute('data-user-link-query-mouseover')
  const hasMouseOut = moderateContainer.hasAttribute('data-user-link-query-mouseout')

  if (hasMouseOver) {
    moderateContainer.removeEventListener('mouseover', onMouseOver)
    moderateContainer.removeAttribute('data-user-link-query-mouseover')
  }

  if (hasMouseOut) {
    moderateContainer.removeEventListener('mouseout', onMouseOut)
    moderateContainer.removeAttribute('data-user-link-query-mouseout')
  }
}

/**
 * 设置页面变化监听器
 */
export const setupPageChangeListener = (): void => {
  if (pageChangeListener) {
    window.removeEventListener('popstate', pageChangeListener)
    pageChangeListener = null
  }

  pageChangeListener = () => {
    if (isTargetPageFn()) {
      attachEventListeners()
    } else {
      removeEventListeners()
    }
  }

  window.addEventListener('popstate', pageChangeListener)
  window.addEventListener('hashchange', pageChangeListener)
}

/**
 * 移除页面变化监听器
 */
export const removePageChangeListener = (): void => {
  if (pageChangeListener) {
    window.removeEventListener('popstate', pageChangeListener)
    window.removeEventListener('hashchange', pageChangeListener)
    pageChangeListener = null
  }
}

/**
 * 设置页面加载监听器
 */
export const setupLoadListener = (): void => {
  if (document.readyState !== 'complete') {
    if (loadEventListener) {
      window.removeEventListener('load', loadEventListener)
      loadEventListener = null
    }

    loadEventListener = () => {
      attachFn()
    }

    window.addEventListener('load', loadEventListener)
  }
}

/**
 * 移除页面加载监听器
 */
export const removeLoadListener = (): void => {
  if (loadEventListener) {
    window.removeEventListener('load', loadEventListener)
    loadEventListener = null
  }
}
