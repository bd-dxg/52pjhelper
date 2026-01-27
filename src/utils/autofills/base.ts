import autoFillConfig from '@/configs/autoFill.json'

const STORAGE_KEY = autoFillConfig.storageKey

export interface AutoFillConfig {
  enabled: boolean
  messages: {
    default: string
    replied: string
  }
}

// 表单配置
export const FORM_CONFIGS = [
  { id: 'rateform', handler: 'attachRateFormListeners' },
  { id: 'moderateform', handler: 'attachModerateFormListeners' },
  { id: 'reportform', handler: 'attachReportFormListeners' }
] as const

// 公共方法：填充输入框并触发事件
export const fillInput = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

// 公共方法：检查是否应该填充（输入框为空或已是自动填充的内容）
export const shouldFill = (currentValue: string, ...autoFillValues: string[]): boolean => {
  return !currentValue || autoFillValues.includes(currentValue)
}

// 加载配置
export const loadConfig = async (): Promise<AutoFillConfig> => {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const enabled = (result[STORAGE_KEY] as boolean | undefined) ?? autoFillConfig.defaultEnabled
    return {
      enabled,
      messages: autoFillConfig.messages
    }
  } catch (error) {
    console.error('加载自动填充配置失败:', error)
    return {
      enabled: autoFillConfig.defaultEnabled,
      messages: autoFillConfig.messages
    }
  }
}

// 保存配置
export const saveConfig = async (enabled: boolean) => {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: enabled })
  } catch (error) {
    console.error('保存自动填充配置失败:', error)
  }
}