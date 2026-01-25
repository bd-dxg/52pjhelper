/**
 * 用户信息获取工具类
 * 用于从页面中获取当前登录用户的信息
 */

export interface UserInfo {
  /** 用户名 */
  username: string
  /** 用户等级 */
  level: string
  /** 用户头像 URL */
  avatar: string
  /** 是否登录 */
  isLoggedIn: boolean
  /** 用户权限（根据等级判断） */
  permissions: {
    isAdmin: boolean
    isModerator: boolean
    isVIP: boolean
    isRegular: boolean
  }
}

/**
 * 存储用户信息到浏览器 storage（本地存储）
 */
export async function saveUserInfoToCache(userInfo: UserInfo): Promise<void> {
  try {
    await browser.storage.local.set({ userInfoCache: userInfo })
  } catch (error) {
    console.error('保存用户信息到缓存失败:', error)
  }
}

/**
 * 从浏览器 storage 读取用户信息缓存
 */
export async function getUserInfoFromCache(): Promise<UserInfo | null> {
  try {
    const result = await browser.storage.local.get('userInfoCache')
    const cached = result.userInfoCache
    if (cached && typeof cached === 'object' && 'username' in cached) {
      return cached as UserInfo
    }
    return null
  } catch (error) {
    console.error('从缓存读取用户信息失败:', error)
    return null
  }
}

/**
 * 从页面 DOM 中获取用户信息
 */
export function getUserInfo(): UserInfo {
  // 未登录状态默认值
  const defaultInfo: UserInfo = {
    username: '未登录',
    level: '游客',
    avatar: '',
    isLoggedIn: false,
    permissions: {
      isAdmin: false,
      isModerator: false,
      isVIP: false,
      isRegular: false,
    },
  }

  try {
    // 获取用户名：从 .vwmy.qq a 元素获取
    const usernameElement = document.querySelector('.vwmy.qq a')
    const username = usernameElement?.textContent?.trim() || ''

    // 获取用户等级：从 #g_upmine 下的 font 元素获取
    const levelElement = document.querySelector('#g_upmine font')
    const level = levelElement?.textContent?.trim() || ''

    // 获取用户头像：从 #um .avt img 元素获取
    const avatarElement = document.querySelector('#um .avt img')
    const avatar = avatarElement?.getAttribute('src') || ''

    // 判断是否已登录
    const isLoggedIn = !!(username && username !== '未登录')

    // 判断用户权限
    // 管理组等级
    const adminLevels = ['人在江湖', '仗剑天涯', '踏雪无痕', '独步武林']
    // 普通会员等级
    const regularLevels = ['身陷囹圄', '锋芒初露', '前途无量', '出类拔萃', '凤毛麟角', '独树一帜', '炉火纯青']

    const permissions = {
      isAdmin: adminLevels.some(adminLevel => level.includes(adminLevel)),
      isModerator: adminLevels.some(adminLevel => level.includes(adminLevel)), // 管理组都有版主权限
      isVIP: level.includes('VIP') || level.includes('贵宾') || level.includes('钻石'),
      isRegular: regularLevels.some(regularLevel => level.includes(regularLevel)),
    }

    return {
      username: username || defaultInfo.username,
      level: level || defaultInfo.level,
      avatar: avatar || defaultInfo.avatar,
      isLoggedIn,
      permissions,
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return defaultInfo
  }
}

/**
 * 监听用户信息变化
 * @param callback 信息变化时的回调函数
 */
export function watchUserInfo(callback: (userInfo: UserInfo) => void): () => void {
  // 初始化时先获取一次
  callback(getUserInfo())

  // 创建 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(() => {
    callback(getUserInfo())
  })

  // 监听 body 元素的变化
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  // 返回取消监听的函数
  return () => {
    observer.disconnect()
  }
}
