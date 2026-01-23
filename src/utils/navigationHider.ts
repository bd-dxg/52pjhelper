/**
 * 导航隐藏工具类
 * 用于管理和控制论坛导航菜单的显示/隐藏
 */

import navConfig from '@/configs/navigation.json'

export interface NavMenuConfig {
  id: string
  name: string
  selector: string
}

export interface UserNavConfig {
  hiddenMenus: string[]
}

export const DEFAULT_NAV_MENUS: NavMenuConfig[] = navConfig.menus
const NAV_STORAGE_KEY = navConfig.storageKey

/**
 * 保存用户配置到存储
 */
export async function saveNavConfig(config: UserNavConfig): Promise<void> {
  await browser.storage.local.set({ [NAV_STORAGE_KEY]: config })
}

/**
 * 从存储加载用户配置
 */
export async function loadNavConfig(): Promise<UserNavConfig> {
  const result = await browser.storage.local.get(NAV_STORAGE_KEY)
  const config = result[NAV_STORAGE_KEY]

  // 严格验证配置格式，确保 hiddenMenus 是数组类型
  if (config &&
      typeof config === 'object' &&
      'hiddenMenus' in config &&
      Array.isArray(config.hiddenMenus)) {
    // 确保数组中的元素都是字符串类型
    const validHiddenMenus = config.hiddenMenus.filter(item => typeof item === 'string')
    return { hiddenMenus: validHiddenMenus }
  }

  return { hiddenMenus: [] }
}

/**
 * 隐藏指定的导航菜单
 */
export function hideMenu(menuId: string): void {
  // 只匹配导航菜单容器 #nv 下的元素，避免匹配插件页面的元素
  const menu = document.querySelector<HTMLElement>(`#nv #${menuId}`)
  if (menu) {
    menu.style.display = 'none'
  }
}

/**
 * 显示指定的导航菜单
 */
export function showMenu(menuId: string): void {
  // 只匹配导航菜单容器 #nv 下的元素，避免匹配插件页面的元素
  const menu = document.querySelector<HTMLElement>(`#nv #${menuId}`)
  if (menu) {
    menu.style.display = ''
  }
}

/**
 * 应用用户配置，隐藏指定的导航菜单
 */
export function applyNavConfig(config: UserNavConfig): void {
  // 先显示所有菜单
  DEFAULT_NAV_MENUS.forEach(menu => {
    showMenu(menu.id)
  })

  // 隐藏用户选择的菜单（添加安全检查）
  if (config && config.hiddenMenus && Array.isArray(config.hiddenMenus)) {
    config.hiddenMenus.forEach(menuId => {
      if (typeof menuId === 'string') {
        hideMenu(menuId)
      }
    })
  }
}

/**
 * 切换导航菜单的显示/隐藏状态（仅更新存储，不直接操作 DOM）
 */
export async function toggleMenu(menuId: string): Promise<UserNavConfig> {
  const config = await loadNavConfig()
  const index = config.hiddenMenus.indexOf(menuId)

  if (index > -1) {
    // 如果已隐藏，则显示
    config.hiddenMenus.splice(index, 1)
  } else {
    // 如果已显示，则隐藏
    config.hiddenMenus.push(menuId)
  }

  await saveNavConfig(config)
  return config
}

/**
 * 初始化导航隐藏功能
 */
export async function initializeNavigationHider(): Promise<void> {
  // 等待页面加载完成
  const waitForPageLoad = () => {
    return new Promise<void>(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve())
      } else {
        resolve()
      }
    })
  }

  await waitForPageLoad()

  // 等待导航菜单元素出现
  const waitForNavigation = () => {
    return new Promise<void>(resolve => {
      const checkNav = () => {
        const navElement = document.querySelector('#nv')
        if (navElement) {
          resolve()
        } else {
          setTimeout(checkNav, 100)
        }
      }
      checkNav()
    })
  }

  await waitForNavigation()

  const config = await loadNavConfig()
  applyNavConfig(config)
}
