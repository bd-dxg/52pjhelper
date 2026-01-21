import { initializeNavigationHider, applyNavConfig } from '../utils/navigationHider'
import { QuickQueryManager } from '../utils/quickQuery'

// 防止重复初始化的标记
const INIT_FLAG = '__52pj_helper_initialized__'

// 创建便捷查询管理器实例
let quickQueryManager: QuickQueryManager | null = null

export default defineContentScript({
  matches: ['https://www.52pojie.cn/*'],
  main() {
    // 检查是否已经初始化
    if ((window as any)[INIT_FLAG]) {
      console.log('扩展已初始化，跳过重复初始化')
      return
    }
    (window as any)[INIT_FLAG] = true
    console.log('扩展开始初始化')

    // 初始化导航隐藏功能
    initializeNavigationHider().catch((error) => {
      console.error('Failed to initialize navigation hider:', error)
    })

    // 初始化便捷查询功能
    quickQueryManager = new QuickQueryManager()

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
            .then((enabled) => {
              sendResponse({ success: true, enabled })
            })
            .catch((error) => {
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

      return false
    })
  },
})
