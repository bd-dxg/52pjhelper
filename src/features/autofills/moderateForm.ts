import { fillInput, shouldFill } from './base'
import type { AutoFillConfig } from './base'

/**
 * 处理分类表单（moderateform）的自动填充
 * 监控 typeid 下拉框的选项
 * 选择"已答复"时填充："欢迎分析讨论交流，吾爱破解论坛有你更精彩！"
 * 选择"已处理"时填充："已经处理，感谢您对吾爱破解论坛的支持！"
 */
export const attachModerateFormListeners = (form: HTMLFormElement, config: AutoFillConfig): (() => void) | undefined => {
  const typeIdSelect = form.querySelector('#typeid') as HTMLSelectElement
  const reasonTextarea = form.querySelector('#reason') as HTMLTextAreaElement

  if (!typeIdSelect || !reasonTextarea) {
    return undefined
  }

  const checkAndFill = () => {
    const selectedOption = typeIdSelect.options[typeIdSelect.selectedIndex]
    const selectedText = selectedOption?.text?.trim()

    // 根据选择的选项填充不同的内容
    const messageMap: Record<string, string> = {
      已答复: config.messages.replied,
      已处理: config.messages.default,
    }

    const message = messageMap[selectedText]
    if (message && shouldFill(reasonTextarea.value, config.messages.replied, config.messages.default)) {
      fillInput(reasonTextarea, message)
    }
  }

  // 监听选择变化事件
  typeIdSelect.addEventListener('change', checkAndFill)

  // 初始检查
  checkAndFill()

  // 返回清理函数
  return () => {
    typeIdSelect.removeEventListener('change', checkAndFill)
  }
}
