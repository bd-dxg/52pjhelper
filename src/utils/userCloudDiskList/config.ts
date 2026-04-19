import userCloudDiskListConfig from '@/configs/userCloudDiskList.json'
import type { UserCloudDiskListData } from './types'

// 存储键常量
export const STORAGE_KEY = userCloudDiskListConfig.storageKey
export const DATA_STORAGE_KEY = userCloudDiskListConfig.dataStorageKey
export const LAST_UPDATE_KEY = userCloudDiskListConfig.lastUpdateKey
export const AUTO_UPDATE_INTERVAL = userCloudDiskListConfig.autoUpdateInterval
export const USERNAME_SELECTOR = userCloudDiskListConfig.usernameSelector

// 防抖延迟时间（毫秒）
export const SCAN_DEBOUNCE_DELAY = 300

// 默认黑名单数据（示例数据）
export const DEFAULT_CloudDiskList_DATA: UserCloudDiskListData = [
  {
    forumId: 'wucloudbai',
    cloudStorages: [
      {
        provider: '百度',
        id: 'wucloudbai',
        postLink: 'https://www.52pojie.cn/thread-2090559-1-1.html',
        recorder: 'bian96',
      },
      {
        provider: '百度',
        id: '库小**72',
        postLink: 'https://www.52pojie.cn/thread-2054816-1-1.html',
        recorder: 'bian96',
      },
      {
        provider: '夸克',
        id: '乐观*朗的猫头鹰',
        postLink: '',
        recorder: '',
      },
    ],
  },
]
