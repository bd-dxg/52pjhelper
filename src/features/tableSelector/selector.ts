/**
 * 分表选择器 - 按钮初始化和交互
 */

let container: HTMLDivElement | null = null
let allButtons: HTMLButtonElement[] = []
let hiddenTableIndexes: number[] = []

/**
 * 设置隐藏分表索引
 */
export const setHiddenTableIndexesValue = (indexes: number[]): void => {
  hiddenTableIndexes = indexes
}

/**
 * 获取隐藏分表索引
 */
export const getHiddenTableIndexesValue = (): number[] => [...hiddenTableIndexes]

/**
 * 处理按钮点击事件
 */
const handleButtonClick = (event: Event): void => {
  if (!(event.target instanceof HTMLButtonElement)) return

  allButtons.forEach(btn => btn.classList.remove('table-btn-active'))

  event.target.classList.add('table-btn-active')

  const tableName = event.target.textContent?.split('post_')[1]
  const select = document.querySelector('#posttableid') as HTMLSelectElement
  const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement

  if (select && searchSubmit && tableName) {
    const option = select.querySelector('option')
    if (option) {
      option.value = tableName
    }
    searchSubmit.click()
  }
}

/**
 * 等待元素加载
 */
const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise(resolve => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, timeout)
  })
}

/**
 * 查找包含 posttableid 的 span.ftid 容器
 */
const findPostTableContainer = (): Element | null => {
  const ftidSpans = Array.from(document.querySelectorAll('span.ftid'))

  for (const span of ftidSpans) {
    if (span.querySelector('#posttableid')) {
      return span
    }
  }

  return null
}

/**
 * 初始化分表选择器
 */
export const initTableSelector = async (): Promise<void> => {
  await waitForElement('#posttableid')

  const spanContainer = findPostTableContainer()
  if (!spanContainer) return

  const select = spanContainer.querySelector('#posttableid') as HTMLSelectElement
  const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
  const menuItems = Array.from(document.querySelectorAll('#posttableid_ctrl_menu ul li'))

  if (!select || !searchSubmit || menuItems.length === 0) return

  const visibleMenuItems = menuItems.filter((_, index) => !hiddenTableIndexes.includes(index))

  container = document.createElement('div')
  container.className = 'table-btn-container'
  container.dataset.featureId = 'table-selector-container'

  const leftBox = document.createElement('div')
  leftBox.className = 'table-btn-left'

  const rightBox = document.createElement('div')
  rightBox.className = 'table-btn-right'

  allButtons = []
  visibleMenuItems.forEach((item, visibleIndex) => {
    const originalIndex = menuItems.indexOf(item)
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = item.textContent
    button.dataset.index = originalIndex.toString()
    allButtons.push(button)

    if (visibleIndex === 0 || visibleIndex === visibleMenuItems.length - 1) {
      leftBox.appendChild(button)
    } else {
      rightBox.appendChild(button)
    }
  })

  const currentSelectedValue = select.value
  const visibleHighlightIndex = visibleMenuItems.findIndex(item => {
    const tableName = item.textContent?.split('post_')[1]
    return tableName === currentSelectedValue
  })
  if (visibleHighlightIndex !== -1) {
    allButtons[visibleHighlightIndex].classList.add('table-btn-active')
  }

  container.addEventListener('click', handleButtonClick)

  container.appendChild(leftBox)
  container.appendChild(rightBox)

  spanContainer.appendChild(container)
}

/**
 * 移除事件监听器
 */
export const removeEventListeners = (): void => {
  if (container) {
    container.removeEventListener('click', handleButtonClick)
    container = null
  }
  allButtons = []
}

/**
 * 清理已注入的内容
 */
export const cleanupInjectedContent = (): void => {
  if (container) {
    container.remove()
    container = null
  }

  document.querySelectorAll('[data-feature-id="table-selector-container"]').forEach(el => el.remove())

  allButtons = []

  const postTableCtrl = document.querySelector('#posttableid_ctrl') as HTMLElement
  if (postTableCtrl) {
    postTableCtrl.style.display = ''
  }
}
