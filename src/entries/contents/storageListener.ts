/**
 * 存储监听器模块
 * 监听浏览器存储变化，实现跨页面状态同步
 */

import type { UserNavConfig } from '@features/navigation/navigationHider'
import { applyNavConfig } from '@features/navigation/navigationHider'
import { initQuickReply, cleanupQuickReply } from '@features/quickReply/utils'
import { initPopupQuickReply, cleanupPopupQuickReply } from '@features/popupQuickReply/utils'
import { enableRowClickToCheck, disableRowClickToCheck } from '@features/rowClickToCheck/utils'
import * as autoFill from '@features/autofills'
import type { ManagerInstances } from './messageHandler'

/**
 * 注册存储变化监听器
 */
export function registerStorageListener(managers: ManagerInstances): void {
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      // 处理导航配置变化
      if (changes.navigationConfig) {
        const newConfig = changes.navigationConfig.newValue
        // 类型安全检查
        if (
          newConfig &&
          typeof newConfig === 'object' &&
          'hiddenMenus' in newConfig &&
          Array.isArray(newConfig.hiddenMenus)
        ) {
          applyNavConfig(newConfig as UserNavConfig)
        }
      }

      // 处理头像查询配置变化
      if (changes.avatarQueryEnabled) {
        const newValue = changes.avatarQueryEnabled.newValue
        if (managers.avatarQueryManager) {
          if (newValue) {
            managers.avatarQueryManager.enable()
          } else {
            managers.avatarQueryManager.disable()
          }
        }
      }

      // 处理快捷回复配置变化
      if (changes.quickReplyEnabled) {
        const newValue = Boolean(changes.quickReplyEnabled.newValue)
        managers.quickReplyEnabled = newValue
        if (newValue) {
          initQuickReply()
        } else {
          cleanupQuickReply()
        }
      }

      // 处理楼层高亮配置变化
      if (changes.floorHighlighterEnabled) {
        const newValue = changes.floorHighlighterEnabled.newValue
        if (managers.floorHighlighter) {
          if (newValue) {
            managers.floorHighlighter.enable()
          } else {
            managers.floorHighlighter.disable()
          }
        }
      }

      // 处理原生楼层显示配置变化
      if (changes.nativeFloorDisplayEnabled) {
        const newValue = changes.nativeFloorDisplayEnabled.newValue
        if (managers.nativeFloorDisplay) {
          if (newValue) {
            managers.nativeFloorDisplay.enable()
          } else {
            managers.nativeFloorDisplay.disable()
          }
        }
      }

      // 处理全选功能配置变化
      if (changes.selectAllEnabled) {
        const newValue = changes.selectAllEnabled.newValue
        if (managers.selectAllManager) {
          if (newValue) {
            managers.selectAllManager.enable()
          } else {
            managers.selectAllManager.disable()
          }
        }
      }

      // 处理分表选择器配置变化
      if (changes.tableSelectorEnabled) {
        const newValue = changes.tableSelectorEnabled.newValue
        if (managers.tableSelectorManager) {
          if (newValue) {
            managers.tableSelectorManager.enable()
          } else {
            managers.tableSelectorManager.disable()
          }
        }
      }

      // 处理默认时间配置变化
      if (changes.defaultTimeEnabled) {
        const newValue = changes.defaultTimeEnabled.newValue
        if (managers.defaultTimeManager) {
          if (newValue) {
            managers.defaultTimeManager.enable()
          } else {
            managers.defaultTimeManager.disable()
          }
        }
      }

      // 处理用户链接查询配置变化
      if (changes.userLinkQueryEnabled) {
        const newValue = changes.userLinkQueryEnabled.newValue
        if (managers.userLinkQueryManager) {
          if (newValue) {
            managers.userLinkQueryManager.enable()
          } else {
            managers.userLinkQueryManager.disable()
          }
        }
      }

      // 处理自动填充配置变化
      if (changes.autoFillEnabled) {
        const newValue = changes.autoFillEnabled.newValue
        if (newValue) {
          autoFill.enable()
        } else {
          autoFill.disable()
        }
      }

      // 处理行点击勾选配置变化
      if (changes.rowClickToCheckEnabled) {
        const newValue = changes.rowClickToCheckEnabled.newValue
        if (newValue) {
          enableRowClickToCheck()
        } else {
          disableRowClickToCheck()
        }
      }

      // 处理重复发帖检测配置变化
      // if (changes.duplicatePostDetectionEnabled) {
      //   const newValue = changes.duplicatePostDetectionEnabled.newValue
      //   if (managers.duplicatePostDetectionManager) {
      //     if (newValue) {
      //       managers.duplicatePostDetectionManager.enable()
      //     } else {
      //       managers.duplicatePostDetectionManager.disable()
      //     }
      //   }
      // }

      // 处理重复回帖检测配置变化
      if (changes.duplicateReplyDetectionEnabled) {
        const newValue = changes.duplicateReplyDetectionEnabled.newValue
        if (managers.duplicateReplyDetectionManager) {
          if (newValue) {
            managers.duplicateReplyDetectionManager.enable()
          } else {
            managers.duplicateReplyDetectionManager.disable()
          }
        }
      }

      // 处理弹窗快捷回复配置变化
      if (changes.popupQuickReplyEnabled) {
        const newValue = Boolean(changes.popupQuickReplyEnabled.newValue)
        if (newValue) {
          initPopupQuickReply()
        } else {
          cleanupPopupQuickReply()
        }
      }
    }
  })
}
