import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createDefaultTime } from '@/utils/defaultTime'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn((url: string, targetPages: string[]) => {
      return targetPages.some(page => url.includes(page))
    }),
  },
}))

describe('defaultTime', () => {
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
      const manager = createDefaultTime()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载自定义开始时间', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        defaultTimeEnabled: true,
        startTime: '2010-01-01',
      })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStartTime()).toBe('2010-01-01')
      })
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

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
      const result = await fakeBrowser.storage.local.get('defaultTimeEnabled')
      expect(result.defaultTimeEnabled).toBe(true)
    })

    it('应该在已启用时不重复启用', async () => {
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 再次启用
      await manager.enable()

      // 验证状态仍然是启用
      expect(manager.getStatus()).toBe(true)
    })

    it('应该在目标页面应用默认时间', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="">
        <button id="searchsubmit">搜索</button>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证时间已设置
      const input = document.querySelector('input[name="starttime"]') as HTMLInputElement
      expect(input.value).toBe('2008-03-13')
    })

    it('应该在非目标页面不应用默认时间', async () => {
      // 模拟非目标页面
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://www.52pojie.cn/forum.php',
        },
        writable: true,
      })

      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="">
        <button id="searchsubmit">搜索</button>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证时间未设置
      const input = document.querySelector('input[name="starttime"]') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('defaultTimeEnabled')
      expect(result.defaultTimeEnabled).toBe(false)
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

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
      const manager = createDefaultTime()

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
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

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
      const manager = createDefaultTime()

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
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ defaultTimeEnabled: false })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('设置开始时间', () => {
    it('应该正确设置开始时间', async () => {
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 设置新的开始时间
      await manager.setStartTime('2015-06-01')

      // 验证时间已更新
      expect(manager.getStartTime()).toBe('2015-06-01')

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('startTime')
      expect(result.startTime).toBe('2015-06-01')
    })

    it('应该在启用状态下重新应用时间', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="2008-03-13">
        <button id="searchsubmit">搜索</button>
      `

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 设置新的开始时间
      await manager.setStartTime('2015-06-01')

      // 验证时间已应用到输入框
      const input = document.querySelector('input[name="starttime"]') as HTMLInputElement
      expect(input.value).toBe('2015-06-01')
    })
  })

  describe('获取开始时间', () => {
    it('应该返回默认开始时间', async () => {
      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      expect(manager.getStartTime()).toBe('2008-03-13')
    })

    it('应该返回自定义开始时间', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        defaultTimeEnabled: true,
        startTime: '2020-01-01',
      })

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStartTime()).toBe('2020-01-01')
      })
    })
  })

  describe('应用默认时间逻辑', () => {
    it('应该在输入框值不同时设置默认时间', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="2020-01-01">
        <button id="searchsubmit">搜索</button>
      `

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证时间已设置为默认值
      const input = document.querySelector('input[name="starttime"]') as HTMLInputElement
      expect(input.value).toBe('2008-03-13')
    })

    it('应该在输入框值相同时不重复设置', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="2008-03-13">
        <button id="searchsubmit">搜索</button>
      `

      const clickSpy = vi.fn()
      const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
      searchSubmit.addEventListener('click', clickSpy)

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证没有触发点击事件
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('应该在缺少输入框时不报错', async () => {
      // 创建测试 DOM（缺少输入框）
      document.body.innerHTML = `
        <button id="searchsubmit">搜索</button>
      `

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证没有报错
      expect(true).toBe(true)
    })

    it('应该在缺少搜索按钮时不报错', async () => {
      // 创建测试 DOM（缺少搜索按钮）
      document.body.innerHTML = `
        <input name="starttime" value="">
      `

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证没有报错
      expect(true).toBe(true)
    })

    it('应该触发 change 和 input 事件', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <input name="starttime" value="">
        <button id="searchsubmit">搜索</button>
      `

      const changeSpy = vi.fn()
      const inputSpy = vi.fn()
      const input = document.querySelector('input[name="starttime"]') as HTMLInputElement
      input.addEventListener('change', changeSpy)
      input.addEventListener('input', inputSpy)

      const manager = createDefaultTime()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证事件已触发
      expect(changeSpy).toHaveBeenCalled()
      expect(inputSpy).toHaveBeenCalled()
    })
  })
})
