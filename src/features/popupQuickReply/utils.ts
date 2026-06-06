import popupQuickReplyConfig from './config.json'
import { observePopup } from './observer'

type PresetConfig = {
  mods: string[]
  rate: string[]
}

const QUICK_REPLY_PRESETS: PresetConfig = popupQuickReplyConfig.presets

let cleanupObserver: (() => void) | null = null

/**
 * 保存快捷回复配置
 */
export const savePopupQuickReplyConfig = async (enabled: boolean): Promise<void> => {
  await browser.storage.local.set({ popupQuickReplyEnabled: enabled })
}

/**
 * 替换快捷回复下拉列表
 * 用配置中的预设内容替换 #reasonselect 列表
 * @param list 列表元素
 * @param presets 预设列表
 */
const replaceQuickReplyList = (list: HTMLElement, presets: string[]): void => {
  // 移除固定高度样式，让内容自然撑开
  list.style.height = 'auto'

  // 清空原有列表项
  while (list.firstChild) {
    list.removeChild(list.firstChild)
  }

  // 添加自定义快捷回复项
  for (const preset of presets) {
    const li = document.createElement('li')
    li.textContent = preset
    list.appendChild(li)
  }
}

/**
 * 初始化弹窗快捷回复功能
 * 监听 #reasonselect 元素的出现，替换快捷回复列表
 */
export const initPopupQuickReply = (): void => {
  cleanupObserver = observePopup('#reasonselect', (node) => {
    const list = node as HTMLElement
    // 根据 fwin 属性判断弹窗类型
    const fwinType = list.getAttribute('fwin')
    const presets = fwinType === 'rate'
      ? QUICK_REPLY_PRESETS.rate
      : QUICK_REPLY_PRESETS.mods

    replaceQuickReplyList(list, presets)
  })
}

/**
 * 清理弹窗快捷回复功能
 */
export const cleanupPopupQuickReply = (): void => {
  if (cleanupObserver) {
    cleanupObserver()
    cleanupObserver = null
  }
}
