import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createMessageHelper } from '@/utils/messageHelper'

describe('messageHelper', () => {
  let messageHelper: ReturnType<typeof createMessageHelper>

  beforeEach(() => {
    fakeBrowser.reset()
    messageHelper = createMessageHelper()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isTargetSite', () => {
    it('应该检测到目标网站', async () => {
      vi.spyOn(browser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])

      const result = await messageHelper.isTargetSite()
      expect(result).toBe(true)
    })

    it('应该检测到非目标网站', async () => {
      vi.spyOn(browser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.example.com/page.html' } as any,
      ])

      const result = await messageHelper.isTargetSite()
      expect(result).toBe(false)
    })

    it('应该支持自定义域名', async () => {
      vi.spyOn(browser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.example.com/page.html' } as any,
      ])

      const result = await messageHelper.isTargetSite('example.com')
      expect(result).toBe(true)
    })

    it('应该处理错误情况', async () => {
      vi.spyOn(browser.tabs, 'query').mockRejectedValue(new Error('Query failed'))

      const result = await messageHelper.isTargetSite()
      expect(result).toBe(false)
    })
  })

  describe('sendToCurrentTab', () => {
    it('应该成功发送消息', async () => {
      const mockResponse = { success: true, data: { value: 'test' } }

      vi.spyOn(browser.tabs, 'query').mockResolvedValue([{ id: 1 } as any])
      vi.spyOn(browser.tabs, 'sendMessage').mockResolvedValue(mockResponse)

      const result = await messageHelper.sendToCurrentTab('TEST_MESSAGE', { key: 'value' })

      expect(result).toEqual(mockResponse)
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(1, {
        type: 'TEST_MESSAGE',
        payload: { key: 'value' },
      })
    })

    it('应该处理没有 tab.id 的情况', async () => {
      vi.spyOn(browser.tabs, 'query').mockResolvedValue([{} as any])

      const result = await messageHelper.sendToCurrentTab('TEST_MESSAGE')

      expect(result).toEqual({
        success: false,
        error: '无法获取当前标签页 ID',
      })
    })

    it('应该处理发送错误', async () => {
      vi.spyOn(browser.tabs, 'query').mockResolvedValue([{ id: 1 } as any])
      vi.spyOn(browser.tabs, 'sendMessage').mockRejectedValue(new Error('Send failed'))

      const result = await messageHelper.sendToCurrentTab('TEST_MESSAGE')

      expect(result).toEqual({
        success: false,
        error: 'Send failed',
      })
    })
  })

  describe('toggleFeature', () => {
    it('应该在目标网站成功切换功能', async () => {
      const onSuccess = vi.fn()
      const onMessage = vi.fn()

      vi.spyOn(browser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.52pojie.cn/forum.php' } as any,
      ])
      vi.spyOn(browser.tabs, 'sendMessage').mockResolvedValue({
        success: true,
        enabled: true,
      })

      await messageHelper.toggleFeature({
        messageType: 'TOGGLE_FEATURE',
        storageKey: 'testFeature',
        currentValue: false,
        featureName: '测试功能',
        onSuccess,
        onMessage,
      })

      expect(onSuccess).toHaveBeenCalledWith(true)
      expect(onMessage).toHaveBeenCalledWith('测试功能已启用', 'success')
    })

    it('应该在非目标网站直接修改存储', async () => {
      const onSuccess = vi.fn()
      const onMessage = vi.fn()

      vi.spyOn(browser.tabs, 'query').mockResolvedValue([
        { id: 1, url: 'https://www.example.com/page.html' } as any,
      ])

      await messageHelper.toggleFeature({
        messageType: 'TOGGLE_FEATURE',
        storageKey: 'testFeature',
        currentValue: false,
        featureName: '测试功能',
        onSuccess,
        onMessage,
      })

      expect(onSuccess).toHaveBeenCalledWith(true)
      expect(onMessage).toHaveBeenCalledWith('测试功能已启用', 'success')
    })
  })
})
