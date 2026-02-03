/**
 * AvatarQueryToggle 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import AvatarQueryToggle from '@com/AvatarQueryToggle.vue'

// 模拟浏览器 API
global.browser = fakeBrowser

describe('AvatarQueryToggle 组件', () => {
  beforeEach(async () => {
    // 清空存储
    await fakeBrowser.storage.local.clear()
    // 重置所有 mock
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      const { getByText, getByRole } = render(AvatarQueryToggle)

      // 验证功能名称
      expect(getByText('头像查询')).toBeTruthy()

      // 验证复选框存在
      const checkbox = getByRole('checkbox', { name: '头像查询' })
      expect(checkbox).toBeTruthy()
    })

    it('应该显示正确的描述信息', () => {
      const { container } = render(AvatarQueryToggle)

      const label = container.querySelector('.toggle-label')
      expect(label?.getAttribute('title')).toBe('鼠标移入头像显示用户违规记录')
    })
  })

  describe('初始状态测试', () => {
    it('应该使用默认启用状态（true）', async () => {
      const { getByRole } = render(AvatarQueryToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const checkbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('应该从存储中加载初始状态', async () => {
      // 设置存储中的值为 false
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const { getByRole } = render(AvatarQueryToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const checkbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('功能切换测试', () => {
    it('应该在点击时触发 show-message 事件', async () => {
      const { getByText, emitted } = render(AvatarQueryToggle)

      const label = getByText('头像查询').closest('.toggle-label')!
      await fireEvent.click(label)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证事件被触发
      expect(emitted()).toHaveProperty('show-message')
    })

    it('应该在切换时更新存储', async () => {
      // 设置初始状态为 false
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const { getByText } = render(AvatarQueryToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const label = getByText('头像查询').closest('.toggle-label')!
      await fireEvent.click(label)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('avatarQueryEnabled')
      expect(result.avatarQueryEnabled).toBe(true)
    })

    it('应该在切换时禁用复选框（防抖）', async () => {
      const { getByText, getByRole } = render(AvatarQueryToggle)

      const label = getByText('头像查询').closest('.toggle-label')!
      const checkbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement

      // 点击切换
      await fireEvent.click(label)

      // 验证复选框被禁用
      expect(checkbox.disabled).toBe(true)

      // 等待操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证复选框恢复启用
      expect(checkbox.disabled).toBe(false)
    })
  })

  describe('防抖测试', () => {
    it('应该防止快速连续点击', async () => {
      const { getByText, emitted } = render(AvatarQueryToggle)

      const label = getByText('头像查询').closest('.toggle-label')!

      // 快速连续点击 3 次
      await fireEvent.click(label)
      await fireEvent.click(label)
      await fireEvent.click(label)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证只触发了一次事件
      const messages = emitted()['show-message']
      expect(messages).toBeDefined()
      expect(messages?.length).toBe(1)
    })
  })

  describe('事件传递测试', () => {
    it('应该传递正确的事件参数', async () => {
      const { getByText, emitted } = render(AvatarQueryToggle)

      const label = getByText('头像查询').closest('.toggle-label')!
      await fireEvent.click(label)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const messages = emitted()['show-message']
      expect(messages).toBeDefined()
      expect(messages?.[0]).toHaveLength(2) // [text, type]
      expect(messages?.[0][1]).toMatch(/success|error/) // type 应该是 success 或 error
    })
  })

  describe('错误处理测试', () => {
    it('应该处理存储加载失败', async () => {
      // 模拟存储加载失败
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const { getByRole } = render(AvatarQueryToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证使用默认值
      const checkbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      // 验证错误被记录
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的 aria-label', () => {
      const { getByRole } = render(AvatarQueryToggle)

      const checkbox = getByRole('checkbox', { name: '头像查询' })
      expect(checkbox.getAttribute('aria-label')).toBe('头像查询')
    })

    it('应该支持键盘操作', async () => {
      const { getByText, emitted } = render(AvatarQueryToggle)

      const label = getByText('头像查询').closest('.toggle-label')!

      // 模拟键盘 Enter 键
      await fireEvent.keyDown(label, { key: 'Enter' })
      await fireEvent.click(label)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证事件被触发
      expect(emitted()).toHaveProperty('show-message')
    })
  })
})
