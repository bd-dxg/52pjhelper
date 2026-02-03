import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createNativeFloorDisplay } from '@/utils/nativeFloorDisplay'

describe('nativeFloorDisplay', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createNativeFloorDisplay()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

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
      const result = await fakeBrowser.storage.local.get('nativeFloorDisplayEnabled')
      expect(result.nativeFloorDisplayEnabled).toBe(true)
    })

    it('应该在已启用时不重复启用', async () => {
      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 再次启用
      await manager.enable()

      // 验证状态仍然是启用
      expect(manager.getStatus()).toBe(true)
    })

    it('应该在悬赏贴页面显示原生楼层', async () => {
      // 创建悬赏贴测试 DOM
      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          <div class="plhin" id="pid100">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
          <div class="plhin" id="pid101">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
        </div>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证原生楼层标签已添加
      const tags = document.querySelectorAll('.native-floor-tag')
      expect(tags.length).toBe(2)
    })

    it('应该在非悬赏贴页面不显示原生楼层', async () => {
      // 创建非悬赏贴测试 DOM（没有 .rsld.z 元素）
      document.body.innerHTML = `
        <div id="postlist">
          <div class="plhin" id="pid100">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
          </div>
        </div>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证没有添加原生楼层标签
      const tags = document.querySelectorAll('.native-floor-tag')
      expect(tags.length).toBe(0)
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('nativeFloorDisplayEnabled')
      expect(result.nativeFloorDisplayEnabled).toBe(false)
    })

    it('应该在禁用时清理已添加的标签', async () => {
      // 创建悬赏贴测试 DOM
      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          <div class="plhin" id="pid100">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
        </div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证标签已添加
      expect(document.querySelectorAll('.native-floor-tag').length).toBeGreaterThan(0)

      // 禁用功能
      await manager.disable()

      // 验证标签已清理
      expect(document.querySelectorAll('.native-floor-tag').length).toBe(0)
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

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
      const manager = createNativeFloorDisplay()

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
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

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
      const manager = createNativeFloorDisplay()

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
      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ nativeFloorDisplayEnabled: false })

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('原生楼层显示逻辑', () => {
    it('应该按 pid 排序后显示楼层号', async () => {
      // 创建悬赏贴测试 DOM（pid 乱序）
      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          <div class="plhin" id="pid103">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
          <div class="plhin" id="pid101">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
          <div class="plhin" id="pid102">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
        </div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证楼层号按 pid 排序
      const tags = document.querySelectorAll('.native-floor-tag')
      expect(tags.length).toBe(3)

      // pid101 应该是第 2 楼（+2 因为主题帖和最佳答案）
      const pid101Tag = document.querySelector('#pid101 .native-floor-tag')
      expect(pid101Tag?.textContent).toContain('原楼层: 2 楼')
    })

    it('应该排除主题帖（res-postfirst）', async () => {
      // 创建悬赏贴测试 DOM
      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          <div class="plhin res-postfirst" id="pid100">
            <div class="pi"><strong><a>主题帖</a></strong></div>
          </div>
          <div class="plhin" id="pid101">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
        </div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证主题帖没有添加标签
      const mainPostTag = document.querySelector('#pid100 .native-floor-tag')
      expect(mainPostTag).toBeFalsy()

      // 验证回复帖有标签
      const replyTag = document.querySelector('#pid101 .native-floor-tag')
      expect(replyTag).toBeTruthy()
    })

    it('应该在第 10 楼且是最佳答案时显示提示', async () => {
      // 创建悬赏贴测试 DOM（模拟第 10 楼是最佳答案）
      // index + 2 = 楼层号，所以 index = 8 时是第 10 楼
      // 需要 8 个帖子（pid100-pid107），然后 pid108 是第 10 楼
      const posts = Array.from({ length: 8 }, (_, i) => `
        <div class="plhin" id="pid${100 + i}">
          <div class="pi"><strong><a>楼层信息</a></strong></div>
          <div class="plc"><a><span>回复</span></a></div>
        </div>
      `).join('')

      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          ${posts}
          <div class="plhin" id="pid108">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>最佳答案</span></a></div>
          </div>
        </div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证第 10 楼的提示
      const pid108Tag = document.querySelector('#pid108 .native-floor-tag')
      expect(pid108Tag?.textContent).toContain('也可能在第一页以后')
    })

    it('应该在楼层大于 10 时显示不在第一页提示', async () => {
      // 创建悬赏贴测试 DOM（超过 10 个回复）
      const posts = Array.from({ length: 11 }, (_, i) => `
        <div class="plhin" id="pid${100 + i}">
          <div class="pi"><strong><a>楼层信息</a></strong></div>
          <div class="plc"><a><span>回复</span></a></div>
        </div>
      `).join('')

      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">${posts}</div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证第 11 楼（index=10，+2=12）的提示
      const pid110Tag = document.querySelector('#pid110 .native-floor-tag')
      expect(pid110Tag?.textContent).toContain('不在第一页')
    })

    it('应该设置正确的样式', async () => {
      // 创建悬赏贴测试 DOM
      document.body.innerHTML = `
        <div class="rsld z">已结帖</div>
        <div id="postlist">
          <div class="plhin" id="pid100">
            <div class="pi"><strong><a>楼层信息</a></strong></div>
            <div class="plc"><a><span>回复</span></a></div>
          </div>
        </div>
      `

      const manager = createNativeFloorDisplay()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式
      const tag = document.querySelector('.native-floor-tag') as HTMLElement
      expect(tag.style.color).toBe('green')
      expect(tag.style.fontWeight).toBe('bold')
    })
  })
})
