/**
 * 用户链接查询 - 弹窗管理
 */

import { fetchUserViolation } from '@/utils/userViolationFetcher'

let popupElement: HTMLDivElement | null = null
let hideTimeout: number | null = null
let isMouseOverPopup = false

/**
 * 悬浮层鼠标移入处理
 */
const onPopupMouseEnter = (): void => {
  isMouseOverPopup = true

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

/**
 * 悬浮层鼠标移出处理
 */
const onPopupMouseLeave = (): void => {
  isMouseOverPopup = false
  scheduleHidePopup()
}

/**
 * 创建悬浮层
 */
export const createPopup = (): void => {
  if (popupElement) return

  popupElement = document.createElement('div')
  popupElement.className = 'user-link-popup'

  popupElement.addEventListener('mouseenter', onPopupMouseEnter)
  popupElement.addEventListener('mouseleave', onPopupMouseLeave)

  document.body.appendChild(popupElement)
}

/**
 * 移除悬浮层
 */
export const removePopup = (): void => {
  if (popupElement) {
    popupElement.removeEventListener('mouseenter', onPopupMouseEnter)
    popupElement.removeEventListener('mouseleave', onPopupMouseLeave)

    popupElement.remove()
    popupElement = null
  }
}

/**
 * 更新悬浮层位置
 */
const updatePopupPosition = (target: HTMLElement): void => {
  if (!popupElement) return

  const rect = target.getBoundingClientRect()
  const popupRect = popupElement.getBoundingClientRect()
  const popupWidth = 620
  const popupHeight = popupRect.height || 200
  const gap = 8

  let left = rect.left
  if (left + popupWidth > document.documentElement.clientWidth) {
    left = document.documentElement.clientWidth - popupWidth - 20
  }
  if (left < 10) left = 10

  let top = rect.bottom + gap
  if (top + popupHeight > document.documentElement.clientHeight) {
    top = rect.top - popupHeight - gap
  }
  if (top < 5) top = 5

  popupElement.style.left = `${left}px`
  popupElement.style.top = `${top}px`
}

/**
 * 安排隐藏悬浮层
 */
export const scheduleHidePopup = (): void => {
  if (isMouseOverPopup) return

  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }

  hideTimeout = window.setTimeout(() => {
    if (popupElement) {
      popupElement.classList.remove('show')
    }
    hideTimeout = null
  }, 300)
}

/**
 * 清除隐藏定时器
 */
export const clearHideTimeout = (): void => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

/**
 * 显示用户违规信息
 */
export const showViolationInfo = async (target: HTMLElement, uid: string): Promise<void> => {
  if (!popupElement) {
    createPopup()
  }

  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'loading'
  loadingDiv.textContent = '加载中...'
  popupElement!.replaceChildren(loadingDiv)
  popupElement!.classList.add('show')

  updatePopupPosition(target)

  try {
    const info = await fetchUserViolation(uid)

    popupElement!.replaceChildren()
    if (info) {
      const clonedInfo = info.cloneNode(true) as HTMLElement
      popupElement!.appendChild(clonedInfo)
    } else {
      const noViolationDiv = document.createElement('div')
      noViolationDiv.className = 'no-violation'
      noViolationDiv.textContent = '没有违规记录'
      popupElement!.appendChild(noViolationDiv)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error'
    errorDiv.textContent = '获取用户信息失败'
    popupElement!.replaceChildren(errorDiv)
  }
}
