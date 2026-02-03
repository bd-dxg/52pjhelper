import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  loadQuickReplyConfig,
  saveQuickReplyConfig,
  initQuickReply,
  cleanupQuickReply,
} from '@/utils/quickReply'
import quickReplyConfig from '@/configs/quickReply.json'

describe('quickReply', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: 'https://www.52pojie.cn/forum.php?mod=modcp&action=report' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadQuickReplyConfig', () => {
    it('应该从存储中加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ quickReplyEnabled: false })

      const enabled = await loadQuickReplyConfig()

      expect(enabled).toBe(false)
    })

    it('应该在存储为空时返回默认值', async () => {
      const enabled = await loadQuickReplyConfig()

      expect(enabled).toBe(quickReplyConfig.defaultEnabled)
    })
  })

  describe('saveQuickReplyConfig', () => {
    it('应该保存配置到存储', async () => {
      await saveQuickReplyConfig(false)

      const result = await fakeBrowser.storage.local.get('quickReplyEnabled')
      expect(result.quickReplyEnabled).toBe(false)
    })

    it('应该能够保存 true 值', async () => {
      await saveQuickReplyConfig(true)

      const result = await fakeBrowser.storage.local.get('quickReplyEnabled')
      expect(result.quickReplyEnabled).toBe(true)
    })
  })

  describe('initQuickReply', () => {
    it('应该在目标页面初始化快捷回复功能', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('#list_modcp_logs')

      // 验证下拉框已添加
      const select = document.querySelector('.quick-reply-select')
      expect(select).toBeTruthy()
    })

    it('应该在非目标页面不初始化', () => {
      // 修改 URL 为非目标页面
      Object.defineProperty(window, 'location', {
        value: { href: 'https://www.52pojie.cn/forum-1.html' },
        writable: true,
        configurable: true,
      })

      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证样式未注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeFalsy()

      // 验证下拉框未添加
      const select = document.querySelector('.quick-reply-select')
      expect(select).toBeFalsy()
    })

    it('应该在没有输入框时不添加下拉框', () => {
      // 创建测试 DOM（没有输入框）
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()

      // 验证下拉框未添加
      const select = document.querySelector('.quick-reply-select')
      expect(select).toBeFalsy()
    })

    it('应该为每个输入框添加下拉框', () => {
      // 创建测试 DOM（多个输入框）
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证所有输入框都有下拉框
      const selects = document.querySelectorAll('.quick-reply-select')
      expect(selects.length).toBe(3)
    })

    it('应该不重复添加下拉框', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      // 第一次初始化
      initQuickReply()

      // 验证下拉框已添加
      let selects = document.querySelectorAll('.quick-reply-select')
      expect(selects.length).toBe(1)

      // 第二次初始化
      initQuickReply()

      // 验证下拉框数量没有增加
      selects = document.querySelectorAll('.quick-reply-select')
      expect(selects.length).toBe(1)
    })

    it('应该包含所有配置的选项', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证下拉框包含所有选项
      const select = document.querySelector('.quick-reply-select') as HTMLSelectElement
      expect(select.options.length).toBe(quickReplyConfig.options.length)

      // 验证每个选项的值和文本
      quickReplyConfig.options.forEach((option, index) => {
        expect(select.options[index].value).toBe(option.value)
        expect(select.options[index].textContent).toBe(option.text)
        expect(select.options[index].title).toBe(option.title)
      })
    })

    it('应该在选择选项时更新输入框的值', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      const select = document.querySelector('.quick-reply-select') as HTMLSelectElement
      const input = document.querySelector('input') as HTMLInputElement

      // 选择第一个选项（"已经处理!"）
      select.selectedIndex = 2 // 跳过"去举报区"和"自定义"
      select.dispatchEvent(new Event('change', { bubbles: true }))

      // 验证输入框的值已更新
      expect(input.value).toBe(quickReplyConfig.options[2].title)
    })

    it('应该在选择"去举报区"时生成特殊格式的回复', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td>
                <a href="https://www.52pojie.cn/thread-12345-1-1.html">举报链接</a>
              </td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      const select = document.querySelector('.quick-reply-select') as HTMLSelectElement
      const input = document.querySelector('input') as HTMLInputElement

      // 选择"去举报区"选项
      select.selectedIndex = 0
      select.dispatchEvent(new Event('change', { bubbles: true }))

      // 验证输入框的值包含举报地址
      expect(input.value).toContain('举报地址:')
      expect(input.value).toContain('https://www.52pojie.cn/thread-12345-1-1.html')
      expect(input.value).toContain(quickReplyConfig.options[0].title)
    })

    it('应该在选择"去举报区"但没有链接时使用空字符串', () => {
      // 创建测试 DOM（没有链接）
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      const select = document.querySelector('.quick-reply-select') as HTMLSelectElement
      const input = document.querySelector('input') as HTMLInputElement

      // 选择"去举报区"选项
      select.selectedIndex = 0
      select.dispatchEvent(new Event('change', { bubbles: true }))

      // 验证输入框的值包含举报地址（但链接为空）
      expect(input.value).toContain('举报地址:')
      expect(input.value).toContain(quickReplyConfig.options[0].title)
    })

    it('应该在没有输入框时不更新值', () => {
      // 创建测试 DOM（下拉框的父元素没有输入框）
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      const select = document.querySelector('.quick-reply-select') as HTMLSelectElement

      // 移除输入框
      const input = document.querySelector('input') as HTMLInputElement
      input.remove()

      // 选择选项
      select.selectedIndex = 2
      select.dispatchEvent(new Event('change', { bubbles: true }))

      // 验证没有报错（因为没有输入框）
      expect(true).toBe(true)
    })
  })

  describe('cleanupQuickReply', () => {
    it('应该移除所有下拉框', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证下拉框已添加
      let selects = document.querySelectorAll('.quick-reply-select')
      expect(selects.length).toBe(2)

      // 清理
      cleanupQuickReply()

      // 验证下拉框已移除
      selects = document.querySelectorAll('.quick-reply-select')
      expect(selects.length).toBe(0)
    })

    it('应该在没有下拉框时不报错', () => {
      // 清理（没有下拉框）
      cleanupQuickReply()

      // 验证没有报错
      expect(true).toBe(true)
    })
  })

  describe('样式注入', () => {
    it('应该注入响应式样式', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()

      // 验证样式包含媒体查询
      expect(styleElement?.textContent).toContain('@media screen and (max-width: 768px)')
      expect(styleElement?.textContent).toContain('@media screen and (min-width: 768px) and (max-width:1100px)')
      expect(styleElement?.textContent).toContain('@media screen and (min-width: 1100px)')
    })

    it('应该注入下拉框选项样式', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table id="list_modcp_logs">
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <input type="text" />
              </td>
            </tr>
          </tbody>
        </table>
      `

      initQuickReply()

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()

      // 验证样式包含下拉框选项样式
      expect(styleElement?.textContent).toContain('.quick-reply-select option')
      expect(styleElement?.textContent).toContain('text-overflow: ellipsis')
    })
  })
})
