type PopupCallback = (element: HTMLElement) => void

/**
 * 监控 DOM 变化，当指定选择器的元素出现时触发回调
 * @param selector CSS 选择器
 * @param callback 元素出现时的回调
 * @returns 清理函数
 */
export const observePopup = (selector: string, callback: PopupCallback): (() => void) => {
  const seen = new Set<Element>()

  const check = () => {
    const el = document.querySelector(selector)
    if (el && !seen.has(el)) {
      seen.add(el)
      callback(el as HTMLElement)
    }
  }

  const observer = new MutationObserver(check)

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return () => observer.disconnect()
}
