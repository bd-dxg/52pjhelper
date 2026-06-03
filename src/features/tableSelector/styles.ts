/**
 * 分表选择器 - 样式管理
 */

let styleElement: HTMLStyleElement | null = null

const STYLE_CONTENT = `
  #posttableid_ctrl {
    display: none;
  }
  .table-btn-active {
    background-color: #ffbd10;
  }
  .table-btn-container {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    flex-wrap: nowrap;
    width: 380px;
    height: 68px;
  }
  .table-btn-container button {
    font-family: monospace !important;
    width: 80px;
    height: 26px;
    margin: 3px 5px;
    padding: 0;
    box-sizing: border-box;
  }
  .table-btn-left {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex-shrink: 0;
    background: #a3d0ed;
    border-radius: 5px;
    padding: 3px;
  }
  .table-btn-right {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 5px;
    flex: 1;
    padding: 3px;
  }
  /* 蛇形布局:第二排倒序(强制指定行和列) */
  .table-btn-right button:nth-child(6) { grid-column: 1; grid-row: 2; }
  .table-btn-right button:nth-child(5) { grid-column: 2; grid-row: 2; }
  .table-btn-right button:nth-child(4) { grid-column: 3; grid-row: 2; }
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
