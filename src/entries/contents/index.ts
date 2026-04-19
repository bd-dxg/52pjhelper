/**
 * Content Script 主入口
 * 负责协调各个功能模块的初始化和运行
 */

import type { ManagerInstances } from './messageHandler'
import { registerMessageListener } from './messageHandler'
import { registerStorageListener } from './storageListener'
import { initializeManagers } from './initialization'

// 防止重复初始化的标记
const INIT_FLAG = '__52pj_helper_initialized__'

// 创建管理器实例容器
const managers: ManagerInstances = {
  avatarQueryManager: null,
  userLinkQueryManager: null,
  quickReplyEnabled: false,
  floorHighlighter: null,
  nativeFloorDisplay: null,
  selectAllManager: null,
  tableSelectorManager: null,
  defaultTimeManager: null,
  duplicatePostDetectionManager: null,
  contentFilterManager: null,
  tableDataExtractorManager: null,
  userCloudDiskListManager: null,
}

export default defineContentScript({
  matches: ['https://www.52pojie.cn/*'],
  main() {
    // 检查是否已经初始化
    if ((window as any)[INIT_FLAG]) {
      return
    }
    ;(window as any)[INIT_FLAG] = true

    // 初始化所有功能管理器
    initializeManagers(managers)

    // 注册存储变化监听器
    registerStorageListener(managers)

    // 注册消息监听器
    registerMessageListener(managers)
  },
})
