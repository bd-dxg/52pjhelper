import { initializeNavigationHider, applyNavConfig } from '../utils/navigationHider'

export default defineContentScript({
  matches: ['https://www.52pojie.cn/*'],
  main() {
    // 初始化导航隐藏功能
    initializeNavigationHider().catch((error) => {
      console.error('Failed to initialize navigation hider:', error)
    })

    // 监听来自 popup 的消息
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
      if (message.type === 'UPDATE_NAVIGATION') {
        applyNavConfig(message.config)
        sendResponse({ success: true, message: 'Navigation updated' })
      }

      return true // 保持端口开放以发送响应
    })
  },
})
