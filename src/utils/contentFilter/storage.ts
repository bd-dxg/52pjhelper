import { DEFAULT_CARD_POSITION, DEFAULT_MAX_TEXT_LENGTH, FILTERS_STORAGE_KEY, MAX_TEXT_LENGTH_STORAGE_KEY } from './config'
import { generateId } from './matcher'
import { contentFilterState } from './state'
import type { CardPosition, FilterRule } from './types'
import { storageHelper } from '../storageHelper'

export const saveFilterRules = async (): Promise<void> => {
  await storageHelper.saveArray(FILTERS_STORAGE_KEY, contentFilterState.filterRules)
}

export const loadFilterRules = async (): Promise<void> => {
  const savedRules = await storageHelper.loadArray<FilterRule>(FILTERS_STORAGE_KEY, [])
  if (savedRules.length > 0) {
    contentFilterState.filterRules = savedRules
    return
  }

  contentFilterState.filterRules = [{ id: generateId(), pattern: '', isRegex: false }]
}

export const saveCardPosition = async (x: number, y: number): Promise<void> => {
  await storageHelper.saveObject('contentFilterCardPosition', { x, y })
}

export const loadCardPosition = async (): Promise<CardPosition> => {
  return storageHelper.loadObject('contentFilterCardPosition', DEFAULT_CARD_POSITION)
}

export const saveMaxTextLength = async (length: number): Promise<void> => {
  await storageHelper.saveNumber(MAX_TEXT_LENGTH_STORAGE_KEY, length)
}

export const loadMaxTextLength = async (): Promise<number> => {
  return storageHelper.loadNumber(MAX_TEXT_LENGTH_STORAGE_KEY, DEFAULT_MAX_TEXT_LENGTH)
}
