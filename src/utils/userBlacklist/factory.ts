import type { IUserBlacklist } from './types'
import { UserBlacklistManager } from './manager'
import userBlacklistConfig from '@/configs/userBlacklist.json'

/**
 * 创建用户黑名单管理器实例
 */
export function createUserBlacklist(): IUserBlacklist {
  const manager = new UserBlacklistManager()

  // 异步初始化，不阻塞构造
  void manager.init(userBlacklistConfig.defaultEnabled)

  return {
    enable: () => manager.enable(),
    disable: () => manager.disable(),
    toggle: () => manager.toggle(),
    getStatus: () => manager.getStatus(),
    updateData: (data) => manager.updateData(data),
    getData: () => manager.getData(),
    shouldAutoUpdate: () => manager.checkShouldAutoUpdate(),
    reloadData: () => manager.reloadData(),
  }
}