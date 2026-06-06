type QuickReplyPreset = {
  label: string
  content: string
}

/**
 * 创建快捷回复面板
 * @param presets 预设列表
 * @param textarea 目标输入框
 * @returns 面板元素
 */
export const createQuickReplyPanel = (
  presets: QuickReplyPreset[],
  textarea: HTMLTextAreaElement,
): HTMLElement => {
  const panel = document.createElement('div')
  panel.className = 'popup-quick-reply-panel'

  const style = document.createElement('style')
  style.textContent = `
    .popup-quick-reply-panel {
      margin-bottom: 10px;
      padding: 10px;
      background: #f8f8f8;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .darkreader .popup-quick-reply-panel,
    body.darkreader .popup-quick-reply-panel {
      background: #2a2a2e;
      border-color: #4a4a4e;
    }
    .popup-quick-reply-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .popup-quick-reply-btn {
      padding: 4px 10px;
      font-size: 12px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background: #fff;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .darkreader .popup-quick-reply-btn,
    body.darkreader .popup-quick-reply-btn {
      background: #3a3a3e;
      color: #e0e0e0;
      border-color: #5a5a5e;
    }
    .popup-quick-reply-btn:hover {
      background: #e8e8e8;
      border-color: #999;
    }
    .darkreader .popup-quick-reply-btn:hover,
    body.darkreader .popup-quick-reply-btn:hover {
      background: #4a4a4e;
      border-color: #7a7a7e;
    }
    .popup-quick-reply-btn:active {
      background: #d0d0d0;
    }
    .darkreader .popup-quick-reply-btn:active,
    body.darkreader .popup-quick-reply-btn:active {
      background: #5a5a5e;
    }
  `
  panel.appendChild(style)

  const list = document.createElement('div')
  list.className = 'popup-quick-reply-list'

  for (const preset of presets) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'popup-quick-reply-btn'
    btn.textContent = preset.label
    btn.title = preset.content

    btn.addEventListener('click', () => {
      textarea.value = preset.content
      // 触发 input 事件，确保论坛脚本能捕获到值变化
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.dispatchEvent(new Event('change', { bubbles: true }))
    })

    list.appendChild(btn)
  }

  panel.appendChild(list)
  return panel
}
