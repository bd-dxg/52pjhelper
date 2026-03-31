export interface PresetRule {
  name: string
  pattern: string
  isRegex: boolean
}

export interface FilterRule {
  id: string
  pattern: string
  isRegex: boolean
}

export interface CardPosition {
  x: number
  y: number
}
