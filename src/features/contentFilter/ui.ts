import { presets } from './config'
import { performFiltering, clearHighlights } from './filtering'
import { generateId } from './matcher'
import { contentFilterState } from './state'
import { loadCardPosition, saveCardPosition, saveFilterRules, saveMaxTextLength } from './storage'
import type { FilterRule } from './types'

const updateDeleteButtonsVisibility = (container: HTMLElement): void => {
  const rows = container.querySelectorAll('.content-filter-input-row')
  rows.forEach(row => {
    const deleteBtn = row.querySelector('button:last-child')
    if (deleteBtn instanceof HTMLElement) {
      deleteBtn.style.display = contentFilterState.filterRules.length > 1 ? 'block' : 'none'
    }
  })
}

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
    display: ${contentFilterState.filterRules.length > 1 ? 'block' : 'none'};
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
    const index = contentFilterState.filterRules.findIndex(currentRule => currentRule.id === rule.id)
    if (index > -1 && contentFilterState.filterRules.length > 1) {
      contentFilterState.filterRules.splice(index, 1)
      row.remove()
      void saveFilterRules()
      updateDeleteButtonsVisibility(container)
    }
  })

  row.appendChild(input)
  row.appendChild(regexBtn)
  row.appendChild(deleteBtn)

  return row
}

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
  header.appendChild(title)
  header.appendChild(lengthContainer)

  const content = document.createElement('div')
  content.style.cssText = `
    padding: 12px;
    max-height: 400px;
    overflow-y: auto;
  `

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
        if (!(inputContainer instanceof HTMLElement)) {
          return
        }

        const hasOnlyEmptyRule = contentFilterState.filterRules.length === 1
          && !contentFilterState.filterRules[0].pattern.trim()

        if (hasOnlyEmptyRule) {
          contentFilterState.filterRules[0].pattern = preset.pattern
          contentFilterState.filterRules[0].isRegex = preset.isRegex

          const existingRow = inputContainer.querySelector('.content-filter-input-row')
          if (existingRow instanceof HTMLElement) {
            const input = existingRow.querySelector('input[type="text"]')
            const regexBtn = existingRow.querySelector('button')
            if (input instanceof HTMLInputElement) {
              input.value = preset.pattern
            }
            if (regexBtn instanceof HTMLButtonElement) {
              regexBtn.textContent = preset.isRegex ? '正则' : '简单'
              regexBtn.title = preset.isRegex ? '当前为正则匹配模式' : '当前为简单匹配模式'
              regexBtn.style.borderColor = preset.isRegex ? '#4a90d9' : '#ddd'
              regexBtn.style.background = preset.isRegex ? '#e8f4fc' : '#fff'
              regexBtn.style.color = preset.isRegex ? '#4a90d9' : '#666'
            }
          }
        } else {
          const newRule: FilterRule = {
            id: generateId(),
            pattern: preset.pattern,
            isRegex: preset.isRegex,
          }
          contentFilterState.filterRules.push(newRule)
          inputContainer.appendChild(createInputRow(newRule, inputContainer))
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

  const inputContainer = document.createElement('div')
  inputContainer.id = 'content-filter-inputs'
  contentFilterState.filterRules.forEach(rule => {
    inputContainer.appendChild(createInputRow(rule, inputContainer))
  })

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

  content.appendChild(inputContainer)
  content.appendChild(addBtn)
  card.appendChild(header)
  card.appendChild(content)

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
    if (!isDragging) {
      return
    }

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
  card.addEventListener('focusout', (event: FocusEvent) => {
    const relatedTarget = event.relatedTarget
    if (!(relatedTarget instanceof Node) || !card.contains(relatedTarget)) {
      performFiltering()
    }
  })

  document.body.appendChild(card)
  contentFilterState.cardElement = card
}

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

  clearHighlights()
}
