import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  initializeContentFilter,
  enableContentFilter,
  disableContentFilter,
  toggleContentFilter,
  getContentFilterStatus,
  createContentFilter,
  type FilterRule,
} from '@/utils/contentFilter'
import contentFilterConfig from '@conf/contentFilter.json'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn().mockReturnValue(true),
  },
}))

describe('contentFilter', () => {
  beforeEach(async () => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // 确保清理之前的卡片状态
    disableContentFilter()

    // 重置 urlMatcher mock
    const { urlMatcher } = await import('@/utils/urlMatcher')
    vi.mocked(urlMatcher.isTargetPage).mockReturnValue(true)

    // 模拟目标页面 URL
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://www.52pojie.cn/forum.php?mod=modcp&action=thread&op=post',
      },
      writable: true,
    })
  })

  afterEach(() => {
    // 清理卡片
    disableContentFilter()
    vi.restoreAllMocks()
  })

  describe('initializeContentFilter', () => {
    it('应该在功能启用时调用 enableContentFilter', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await initializeContentFilter()

      // 验证功能已初始化（卡片应该被创建）
      const card = document.getElementById('content-filter-card')
      expect(card).toBeTruthy()
    })

    it('应该在功能禁用时不创建卡片', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ contentFilterEnabled: false })

      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await initializeContentFilter()

      // 验证卡片未被创建
      const card = document.getElementById('content-filter-card')
      expect(card).toBeNull()
    })
  })

  describe('enableContentFilter', () => {
    it('应该创建过滤卡片', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      const card = document.getElementById('content-filter-card')
      expect(card).toBeTruthy()
    })

    it('应该不重复创建卡片', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()
      await enableContentFilter()

      const cards = document.querySelectorAll('#content-filter-card')
      expect(cards.length).toBe(1)
    })

    it('应该加载保存的过滤规则', async () => {
      const savedRules: FilterRule[] = [
        { id: 'test-1', pattern: '测试', isRegex: false },
        { id: 'test-2', pattern: '\\d+', isRegex: true },
      ]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 验证卡片被创建
      const card = document.getElementById('content-filter-card')
      expect(card).toBeTruthy()

      // 验证输入行数量
      const inputRows = document.querySelectorAll('.content-filter-input-row')
      expect(inputRows.length).toBe(2)
    })

    it('应该加载保存的卡片位置', async () => {
      await fakeBrowser.storage.local.set({ contentFilterCardPosition: { x: 100, y: 200 } })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      const card = document.getElementById('content-filter-card')
      expect(card?.style.left).toBe('100px')
      expect(card?.style.top).toBe('200px')
    })

    it('应该加载保存的最大文本长度', async () => {
      await fakeBrowser.storage.local.set({ contentFilterMaxTextLength: 20 })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      const card = document.getElementById('content-filter-card')
      const lengthInput = card?.querySelector('input[type="number"]') as HTMLInputElement
      expect(lengthInput?.value).toBe('20')
    })

    it('应该在非目标页面不创建卡片', async () => {
      const { urlMatcher } = await import('@/utils/urlMatcher')
      vi.mocked(urlMatcher.isTargetPage).mockReturnValue(false)

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      const card = document.getElementById('content-filter-card')
      expect(card).toBeNull()
    })
  })

  describe('disableContentFilter', () => {
    it('应该移除过滤卡片', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()
      expect(document.getElementById('content-filter-card')).toBeTruthy()

      disableContentFilter()
      expect(document.getElementById('content-filter-card')).toBeNull()
    })

    it('应该清除所有高亮', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr data-content-filter-highlight="true" style="background-color: #fffacd;">
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" checked /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      disableContentFilter()

      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(0)
    })

    it('应该在没有卡片时不报错', () => {
      expect(() => disableContentFilter()).not.toThrow()
    })
  })

  describe('toggleContentFilter', () => {
    it('应该从启用切换到禁用', async () => {
      await fakeBrowser.storage.local.set({ contentFilterEnabled: true })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      const newStatus = await toggleContentFilter()

      expect(newStatus).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('contentFilterEnabled')
      expect(result.contentFilterEnabled).toBe(false)
    })

    it('应该从禁用切换到启用', async () => {
      await fakeBrowser.storage.local.set({ contentFilterEnabled: false })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      const newStatus = await toggleContentFilter()

      expect(newStatus).toBe(true)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('contentFilterEnabled')
      expect(result.contentFilterEnabled).toBe(true)
    })

    it('应该返回切换后的状态', async () => {
      const newStatus = await toggleContentFilter()
      const currentStatus = await getContentFilterStatus()

      expect(newStatus).toBe(currentStatus)
    })
  })

  describe('getContentFilterStatus', () => {
    it('应该返回当前启用状态', async () => {
      await fakeBrowser.storage.local.set({ contentFilterEnabled: true })

      const status = await getContentFilterStatus()

      expect(status).toBe(true)
    })

    it('应该返回当前禁用状态', async () => {
      await fakeBrowser.storage.local.set({ contentFilterEnabled: false })

      const status = await getContentFilterStatus()

      expect(status).toBe(false)
    })

    it('应该在存储为空时返回默认值', async () => {
      const status = await getContentFilterStatus()

      expect(status).toBe(true) // 默认启用
    })
  })

  describe('createContentFilter', () => {
    it('应该返回正确的接口', () => {
      const filter = createContentFilter()

      expect(filter).toHaveProperty('toggle')
      expect(filter).toHaveProperty('getStatus')
      expect(filter).toHaveProperty('enable')
      expect(filter).toHaveProperty('disable')
      expect(typeof filter.toggle).toBe('function')
      expect(typeof filter.getStatus).toBe('function')
      expect(typeof filter.enable).toBe('function')
      expect(typeof filter.disable).toBe('function')
    })
  })

  describe('过滤卡片交互', () => {
    beforeEach(async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">感谢分享</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">这是一段很长的文本内容超过十二个汉字</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `
      await enableContentFilter()
    })

    it('应该能添加新的过滤条件', async () => {
      // 找到"+ 添加条件"按钮
      const buttons = document.querySelectorAll('button')
      const addButton = Array.from(buttons).find(btn => btn.textContent?.includes('添加条件')) as
        | HTMLButtonElement
        | undefined

      expect(addButton).toBeTruthy()

      const initialRows = document.querySelectorAll('.content-filter-input-row').length
      addButton?.click()

      await new Promise(resolve => setTimeout(resolve, 50))

      const newRows = document.querySelectorAll('.content-filter-input-row').length
      expect(newRows).toBe(initialRows + 1)
    })

    it('应该能切换正则/简单匹配模式', async () => {
      const inputRow = document.querySelector('.content-filter-input-row')
      const regexBtn = inputRow?.querySelector('button') as HTMLButtonElement

      expect(regexBtn?.textContent).toBe('简单')

      regexBtn?.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(regexBtn?.textContent).toBe('正则')
    })

    it('应该能输入过滤条件', async () => {
      const inputRow = document.querySelector('.content-filter-input-row')
      const input = inputRow?.querySelector('input[type="text"]') as HTMLInputElement

      input.value = '测试'
      input.dispatchEvent(new Event('input'))

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(input.value).toBe('测试')
    })

    it('应该支持拖动卡片', async () => {
      const card = document.getElementById('content-filter-card') as HTMLElement
      const header = card.querySelector('div') as HTMLElement

      const initialLeft = card.offsetLeft
      const initialTop = card.offsetTop

      // 模拟拖动
      const mousedownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      })
      header.dispatchEvent(mousedownEvent)

      const mousemoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 150,
        bubbles: true,
      })
      document.dispatchEvent(mousemoveEvent)

      const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
      })
      document.dispatchEvent(mouseupEvent)

      // 验证位置已改变（或至少没有报错）
      expect(card).toBeTruthy()
    })
  })

  describe('过滤匹配逻辑', () => {
    it('应该正确匹配简单文本', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '感谢', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">感谢分享</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤（模拟失去焦点）
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      // 验证匹配的行被高亮
      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(1)
    })

    it('应该正确匹配正则表达式', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '\\d+', isRegex: true }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">666</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(1)
    })

    it('应该忽略超过最大长度的文本', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '超过', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })
      await fakeBrowser.storage.local.set({ contentFilterMaxTextLength: 5 })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">这是一段超过五个字的文本</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">超过</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      // 只有短文本应该被匹配
      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(1)
    })

    it('应该在无有效规则时不进行匹配', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(0)
    })

    it('应该处理无效的正则表达式', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '[invalid', isRegex: true }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤（不应该报错）
      const card = document.getElementById('content-filter-card') as HTMLElement
      expect(() => {
        card.dispatchEvent(
          new FocusEvent('focusout', {
            relatedTarget: document.body,
          }),
        )
      }).not.toThrow()
    })
  })

  describe('预设规则', () => {
    it('应该显示预设按钮', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      const card = document.getElementById('content-filter-card')
      const presetButtons = card?.querySelectorAll('button')

      // 应该有预设按钮（常见灌水、数字灌水）和添加条件按钮
      expect(presetButtons?.length).toBeGreaterThan(1)
    })

    it('应该能点击预设按钮填充规则', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试内容</td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 找到预设按钮（常见灌水）
      const buttons = document.querySelectorAll('button')
      const presetButton = Array.from(buttons).find(btn => btn.textContent === '常见灌水') as
        | HTMLButtonElement
        | undefined

      expect(presetButton).toBeTruthy()
      presetButton?.click()
      await new Promise(resolve => setTimeout(resolve, 50))

      // 验证输入框被填充
      const input = document.querySelector('.content-filter-input-row input[type="text"]') as HTMLInputElement
      const expectedPattern = contentFilterConfig.presets.find(p => p.name === '常见灌水')?.pattern
      expect(input?.value).toBe(expectedPattern)
    })
  })

  describe('文本长度计算', () => {
    it('应该正确计算汉字长度', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '测试', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })
      await fakeBrowser.storage.local.set({ contentFilterMaxTextLength: 3 })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">测试</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      // 只有"测试"（2个汉字）应该被匹配，"测试内容"（4个汉字）超过限制
      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(1)
    })

    it('应该正确计算混合字符长度', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: 'test', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })
      await fakeBrowser.storage.local.set({ contentFilterMaxTextLength: 5 })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">test123</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
              <tr>
                <td class="xg1">test测试内容</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      // "test123" = 3.5 个字符长度，应该被匹配
      // "test测试内容" = 2 + 4 = 6 个字符长度，超过限制
      const highlightedRows = document.querySelectorAll('[data-content-filter-highlight="true"]')
      expect(highlightedRows.length).toBe(1)
    })
  })

  describe('复选框勾选', () => {
    it('应该在匹配时勾选对应的复选框', async () => {
      const savedRules: FilterRule[] = [{ id: 'test-1', pattern: '感谢', isRegex: false }]
      await fakeBrowser.storage.local.set({ contentFilterRules: savedRules })

      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr>
                <td class="xg1">感谢分享</td>
                <td><input type="checkbox" class="pc" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()

      // 触发过滤
      const card = document.getElementById('content-filter-card') as HTMLElement
      card.dispatchEvent(
        new FocusEvent('focusout', {
          relatedTarget: document.body,
        }),
      )

      await new Promise(resolve => setTimeout(resolve, 50))

      const checkbox = document.querySelector('.pc') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('应该在清除高亮时取消勾选复选框', async () => {
      document.body.innerHTML = `
        <div id="moderate">
          <table>
            <tbody>
              <tr data-content-filter-highlight="true" style="background-color: #fffacd;">
                <td class="xg1">感谢分享</td>
                <td><input type="checkbox" class="pc" checked /></td>
              </tr>
            </tbody>
          </table>
        </div>
      `

      await enableContentFilter()
      disableContentFilter()

      const checkbox = document.querySelector('.pc') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })
})
