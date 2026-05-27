import type { UserCloudDiskListData } from './types'
import { debouncedScan } from './processing'
import { USERNAME_SELECTOR } from './config'

let observers: MutationObserver[] = []

/**
 * 附加事件监听器
 */
export const attachEventListeners = (CloudDiskListIds: Set<string>, CloudDiskListData: UserCloudDiskListData): void => {
  // 创建 MutationObserver 监听DOM变化
  const observer = new MutationObserver(mutations => {
    let hasUsernameChanges = false

    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        // 检查新增的节点中是否有用户名元素
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            // 检查元素本身
            if (element.matches && element.matches(USERNAME_SELECTOR)) {
              hasUsernameChanges = true
            }
            // 检查元素后代
            const usernameElements = element.querySelectorAll<HTMLAnchorElement>(USERNAME_SELECTOR)
            if (usernameElements.length > 0) {
              hasUsernameChanges = true
            }
          }
        })
      }
    })

    // 如果有用户名变化，进行防抖扫描
    if (hasUsernameChanges) {
      debouncedScan(CloudDiskListIds, CloudDiskListData)
    }
  })

  // 监听整个文档的变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  observers.push(observer)
}

/**
 * 移除事件监听器
 */
export const removeEventListeners = (): void => {
  // 断开所有 MutationObserver
  observers.forEach(observer => {
    observer.disconnect()
  })
  observers = []
}
