/**
 * 全选功能工具类
 * 功能：
 * 1. 在管理页面添加全选按钮,
 * 2. 将下方的分页组件复制到上方,提高工作效率
 */

import selectAllConfig from './config.json'
import { createFeatureManager, type IFeatureManager } from '@utils/featureManager'

/**
 * 全选功能管理器接口
 */
export interface ISelectAll extends IFeatureManager {}

/**
 * 创建全选功能管理器实例
 */
export function createSelectAll(): ISelectAll {
  let selectAllBtn: HTMLButtonElement | null = null
  let deleteBtn: HTMLButtonElement | null = null
  let pgRightDiv: HTMLElement | null = null
  let targetEl: HTMLElement | null = null
  let leftDiv: HTMLElement | null = null

  /**
   * 处理全选按钮点击
   */
  const handleSelectAll = (): void => {
    const inputs = document.querySelectorAll('input[name="delete[]"]')
    inputs.forEach((item, index) => {
      if (index !== 0 && item instanceof HTMLInputElement) {
        item.checked = true
      }
    })
  }

  /**
   * 处理删除按钮点击
   */
  const handleDelete = (): void => {
    const originalDeleteBtn = document.querySelector('#deletesubmit') as HTMLButtonElement
    originalDeleteBtn?.click()
  }

  /**
   * 初始化按钮（实现 flex 布局 + 分页复制）
   */
  const initButtons = (): void => {
    const target = document.querySelector('.mtm.mbm') as HTMLElement
    if (!target) return
    targetEl = target

    const originalPg = document.querySelector('.bw0_all td .pg') as HTMLElement | null

    // 设置 h2 为 flex 布局（匹配你提供的 DOM）
    target.style.display = 'flex'
    target.style.justifyContent = 'space-between'
    target.style.alignItems = 'center'

    // 创建左侧 div，包裹原有文字 + 按钮
    leftDiv = document.createElement('div')
    Array.from(target.childNodes).forEach(child => leftDiv!.appendChild(child))
    target.innerHTML = ''
    target.appendChild(leftDiv)

    // 创建换行符
    leftDiv.appendChild(document.createElement('br'))

    // 创建"除第一条全选"按钮
    selectAllBtn = document.createElement('button')
    selectAllBtn.type = 'button'
    selectAllBtn.textContent = '除第一条 全选'
    selectAllBtn.style.margin = '0 10px'
    selectAllBtn.dataset.featureId = 'select-all-btn'
    selectAllBtn.addEventListener('click', handleSelectAll)
    leftDiv.appendChild(selectAllBtn)

    // 创建"删除"按钮
    const originalDeleteBtn = document.querySelector('#deletesubmit')
    if (originalDeleteBtn) {
      deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.textContent = '删除'
      deleteBtn.style.margin = '0 10px'
      deleteBtn.dataset.featureId = 'select-all-delete-btn'
      deleteBtn.addEventListener('click', handleDelete)
      leftDiv.appendChild(deleteBtn)
    }

    // 复制分页组件到右侧 div
    if (originalPg) {
      const pgClone = originalPg.cloneNode(true) as HTMLElement
      const rightDiv = document.createElement('div')
      rightDiv.className = 'pg'
      rightDiv.appendChild(pgClone)
      target.appendChild(rightDiv)
      pgRightDiv = rightDiv
    }
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    if (selectAllBtn) {
      selectAllBtn.removeEventListener('click', handleSelectAll)
      selectAllBtn = null
    }
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', handleDelete)
      deleteBtn = null
    }
    if (pgRightDiv) {
      pgRightDiv.remove()
      pgRightDiv = null
    }

    // 将 leftDiv 的原始子节点还原到 target，再移除 leftDiv
    if (targetEl && leftDiv) {
      // 移除注入的按钮和 br（通过 data 属性 + nodeName 识别）
      Array.from(leftDiv.childNodes).forEach(node => {
        if (
          (node instanceof HTMLElement && node.dataset.featureId?.startsWith('select-all-')) ||
          node.nodeName === 'BR'
        ) {
          node.remove()
        }
      })
      // 将剩余原始内容移回 target
      Array.from(leftDiv.childNodes).forEach(child => targetEl!.appendChild(child))
      leftDiv.remove()
      leftDiv = null

      // 还原 flex 样式
      targetEl.style.display = ''
      targetEl.style.justifyContent = ''
      targetEl.style.alignItems = ''
      targetEl = null
    }

    // 兜底：通过 data 属性清理残留按钮
    document.querySelectorAll('[data-feature-id^="select-all-"]').forEach(btn => btn.remove())
  }

  // 使用 featureManager 创建基础功能管理器
  return createFeatureManager({
    config: {
      storageKey: selectAllConfig.storageKey,
      defaultEnabled: selectAllConfig.defaultEnabled,
      targetPages: selectAllConfig.targetPages,
    },
    onEnable: () => {
      initButtons()
    },
    onDisable: () => {
      cleanupInjectedContent()
    },
  })
}
