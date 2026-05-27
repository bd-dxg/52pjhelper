import { fillInput, shouldFill } from './base'
import type { AutoFillConfig } from './base'

/**
 * 处理举报表单（reportform）的自动填充
 * 监控所有 select[name*="creditsvalue"] 元素
 * 当选择正数值（如 +1, +2, +5）时自动填充对应的 input[name*="msg"]
 * 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"
 */
export const attachReportFormListeners = (form: HTMLFormElement, config: AutoFillConfig): (() => void) | undefined => {
  // 获取所有 select[name*="creditsvalue"] 元素
  const creditSelects = form.querySelectorAll('select[name*="creditsvalue"]') as NodeListOf<HTMLSelectElement>
  // 获取所有 input[name*="msg"] 元素
  const msgInputs = form.querySelectorAll('input[name*="msg"]') as NodeListOf<HTMLInputElement>

  if (creditSelects.length === 0 || msgInputs.length === 0) {
    return undefined
  }

  // 存储所有监听器，以便后续清理
  const listeners: Array<{ element: HTMLElement; event: string; handler: () => void }> = []

  // 为每个 select 添加监听器
  creditSelects.forEach((select, index) => {
    const correspondingInput = msgInputs[index]
    if (!correspondingInput) return

    const checkAndFill = () => {
      const numValue = parseInt(select.value.trim())

      // 如果是正整数，则自动填充
      if (!isNaN(numValue) && numValue > 0) {
        if (shouldFill(correspondingInput.value, config.messages.default)) {
          fillInput(correspondingInput, config.messages.default)
        }
      }
    }

    // 监听选择变化事件
    select.addEventListener('change', checkAndFill)
    listeners.push({ element: select, event: 'change', handler: checkAndFill })

    // 初始检查
    checkAndFill()
  })

  // 返回清理函数
  return () => {
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
  }
}
