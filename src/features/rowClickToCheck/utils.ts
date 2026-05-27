import rowClickToCheckConfig from './config.json'
import { urlMatcher } from '@utils/urlMatcher'
import { storageHelper } from '@utils/storageHelper'

const STORAGE_KEY = rowClickToCheckConfig.storageKey

// 存储已绑定事件的表格行，防止重复绑定
const boundRows = new WeakSet<HTMLTableRowElement>()
// 存储选择范围的起始和结束行
let selectionStart: HTMLTableRowElement | null = null
let selectionEnd: HTMLTableRowElement | null = null

// 初始化功能
export const initializeRowClickToCheck = async () => {
  // 检查功能是否已启用
  const enabled = await storageHelper.loadBoolean(STORAGE_KEY, rowClickToCheckConfig.defaultEnabled)

  if (enabled) {
    enableRowClickToCheck()
  }
}

// 启用功能
export const enableRowClickToCheck = () => {
  // 确保是在目标页面
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, rowClickToCheckConfig.targetPages)
  if (!isTargetPage) {
    return
  }

  // 找到表单
  const form = document.getElementById('moderate') as HTMLFormElement
  if (!form) {
    return
  }

  // 获取所有符合条件的表格行（兼容两种页面结构）
  // 帖子管理页面：一个 tbody 包含多个 tr
  // 回收站页面：多个 tbody，每个 tbody 包含一个 tr
  const rows = form.querySelectorAll('tr:not([class])')

  rows.forEach(row => {
    const tr = row as HTMLTableRowElement
    // 检查是否已绑定事件
    if (boundRows.has(tr)) {
      return
    }

    // 查找行内的复选框（支持 delete[] 和 moderate[] 两种 name）
    const checkbox = tr.querySelector('input[type="checkbox"].pc[name="delete[]"], input[type="checkbox"].pc[name="moderate[]"]') as HTMLInputElement
    if (!checkbox) {
      return
    }

    // 绑定点击事件
    tr.addEventListener('click', e => {
      // 如果点击的是复选框本身或其他可点击元素（链接、按钮等），不处理
      const target = e.target as HTMLElement
      if (
        target === checkbox ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        (target as HTMLElement).closest('input[type="checkbox"]') ||
        (target as HTMLElement).closest('a') ||
        (target as HTMLElement).closest('button')
      ) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        // Ctrl+点击：选择范围
        handleRangeSelection(tr)
      } else {
        // 普通点击：切换单个复选框
        checkbox.checked = !checkbox.checked
      }
    })

    boundRows.add(tr)
  })
}

// 处理范围选择
const handleRangeSelection = (clickedRow: HTMLTableRowElement) => {
  // 找到表单
  const form = document.getElementById('moderate') as HTMLFormElement
  if (!form) {
    return
  }

  // 获取所有符合条件的表格行
  const rows = Array.from(form.querySelectorAll('tr:not([class])'))

  // 找到点击行在数组中的索引
  const clickedIndex = rows.indexOf(clickedRow)

  if (selectionStart === null) {
    // 第一次按下Ctrl+点击，设置起始位置
    selectionStart = clickedRow
    selectionEnd = clickedRow

    // 勾选点击的行
    const checkbox = clickedRow.querySelector('input[type="checkbox"].pc[name="delete[]"], input[type="checkbox"].pc[name="moderate[]"]') as HTMLInputElement
    if (checkbox) {
      checkbox.checked = true
    }
  } else {
    // 第二次按下Ctrl+点击，设置结束位置并勾选范围
    selectionEnd = clickedRow

    // 确定选择范围的起始和结束索引
    const startIndex = Math.min(rows.indexOf(selectionStart), clickedIndex)
    const endIndex = Math.max(rows.indexOf(selectionStart), clickedIndex)

    // 勾选范围内的所有行
    for (let i = startIndex; i <= endIndex; i++) {
      const row = rows[i] as HTMLTableRowElement
      const checkbox = row.querySelector('input[type="checkbox"].pc[name="delete[]"], input[type="checkbox"].pc[name="moderate[]"]') as HTMLInputElement
      if (checkbox) {
        checkbox.checked = true
      }
    }
  }
}

// 禁用功能
export const disableRowClickToCheck = () => {
  // 确保是在目标页面
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, rowClickToCheckConfig.targetPages)
  if (!isTargetPage) {
    return
  }

  // 找到表单
  const form = document.getElementById('moderate') as HTMLFormElement
  if (!form) {
    return
  }

  // 清除选择范围
  selectionStart = null
  selectionEnd = null

  // 获取所有符合条件的表格行
  const rows = form.querySelectorAll('tr:not([class])')

  rows.forEach(row => {
    const tr = row as HTMLTableRowElement
    // 查找行内的复选框（支持 delete[] 和 moderate[] 两种 name）
    const checkbox = tr.querySelector('input[type="checkbox"].pc[name="delete[]"], input[type="checkbox"].pc[name="moderate[]"]') as HTMLInputElement
    if (!checkbox) {
      return
    }

    // 移除事件监听器
    // 注意：由于事件监听器是匿名函数，我们需要重新获取并移除
    // 这里我们可以通过克隆节点的方式来移除所有事件监听器
    const cloned = tr.cloneNode(true) as HTMLTableRowElement
    tr.parentNode?.replaceChild(cloned, tr)

    // 从已绑定事件的行集合中移除
    boundRows.delete(tr)
  })
}

// 切换功能状态
export const toggleRowClickToCheck = async () => {
  const currentEnabled = await storageHelper.loadBoolean(STORAGE_KEY, rowClickToCheckConfig.defaultEnabled)
  const newEnabled = !currentEnabled

  await storageHelper.saveBoolean(STORAGE_KEY, newEnabled)

  if (newEnabled) {
    enableRowClickToCheck()
  } else {
    disableRowClickToCheck()
  }

  return newEnabled
}

// 获取功能状态
export const getRowClickToCheckStatus = async () => {
  return await storageHelper.loadBoolean(STORAGE_KEY, rowClickToCheckConfig.defaultEnabled)
}
