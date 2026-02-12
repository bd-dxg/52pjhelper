/**
 * 版本更新检查工具类
 * 通过爬取帖子标题获取最新版本号
 */

import config from '@conf/versionCheck.json'
import { storageHelper } from './storageHelper'

/**
 * 从帖子标题中提取版本号
 */
const extractVersion = (title: string): string | null => {
  const pattern = new RegExp(config.versionPattern, 'i')
  const match = title.match(pattern)
  return match ? match[1] : null
}

/**
 * 比较两个版本号
 */
const compareVersions = (version1: string, version2: string): number => {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0
    const v2 = v2Parts[i] || 0

    if (v1 > v2) return 1
    if (v1 < v2) return -1
  }

  return 0
}

/**
 * 获取当前扩展版本号
 */
const getCurrentVersion = (): string => browser.runtime.getManifest().version

/**
 * 从帖子页面获取最新版本号
 */
const fetchLatestVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(config.threadUrl, {
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('获取帖子页面失败:', response.status)
      return null
    }

    const html = await response.text()

    if (html.includes('需要登录') || html.includes('请先登录') || html.includes('member.php?mod=logging')) {
      console.warn('帖子需要登录才能访问，但浏览器应该已经登录')
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    if (!titleMatch) {
      console.error('未找到页面标题')
      return null
    }

    const title = titleMatch[1]
    const version = extractVersion(title)

    if (!version) {
      console.error('未能从标题中提取版本号:', title)
      return null
    }

    return version
  } catch (error) {
    console.error('获取最新版本失败:', error)
    return null
  }
}

/**
 * 检查是否有新版本
 */
const checkForUpdate = async () => {
  const currentVersion = getCurrentVersion()
  const latestVersion = await fetchLatestVersion()

  if (!latestVersion) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      threadUrl: config.threadUrl,
    }
  }

  await storageHelper.saveString(config.latestVersionKey, latestVersion)

  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    threadUrl: config.threadUrl,
  }
}

/**
 * 检查是否需要执行版本检查
 */
const shouldCheck = async (): Promise<boolean> => {
  const enabled = await storageHelper.loadBoolean(config.storageKey, config.defaultEnabled)
  if (!enabled) return false

  const lastCheckTime = await storageHelper.loadNumber(config.lastCheckKey, 0)
  const now = Date.now()

  return now - lastCheckTime >= config.checkInterval
}

/**
 * 更新最后检查时间
 */
const updateLastCheckTime = async (): Promise<void> => {
  await storageHelper.saveNumber(config.lastCheckKey, Date.now())
}

/**
 * 获取缓存的最新版本号
 */
const getCachedLatestVersion = async (): Promise<string | null> =>
  storageHelper.loadString(config.latestVersionKey, '')

/**
 * 检查用户是否已忽略当前版本的更新
 */
const isUpdateDismissed = async (version: string): Promise<boolean> => {
  const dismissedVersion = await storageHelper.loadString(config.updateDismissedKey, '')
  return dismissedVersion === version
}

/**
 * 标记用户已忽略当前版本的更新
 */
const dismissUpdate = async (version: string): Promise<void> => {
  await storageHelper.saveString(config.updateDismissedKey, version)
}

/**
 * 清除忽略标记
 */
const clearDismissed = async (): Promise<void> => {
  await browser.storage.local.remove(config.updateDismissedKey)
}

export const versionChecker = {
  checkForUpdate,
  shouldCheck,
  updateLastCheckTime,
  getCachedLatestVersion,
  isUpdateDismissed,
  dismissUpdate,
  clearDismissed,
  compareVersions,
}
