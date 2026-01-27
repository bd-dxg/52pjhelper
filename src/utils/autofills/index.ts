import type { AutoFillConfig } from './base'
import { FORM_CONFIGS, loadConfig, saveConfig } from './base'
import { attachRateFormListeners } from './rateForm'
import { attachModerateFormListeners } from './moderateForm'
import { attachReportFormListeners } from './reportForm'

class AutoFillManager {
  private observer: MutationObserver | null = null
  private config: AutoFillConfig
  private isMonitoring = false
  private processedForms = new WeakSet<HTMLElement>() // 防止重复绑定

  constructor(config: AutoFillConfig) {
    this.config = config
  }

  async init() {
    this.config = await loadConfig()
    if (this.config.enabled) {
      this.startMonitoring()
    }

    browser.runtime.onMessage.addListener((message: { type: string }, sender, sendResponse) => {
      if (message.type === 'TOGGLE_AUTO_FILL') {
        this.toggle().then(sendResponse)
        return true // 表示异步响应
      } else if (message.type === 'GET_AUTO_FILL_STATUS') {
        sendResponse({ success: true, enabled: this.config.enabled })
        return false
      }
      return false
    })
  }

  /**
   * 启用功能
   */
  public async enable(): Promise<void> {
    if (this.config.enabled) return
    this.config.enabled = true
    await saveConfig(this.config.enabled)
    this.startMonitoring()
  }

  /**
   * 禁用功能
   */
  public async disable(): Promise<void> {
    if (!this.config.enabled) return
    this.config.enabled = false
    await saveConfig(this.config.enabled)
    this.stopMonitoring()
  }

  private startMonitoring() {
    if (this.isMonitoring) return

    // 监听表单的创建
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // 遍历所有表单配置
              FORM_CONFIGS.forEach(({ id, handler }) => {
                const form = node.id === id ? node : node.querySelector(`#${id}`)
                if (form instanceof HTMLElement && !this.processedForms.has(form)) {
                  this.processedForms.add(form)
                  this[handler](form as HTMLFormElement)
                }
              })
            }
          })
        }
      }
    })

    // 开始监听整个文档的变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 检查页面上是否已经存在表单
    FORM_CONFIGS.forEach(({ id, handler }) => {
      const existingForm = document.getElementById(id)
      if (existingForm && !this.processedForms.has(existingForm)) {
        this.processedForms.add(existingForm)
        this[handler](existingForm as HTMLFormElement)
      }
    })

    this.isMonitoring = true
  }

  private stopMonitoring() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.processedForms = new WeakSet()
    this.isMonitoring = false
  }

  // 绑定评分表单监听器
  private attachRateFormListeners(form: HTMLFormElement) {
    attachRateFormListeners(form, this.config)
  }

  // 绑定处理表单监听器
  private attachModerateFormListeners(form: HTMLFormElement) {
    attachModerateFormListeners(form, this.config)
  }

  // 绑定举报表单监听器
  private attachReportFormListeners(form: HTMLFormElement) {
    attachReportFormListeners(form, this.config)
  }

  async toggle() {
    this.config.enabled = !this.config.enabled
    await saveConfig(this.config.enabled)

    if (this.config.enabled) {
      this.startMonitoring()
    } else {
      this.stopMonitoring()
    }

    return { success: true, enabled: this.config.enabled }
  }

  isEnabled() {
    return this.config.enabled
  }
}

// 初始化管理器
let autoFillManager: AutoFillManager

// 延迟初始化，确保 config 正确加载
export const getAutoFillManager = async (): Promise<AutoFillManager> => {
  if (!autoFillManager) {
    const config = await loadConfig()
    autoFillManager = new AutoFillManager(config)
    await autoFillManager.init()
  }
  return autoFillManager
}

// 直接导出实例（用于快速访问）
loadConfig().then(config => {
  autoFillManager = new AutoFillManager(config)
  autoFillManager.init()
})

// 导出默认实例（向后兼容）
export { autoFillManager }