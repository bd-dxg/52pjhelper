import rowClickToCheckConfig from '@/configs/rowClickToCheck.json'

const STORAGE_KEY = rowClickToCheckConfig.storageKey

// 存储已绑定事件的表格行，防止重复绑定
const boundRows = new WeakSet<HTMLTableRowElement>()

// 初始化功能
export const initializeRowClickToCheck = async () => {
  // 检查功能是否已启用
  const result = await browser.storage.local.get(STORAGE_KEY)
  const enabled = (result[STORAGE_KEY] as boolean | undefined) ?? rowClickToCheckConfig.defaultEnabled

  if (enabled) {
    enableRowClickToCheck()
  }
}

// 启用功能
export const enableRowClickToCheck = () => {
  // 确保是在目标页面
  if (!window.location.href.includes('forum.php?mod=modcp&action=thread&op=post')) {
    return
  }

  // 找到表单和表格
  const form = document.getElementById('moderate') as HTMLFormElement
  if (!form) {
    return
  }

  const tbody = form.querySelector('tbody')
  if (!tbody) {
    return
  }

  // 获取所有符合条件的表格行
  const rows = tbody.querySelectorAll('tr:not([class])')

  rows.forEach(row => {
    const tr = row as HTMLTableRowElement
    // 检查是否已绑定事件
    if (boundRows.has(tr)) {
      return
    }

    // 查找行内的复选框
    const checkbox = tr.querySelector('input[type="checkbox"][name="delete[]"].pc') as HTMLInputElement
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

      // 切换复选框状态
      checkbox.checked = !checkbox.checked
    })

    boundRows.add(tr)
  })
}

// 禁用功能
export const disableRowClickToCheck = () => {
  // 确保是在目标页面
  if (!window.location.href.includes('forum.php?mod=modcp&action=thread&op=post')) {
    return
  }

  // 找到表单和表格
  const form = document.getElementById('moderate') as HTMLFormElement
  if (!form) {
    return
  }

  const tbody = form.querySelector('tbody')
  if (!tbody) {
    return
  }

  // 获取所有符合条件的表格行
  const rows = tbody.querySelectorAll('tr:not([class])')

  rows.forEach(row => {
    const tr = row as HTMLTableRowElement
    // 查找行内的复选框
    const checkbox = tr.querySelector('input[type="checkbox"][name="delete[]"].pc') as HTMLInputElement
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
  const result = await browser.storage.local.get(STORAGE_KEY)
  const currentEnabled = (result[STORAGE_KEY] as boolean | undefined) ?? rowClickToCheckConfig.defaultEnabled
  const newEnabled = !currentEnabled

  await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })

  if (newEnabled) {
    enableRowClickToCheck()
  } else {
    disableRowClickToCheck()
  }

  return newEnabled
}

// 获取功能状态
export const getRowClickToCheckStatus = async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  return (result[STORAGE_KEY] as boolean | undefined) ?? rowClickToCheckConfig.defaultEnabled
}
