/**
 * 内容过滤管理工具类
 * 在管理页面创建可拖动的过滤卡片，支持正则和简单匹配
 */

import contentFilterConfig from '@/configs/contentFilter.json'
import { urlMatcher } from './urlMatcher'
import { storageHelper } from './storageHelper'

const STORAGE_KEY = contentFilterConfig.storageKey
const FILTERS_STORAGE_KEY = contentFilterConfig.filtersStorageKey
const MAX_TEXT_LENGTH_STORAGE_KEY = 'contentFilterMaxTextLength'
const DEFAULT_MAX_TEXT_LENGTH = contentFilterConfig.maxTextLength
const REGEX_PATTERN_MAX_LENGTH = 100

// 预设规则接口
interface PresetRule {
  name: string
  pattern: string
  isRegex: boolean
}

// 获取预设规则
const presets: PresetRule[] = (contentFilterConfig as { presets?: PresetRule[] }).presets ?? []

// 过滤规则接口
export interface FilterRule {
  id: string
  pattern: string
  isRegex: boolean
}

// 存储卡片与状态
let cardElement: HTMLElement | null = null
let filterRules: FilterRule[] = []
let maxTextLength = DEFAULT_MAX_TEXT_LENGTH

// 存储拖拽事件处理函数引用
let dragMouseMoveHandler: ((event: MouseEvent) => void) | null = null
let dragMouseUpHandler: (() => void) | null = null

// 生成唯一 ID
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `filter-${crypto.randomUUID()}`
  }

  return `filter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 计算汉字长度（一个汉字算一个，其他字符算半个）
const getTextLength = (text: string): number => {
  let length = 0
  for (const char of text) {
    // 判断是否为汉字（CJK 统一汉字范围）
    if (/[\u4e00-\u9fa5]/.test(char)) {
      length += 1
    } else {
      length += 0.5
    }
  }
  return length
}

// 检查文本是否匹配规则
const matchesRule = (text: string, rule: FilterRule): boolean => {
  const trimmedPattern = rule.pattern.trim()
  if (!trimmedPattern) {
    return false
  }

  try {
    if (rule.isRegex) {
      if (trimmedPattern.length > REGEX_PATTERN_MAX_LENGTH) {
        return false
      }

      const regex = new RegExp(trimmedPattern, 'i')
      return regex.test(text)
    }

    return text.toLowerCase().includes(trimmedPattern.toLowerCase())
  } catch {
    // 正则表达式无效时返回 false
    return false
  }
}

// 执行过滤匹配
const performFiltering = (): void => {
  clearHighlights()

  const validRules = filterRules.filter(rule => rule.pattern.trim())
  if (validRules.length === 0) {
    return
  }

  // 获取所有目标元素
  const elements = document.querySelectorAll('#moderate tbody .xg1')

  elements.forEach(element => {
    const text = element.textContent?.trim() || ''

    // 检查文本长度
    if (getTextLength(text) > maxTextLength) {
      return
    }

    const isMatched = validRules.some(rule => matchesRule(text, rule))

    // 找到对应的行元素
    const row = element.closest('#moderate > table > tbody > tr')
    if (!(row instanceof HTMLElement)) {
      return
    }

    if (isMatched) {
      row.style.backgroundColor = '#fffacd' // 浅黄色高亮
      row.dataset.contentFilterHighlight = 'true'

      // 选中对应的复选框
      const checkbox = row.querySelector('.pc')
      if (checkbox instanceof HTMLInputElement && checkbox.type === 'checkbox') {
        checkbox.checked = true
      }
    }
  })
}

// 清除所有高亮
const clearHighlights = (): void => {
  const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
  highlightedRows.forEach(row => {
    if (!(row instanceof HTMLElement)) {
      return
    }

    row.style.backgroundColor = ''
    delete row.dataset.contentFilterHighlight

    // 取消选中对应的复选框
    const checkbox = row.querySelector('.pc')
    if (checkbox instanceof HTMLInputElement && checkbox.type === 'checkbox') {
      checkbox.checked = false
    }
  })
}

// 保存过滤规则到存储
const saveFilterRules = async (): Promise<void> => {
  await storageHelper.saveArray(FILTERS_STORAGE_KEY, filterRules)
}

// 从存储加载过滤规则
const loadFilterRules = async (): Promise<void> => {
  const savedRules = await storageHelper.loadArray<FilterRule>(FILTERS_STORAGE_KEY, [])
  if (savedRules.length > 0) {
    filterRules = savedRules
  } else {
    // 默认添加一个空规则
    filterRules = [{ id: generateId(), pattern: '', isRegex: false }]
  }
}

// 保存卡片位置
const saveCardPosition = async (x: number, y: number): Promise<void> => {
  await storageHelper.saveObject('contentFilterCardPosition', { x, y })
}

// 加载卡片位置
const loadCardPosition = async (): Promise<{ x: number; y: number }> => {
  return storageHelper.loadObject('contentFilterCardPosition', { x: 20, y: 100 })
}

// 保存最大文本长度
const saveMaxTextLength = async (length: number): Promise<void> => {
  await storageHelper.saveNumber(MAX_TEXT_LENGTH_STORAGE_KEY, length)
}

// 加载最大文本长度
const loadMaxTextLength = async (): Promise<number> => {
  return storageHelper.loadNumber(MAX_TEXT_LENGTH_STORAGE_KEY, DEFAULT_MAX_TEXT_LENGTH)
}

// 创建输入行元素
const createInputRow = (rule: FilterRule, container: HTMLElement): HTMLElement => {
  const row = document.createElement('div')
  row.className = 'content-filter-input-row'
  row.dataset.ruleId = rule.id
  row.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  `

  // 输入框
  const input = document.createElement('input')
  input.type = 'text'
  input.value = rule.pattern
  input.placeholder = '输入匹配条件...'
  input.style.cssText = `
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  `
  input.addEventListener('focus', () => {
    input.style.borderColor = '#4a90d9'
  })
  input.addEventListener('blur', () => {
    input.style.borderColor = '#ddd'
  })
  input.addEventListener('input', () => {
    rule.pattern = input.value
    void saveFilterRules()
  })

  // 正则切换按钮
  const regexBtn = document.createElement('button')
  regexBtn.textContent = rule.isRegex ? '正则' : '简单'
  regexBtn.title = rule.isRegex ? '当前为正则匹配模式' : '当前为简单匹配模式'
  regexBtn.style.cssText = `
    padding: 6px 10px;
    border: 1px solid ${rule.isRegex ? '#4a90d9' : '#ddd'};
    border-radius: 4px;
    background: ${rule.isRegex ? '#e8f4fc' : '#fff'};
    color: ${rule.isRegex ? '#4a90d9' : '#666'};
    cursor: pointer;
    font-size: 14px;
    min-width: 50px;
    transition: all 0.2s;
  `
  regexBtn.addEventListener('click', () => {
    rule.isRegex = !rule.isRegex
    regexBtn.textContent = rule.isRegex ? '正则' : '简单'
    regexBtn.title = rule.isRegex ? '当前为正则匹配模式' : '当前为简单匹配模式'
    regexBtn.style.borderColor = rule.isRegex ? '#4a90d9' : '#ddd'
    regexBtn.style.background = rule.isRegex ? '#e8f4fc' : '#fff'
    regexBtn.style.color = rule.isRegex ? '#4a90d9' : '#666'
    void saveFilterRules()
  })

  // 删除按钮（只有多于一个规则时显示）
  const deleteBtn = document.createElement('button')
  deleteBtn.textContent = '×'
  deleteBtn.title = '删除此条件'
  deleteBtn.style.cssText = `
    padding: 4px 8px;
    border: 1px solid #ff6b6b;
    border-radius: 4px;
    background: #fff;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s;
    display: ${filterRules.length > 1 ? 'block' : 'none'};
  `
  deleteBtn.addEventListener('mouseenter', () => {
    deleteBtn.style.background = '#ff6b6b'
    deleteBtn.style.color = '#fff'
  })
  deleteBtn.addEventListener('mouseleave', () => {
    deleteBtn.style.background = '#fff'
    deleteBtn.style.color = '#ff6b6b'
  })
  deleteBtn.addEventListener('click', () => {
    const index = filterRules.findIndex(r => r.id === rule.id)
    if (index > -1 && filterRules.length > 1) {
      filterRules.splice(index, 1)
      row.remove()
      void saveFilterRules()
      // 更新所有删除按钮的显示状态
      updateDeleteButtonsVisibility(container)
    }
  })

  row.appendChild(input)
  row.appendChild(regexBtn)
  row.appendChild(deleteBtn)

  return row
}

// 更新删除按钮的显示状态
const updateDeleteButtonsVisibility = (container: HTMLElement): void => {
  const rows = container.querySelectorAll('.content-filter-input-row')
  rows.forEach(row => {
    const deleteBtn = row.querySelector('button:last-child') as HTMLElement
    if (deleteBtn) {
      deleteBtn.style.display = filterRules.length > 1 ? 'block' : 'none'
    }
  })
}

// 创建过滤卡片
const createFilterCard = async (): Promise<void> => {
  if (cardElement) {
    return
  }

  // 加载保存的位置
  const position = await loadCardPosition()

  // 创建卡片容器
  const card = document.createElement('div')
  card.id = 'content-filter-card'
  card.style.cssText = `
    position: fixed;
    left: ${position.x}px;
    top: ${position.y}px;
    width: 320px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `

  // 创建标题栏（可拖动）
  const header = document.createElement('div')
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: linear-gradient(135deg, #4a90d9, #357abd);
    color: #fff;
    border-radius: 8px 8px 0 0;
    cursor: move;
    user-select: none;
  `

  const title = document.createElement('span')
  title.textContent = '灌水筛选'
  title.style.cssText = `
    font-weight: 600;
    font-size: 14px;
  `

  // 创建长度限制容器
  const lengthContainer = document.createElement('div')
  lengthContainer.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    opacity: 0.9;
  `

  const lengthPrefix = document.createElement('span')
  lengthPrefix.textContent = '只匹配≤'

  const lengthInput = document.createElement('input')
  lengthInput.type = 'number'
  lengthInput.value = String(maxTextLength)
  lengthInput.min = '1'
  lengthInput.max = '100'
  lengthInput.title = '设置最大匹配文本长度（汉字数）'
  lengthInput.style.cssText = `
    width: 36px;
    padding: 2px 4px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 14px;
    text-align: center;
    outline: none;
    cursor: text;
  `
  lengthInput.addEventListener('focus', e => {
    e.stopPropagation()
    lengthInput.style.background = 'rgba(255, 255, 255, 0.3)'
    lengthInput.style.borderColor = 'rgba(255, 255, 255, 0.8)'
  })
  lengthInput.addEventListener('blur', () => {
    lengthInput.style.background = 'rgba(255, 255, 255, 0.2)'
    lengthInput.style.borderColor = 'rgba(255, 255, 255, 0.5)'
  })
  lengthInput.addEventListener('change', () => {
    const newLength = parseInt(lengthInput.value, 10)
    if (newLength >= 1 && newLength <= 100) {
      maxTextLength = newLength
      void saveMaxTextLength(newLength)
    } else {
      lengthInput.value = String(maxTextLength)
    }
  })
  // 阻止拖动时触发输入框事件
  lengthInput.addEventListener('mousedown', e => {
    e.stopPropagation()
  })

  const lengthSuffix = document.createElement('span')
  lengthSuffix.textContent = '字'

  lengthContainer.appendChild(lengthPrefix)
  lengthContainer.appendChild(lengthInput)
  lengthContainer.appendChild(lengthSuffix)

  header.appendChild(title)
  header.appendChild(lengthContainer)

  // 创建内容区域
  const content = document.createElement('div')
  content.style.cssText = `
    padding: 12px;
    max-height: 400px;
    overflow-y: auto;
  `

  // 创建预设区域（如果有预设）
  if (presets.length > 0) {
    const presetSection = document.createElement('div')
    presetSection.style.cssText = `
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
    `

    const presetLabel = document.createElement('div')
    presetLabel.textContent = '快速预设：'
    presetLabel.style.cssText = `
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    `

    const presetContainer = document.createElement('div')
    presetContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    `

    presets.forEach(preset => {
      const presetBtn = document.createElement('button')
      presetBtn.textContent = preset.name
      presetBtn.title = preset.pattern
      presetBtn.style.cssText = `
        padding: 4px 10px;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: #f5f5f5;
        color: #666;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      `
      presetBtn.addEventListener('mouseenter', () => {
        presetBtn.style.borderColor = '#4a90d9'
        presetBtn.style.background = '#e8f4fc'
        presetBtn.style.color = '#4a90d9'
      })
      presetBtn.addEventListener('mouseleave', () => {
        presetBtn.style.borderColor = '#ddd'
        presetBtn.style.background = '#f5f5f5'
        presetBtn.style.color = '#666'
      })
      presetBtn.addEventListener('click', () => {
        const inputContainer = document.getElementById('content-filter-inputs')
        if (!inputContainer) return

        // 检查是否只有一个空规则，如果是则替换它
        const hasOnlyEmptyRule = filterRules.length === 1 && !filterRules[0].pattern.trim()

        if (hasOnlyEmptyRule) {
          // 替换空规则
          filterRules[0].pattern = preset.pattern
          filterRules[0].isRegex = preset.isRegex

          // 更新 UI
          const existingRow = inputContainer.querySelector('.content-filter-input-row')
          if (existingRow) {
            const input = existingRow.querySelector('input[type="text"]') as HTMLInputElement
            const regexBtn = existingRow.querySelector('button') as HTMLButtonElement
            if (input) {
              input.value = preset.pattern
            }
            if (regexBtn) {
              regexBtn.textContent = preset.isRegex ? '正则' : '简单'
              regexBtn.title = preset.isRegex ? '当前为正则匹配模式' : '当前为简单匹配模式'
              regexBtn.style.borderColor = preset.isRegex ? '#4a90d9' : '#ddd'
              regexBtn.style.background = preset.isRegex ? '#e8f4fc' : '#fff'
              regexBtn.style.color = preset.isRegex ? '#4a90d9' : '#666'
            }
          }
        } else {
          // 添加新规则
          const newRule: FilterRule = {
            id: generateId(),
            pattern: preset.pattern,
            isRegex: preset.isRegex,
          }
          filterRules.push(newRule)
          const row = createInputRow(newRule, inputContainer)
          inputContainer.appendChild(row)
          updateDeleteButtonsVisibility(inputContainer)
        }

        void saveFilterRules()
      })

      presetContainer.appendChild(presetBtn)
    })

    presetSection.appendChild(presetLabel)
    presetSection.appendChild(presetContainer)
    content.appendChild(presetSection)
  }

  // 创建输入容器
  const inputContainer = document.createElement('div')
  inputContainer.id = 'content-filter-inputs'

  // 添加已有的规则
  filterRules.forEach(rule => {
    const row = createInputRow(rule, inputContainer)
    inputContainer.appendChild(row)
  })

  // 创建添加按钮
  const addBtn = document.createElement('button')
  addBtn.textContent = '+ 添加条件'
  addBtn.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-top: 8px;
    border: 2px dashed #ddd;
    border-radius: 4px;
    background: #fafafa;
    color: #666;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  `
  addBtn.addEventListener('mouseenter', () => {
    addBtn.style.borderColor = '#4a90d9'
    addBtn.style.color = '#4a90d9'
    addBtn.style.background = '#f0f7ff'
  })
  addBtn.addEventListener('mouseleave', () => {
    addBtn.style.borderColor = '#ddd'
    addBtn.style.color = '#666'
    addBtn.style.background = '#fafafa'
  })
  addBtn.addEventListener('click', () => {
    const newRule: FilterRule = { id: generateId(), pattern: '', isRegex: false }
    filterRules.push(newRule)
    const row = createInputRow(newRule, inputContainer)
    inputContainer.appendChild(row)
    void saveFilterRules()
    updateDeleteButtonsVisibility(inputContainer)
    // 聚焦到新输入框
    const newInput = row.querySelector('input') as HTMLInputElement
    if (newInput) {
      newInput.focus()
    }
  })

  content.appendChild(inputContainer)
  content.appendChild(addBtn)

  // 组装卡片
  card.appendChild(header)
  card.appendChild(content)

  // 实现拖动功能
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let cardStartX = 0
  let cardStartY = 0

  header.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    cardStartX = card.offsetLeft
    cardStartY = card.offsetTop
    e.preventDefault()
  })

  dragMouseMoveHandler = (e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY

    const newX = Math.max(0, Math.min(window.innerWidth - card.offsetWidth, cardStartX + deltaX))
    const newY = Math.max(0, Math.min(window.innerHeight - card.offsetHeight, cardStartY + deltaY))

    card.style.left = `${newX}px`
    card.style.top = `${newY}px`
  }

  dragMouseUpHandler = () => {
    if (isDragging) {
      isDragging = false
      void saveCardPosition(card.offsetLeft, card.offsetTop)
    }
  }

  document.addEventListener('mousemove', dragMouseMoveHandler)
  document.addEventListener('mouseup', dragMouseUpHandler)

  // 失去焦点时执行过滤
  card.addEventListener('focusout', (e: FocusEvent) => {
    // 检查焦点是否移出卡片
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!card.contains(relatedTarget)) {
      performFiltering()
    }
  })

  // 添加到页面
  document.body.appendChild(card)
  cardElement = card
}

// 移除过滤卡片
const removeFilterCard = (): void => {
  if (dragMouseMoveHandler) {
    document.removeEventListener('mousemove', dragMouseMoveHandler)
    dragMouseMoveHandler = null
  }

  if (dragMouseUpHandler) {
    document.removeEventListener('mouseup', dragMouseUpHandler)
    dragMouseUpHandler = null
  }

  if (cardElement) {
    cardElement.remove()
    cardElement = null
  }

  clearHighlights()
}

// 初始化功能
export const initializeContentFilter = async (): Promise<void> => {
  const enabled = await storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)

  if (enabled) {
    await enableContentFilter()
  }
}

// 启用功能
export const enableContentFilter = async (): Promise<void> => {
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, contentFilterConfig.targetPages)
  if (!isTargetPage) {
    return
  }

  maxTextLength = await loadMaxTextLength()
  await loadFilterRules()
  await createFilterCard()

  // 如果有有效的过滤规则，自动执行一次过滤
  const hasValidRules = filterRules.some(rule => rule.pattern.trim())
  if (hasValidRules) {
    performFiltering()
  }
}

// 禁用功能
export const disableContentFilter = (): void => {
  removeFilterCard()
}

// 切换功能状态
export const toggleContentFilter = async (): Promise<boolean> => {
  const currentEnabled = await storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)
  const newEnabled = !currentEnabled

  await storageHelper.saveBoolean(STORAGE_KEY, newEnabled)

  if (newEnabled) {
    await enableContentFilter()
  } else {
    disableContentFilter()
  }

  return newEnabled
}

// 获取功能状态
export const getContentFilterStatus = async (): Promise<boolean> => {
  return storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)
}

// 导出接口类型
export interface IContentFilter {
  toggle: () => Promise<boolean>
  getStatus: () => Promise<boolean>
  enable: () => Promise<void>
  disable: () => void
}

// 创建内容过滤管理器
export const createContentFilter = (): IContentFilter => {
  // 自动初始化
  void initializeContentFilter()

  return {
    toggle: toggleContentFilter,
    getStatus: getContentFilterStatus,
    enable: enableContentFilter,
    disable: disableContentFilter,
  }
}
