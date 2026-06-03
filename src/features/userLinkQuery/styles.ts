/**
 * 用户链接查询 - 样式管理
 */

let styleElement: HTMLStyleElement | null = null

const STYLE_CONTENT = `
  .user-link-popup {
    position: fixed;
    background: #fff;
    border: 1px solid #d1d5da;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 99999;
    width: 620px;
    max-height: 400px;
    overflow-y: auto;
    display: none;
    font-size: 12px;
    line-height: 1.4;
    color: #24292f;
    pointer-events: auto;
  }
  .user-link-popup.show {
    display: block;
  }
  .user-link-popup #pcr {
    background: transparent;
    padding: 0;
    margin: 0;
    border: none;
    width: 100%;
  }
  .user-link-popup #pcr td {
    padding: 4px 8px;
    border-bottom: 1px solid #e1e4e8;
  }
  .user-link-popup #pcr tr:last-child td {
    border-bottom: none;
  }
  .user-link-popup #pcr th {
    background-color: #f6f8fa;
    font-weight: 600;
    padding: 8px;
    border-bottom: 2px solid #d1d5da;
  }
  .user-link-popup .no-violation {
    color: #57606a;
    font-style: italic;
    text-align: center;
    padding: 20px;
  }
  .user-link-popup .loading {
    color: #57606a;
    text-align: center;
    padding: 20px;
  }
  .user-link-popup .error {
    color: #cf222e;
    text-align: center;
    padding: 20px;
  }
`

export const injectStyles = (): void => {
  if (styleElement) return

  styleElement = document.createElement('style')
  styleElement.textContent = STYLE_CONTENT
  document.head.appendChild(styleElement)
}

export const removeStyles = (): void => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
}
