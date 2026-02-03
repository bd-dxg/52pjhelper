import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createFloorHighlighter } from '@/utils/floorHighlighter'

describe('floorHighlighter', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Mock window.location.href（包含楼层 ID）
    Object.defineProperty(window, 'location', {
      value: { href: 'https://www.52pojie.cn/thread-12345-1-1.html?pid67890' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该在创建时自动初始化', async () => {
      const manager = createFloorHighlighter()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时高亮目标楼层（当功能默认启用）', async () => {
      // 创建测试 DOM（正确的结构）
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 等待一段时间确保高亮已应用
      await new Promise(resolve => setTimeout(resolve, 100))

      // 验证楼层已高亮
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('rgb(255 152 0 / 20%)')
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

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
      const result = await fakeBrowser.storage.local.get('floorHighlighterEnabled')
      expect(result.floorHighlighterEnabled).toBe(true)
    })

    it('应该在启用时高亮目标楼层', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 等待一段时间确保初始化完全完成
      await new Promise(resolve => setTimeout(resolve, 100))

      // 启用功能
      await manager.enable()

      // 验证楼层已高亮
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('rgb(255 152 0 / 20%)')
    })

    it('应该在已启用时不重复启用', async () => {
      const manager = createFloorHighlighter()

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

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('floorHighlighterEnabled')
      expect(result.floorHighlighterEnabled).toBe(false)
    })

    it('应该在禁用时移除高亮', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table>
          <tbody style="background-color: rgb(255 152 0 / 20%);">
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证高亮已移除
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('')
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

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
      const manager = createFloorHighlighter()

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
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

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
      const manager = createFloorHighlighter()

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
      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ floorHighlighterEnabled: false })

      const manager = createFloorHighlighter()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('高亮目标楼层', () => {
    it('应该高亮指定的楼层', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用高亮方法
      manager.highlightTargetFloor()

      // 验证楼层已高亮
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('rgb(255 152 0 / 20%)')
    })

    it('应该在 URL 没有楼层 ID 时不高亮', () => {
      // 修改 URL（没有楼层 ID）
      Object.defineProperty(window, 'location', {
        value: { href: 'https://www.52pojie.cn/thread-12345-1-1.html' },
        writable: true,
        configurable: true,
      })

      // 创建测试 DOM
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用高亮方法
      manager.highlightTargetFloor()

      // 验证楼层未高亮
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('')
    })

    it('应该在找不到目标楼层时不报错', () => {
      // 创建测试 DOM（没有目标楼层）
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum99999">其他楼层</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用高亮方法
      manager.highlightTargetFloor()

      // 验证没有报错
      expect(true).toBe(true)
    })
  })

  describe('移除高亮', () => {
    it('应该移除指定楼层的高亮', () => {
      // 创建测试 DOM（已高亮）
      document.body.innerHTML = `
        <table>
          <tbody style="background-color: rgb(255 152 0 / 20%);">
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用移除高亮方法
      manager.removeHighlight()

      // 验证高亮已移除
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('')
    })

    it('应该在 URL 没有楼层 ID 时不移除高亮', () => {
      // 修改 URL（没有楼层 ID）
      Object.defineProperty(window, 'location', {
        value: { href: 'https://www.52pojie.cn/thread-12345-1-1.html' },
        writable: true,
        configurable: true,
      })

      // 创建测试 DOM（已高亮）
      document.body.innerHTML = `
        <table>
          <tbody style="background-color: rgb(255 152 0 / 20%);">
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum67890">楼层链接</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用移除高亮方法
      manager.removeHighlight()

      // 验证高亮未被移除
      const tbody = document.querySelector('tbody') as HTMLTableSectionElement
      expect(tbody.style.backgroundColor).toBe('rgb(255 152 0 / 20%)')
    })

    it('应该在找不到目标楼层时不报错', () => {
      // 创建测试 DOM（没有目标楼层）
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr>
              <td>
                <div class="plc">
                  <div class="pi">
                    <strong>
                      <a id="postnum99999">其他楼层</a>
                    </strong>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `

      const manager = createFloorHighlighter()

      // 手动调用移除高亮方法
      manager.removeHighlight()

      // 验证没有报错
      expect(true).toBe(true)
    })
  })
})
