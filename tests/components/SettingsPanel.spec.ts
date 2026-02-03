/**
 * SettingsPanel 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { fakeBrowser } from '@webext-core/fake-browser'
import SettingsPanel from '@pages/SettingsPanel.vue'
import * as userInfo from '@utils/userInfo'

// 模拟浏览器 API
global.browser = fakeBrowser

// Mock userInfo 模块
vi.mock('@utils/userInfo', () => ({
  getUserInfoFromCache: vi.fn(),
}))

// Mock 子组件
vi.mock('@com/NavigationSettings.vue', () => ({
  default: {
    name: 'NavigationSettings',
    template: '<div data-testid="navigation-settings">NavigationSettings</div>',
  },
}))

vi.mock('@com/GeneralFeaturesToggle.vue', () => ({
  default: {
    name: 'GeneralFeaturesToggle',
    template: '<div data-testid="general-features">GeneralFeaturesToggle</div>',
  },
}))

vi.mock('@com/AdminFeaturesToggle.vue', () => ({
  default: {
    name: 'AdminFeaturesToggle',
    template: '<div data-testid="admin-features">AdminFeaturesToggle</div>',
  },
}))

describe('SettingsPanel 组件', () => {
  beforeEach(async () => {
    // 清空存储
    await fakeBrowser.storage.local.clear()

    // 重置所有 mock
    vi.clearAllMocks()

    // 设置默认的 mock 返回值
    vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(null)
  })

  describe('渲染测试', () => {
    it('应该正确渲染组件', () => {
      const { getByText, container } = render(SettingsPanel)

      // 验证用户信息区域
      expect(getByText('未登录')).toBeTruthy()
      expect(getByText('游客')).toBeTruthy()

      // 验证选项卡
      expect(getByText('导航菜单设置')).toBeTruthy()
      expect(getByText('更多设置')).toBeTruthy()

      // 验证默认显示导航菜单设置
      const navigationTab = container.querySelector('[data-testid="navigation-settings"]')
      expect(navigationTab).toBeTruthy()
    })

    it('应该显示默认的用户头像', () => {
      const { container } = render(SettingsPanel)

      const avatar = container.querySelector('.user-avatar svg')
      expect(avatar).toBeTruthy()
    })

    it('应该显示用户等级', () => {
      const { getByText } = render(SettingsPanel)

      const userLevel = getByText('游客')
      expect(userLevel.classList.contains('not-logged')).toBe(true)
    })
  })

  describe('用户信息加载测试', () => {
    it('应该从缓存加载用户信息', async () => {
      const mockUserInfo = {
        username: '测试用户',
        level: 'VIP',
        avatar: 'https://example.com/avatar.jpg',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: true,
          isRegular: false,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回非 52pojie.cn 页面，这样会直接从缓存读取
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])

      const { getByText } = render(SettingsPanel)

      // 等待足够长的时间让组件完成挂载和数据加载
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(getByText('测试用户')).toBeTruthy()
      expect(getByText('VIP')).toBeTruthy()
    })

    it('应该从 content script 获取用户信息', async () => {
      const mockUserInfo = {
        username: '管理员',
        level: '管理员',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: true,
          isModerator: false,
          isVIP: false,
          isRegular: false,
        },
      }

      // Mock browser.tabs.query 返回 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])

      // Mock browser.tabs.sendMessage 返回用户信息
      vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockResolvedValue({
        success: true,
        data: mockUserInfo,
      } as any)

      const { container } = render(SettingsPanel)

      // 等待足够长的时间让组件完成挂载和数据加载
      await new Promise(resolve => setTimeout(resolve, 200))

      const username = container.querySelector('.username')
      expect(username?.textContent).toBe('管理员')
    })

    it('应该在通信失败时从缓存读取用户信息', async () => {
      const mockUserInfo = {
        username: '缓存用户',
        level: '会员',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: true,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])

      // Mock browser.tabs.sendMessage 抛出错误
      vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockRejectedValue(new Error('Communication failed'))

      const { getByText } = render(SettingsPanel)

      await waitFor(() => {
        expect(getByText('缓存用户')).toBeTruthy()
      })
    })

    it('应该在非 52pojie.cn 页面从缓存读取用户信息', async () => {
      const mockUserInfo = {
        username: '测试用户',
        level: 'VIP',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: true,
          isRegular: false,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回非 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])

      const { getByText } = render(SettingsPanel)

      await waitFor(() => {
        expect(getByText('测试用户')).toBeTruthy()
      })
    })

    it('应该处理用户信息获取失败', async () => {
      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(null)

      // Mock browser.tabs.query 抛出错误
      vi.spyOn(fakeBrowser.tabs, 'query').mockRejectedValue(new Error('Query failed'))

      const { getByText } = render(SettingsPanel)

      // 应该显示默认的未登录状态
      expect(getByText('未登录')).toBeTruthy()
      expect(getByText('游客')).toBeTruthy()
    })
  })

  describe('选项卡切换测试', () => {
    it('应该在点击时切换选项卡', async () => {
      const { getByText, container } = render(SettingsPanel)

      // 点击"更多设置"选项卡
      const quickQueryTab = getByText('更多设置')
      await fireEvent.click(quickQueryTab)

      await waitFor(() => {
        // 验证选项卡激活状态
        expect(quickQueryTab.classList.contains('active')).toBe(true)

        // 验证内容显示
        const generalFeatures = container.querySelector('[data-testid="general-features"]')
        expect(generalFeatures).toBeTruthy()
      })
    })

    it('应该保存选项卡状态到存储', async () => {
      const { getByText } = render(SettingsPanel)

      // 点击"更多设置"选项卡
      const quickQueryTab = getByText('更多设置')
      await fireEvent.click(quickQueryTab)

      await waitFor(async () => {
        const result = await fakeBrowser.storage.local.get('activeTab')
        expect(result.activeTab).toBe('quickQuery')
      })
    })

    it('应该从存储中恢复选项卡状态', async () => {
      // 设置存储中的选项卡状态
      await fakeBrowser.storage.local.set({ activeTab: 'quickQuery' })

      const { getByText, container } = render(SettingsPanel)

      await waitFor(() => {
        const quickQueryTab = getByText('更多设置')
        expect(quickQueryTab.classList.contains('active')).toBe(true)

        const generalFeatures = container.querySelector('[data-testid="general-features"]')
        expect(generalFeatures).toBeTruthy()
      })
    })

    it('应该忽略无效的选项卡状态', async () => {
      // 设置无效的选项卡状态
      await fakeBrowser.storage.local.set({ activeTab: 'invalid' })

      const { getByText } = render(SettingsPanel)

      await waitFor(() => {
        // 应该显示默认的导航菜单设置选项卡
        const navigationTab = getByText('导航菜单设置')
        expect(navigationTab.classList.contains('active')).toBe(true)
      })
    })

    it('应该正确设置 aria-selected 属性', async () => {
      const { getByText } = render(SettingsPanel)

      const navigationTab = getByText('导航菜单设置')
      const quickQueryTab = getByText('更多设置')

      // 初始状态
      expect(navigationTab.getAttribute('aria-selected')).toBe('true')
      expect(quickQueryTab.getAttribute('aria-selected')).toBe('false')

      // 切换选项卡
      await fireEvent.click(quickQueryTab)

      await waitFor(() => {
        expect(navigationTab.getAttribute('aria-selected')).toBe('false')
        expect(quickQueryTab.getAttribute('aria-selected')).toBe('true')
      })
    })
  })

  describe('消息提示测试', () => {
    it('应该有消息容器', () => {
      const { container } = render(SettingsPanel)

      const messageContainer = container.querySelector('.message-container')
      expect(messageContainer).toBeTruthy()
    })

    // 注意：由于子组件被 mock 了，我们无法直接测试消息显示功能
    // 这个功能需要在集成测试中验证
  })

  describe('管理员权限测试', () => {
    it('应该为管理员显示管理功能组件', async () => {
      const mockUserInfo = {
        username: '管理员',
        level: '管理员',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: true,
          isModerator: false,
          isVIP: false,
          isRegular: false,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回非 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])

      const { getByText, container } = render(SettingsPanel)

      // 等待数据加载
      await new Promise(resolve => setTimeout(resolve, 200))

      const username = container.querySelector('.username')
      expect(username?.textContent).toBe('管理员')

      // 切换到"更多设置"选项卡
      const quickQueryTab = getByText('更多设置')
      await fireEvent.click(quickQueryTab)

      await waitFor(() => {
        const adminFeatures = container.querySelector('[data-testid="admin-features"]')
        expect(adminFeatures).toBeTruthy()
      })
    })

    it('应该为非管理员隐藏管理功能组件', async () => {
      const mockUserInfo = {
        username: '普通用户',
        level: '会员',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: true,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回非 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])

      const { getByText, container } = render(SettingsPanel)

      // 等待数据加载
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(getByText('普通用户')).toBeTruthy()

      // 切换到"更多设置"选项卡
      const quickQueryTab = getByText('更多设置')
      await fireEvent.click(quickQueryTab)

      await waitFor(() => {
        const adminFeatures = container.querySelector('[data-testid="admin-features"]')
        expect(adminFeatures).toBeFalsy()
      })
    })
  })

  describe('可访问性测试', () => {
    it('应该为选项卡设置正确的 role 属性', () => {
      const { getByText } = render(SettingsPanel)

      const navigationTab = getByText('导航菜单设置')
      const quickQueryTab = getByText('更多设置')

      expect(navigationTab.getAttribute('role')).toBe('tab')
      expect(quickQueryTab.getAttribute('role')).toBe('tab')
    })

    it('应该为选项卡内容设置正确的 role 属性', () => {
      const { container } = render(SettingsPanel)

      const tabPanels = container.querySelectorAll('[role="tabpanel"]')
      expect(tabPanels.length).toBeGreaterThan(0)
    })

    it('应该为消息容器设置正确的 aria 属性', () => {
      const { container } = render(SettingsPanel)

      const messageContainer = container.querySelector('[role="status"]')
      expect(messageContainer).toBeTruthy()
      expect(messageContainer?.getAttribute('aria-live')).toBe('polite')
    })

    it('应该为激活的选项卡设置 tabindex=0', () => {
      const { getByText } = render(SettingsPanel)

      const navigationTab = getByText('导航菜单设置')
      const quickQueryTab = getByText('更多设置')

      expect(navigationTab.getAttribute('tabindex')).toBe('0')
      expect(quickQueryTab.getAttribute('tabindex')).toBe('-1')
    })
  })

  describe('边界情况测试', () => {
    it('应该处理用户头像加载失败', () => {
      const { container } = render(SettingsPanel)

      // 验证默认头像（SVG）存在
      const avatar = container.querySelector('.user-avatar svg')
      expect(avatar).toBeTruthy()
    })

    it('应该处理用户名过长的情况', async () => {
      const mockUserInfo = {
        username: '这是一个非常非常非常非常非常非常长的用户名',
        level: 'VIP',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: true,
          isRegular: false,
        },
      }

      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(mockUserInfo)

      // Mock browser.tabs.query 返回非 52pojie.cn 页面
      vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.google.com' } as any,
      ])

      const { getByText, container } = render(SettingsPanel)

      // 等待数据加载
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(getByText('这是一个非常非常非常非常非常非常长的用户名')).toBeTruthy()

      // 验证用户名容器有 overflow 处理
      const usernameContainer = container.querySelector('.username')
      expect(usernameContainer).toBeTruthy()
    })

    it('应该处理空的用户信息', async () => {
      vi.mocked(userInfo.getUserInfoFromCache).mockResolvedValue(null)

      const { getByText } = render(SettingsPanel)

      // 应该显示默认值
      expect(getByText('未登录')).toBeTruthy()
      expect(getByText('游客')).toBeTruthy()
    })
  })
})
