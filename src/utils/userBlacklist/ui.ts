import type { UserBlacklistData, UserBlacklistItem } from './types'

let styleElement: HTMLStyleElement | null = null
let currentPopup: HTMLDivElement | null = null
let isPopupHovered = false

/**
 * 注入样式
 */
export const injectStyles = (): void => {
  if (styleElement) return

  styleElement = document.createElement('style')
  styleElement.textContent = `
    .user-blacklist-highlight {
      background-color: black !important;
      color: white !important;
      padding: 2px 4px !important;
      border-radius: 3px !important;
      cursor: help !important;
    }
    .user-blacklist-popup {
      position: fixed !important;
      width: 400px !important;
      max-height: 300px !important;
      overflow-y: auto !important;
      background-color: #fdfdfde5 !important;
      backdrop-filter: blur(8px);
      border: 1px solid #ccc !important;
      border-radius: 5px !important;
      box-shadow: 0 0 10px #0000000a,0 3px 10px #0000002b;
      z-index: 9999 !important;
      display: none !important;
      padding: 10px !important;
      font-size: 12px !important;
    }
    .user-blacklist-popup.show {
      display: block !important;
    }
    .user-blacklist-popup table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-top: 5px !important;
    }
    .user-blacklist-popup table th,
    .user-blacklist-popup table td {
      padding: 4px !important;
      border: 1px solid #e0e0e0 !important;
      text-align: left !important;
    }
    .user-blacklist-popup table th {
      background-color: #f5f5f5 !important;
      font-weight: bold !important;
    }
    .user-blacklist-popup .no-data {
      text-align: center !important;
      color: #666 !important;
      padding: 10px !important;
    }
  `
  document.head.appendChild(styleElement)
}

/**
 * 移除样式
 */
export const removeStyles = (): void => {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
}

/**
 * 创建或获取弹窗元素
 */
export const getOrCreatePopup = (): HTMLDivElement => {
  if (!currentPopup) {
    currentPopup = document.createElement('div')
    currentPopup.className = 'user-blacklist-popup'
    document.body.appendChild(currentPopup)

    // 鼠标进入弹窗时设置标志
    currentPopup.addEventListener('mouseenter', () => {
      isPopupHovered = true
    })

    // 鼠标离开弹窗时清除标志并隐藏
    currentPopup.addEventListener('mouseleave', () => {
      isPopupHovered = false
      hidePopup()
    })
  }
  return currentPopup
}

/**
 * 显示用户信息
 */
export const showUserInfo = (
  usernameElement: HTMLAnchorElement,
  forumId: string,
  blacklistData: UserBlacklistData
): void => {
  const popup = getOrCreatePopup()

  // 查找用户数据
  const userData = blacklistData.find(item =>
    item.forumId.toLowerCase() === forumId.toLowerCase()
  )

  // 清空现有内容
  popup.innerHTML = ''

  if (userData && userData.cloudStorages.length > 0) {
    // 创建表格显示网盘信息
    const table = document.createElement('table')

    // 表头
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')
    ;['网盘厂商', '网盘ID', '帖子链接', '记录者'].forEach(text => {
      const th = document.createElement('th')
      th.textContent = text
      headerRow.appendChild(th)
    })
    thead.appendChild(headerRow)
    table.appendChild(thead)

    // 表格内容
    const tbody = document.createElement('tbody')
    userData.cloudStorages.forEach(storage => {
      const row = document.createElement('tr')

      // 网盘厂商
      const providerCell = document.createElement('td')
      providerCell.textContent = storage.provider || '-'
      row.appendChild(providerCell)

      // 网盘ID
      const idCell = document.createElement('td')
      idCell.textContent = storage.id || '-'
      row.appendChild(idCell)

      // 帖子链接
      const linkCell = document.createElement('td')
      if (storage.postLink) {
        const link = document.createElement('a')
        link.href = storage.postLink
        link.textContent = '查看帖子'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        linkCell.appendChild(link)
      } else {
        linkCell.textContent = '-'
      }
      row.appendChild(linkCell)

      // 记录者
      const recorderCell = document.createElement('td')
      recorderCell.textContent = storage.recorder || '-'
      row.appendChild(recorderCell)

      tbody.appendChild(row)
    })
    table.appendChild(tbody)

    // 备注信息 - 只有当备注有实际内容时才显示
    if (userData.note && userData.note.trim() && userData.note.trim() !== '-') {
      const noteDiv = document.createElement('div')
      noteDiv.style.marginTop = '10px'
      noteDiv.style.fontSize = '11px'
      noteDiv.style.color = '#666'
      noteDiv.textContent = `备注: ${userData.note.trim()}`
      popup.appendChild(noteDiv)
    }

    popup.appendChild(table)
  } else {
    // 没有数据
    const noDataDiv = document.createElement('div')
    noDataDiv.className = 'no-data'
    noDataDiv.textContent = '没有网盘记录'
    popup.appendChild(noDataDiv)
  }

  // 计算弹窗位置（复用头像查询的定位逻辑）
  const rect = usernameElement.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  const viewportWidth = document.documentElement.clientWidth
  const viewportHeight = document.documentElement.clientHeight
  const gap = 10

  // 默认显示在用户名右侧
  let left = rect.right + gap
  let top = rect.top

  // 如果右侧空间不足，显示在左侧
  if (left + popupRect.width > viewportWidth - 10) {
    left = rect.left - popupRect.width - gap
  }

  // 如果左侧空间也不足，显示在下方
  if (left < 10) {
    left = 10
    top = rect.bottom + gap
  }

  // 确保弹窗在视口范围内
  if (top + popupRect.height > viewportHeight - 10) {
    top = viewportHeight - popupRect.height - 10
  }

  if (top < 10) {
    top = 10
  }

  popup.style.left = `${left}px`
  popup.style.top = `${top}px`
  popup.classList.add('show')
}

/**
 * 隐藏弹窗
 */
export const hidePopup = (): void => {
  if (currentPopup) {
    currentPopup.classList.remove('show')
  }
}

/**
 * 获取弹窗悬停状态
 */
export const getIsPopupHovered = (): boolean => isPopupHovered

/**
 * 清理已注入的内容
 */
export const cleanupInjectedContent = (): void => {
  // 移除弹窗元素
  if (currentPopup) {
    currentPopup.remove()
    currentPopup = null
  }
  isPopupHovered = false
}