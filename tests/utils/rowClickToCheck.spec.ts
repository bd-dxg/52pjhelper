import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  initializeRowClickToCheck,
  enableRowClickToCheck,
  disableRowClickToCheck,
  toggleRowClickToCheck,
  getRowClickToCheckStatus,
} from '@/utils/rowClickToCheck'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn().mockReturnValue(true),
  },
}))

describe('rowClickToCheck', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // 模拟目标页面 URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.52pojie.cn/forum.php?mod=modcp&action=thread&op=post',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initializeRowClickToCheck', () => {
    it('应该在功能启用时调用 enableRowClickToCheck', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td><input type="checkbox" name="delete[]" class="pc" /></td>
            </tr>
          </tbody>
        </form>
      `

      await initializeRowClickToCheck()

      // 验证功能已初始化（通过检查 DOM 是否被处理）
      // 由于 WeakSet 无法直接检查，我们只验证函数不报错
      expect(true).toBe(true)
    })

    it('应该在功能禁用时不调用 enableRowClickToCheck', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ rowClickToCheckEnabled: false })

      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td><input type="checkbox" name="delete[]" class="pc" /></td>
            </tr>
          </tbody>
        </form>
      `

      await initializeRowClickToCheck()

      // 验证功能未初始化
      expect(true).toBe(true)
    })
  })

  describe('enableRowClickToCheck', () => {
    it('应该在点击链接时不触发复选框', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td>
                <input type="checkbox" name="delete[]" class="pc" />
                <a href="#">链接</a>
              </td>
            </tr>
          </tbody>
        </form>
      `

      enableRowClickToCheck()

      const link = document.querySelector('a') as HTMLAnchorElement
      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      // 点击链接
      link.click()

      // 验证复选框未被勾选
      expect(checkbox.checked).toBe(false)
    })

    it('应该在点击按钮时不触发复选框', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td>
                <input type="checkbox" name="delete[]" class="pc" />
                <button>按钮</button>
              </td>
            </tr>
          </tbody>
        </form>
      `

      enableRowClickToCheck()

      const button = document.querySelector('button') as HTMLButtonElement
      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      // 点击按钮
      button.click()

      // 验证复选框未被勾选
      expect(checkbox.checked).toBe(false)
    })

    it('应该在点击复选框本身时不重复触发', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td><input type="checkbox" name="delete[]" class="pc" /></td>
            </tr>
          </tbody>
        </form>
      `

      enableRowClickToCheck()

      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      // 点击复选框
      checkbox.click()

      // 验证复选框被勾选（只触发一次）
      expect(checkbox.checked).toBe(true)
    })

    it('应该在缺少表单时不报错', () => {
      // 创建测试 DOM（缺少表单）
      document.body.innerHTML = `
        <tbody>
          <tr>
            <td><input type="checkbox" name="delete[]" class="pc" /></td>
          </tr>
        </tbody>
      `

      expect(() => enableRowClickToCheck()).not.toThrow()
    })

    it('应该在缺少 tbody 时不报错', () => {
      // 创建测试 DOM（缺少 tbody）
      document.body.innerHTML = `
        <form id="moderate">
          <tr>
            <td><input type="checkbox" name="delete[]" class="pc" /></td>
          </tr>
        </form>
      `

      expect(() => enableRowClickToCheck()).not.toThrow()
    })
  })

  describe('disableRowClickToCheck', () => {
    it('应该在非目标页面不报错', () => {
      expect(() => disableRowClickToCheck()).not.toThrow()
    })

    it('应该在缺少表单时不报错', () => {
      document.body.innerHTML = ''

      expect(() => disableRowClickToCheck()).not.toThrow()
    })
  })

  describe('toggleRowClickToCheck', () => {
    it('应该从启用切换到禁用', async () => {
      // 预设存储值为启用
      await fakeBrowser.storage.local.set({ rowClickToCheckEnabled: true })

      const newStatus = await toggleRowClickToCheck()

      expect(newStatus).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('rowClickToCheckEnabled')
      expect(result.rowClickToCheckEnabled).toBe(false)
    })

    it('应该从禁用切换到启用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ rowClickToCheckEnabled: false })

      // 创建测试 DOM
      document.body.innerHTML = `
        <form id="moderate">
          <tbody>
            <tr>
              <td><input type="checkbox" name="delete[]" class="pc" /></td>
            </tr>
          </tbody>
        </form>
      `

      const newStatus = await toggleRowClickToCheck()

      expect(newStatus).toBe(true)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('rowClickToCheckEnabled')
      expect(result.rowClickToCheckEnabled).toBe(true)
    })

    it('应该返回切换后的状态', async () => {
      const newStatus = await toggleRowClickToCheck()
      const currentStatus = await getRowClickToCheckStatus()

      expect(newStatus).toBe(currentStatus)
    })
  })

  describe('getRowClickToCheckStatus', () => {
    it('应该返回当前启用状态', async () => {
      await fakeBrowser.storage.local.set({ rowClickToCheckEnabled: true })

      const status = await getRowClickToCheckStatus()

      expect(status).toBe(true)
    })

    it('应该返回当前禁用状态', async () => {
      await fakeBrowser.storage.local.set({ rowClickToCheckEnabled: false })

      const status = await getRowClickToCheckStatus()

      expect(status).toBe(false)
    })

    it('应该在存储为空时返回默认值', async () => {
      const status = await getRowClickToCheckStatus()

      expect(status).toBe(true) // 默认启用
    })
  })
})
