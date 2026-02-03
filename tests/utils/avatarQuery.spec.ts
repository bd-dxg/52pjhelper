import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createAvatarQuery } from '@/utils/avatarQuery'
import * as userViolationFetcher from '@/utils/userViolationFetcher'

describe('avatarQuery', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createAvatarQuery()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时注入样式（当功能默认启用）', async () => {
      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.p_pop.blk.bui')
    })

    it('应该在初始化时附加事件监听器（当功能默认启用）', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="avatar">
          <a href="home.php?mod=space&uid=12345">
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证事件监听器已附加（通过触发事件来验证）
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      expect(img).toBeTruthy()
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

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
      const result = await fakeBrowser.storage.local.get('avatarQueryEnabled')
      expect(result.avatarQueryEnabled).toBe(true)
    })

    it('应该在启用时注入样式', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.p_pop.blk.bui')
    })

    it('应该在启用时附加事件监听器', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="avatar">
          <a href="home.php?mod=space&uid=12345">
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证事件监听器已附加（通过触发事件来验证）
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      expect(img).toBeTruthy()
    })

    it('应该在已启用时不重复启用', async () => {
      const manager = createAvatarQuery()

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
      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('avatarQueryEnabled')
      expect(result.avatarQueryEnabled).toBe(false)
    })

    it('应该在禁用时移除样式', async () => {
      const manager = createAvatarQuery()

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

    it('应该在禁用时移除事件监听器', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="avatar">
          <a href="home.php?mod=space&uid=12345">
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // Mock fetchUserViolation
      const mockFetchUserViolation = vi
        .spyOn(userViolationFetcher, 'fetchUserViolation')
        .mockResolvedValue(null)

      // 触发事件验证监听器已附加
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      await vi.waitFor(() => {
        expect(mockFetchUserViolation).toHaveBeenCalledTimes(1)
      })

      // 禁用功能
      await manager.disable()

      // 重置 mock
      mockFetchUserViolation.mockClear()

      // 再次触发事件
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证监听器未被调用
      expect(mockFetchUserViolation).not.toHaveBeenCalled()
    })

    it('应该在禁用时清理已注入的内容', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="p_pop blk bui">
            <table>违规记录表格</table>
            <div data-avatar-query="true">没有违规记录</div>
          </div>
        </div>
      `

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证已注入的内容已清理
      expect(document.querySelector('.p_pop.blk.bui table')).toBeFalsy()
      expect(document.querySelector('div[data-avatar-query]')).toBeFalsy()
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

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
      const manager = createAvatarQuery()

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
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

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
      const manager = createAvatarQuery()

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
      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ avatarQueryEnabled: false })

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('鼠标移入事件处理', () => {
    it('应该在鼠标移入时获取用户违规信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui"></div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '违规记录'
      const mockFetchUserViolation = vi
        .spyOn(userViolationFetcher, 'fetchUserViolation')
        .mockResolvedValue(mockTable)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        expect(mockFetchUserViolation).toHaveBeenCalledWith('12345')
      })
    })

    it('应该在有违规记录时显示违规信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui"></div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '违规记录'
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(mockTable)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const card = document.querySelector('.p_pop.blk.bui')
        const table = card?.querySelector('table')
        expect(table).toBeTruthy()
        expect(table?.textContent).toBe('违规记录')
      })
    })

    it('应该在没有违规记录时显示提示信息', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui"></div>
        </div>
      `

      // Mock fetchUserViolation 返回 null
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(null)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const card = document.querySelector('.p_pop.blk.bui')
        const div = card?.querySelector('div[data-avatar-query]')
        expect(div).toBeTruthy()
        expect(div?.textContent).toBe('没有违规记录')
      })
    })

    it('应该在未找到卡片容器时输出错误', async () => {
      // 创建测试 DOM（缺少卡片容器）
      document.body.innerHTML = `
        <div class="avatar">
          <a href="home.php?mod=space&uid=12345">
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(mockTable)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('未找到卡片容器')
      })
    })

    it('应该在未找到父级链接时输出错误', async () => {
      // 创建测试 DOM（img 的父节点不是 a 标签，但符合选择器）
      document.body.innerHTML = `
        <div class="avatar">
          <a>
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证 console.error 被调用
      expect(console.error).toHaveBeenCalledWith('未找到父级链接')
    })

    it('应该在未匹配到 uid 时输出错误', async () => {
      // 创建测试 DOM（链接不包含 uid）
      document.body.innerHTML = `
        <div class="avatar">
          <a href="home.php?mod=space">
            <img src="avatar.jpg" alt="用户头像">
          </a>
        </div>
      `

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('未匹配到uid')
      })
    })

    it('应该在获取用户信息失败时输出错误', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui"></div>
        </div>
      `

      // Mock fetchUserViolation 抛出错误
      const mockError = new Error('网络错误')
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockRejectedValue(mockError)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('获取用户信息失败:', mockError)
      })
    })

    it('应该替换已存在的违规信息表格', async () => {
      // 创建测试 DOM（已有违规信息表格）
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui">
            <table>旧的违规记录</table>
          </div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '新的违规记录'
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(mockTable)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const card = document.querySelector('.p_pop.blk.bui')
        const table = card?.querySelector('table')
        expect(table?.textContent).toBe('新的违规记录')
      })
    })

    it('应该替换已存在的"没有违规记录"提示', async () => {
      // 创建测试 DOM（已有"没有违规记录"提示）
      document.body.innerHTML = `
        <div class="pls cl favatar">
          <div class="avatar">
            <a href="home.php?mod=space&uid=12345">
              <img src="avatar.jpg" alt="用户头像">
            </a>
          </div>
          <div class="p_pop blk bui">
            <div data-avatar-query="true">没有违规记录</div>
          </div>
        </div>
      `

      // Mock fetchUserViolation
      const mockTable = document.createElement('table')
      mockTable.textContent = '新的违规记录'
      vi.spyOn(userViolationFetcher, 'fetchUserViolation').mockResolvedValue(mockTable)

      const manager = createAvatarQuery()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 触发鼠标移入事件
      const img = document.querySelector('.avatar>a>img') as HTMLImageElement
      img.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

      // 等待异步操作完成
      await vi.waitFor(() => {
        const card = document.querySelector('.p_pop.blk.bui')
        const table = card?.querySelector('table')
        const div = card?.querySelector('div[data-avatar-query]')
        expect(table?.textContent).toBe('新的违规记录')
        expect(div).toBeFalsy()
      })
    })
  })
})
