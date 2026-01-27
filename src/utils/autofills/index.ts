import type { AutoFillConfig } from './base'
import { FORM_CONFIGS, loadConfig, saveConfig } from './base'
import { attachRateFormListeners } from './rateForm'
import { attachModerateFormListeners } from './moderateForm'
import { attachReportFormListeners } from './reportForm'

// 状态管理
let config: AutoFillConfig | null = null
let observer: MutationObserver | null = null
let isMonitoring = false
let processedForms = new WeakSet<HTMLElement>() // 防止重复绑定
let cleanupFunctions = new WeakMap<HTMLElement, () => void>() // 存储清理函数

// 表单处理函数映射
const formHandlers = {
  attachRateFormListeners,
  attachModerateFormListeners,
  attachReportFormListeners
}

// 启动监控
const startMonitoring = () => {
  if (isMonitoring || !config) return

  // 监听表单的创建
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // 遍历所有表单配置
            FORM_CONFIGS.forEach(({ id, handler }) => {
              const form = node.id === id ? node : node.querySelector(`#${id}`)
              if (form instanceof HTMLElement && !processedForms.has(form)) {
                processedForms.add(form)
                const handlerFunc = formHandlers[handler as keyof typeof formHandlers]
                if (handlerFunc && config) {
                  const cleanup = handlerFunc(form as HTMLFormElement, config)
                  if (cleanup) {
                    cleanupFunctions.set(form, cleanup)
                  }
                }
              }
            })
          }
        })
      }
    }
  })

  // 开始监听整个文档的变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // 检查页面上是否已经存在表单
  FORM_CONFIGS.forEach(({ id, handler }) => {
    const existingForm = document.getElementById(id)
    if (existingForm && !processedForms.has(existingForm)) {
      processedForms.add(existingForm)
      const handlerFunc = formHandlers[handler as keyof typeof formHandlers]
      if (handlerFunc && config) {
        const cleanup = handlerFunc(existingForm as HTMLFormElement, config)
        if (cleanup) {
          cleanupFunctions.set(existingForm, cleanup)
        }
      }
    }
  })

  isMonitoring = true
}

// 停止监控
const stopMonitoring = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }

  // 清理所有已绑定的事件监听器
  // 注意：由于 WeakMap 不支持迭代，我们需要在页面上查找所有已处理的表单
  FORM_CONFIGS.forEach(({ id }) => {
    const form = document.getElementById(id)
    if (form) {
      const cleanup = cleanupFunctions.get(form)
      if (cleanup) {
        cleanup()
        cleanupFunctions.delete(form)
      }
    }
  })

  // 使用新的 WeakSet 替代 clear 方法
  processedForms = new WeakSet<HTMLElement>()
  isMonitoring = false
}

// 启用功能
export const enable = async (): Promise<void> => {
  if (!config) {
    config = await loadConfig()
  }
  if (config.enabled) return
  config.enabled = true
  await saveConfig(config.enabled)
  startMonitoring()
}

// 禁用功能
export const disable = async (): Promise<void> => {
  if (!config) {
    config = await loadConfig()
  }
  if (!config.enabled) return
  config.enabled = false
  await saveConfig(config.enabled)
  stopMonitoring()
}

// 切换功能
export const toggle = async (): Promise<{ success: boolean; enabled: boolean }> => {
  if (!config) {
    config = await loadConfig()
  }
  config.enabled = !config.enabled
  await saveConfig(config.enabled)

  if (config.enabled) {
    startMonitoring()
  } else {
    stopMonitoring()
  }

  return { success: true, enabled: config.enabled }
}

// 检查是否启用
export const isEnabled = (): boolean => {
  return config?.enabled ?? false
}

// 初始化
export const init = async (): Promise<void> => {
  config = await loadConfig()
  if (config.enabled) {
    startMonitoring()
  }
}