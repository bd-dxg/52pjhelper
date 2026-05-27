import { REGEX_PATTERN_MAX_LENGTH } from './config'
import type { FilterRule } from './types'

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `filter-${crypto.randomUUID()}`
  }

  return `filter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const getTextLength = (text: string): number => {
  let length = 0
  for (const char of text) {
    if (/[一-龥]/.test(char)) {
      length += 1
    } else {
      length += 0.5
    }
  }
  return length
}

export const matchesRule = (text: string, rule: FilterRule): boolean => {
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
    return false
  }
}
