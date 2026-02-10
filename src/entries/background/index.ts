/**
 * Background Script
 * 负责定期检查版本更新并发送通知
 */

import { versionChecker } from '@utils/versionChecker'

export default defineBackground(() => {
  // 定时器名称
  const ALARM_NAME = 'versionCheck'

  /**
   * 创建浏览器通知
   */
  async function createNotification(latestVersion: string, threadUrl: string): Promise<void> {
    await browser.notifications.create({
      type: 'basic',
      iconUrl: '/images/icon-128.png',
      title: '发现新版本',
      message: `吾爱管理效率助手 ${latestVersion} 已发布！\n点击查看更新详情`,
      priority: 2,
    })

    // 保存通知相关信息，供点击事件使用
    await browser.storage.local.set({
      pendingUpdateUrl: threadUrl,
    })
  }

  /**
   * 执行版本检查
   */
  async function performVersionCheck(): Promise<void> {
    try {
      // 检查是否需要执行检查
      if (!(await versionChecker.shouldCheck())) {
        console.log('版本检查：未到检查时间')
        return
      }

      console.log('开始检查版本更新...')
      const result = await versionChecker.checkForUpdate()

      // 更新最后检查时间
      await versionChecker.updateLastCheckTime()

      if (result.hasUpdate) {
        console.log(`发现新版本: ${result.latestVersion} (当前版本: ${result.currentVersion})`)

        // 检查用户是否已忽略此版本
        const isDismissed = await versionChecker.isUpdateDismissed(result.latestVersion)
        if (!isDismissed) {
          await createNotification(result.latestVersion, result.threadUrl)
        } else {
          console.log('用户已忽略此版本更新')
        }
      } else {
        console.log('当前已是最新版本')
      }
    } catch (error) {
      console.error('版本检查失败:', error)
    }
  }

  /**
   * 初始化定时器
   */
  function initAlarm(): void {
    // 创建定时器，每天检查一次
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: 1440, // 24小时 = 1440分钟
      delayInMinutes: 1, // 1分钟后首次触发
    })

    console.log('版本检查定时器已创建')
  }

  /**
   * 监听定时器触发
   */
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      performVersionCheck()
    }
  })

  /**
   * 监听通知点击事件
   */
  browser.notifications.onClicked.addListener(async (notificationId) => {
    // 获取待打开的URL
    const result = await browser.storage.local.get('pendingUpdateUrl')
    const url = result.pendingUpdateUrl as string | undefined

    if (url) {
      // 打开帖子页面
      await browser.tabs.create({ url })

      // 清除通知
      await browser.notifications.clear(notificationId)

      // 清除存储的URL
      await browser.storage.local.remove('pendingUpdateUrl')
    }
  })

  /**
   * 监听扩展安装/更新事件
   */
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      console.log('扩展首次安装')
      initAlarm()
      // 首次安装时立即检查一次
      performVersionCheck()
    } else if (details.reason === 'update') {
      console.log('扩展已更新')
      // 更新后清除忽略标记
      versionChecker.clearDismissed()
      initAlarm()
    }
  })

  /**
   * 监听来自 popup 的消息
   */
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_UPDATE_NOW') {
      // 立即检查更新
      performVersionCheck().then(() => {
        sendResponse({ success: true })
      })
      return true // 保持消息通道开启
    }

    if (message.type === 'DISMISS_UPDATE') {
      // 忽略当前版本更新
      const version = message.version as string
      versionChecker.dismissUpdate(version).then(() => {
        sendResponse({ success: true })
      })
      return true
    }

    if (message.type === 'GET_UPDATE_INFO') {
      // 获取更新信息
      versionChecker.getCachedLatestVersion().then(async (latestVersion) => {
        if (latestVersion) {
          const currentVersion = browser.runtime.getManifest().version
          const isDismissed = await versionChecker.isUpdateDismissed(latestVersion)

          // 使用 versionChecker 的比较方法
          const compareResult = versionChecker.compareVersions(latestVersion, currentVersion)

          sendResponse({
            success: true,
            hasUpdate: compareResult > 0,
            latestVersion,
            currentVersion,
            isDismissed,
          })
        } else {
          sendResponse({ success: false })
        }
      })
      return true
    }
  })

  // 扩展启动时初始化
  console.log('Background script 已加载')
  initAlarm()
})
