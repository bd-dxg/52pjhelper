import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createFeatureManager, type CreateFeatureManagerOptions } from '@/utils/featureManager'

describe('featureManager', () => {
  // Mock 回调函数
  let onEnableMock: ReturnType<typeof vi.fn>
  let onDisableMock: ReturnType<typeof vi.fn>
  let onInitMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 创建 mock 函数
    onEnableMock = vi.fn()
    onDisableMock = vi.fn()
    onInitMock = vi.fn()

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'https://www.52pojie.cn/forum-1.html' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
        onInit: onInitMock,
      }

      createFeatureManager(options)

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(onInitMock).toHaveBeenCalledTimes(1)
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ testFeature: false })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该在初始化时调用 onEnable（当功能默认启用且在目标页面）', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(onEnableMock).toHaveBeenCalledTimes(1)
      })
    })

    it('应该在初始化时不调用 onEnable（当功能默认禁用）', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      createFeatureManager(options)

      // 等待一段时间确保初始化完成
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(onEnableMock).not.toHaveBeenCalled()
    })
  })

  describe('启用功能', () => {
    it('应该启用功能并保存配置', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      // 启用功能
      await manager.enable()

      expect(manager.getStatus()).toBe(true)
      expect(onEnableMock).toHaveBeenCalledTimes(1)

      // 验证配置已保存
      const stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(true)
    })

    it('应该在目标页面上调用 onEnable', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })

    it('应该在非目标页面上不调用 onEnable', async () => {
      // 修改当前页面 URL
      Object.defineProperty(window, 'location', {
        value: { href: 'https://www.example.com/' },
        writable: true,
        configurable: true,
      })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      await manager.enable()

      expect(manager.getStatus()).toBe(true)
      expect(onEnableMock).not.toHaveBeenCalled()
    })

    it('应该在已启用时不重复启用', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 重置 mock 计数
      onEnableMock.mockClear()

      // 再次启用
      await manager.enable()

      expect(onEnableMock).not.toHaveBeenCalled()
    })
  })

  describe('禁用功能', () => {
    it('应该禁用功能并保存配置', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      expect(manager.getStatus()).toBe(false)
      expect(onDisableMock).toHaveBeenCalledTimes(1)

      // 验证配置已保存
      const stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(false)
    })

    it('应该在目标页面上调用 onDisable', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.disable()

      expect(onDisableMock).toHaveBeenCalledTimes(1)
    })

    it('应该在非目标页面上不调用 onDisable', async () => {
      // 修改当前页面 URL
      Object.defineProperty(window, 'location', {
        value: { href: 'https://www.example.com/' },
        writable: true,
        configurable: true,
      })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
          targetPages: ['https://www.52pojie.cn/*'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.disable()

      expect(manager.getStatus()).toBe(false)
      expect(onDisableMock).not.toHaveBeenCalled()
    })

    it('应该在已禁用时不重复禁用', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 再次禁用
      await manager.disable()

      expect(onDisableMock).not.toHaveBeenCalled()
    })
  })

  describe('切换功能状态', () => {
    it('应该从禁用切换到启用', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      const newStatus = await manager.toggle()

      expect(newStatus).toBe(true)
      expect(manager.getStatus()).toBe(true)
      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })

    it('应该从启用切换到禁用', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      const newStatus = await manager.toggle()

      expect(newStatus).toBe(false)
      expect(manager.getStatus()).toBe(false)
      expect(onDisableMock).toHaveBeenCalledTimes(1)
    })

    it('应该支持连续切换', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      // 第一次切换：禁用 -> 启用
      let status = await manager.toggle()
      expect(status).toBe(true)

      // 第二次切换：启用 -> 禁用
      status = await manager.toggle()
      expect(status).toBe(false)

      // 第三次切换：禁用 -> 启用
      status = await manager.toggle()
      expect(status).toBe(true)

      expect(onEnableMock).toHaveBeenCalledTimes(2)
      expect(onDisableMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('获取功能状态', () => {
    it('应该返回当前功能状态（启用）', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前功能状态（禁用）', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在状态变化后返回新状态', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      await manager.enable()
      expect(manager.getStatus()).toBe(true)

      await manager.disable()
      expect(manager.getStatus()).toBe(false)
    })
  })

  describe('目标页面检查', () => {
    it('应该在未指定目标页面时匹配所有页面', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      // 应该调用 onEnable，因为没有目标页面限制
      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })

    it('应该在指定空数组时匹配所有页面', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
          targetPages: [],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      // 应该调用 onEnable，因为空数组表示所有页面
      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })

    it('应该正确匹配通配符模式', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
          targetPages: ['https://www.52pojie.cn/forum-*.html'],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      // 应该调用 onEnable，因为当前 URL 匹配通配符
      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })

    it('应该支持多个目标页面', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
          targetPages: [
            'https://www.52pojie.cn/forum-*.html',
            'https://www.52pojie.cn/thread-*.html',
          ],
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      // 应该调用 onEnable，因为当前 URL 匹配第一个模式
      expect(onEnableMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('异步回调处理', () => {
    it('应该支持异步 onEnable 回调', async () => {
      const asyncOnEnable = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: asyncOnEnable,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      await manager.enable()

      expect(asyncOnEnable).toHaveBeenCalledTimes(1)
      expect(manager.getStatus()).toBe(true)
    })

    it('应该支持异步 onDisable 回调', async () => {
      const asyncOnDisable = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: asyncOnDisable,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.disable()

      expect(asyncOnDisable).toHaveBeenCalledTimes(1)
      expect(manager.getStatus()).toBe(false)
    })

    it('应该支持异步 onInit 回调', async () => {
      const asyncOnInit = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
        onInit: asyncOnInit,
      }

      createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(asyncOnInit).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('配置持久化', () => {
    it('应该在启用后持久化配置', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.enable()

      // 验证配置已保存
      const stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(true)
    })

    it('应该在禁用后持久化配置', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: true,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.disable()

      // 验证配置已保存
      const stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(false)
    })

    it('应该在切换后持久化配置', async () => {
      const options: CreateFeatureManagerOptions = {
        config: {
          storageKey: 'testFeature',
          defaultEnabled: false,
        },
        onEnable: onEnableMock,
        onDisable: onDisableMock,
      }

      const manager = createFeatureManager(options)

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一小段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 10))

      await manager.toggle()

      // 验证配置已保存
      let stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(true)

      await manager.toggle()

      // 验证配置已更新
      stored = await fakeBrowser.storage.local.get('testFeature')
      expect(stored.testFeature).toBe(false)
    })
  })
})
