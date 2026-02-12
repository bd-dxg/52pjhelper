import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'

// Mock 配置文件
vi.mock('@conf/versionCheck.json', () => ({
  default: {
    name: '版本更新检查',
    description: '定期检查是否有新版本发布',
    defaultEnabled: true,
    storageKey: 'versionCheckEnabled',
    checkInterval: 86400000,
    threadUrl: 'https://www.52pojie.cn/thread-1830279-1-1.html',
    threadTitle: '【管理插件】吾爱管理效率助手',
    versionPattern: 'V(\\d+\\.\\d+\\.\\d+)',
    lastCheckKey: 'lastVersionCheckTime',
    latestVersionKey: 'latestVersion',
    updateDismissedKey: 'updateDismissed',
  },
}))

// Mock storageHelper
const mockStorageHelper = {
  loadBoolean: vi.fn(),
  saveBoolean: vi.fn(),
  loadNumber: vi.fn(),
  saveNumber: vi.fn(),
  loadString: vi.fn(),
  saveString: vi.fn(),
}

vi.mock('@/utils/storageHelper', () => ({
  storageHelper: mockStorageHelper,
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('versionChecker', () => {
  let versionChecker: typeof import('@/utils/versionChecker').versionChecker

  beforeEach(async () => {
    fakeBrowser.reset()
    vi.clearAllMocks()

    // Mock browser.runtime.getManifest 使用 vi.spyOn
    vi.spyOn(browser.runtime, 'getManifest').mockReturnValue({
      version: '1.0.0',
      name: 'Test Extension',
      manifest_version: 3,
    })

    // 重新导入模块以获取新的实例
    vi.resetModules()
    const module = await import('@/utils/versionChecker')
    versionChecker = module.versionChecker
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkForUpdate', () => {
    it('当获取到新版本时应该返回 hasUpdate: true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>【管理插件】吾爱管理效率助手 V2.0.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.latestVersion).toBe('2.0.0')
      expect(mockStorageHelper.saveString).toHaveBeenCalledWith('latestVersion', '2.0.0')
    })

    it('当当前版本是最新时应该返回 hasUpdate: false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>【管理插件】吾爱管理效率助手 V1.0.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.latestVersion).toBe('1.0.0')
    })

    it('当当前版本更高时应该返回 hasUpdate: false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>【管理插件】吾爱管理效率助手 V0.9.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.latestVersion).toBe('0.9.0')
    })

    it('当 fetch 失败时应该返回当前版本', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.latestVersion).toBe('1.0.0')
      consoleSpy.mockRestore()
    })

    it('当 fetch 抛出异常时应该返回当前版本', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.currentVersion).toBe('1.0.0')
      expect(result.latestVersion).toBe('1.0.0')
      consoleSpy.mockRestore()
    })

    it('当页面没有 title 标签时应该返回当前版本', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><body>No title</body></html>'),
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.latestVersion).toBe('1.0.0')
      consoleSpy.mockRestore()
    })

    it('当标题中没有版本号时应该返回当前版本', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>【管理插件】吾爱管理效率助手</title></html>'),
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.latestVersion).toBe('1.0.0')
      consoleSpy.mockRestore()
    })

    it('当页面需要登录时应该输出警告但继续解析', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            '<html><title>【管理插件】吾爱管理效率助手 V2.0.0</title><body>需要登录</body></html>',
          ),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
      expect(result.latestVersion).toBe('2.0.0')
      expect(consoleSpy).toHaveBeenCalledWith('帖子需要登录才能访问，但浏览器应该已经登录')
      consoleSpy.mockRestore()
    })
  })

  describe('shouldCheck', () => {
    it('当功能禁用时应该返回 false', async () => {
      mockStorageHelper.loadBoolean.mockResolvedValueOnce(false)

      const result = await versionChecker.shouldCheck()

      expect(result).toBe(false)
      expect(mockStorageHelper.loadBoolean).toHaveBeenCalledWith('versionCheckEnabled', true)
    })

    it('当功能启用且超过检查间隔时应该返回 true', async () => {
      mockStorageHelper.loadBoolean.mockResolvedValueOnce(true)
      // 上次检查时间是 2 天前
      const twoDaysAgo = Date.now() - 2 * 86400000
      mockStorageHelper.loadNumber.mockResolvedValueOnce(twoDaysAgo)

      const result = await versionChecker.shouldCheck()

      expect(result).toBe(true)
    })

    it('当功能启用但未超过检查间隔时应该返回 false', async () => {
      mockStorageHelper.loadBoolean.mockResolvedValueOnce(true)
      // 上次检查时间是 1 小时前
      const oneHourAgo = Date.now() - 3600000
      mockStorageHelper.loadNumber.mockResolvedValueOnce(oneHourAgo)

      const result = await versionChecker.shouldCheck()

      expect(result).toBe(false)
    })

    it('当从未检查过时应该返回 true', async () => {
      mockStorageHelper.loadBoolean.mockResolvedValueOnce(true)
      mockStorageHelper.loadNumber.mockResolvedValueOnce(0)

      const result = await versionChecker.shouldCheck()

      expect(result).toBe(true)
    })
  })

  describe('updateLastCheckTime', () => {
    it('应该保存当前时间戳', async () => {
      const beforeTime = Date.now()
      mockStorageHelper.saveNumber.mockResolvedValueOnce(undefined)

      await versionChecker.updateLastCheckTime()

      expect(mockStorageHelper.saveNumber).toHaveBeenCalledWith(
        'lastVersionCheckTime',
        expect.any(Number),
      )
      const savedTime = mockStorageHelper.saveNumber.mock.calls[0][1]
      expect(savedTime).toBeGreaterThanOrEqual(beforeTime)
      expect(savedTime).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('getCachedLatestVersion', () => {
    it('应该返回缓存的最新版本号', async () => {
      mockStorageHelper.loadString.mockResolvedValueOnce('2.0.0')

      const result = await versionChecker.getCachedLatestVersion()

      expect(result).toBe('2.0.0')
      expect(mockStorageHelper.loadString).toHaveBeenCalledWith('latestVersion', '')
    })

    it('当没有缓存时应该返回空字符串', async () => {
      mockStorageHelper.loadString.mockResolvedValueOnce('')

      const result = await versionChecker.getCachedLatestVersion()

      expect(result).toBe('')
    })
  })

  describe('isUpdateDismissed', () => {
    it('当版本已被忽略时应该返回 true', async () => {
      mockStorageHelper.loadString.mockResolvedValueOnce('2.0.0')

      const result = await versionChecker.isUpdateDismissed('2.0.0')

      expect(result).toBe(true)
      expect(mockStorageHelper.loadString).toHaveBeenCalledWith('updateDismissed', '')
    })

    it('当版本未被忽略时应该返回 false', async () => {
      mockStorageHelper.loadString.mockResolvedValueOnce('1.5.0')

      const result = await versionChecker.isUpdateDismissed('2.0.0')

      expect(result).toBe(false)
    })

    it('当没有忽略记录时应该返回 false', async () => {
      mockStorageHelper.loadString.mockResolvedValueOnce('')

      const result = await versionChecker.isUpdateDismissed('2.0.0')

      expect(result).toBe(false)
    })
  })

  describe('dismissUpdate', () => {
    it('应该保存被忽略的版本号', async () => {
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      await versionChecker.dismissUpdate('2.0.0')

      expect(mockStorageHelper.saveString).toHaveBeenCalledWith('updateDismissed', '2.0.0')
    })
  })

  describe('clearDismissed', () => {
    it('应该清除忽略标记', async () => {
      const removeSpy = vi.spyOn(browser.storage.local, 'remove')

      await versionChecker.clearDismissed()

      expect(removeSpy).toHaveBeenCalledWith('updateDismissed')
    })
  })

  describe('版本号比较', () => {
    it('应该正确比较主版本号差异', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>V2.0.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
    })

    it('应该正确比较次版本号差异', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>V1.1.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
    })

    it('应该正确比较修订版本号差异', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>V1.0.1</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
    })

    it('应该正确处理小写 v 前缀', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>v2.0.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
      expect(result.latestVersion).toBe('2.0.0')
    })
  })

  describe('边界情况', () => {
    it('应该正确处理版本号位数不同的情况', async () => {
      // 当前版本 1.0.0，远程版本 1.0（缺少修订号）
      // 由于正则要求三位版本号，这种情况不会匹配
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>V1.0</title></html>'),
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(false)
      expect(result.latestVersion).toBe('1.0.0')
      consoleSpy.mockRestore()
    })

    it('应该正确处理包含其他文本的标题', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            '<html><title>【管理插件】吾爱管理效率助手 V2.0.0 - 吾爱破解论坛</title></html>',
          ),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.hasUpdate).toBe(true)
      expect(result.latestVersion).toBe('2.0.0')
    })

    it('应该返回正确的 threadUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><title>V1.0.0</title></html>'),
      })
      mockStorageHelper.saveString.mockResolvedValueOnce(undefined)

      const result = await versionChecker.checkForUpdate()

      expect(result.threadUrl).toBe('https://www.52pojie.cn/thread-1830279-1-1.html')
    })
  })
})
