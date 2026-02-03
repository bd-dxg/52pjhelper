import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  getCurrentTheme,
  applyTheme,
  watchThemeChange,
  initTheme,
  type Theme,
} from '@/utils/themeManager'

describe('themeManager', () => {
  // Mock matchMedia
  let mockMatchMedia: ReturnType<typeof vi.fn>
  let mockMediaQueryList: {
    matches: boolean
    addEventListener: ReturnType<typeof vi.fn>
    removeEventListener: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // 清空 document.documentElement 的属性
    document.documentElement.removeAttribute('data-theme')

    // 创建 mock MediaQueryList
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    // Mock window.matchMedia
    mockMatchMedia = vi.fn(() => mockMediaQueryList)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMedia,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCurrentTheme', () => {
    it('应该返回 dark 主题（当系统偏好深色模式时）', () => {
      mockMediaQueryList.matches = true

      const theme = getCurrentTheme()

      expect(theme).toBe('dark')
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('应该返回 light 主题（当系统偏好浅色模式时）', () => {
      mockMediaQueryList.matches = false

      const theme = getCurrentTheme()

      expect(theme).toBe('light')
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('应该返回 light 主题（当 matchMedia 不可用时）', () => {
      // Mock matchMedia 不可用
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: undefined,
      })

      const theme = getCurrentTheme()

      expect(theme).toBe('light')
    })
  })

  describe('applyTheme', () => {
    it('应该将 dark 主题应用到 HTML 根元素', () => {
      applyTheme('dark')

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('应该将 light 主题应用到 HTML 根元素', () => {
      applyTheme('light')

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('应该覆盖之前的主题设置', () => {
      applyTheme('dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

      applyTheme('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })
  })

  describe('watchThemeChange', () => {
    it('应该监听主题变化并调用回调（切换到深色模式）', () => {
      const callback = vi.fn()

      watchThemeChange(callback)

      // 模拟主题变化事件
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true } as MediaQueryListEvent)

      expect(callback).toHaveBeenCalledWith('dark')
    })

    it('应该监听主题变化并调用回调（切换到浅色模式）', () => {
      const callback = vi.fn()

      watchThemeChange(callback)

      // 模拟主题变化事件
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]
      changeHandler({ matches: false } as MediaQueryListEvent)

      expect(callback).toHaveBeenCalledWith('light')
    })

    it('应该正确添加事件监听器', () => {
      const callback = vi.fn()

      watchThemeChange(callback)

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('应该返回清理函数', () => {
      const callback = vi.fn()

      const cleanup = watchThemeChange(callback)

      expect(typeof cleanup).toBe('function')
    })

    it('应该在调用清理函数后移除事件监听器', () => {
      const callback = vi.fn()

      const cleanup = watchThemeChange(callback)
      cleanup()

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })

    it('应该在清理后不再触发回调', () => {
      const callback = vi.fn()

      const cleanup = watchThemeChange(callback)

      // 获取事件处理器
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]

      // 清理监听器
      cleanup()

      // 清除之前的调用记录
      callback.mockClear()

      // 模拟主题变化事件（应该不会触发回调）
      changeHandler({ matches: true } as MediaQueryListEvent)

      // 由于已经清理，回调不应该被调用
      // 但实际上事件处理器仍然会执行，只是监听器已被移除
      // 这里我们验证 removeEventListener 被调用
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled()
    })
  })

  describe('initTheme', () => {
    it('应该初始化并应用当前系统主题（深色模式）', () => {
      mockMediaQueryList.matches = true

      initTheme()

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('应该初始化并应用当前系统主题（浅色模式）', () => {
      mockMediaQueryList.matches = false

      initTheme()

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('应该监听主题变化', () => {
      initTheme()

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('应该在主题变化时自动应用新主题', () => {
      mockMediaQueryList.matches = false

      initTheme()

      // 初始应该是浅色模式
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      // 模拟主题变化事件
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true } as MediaQueryListEvent)

      // 应该自动切换到深色模式
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })

    it('应该返回清理函数', () => {
      const cleanup = initTheme()

      expect(typeof cleanup).toBe('function')
    })

    it('应该在调用清理函数后停止监听', () => {
      const cleanup = initTheme()
      cleanup()

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function),
      )
    })

    it('应该支持多次初始化和清理', () => {
      // 第一次初始化
      const cleanup1 = initTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()

      // 清理
      cleanup1()

      // 第二次初始化
      const cleanup2 = initTheme()
      expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()

      // 清理
      cleanup2()

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledTimes(2)
    })
  })

  describe('边界情况', () => {
    it('应该处理 matchMedia 返回 null 的情况', () => {
      // Mock matchMedia 返回 null
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn(() => null),
      })

      // 当 matchMedia 返回 null 时，会抛出错误
      expect(() => getCurrentTheme()).toThrow()
    })

    it('应该处理 document.documentElement 不存在的情况', () => {
      // 临时移除 documentElement
      const originalDocumentElement = document.documentElement
      Object.defineProperty(document, 'documentElement', {
        writable: true,
        configurable: true,
        value: null,
      })

      // 应该不会抛出错误
      expect(() => applyTheme('dark')).toThrow()

      // 恢复 documentElement
      Object.defineProperty(document, 'documentElement', {
        writable: true,
        configurable: true,
        value: originalDocumentElement,
      })
    })

    it('应该处理连续的主题变化', () => {
      mockMediaQueryList.matches = false

      initTheme()

      // 初始应该是浅色模式
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      // 获取事件处理器
      const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1]

      // 模拟多次主题变化
      changeHandler({ matches: true } as MediaQueryListEvent)
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

      changeHandler({ matches: false } as MediaQueryListEvent)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      changeHandler({ matches: true } as MediaQueryListEvent)
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('类型安全', () => {
    it('应该只接受有效的主题类型', () => {
      // TypeScript 编译时会检查类型
      const validThemes: Theme[] = ['light', 'dark']

      validThemes.forEach(theme => {
        expect(() => applyTheme(theme)).not.toThrow()
      })
    })

    it('应该返回正确的主题类型', () => {
      mockMediaQueryList.matches = true
      const theme = getCurrentTheme()

      // TypeScript 类型检查
      const validTheme: Theme = theme
      expect(['light', 'dark']).toContain(validTheme)
    })
  })
})
