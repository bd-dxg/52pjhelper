/**
 * 内容过滤 - 输入行组件
 */

import { contentFilterState } from './state'
import { saveFilterRules } from './storage'
import type { FilterRule } from './types'

/**
 * 更新删除按钮可见性
 */
export const updateDeleteButtonsVisibility = (container: HTMLElement): void => {
  const rows = container.querySelectorAll('.content-filter-input-row')
  rows.forEach(row => {
    const deleteBtn = row.querySelector('button:last-child')
    if (deleteBtn instanceof HTMLElement) {
      deleteBtn.style.display = contentFilterState.filterRules.length > 1 ? 'block' : 'none'
    }
  })
}

/**
 * 创建输入行
 */
export const createInputRow = (rule: FilterRule, container: HTMLElement): HTMLElement => {
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
