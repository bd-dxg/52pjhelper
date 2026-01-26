import { initializeNavigationHider, applyNavConfig } from '../utils/navigationHider'
import { AvatarQueryManager } from '../utils/avatarQuery'
import { UserLinkQueryManager } from '../utils/userLinkQuery'
import { loadQuickReplyConfig, saveQuickReplyConfig, initQuickReply, cleanupQuickReply } from '../utils/quickReply'
import { FloorHighlighter } from '../utils/floorHighlighter'
import { getUserInfo, saveUserInfoToCache } from '../utils/userInfo'
import { NativeFloorDisplay } from '../utils/nativeFloorDisplay'
import { SelectAllManager } from '../utils/selectAll'
import { TableSelectorManager } from '../utils/tableSelector'
import { DefaultTimeManager } from '../utils/defaultTime'
import { autoFillManager } from '../utils/autoFill'

// 防止重复初始化的标记
const INIT_FLAG = '__52pj_helper_initialized__'

// 创建头像查询管理器实例
let avatarQueryManager: AvatarQueryManager | null = null
let userLinkQueryManager: UserLinkQueryManager | null = null
let quickReplyEnabled = false
let floorHighlighter: FloorHighlighter | null = null
let nativeFloorDisplay: NativeFloorDisplay | null = null
let selectAllManager: SelectAllManager | null = null
let tableSelectorManager: TableSelectorManager | null = null
let defaultTimeManager: DefaultTimeManager | null = null

export default defineContentScript({
  matches: ['https://www.52pojie.cn/*'],
  main() {
    // 检查是否已经初始化
    if ((window as any)[INIT_FLAG]) {
      console.log('扩展已初始化，跳过重复初始化')
      return
    }
    ;(window as any)[INIT_FLAG] = true

    // 初始化导航隐藏功能
    initializeNavigationHider().catch(error => {
      console.error('Failed to initialize navigation hider:', error)
    })

    // 初始化头像查询功能
    avatarQueryManager = new AvatarQueryManager()

    // 初始化用户链接查询功能
    userLinkQueryManager = new UserLinkQueryManager()

    // 初始化快捷回复功能
    loadQuickReplyConfig().then(enabled => {
      quickReplyEnabled = enabled
      if (enabled) {
        initQuickReply()
      }
    })

    // 初始化楼层高亮功能
    floorHighlighter = new FloorHighlighter()

    // 初始化原生楼层显示功能
    nativeFloorDisplay = new NativeFloorDisplay()

    // 初始化全选功能
    selectAllManager = new SelectAllManager()

    // 初始化分表选择器功能
    tableSelectorManager = new TableSelectorManager()

    // 初始化默认时间功能
    defaultTimeManager = new DefaultTimeManager()

    // 初始化自动填充功能
    autoFillManager.init()

    // 监听来自 popup 的消息
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
      if (message.type === 'UPDATE_NAVIGATION') {
        applyNavConfig(message.config)
        sendResponse({ success: true, message: 'Navigation updated' })
        return false
      }

      if (message.type === 'TOGGLE_AVATAR_QUERY') {
        if (avatarQueryManager) {
          avatarQueryManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle avatar query failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'AvatarQueryManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_AVATAR_QUERY_STATUS') {
        if (avatarQueryManager) {
          const enabled = avatarQueryManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'AvatarQueryManager not initialized' })
        }
        return false
      }

      if (message.type === 'TOGGLE_QUICK_REPLY') {
        quickReplyEnabled = !quickReplyEnabled
        saveQuickReplyConfig(quickReplyEnabled)
          .then(() => {
            if (quickReplyEnabled) {
              initQuickReply()
            } else {
              cleanupQuickReply()
            }
            sendResponse({ success: true, enabled: quickReplyEnabled })
          })
          .catch(() => {
            sendResponse({ success: false, message: 'Failed to save config' })
          })
        return true
      }

      if (message.type === 'GET_QUICK_REPLY_STATUS') {
        sendResponse({ success: true, enabled: quickReplyEnabled })
        return false
      }

      if (message.type === 'TOGGLE_FLOOR_HIGHLIGHTER') {
        if (floorHighlighter) {
          floorHighlighter
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle floor highlighter failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'FloorHighlighter not initialized' })
          return false
        }
      }

      if (message.type === 'GET_FLOOR_HIGHLIGHTER_STATUS') {
        if (floorHighlighter) {
          const enabled = floorHighlighter.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'FloorHighlighter not initialized' })
        }
        return false
      }

      if (message.type === 'TOGGLE_NATIVE_FLOOR_DISPLAY') {
        if (nativeFloorDisplay) {
          nativeFloorDisplay
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle native floor display failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'NativeFloorDisplay not initialized' })
          return false
        }
      }

      if (message.type === 'GET_NATIVE_FLOOR_DISPLAY_STATUS') {
        if (nativeFloorDisplay) {
          const enabled = nativeFloorDisplay.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'NativeFloorDisplay not initialized' })
        }
        return false
      }

      if (message.type === 'GET_USER_INFO') {
        const userInfo = getUserInfo()
        saveUserInfoToCache(userInfo) // 保存到缓存
        sendResponse({ success: true, data: userInfo })
        return false
      }

      if (message.type === 'TOGGLE_SELECT_ALL') {
        if (selectAllManager) {
          selectAllManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle select all failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'SelectAllManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_SELECT_ALL_STATUS') {
        if (selectAllManager) {
          const enabled = selectAllManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'SelectAllManager not initialized' })
        }
        return false
      }

      if (message.type === 'TOGGLE_TABLE_SELECTOR') {
        if (tableSelectorManager) {
          tableSelectorManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle table selector failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'TableSelectorManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_TABLE_SELECTOR_STATUS') {
        if (tableSelectorManager) {
          const enabled = tableSelectorManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'TableSelectorManager not initialized' })
        }
        return false
      }

      if (message.type === 'TOGGLE_DEFAULT_TIME') {
        if (defaultTimeManager) {
          defaultTimeManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle default time failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'DefaultTimeManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_DEFAULT_TIME_STATUS') {
        if (defaultTimeManager) {
          const enabled = defaultTimeManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'DefaultTimeManager not initialized' })
        }
        return false
      }

      if (message.type === 'TOGGLE_USER_LINK_QUERY') {
        if (userLinkQueryManager) {
          userLinkQueryManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle user link query failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'UserLinkQueryManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_USER_LINK_QUERY_STATUS') {
        if (userLinkQueryManager) {
          const enabled = userLinkQueryManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'UserLinkQueryManager not initialized' })
        }
        return false
      }

      return false
    })
  },
})
