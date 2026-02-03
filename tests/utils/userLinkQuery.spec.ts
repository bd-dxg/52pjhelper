import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createUserLinkQuery } from '@/utils/userLinkQuery'
import * as userViolationFetcher from '@/utils/userViolationFetcher'

// Mock urlMatcher - 需要在 beforeEach 中重置
const mockIsTargetPage = vi.fn()

vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: (...args: unknown[]) => mockIsTargetPage(...args),
  },
}))

describe('userLinkQuery', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // 重置 mock
    mockIsTargetPage.mockReset()
    mockIsTargetPage.mockReturnValue(true)

    // 模拟目标页面 URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.52pojie.cn/forum.php?mod=modcp&action=moderate&op=threads',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createUserLinkQuery()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时注入样式（当功能默认启用）', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.user-link-popup')
    })

    it('应该在初始化时创建悬浮层', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证悬浮层已创建
      const popup = document.querySelector('.user-link-popup')
      expect(popup).toBeTruthy()
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 启用功能
      manager.enable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(true)
    })

    it('应该在启用时注入样式', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      manager.enable()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.user-link-popup')
    })

    it('应该在启用时创建悬浮层', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      manager.enable()

      // 验证悬浮层已创建
      const popup = document.querySelector('.user-link-popup')
      expect(popup).toBeTruthy()
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)
    })

    it('应该在禁用时移除样式', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      expect(document.querySelector('style')).toBeTruthy()

      // 禁用功能
      manager.disable()

      // 验证样式已移除
      expect(document.querySelector('style')).toBeFalsy()
    })

    it('应该在禁用时移除悬浮层', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证悬浮层已创建
      expect(document.querySelector('.user-link-popup')).toBeTruthy()

      // 禁用功能
      manager.disable()

      // 验证悬浮层已移除
      expect(document.querySelector('.user-link-popup')).toBeFalsy()
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 再次禁用
      manager.disable()

      // 验证状态仍然是禁用
      expect(manager.getStatus()).toBe(false)
    })
  })

  describe('切换功能', () => {
    it('应该从启用切换到禁用', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 切换功能
      const newStatus = await manager.toggle()

      // 验证状态已切换
      expect(newStatus).toBe(false)
      expect(manager.getStatus()).toBe(false)
    })

    it('应该从禁用切换到启用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 切换功能
      const newStatus = await manager.toggle()

      // 验证状态已切换
      expect(newStatus).toBe(true)
      expect(manager.getStatus()).toBe(true)
    })

    it('应该返回切换后的状态', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 切换功能
      const newStatus = await manager.toggle()

      // 验证返回值与当前状态一致
      expect(newStatus).toBe(manager.getStatus())
    })
  })

  describe('获取状态', () => {
    it('应该返回当前启用状态', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ userLinkQueryEnabled: false })

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('鼠标移入事件处理', () => {
    it('应该在鼠标移入用户链接时获取用户违规信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <div class="um">
            <a href="home.php?mod=space&uid=12345">用户名</a>
          </div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '违规记录'
      const mockFetchUserViolation = vi
        .spyOn(userViolationFetcher, 'fetchUserViolation')
        .mockResolvedValue(mockTable)

      // Mock extractUidFromHref
      vi.spyOn(userViolationFetcher, 'extractUidFromHref').mockReturnValue('12345')

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待事件监听器附加
      await new Promise(resolve => setTimeout(resolve, 100))

      // 触发鼠标移入事件
      const userLink = document.querySelector('#moderate .um a') as HTMLAnchorElement
      const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true })
      userLink.dispatchEvent(mouseOverEvent)

      // 等待异步操作完成
      await vi.waitFor(() => {
        expect(mockFetchUserViolation).toHaveBeenCalledWith('12345')
      })
    })

    it('应该在有违规记录时显示违规信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <div class="um">
            <a href="home.php?mod=space&uid=12345">用户名</a>
          </div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '违规记录'
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(mockTable)
      vi.spyOn(userViolationFetcher, 'extractUidFromHref').mockReturnValue('12345')

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待事件监听器附加
      await new Promise(resolve => setTimeout(resolve, 100))

      // 触发鼠标移入事件
      const userLink = document.querySelector('#moderate .um a') as HTMLAnchorElement
      userLink.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const popup = document.querySelector('.user-link-popup')
        expect(popup?.classList.contains('show')).toBe(true)
      })
    })

    it('应该在没有违规记录时显示提示信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <div class="um">
            <a href="home.php?mod=space&uid=12345">用户名</a>
          </div>
        </div>
      `

      // Mock fetchUserViolation 返回 null
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(null)
      vi.spyOn(userViolationFetcher, 'extractUidFromHref').mockReturnValue('12345')

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待事件监听器附加
      await new Promise(resolve => setTimeout(resolve, 100))

      // 触发鼠标移入事件
      const userLink = document.querySelector('#moderate .um a') as HTMLAnchorElement
      userLink.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const popup = document.querySelector('.user-link-popup')
        const noViolationDiv = popup?.querySelector('.no-violation')
        expect(noViolationDiv?.textContent).toBe('没有违规记录')
      })
    })

    it('应该在获取用户信息失败时显示错误', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <div class="um">
            <a href="home.php?mod=space&uid=12345">用户名</a>
          </div>
        </div>
      `

      // Mock fetchUserViolation 抛出错误
      const mockError = new Error('网络错误')
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockRejectedValue(mockError)
      vi.spyOn(userViolationFetcher, 'extractUidFromHref').mockReturnValue('12345')

      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待事件监听器附加
      await new Promise(resolve => setTimeout(resolve, 100))

      // 触发鼠标移入事件
      const userLink = document.querySelector('#moderate .um a') as HTMLAnchorElement
      userLink.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const popup = document.querySelector('.user-link-popup')
        const errorDiv = popup?.querySelector('.error')
        expect(errorDiv?.textContent).toBe('获取用户信息失败')
      })
    })
  })

  describe('样式注入', () => {
    it('应该注入正确的悬浮层样式', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式内容
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.user-link-popup')
      expect(styleElement?.textContent).toContain('position: fixed')
      expect(styleElement?.textContent).toContain('z-index: 99999')
    })

    it('应该注入加载状态样式', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证加载状态样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.loading')
    })

    it('应该注入错误状态样式', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证错误状态样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.error')
      expect(styleElement?.textContent).toContain('#cf222e')
    })

    it('应该注入无违规记录样式', async () => {
      const manager = createUserLinkQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证无违规记录样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.no-violation')
    })
  })
})
