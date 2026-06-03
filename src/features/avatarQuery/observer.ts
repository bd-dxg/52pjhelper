/**
 * 头像查询 - MutationObserver 监听
 */

import { extractUidFromHref } from '@/utils/userViolationFetcher'
import { showInfo, hidePopup, getIsPopupHovered } from './popup'

let observers: MutationObserver[] = []

/**
 * 附加事件监听器
 */
export const attachEventListeners = (): void => {
  const systemCards = document.querySelectorAll('.p_pop.blk.bui')

  systemCards.forEach(card => {
    const cardElement = card as HTMLElement

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const display = cardElement.style.display

          if (display !== 'none') {
            const avatarContainer = cardElement.closest('.pls.cl.favatar')
            const img = avatarContainer?.querySelector('.avatar img') as HTMLImageElement

            if (img) {
              const parentLink = img.parentNode as HTMLAnchorElement
              if (parentLink?.href) {
                const uid = extractUidFromHref(parentLink.href)
                if (uid) {
                  fetchUserViolation(uid)
                    .then(violationInfo => {
                      showInfo(img, violationInfo)
                    })
                    .catch(error => {
                      console.error('获取用户信息失败:', error)
                    })
                }
              }
            }
          } else {
            if (!getIsPopupHovered()) {
              hidePopup()
            }
          }
        }
      })
    })

    observer.observe(cardElement, {
      attributes: true,
      attributeFilter: ['style'],
    })

    observers.push(observer)
  })
}

/**
 * 移除事件监听器
 */
export const removeEventListeners = (): void => {
  observers.forEach(observer => {
    observer.disconnect()
  })
  observers = []
}
