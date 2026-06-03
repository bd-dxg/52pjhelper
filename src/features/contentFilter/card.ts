/**
 * 内容过滤 - 卡片容器和拖拽逻辑
 */

import { contentFilterState } from './state'
import { loadCardPosition, saveCardPosition, saveMaxTextLength, saveFilterRules } from './storage'
import { performFiltering } from './filtering'
import { createInputRow, updateDeleteButtonsVisibility } from './inputRow'
import { createPresetSection } from './presetButtons'
import { generateId } from './matcher'
import type { FilterRule } from './types'

/**
 * 创建筛选卡片
 */
export const createFilterCard = async (): Promise<void> => {
  if (contentFilterState.cardElement) {
    return
  }

  const position = await loadCardPosition()
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

  const header = createHeader()
  const content = createContent()

  card.appendChild(header)
  card.appendChild(content)

  setupDragLogic(card, header)

  card.addEventListener('focusout', (event: FocusEvent) => {
    const relatedTarget = event.relatedTarget
    if (!(relatedTarget instanceof Node) || !card.contains(relatedTarget)) {
      performFiltering()
    }
  })

  document.body.appendChild(card)
  contentFilterState.cardElement = card
}

/**
 * 创建卡片头部
 */
const createHeader = (): HTMLElement => {
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

  const lengthContainer = createLengthInput()

  header.appendChild(title)
  header.appendChild(lengthContainer)

  return header
}

/**
 * 创建长度输入组件
 */
const createLengthInput = (): HTMLElement => {
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
  lengthInput.value = String(contentFilterState.maxTextLength)
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
  lengthInput.addEventListener('focus', event => {
    event.stopPropagation()
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
      contentFilterState.maxTextLength = newLength
      void saveMaxTextLength(newLength)
      return
    }

    lengthInput.value = String(contentFilterState.maxTextLength)
  })
  lengthInput.addEventListener('mousedown', event => {
    event.stopPropagation()
  })

  const lengthSuffix = document.createElement('span')
  lengthSuffix.textContent = '字'

  lengthContainer.appendChild(lengthPrefix)
  lengthContainer.appendChild(lengthInput)
  lengthContainer.appendChild(lengthSuffix)

  return lengthContainer
}

/**
 * 创建卡片内容
 */
const createContent = (): HTMLElement => {
  const content = document.createElement('div')
  content.style.cssText = `
    padding: 12px;
    max-height: 400px;
    overflow-y: auto;
  `

  const inputContainer = document.createElement('div')
  inputContainer.id = 'content-filter-inputs'

  const presetSection = createPresetSection(inputContainer)
  if (presetSection) {
    content.appendChild(presetSection)
  }

  contentFilterState.filterRules.forEach(rule => {
    inputContainer.appendChild(createInputRow(rule, inputContainer))
  })

  const addBtn = createAddButton(inputContainer)

  content.appendChild(inputContainer)
  content.appendChild(addBtn)

  return content
}

/**
 * 创建添加按钮
 */
const createAddButton = (inputContainer: HTMLElement): HTMLElement => {
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
    contentFilterState.filterRules.push(newRule)
    const row = createInputRow(newRule, inputContainer)
    inputContainer.appendChild(row)
    void saveFilterRules()
    updateDeleteButtonsVisibility(inputContainer)

    const newInput = row.querySelector('input')
    if (newInput instanceof HTMLInputElement) {
      newInput.focus()
    }
  })

  return addBtn
}

/**
 * 设置拖拽逻辑
 */
const setupDragLogic = (card: HTMLElement, header: HTMLElement): void => {
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let cardStartX = 0
  let cardStartY = 0

  header.addEventListener('mousedown', (event: MouseEvent) => {
    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    cardStartX = card.offsetLeft
    cardStartY = card.offsetTop
    event.preventDefault()
  })

  contentFilterState.dragMouseMoveHandler = (event: MouseEvent) => {
    if (!isDragging) return

    const deltaX = event.clientX - dragStartX
    const deltaY = event.clientY - dragStartY
    const newX = Math.max(0, Math.min(window.innerWidth - card.offsetWidth, cardStartX + deltaX))
    const newY = Math.max(0, Math.min(window.innerHeight - card.offsetHeight, cardStartY + deltaY))

    card.style.left = `${newX}px`
    card.style.top = `${newY}px`
  }

  contentFilterState.dragMouseUpHandler = () => {
    if (isDragging) {
      isDragging = false
      void saveCardPosition(card.offsetLeft, card.offsetTop)
    }
  }

  document.addEventListener('mousemove', contentFilterState.dragMouseMoveHandler)
  document.addEventListener('mouseup', contentFilterState.dragMouseUpHandler)
}

/**
 * 移除筛选卡片
 */
export const removeFilterCard = (): void => {
  if (contentFilterState.dragMouseMoveHandler) {
    document.removeEventListener('mousemove', contentFilterState.dragMouseMoveHandler)
    contentFilterState.dragMouseMoveHandler = null
  }

  if (contentFilterState.dragMouseUpHandler) {
    document.removeEventListener('mouseup', contentFilterState.dragMouseUpHandler)
    contentFilterState.dragMouseUpHandler = null
  }

  if (contentFilterState.cardElement) {
    contentFilterState.cardElement.remove()
    contentFilterState.cardElement = null
  }
}
