import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  getUserInfo,
  saveUserInfoToCache,
  getUserInfoFromCache,
  watchUserInfo,
  type UserInfo,
} from '@/utils/userInfo'

describe('userInfo', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.body
    document.body.innerHTML = ''

    // 清除所有 console mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getUserInfo', () => {
    it('应该返回未登录状态（当页面无用户信息时）', () => {
      const userInfo = getUserInfo()

      expect(userInfo).toEqual({
        username: '未登录',
        level: '游客',
        avatar: '',
        isLoggedIn: false,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: false,
        },
      })
    })

    it('应该正确获取已登录用户信息', () => {
      // 模拟已登录用户的 DOM 结构
      document.body.innerHTML = `
        <div class="vwmy">
          <a>测试用户</a>
        </div>
        <div id="g_upmine">
          <font>前途无量</font>
        </div>
        <div id="um">
          <div class="avt">
            <img src="https://example.com/avatar.jpg" />
          </div>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.username).toBe('测试用户')
      expect(userInfo.level).toBe('前途无量')
      expect(userInfo.avatar).toBe('https://example.com/avatar.jpg')
      expect(userInfo.isLoggedIn).toBe(true)
    })

    it('应该正确识别管理员权限', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>管理员</a>
        </div>
        <div id="g_upmine">
          <font>人在江湖</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isAdmin).toBe(true)
      expect(userInfo.permissions.isModerator).toBe(true)
    })

    it('应该正确识别版主权限（仗剑天涯）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>版主</a>
        </div>
        <div id="g_upmine">
          <font>仗剑天涯</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isAdmin).toBe(true)
      expect(userInfo.permissions.isModerator).toBe(true)
    })

    it('应该正确识别版主权限（踏雪无痕）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>版主</a>
        </div>
        <div id="g_upmine">
          <font>踏雪无痕</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isAdmin).toBe(true)
      expect(userInfo.permissions.isModerator).toBe(true)
    })

    it('应该正确识别版主权限（独步武林）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>版主</a>
        </div>
        <div id="g_upmine">
          <font>独步武林</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isAdmin).toBe(true)
      expect(userInfo.permissions.isModerator).toBe(true)
    })

    it('应该正确识别 VIP 权限', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>VIP用户</a>
        </div>
        <div id="g_upmine">
          <font>VIP会员</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isVIP).toBe(true)
    })

    it('应该正确识别贵宾权限', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>贵宾用户</a>
        </div>
        <div id="g_upmine">
          <font>贵宾会员</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isVIP).toBe(true)
    })

    it('应该正确识别钻石会员权限', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>钻石用户</a>
        </div>
        <div id="g_upmine">
          <font>钻石会员</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isVIP).toBe(true)
    })

    it('应该正确识别普通会员权限（身陷囹圄）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>身陷囹圄</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（锋芒初露）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>锋芒初露</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（前途无量）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>前途无量</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（出类拔萃）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>出类拔萃</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（凤毛麟角）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>凤毛麟角</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（独树一帜）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>独树一帜</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该正确识别普通会员权限（炉火纯青）', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>普通用户</a>
        </div>
        <div id="g_upmine">
          <font>炉火纯青</font>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.permissions.isRegular).toBe(true)
    })

    it('应该处理部分信息缺失的情况', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>测试用户</a>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.username).toBe('测试用户')
      expect(userInfo.level).toBe('游客')
      expect(userInfo.avatar).toBe('')
      expect(userInfo.isLoggedIn).toBe(true)
    })

    it('应该处理空白用户名', () => {
      document.body.innerHTML = `
        <div class="vwmy">
          <a>   </a>
        </div>
      `

      const userInfo = getUserInfo()

      expect(userInfo.username).toBe('未登录')
      expect(userInfo.isLoggedIn).toBe(false)
    })

    it('应该处理 DOM 查询错误', () => {
      // Mock querySelector 抛出错误
      const originalQuerySelector = document.querySelector
      document.querySelector = vi.fn(() => {
        throw new Error('DOM query failed')
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const userInfo = getUserInfo()

      expect(userInfo).toEqual({
        username: '未登录',
        level: '游客',
        avatar: '',
        isLoggedIn: false,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: false,
        },
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('获取用户信息失败:', expect.any(Error))

      // 恢复原始方法
      document.querySelector = originalQuerySelector
    })
  })

  describe('saveUserInfoToCache', () => {
    it('应该成功保存用户信息到缓存', async () => {
      const userInfo: UserInfo = {
        username: '测试用户',
        level: '前途无量',
        avatar: 'https://example.com/avatar.jpg',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: true,
        },
      }

      await saveUserInfoToCache(userInfo)

      const stored = await fakeBrowser.storage.local.get('userInfoCache')
      expect(stored.userInfoCache).toEqual(userInfo)
    })

    it('应该处理保存错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock storage.local.set 抛出错误
      vi.spyOn(fakeBrowser.storage.local, 'set').mockRejectedValue(new Error('Save failed'))

      const userInfo: UserInfo = {
        username: '测试用户',
        level: '前途无量',
        avatar: '',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: true,
        },
      }

      await saveUserInfoToCache(userInfo)

      expect(consoleErrorSpy).toHaveBeenCalledWith('保存用户信息到缓存失败:', expect.any(Error))
    })
  })

  describe('getUserInfoFromCache', () => {
    it('应该成功从缓存读取用户信息', async () => {
      const userInfo: UserInfo = {
        username: '测试用户',
        level: '前途无量',
        avatar: 'https://example.com/avatar.jpg',
        isLoggedIn: true,
        permissions: {
          isAdmin: false,
          isModerator: false,
          isVIP: false,
          isRegular: true,
        },
      }

      await fakeBrowser.storage.local.set({ userInfoCache: userInfo })

      const cached = await getUserInfoFromCache()
      expect(cached).toEqual(userInfo)
    })

    it('应该在缓存为空时返回 null', async () => {
      const cached = await getUserInfoFromCache()
      expect(cached).toBeNull()
    })

    it('应该在缓存数据无效时返回 null', async () => {
      await fakeBrowser.storage.local.set({ userInfoCache: 'invalid data' })

      const cached = await getUserInfoFromCache()
      expect(cached).toBeNull()
    })

    it('应该在缓存数据缺少 username 字段时返回 null', async () => {
      await fakeBrowser.storage.local.set({
        userInfoCache: {
          level: '前途无量',
          avatar: '',
        },
      })

      const cached = await getUserInfoFromCache()
      expect(cached).toBeNull()
    })

    it('应该处理读取错误', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock storage.local.get 抛出错误
      vi.spyOn(fakeBrowser.storage.local, 'get').mockRejectedValue(new Error('Read failed'))

      const cached = await getUserInfoFromCache()

      expect(cached).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('从缓存读取用户信息失败:', expect.any(Error))
    })
  })

  describe('watchUserInfo', () => {
    it('应该在初始化时立即调用回调', () => {
      const callback = vi.fn()

      document.body.innerHTML = `
        <div class="vwmy">
          <a>测试用户</a>
        </div>
      `

      const unwatch = watchUserInfo(callback)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          username: '测试用户',
          isLoggedIn: true,
        }),
      )

      unwatch()
    })

    it('应该在 DOM 变化时调用回调', async () => {
      const callback = vi.fn()

      const unwatch = watchUserInfo(callback)

      // 清除初始调用
      callback.mockClear()

      // 修改 DOM
      document.body.innerHTML = `
        <div class="vwmy">
          <a>新用户</a>
        </div>
      `

      // 等待 MutationObserver 触发
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(callback).toHaveBeenCalled()

      unwatch()
    })

    it('应该在调用 unwatch 后停止监听', async () => {
      const callback = vi.fn()

      const unwatch = watchUserInfo(callback)

      // 清除初始调用
      callback.mockClear()

      // 停止监听
      unwatch()

      // 修改 DOM
      document.body.innerHTML = `
        <div class="vwmy">
          <a>新用户</a>
        </div>
      `

      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100))

      // 不应该再调用回调
      expect(callback).not.toHaveBeenCalled()
    })

    it('应该处理 body 不存在的情况', () => {
      const callback = vi.fn()

      // 临时移除 body
      const originalBody = document.body
      Object.defineProperty(document, 'body', {
        value: null,
        writable: true,
        configurable: true,
      })

      const unwatch = watchUserInfo(callback)

      // 应该仍然调用初始回调
      expect(callback).toHaveBeenCalledTimes(1)

      unwatch()

      // 恢复 body
      Object.defineProperty(document, 'body', {
        value: originalBody,
        writable: true,
        configurable: true,
      })
    })
  })
})
