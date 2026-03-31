import contentFilterConfig from '@/configs/contentFilter.json'
import type { PresetRule } from './types'

export const STORAGE_KEY = contentFilterConfig.storageKey
export const FILTERS_STORAGE_KEY = contentFilterConfig.filtersStorageKey
export const MAX_TEXT_LENGTH_STORAGE_KEY = 'contentFilterMaxTextLength'
export const DEFAULT_MAX_TEXT_LENGTH = contentFilterConfig.maxTextLength
export const REGEX_PATTERN_MAX_LENGTH = 100
export const DEFAULT_CARD_POSITION = { x: 20, y: 100 }
export const presets: PresetRule[] = (contentFilterConfig as { presets?: PresetRule[] }).presets ?? []

export { contentFilterConfig }
