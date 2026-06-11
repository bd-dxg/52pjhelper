import driveSockPuppetConfig from './config.json'
import type { DriveSockPuppetData } from './types'

// 存储键常量
export const STORAGE_KEY = driveSockPuppetConfig.storageKey
export const DATA_STORAGE_KEY = driveSockPuppetConfig.dataStorageKey
export const LAST_UPDATE_KEY = driveSockPuppetConfig.lastUpdateKey
export const AUTO_UPDATE_INTERVAL = driveSockPuppetConfig.autoUpdateInterval
export const USERNAME_SELECTOR = driveSockPuppetConfig.usernameSelector

// 防抖延迟时间（毫秒）
export const SCAN_DEBOUNCE_DELAY = 300

// 默认马甲数据（示例数据）
export const DEFAULT_SOCK_PUPPET_DATA: DriveSockPuppetData = [
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
