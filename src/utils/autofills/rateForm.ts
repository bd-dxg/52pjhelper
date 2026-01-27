import { fillInput, shouldFill } from './base'
import type { AutoFillConfig } from './base'

/**
 * 处理评分表单（rateform）的自动填充
 * 监控 score2（威望）和 score6（热心值）输入框
 * 当 score2 > 0 或 score6 = 1 时自动填充
 * 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"
 */
export const attachRateFormListeners = (form: HTMLFormElement, config: AutoFillConfig) => {
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
      if (shouldFill(reasonInput.value, config.messages.default)) {
        fillInput(reasonInput, config.messages.default)
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