/**
 * 功能开关组件测试工厂
 * 为所有使用 useFeatureToggle 的组件提供统一的测试模板
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import type { Component } from 'vue'

// 模拟浏览器 API
global.browser = fakeBrowser

/**
 * 功能开关组件配置接口
 */
export interface FeatureToggleTestConfig {
  /** 组件名称 */
  componentName: string
  /** 功能名称（显示在 UI 上） */
  featureName: string
  /** 功能描述 */
  description: string
  /** 存储键 */
  storageKey: string
  /** 默认启用状态 */
  defaultEnabled: boolean
}

/**
 * 创建功能开关组件测试套件
 * @param component Vue 组件
 * @param config 测试配置
 */
export function createFeatureToggleTests(component: Component, config: FeatureToggleTestConfig) {
  describe(`${config.componentName} 组件`, () => {
    beforeEach(async () => {
      // 清空存储
      await fakeBrowser.storage.local.clear()
      // 重置所有 mock
      vi.clearAllMocks()
    })

    describe('渲染测试', () => {
      it('应该正确渲染组件', () => {
        const { getByText, getByRole } = render(component)

        // 验证功能名称
        expect(getByText(config.featureName)).toBeTruthy()

        // 验证复选框存在
        const checkbox = getByRole('checkbox', { name: config.featureName })
        expect(checkbox).toBeTruthy()
      })

      it('应该显示正确的描述信息', () => {
        const { container } = render(component)

        const label = container.querySelector('.toggle-label')
        expect(label?.getAttribute('title')).toBe(config.description)
      })
    })

    describe('初始状态测试', () => {
      it(`应该使用默认启用状态（${config.defaultEnabled}）`, async () => {
        const { getByRole } = render(component)

        // 等待组件挂载完成
        await new Promise(resolve => setTimeout(resolve, 100))

        const checkbox = getByRole('checkbox', { name: config.featureName }) as HTMLInputElement
        expect(checkbox.checked).toBe(config.defaultEnabled)
      })

      it('应该从存储中加载初始状态', async () => {
        // 设置存储中的值为与默认值相反
        const testValue = !config.defaultEnabled
        await fakeBrowser.storage.local.set({ [config.storageKey]: testValue })

        const { getByRole } = render(component)

        // 等待组件挂载完成
        await new Promise(resolve => setTimeout(resolve, 100))

        const checkbox = getByRole('checkbox', { name: config.featureName }) as HTMLInputElement
        expect(checkbox.checked).toBe(testValue)
      })
    })

    describe('功能切换测试', () => {
      it('应该在点击时触发 show-message 事件', async () => {
        const { getByText, emitted } = render(component)

        const label = getByText(config.featureName).closest('.toggle-label')!
        await fireEvent.click(label)

        // 等待异步操作完成
        await new Promise(resolve => setTimeout(resolve, 100))

        // 验证事件被触发
        expect(emitted()).toHaveProperty('show-message')
      })

      it('应该在切换时更新存储', async () => {
        // 设置初始状态
        const initialValue = config.defaultEnabled
        await fakeBrowser.storage.local.set({ [config.storageKey]: initialValue })

        const { getByText } = render(component)

        // 等待组件挂载完成
        await new Promise(resolve => setTimeout(resolve, 100))

        const label = getByText(config.featureName).closest('.toggle-label')!
        await fireEvent.click(label)

        // 等待异步操作完成
        await new Promise(resolve => setTimeout(resolve, 100))

        // 验证存储已更新
        const result = await fakeBrowser.storage.local.get(config.storageKey)
        expect(result[config.storageKey]).toBe(!initialValue)
      })

      it('应该在切换时禁用复选框（防抖）', async () => {
        const { getByText, getByRole } = render(component)

        const label = getByText(config.featureName).closest('.toggle-label')!
        const checkbox = getByRole('checkbox', { name: config.featureName }) as HTMLInputElement

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
        const { getByText, emitted } = render(component)

        const label = getByText(config.featureName).closest('.toggle-label')!

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
        const { getByText, emitted } = render(component)

        const label = getByText(config.featureName).closest('.toggle-label')!
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

        const { getByRole } = render(component)

        // 等待组件挂载完成
        await new Promise(resolve => setTimeout(resolve, 100))

        // 验证使用默认值
        const checkbox = getByRole('checkbox', { name: config.featureName }) as HTMLInputElement
        expect(checkbox.checked).toBe(config.defaultEnabled)

        // 验证错误被记录
        expect(consoleErrorSpy).toHaveBeenCalled()

        consoleErrorSpy.mockRestore()
      })
    })

    describe('可访问性测试', () => {
      it('应该有正确的 aria-label', () => {
        const { getByRole } = render(component)

        const checkbox = getByRole('checkbox', { name: config.featureName })
        expect(checkbox.getAttribute('aria-label')).toBe(config.featureName)
      })

      it('应该支持键盘操作', async () => {
        const { getByText, emitted } = render(component)

        const label = getByText(config.featureName).closest('.toggle-label')!

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
}
