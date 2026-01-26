import autoFillConfig from '@/configs/autoFill.json'

const STORAGE_KEY = autoFillConfig.storageKey

interface AutoFillConfig {
  enabled: boolean
  messages: {
    default: string
    replied: string
  }
}

// 表单配置
const FORM_CONFIGS = [
  { id: 'rateform', handler: 'attachRateFormListeners' },
  { id: 'moderateform', handler: 'attachModerateFormListeners' },
  { id: 'reportform', handler: 'attachReportFormListeners' }
] as const

class AutoFillManager {
  private observer: MutationObserver | null = null
  private config: AutoFillConfig = {
    enabled: autoFillConfig.defaultEnabled,
    messages: autoFillConfig.messages
  }
  private isMonitoring = false
  private processedForms = new WeakSet<HTMLElement>() // 防止重复绑定

  async init() {
    this.config = await this.loadConfig()
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

  private async loadConfig(): Promise<AutoFillConfig> {
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

  private async saveConfig() {
    try {
      await browser.storage.local.set({ [STORAGE_KEY]: this.config.enabled })
    } catch (error) {
      console.error('保存自动填充配置失败:', error)
    }
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

  // 公共方法：填充输入框并触发事件
  private fillInput(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  // 公共方法：检查是否应该填充（输入框为空或已是自动填充的内容）
  private shouldFill(currentValue: string, ...autoFillValues: string[]): boolean {
    return !currentValue || autoFillValues.includes(currentValue)
  }

  private attachRateFormListeners(form: HTMLFormElement) {
    const score2Input = form.querySelector('#score2') as HTMLInputElement
    const score6Input = form.querySelector('#score6') as HTMLInputElement
    const reasonInput = form.querySelector('#reason') as HTMLInputElement

    if (!score2Input || !score6Input || !reasonInput) {
      return
    }

    const checkAndFill = () => {
      const score2Value = parseInt(score2Input.value) || 0
      const score6Value = parseInt(score6Input.value) || 0

      // 如果 score2 > 0 或 score6 = 1，则自动填充 reason
      if (score2Value > 0 || score6Value === 1) {
        if (this.shouldFill(reasonInput.value, this.config.messages.default)) {
          this.fillInput(reasonInput, this.config.messages.default)
        }
      }
    }

    // 监听输入事件
    score2Input.addEventListener('input', checkAndFill)
    score6Input.addEventListener('input', checkAndFill)
    score2Input.addEventListener('change', checkAndFill)
    score6Input.addEventListener('change', checkAndFill)

    // 初始检查
    checkAndFill()
  }

  private attachModerateFormListeners(form: HTMLFormElement) {
    const typeIdSelect = form.querySelector('#typeid') as HTMLSelectElement
    const reasonTextarea = form.querySelector('#reason') as HTMLTextAreaElement

    if (!typeIdSelect || !reasonTextarea) {
      return
    }

    const checkAndFill = () => {
      const selectedOption = typeIdSelect.options[typeIdSelect.selectedIndex]
      const selectedText = selectedOption?.text?.trim()

      // 根据选择的选项填充不同的内容
      const messageMap: Record<string, string> = {
        '已答复': this.config.messages.replied,
        '已处理': this.config.messages.default
      }

      const message = messageMap[selectedText]
      if (message && this.shouldFill(reasonTextarea.value, this.config.messages.replied, this.config.messages.default)) {
        this.fillInput(reasonTextarea, message)
      }
    }

    // 监听选择变化事件
    typeIdSelect.addEventListener('change', checkAndFill)

    // 初始检查
    checkAndFill()
  }

  private attachReportFormListeners(form: HTMLFormElement) {
    // 获取所有 select[name*="creditsvalue"] 元素
    const creditSelects = form.querySelectorAll('select[name*="creditsvalue"]') as NodeListOf<HTMLSelectElement>
    // 获取所有 input[name*="msg"] 元素
    const msgInputs = form.querySelectorAll('input[name*="msg"]') as NodeListOf<HTMLInputElement>

    if (creditSelects.length === 0 || msgInputs.length === 0) {
      return
    }

    // 为每个 select 添加监听器
    creditSelects.forEach((select, index) => {
      const correspondingInput = msgInputs[index]
      if (!correspondingInput) return

      const checkAndFill = () => {
        const numValue = parseInt(select.value.trim())

        // 如果是正整数，则自动填充
        if (!isNaN(numValue) && numValue > 0) {
          if (this.shouldFill(correspondingInput.value, this.config.messages.default)) {
            this.fillInput(correspondingInput, this.config.messages.default)
          }
        }
      }

      // 监听选择变化事件
      select.addEventListener('change', checkAndFill)

      // 初始检查
      checkAndFill()
    })
  }

  async toggle() {
    this.config.enabled = !this.config.enabled
    await this.saveConfig()

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

export const autoFillManager = new AutoFillManager()
