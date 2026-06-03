/**
 * 头像查询 - 弹窗管理
 */

let currentPopup: HTMLDivElement | null = null
let isPopupHovered = false

/**
 * 创建或获取弹窗元素
 */
const getOrCreatePopup = (): HTMLDivElement => {
  if (!currentPopup) {
    currentPopup = document.createElement('div')
    currentPopup.className = 'avatar-query-popup'
    document.body.appendChild(currentPopup)

    currentPopup.addEventListener('mouseenter', () => {
      isPopupHovered = true
    })

    currentPopup.addEventListener('mouseleave', () => {
      isPopupHovered = false
      hidePopup()
    })
  }
  return currentPopup
}

/**
 * 获取弹窗实际尺寸
 */
const getPopupRect = (popup: HTMLDivElement): DOMRect => {
  const previousVisibility = popup.style.visibility
  const wasShown = popup.classList.contains('show')

  popup.style.visibility = 'hidden'
  if (!wasShown) {
    popup.classList.add('show')
  }

  const popupRect = popup.getBoundingClientRect()

  if (!wasShown) {
    popup.classList.remove('show')
  }
  popup.style.visibility = previousVisibility

  return popupRect
}

/**
 * 显示违规信息
 */
export const showInfo = (dom: HTMLImageElement, info: Element | null): void => {
  const popup = getOrCreatePopup()

  popup.innerHTML = ''

  if (info) {
    popup.appendChild(info)
  } else {
    const div = document.createElement('div')
    div.innerText = '没有违规记录'
    popup.appendChild(div)
  }

  const rect = dom.getBoundingClientRect()

  const avatarContainer = dom.closest('.pls.cl.favatar')
  const leftContainer = avatarContainer?.closest('.pls') as HTMLElement
  const containerRect = leftContainer?.getBoundingClientRect()
  const popupRect = getPopupRect(popup)
  const popupWidth = popupRect.width || 632
  const popupHeight = popupRect.height || 0
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight
  const gap = 10

  let left = containerRect ? containerRect.left : rect.left
  let top = rect.bottom + gap

  if (left + popupWidth > viewportWidth - 10) {
    left = viewportWidth - popupWidth - 10
  }

  if (left < 10) {
    left = 10
  }

  const spaceBelow = viewportHeight - rect.bottom - gap
  const spaceAbove = rect.top - gap

  if (popupHeight > 0 && spaceBelow < popupHeight && spaceAbove > spaceBelow) {
    top = rect.top - popupHeight - gap
  }

  if (popupHeight > 0 && top + popupHeight > viewportHeight - 10) {
    top = viewportHeight - popupHeight - 10
  }

  if (top < 10) {
    top = 10
  }

  popup.style.left = `${left}px`
  popup.style.top = `${top}px`
  popup.classList.add('show')
}

/**
 * 隐藏弹窗
 */
export const hidePopup = (): void => {
  if (currentPopup) {
    currentPopup.classList.remove('show')
  }
}

/**
 * 获取弹窗悬停状态
 */
export const getIsPopupHovered = (): boolean => isPopupHovered

/**
 * 清理弹窗
 */
export const cleanupPopup = (): void => {
  if (currentPopup) {
    currentPopup.remove()
    currentPopup = null
  }
}
