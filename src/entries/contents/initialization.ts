/**
 * 功能初始化模块
 * 负责初始化所有功能管理器
 */

import { initializeNavigationHider } from '@features/navigation/navigationHider'
import { createAvatarQuery } from '@features/avatarQuery/utils'
import { createUserLinkQuery } from '@features/userLinkQuery/utils'
import { loadQuickReplyConfig, initQuickReply } from '@features/quickReply/utils'
import { createFloorHighlighter } from '@features/floorHighlighter/utils'
import { createNativeFloorDisplay } from '@features/nativeFloorDisplay/utils'
import { createSelectAll } from '@features/selectAll/utils'
import { createTableSelector } from '@features/tableSelector/utils'
import { createDefaultTime } from '@features/defaultTime/utils'
// import { createDuplicatePostDetection } from '@features/duplicatePostDetection/utils'
import { createDuplicateReplyDetection } from '@features/duplicateReplyDetection/utils'
import { initializeRowClickToCheck } from '@features/rowClickToCheck/utils'
import { createContentFilter } from '@features/contentFilter'
import { createTableDataExtractor } from '@features/tableDataExtractor/tableDataExtractor'
import { createUserCloudDiskList } from '@features/userCloudDiskList'
import { initPopupQuickReply } from '@features/popupQuickReply/utils'
import * as autoFill from '@features/autofills'
import type { ManagerInstances } from './messageHandler'

/**
 * 初始化所有功能管理器
 */
export async function initializeManagers(managers: ManagerInstances): Promise<void> {
  // 初始化导航隐藏功能
  initializeNavigationHider().catch(error => {
    console.error('Failed to initialize navigation hider:', error)
  })

  // 初始化头像查询功能
  managers.avatarQueryManager = createAvatarQuery()

  // 初始化用户链接查询功能
  managers.userLinkQueryManager = createUserLinkQuery()

  // 初始化快捷回复功能
  loadQuickReplyConfig().then(enabled => {
    managers.quickReplyEnabled = enabled
    if (enabled) {
      initQuickReply()
    }
  })

  // 初始化楼层高亮功能
  managers.floorHighlighter = createFloorHighlighter()

  // 初始化原生楼层显示功能
  managers.nativeFloorDisplay = createNativeFloorDisplay()

  // 初始化全选功能
  managers.selectAllManager = createSelectAll()

  // 初始化分表选择器功能
  managers.tableSelectorManager = createTableSelector()

  // 初始化默认时间功能
  managers.defaultTimeManager = createDefaultTime()

  // 初始化自动填充功能
  autoFill.init()

  // 初始化行点击勾选功能
  initializeRowClickToCheck().catch(error => {
    console.error('Failed to initialize row click to check:', error)
  })

  // 初始化重复发帖检测功能
  // managers.duplicatePostDetectionManager = createDuplicatePostDetection()

  // 初始化重复回帖检测功能
  managers.duplicateReplyDetectionManager = createDuplicateReplyDetection()

  // 初始化内容过滤功能
  managers.contentFilterManager = createContentFilter()

  // 初始化表格数据提取功能
  managers.tableDataExtractorManager = createTableDataExtractor()

  // 初始化网盘黑名单功能
  managers.userCloudDiskListManager = createUserCloudDiskList()

  // 初始化弹窗快捷回复功能
  initPopupQuickReply()
}
