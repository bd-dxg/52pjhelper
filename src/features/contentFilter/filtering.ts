import { contentFilterState } from './state'
import { getTextLength, matchesRule } from './matcher'

export const clearHighlights = (): void => {
  const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
  highlightedRows.forEach(row => {
    if (!(row instanceof HTMLElement)) {
      return
    }

    row.style.backgroundColor = ''
    delete row.dataset.contentFilterHighlight

    const checkbox = row.querySelector('.pc')
    if (checkbox instanceof HTMLInputElement && checkbox.type === 'checkbox') {
      checkbox.checked = false
    }
  })
}

export const performFiltering = (): void => {
  clearHighlights()

  const validRules = contentFilterState.filterRules.filter(rule => rule.pattern.trim())
  if (validRules.length === 0) {
    return
  }

  const elements = document.querySelectorAll('#moderate tbody .xg1')

  elements.forEach(element => {
    const text = element.textContent?.trim() || ''
    if (getTextLength(text) > contentFilterState.maxTextLength) {
      return
    }

    const isMatched = validRules.some(rule => matchesRule(text, rule))
    const row = element.closest('#moderate > table > tbody > tr')
    if (!(row instanceof HTMLElement)) {
      return
    }

    if (isMatched) {
      row.style.backgroundColor = '#fffacd'
      row.dataset.contentFilterHighlight = 'true'

      const checkbox = row.querySelector('.pc')
      if (checkbox instanceof HTMLInputElement && checkbox.type === 'checkbox') {
        checkbox.checked = true
      }
    }
  })
}
