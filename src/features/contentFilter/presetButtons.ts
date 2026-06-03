/**
 * 内容过滤 - 预设按钮组件
 */

import { presets } from './config'
import { contentFilterState } from './state'
import { generateId } from './matcher'
import { saveFilterRules } from './storage'
import { createInputRow, updateDeleteButtonsVisibility } from './inputRow'
import type { FilterRule } from './types'

/**
 * 创建预设按钮区域
 */
export const createPresetSection = (inputContainer: HTMLElement): HTMLElement | null => {
  if (presets.length === 0) return null

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
      handlePresetClick(preset, inputContainer)
    })

    presetContainer.appendChild(presetBtn)
  })

  presetSection.appendChild(presetLabel)
  presetSection.appendChild(presetContainer)

  return presetSection
}

/**
 * 处理预设按钮点击
 */
const handlePresetClick = (
  preset: { name: string; pattern: string; isRegex: boolean },
  inputContainer: HTMLElement
): void => {
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
}
