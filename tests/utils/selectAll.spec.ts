import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createSelectAll } from '@/utils/selectAll'

// Mock urlMatcher
vi.mock('@/utils/urlMatcher', () => ({
  urlMatcher: {
    isTargetPage: vi.fn((url: string, targetPages: string[]) => {
      return targetPages.some(page => url.includes(page))
    }),
  },
}))

describe('selectAll', () => {
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
      const manager = createSelectAll()

      // 等待异步初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })

    it('应该在初始化时加载配置', async () => {
      // 预设存储值
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })

    it('应该在初始化时使用默认值（当存储为空时）', async () => {
      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true) // 默认启用
      })
    })
  })

  describe('启用功能', () => {
    it('应该正确启用功能', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

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
      const result = await fakeBrowser.storage.local.get('selectAllEnabled')
      expect(result.selectAllEnabled).toBe(true)
    })

    it('应该在启用时添加按钮', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })

      // 启用功能
      await manager.enable()

      // 验证按钮已添加
      const selectAllBtn = document.querySelector('[data-feature-id="select-all-btn"]')
      const deleteBtn = document.querySelector('[data-feature-id="select-all-delete-btn"]')
      expect(selectAllBtn).toBeTruthy()
      expect(deleteBtn).toBeTruthy()
    })

    it('应该在已启用时不重复启用', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 记录当前按钮数量
      const btnCountBefore = document.querySelectorAll('[data-feature-id^="select-all-"]').length

      // 再次启用
      await manager.enable()

      // 验证按钮数量没有增加
      const btnCountAfter = document.querySelectorAll('[data-feature-id^="select-all-"]').length
      expect(btnCountAfter).toBe(btnCountBefore)
    })
  })

  describe('禁用功能', () => {
    it('应该正确禁用功能', async () => {
      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 禁用功能
      await manager.disable()

      // 验证状态已更新
      expect(manager.getStatus()).toBe(false)

      // 验证存储已更新
      const result = await fakeBrowser.storage.local.get('selectAllEnabled')
      expect(result.selectAllEnabled).toBe(false)
    })

    it('应该在禁用时移除按钮', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证按钮已添加
      expect(document.querySelector('[data-feature-id="select-all-btn"]')).toBeTruthy()

      // 禁用功能
      await manager.disable()

      // 验证按钮已移除
      expect(document.querySelector('[data-feature-id="select-all-btn"]')).toBeFalsy()
      expect(document.querySelector('[data-feature-id="select-all-delete-btn"]')).toBeFalsy()
    })

    it('应该在已禁用时不重复禁用', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

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
      const manager = createSelectAll()

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
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

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
      const manager = createSelectAll()

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
      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })
    })

    it('应该返回当前禁用状态', async () => {
      // 预设存储值为禁用
      await fakeBrowser.storage.local.set({ selectAllEnabled: false })

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(false)
      })
    })
  })

  describe('全选按钮功能', () => {
    it('应该点击全选按钮时勾选除第一条外的所有复选框', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
        <input type="checkbox" name="delete[]" />
        <input type="checkbox" name="delete[]" />
        <input type="checkbox" name="delete[]" />
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 点击全选按钮
      const selectAllBtn = document.querySelector('[data-feature-id="select-all-btn"]') as HTMLButtonElement
      selectAllBtn.click()

      // 验证复选框状态
      const checkboxes = document.querySelectorAll('input[name="delete[]"]') as NodeListOf<HTMLInputElement>
      expect(checkboxes[0].checked).toBe(false) // 第一条不勾选
      expect(checkboxes[1].checked).toBe(true)
      expect(checkboxes[2].checked).toBe(true)
    })

    it('应该点击删除按钮时触发原始删除按钮', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      const clickSpy = vi.fn()
      const originalDeleteBtn = document.querySelector('#deletesubmit') as HTMLButtonElement
      originalDeleteBtn.addEventListener('click', clickSpy)

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 点击删除按钮
      const deleteBtn = document.querySelector('[data-feature-id="select-all-delete-btn"]') as HTMLButtonElement
      deleteBtn.click()

      // 验证原始删除按钮被点击
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  describe('按钮样式', () => {
    it('应该设置正确的按钮样式', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证按钮样式
      const selectAllBtn = document.querySelector('[data-feature-id="select-all-btn"]') as HTMLButtonElement
      expect(selectAllBtn.style.margin).toBe('0px 10px')
      expect(selectAllBtn.textContent).toBe('除第一条 全选')
    })

    it('应该在没有原始删除按钮时不添加删除按钮', async () => {
      // 创建测试 DOM（没有原始删除按钮）
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证只添加了全选按钮
      expect(document.querySelector('[data-feature-id="select-all-btn"]')).toBeTruthy()
      expect(document.querySelector('[data-feature-id="select-all-delete-btn"]')).toBeFalsy()
    })
  })

  describe('非目标页面', () => {
    it('应该在非目标页面不添加按钮', async () => {
      // 模拟非目标页面
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://www.52pojie.cn/forum.php',
        },
        writable: true,
      })

      // 创建测试 DOM
      document.body.innerHTML = `
        <div class="mtm mbm"></div>
        <button id="deletesubmit">删除</button>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证没有添加按钮
      expect(document.querySelector('[data-feature-id="select-all-btn"]')).toBeFalsy()
    })
  })

  describe('缺少目标容器', () => {
    it('应该在缺少目标容器时不报错', async () => {
      // 创建测试 DOM（缺少 .mtm.mbm 容器）
      document.body.innerHTML = `
        <button id="deletesubmit">删除</button>
      `

      const manager = createSelectAll()

      // 等待初始化完成
      await vi.waitFor(() => {
        expect(manager.getStatus()).toBe(true)
      })

      // 验证没有报错，没有添加按钮
      expect(document.querySelector('[data-feature-id="select-all-btn"]')).toBeFalsy()
    })
  })
})
