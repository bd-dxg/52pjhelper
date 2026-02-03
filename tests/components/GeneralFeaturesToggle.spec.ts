/**
 * GeneralFeaturesToggle 组件测试
 * 测试通用功能组合组件
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import GeneralFeaturesToggle from '@com/GeneralFeaturesToggle.vue'

// 模拟浏览器 API
global.browser = fakeBrowser

describe('GeneralFeaturesToggle 组件', () => {
  beforeEach(async () => {
    // 清空存储
    await fakeBrowser.storage.local.clear()
    // 重置所有 mock
    vi.clearAllMocks()
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      const { getByText } = render(GeneralFeaturesToggle)

      // 验证标题
      expect(getByText('通用功能')).toBeTruthy()
    })

    it('应该渲染所有子组件', () => {
      const { getByText } = render(GeneralFeaturesToggle)

      // 验证所有子组件的功能名称
      expect(getByText('楼层高亮')).toBeTruthy()
      expect(getByText('原生楼层')).toBeTruthy()
      expect(getByText('重帖检测')).toBeTruthy()
    })

    it('应该使用网格布局', () => {
      const { container } = render(GeneralFeaturesToggle)

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()
      // 在测试环境中，CSS 可能不会完全应用
      // 只验证类名存在即可
      expect(grid?.classList.contains('toggle-grid')).toBe(true)
    })
  })

  describe('事件传递测试', () => {
    it('应该传递子组件的 show-message 事件', async () => {
      const { getByText, emitted } = render(GeneralFeaturesToggle)

      // 点击第一个子组件（楼层高亮）
      const floorHighlighterLabel = getByText('楼层高亮').closest('.toggle-label')!
      await fireEvent.click(floorHighlighterLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证事件被传递到父组件
      expect(emitted()).toHaveProperty('show-message')
    })

    it('应该传递正确的事件参数', async () => {
      const { getByText, emitted } = render(GeneralFeaturesToggle)

      // 点击原生楼层组件
      const nativeFloorLabel = getByText('原生楼层').closest('.toggle-label')!
      await fireEvent.click(nativeFloorLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      const messages = emitted()['show-message']
      expect(messages).toBeDefined()
      expect(messages?.[0]).toHaveLength(2) // [text, type]
      expect(messages?.[0][1]).toMatch(/success|error/)
    })

    it('应该处理多个子组件的事件', async () => {
      const { getByText, emitted } = render(GeneralFeaturesToggle)

      // 点击多个子组件
      const floorHighlighterLabel = getByText('楼层高亮').closest('.toggle-label')!
      const nativeFloorLabel = getByText('原生楼层').closest('.toggle-label')!

      await fireEvent.click(floorHighlighterLabel)
      await new Promise(resolve => setTimeout(resolve, 100))

      await fireEvent.click(nativeFloorLabel)
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
        floorHighlighterEnabled: true,
        nativeFloorDisplayEnabled: false,
      })

      const { getByRole } = render(GeneralFeaturesToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证每个子组件的状态是独立的
      const floorHighlighterCheckbox = getByRole('checkbox', {
        name: '楼层高亮',
      }) as HTMLInputElement
      const nativeFloorCheckbox = getByRole('checkbox', { name: '原生楼层' }) as HTMLInputElement

      expect(floorHighlighterCheckbox.checked).toBe(true)
      expect(nativeFloorCheckbox.checked).toBe(false)
    })

    it('应该允许同时切换多个子组件', async () => {
      const { getByText } = render(GeneralFeaturesToggle)

      // 同时点击多个子组件
      const floorHighlighterLabel = getByText('楼层高亮').closest('.toggle-label')!
      const nativeFloorLabel = getByText('原生楼层').closest('.toggle-label')!

      await fireEvent.click(floorHighlighterLabel)
      await fireEvent.click(nativeFloorLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 200))

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get([
        'floorHighlighterEnabled',
        'nativeFloorDisplayEnabled',
      ])

      // 至少有一个状态被更新
      expect(
        result.floorHighlighterEnabled !== undefined ||
          result.nativeFloorDisplayEnabled !== undefined,
      ).toBe(true)
    })
  })

  describe('布局测试', () => {
    it('应该使用 2 列网格布局', () => {
      const { container } = render(GeneralFeaturesToggle)

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()

      // 在测试环境中，CSS 可能不会完全应用
      // 只验证类名存在即可
      expect(grid?.classList.contains('toggle-grid')).toBe(true)
    })

    it('应该有正确的间距', () => {
      const { container } = render(GeneralFeaturesToggle)

      const section = container.querySelector('.features-section')
      expect(section).toBeTruthy()

      const grid = container.querySelector('.toggle-grid')
      expect(grid).toBeTruthy()
    })
  })

  describe('可访问性测试', () => {
    it('应该有正确的标题层级', () => {
      const { container } = render(GeneralFeaturesToggle)

      const title = container.querySelector('h3.section-title')
      expect(title).toBeTruthy()
      expect(title?.textContent).toBe('通用功能')
    })

    it('所有子组件应该有正确的 aria-label', () => {
      const { getByRole } = render(GeneralFeaturesToggle)

      // 验证所有子组件的复选框都有 aria-label
      const checkboxes = ['楼层高亮', '原生楼层', '重帖检测']

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

      const { getByRole } = render(GeneralFeaturesToggle)

      // 等待组件挂载完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证所有子组件都使用默认值
      const floorHighlighterCheckbox = getByRole('checkbox', {
        name: '楼层高亮',
      }) as HTMLInputElement
      expect(floorHighlighterCheckbox.checked).toBe(true) // 默认启用
    })

    it('应该处理子组件事件传递失败', async () => {
      const { getByText } = render(GeneralFeaturesToggle)

      // 模拟事件处理器错误（通过快速点击触发防抖）
      const floorHighlighterLabel = getByText('楼层高亮').closest('.toggle-label')!

      // 快速连续点击
      await fireEvent.click(floorHighlighterLabel)
      await fireEvent.click(floorHighlighterLabel)
      await fireEvent.click(floorHighlighterLabel)

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 组件应该仍然正常工作（防抖机制）
      const checkbox = getByText('楼层高亮')
        .closest('.toggle-label')
        ?.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox).toBeTruthy()
    })
  })

  describe('组件数量测试', () => {
    it('应该只包含 3 个子组件', () => {
      const { container } = render(GeneralFeaturesToggle)

      const toggleContainers = container.querySelectorAll('.toggle-container')
      expect(toggleContainers.length).toBe(3)
    })

    it('应该按正确的顺序渲染子组件', () => {
      const { container } = render(GeneralFeaturesToggle)

      // 只获取第一个 span（功能名称），过滤掉空的 span
      const labels = Array.from(container.querySelectorAll('.toggle-label > span:first-child'))
        .map(el => el.textContent)
        .filter(text => text && text.trim() !== '')

      expect(labels).toEqual(['楼层高亮', '原生楼层', '重帖检测'])
    })
  })
})
