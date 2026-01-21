/**
 * 导航隐藏工具类
 * 用于管理和控制论坛导航菜单的显示/隐藏
 */

// 导航菜单配置接口
export interface NavMenuConfig {
  id: string
  name: string
  selector: string
}

// 用户配置接口
export interface UserNavConfig {
  hiddenMenus: string[]
}

// 默认导航菜单配置
export const DEFAULT_NAV_MENUS: NavMenuConfig[] = [
  { id: 'mn_portal', name: '门户', selector: '#mn_portal' },
  { id: 'mn_forum', name: '网站', selector: '#mn_forum' },
  { id: 'mn_Na063', name: '新帖', selector: '#mn_Na063' },
  { id: 'mn_forum_11', name: '专辑', selector: '#mn_forum_11' },
  { id: 'mn_home_4', name: '家园', selector: '#mn_home_4' },
  { id: 'mn_N12a7', name: '排行榜', selector: '#mn_N12a7' },
  { id: 'mn_N05be', name: '总版规', selector: '#mn_N05be' },
  { id: 'mn_N34c9', name: '投诉举报', selector: '#mn_N34c9' },
  { id: 'mn_Na678', name: '爱盘', selector: '#mn_Na678' },
  { id: 'mn_Ndb2c', name: '管理', selector: '#mn_Ndb2c' },
  { id: 'mn_N0a2c', name: '帮助', selector: '#mn_N0a2c' },
]

// 存储键名
const STORAGE_KEY = '52pjhelper_nav_config'

/**
 * 保存用户配置到存储
 */
export async function saveNavConfig(config: UserNavConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: config })
}

/**
 * 从存储加载用户配置
 */
export async function loadNavConfig(): Promise<UserNavConfig> {
  const result = await browser.storage.local.get(STORAGE_KEY)
  const config = result[STORAGE_KEY]

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
