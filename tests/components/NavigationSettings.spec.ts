import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import NavigationSettings from '@com/NavigationSettings.vue'
import * as navigationHider from '@utils/navigationHider'

// 模拟浏览器 API
global.browser = fakeBrowser

// Mock navigationHider 模块
vi.mock('@utils/navigationHider', () => ({
  DEFAULT_NAV_MENUS: [
    { id: 'menu1', name: '菜单1' },
    { id: 'menu2', name: '菜单2' },
    { id: 'menu3', name: '菜单3' },
  ],
  loadNavConfig: vi.fn(),
  saveNavConfig: vi.fn(),
  toggleMenu: vi.fn(),
}))

describe('NavigationSettings 组件', () => {
  beforeEach(async () => {
    // 清空存储
    await fakeBrowser.storage.local.clear()

    // 重置所有 mock
    vi.clearAllMocks()

    // 设置默认的 mock 返回值
    vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({ hiddenMenus: [] })
    vi.mocked(navigationHider.saveNavConfig).mockResolvedValue()
    vi.mocked(navigationHider.toggleMenu).mockResolvedValue({ hiddenMenus: [] })
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      const { getByText } = render(NavigationSettings)

      // 验证描述文本
      expect(getByText(/点击菜单按钮切换显示\/隐藏状态/)).toBeTruthy()

      // 验证菜单按钮
      expect(getByText('菜单1')).toBeTruthy()
      expect(getByText('菜单2')).toBeTruthy()
      expect(getByText('菜单3')).toBeTruthy()

      // 验证重置按钮
      expect(getByText('重置为默认')).toBeTruthy()
    })

    it('应该渲染所有导航菜单按钮', () => {
      const { container } = render(NavigationSettings)

      const menuButtons = container.querySelectorAll('.menu-btn')
      expect(menuButtons).toHaveLength(3)
    })

    it('应该正确显示菜单按钮的初始状态', () => {
      const { container } = render(NavigationSettings)

      const menuButtons = container.querySelectorAll('.menu-btn')
      menuButtons.forEach(button => {
        expect(button.classList.contains('is-hidden')).toBe(false)
        expect(button.getAttribute('aria-pressed')).toBe('true')
      })
    })
  })

  describe('配置加载测试', () => {
    it('应该在挂载时加载用户配置', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1', 'menu2'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        const menu2Button = getByText('菜单2').closest('.menu-btn')
        const menu3Button = getByText('菜单3').closest('.menu-btn')

        expect(menu1Button?.classList.contains('is-hidden')).toBe(true)
        expect(menu2Button?.classList.contains('is-hidden')).toBe(true)
        expect(menu3Button?.classList.contains('is-hidden')).toBe(false)
      })

      expect(navigationHider.loadNavConfig).toHaveBeenCalledTimes(1)
    })

    it('应该处理配置加载失败', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(navigationHider.loadNavConfig).mockRejectedValue(new Error('Load failed'))

      const { emitted } = render(NavigationSettings)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('show-message')
        expect(emitted()['show-message'][0]).toEqual(['加载配置失败', 'error'])
      })

      consoleErrorSpy.mockRestore()
    })

    it('应该正确设置 aria-pressed 属性', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        const menu2Button = getByText('菜单2').closest('.menu-btn')

        expect(menu1Button?.getAttribute('aria-pressed')).toBe('false')
        expect(menu2Button?.getAttribute('aria-pressed')).toBe('true')
      })
    })
  })

  describe('菜单切换测试', () => {
    it('应该在点击菜单按钮时切换状态', async () => {
      vi.mocked(navigationHider.toggleMenu).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText, emitted } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(navigationHider.toggleMenu).toHaveBeenCalledWith('menu1')
        expect(emitted()).toHaveProperty('show-message')
        expect(emitted()['show-message'][0]).toEqual(['设置已更新', 'success'])
      })
    })

    it('应该在切换后更新菜单状态', async () => {
      vi.mocked(navigationHider.toggleMenu).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(menu1Button.classList.contains('is-hidden')).toBe(true)
      })
    })

    it('应该在 52pojie.cn 页面发送消息到 content script', async () => {
      vi.mocked(navigationHider.toggleMenu).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      // Mock browser.tabs.query 返回 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])
      vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ success: true } as any)

      render(NavigationSettings)

      const menu1Button = screen.getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(1, {
          type: 'UPDATE_NAVIGATION',
          config: { hiddenMenus: ['menu1'] },
        })
      })
    })

    it('应该在非 52pojie.cn 页面不发送消息', async () => {
      vi.mocked(navigationHider.toggleMenu).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      // Mock browser.tabs.query 返回非 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])
      const sendMessageSpy = vi.spyOn(fakeBrowser.tabs, 'sendMessage')

      const { getByText } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(navigationHider.toggleMenu).toHaveBeenCalled()
      })

      expect(sendMessageSpy).not.toHaveBeenCalled()
    })

    it('应该处理切换失败', async () => {
      vi.mocked(navigationHider.toggleMenu).mockRejectedValue(new Error('Toggle failed'))

      const { getByText, emitted } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('show-message')
        expect(emitted()['show-message'][0]).toEqual(['更新设置失败', 'error'])
      })
    })
  })

  describe('重置配置测试', () => {
    it('应该在点击重置按钮时重置配置', async () => {
      // 先设置一些隐藏的菜单
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1', 'menu2'],
      })

      const { getByText, emitted } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(true)
      })

      // 点击重置按钮
      const resetButton = getByText('重置为默认')
      await fireEvent.click(resetButton)

      await waitFor(() => {
        expect(navigationHider.saveNavConfig).toHaveBeenCalledWith({ hiddenMenus: [] })
        expect(emitted()).toHaveProperty('show-message')
        expect(emitted()['show-message']).toContainEqual(['配置已重置为默认', 'success'])
      })
    })

    it('应该在重置后更新菜单状态', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(true)
      })

      const resetButton = getByText('重置为默认')
      await fireEvent.click(resetButton)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(false)
      })
    })

    it('应该在重置后发送消息到 content script', async () => {
      // Mock browser.tabs.query 返回 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])
      vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({ success: true } as any)

      render(NavigationSettings)

      const resetButton = screen.getByText('重置为默认')
      await fireEvent.click(resetButton)

      await waitFor(() => {
        expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(1, {
          type: 'UPDATE_NAVIGATION',
          config: { hiddenMenus: [] },
        })
      })
    })

    it('应该处理重置失败', async () => {
      vi.mocked(navigationHider.saveNavConfig).mockRejectedValue(new Error('Reset failed'))

      const { getByText, emitted } = render(NavigationSettings)

      const resetButton = getByText('重置为默认')
      await fireEvent.click(resetButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('show-message')
        expect(emitted()['show-message'][0]).toEqual(['重置配置失败', 'error'])
      })
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空的隐藏菜单列表', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: [],
      })

      const { container } = render(NavigationSettings)

      await waitFor(() => {
        const menuButtons = container.querySelectorAll('.menu-btn')
        menuButtons.forEach(button => {
          expect(button.classList.contains('is-hidden')).toBe(false)
        })
      })
    })

    it('应该处理所有菜单都被隐藏的情况', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1', 'menu2', 'menu3'],
      })

      const { container } = render(NavigationSettings)

      await waitFor(() => {
        const menuButtons = container.querySelectorAll('.menu-btn')
        menuButtons.forEach(button => {
          expect(button.classList.contains('is-hidden')).toBe(true)
        })
      })
    })

    it('应该处理不存在的菜单 ID', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1', 'nonexistent'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(true)
      })
    })

    it('应该处理 tab 查询失败', async () => {
      // Mock browser.tabs.query 抛出错误
      vi.spyOn(fakeBrowser.tabs, 'query').mockRejectedValue(new Error('Query failed'))

      const { getByText } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      // 应该不会抛出错误，只是不发送消息
      await waitFor(() => {
        expect(navigationHider.toggleMenu).toHaveBeenCalled()
      })
    })

    it('应该处理消息发送失败', async () => {
      // Mock browser.tabs.query 返回 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn' } as any,
      ])
      // Mock browser.tabs.sendMessage 抛出错误
      vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Send failed'))

      const { getByText } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!
      await fireEvent.click(menu1Button)

      // 应该不会抛出错误，消息发送失败不影响功能
      await waitFor(() => {
        expect(navigationHider.toggleMenu).toHaveBeenCalled()
      })
    })
  })

  describe('可访问性测试', () => {
    it('应该为菜单按钮设置正确的 aria-pressed 属性', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        const menu2Button = getByText('菜单2').closest('.menu-btn')

        expect(menu1Button?.getAttribute('aria-pressed')).toBe('false')
        expect(menu2Button?.getAttribute('aria-pressed')).toBe('true')
      })
    })

    it('应该支持键盘操作', async () => {
      const { getByText } = render(NavigationSettings)

      const menu1Button = getByText('菜单1').closest('.menu-btn')!

      // 模拟键盘 Enter 键
      await fireEvent.keyDown(menu1Button, { key: 'Enter', code: 'Enter' })
      await fireEvent.click(menu1Button)

      await waitFor(() => {
        expect(navigationHider.toggleMenu).toHaveBeenCalled()
      })
    })
  })

  describe('样式测试', () => {
    it('应该为隐藏的菜单添加 is-hidden 类', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: ['menu1'],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(true)
      })
    })

    it('应该为显示的菜单移除 is-hidden 类', async () => {
      vi.mocked(navigationHider.loadNavConfig).mockResolvedValue({
        hiddenMenus: [],
      })

      const { getByText } = render(NavigationSettings)

      await waitFor(() => {
        const menu1Button = getByText('菜单1').closest('.menu-btn')
        expect(menu1Button?.classList.contains('is-hidden')).toBe(false)
      })
    })
  })
})
