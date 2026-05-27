import { DEFAULT_MAX_TEXT_LENGTH } from './config'
import type { FilterRule } from './types'

interface ContentFilterState {
  cardElement: HTMLElement | null
  filterRules: FilterRule[]
  maxTextLength: number
  dragMouseMoveHandler: ((event: MouseEvent) => void) | null
  dragMouseUpHandler: (() => void) | null
}

export const contentFilterState: ContentFilterState = {
  cardElement: null,
  filterRules: [],
  maxTextLength: DEFAULT_MAX_TEXT_LENGTH,
  dragMouseMoveHandler: null,
  dragMouseUpHandler: null,
}
