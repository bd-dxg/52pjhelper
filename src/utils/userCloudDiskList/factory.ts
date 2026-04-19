import type { IUserCloudDiskList } from './types'
import { UserCloudDiskListManager } from './manager'
import userCloudDiskListConfig from '@/configs/userCloudDiskList.json'

/**
 * 创建用户黑名单管理器实例
 */
export function createUserCloudDiskList(): IUserCloudDiskList {
  const manager = new UserCloudDiskListManager()

  // 异步初始化，不阻塞构造
  void manager.init(userCloudDiskListConfig.defaultEnabled)

  return {
    enable: () => manager.enable(),
    disable: () => manager.disable(),
    toggle: () => manager.toggle(),
    getStatus: () => manager.getStatus(),
    updateData: data => manager.updateData(data),
    getData: () => manager.getData(),
    shouldAutoUpdate: () => manager.checkShouldAutoUpdate(),
    reloadData: () => manager.reloadData(),
  }
}
