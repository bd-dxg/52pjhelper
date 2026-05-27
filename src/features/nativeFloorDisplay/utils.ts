/**
 * 悬赏贴原生楼层显示工具类
 * 显示已结帖的原生楼层，方便管理悬赏贴
 */

import nativeFloorDisplayConfig from './config.json'
import { storageHelper } from '@/utils/storageHelper'

const STORAGE_KEY = nativeFloorDisplayConfig.storageKey

/**
 * 原生楼层显示管理器接口
 */
export interface INativeFloorDisplay {
  enable(): Promise<void>
  disable(): Promise<void>
  toggle(): Promise<boolean>
  getStatus(): boolean
}

/**
 * 创建原生楼层显示管理器实例
 */
export function createNativeFloorDisplay(): INativeFloorDisplay {
  let enabled = false

  /**
   * 判断当前页面是否为已结帖状态
   */
  const isReward = (): boolean => {
    return document.querySelector('.rsld.z') ? true : false
  }

  /**
   * 获取当前页所有pidDom
   */
  const getAllPidDom = (): Array<{ id: number; dom: HTMLElement }> => {
    const allDom = Array.from(document.querySelectorAll('#postlist .plhin:not(.res-postfirst)')) as HTMLElement[]
    const allId = allDom.map(pidDom => {
      const match = pidDom.id.match(/pid(\d+)/)
      return match ? Number(match[1]) : null
    })
    // 返回两个数组组合成的对象数组
    return allId.map((item, index) => {
      return {
        id: item,
        dom: allDom[index],
      }
    }).filter((item): item is { id: number; dom: HTMLElement } => item.id !== null)
  }

  /**
   * 设置悬赏回帖的原生楼层
   */
  const setNativeFloor = (index: number, dom: HTMLElement): void => {
    const textAnswer = dom.querySelector('.pi strong a')
    if (!textAnswer) return

    const createAnswerDom = document.createElement('span')
    createAnswerDom.textContent = `原楼层: ${index} 楼 `
    if (index === 10) {
      const ansText = dom.querySelector('.plc a span')?.textContent ?? null
      if (ansText === '最佳答案') {
        createAnswerDom.textContent += `也可能在第一页以后 `
      }
    } else if (index > 10) {
      createAnswerDom.textContent = `原楼层大于10楼,不在第一页`
    }
    createAnswerDom.style.color = 'green'
    createAnswerDom.style.fontWeight = 'bold'
    createAnswerDom.classList.add('native-floor-tag') // 添加类名方便清理
    textAnswer.insertBefore(createAnswerDom, textAnswer.firstChild)
  }

  /**
   * 初始化原生楼层显示
   */
  const initNativeFloorDisplay = (): void => {
    // 非悬赏贴直接结束
    if (!isReward()) return
    // 获取当前页所有pidDom
    const pidListDom = getAllPidDom()
    // 重新排序pidListDom
    const pidListDomSort = pidListDom.sort((a, b) => a.id - b.id)
    pidListDomSort.forEach((item, index) => {
      // +2 是因为主题帖占1L 最佳答案占2L
      setNativeFloor(index + 2, item.dom)
    })
  }

  /**
   * 清理已添加的原生楼层标签
   */
  const cleanup = (): void => {
    document.querySelectorAll('.native-floor-tag').forEach(tag => {
      tag.remove()
    })
  }

  /**
   * 从存储加载配置
   */
  const loadConfig = async (): Promise<void> => {
    enabled = await storageHelper.loadBoolean(STORAGE_KEY, nativeFloorDisplayConfig.defaultEnabled)
  }

  /**
   * 保存配置到存储
   */
  const saveConfig = async (): Promise<void> => {
    await storageHelper.saveBoolean(STORAGE_KEY, enabled)
  }

  /**
   * 启用功能
   */
  const enable = async (): Promise<void> => {
    if (enabled) return
    enabled = true
    await saveConfig()
    initNativeFloorDisplay()
  }

  /**
   * 禁用功能
   */
  const disable = async (): Promise<void> => {
    if (!enabled) return
    enabled = false
    await saveConfig()
    cleanup()
  }

  /**
   * 切换功能开关
   */
  const toggle = async (): Promise<boolean> => {
    if (enabled) {
      await disable()
    } else {
      await enable()
    }
    return enabled
  }

  /**
   * 获取功能状态
   */
  const getStatus = (): boolean => enabled

  /**
   * 初始化
   */
  const init = async (): Promise<void> => {
    await loadConfig()
    if (enabled) {
      initNativeFloorDisplay()
    }
  }

  // 异步初始化，不阻塞构造
  void init()

  return {
    enable,
    disable,
    toggle,
    getStatus
  }
}