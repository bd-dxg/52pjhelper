/**
 * 消息处理器模块
 * 处理来自 popup 的消息
 */

import type { IAvatarQuery } from '@features/avatarQuery/utils'
import type { IUserLinkQuery } from '@features/userLinkQuery/utils'
import type { IFloorHighlighter } from '@features/floorHighlighter/utils'
import type { INativeFloorDisplay } from '@features/nativeFloorDisplay/utils'
import type { ISelectAll } from '@features/selectAll/utils'
import type { ITableSelector } from '@features/tableSelector/utils'
import type { IDefaultTime } from '@features/defaultTime/utils'
// import type { IDuplicatePostDetection } from '@features/duplicatePostDetection/utils'
import type { IDuplicateReplyDetection } from '@features/duplicateReplyDetection/utils'
import type { IContentFilter } from '@features/contentFilter'
import type { ITableDataExtractor } from '@features/tableDataExtractor/tableDataExtractor'
import type { IUserCloudDiskList } from '@features/userCloudDiskList'
import { applyNavConfig } from '@features/navigation/navigationHider'
import { saveQuickReplyConfig, initQuickReply, cleanupQuickReply } from '@features/quickReply/utils'
import { getUserInfo, saveUserInfoToCache } from '@utils/userInfo'
import { toggleRowClickToCheck, getRowClickToCheckStatus } from '@features/rowClickToCheck/utils'
import * as autoFill from '@features/autofills'

/**
 * 管理器实例接口
 */
export interface ManagerInstances {
  avatarQueryManager: IAvatarQuery | null
  userLinkQueryManager: IUserLinkQuery | null
  quickReplyEnabled: boolean
  floorHighlighter: IFloorHighlighter | null
  nativeFloorDisplay: INativeFloorDisplay | null
  selectAllManager: ISelectAll | null
  tableSelectorManager: ITableSelector | null
  defaultTimeManager: IDefaultTime | null
  // duplicatePostDetectionManager: IDuplicatePostDetection | null
  duplicateReplyDetectionManager: IDuplicateReplyDetection | null
  contentFilterManager: IContentFilter | null
  tableDataExtractorManager: ITableDataExtractor | null
  userCloudDiskListManager: IUserCloudDiskList | null
}

/**
 * 设置快捷回复状态
 */
export function setQuickReplyEnabled(managers: ManagerInstances, enabled: boolean): void {
  managers.quickReplyEnabled = enabled
}

/**
 * 注册消息监听器
 */
export function registerMessageListener(managers: ManagerInstances): void {
  browser.runtime.onMessage.addListener((message, _, sendResponse) => {
    // 导航配置更新
    if (message.type === 'UPDATE_NAVIGATION') {
      applyNavConfig(message.config)
      sendResponse({ success: true, message: 'Navigation updated' })
      return false
    }

    // 头像查询功能切换
    if (message.type === 'TOGGLE_AVATAR_QUERY') {
      if (managers.avatarQueryManager) {
        managers.avatarQueryManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle avatar query failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'AvatarQueryManager not initialized' })
        return false
      }
    }

    // 获取头像查询状态
    if (message.type === 'GET_AVATAR_QUERY_STATUS') {
      if (managers.avatarQueryManager) {
        const enabled = managers.avatarQueryManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'AvatarQueryManager not initialized' })
      }
      return false
    }

    // 快捷回复功能切换
    if (message.type === 'TOGGLE_QUICK_REPLY') {
      managers.quickReplyEnabled = !managers.quickReplyEnabled
      saveQuickReplyConfig(managers.quickReplyEnabled)
        .then(() => {
          if (managers.quickReplyEnabled) {
            initQuickReply()
          } else {
            cleanupQuickReply()
          }
          sendResponse({ success: true, enabled: managers.quickReplyEnabled })
        })
        .catch(() => {
          sendResponse({ success: false, message: 'Failed to save config' })
        })
      return true
    }

    // 获取快捷回复状态
    if (message.type === 'GET_QUICK_REPLY_STATUS') {
      sendResponse({ success: true, enabled: managers.quickReplyEnabled })
      return false
    }

    // 楼层高亮功能切换
    if (message.type === 'TOGGLE_FLOOR_HIGHLIGHTER') {
      if (managers.floorHighlighter) {
        managers.floorHighlighter
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle floor highlighter failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'FloorHighlighter not initialized' })
        return false
      }
    }

    // 获取楼层高亮状态
    if (message.type === 'GET_FLOOR_HIGHLIGHTER_STATUS') {
      if (managers.floorHighlighter) {
        const enabled = managers.floorHighlighter.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'FloorHighlighter not initialized' })
      }
      return false
    }

    // 原生楼层显示功能切换
    if (message.type === 'TOGGLE_NATIVE_FLOOR_DISPLAY') {
      if (managers.nativeFloorDisplay) {
        managers.nativeFloorDisplay
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle native floor display failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'NativeFloorDisplay not initialized' })
        return false
      }
    }

    // 获取原生楼层显示状态
    if (message.type === 'GET_NATIVE_FLOOR_DISPLAY_STATUS') {
      if (managers.nativeFloorDisplay) {
        const enabled = managers.nativeFloorDisplay.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'NativeFloorDisplay not initialized' })
      }
      return false
    }

    // 获取用户信息
    if (message.type === 'GET_USER_INFO') {
      const userInfo = getUserInfo()
      saveUserInfoToCache(userInfo)
      sendResponse({ success: true, data: userInfo })
      return false
    }

    // 全选功能切换
    if (message.type === 'TOGGLE_SELECT_ALL') {
      if (managers.selectAllManager) {
        managers.selectAllManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle select all failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'SelectAllManager not initialized' })
        return false
      }
    }

    // 获取全选功能状态
    if (message.type === 'GET_SELECT_ALL_STATUS') {
      if (managers.selectAllManager) {
        const enabled = managers.selectAllManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'SelectAllManager not initialized' })
      }
      return false
    }

    // 分表选择器功能切换
    if (message.type === 'TOGGLE_TABLE_SELECTOR') {
      if (managers.tableSelectorManager) {
        managers.tableSelectorManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle table selector failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'TableSelectorManager not initialized' })
        return false
      }
    }

    // 获取分表选择器状态
    if (message.type === 'GET_TABLE_SELECTOR_STATUS') {
      if (managers.tableSelectorManager) {
        const enabled = managers.tableSelectorManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'TableSelectorManager not initialized' })
      }
      return false
    }

    // 默认时间功能切换
    if (message.type === 'TOGGLE_DEFAULT_TIME') {
      if (managers.defaultTimeManager) {
        managers.defaultTimeManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle default time failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'DefaultTimeManager not initialized' })
        return false
      }
    }

    // 获取默认时间状态
    if (message.type === 'GET_DEFAULT_TIME_STATUS') {
      if (managers.defaultTimeManager) {
        const enabled = managers.defaultTimeManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'DefaultTimeManager not initialized' })
      }
      return false
    }

    // 用户链接查询功能切换
    if (message.type === 'TOGGLE_USER_LINK_QUERY') {
      if (managers.userLinkQueryManager) {
        managers.userLinkQueryManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle user link query failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'UserLinkQueryManager not initialized' })
        return false
      }
    }

    // 获取用户链接查询状态
    if (message.type === 'GET_USER_LINK_QUERY_STATUS') {
      if (managers.userLinkQueryManager) {
        const enabled = managers.userLinkQueryManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'UserLinkQueryManager not initialized' })
      }
      return false
    }

    // 行点击勾选功能切换
    if (message.type === 'TOGGLE_ROW_CLICK_TO_CHECK') {
      toggleRowClickToCheck()
        .then((enabled: boolean) => {
          sendResponse({ success: true, enabled })
        })
        .catch((error: unknown) => {
          console.error('Toggle row click to check failed:', error)
          sendResponse({ success: false, message: 'Toggle failed' })
        })
      return true
    }

    // 获取行点击勾选状态
    if (message.type === 'GET_ROW_CLICK_TO_CHECK_STATUS') {
      getRowClickToCheckStatus()
        .then((enabled: boolean) => {
          sendResponse({ success: true, enabled })
        })
        .catch((error: unknown) => {
          console.error('Get row click to check status failed:', error)
          sendResponse({ success: false, message: 'Get status failed' })
        })
      return true
    }

    // 重复发帖检测功能切换
    // if (message.type === 'TOGGLE_DUPLICATE_POST_DETECTION') {
    //   if (managers.duplicatePostDetectionManager) {
    //     managers.duplicatePostDetectionManager
    //       .toggle()
    //       .then((enabled: boolean) => {
    //         sendResponse({ success: true, enabled })
    //       })
    //       .catch((error: unknown) => {
    //         console.error('Toggle duplicate post detection failed:', error)
    //         sendResponse({ success: false, message: 'Toggle failed' })
    //       })
    //     return true
    //   } else {
    //     sendResponse({ success: false, message: 'DuplicatePostDetectionManager not initialized' })
    //     return false
    //   }
    // }

    // // 获取重复发帖检测状态
    // if (message.type === 'GET_DUPLICATE_POST_DETECTION_STATUS') {
    //   if (managers.duplicatePostDetectionManager) {
    //     const enabled = managers.duplicatePostDetectionManager.getStatus()
    //     sendResponse({ success: true, enabled })
    //   } else {
    //     sendResponse({ success: false, message: 'DuplicatePostDetectionManager not initialized' })
    //   }
    //   return false
    // }

    // 自动填充功能切换
    if (message.type === 'TOGGLE_AUTO_FILL') {
      autoFill
        .toggle()
        .then(result => {
          sendResponse(result)
        })
        .catch((error: unknown) => {
          console.error('Toggle auto fill failed:', error)
          sendResponse({ success: false, message: 'Toggle failed' })
        })
      return true
    }

    // 获取自动填充状态
    if (message.type === 'GET_AUTO_FILL_STATUS') {
      const enabled = autoFill.isEnabled()
      sendResponse({ success: true, enabled })
      return false
    }

    // 内容过滤功能切换
    if (message.type === 'TOGGLE_CONTENT_FILTER') {
      if (managers.contentFilterManager) {
        managers.contentFilterManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle content filter failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'ContentFilterManager not initialized' })
        return false
      }
    }

    // 获取内容过滤状态
    if (message.type === 'GET_CONTENT_FILTER_STATUS') {
      if (managers.contentFilterManager) {
        managers.contentFilterManager
          .getStatus()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Get content filter status failed:', error)
            sendResponse({ success: false, message: 'Get status failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'ContentFilterManager not initialized' })
        return false
      }
    }

    // 表格数据提取功能切换
    if (message.type === 'TOGGLE_TABLE_DATA_EXTRACTOR') {
      if (managers.tableDataExtractorManager) {
        managers.tableDataExtractorManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle table data extractor failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'TableDataExtractorManager not initialized' })
        return false
      }
    }

    // 获取表格数据提取状态
    if (message.type === 'GET_TABLE_DATA_EXTRACTOR_STATUS') {
      if (managers.tableDataExtractorManager) {
        const enabled = managers.tableDataExtractorManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'TableDataExtractorManager not initialized' })
      }
      return false
    }

    // 用户黑名单功能切换
    if (message.type === 'TOGGLE_USER_CloudDiskList') {
      if (managers.userCloudDiskListManager) {
        managers.userCloudDiskListManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle user CloudDiskList failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'UserCloudDiskListManager not initialized' })
        return false
      }
    }

    // 获取用户黑名单状态
    if (message.type === 'GET_USER_CloudDiskList_STATUS') {
      if (managers.userCloudDiskListManager) {
        const enabled = managers.userCloudDiskListManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'UserCloudDiskListManager not initialized' })
      }
      return false
    }

    // 重新加载用户黑名单数据
    if (message.type === 'RELOAD_USER_CloudDiskList_DATA') {
      if (managers.userCloudDiskListManager) {
        // 重新加载数据并重新扫描
        const userCloudDiskListManager = managers.userCloudDiskListManager as any
        if (userCloudDiskListManager.reloadData) {
          userCloudDiskListManager
            .reloadData()
            .then(() => {
              sendResponse({ success: true, message: '数据已重新加载' })
            })
            .catch((error: unknown) => {
              console.error('重新加载用户黑名单数据失败:', error)
              sendResponse({ success: false, message: '重新加载失败' })
            })
          return true
        } else {
          sendResponse({ success: false, message: 'reloadData方法不存在' })
          return false
        }
      } else {
        sendResponse({ success: false, message: 'UserCloudDiskListManager not initialized' })
        return false
      }
    }

    // 提取表格数据
    if (message.type === 'EXTRACT_TABLE_DATA') {
      if (managers.tableDataExtractorManager) {
        // 强制提取表格数据
        const tableDataExtractorManager = managers.tableDataExtractorManager as any
        if (tableDataExtractorManager.forceExtract) {
          tableDataExtractorManager
            .forceExtract()
            .then(async () => {
              // 提取成功后，立即重新加载用户黑名单数据
              if (managers.userCloudDiskListManager) {
                const userCloudDiskListManager = managers.userCloudDiskListManager as any
                if (userCloudDiskListManager.reloadData) {
                  await userCloudDiskListManager.reloadData()
                  sendResponse({ success: true, message: '表格数据已提取并重新加载黑名单' })
                } else {
                  sendResponse({ success: true, message: '表格数据已提取（reloadData方法不存在）' })
                }
              } else {
                sendResponse({ success: true, message: '表格数据已提取（UserCloudDiskListManager未初始化）' })
              }
            })
            .catch((error: unknown) => {
              console.error('提取表格数据失败:', error)
              sendResponse({ success: false, message: '提取失败' })
            })
          return true
        } else {
          sendResponse({ success: false, message: 'forceExtract方法不存在' })
          return false
        }
      } else {
        sendResponse({ success: false, message: 'TableDataExtractorManager not initialized' })
        return false
      }
    }

    // 重复回帖检测功能切换
    if (message.type === 'TOGGLE_DUPLICATE_REPLY_DETECTION') {
      if (managers.duplicateReplyDetectionManager) {
        managers.duplicateReplyDetectionManager
          .toggle()
          .then((enabled: boolean) => {
            sendResponse({ success: true, enabled })
          })
          .catch((error: unknown) => {
            console.error('Toggle duplicate reply detection failed:', error)
            sendResponse({ success: false, message: 'Toggle failed' })
          })
        return true
      } else {
        sendResponse({ success: false, message: 'DuplicateReplyDetectionManager not initialized' })
        return false
      }
    }

    // 获取重复回帖检测状态
    if (message.type === 'GET_DUPLICATE_REPLY_DETECTION_STATUS') {
      if (managers.duplicateReplyDetectionManager) {
        const enabled = managers.duplicateReplyDetectionManager.getStatus()
        sendResponse({ success: true, enabled })
      } else {
        sendResponse({ success: false, message: 'DuplicateReplyDetectionManager not initialized' })
      }
      return false
    }

    return false
  })
}
