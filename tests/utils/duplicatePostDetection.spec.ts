import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createDuplicatePostDetection } from '@/utils/duplicatePostDetection'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn((url: string, targetPages: string[]) => {
      return targetPages.some(page => {
        if (page.includes('*')) {
          const regex = new RegExp(page.replace(/\*/g, '.*'))
          return regex.test(url)
        }
        return url.includes(page)
      })
    }),
  },
}))

describe('duplicatePostDetection', () => {
  // 获取当天日期字符串
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // 模拟目标页面 URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.52pojie.cn/forum-15-1.html',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createDuplicatePostDetection()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时注入样式（当功能默认启用）', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.duplicate-post-highlight')
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 启用功能
      await manager.enable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(true)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('duplicatePostDetectionEnabled')
      expect(result.duplicatePostDetectionEnabled).toBe(true)
    })

    it('应该在启用时注入样式', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.duplicate-post-highlight')
    })

    it('应该在已启用时不重复启用', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 记录当前样式元素数量
      const styleCountBefore = document.querySelectorAll('style').length

      // 再次启用
      await manager.enable()

      // 验证样式元素数量没有增加
      const styleCountAfter = document.querySelectorAll('style').length
      expect(styleCountAfter).toBe(styleCountBefore)
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('duplicatePostDetectionEnabled')
      expect(result.duplicatePostDetectionEnabled).toBe(false)
    })

    it('应该在禁用时移除样式', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      expect(document.querySelector('style')).toBeTruthy()

      // 禁用功能
      await manager.disable()

      // 验证样式已移除
      expect(document.querySelector('style')).toBeFalsy()
    })

    it('应该在禁用时移除高亮', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <tbody id="normalthread_1">
          <tr class="duplicate-post-highlight">
            <td>帖子1</td>
          </tr>
        </tbody>
      `

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证高亮已移除
      expect(document.querySelector('.duplicate-post-highlight')).toBeFalsy()
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 再次禁用
      await manager.disable()

      // 验证状态仍然是禁用
      expect(manager.getStatus()).toBe(false)
    })
  })

  describe('切换功能', () => {
    it('应该从启用切换到禁用', async () => {
      const manager = createDuplicatePostDetection()

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
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

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
      const manager = createDuplicatePostDetection()

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
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ duplicatePostDetectionEnabled: false })

      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('样式注入', () => {
    it('应该注入正确的高亮样式', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式内容
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('background-color: #fff3cd')
      expect(styleElement?.textContent).toContain('border: 2px solid #ffc107')
    })

    it('应该注入悬停样式', async () => {
      const manager = createDuplicatePostDetection()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证悬停样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.duplicate-post-highlight:hover')
      expect(styleElement?.textContent).toContain('#ffeaa7')
    })
  })
})
