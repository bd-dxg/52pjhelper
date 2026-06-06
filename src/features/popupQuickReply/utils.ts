import popupQuickReplyConfig from './config.json'
import { createQuickReplyPanel } from './ui'
import { observePopup } from './observer'

type QuickReplyPreset = { label: string; content: string }

const QUICK_REPLY_PRESETS: QuickReplyPreset[] = popupQuickReplyConfig.presets

let cleanupObserver: (() => void) | null = null

/**
 * 保存快捷回复配置
 */
export const savePopupQuickReplyConfig = async (enabled: boolean): Promise<void> => {
  await browser.storage.local.set({ popupQuickReplyEnabled: enabled })
}

/**
 * 注入快捷回复按钮
 */
const injectQuickReplyButtons = (textarea: HTMLTextAreaElement): void => {
  const panel = createQuickReplyPanel(QUICK_REPLY_PRESETS, textarea)
  const tpclg = textarea.closest('.tpclg')
  const h4 = tpclg?.querySelector('h4')
  if (h4) {
    h4.after(panel)
  }
}

/**
 * 初始化弹窗快捷回复功能
 * 直接监听 #reason 元素的出现（弹窗内容通过 AJAX 加载）
 */
export const initPopupQuickReply = (): void => {
  cleanupObserver = observePopup('.fwinmask textarea#reason', (node) => {
    const textarea = node as HTMLTextAreaElement
    // 避免重复注入
    if (textarea.closest('.tpclg')?.querySelector('.popup-quick-reply-panel')) return
    injectQuickReplyButtons(textarea)
  })
}

/**
 * 清理弹窗快捷回复功能
 * 断开 observer 并移除已注入的面板
 */
export const cleanupPopupQuickReply = (): void => {
  if (cleanupObserver) {
    cleanupObserver()
    cleanupObserver = null
  }
  // 移除已注入的快捷回复面板
  document.querySelectorAll('.popup-quick-reply-panel').forEach(el => el.remove())
}
