import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  saveNavConfig,
  loadNavConfig,
  hideMenu,
  showMenu,
  applyNavConfig,
  toggleMenu,
  initializeNavigationHider,
  DEFAULT_NAV_MENUS,
  type UserNavConfig,
} from '@/utils/navigationHider'

describe('navigationHider', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()

    // 清空 document.head 和 document.body
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('DEFAULT_NAV_MENUS', () => {
    it('应该包含导航菜单配置', () => {
      expect(DEFAULT_NAV_MENUS).toBeDefined()
      expect(Array.isArray(DEFAULT_NAV_MENUS)).toBe(true)
      expect(DEFAULT_NAV_MENUS.length).toBeGreaterThan(0)
    })

    it('每个菜单项应该包含 id、name 和 selector', () => {
      DEFAULT_NAV_MENUS.forEach(menu => {
        expect(menu).toHaveProperty('id')
        expect(menu).toHaveProperty('name')
        expect(menu).toHaveProperty('selector')
        expect(typeof menu.id).toBe('string')
        expect(typeof menu.name).toBe('string')
        expect(typeof menu.selector).toBe('string')
      })
    })
  })

  describe('saveNavConfig', () => {
    it('应该正确保存配置到存储', async () => {
      const config: UserNavConfig = { hiddenMenus: ['mn_portal', 'mn_forum'] }

      await saveNavConfig(config)

      const result = await fakeBrowser.storage.local.get('52pjhelper_nav_config')
      expect(result['52pjhelper_nav_config']).toEqual(config)
    })

    it('应该保存空的隐藏菜单数组', async () => {
      const config: UserNavConfig = { hiddenMenus: [] }

      await saveNavConfig(config)

      const result = await fakeBrowser.storage.local.get('52pjhelper_nav_config')
      expect(result['52pjhelper_nav_config']).toEqual(config)
    })
  })

  describe('loadNavConfig', () => {
    it('应该正确加载存储的配置', async () => {
      const config: UserNavConfig = { hiddenMenus: ['mn_portal', 'mn_forum'] }
      await fakeBrowser.storage.local.set({ '52pjhelper_nav_config': config })

      const result = await loadNavConfig()

      expect(result).toEqual(config)
    })

    it('应该在存储为空时返回默认配置', async () => {
      const result = await loadNavConfig()

      expect(result).toEqual({ hiddenMenus: [] })
    })

    it('应该在配置格式无效时返回默认配置', async () => {
      // 存储无效格式的配置
      await fakeBrowser.storage.local.set({ '52pjhelper_nav_config': 'invalid' })

      const result = await loadNavConfig()

      expect(result).toEqual({ hiddenMenus: [] })
    })

    it('应该在 hiddenMenus 不是数组时返回默认配置', async () => {
      await fakeBrowser.storage.local.set({
        '52pjhelper_nav_config': { hiddenMenus: 'not-an-array' },
      })

      const result = await loadNavConfig()

      expect(result).toEqual({ hiddenMenus: [] })
    })

    it('应该过滤掉非字符串类型的菜单 ID', async () => {
      await fakeBrowser.storage.local.set({
        '52pjhelper_nav_config': { hiddenMenus: ['mn_portal', 123, null, 'mn_forum'] },
      })

      const result = await loadNavConfig()

      expect(result).toEqual({ hiddenMenus: ['mn_portal', 'mn_forum'] })
    })
  })

  describe('hideMenu', () => {
    it('应该隐藏指定的导航菜单', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="nv">
          <div id="mn_portal" style="display: block;">门户</div>
          <div id="mn_forum" style="display: block;">网站</div>
        </div>
      `

      hideMenu('mn_portal')

      const menu = document.querySelector('#nv #mn_portal') as HTMLElement
      expect(menu.style.display).toBe('none')
    })

    it('应该在菜单不存在时不报错', () => {
      document.body.innerHTML = '<div id="nv"></div>'

      expect(() => hideMenu('non_existent')).not.toThrow()
    })

    it('应该只隐藏 #nv 容器下的菜单', () => {
      // 创建测试 DOM，包含 #nv 外的同名元素
      document.body.innerHTML = `
        <div id="nv">
          <div id="mn_portal" style="display: block;">门户</div>
        </div>
        <div id="mn_portal" style="display: block;">外部门户</div>
      `

      hideMenu('mn_portal')

      const nvMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      const outsideMenu = document.body.querySelector(':scope > #mn_portal') as HTMLElement
      expect(nvMenu.style.display).toBe('none')
      expect(outsideMenu.style.display).toBe('block')
    })
  })

  describe('showMenu', () => {
    it('应该显示指定的导航菜单', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="nv">
          <div id="mn_portal" style="display: none;">门户</div>
        </div>
      `

      showMenu('mn_portal')

      const menu = document.querySelector('#nv #mn_portal') as HTMLElement
      expect(menu.style.display).toBe('')
    })

    it('应该在菜单不存在时不报错', () => {
      document.body.innerHTML = '<div id="nv"></div>'

      expect(() => showMenu('non_existent')).not.toThrow()
    })

    it('应该只显示 #nv 容器下的菜单', () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="nv">
          <div id="mn_portal" style="display: none;">门户</div>
        </div>
        <div id="mn_portal" style="display: none;">外部门户</div>
      `

      showMenu('mn_portal')

      const nvMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      const outsideMenu = document.body.querySelector(':scope > #mn_portal') as HTMLElement
      expect(nvMenu.style.display).toBe('')
      expect(outsideMenu.style.display).toBe('none')
    })
  })

  describe('applyNavConfig', () => {
    beforeEach(() => {
      // 创建包含所有默认菜单的测试 DOM
      const menuHtml = DEFAULT_NAV_MENUS.map(
        menu => `<div id="${menu.id}" style="display: none;">${menu.name}</div>`
      ).join('')
      document.body.innerHTML = `<div id="nv">${menuHtml}</div>`
    })

    it('应该先显示所有菜单再隐藏指定菜单', () => {
      const config: UserNavConfig = { hiddenMenus: ['mn_portal'] }

      applyNavConfig(config)

      // 验证 mn_portal 被隐藏
      const portalMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      expect(portalMenu.style.display).toBe('none')

      // 验证其他菜单被显示
      const forumMenu = document.querySelector('#nv #mn_forum') as HTMLElement
      expect(forumMenu.style.display).toBe('')
    })

    it('应该隐藏多个指定的菜单', () => {
      const config: UserNavConfig = { hiddenMenus: ['mn_portal', 'mn_forum', 'mn_Na063'] }

      applyNavConfig(config)

      const portalMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      const forumMenu = document.querySelector('#nv #mn_forum') as HTMLElement
      const newPostMenu = document.querySelector('#nv #mn_Na063') as HTMLElement

      expect(portalMenu.style.display).toBe('none')
      expect(forumMenu.style.display).toBe('none')
      expect(newPostMenu.style.display).toBe('none')
    })

    it('应该在配置为空时显示所有菜单', () => {
      const config: UserNavConfig = { hiddenMenus: [] }

      applyNavConfig(config)

      DEFAULT_NAV_MENUS.forEach(menu => {
        const element = document.querySelector(`#nv #${menu.id}`) as HTMLElement
        expect(element.style.display).toBe('')
      })
    })

    it('应该安全处理 null 配置', () => {
      expect(() => applyNavConfig(null as unknown as UserNavConfig)).not.toThrow()
    })

    it('应该安全处理 undefined 配置', () => {
      expect(() => applyNavConfig(undefined as unknown as UserNavConfig)).not.toThrow()
    })

    it('应该安全处理 hiddenMenus 为非数组的配置', () => {
      const config = { hiddenMenus: 'invalid' } as unknown as UserNavConfig

      expect(() => applyNavConfig(config)).not.toThrow()
    })

    it('应该过滤掉非字符串类型的菜单 ID', () => {
      const config = { hiddenMenus: ['mn_portal', 123, null] } as unknown as UserNavConfig

      expect(() => applyNavConfig(config)).not.toThrow()

      const portalMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      expect(portalMenu.style.display).toBe('none')
    })
  })

  describe('toggleMenu', () => {
    it('应该将显示的菜单切换为隐藏', async () => {
      // 初始配置为空（所有菜单显示）
      await fakeBrowser.storage.local.set({ '52pjhelper_nav_config': { hiddenMenus: [] } })

      const result = await toggleMenu('mn_portal')

      expect(result.hiddenMenus).toContain('mn_portal')

      // 验证存储已更新
      const stored = await fakeBrowser.storage.local.get('52pjhelper_nav_config')
      expect(stored['52pjhelper_nav_config'].hiddenMenus).toContain('mn_portal')
    })

    it('应该将隐藏的菜单切换为显示', async () => {
      // 初始配置包含 mn_portal
      await fakeBrowser.storage.local.set({
        '52pjhelper_nav_config': { hiddenMenus: ['mn_portal'] },
      })

      const result = await toggleMenu('mn_portal')

      expect(result.hiddenMenus).not.toContain('mn_portal')

      // 验证存储已更新
      const stored = await fakeBrowser.storage.local.get('52pjhelper_nav_config')
      expect(stored['52pjhelper_nav_config'].hiddenMenus).not.toContain('mn_portal')
    })

    it('应该保留其他菜单的隐藏状态', async () => {
      await fakeBrowser.storage.local.set({
        '52pjhelper_nav_config': { hiddenMenus: ['mn_portal', 'mn_forum'] },
      })

      const result = await toggleMenu('mn_portal')

      expect(result.hiddenMenus).not.toContain('mn_portal')
      expect(result.hiddenMenus).toContain('mn_forum')
    })

    it('应该返回更新后的配置', async () => {
      const result = await toggleMenu('mn_portal')

      expect(result).toHaveProperty('hiddenMenus')
      expect(Array.isArray(result.hiddenMenus)).toBe(true)
    })
  })

  describe('initializeNavigationHider', () => {
    it('应该等待页面加载完成', async () => {
      // 创建测试 DOM
      document.body.innerHTML = '<div id="nv"><div id="mn_portal">门户</div></div>'

      // 模拟 document.readyState
      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
      })

      await initializeNavigationHider()

      // 验证初始化完成（没有报错）
      expect(true).toBe(true)
    })

    it('应该等待导航菜单元素出现', async () => {
      // 初始没有 #nv 元素
      document.body.innerHTML = ''

      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
      })

      // 延迟添加 #nv 元素
      setTimeout(() => {
        document.body.innerHTML = '<div id="nv"><div id="mn_portal">门户</div></div>'
      }, 50)

      await initializeNavigationHider()

      // 验证 #nv 元素已存在
      expect(document.querySelector('#nv')).toBeTruthy()
    })

    it('应该加载并应用用户配置', async () => {
      // 创建测试 DOM
      document.body.innerHTML = `
        <div id="nv">
          <div id="mn_portal" style="display: block;">门户</div>
          <div id="mn_forum" style="display: block;">网站</div>
        </div>
      `

      // 预设存储配置
      await fakeBrowser.storage.local.set({
        '52pjhelper_nav_config': { hiddenMenus: ['mn_portal'] },
      })

      Object.defineProperty(document, 'readyState', {
        value: 'complete',
        writable: true,
      })

      await initializeNavigationHider()

      // 验证配置已应用
      const portalMenu = document.querySelector('#nv #mn_portal') as HTMLElement
      expect(portalMenu.style.display).toBe('none')
    })

    it('应该在 DOMContentLoaded 事件后继续执行', async () => {
      document.body.innerHTML = '<div id="nv"><div id="mn_portal">门户</div></div>'

      // 模拟 loading 状态
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        writable: true,
      })

      // 启动初始化
      const initPromise = initializeNavigationHider()

      // 触发 DOMContentLoaded 事件
      document.dispatchEvent(new Event('DOMContentLoaded'))

      await initPromise

      expect(true).toBe(true)
    })
  })
})
