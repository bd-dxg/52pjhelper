import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { createStorageHelper } from '@/utils/storageHelper'

describe('storageHelper', () => {
  let storageHelper: ReturnType<typeof createStorageHelper>

  beforeEach(() => {
    // 重置 fake browser 状态，确保每个测试独立
    fakeBrowser.reset()
    // 创建新的 storageHelper 实例
    storageHelper = createStorageHelper()
  })

  describe('布尔类型操作', () => {
    it('应该保存并加载布尔值 true', async () => {
      await storageHelper.saveBoolean('testKey', true)
      const result = await storageHelper.loadBoolean('testKey', false)
      expect(result).toBe(true)
    })

    it('应该保存并加载布尔值 false', async () => {
      await storageHelper.saveBoolean('testKey', false)
      const result = await storageHelper.loadBoolean('testKey', true)
      expect(result).toBe(false)
    })

    it('当键不存在时应该返回默认值', async () => {
      const result = await storageHelper.loadBoolean('nonExistentKey', true)
      expect(result).toBe(true)
    })

    it('当键不存在时应该返回默认值 false', async () => {
      const result = await storageHelper.loadBoolean('nonExistentKey', false)
      expect(result).toBe(false)
    })
  })

  describe('数字类型操作', () => {
    it('应该保存并加载正整数', async () => {
      await storageHelper.saveNumber('testKey', 42)
      const result = await storageHelper.loadNumber('testKey', 0)
      expect(result).toBe(42)
    })

    it('应该保存并加载负数', async () => {
      await storageHelper.saveNumber('testKey', -100)
      const result = await storageHelper.loadNumber('testKey', 0)
      expect(result).toBe(-100)
    })

    it('应该保存并加载浮点数', async () => {
      await storageHelper.saveNumber('testKey', 3.14159)
      const result = await storageHelper.loadNumber('testKey', 0)
      expect(result).toBe(3.14159)
    })

    it('应该保存并加载零', async () => {
      await storageHelper.saveNumber('testKey', 0)
      const result = await storageHelper.loadNumber('testKey', 999)
      expect(result).toBe(0)
    })

    it('当键不存在时应该返回默认值', async () => {
      const result = await storageHelper.loadNumber('nonExistentKey', 42)
      expect(result).toBe(42)
    })

    it('当存储的值不是数字时应该返回默认值', async () => {
      await browser.storage.local.set({ testKey: 'not a number' })
      const result = await storageHelper.loadNumber('testKey', 99)
      expect(result).toBe(99)
    })

    it('当存储的值是布尔值时应该返回默认值', async () => {
      await browser.storage.local.set({ testKey: true })
      const result = await storageHelper.loadNumber('testKey', 99)
      expect(result).toBe(99)
    })
  })

  describe('字符串类型操作', () => {
    it('应该保存并加载字符串', async () => {
      const testString = 'Hello, World!'
      await storageHelper.saveString('testKey', testString)
      const result = await storageHelper.loadString('testKey', '')
      expect(result).toBe(testString)
    })

    it('应该保存并加载空字符串', async () => {
      await storageHelper.saveString('testKey', '')
      const result = await storageHelper.loadString('testKey', 'default')
      expect(result).toBe('')
    })

    it('当键不存在时应该返回默认值', async () => {
      const defaultValue = 'default value'
      const result = await storageHelper.loadString('nonExistentKey', defaultValue)
      expect(result).toBe(defaultValue)
    })

    it('应该保存并加载包含特殊字符的字符串', async () => {
      const specialString = '特殊字符 !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      await storageHelper.saveString('testKey', specialString)
      const result = await storageHelper.loadString('testKey', '')
      expect(result).toBe(specialString)
    })
  })

  describe('数组类型操作', () => {
    it('应该保存并加载数字数组', async () => {
      const testArray = [1, 2, 3, 4, 5]
      await storageHelper.saveArray('testKey', testArray)
      const result = await storageHelper.loadArray('testKey', [])
      expect(result).toEqual(testArray)
    })

    it('应该保存并加载字符串数组', async () => {
      const testArray = ['apple', 'banana', 'cherry']
      await storageHelper.saveArray('testKey', testArray)
      const result = await storageHelper.loadArray('testKey', [])
      expect(result).toEqual(testArray)
    })

    it('应该保存并加载对象数组', async () => {
      const testArray = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      await storageHelper.saveArray('testKey', testArray)
      const result = await storageHelper.loadArray('testKey', [])
      expect(result).toEqual(testArray)
    })

    it('应该保存并加载空数组', async () => {
      await storageHelper.saveArray('testKey', [])
      const result = await storageHelper.loadArray('testKey', [1, 2, 3])
      expect(result).toEqual([])
    })

    it('当键不存在时应该返回默认值', async () => {
      const defaultValue = [1, 2, 3]
      const result = await storageHelper.loadArray('nonExistentKey', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    it('当存储的值不是数组时应该返回默认值', async () => {
      // 直接设置一个非数组值
      await browser.storage.local.set({ testKey: 'not an array' })
      const defaultValue = [1, 2, 3]
      const result = await storageHelper.loadArray('testKey', defaultValue)
      expect(result).toEqual(defaultValue)
    })
  })

  describe('对象类型操作', () => {
    it('应该保存并加载简单对象', async () => {
      const testObject = { name: 'Alice', age: 30 }
      await storageHelper.saveObject('testKey', testObject)
      const result = await storageHelper.loadObject('testKey', {})
      expect(result).toEqual(testObject)
    })

    it('应该保存并加载嵌套对象', async () => {
      const testObject = {
        user: {
          name: 'Alice',
          profile: {
            age: 30,
            city: 'Beijing',
          },
        },
        settings: {
          theme: 'dark',
          notifications: true,
        },
      }
      await storageHelper.saveObject('testKey', testObject)
      const result = await storageHelper.loadObject('testKey', {})
      expect(result).toEqual(testObject)
    })

    it('应该保存并加载空对象', async () => {
      await storageHelper.saveObject('testKey', {})
      const result = await storageHelper.loadObject('testKey', { default: 'value' })
      expect(result).toEqual({})
    })

    it('当键不存在时应该返回默认值', async () => {
      const defaultValue = { default: 'value' }
      const result = await storageHelper.loadObject('nonExistentKey', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    it('当存储的值不是对象时应该返回默认值', async () => {
      // 直接设置一个非对象值
      await browser.storage.local.set({ testKey: 'not an object' })
      const defaultValue = { default: 'value' }
      const result = await storageHelper.loadObject('testKey', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    it('当存储的值是数组时应该返回默认值', async () => {
      // 数组也是对象，但应该被排除
      await browser.storage.local.set({ testKey: [1, 2, 3] })
      const defaultValue = { default: 'value' }
      const result = await storageHelper.loadObject('testKey', defaultValue)
      expect(result).toEqual(defaultValue)
    })
  })

  describe('批量操作', () => {
    it('应该批量保存并加载多个配置', async () => {
      const testData = {
        key1: 'value1',
        key2: 123,
        key3: true,
        key4: ['a', 'b', 'c'],
      }
      await storageHelper.saveMultiple(testData)
      const result = await storageHelper.loadMultiple(['key1', 'key2', 'key3', 'key4'])
      expect(result).toEqual(testData)
    })

    it('应该批量加载部分存在的配置', async () => {
      await storageHelper.saveString('existingKey', 'value')
      const result = await storageHelper.loadMultiple(['existingKey', 'nonExistentKey'])
      expect(result).toEqual({ existingKey: 'value' })
    })

    it('应该批量加载空数组返回空对象', async () => {
      const result = await storageHelper.loadMultiple([])
      expect(result).toEqual({})
    })
  })

  describe('删除操作', () => {
    it('应该删除单个配置', async () => {
      await storageHelper.saveString('testKey', 'value')
      await storageHelper.remove('testKey')
      const result = await storageHelper.loadString('testKey', 'default')
      expect(result).toBe('default')
    })

    it('应该批量删除多个配置', async () => {
      await storageHelper.saveString('key1', 'value1')
      await storageHelper.saveString('key2', 'value2')
      await storageHelper.saveString('key3', 'value3')

      await storageHelper.removeMultiple(['key1', 'key2'])

      const result1 = await storageHelper.loadString('key1', 'default')
      const result2 = await storageHelper.loadString('key2', 'default')
      const result3 = await storageHelper.loadString('key3', 'default')

      expect(result1).toBe('default')
      expect(result2).toBe('default')
      expect(result3).toBe('value3')
    })

    it('删除不存在的键不应该报错', async () => {
      await expect(storageHelper.remove('nonExistentKey')).resolves.toBeUndefined()
    })
  })

  describe('清空操作', () => {
    it('应该清空所有配置', async () => {
      await storageHelper.saveString('key1', 'value1')
      await storageHelper.saveString('key2', 'value2')
      await storageHelper.saveBoolean('key3', true)

      await storageHelper.clear()

      const result1 = await storageHelper.loadString('key1', 'default')
      const result2 = await storageHelper.loadString('key2', 'default')
      const result3 = await storageHelper.loadBoolean('key3', false)

      expect(result1).toBe('default')
      expect(result2).toBe('default')
      expect(result3).toBe(false)
    })

    it('清空空存储不应该报错', async () => {
      await expect(storageHelper.clear()).resolves.toBeUndefined()
    })
  })

  describe('边界情况', () => {
    it('应该处理包含中文的键名', async () => {
      await storageHelper.saveString('中文键名', '中文值')
      const result = await storageHelper.loadString('中文键名', '')
      expect(result).toBe('中文值')
    })

    it('应该处理非常长的字符串', async () => {
      const longString = 'a'.repeat(10000)
      await storageHelper.saveString('testKey', longString)
      const result = await storageHelper.loadString('testKey', '')
      expect(result).toBe(longString)
    })

    it('应该处理包含 null 值的对象', async () => {
      const testObject = { key: null }
      await storageHelper.saveObject('testKey', testObject)
      const result = await storageHelper.loadObject('testKey', {})
      expect(result).toEqual(testObject)
    })

    it('应该处理包含 undefined 值的对象', async () => {
      const testObject = { key: undefined }
      await storageHelper.saveObject('testKey', testObject)
      const result = await storageHelper.loadObject('testKey', {})
      // undefined 在 JSON 序列化时会被忽略
      expect(result).toEqual({})
    })
  })

  describe('并发操作', () => {
    it('应该正确处理并发保存操作', async () => {
      const promises = [
        storageHelper.saveString('key1', 'value1'),
        storageHelper.saveString('key2', 'value2'),
        storageHelper.saveString('key3', 'value3'),
      ]

      await Promise.all(promises)

      const result1 = await storageHelper.loadString('key1', '')
      const result2 = await storageHelper.loadString('key2', '')
      const result3 = await storageHelper.loadString('key3', '')

      expect(result1).toBe('value1')
      expect(result2).toBe('value2')
      expect(result3).toBe('value3')
    })

    it('应该正确处理并发加载操作', async () => {
      await storageHelper.saveString('key1', 'value1')
      await storageHelper.saveString('key2', 'value2')
      await storageHelper.saveString('key3', 'value3')

      const promises = [
        storageHelper.loadString('key1', ''),
        storageHelper.loadString('key2', ''),
        storageHelper.loadString('key3', ''),
      ]

      const results = await Promise.all(promises)

      expect(results).toEqual(['value1', 'value2', 'value3'])
    })
  })

  describe('错误处理', () => {
    it('loadBoolean 出错时应该返回默认值', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadBoolean('testKey', true)

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('加载配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveBoolean 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveBoolean('testKey', true)).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('保存配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('loadString 出错时应该返回默认值', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadString('testKey', 'default')

      expect(result).toBe('default')
      expect(consoleSpy).toHaveBeenCalledWith('加载配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveString 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveString('testKey', 'value')).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('保存配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('loadNumber 出错时应该返回默认值', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadNumber('testKey', 42)

      expect(result).toBe(42)
      expect(consoleSpy).toHaveBeenCalledWith('加载配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveNumber 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveNumber('testKey', 42)).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('保存配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('loadArray 出错时应该返回默认值', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadArray('testKey', [1, 2, 3])

      expect(result).toEqual([1, 2, 3])
      expect(consoleSpy).toHaveBeenCalledWith('加载配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveArray 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveArray('testKey', [1, 2, 3])).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('保存配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('loadObject 出错时应该返回默认值', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadObject('testKey', { default: 'value' })

      expect(result).toEqual({ default: 'value' })
      expect(consoleSpy).toHaveBeenCalledWith('加载配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveObject 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveObject('testKey', { key: 'value' })).rejects.toThrow(
        'Storage error',
      )
      expect(consoleSpy).toHaveBeenCalledWith('保存配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('loadMultiple 出错时应该返回空对象', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'get').mockRejectedValueOnce(new Error('Storage error'))

      const result = await storageHelper.loadMultiple(['key1', 'key2'])

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith('批量加载配置失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('saveMultiple 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'set').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.saveMultiple({ key1: 'value1' })).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('批量保存配置失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('remove 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'remove').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.remove('testKey')).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('删除配置失败 [testKey]:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('removeMultiple 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'remove').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.removeMultiple(['key1', 'key2'])).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('批量删除配置失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('clear 出错时应该抛出错误', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.spyOn(browser.storage.local, 'clear').mockRejectedValueOnce(new Error('Storage error'))

      await expect(storageHelper.clear()).rejects.toThrow('Storage error')
      expect(consoleSpy).toHaveBeenCalledWith('清空配置失败:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
