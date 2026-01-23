import { initializeNavigationHider, applyNavConfig } from '../utils/navigationHider'
import { QuickQueryManager } from '../utils/quickQuery'
import { loadQuickReplyConfig, saveQuickReplyConfig, initQuickReply, cleanupQuickReply } from '../utils/quickReply'
import { FloorHighlighter } from '../utils/floorHighlighter'
import { getUserInfo } from '../utils/userInfo'

// 防止重复初始化的标记
const INIT_FLAG = '__52pj_helper_initialized__'

// 创建便捷查询管理器实例
let quickQueryManager: QuickQueryManager | null = null
let quickReplyEnabled = false
let floorHighlighter: FloorHighlighter | null = null

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

    // 初始化便捷查询功能
    quickQueryManager = new QuickQueryManager()

    // 初始化快捷回复功能
    loadQuickReplyConfig().then(enabled => {
      quickReplyEnabled = enabled
      if (enabled) {
        initQuickReply()
      }
    })

    // 初始化楼层高亮功能
    floorHighlighter = new FloorHighlighter()

    // 监听来自 popup 的消息
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
      console.log('收到消息:', message.type)

      if (message.type === 'UPDATE_NAVIGATION') {
        applyNavConfig(message.config)
        sendResponse({ success: true, message: 'Navigation updated' })
        return false
      }

      if (message.type === 'TOGGLE_QUICK_QUERY') {
        if (quickQueryManager) {
          quickQueryManager
            .toggle()
            .then(enabled => {
              sendResponse({ success: true, enabled })
            })
            .catch(error => {
              console.error('Toggle quick query failed:', error)
              sendResponse({ success: false, message: 'Toggle failed' })
            })
          return true // 异步响应，保持端口开放
        } else {
          sendResponse({ success: false, message: 'QuickQueryManager not initialized' })
          return false
        }
      }

      if (message.type === 'GET_QUICK_QUERY_STATUS') {
        if (quickQueryManager) {
          const enabled = quickQueryManager.getStatus()
          sendResponse({ success: true, enabled })
        } else {
          sendResponse({ success: false, message: 'QuickQueryManager not initialized' })
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

      if (message.type === 'GET_USER_INFO') {
        const userInfo = getUserInfo()
        sendResponse({ success: true, data: userInfo })
        return false
      }

      return false
    })
  },
})
