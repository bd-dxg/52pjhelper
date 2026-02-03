import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createTableSelector } from '@/utils/tableSelector'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn().mockReturnValue(true),
  },
}))

describe('tableSelector', () => {
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

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createTableSelector()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载隐藏分表索引', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        tableSelectorEnabled: true,
        hiddenTableIndexes: [1, 2],
      })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getHiddenTableIndexes()).toEqual([1, 2])
      })
    })

    it('应该在初始化时注入样式（当功能默认启用）', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.table-btn-container')
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('tableSelectorEnabled')
      expect(result.tableSelectorEnabled).toBe(false)
    })

    it('应该在禁用时移除样式', async () => {
      const manager = createTableSelector()

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

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

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
      const manager = createTableSelector()

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

    it('应该返回切换后的状态', async () => {
      const manager = createTableSelector()

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
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('隐藏分表索引', () => {
    it('应该返回默认隐藏分表索引', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      expect(manager.getHiddenTableIndexes()).toEqual([3, 4, 5, 6])
    })

    it('应该返回自定义隐藏分表索引', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        tableSelectorEnabled: true,
        hiddenTableIndexes: [0, 1],
      })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getHiddenTableIndexes()).toEqual([0, 1])
      })
    })

    it('应该返回索引的副本而不是引用', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      const indexes1 = manager.getHiddenTableIndexes()
      const indexes2 = manager.getHiddenTableIndexes()

      // 验证返回的是副本
      expect(indexes1).not.toBe(indexes2)
      expect(indexes1).toEqual(indexes2)
    })
  })

  describe('样式注入', () => {
    it('应该注入正确的容器样式', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式内容
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.table-btn-container')
      expect(styleElement?.textContent).toContain('display: flex')
    })

    it('应该注入按钮激活样式', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证激活样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.table-btn-active')
      expect(styleElement?.textContent).toContain('#ffbd10')
    })

    it('应该隐藏原始选择器', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证原始选择器隐藏样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('#posttableid_ctrl')
      expect(styleElement?.textContent).toContain('display: none')
    })
  })
})
