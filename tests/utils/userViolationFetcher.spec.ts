import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fetchUserViolation, extractUidFromHref } from '@/utils/userViolationFetcher'

describe('userViolationFetcher', () => {
  beforeEach(() => {
    // 清除所有 mock
    vi.clearAllMocks()
    // 重置所有 timers
    vi.clearAllTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('extractUidFromHref', () => {
    it('应该从标准用户链接中提取 UID', () => {
      const href = 'https://www.52pojie.cn/home.php?mod=space&uid=1967456'
      const uid = extractUidFromHref(href)
      expect(uid).toBe('1967456')
    })

    it('应该从带有额外参数的链接中提取 UID', () => {
      const href = 'https://www.52pojie.cn/home.php?mod=space&uid=123456&do=profile&from=space'
      const uid = extractUidFromHref(href)
      expect(uid).toBe('123456')
    })

    it('应该从相对路径中提取 UID', () => {
      const href = 'home.php?mod=space&uid=999999'
      const uid = extractUidFromHref(href)
      expect(uid).toBe('999999')
    })

    it('应该在链接不包含 UID 时返回 null', () => {
      const href = 'https://www.52pojie.cn/forum.php'
      const uid = extractUidFromHref(href)
      expect(uid).toBeNull()
    })

    it('应该在链接为空字符串时返回 null', () => {
      const href = ''
      const uid = extractUidFromHref(href)
      expect(uid).toBeNull()
    })

    it('应该处理包含多个数字但只有 uid 参数的链接', () => {
      const href = 'home.php?page=123&uid=456789&limit=10'
      const uid = extractUidFromHref(href)
      expect(uid).toBe('456789')
    })

    it('应该提取第一个匹配的 UID（如果有多个）', () => {
      const href = 'home.php?uid=111111&other_uid=222222'
      const uid = extractUidFromHref(href)
      expect(uid).toBe('111111')
    })
  })

  describe('fetchUserViolation', () => {
    beforeEach(() => {
      // 使用 fake timers
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('应该成功获取有违规记录的用户信息', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="gbk"></head>
        <body>
          <div class="bm_c u_profile">
            <div id="psts" class="pbm mbm bbda cl">
              <h2 class="mbn">统计信息</h2>
              <ul class="pf_l">
                <li><em>违规</em>2 次</li>
              </ul>
            </div>
            <div class="cl">
              <h2 class="mbm">违规记录</h2>
              <table id="pcr" class="dt">
                <tbody>
                  <tr>
                    <th width="15%">操作行为</th>
                    <th width="15%">操作时间</th>
                    <th>操作理由</th>
                    <th width="15%">操作者</th>
                  </tr>
                  <tr>
                    <td>删除帖子</td>
                    <td>2026-2-6 10:10</td>
                    <td>请勿灌水，提高帖子质量是每位会员应尽的义务！</td>
                    <td><a href="home.php?mod=space&uid=812936" target="_blank">L_Monkey</a></td>
                  </tr>
                  <tr>
                    <td>删除帖子</td>
                    <td>2025-4-30 05:46</td>
                    <td>请勿灌水，本次共清理【32】条感谢式灌水回复。</td>
                    <td><a href="home.php?mod=space&uid=1042233" target="_blank">bian96</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
        </html>
      `

      // Mock fetch 返回 GBK 编码的 HTML
      const mockBlob = new Blob([mockHtml], { type: 'text/html' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const promise = fetchUserViolation('1967456')

      // 推进所有 timers
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result).not.toBeNull()
      expect(result?.id).toBe('pcr')
      expect(result?.tagName).toBe('TABLE')

      // 验证表格内容
      const rows = result?.querySelectorAll('tr')
      expect(rows?.length).toBe(3) // 1 个表头 + 2 条违规记录
    })

    it('应该在用户无违规记录时返回 null', async () => {
      // 真实场景：无违规记录时，页面中不存在 #pcr 元素和"违规记录"标题
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="gbk"></head>
        <body>
          <div class="bm_c u_profile">
            <div class="pbm mbm bbda cl">
              <h2 class="mbn">勋章</h2>
              <p class="md_ctrl">
                <a href="home.php?mod=medal"><img src="https://static.52pojie.cn/static//image/common/15yeas.gif" alt="十五年荣誉奖章"></a>
              </p>
            </div>
            <div class="pbm mbm bbda cl">
              <h2 class="mbn">用户认证</h2>
            </div>
            <div id="psts" class="cl">
              <h2 class="mbn">统计信息</h2>
              <ul class="pf_l">
                <li><em>违规</em>0 次</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `

      const mockBlob = new Blob([mockHtml], { type: 'text/html' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const promise = fetchUserViolation('95729')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBeNull()
    })

    it('应该在请求超时时返回 null', async () => {
      // Mock fetch 模拟超时（通过 AbortController）
      global.fetch = vi.fn().mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            // 监听 abort 信号
            if (options?.signal) {
              options.signal.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'))
              })
            }
          }),
      )

      const promise = fetchUserViolation('1967456')

      // 推进到超时时间（10秒）
      await vi.advanceTimersByTimeAsync(10001)

      const result = await promise

      expect(result).toBeNull()
    }, 15000)

    it('应该在服务器返回错误状态码时返回 null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBeNull()
    })

    it('应该在网络错误时返回 null', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBeNull()
    })

    it('应该在 HTML 解析失败时返回 null', async () => {
      const mockBlob = new Blob(['<invalid html'], { type: 'text/html' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      // 无效的 HTML 不包含 #pcr 元素，应该返回 null
      expect(result).toBeNull()
    })

    it('应该正确构造请求 URL', async () => {
      const mockBlob = new Blob(['<html><table id="pcr"></table></html>'], { type: 'text/html' })
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })
      global.fetch = fetchSpy

      const promise = fetchUserViolation('123456')
      await vi.runAllTimersAsync()
      await promise

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://www.52pojie.cn/home.php?mod=space&uid=123456&do=profile&from=space',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        }),
      )
    })

    it('应该在 blob 转换失败时返回 null', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.reject(new Error('Blob conversion failed')),
      })

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBeNull()
    })

    it('应该处理包含中文的违规记录', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="gbk"></head>
        <body>
          <table id="pcr" class="dt">
            <tbody>
              <tr>
                <th>操作行为</th>
                <th>操作时间</th>
                <th>操作理由</th>
                <th>操作者</th>
              </tr>
              <tr>
                <td>删除帖子</td>
                <td>2026-2-6 10:10</td>
                <td>违规内容已删除</td>
                <td><a href="home.php?mod=space&uid=812936">管理员</a></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `

      const mockBlob = new Blob([mockHtml], { type: 'text/html' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).not.toBeNull()
      expect(result?.id).toBe('pcr')
      // 验证表格结构存在
      const rows = result?.querySelectorAll('tr')
      expect(rows?.length).toBe(2) // 1 个表头 + 1 条记录
    })

    it('应该处理空的违规记录表格', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="gbk"></head>
        <body>
          <table id="pcr" class="dt">
            <tbody>
              <tr>
                <th>操作行为</th>
                <th>操作时间</th>
                <th>操作理由</th>
                <th>操作者</th>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `

      const mockBlob = new Blob([mockHtml], { type: 'text/html' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).not.toBeNull()
      expect(result?.id).toBe('pcr')

      const rows = result?.querySelectorAll('tr')
      expect(rows?.length).toBe(1) // 只有表头
    })

    it('应该在请求被中止时返回 null', async () => {
      global.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))

      const promise = fetchUserViolation('1967456')
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBeNull()
    })
  })
})
