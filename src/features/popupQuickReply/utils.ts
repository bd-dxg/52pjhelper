import popupQuickReplyConfig from './config.json'
import { observePopup } from './observer'
import { storageHelper } from '@utils/storageHelper'

/**
 * 快捷回复预设配置类型
 */
type PresetConfig = {
  /** 管理操作预设 */
  mods: string[]
  /** 评分理由预设 */
  rate: string[]
}

/** storage 存储键 */
const QUICK_REPLY_PRESETS_STORAGE_KEY = 'popupQuickReplyPresets'
/** 默认预设配置（从 config.json 读取） */
const DEFAULT_PRESETS: PresetConfig = popupQuickReplyConfig.presets

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

  // 保存原始列表项文本用于恢复（避免 innerHTML 的 XSS 风险）
  const originalItems: string[] = []
  const originalLis = list.querySelectorAll('li')
  originalLis.forEach((li) => {
    originalItems.push(li.textContent || '')
  })
  list.setAttribute('data-original-items', JSON.stringify(originalItems))

  // 清空原有列表项
  while (list.firstChild) {
    list.removeChild(list.firstChild)
  }

  // 查找对应的 textarea（在循环外查找，避免重复查询）
  const textarea = document.querySelector('#reason') as HTMLTextAreaElement | null

  // 添加自定义快捷回复项
  // 使用 forEach 保持作用域一致性
  presets.forEach((preset) => {
    const li = document.createElement('li')
    li.textContent = preset

    // 绑定点击事件，将文本填充到 textarea
    li.addEventListener('click', () => {
      if (textarea) {
        textarea.value = preset
      }
    })

    // 绑定鼠标悬停事件，模仿原始行为
    li.addEventListener('mouseover', () => {
      li.className = 'xi2 cur1'
    })
    li.addEventListener('mouseout', () => {
      li.className = ''
    })

    list.appendChild(li)
  })
}

/**
 * 获取快捷回复预设配置
 * 优先从 storage 获取，否则使用默认配置
 */
const getPresets = async (): Promise<PresetConfig> => {
  const stored = await storageHelper.loadObject<PresetConfig>(
    QUICK_REPLY_PRESETS_STORAGE_KEY,
    DEFAULT_PRESETS,
  )
  return stored
}

/**
 * 获取当前生效的预设配置（用于导出）
 * 如果 storage 中没有，则返回默认配置
 */
export const getCurrentPresets = async (): Promise<PresetConfig> => {
  return getPresets()
}

/**
 * 初始化弹窗快捷回复功能
 * 监听 #reasonselect 元素的出现，替换快捷回复列表
 */
export const initPopupQuickReply = (): void => {
  cleanupObserver = observePopup('#reasonselect', async (node) => {
    const list = node as HTMLElement
    // 根据 fwin 属性判断弹窗类型
    const fwinType = list.getAttribute('fwin')
    const presets = await getPresets()
    const presetList = fwinType === 'rate'
      ? presets.rate
      : presets.mods

    replaceQuickReplyList(list, presetList)
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

  // 恢复所有已替换的列表
  const lists = document.querySelectorAll('#reasonselect[data-original-items]')
  lists.forEach((list) => {
    const originalItemsStr = list.getAttribute('data-original-items')
    if (originalItemsStr) {
      try {
        const originalItems: string[] = JSON.parse(originalItemsStr)
        // 清空当前列表
        while (list.firstChild) {
          list.removeChild(list.firstChild)
        }
        // 重新创建原始列表项并绑定事件
        for (const itemText of originalItems) {
          const li = document.createElement('li')
          li.textContent = itemText

          // 绑定原始的事件处理程序
          li.addEventListener('mouseover', () => {
            li.className = 'xi2 cur1'
          })
          li.addEventListener('mouseout', () => {
            li.className = ''
          })
          li.addEventListener('click', () => {
            // 查找对应的 textarea（#reason）
            const textarea = document.querySelector('#reason') as HTMLTextAreaElement | null
            if (textarea) {
              textarea.value = itemText
            }
          })

          list.appendChild(li)
        }
        list.removeAttribute('data-original-items')
      } catch {
        // JSON 解析失败，移除属性但不恢复内容
        list.removeAttribute('data-original-items')
      }
    }
  })
}
