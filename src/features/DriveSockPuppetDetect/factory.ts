import type { IDriveSockPuppetDetect } from './types'
import { DriveSockPuppetManager } from './manager'
import driveSockPuppetConfig from './config.json'

/**
 * 创建用户马甲检测管理器实例
 */
export function createDriveSockPuppetDetect(): IDriveSockPuppetDetect {
  const manager = new DriveSockPuppetManager()

  // 异步初始化，不阻塞构造
  void manager.init(driveSockPuppetConfig.defaultEnabled)

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
