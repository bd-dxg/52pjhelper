import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createTableSelector } from '@/utils/tableSelector'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn().mockReturnValue(true),
  },
}))

describe('tableSelector', () => {
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
      const manager = createTableSelector()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载隐藏分表索引', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        tableSelectorEnabled: true,
        hiddenTableIndexes: [1, 2],
      })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getHiddenTableIndexes()).toEqual([1, 2])
      })
    })

    it('应该在初始化时注入样式（当功能默认启用）', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式已注入
      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.table-btn-container')
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('tableSelectorEnabled')
      expect(result.tableSelectorEnabled).toBe(false)
    })

    it('应该在禁用时移除样式', async () => {
      const manager = createTableSelector()

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

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

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
      const manager = createTableSelector()

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

    it('应该返回切换后的状态', async () => {
      const manager = createTableSelector()

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
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('隐藏分表索引', () => {
    it('应该返回默认隐藏分表索引', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      expect(manager.getHiddenTableIndexes()).toEqual([3, 4, 5, 6])
    })

    it('应该返回自定义隐藏分表索引', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({
        tableSelectorEnabled: true,
        hiddenTableIndexes: [0, 1],
      })

      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getHiddenTableIndexes()).toEqual([0, 1])
      })
    })

    it('应该返回索引的副本而不是引用', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      const indexes1 = manager.getHiddenTableIndexes()
      const indexes2 = manager.getHiddenTableIndexes()

      // 验证返回的是副本
      expect(indexes1).not.toBe(indexes2)
      expect(indexes1).toEqual(indexes2)
    })
  })

  describe('样式注入', () => {
    it('应该注入正确的容器样式', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证样式内容
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.table-btn-container')
      expect(styleElement?.textContent).toContain('display: flex')
    })

    it('应该注入按钮激活样式', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证激活样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('.table-btn-active')
      expect(styleElement?.textContent).toContain('#ffbd10')
    })

    it('应该隐藏原始选择器', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证原始选择器隐藏样式
      const styleElement = document.querySelector('style')
      expect(styleElement?.textContent).toContain('#posttableid_ctrl')
      expect(styleElement?.textContent).toContain('display: none')
    })

    it('不应该重复注入样式', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      const firstStyleCount = document.querySelectorAll('style').length

      // 再次启用（实际上已经启用，应该直接返回）
      await manager.enable()

      const secondStyleCount = document.querySelectorAll('style').length
      expect(firstStyleCount).toBe(secondStyleCount)
    })
  })

  describe('启用功能', () => {
    it(
      '应该正确启用功能',
      async () => {
        // 预设存储值为禁用
        await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

        // 创建必要的 DOM 结构（避免 waitForElement 超时）
        document.body.innerHTML = `
        <form method="post">
          <span class="ftid">
            <select name="posttableid" id="posttableid">
              <option value="0"></option>
            </select>
            <a href="javascript:;" id="posttableid_ctrl">post_0</a>
          </span>
          <button type="submit" id="searchsubmit">提交</button>
        </form>
        <div id="posttableid_ctrl_menu">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
          </ul>
        </div>
      `

        const manager = createTableSelector()

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(manager.getStatus()).toBe(false)

        // 启用功能
        await manager.enable()

        // 验证状态已更新
        expect(manager.getStatus()).toBe(true)

        // 验证存储已更新
        const result = await fakeBrowser.storage.local.get('tableSelectorEnabled')
        expect(result.tableSelectorEnabled).toBe(true)
      },
      10000,
    ) // 增加超时时间到 10 秒

    it(
      '应该在启用时注入样式',
      async () => {
        // 预设存储值为禁用
        await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

        // 创建必要的 DOM 结构
        document.body.innerHTML = `
        <form method="post">
          <span class="ftid">
            <select name="posttableid" id="posttableid">
              <option value="0"></option>
            </select>
            <a href="javascript:;" id="posttableid_ctrl">post_0</a>
          </span>
          <button type="submit" id="searchsubmit">提交</button>
        </form>
        <div id="posttableid_ctrl_menu">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
          </ul>
        </div>
      `

        const manager = createTableSelector()

        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 100))
        expect(manager.getStatus()).toBe(false)

        // 验证样式未注入
        expect(document.querySelector('style')).toBeFalsy()

        // 启用功能
        await manager.enable()

        // 验证样式已注入
        expect(document.querySelector('style')).toBeTruthy()
      },
      10000,
    ) // 增加超时时间到 10 秒

    it('应该在已启用时不重复启用', async () => {
      const manager = createTableSelector()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 再次启用
      await manager.enable()

      // 验证状态仍然是启用
      expect(manager.getStatus()).toBe(true)
    })
  })

  describe('DOM 操作', () => {
    beforeEach(() => {
      // 创建完整的 DOM 结构
      document.body.innerHTML = `
        <form method="post" autocomplete="off" action="forum.php?mod=modcp&amp;action=thread&amp;op=post">
          <div class="exfm">
            <table cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <th>帖子分表:</th>
                  <td colspan="3">
                    <span class="ftid">
                      <select name="posttableid" id="posttableid" class="ps" selecti="0" style="display: none;">
                        <option value="0"></option>
                      </select>
                      <a href="javascript:;" id="posttableid_ctrl" style="width:70px" tabindex="1">post_0</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td colspan="3">
                    <button type="submit" name="searchsubmit" id="searchsubmit" class="pn" value="true">
                      <strong>提交</strong>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <div id="posttableid_ctrl_menu" style="display: none;">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
            <li>post_2</li>
            <li>post_3</li>
            <li>post_4</li>
            <li>post_5</li>
            <li>post_6</li>
            <li>post_7</li>
            <li>post_8</li>
            <li>post_9</li>
            <li>post_10</li>
            <li>post_11</li>
          </ul>
        </div>
      `
    })

    it('应该创建按钮容器', async () => {
      const manager = createTableSelector()

      // 等待初始化和 DOM 操作完成
      await vi.waitFor(
        () => {
          const container = document.querySelector('.table-btn-container')
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )
    })

    it('应该创建左右两个容器', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const leftBox = document.querySelector('.table-btn-left')
          const rightBox = document.querySelector('.table-btn-right')
          expect(leftBox).toBeTruthy()
          expect(rightBox).toBeTruthy()
        },
        { timeout: 6000 },
      )
    })

    it('应该根据隐藏配置过滤分表按钮', async () => {
      const manager = createTableSelector()

      // 默认隐藏 [3, 4, 5, 6]，总共 12 个分表，应该显示 8 个
      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          expect(buttons.length).toBe(8)
        },
        { timeout: 6000 },
      )
    })

    it('第一个和最后一个按钮应该在左侧容器', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const leftBox = document.querySelector('.table-btn-left')
          const leftButtons = leftBox?.querySelectorAll('button')
          expect(leftButtons?.length).toBe(2)
          expect(leftButtons?.[0].textContent).toBe('post_0')
          expect(leftButtons?.[1].textContent).toBe('post_11')
        },
        { timeout: 6000 },
      )
    })

    it('其他按钮应该在右侧容器', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const rightBox = document.querySelector('.table-btn-right')
          const rightButtons = rightBox?.querySelectorAll('button')
          // 8 个可见按钮 - 2 个左侧 = 6 个右侧
          expect(rightButtons?.length).toBe(6)
        },
        { timeout: 6000 },
      )
    })

    it('按钮应该包含正确的 data-index 属性', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          buttons.forEach(button => {
            expect(button.getAttribute('data-index')).toBeTruthy()
          })
        },
        { timeout: 6000 },
      )
    })

    it('应该设置容器的 data-feature-id 属性', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const container = document.querySelector('[data-feature-id="table-selector-container"]')
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )
    })

    it('禁用时应该清理所有注入的容器', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const container = document.querySelector('.table-btn-container')
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )

      await manager.disable()

      const containers = document.querySelectorAll('[data-feature-id="table-selector-container"]')
      expect(containers.length).toBe(0)
    })

    it('禁用时应该恢复原始选择器显示', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const container = document.querySelector('.table-btn-container')
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )

      await manager.disable()

      const postTableCtrl = document.querySelector('#posttableid_ctrl') as HTMLElement
      expect(postTableCtrl).toBeTruthy()
      expect(postTableCtrl.style.display).toBe('')
    })
  })

  describe('按钮点击事件', () => {
    beforeEach(() => {
      // 创建完整的 DOM 结构
      document.body.innerHTML = `
        <form method="post" autocomplete="off" action="forum.php?mod=modcp&amp;action=thread&amp;op=post">
          <div class="exfm">
            <table cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <th>帖子分表:</th>
                  <td colspan="3">
                    <span class="ftid">
                      <select name="posttableid" id="posttableid" class="ps" selecti="0" style="display: none;">
                        <option value="0"></option>
                      </select>
                      <a href="javascript:;" id="posttableid_ctrl" style="width:70px" tabindex="1">post_0</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td colspan="3">
                    <button type="submit" name="searchsubmit" id="searchsubmit" class="pn" value="true">
                      <strong>提交</strong>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <div id="posttableid_ctrl_menu" style="display: none;">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
            <li>post_2</li>
            <li>post_3</li>
            <li>post_4</li>
            <li>post_5</li>
            <li>post_6</li>
            <li>post_7</li>
            <li>post_8</li>
            <li>post_9</li>
            <li>post_10</li>
            <li>post_11</li>
          </ul>
        </div>
      `
    })

    it('点击按钮应该添加高亮样式', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
          expect(button).toBeTruthy()
        },
        { timeout: 6000 },
      )

      const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
      button.click()

      expect(button.classList.contains('table-btn-active')).toBe(true)
    })

    it('点击按钮应该移除其他按钮的高亮', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          expect(buttons.length).toBeGreaterThan(1)
        },
        { timeout: 6000 },
      )

      const buttons = document.querySelectorAll('.table-btn-container button')
      const firstButton = buttons[0] as HTMLButtonElement
      const secondButton = buttons[1] as HTMLButtonElement

      firstButton.click()
      expect(firstButton.classList.contains('table-btn-active')).toBe(true)

      secondButton.click()
      expect(firstButton.classList.contains('table-btn-active')).toBe(false)
      expect(secondButton.classList.contains('table-btn-active')).toBe(true)
    })

    it('点击按钮应该更新 select 元素的值', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
          expect(button).toBeTruthy()
        },
        { timeout: 6000 },
      )

      const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
      const select = document.querySelector('#posttableid') as HTMLSelectElement

      button.click()

      const tableName = button.textContent?.split('post_')[1]
      const option = select.querySelector('option')
      expect(option?.value).toBe(tableName)
    })

    it('点击按钮应该触发搜索提交', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
          expect(button).toBeTruthy()
        },
        { timeout: 6000 },
      )

      const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
      const clickSpy = vi.spyOn(searchSubmit, 'click')

      const button = document.querySelector('.table-btn-container button') as HTMLButtonElement
      button.click()

      expect(clickSpy).toHaveBeenCalled()
    })

    it('点击非按钮元素不应该触发事件', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const container = document.querySelector('.table-btn-container') as HTMLDivElement
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )

      const container = document.querySelector('.table-btn-container') as HTMLDivElement
      const searchSubmit = document.querySelector('#searchsubmit') as HTMLButtonElement
      const clickSpy = vi.spyOn(searchSubmit, 'click')

      // 直接点击容器
      container.click()

      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('设置隐藏分表索引', () => {
    beforeEach(() => {
      // 创建完整的 DOM 结构
      document.body.innerHTML = `
        <form method="post" autocomplete="off" action="forum.php?mod=modcp&amp;action=thread&amp;op=post">
          <div class="exfm">
            <table cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <th>帖子分表:</th>
                  <td colspan="3">
                    <span class="ftid">
                      <select name="posttableid" id="posttableid" class="ps" selecti="0" style="display: none;">
                        <option value="0"></option>
                      </select>
                      <a href="javascript:;" id="posttableid_ctrl" style="width:70px" tabindex="1">post_0</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td colspan="3">
                    <button type="submit" name="searchsubmit" id="searchsubmit" class="pn" value="true">
                      <strong>提交</strong>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <div id="posttableid_ctrl_menu" style="display: none;">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
            <li>post_2</li>
            <li>post_3</li>
            <li>post_4</li>
            <li>post_5</li>
            <li>post_6</li>
            <li>post_7</li>
            <li>post_8</li>
            <li>post_9</li>
            <li>post_10</li>
            <li>post_11</li>
          </ul>
        </div>
      `
    })

    it('应该设置新的隐藏索引', async () => {
      const manager = createTableSelector()

      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.setHiddenTableIndexes([0, 1, 2])

      expect(manager.getHiddenTableIndexes()).toEqual([0, 1, 2])
    })

    it('设置隐藏索引应该保存到存储', async () => {
      const manager = createTableSelector()

      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      await manager.setHiddenTableIndexes([7, 8, 9])

      const result = await fakeBrowser.storage.local.get('hiddenTableIndexes')
      expect(result.hiddenTableIndexes).toEqual([7, 8, 9])
    })

    it('更新隐藏索引应该重新创建按钮（当功能启用时）', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          expect(buttons.length).toBe(8) // 默认隐藏 4 个，显示 8 个
        },
        { timeout: 6000 },
      )

      // 修改隐藏索引，隐藏更少的分表
      await manager.setHiddenTableIndexes([3, 4])

      await vi.waitFor(
        () => {
          const newButtons = document.querySelectorAll('.table-btn-container button')
          expect(newButtons.length).toBe(10) // 隐藏 2 个，显示 10 个
        },
        { timeout: 6000 },
      )
    })

    it('更新隐藏索引应该清理旧容器', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const container = document.querySelector('.table-btn-container')
          expect(container).toBeTruthy()
        },
        { timeout: 6000 },
      )

      await manager.setHiddenTableIndexes([1, 2])

      await vi.waitFor(
        () => {
          const containers = document.querySelectorAll('[data-feature-id="table-selector-container"]')
          expect(containers.length).toBe(1)
        },
        { timeout: 6000 },
      )
    })

    it('功能禁用时更新隐藏索引不应该创建按钮', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ tableSelectorEnabled: false })

      const manager = createTableSelector()

      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      await manager.setHiddenTableIndexes([1, 2])

      // 等待一段时间确保不会创建按钮
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = document.querySelector('.table-btn-container')
      expect(container).toBeNull()
    })
  })

  describe('当前选中状态高亮', () => {
    beforeEach(() => {
      // 创建完整的 DOM 结构
      document.body.innerHTML = `
        <form method="post" autocomplete="off" action="forum.php?mod=modcp&amp;action=thread&amp;op=post">
          <div class="exfm">
            <table cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <th>帖子分表:</th>
                  <td colspan="3">
                    <span class="ftid">
                      <select name="posttableid" id="posttableid" class="ps" selecti="0" style="display: none;">
                        <option value="2"></option>
                      </select>
                      <a href="javascript:;" id="posttableid_ctrl" style="width:70px" tabindex="1">post_2</a>
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td colspan="3">
                    <button type="submit" name="searchsubmit" id="searchsubmit" class="pn" value="true">
                      <strong>提交</strong>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <div id="posttableid_ctrl_menu" style="display: none;">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
            <li>post_2</li>
            <li>post_3</li>
            <li>post_4</li>
            <li>post_5</li>
            <li>post_6</li>
            <li>post_7</li>
            <li>post_8</li>
            <li>post_9</li>
            <li>post_10</li>
            <li>post_11</li>
          </ul>
        </div>
      `
    })

    it('应该高亮当前选中的分表', async () => {
      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          const activeButton = Array.from(buttons).find(btn => btn.classList.contains('table-btn-active'))
          expect(activeButton?.textContent).toBe('post_2')
        },
        { timeout: 6000 },
      )
    })

    it('如果当前选中的分表被隐藏，不应该高亮任何按钮', async () => {
      // 修改 select 值为被隐藏的分表
      const select = document.querySelector('#posttableid') as HTMLSelectElement
      select.value = '3' // 默认配置中 3 是被隐藏的

      const manager = createTableSelector()

      await vi.waitFor(
        () => {
          const buttons = document.querySelectorAll('.table-btn-container button')
          expect(buttons.length).toBeGreaterThan(0)
        },
        { timeout: 6000 },
      )

      const activeButtons = document.querySelectorAll('.table-btn-container button.table-btn-active')
      expect(activeButtons.length).toBe(0)
    })
  })

  describe('非目标页面行为', () => {
    it('在非目标页面不应该初始化按钮', async () => {
      // Mock urlMatcher 返回 false
      const { urlMatcher } = await import('@/utils/urlMatcher')
      vi.mocked(urlMatcher.isTargetPage).mockReturnValue(false)

      // 创建完整的 DOM 结构
      document.body.innerHTML = `
        <form method="post" autocomplete="off" action="forum.php?mod=modcp&amp;action=thread&amp;op=post">
          <div class="exfm">
            <table cellspacing="0" cellpadding="0">
              <tbody>
                <tr>
                  <th>帖子分表:</th>
                  <td colspan="3">
                    <span class="ftid">
                      <select name="posttableid" id="posttableid" class="ps" selecti="0" style="display: none;">
                        <option value="0"></option>
                      </select>
                      <a href="javascript:;" id="posttableid_ctrl" style="width:70px" tabindex="1">post_0</a>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </form>

        <div id="posttableid_ctrl_menu" style="display: none;">
          <ul>
            <li>post_0</li>
            <li>post_1</li>
            <li>post_2</li>
          </ul>
        </div>
      `

      const manager = createTableSelector()

      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待一段时间确保不会创建按钮
      await new Promise(resolve => setTimeout(resolve, 100))

      const container = document.querySelector('.table-btn-container')
      expect(container).toBeNull()

      // 恢复 mock
      vi.mocked(urlMatcher.isTargetPage).mockReturnValue(true)
    })

    it('在非目标页面仍然应该注入样式', async () => {
      // Mock urlMatcher 返回 false
      const { urlMatcher } = await import('@/utils/urlMatcher')
      vi.mocked(urlMatcher.isTargetPage).mockReturnValue(false)

      const manager = createTableSelector()

      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      const styleElement = document.querySelector('style')
      expect(styleElement).toBeTruthy()
      expect(styleElement?.textContent).toContain('.table-btn-container')

      // 恢复 mock
      vi.mocked(urlMatcher.isTargetPage).mockReturnValue(true)
    })
  })
})
