export type { IUserBlacklist, UserBlacklistData, UserBlacklistItem, CloudStorageRecord } from './types'
export { createUserBlacklist } from './factory'

// 重新导出配置常量（如果需要）
export { STORAGE_KEY, DATA_STORAGE_KEY, LAST_UPDATE_KEY, AUTO_UPDATE_INTERVAL, USERNAME_SELECTOR } from './config'