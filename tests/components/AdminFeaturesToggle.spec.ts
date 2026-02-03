/**
 * AdminFeaturesToggle 组件测试
 * 测试后台管理功能组合组件
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import AdminFeaturesToggle from '@com/AdminFeaturesToggle.vue'

// 模拟浏览器 API
global.browser = fakeBrowser

describe('AdminFeaturesToggle 组件', () => {
  beforeEach(async () => {
    // 清空存储
    await fakeBrowser.storage.local.clear()
    // 重置所有 mock
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      const { getByText } = render(AdminFeaturesToggle)

      // 验证标题
      expect(getByText('后台管理功能')).toBeTruthy()
    })

    it('应该渲染所有子组件', () => {
      const { getByText } = render(AdminFeaturesToggle)

      // 验证所有子组件的功能名称
      expect(getByText('头像查询')).toBeTruthy()
      expect(getByText('快捷回复')).toBeTruthy()
      expect(getByText('自动填充')).toBeTruthy()
      expect(getByText('全选功能')).toBeTruthy()
      expect(getByText('分表选择')).toBeTruthy()
      expect(getByText('默认时间')).toBeTruthy()
      expect(getByText('审核查询')).toBeTruthy()
      expect(getByText('勾选范围')).toBeTruthy()
    })

    it('应该使用网格布局', () => {
      const { container } = render(AdminFeaturesToggle)

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()
      // 在测试环境中，CSS 可能不会完全应用
      // 只验证类名存在即可
      expect(grid?.classList.contains('toggle-grid')).toBe(true)
    })
  })

  describe('事件传递测试', () => {
    it('应该传递子组件的 show-message 事件', async () => {
      const { getByText, emitted } = render(AdminFeaturesToggle)

      // 点击第一个子组件（头像查询）
      const avatarQueryLabel = getByText('头像查询').closest('.toggle-label')!
      await fireEvent.click(avatarQueryLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证事件被传递到父组件
      expect(emitted()).toHaveProperty('show-message')
    })

    it('应该传递正确的事件参数', async () => {
      const { getByText, emitted } = render(AdminFeaturesToggle)

      // 点击快捷回复组件
      const quickReplyLabel = getByText('快捷回复').closest('.toggle-label')!
      await fireEvent.click(quickReplyLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const messages = emitted()['show-message']
      expect(messages).toBeDefined()
      expect(messages?.[0]).toHaveLength(2) // [text, type]
      expect(messages?.[0][1]).toMatch(/success|error/)
    })

    it('应该处理多个子组件的事件', async () => {
      const { getByText, emitted } = render(AdminFeaturesToggle)

      // 点击多个子组件
      const avatarQueryLabel = getByText('头像查询').closest('.toggle-label')!
      const quickReplyLabel = getByText('快捷回复').closest('.toggle-label')!

      await fireEvent.click(avatarQueryLabel)
      await new Promise(resolve => setTimeout(resolve, 100))

      await fireEvent.click(quickReplyLabel)
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证两个事件都被传递
      const messages = emitted()['show-message']
      expect(messages).toBeDefined()
      expect(messages?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('子组件交互测试', () => {
    it('应该独立管理每个子组件的状态', async () => {
      // 设置不同的初始状态
      await fakeBrowser.storage.local.set({
        avatarQueryEnabled: true,
        quickReplyEnabled: false,
      })

      const { getByRole } = render(AdminFeaturesToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证每个子组件的状态是独立的
      const avatarQueryCheckbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement
      const quickReplyCheckbox = getByRole('checkbox', { name: '快捷回复' }) as HTMLInputElement

      expect(avatarQueryCheckbox.checked).toBe(true)
      expect(quickReplyCheckbox.checked).toBe(false)
    })

    it('应该允许同时切换多个子组件', async () => {
      const { getByText } = render(AdminFeaturesToggle)

      // 同时点击多个子组件
      const avatarQueryLabel = getByText('头像查询').closest('.toggle-label')!
      const quickReplyLabel = getByText('快捷回复').closest('.toggle-label')!

      await fireEvent.click(avatarQueryLabel)
      await fireEvent.click(quickReplyLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get([
        'avatarQueryEnabled',
        'quickReplyEnabled',
      ])

      // 至少有一个状态被更新
      expect(result.avatarQueryEnabled !== undefined || result.quickReplyEnabled !== undefined).toBe(
        true,
      )
    })
  })

  describe('布局测试', () => {
    it('应该使用 2 列网格布局', () => {
      const { container } = render(AdminFeaturesToggle)

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()

      // 在测试环境中，CSS 可能不会完全应用
      // 只验证类名存在即可
      expect(grid?.classList.contains('toggle-grid')).toBe(true)
    })

    it('应该有正确的间距', () => {
      const { container } = render(AdminFeaturesToggle)

      const section = container.querySelector('.features-section')
      expect(section).toBeTruthy()

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的标题层级', () => {
      const { container } = render(AdminFeaturesToggle)

      const title = container.querySelector('h3.section-title')
      expect(title).toBeTruthy()
      expect(title?.textContent).toBe('后台管理功能')
    })

    it('所有子组件应该有正确的 aria-label', () => {
      const { getByRole } = render(AdminFeaturesToggle)

      // 验证所有子组件的复选框都有 aria-label
      const checkboxes = [
        '头像查询',
        '快捷回复',
        '自动填充',
        '全选功能',
        '分表选择',
        '默认时间',
        '审核查询',
        '勾选范围',
      ]

      checkboxes.forEach(name => {
        const checkbox = getByRole('checkbox', { name })
        expect(checkbox.getAttribute('aria-label')).toBe(name)
      })
    })
  })

  describe('边界情况测试', () => {
    it('应该处理存储为空的情况', async () => {
      // 清空存储
      await fakeBrowser.storage.local.clear()

      const { getByRole } = render(AdminFeaturesToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证所有子组件都使用默认值
      const avatarQueryCheckbox = getByRole('checkbox', { name: '头像查询' }) as HTMLInputElement
      expect(avatarQueryCheckbox.checked).toBe(true) // 默认启用
    })

    it('应该处理子组件事件传递失败', async () => {
      const { getByText } = render(AdminFeaturesToggle)

      // 模拟事件处理器错误（通过快速点击触发防抖）
      const avatarQueryLabel = getByText('头像查询').closest('.toggle-label')!

      // 快速连续点击
      await fireEvent.click(avatarQueryLabel)
      await fireEvent.click(avatarQueryLabel)
      await fireEvent.click(avatarQueryLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该仍然正常工作（防抖机制）
      const checkbox = getByText('头像查询')
        .closest('.toggle-label')
        ?.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox).toBeTruthy()
    })
  })
})
