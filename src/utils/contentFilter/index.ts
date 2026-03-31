import { contentFilterConfig, STORAGE_KEY } from './config'
import { performFiltering } from './filtering'
import { contentFilterState } from './state'
import { loadFilterRules, loadMaxTextLength } from './storage'
import { removeFilterCard, createFilterCard } from './ui'
import { storageHelper } from '../storageHelper'
import { urlMatcher } from '../urlMatcher'

export interface IContentFilter {
  toggle: () => Promise<boolean>
  getStatus: () => Promise<boolean>
  enable: () => Promise<void>
  disable: () => void
}

export const initializeContentFilter = async (): Promise<void> => {
  const enabled = await storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)
  if (enabled) {
    await enableContentFilter()
  }
}

export const enableContentFilter = async (): Promise<void> => {
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, contentFilterConfig.targetPages)
  if (!isTargetPage) {
    return
  }

  contentFilterState.maxTextLength = await loadMaxTextLength()
  await loadFilterRules()
  await createFilterCard()

  const hasValidRules = contentFilterState.filterRules.some(rule => rule.pattern.trim())
  if (hasValidRules) {
    performFiltering()
  }
}

export const disableContentFilter = (): void => {
  removeFilterCard()
}

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

export const getContentFilterStatus = async (): Promise<boolean> => {
  return storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)
}

export const createContentFilter = (): IContentFilter => {
  void initializeContentFilter()

  return {
    toggle: toggleContentFilter,
    getStatus: getContentFilterStatus,
    enable: enableContentFilter,
    disable: disableContentFilter,
  }
}
