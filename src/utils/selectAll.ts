/**
 * 全选功能工具类
 * 功能：在管理页面添加全选按钮
 */

import selectAllConfig from '@/configs/selectAll.json'
import { createFeatureManager, type IFeatureManager } from './featureManager'

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
   * 初始化按钮
   */
  const initButtons = (): void => {
    const target = document.querySelector('.mtm.mbm')
    if (!target) return

    // 创建"除第一条全选"按钮 - 使用原始油猴脚本的样式
    selectAllBtn = document.createElement('button')
    selectAllBtn.type = 'button'
    selectAllBtn.textContent = '除第一条 全选'
    selectAllBtn.style.margin = '0 10px'
    selectAllBtn.dataset.featureId = 'select-all-btn'
    selectAllBtn.addEventListener('click', handleSelectAll)
    target.appendChild(selectAllBtn)

    // 创建"删除"按钮 - 使用原始油猴脚本的样式
    const originalDeleteBtn = document.querySelector('#deletesubmit')
    if (originalDeleteBtn) {
      deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.textContent = '删除'
      deleteBtn.style.margin = '0 10px'
      deleteBtn.dataset.featureId = 'select-all-delete-btn'
      deleteBtn.addEventListener('click', handleDelete)
      target.appendChild(deleteBtn)
    }
  }

  /**
   * 清理已注入的内容
   */
  const cleanupInjectedContent = (): void => {
    // 方法1：通过引用移除按钮
    if (selectAllBtn) {
      selectAllBtn.removeEventListener('click', handleSelectAll)
      selectAllBtn.remove()
      selectAllBtn = null
    }
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', handleDelete)
      deleteBtn.remove()
      deleteBtn = null
    }

    // 方法2：通过 data 属性查找并移除所有可能残留的按钮（性能优化）
    document.querySelectorAll('[data-feature-id^="select-all-"]')
      .forEach(btn => btn.remove())
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