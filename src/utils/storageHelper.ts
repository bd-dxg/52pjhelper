/**
 * 存储操作辅助工具
 * 提供统一的浏览器存储操作接口
 */

/**
 * 存储操作辅助工具接口
 */
export interface IStorageHelper {
  /**
   * 加载布尔类型配置
   * @param key 存储键
   * @param defaultValue 默认值
   */
  loadBoolean(key: string, defaultValue: boolean): Promise<boolean>

  /**
   * 保存布尔类型配置
   * @param key 存储键
   * @param value 值
   */
  saveBoolean(key: string, value: boolean): Promise<void>

  /**
   * 加载字符串类型配置
   * @param key 存储键
   * @param defaultValue 默认值
   */
  loadString(key: string, defaultValue: string): Promise<string>

  /**
   * 保存字符串类型配置
   * @param key 存储键
   * @param value 值
   */
  saveString(key: string, value: string): Promise<void>

  /**
   * 加载数字类型配置
   * @param key 存储键
   * @param defaultValue 默认值
   */
  loadNumber(key: string, defaultValue: number): Promise<number>

  /**
   * 保存数字类型配置
   * @param key 存储键
   * @param value 值
   */
  saveNumber(key: string, value: number): Promise<void>

  /**
   * 加载数组类型配置
   * @param key 存储键
   * @param defaultValue 默认值
   */
  loadArray<T>(key: string, defaultValue: T[]): Promise<T[]>

  /**
   * 保存数组类型配置
   * @param key 存储键
   * @param value 值
   */
  saveArray<T>(key: string, value: T[]): Promise<void>

  /**
   * 加载对象类型配置
   * @param key 存储键
   * @param defaultValue 默认值
   */
  loadObject<T extends Record<string, unknown>>(key: string, defaultValue: T): Promise<T>

  /**
   * 保存对象类型配置
   * @param key 存储键
   * @param value 值
   */
  saveObject<T extends Record<string, unknown>>(key: string, value: T): Promise<void>

  /**
   * 批量加载配置
   * @param keys 存储键数组
   */
  loadMultiple(keys: string[]): Promise<Record<string, unknown>>

  /**
   * 批量保存配置
   * @param data 键值对对象
   */
  saveMultiple(data: Record<string, unknown>): Promise<void>

  /**
   * 删除配置
   * @param key 存储键
   */
  remove(key: string): Promise<void>

  /**
   * 批量删除配置
   * @param keys 存储键数组
   */
  removeMultiple(keys: string[]): Promise<void>

  /**
   * 清空所有配置
   */
  clear(): Promise<void>
}

/**
 * 创建存储操作辅助工具实例
 */
export function createStorageHelper(): IStorageHelper {
  /**
   * 加载布尔类型配置
   */
  const loadBoolean = async (key: string, defaultValue: boolean): Promise<boolean> => {
    try {
      const result = await browser.storage.local.get(key)
      return (result[key] as boolean | undefined) ?? defaultValue
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 保存布尔类型配置
   */
  const saveBoolean = async (key: string, value: boolean): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`保存配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 加载字符串类型配置
   */
  const loadString = async (key: string, defaultValue: string): Promise<string> => {
    try {
      const result = await browser.storage.local.get(key)
      return (result[key] as string | undefined) ?? defaultValue
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 保存字符串类型配置
   */
  const saveString = async (key: string, value: string): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`保存配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 加载数字类型配置
   */
  const loadNumber = async (key: string, defaultValue: number): Promise<number> => {
    try {
      const result = await browser.storage.local.get(key)
      const value = result[key]
      return typeof value === 'number' ? value : defaultValue
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 保存数字类型配置
   */
  const saveNumber = async (key: string, value: number): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`保存配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 加载数组类型配置
   */
  const loadArray = async <T>(key: string, defaultValue: T[]): Promise<T[]> => {
    try {
      const result = await browser.storage.local.get(key)
      const value = result[key]
      return Array.isArray(value) ? (value as T[]) : defaultValue
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 保存数组类型配置
   */
  const saveArray = async <T>(key: string, value: T[]): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`保存配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 加载对象类型配置
   */
  const loadObject = async <T extends Record<string, unknown>>(
    key: string,
    defaultValue: T,
  ): Promise<T> => {
    try {
      const result = await browser.storage.local.get(key)
      const value = result[key]
      return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as T)
        : defaultValue
    } catch (error) {
      console.error(`加载配置失败 [${key}]:`, error)
      return defaultValue
    }
  }

  /**
   * 保存对象类型配置
   */
  const saveObject = async <T extends Record<string, unknown>>(
    key: string,
    value: T,
  ): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value })
    } catch (error) {
      console.error(`保存配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 批量加载配置
   */
  const loadMultiple = async (keys: string[]): Promise<Record<string, unknown>> => {
    try {
      return await browser.storage.local.get(keys)
    } catch (error) {
      console.error('批量加载配置失败:', error)
      return {}
    }
  }

  /**
   * 批量保存配置
   */
  const saveMultiple = async (data: Record<string, unknown>): Promise<void> => {
    try {
      await browser.storage.local.set(data)
    } catch (error) {
      console.error('批量保存配置失败:', error)
      throw error
    }
  }

  /**
   * 删除配置
   */
  const remove = async (key: string): Promise<void> => {
    try {
      await browser.storage.local.remove(key)
    } catch (error) {
      console.error(`删除配置失败 [${key}]:`, error)
      throw error
    }
  }

  /**
   * 批量删除配置
   */
  const removeMultiple = async (keys: string[]): Promise<void> => {
    try {
      await browser.storage.local.remove(keys)
    } catch (error) {
      console.error('批量删除配置失败:', error)
      throw error
    }
  }

  /**
   * 清空所有配置
   */
  const clear = async (): Promise<void> => {
    try {
      await browser.storage.local.clear()
    } catch (error) {
      console.error('清空配置失败:', error)
      throw error
    }
  }

  return {
    loadBoolean,
    saveBoolean,
    loadString,
    saveString,
    loadNumber,
    saveNumber,
    loadArray,
    saveArray,
    loadObject,
    saveObject,
    loadMultiple,
    saveMultiple,
    remove,
    removeMultiple,
    clear,
  }
}

/**
 * 默认导出单例实例
 */
export const storageHelper = createStorageHelper()
