/**
 * 主题管理工具
 * 用于检测和应用系统主题（深色/浅色模式）
 */

export type Theme = 'light' | 'dark'

/**
 * 获取当前系统主题
 */
export function getCurrentTheme(): Theme {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

/**
 * 应用主题到 HTML 根元素
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * 监听系统主题变化
 * @param callback 主题变化时的回调函数
 * @returns 返回清理函数，用于取消监听
 */
export function watchThemeChange(callback: (theme: Theme) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent) => {
    const theme = e.matches ? 'dark' : 'light'
    callback(theme)
  }

  // 添加监听器
  mediaQuery.addEventListener('change', handler)

  // 返回清理函数
  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}

/**
 * 初始化主题系统
 * 自动检测并应用当前系统主题，并监听主题变化
 * @returns 返回清理函数
 */
export function initTheme(): () => void {
  // 应用初始主题
  const currentTheme = getCurrentTheme()
  applyTheme(currentTheme)

  // 监听主题变化
  return watchThemeChange((theme) => {
    applyTheme(theme)
  })
}
