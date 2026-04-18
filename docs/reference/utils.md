# 工具函数和类参考

本文档列出了项目中所有的工具函数和类，包括功能说明、参数和用法示例。

## 工具类目录结构

```
src/utils/
├── featureManager.ts    # 功能管理器
├── storageHelper.ts     # 存储操作辅助工具
├── messageHelper.ts     # 消息通信辅助工具
├── urlMatcher.ts        # URL 匹配工具
├── domHelper.ts         # DOM 操作辅助工具
├── validationHelper.ts  # 数据验证工具
└── index.ts             # 统一导出文件
```

## 功能管理器 (featureManager.ts)

### 概述

功能管理器提供统一的功能管理模式，包括功能状态管理、依赖检查、冲突解决等。

### 主要函数

#### `initializeFeatures()`

初始化所有功能状态。

```typescript
/**
 * 初始化所有功能状态
 * @returns Promise<void>
 */
async function initializeFeatures(): Promise<void>
```

**使用示例**:

```typescript
import { initializeFeatures } from '@/utils/featureManager'

// 在应用启动时调用
onMounted(async () => {
  await initializeFeatures()
})
```

#### `getFeatureState(featureId)`

获取功能状态。

```typescript
/**
 * 获取功能状态
 * @param featureId - 功能标识符
 * @returns Promise<boolean> - 功能启用状态
 */
async function getFeatureState(featureId: string): Promise<boolean>
```

**使用示例**:

```typescript
import { getFeatureState } from '@/utils/featureManager'

const isDarkThemeEnabled = await getFeatureState('dark-theme')
console.log('深色主题状态:', isDarkThemeEnabled)
```

#### `setFeatureState(featureId, enabled)`

设置功能状态。

```typescript
/**
 * 设置功能状态
 * @param featureId - 功能标识符
 * @param enabled - 启用状态
 * @returns Promise<boolean> - 操作是否成功
 */
async function setFeatureState(featureId: string, enabled: boolean): Promise<boolean>
```

**使用示例**:

```typescript
import { setFeatureState } from '@/utils/featureManager'

// 启用深色主题
const success = await setFeatureState('dark-theme', true)
if (success) {
  console.log('深色主题已启用')
}
```

#### `checkFeatureDependencies(featureId)`

检查功能依赖。

```typescript
/**
 * 检查功能依赖
 * @param featureId - 功能标识符
 * @returns Promise<string[]> - 未满足的依赖列表
 */
async function checkFeatureDependencies(featureId: string): Promise<string[]>
```

**使用示例**:

```typescript
import { checkFeatureDependencies } from '@/utils/featureManager'

const unmetDeps = await checkFeatureDependencies('advanced-feature')
if (unmetDeps.length > 0) {
  console.warn('以下依赖未满足:', unmetDeps)
}
```

#### `resolveFeatureConflicts(featureId)`

解决功能冲突。

```typescript
/**
 * 解决功能冲突
 * @param featureId - 功能标识符
 * @returns Promise<boolean> - 冲突是否解决
 */
async function resolveFeatureConflicts(featureId: string): Promise<boolean>
```

**使用示例**:

```typescript
import { resolveFeatureConflicts } from '@/utils/featureManager'

// 启用功能前解决冲突
const conflictsResolved = await resolveFeatureConflicts('new-feature')
if (conflictsResolved) {
  await setFeatureState('new-feature', true)
}
```

### 高级功能

#### `getAllFeatures()`

获取所有功能配置。

```typescript
/**
 * 获取所有功能配置
 * @returns Promise<FeatureConfig[]>
 */
async function getAllFeatures(): Promise<FeatureConfig[]>
```

#### `getFeatureConfig(featureId)`

获取功能配置。

```typescript
/**
 * 获取功能配置
 * @param featureId - 功能标识符
 * @returns Promise<FeatureConfig | null>
 */
async function getFeatureConfig(featureId: string): Promise<FeatureConfig | null>
```

#### `updateFeatureSettings(featureId, settings)`

更新功能设置。

```typescript
/**
 * 更新功能设置
 * @param featureId - 功能标识符
 * @param settings - 新的设置
 * @returns Promise<boolean>
 */
async function updateFeatureSettings(featureId: string, settings: Record<string, any>): Promise<boolean>
```

## 存储操作辅助工具 (storageHelper.ts)

### 概述

提供统一的浏览器存储操作接口，支持 localStorage 和 chrome.storage。

### 主要函数

#### `set(key, value)`

设置存储值。

```typescript
/**
 * 设置存储值
 * @param key - 存储键
 * @param value - 存储值
 * @returns Promise<void>
 */
async function set(key: string, value: any): Promise<void>
```

**使用示例**:

```typescript
import { set } from '@/utils/storageHelper'

// 存储用户设置
await set('user_settings', {
  theme: 'dark',
  language: 'zh-CN',
})
```

#### `get(key)`

获取存储值。

```typescript
/**
 * 获取存储值
 * @param key - 存储键
 * @returns Promise<any> - 存储值
 */
async function get(key: string): Promise<any>
```

**使用示例**:

```typescript
import { get } from '@/utils/storageHelper'

// 获取用户设置
const userSettings = await get('user_settings')
console.log('用户设置:', userSettings)
```

#### `remove(key)`

移除存储值。

```typescript
/**
 * 移除存储值
 * @param key - 存储键
 * @returns Promise<void>
 */
async function remove(key: string): Promise<void>
```

**使用示例**:

```typescript
import { remove } from '@/utils/storageHelper'

// 移除临时数据
await remove('temp_data')
```

#### `clear()`

清空所有存储。

```typescript
/**
 * 清空所有存储
 * @returns Promise<void>
 */
async function clear(): Promise<void>
```

**使用示例**:

```typescript
import { clear } from '@/utils/storageHelper'

// 重置所有设置
await clear()
```

### 高级功能

#### `getAll()`

获取所有存储数据。

```typescript
/**
 * 获取所有存储数据
 * @returns Promise<Record<string, any>>
 */
async function getAll(): Promise<Record<string, any>>
```

#### `setMultiple(items)`

批量设置存储值。

```typescript
/**
 * 批量设置存储值
 * @param items - 键值对对象
 * @returns Promise<void>
 */
async function setMultiple(items: Record<string, any>): Promise<void>
```

**使用示例**:

```typescript
import { setMultiple } from '@/utils/storageHelper'

// 批量存储
await setMultiple({
  user_settings: userSettings,
  feature_states: featureStates,
  app_config: appConfig,
})
```

#### `getMultiple(keys)`

批量获取存储值。

```typescript
/**
 * 批量获取存储值
 * @param keys - 键名数组
 * @returns Promise<Record<string, any>>
 */
async function getMultiple(keys: string[]): Promise<Record<string, any>>
```

#### `watch(key, callback)`

监听存储变化。

```typescript
/**
 * 监听存储变化
 * @param key - 存储键
 * @param callback - 变化回调函数
 * @returns Function - 取消监听函数
 */
function watch(key: string, callback: (newValue: any, oldValue: any) => void): () => void
```

**使用示例**:

```typescript
import { watch } from '@/utils/storageHelper'

// 监听主题设置变化
const unwatch = watch('theme', (newTheme, oldTheme) => {
  console.log(`主题从 ${oldTheme} 变为 ${newTheme}`)
  applyTheme(newTheme)
})

// 取消监听
// unwatch()
```

## 消息通信辅助工具 (messageHelper.ts)

### 概述

提供统一的浏览器消息通信接口，支持 content script、popup、background 之间的通信。

### 主要函数

#### `sendMessage(type, data)`

发送消息。

```typescript
/**
 * 发送消息
 * @param type - 消息类型
 * @param data - 消息数据
 * @returns Promise<any> - 响应数据
 */
async function sendMessage(type: string, data?: any): Promise<any>
```

**使用示例**:

```typescript
import { sendMessage } from '@/utils/messageHelper'

// 发送获取功能状态的消息
const response = await sendMessage('GET_FEATURE_STATE', {
  feature: 'dark-theme',
})

if (response.success) {
  console.log('功能状态:', response.data)
}
```

#### `onMessage(type, handler)`

监听消息。

```typescript
/**
 * 监听消息
 * @param type - 消息类型
 * @param handler - 消息处理函数
 * @returns Function - 取消监听函数
 */
function onMessage(type: string, handler: (data: any, sender: any) => any): () => void
```

**使用示例**:

```typescript
import { onMessage } from '@/utils/messageHelper'

// 监听功能状态查询消息
const unsubscribe = onMessage('GET_FEATURE_STATE', (data, sender) => {
  const featureState = getFeatureState(data.feature)

  return {
    success: true,
    data: featureState,
  }
})

// 取消监听
// unsubscribe()
```

#### `sendToContentScript(tabId, type, data)`

发送消息到指定标签页的 content script。

```typescript
/**
 * 发送消息到指定标签页的 content script
 * @param tabId - 标签页ID
 * @param type - 消息类型
 * @param data - 消息数据
 * @returns Promise<any>
 */
async function sendToContentScript(tabId: number, type: string, data?: any): Promise<any>
```

#### `broadcastToAllTabs(type, data)`

广播消息到所有标签页。

```typescript
/**
 * 广播消息到所有标签页
 * @param type - 消息类型
 * @param data - 消息数据
 * @returns Promise<void>
 */
async function broadcastToAllTabs(type: string, data?: any): Promise<void>
```

### 消息类型常量

```typescript
export const MESSAGE_TYPES = {
  // 功能相关
  GET_FEATURE_STATE: 'GET_FEATURE_STATE',
  SET_FEATURE_STATE: 'SET_FEATURE_STATE',
  GET_ALL_FEATURES: 'GET_ALL_FEATURES',

  // 存储相关
  GET_STORAGE: 'GET_STORAGE',
  SET_STORAGE: 'SET_STORAGE',

  // 页面操作
  RELOAD_PAGE: 'RELOAD_PAGE',
  EXECUTE_SCRIPT: 'EXECUTE_SCRIPT',

  // 状态同步
  SYNC_STATE: 'SYNC_STATE',
  STATE_CHANGED: 'STATE_CHANGED',
}
```

### 使用示例

#### 1. 简单的请求-响应模式

```typescript
// 发送方
const response = await sendMessage('GET_USER_INFO', { userId: 123 })

// 接收方
onMessage('GET_USER_INFO', data => {
  const user = getUserById(data.userId)
  return { success: true, data: user }
})
```

#### 2. 状态同步

```typescript
// 当功能状态变化时广播通知
async function onFeatureStateChanged(featureId: string, enabled: boolean) {
  await broadcastToAllTabs('FEATURE_STATE_CHANGED', {
    feature: featureId,
    enabled,
  })
}

// 接收状态变化通知
onMessage('FEATURE_STATE_CHANGED', data => {
  console.log(`功能 ${data.feature} 状态变为 ${data.enabled}`)
  updateUI(data.feature, data.enabled)
})
```

## URL 匹配工具 (urlMatcher.ts)

### 概述

提供统一的 URL 匹配功能，支持通配符和正则表达式。

### 主要函数

#### `matchesPattern(url, pattern)`

检查 URL 是否匹配模式。

```typescript
/**
 * 检查 URL 是否匹配模式
 * @param url - 要检查的 URL
 * @param pattern - 匹配模式
 * @returns boolean - 是否匹配
 */
function matchesPattern(url: string, pattern: string): boolean
```

**支持的模式**:

- 精确匹配: `https://example.com/page`
- 通配符: `https://example.com/*`
- 正则表达式: `/^https:\/\/example\.com\/.*$/`

**使用示例**:

```typescript
import { matchesPattern } from '@/utils/urlMatcher'

// 检查是否是 52pojie 网站
const is52pojie = matchesPattern('https://www.52pojie.cn/thread-1234567-1-1.html', 'https://www.52pojie.cn/*')

if (is52pojie) {
  console.log('这是吾爱破解网站')
}
```

#### `getCurrentUrl()`

获取当前页面 URL。

```typescript
/**
 * 获取当前页面 URL
 * @returns string | null - 当前 URL，如果不是页面环境则返回 null
 */
function getCurrentUrl(): string | null
```

#### `isTargetPage()`

检查当前页面是否是目标页面。

```typescript
/**
 * 检查当前页面是否是目标页面
 * @returns boolean
 */
function isTargetPage(): boolean
```

**使用示例**:

```typescript
import { isTargetPage } from '@/utils/urlMatcher'

// 只在目标页面上执行操作
if (isTargetPage()) {
  initializeFeatures()
}
```

### 配置

#### `setTargetPatterns(patterns)`

设置目标页面匹配模式。

```typescript
/**
 * 设置目标页面匹配模式
 * @param patterns - 匹配模式数组
 */
function setTargetPatterns(patterns: string[]): void
```

**使用示例**:

```typescript
import { setTargetPatterns } from '@/utils/urlMatcher'

// 设置目标页面
setTargetPatterns(['https://www.52pojie.cn/*', 'https://bbs.52pojie.cn/*'])
```

#### `addTargetPattern(pattern)`

添加目标页面匹配模式。

```typescript
/**
 * 添加目标页面匹配模式
 * @param pattern - 匹配模式
 */
function addTargetPattern(pattern: string): void
```

## DOM 操作辅助工具 (domHelper.ts)

### 概述

提供常用的 DOM 操作功能，简化 DOM 操作。

### 主要函数

#### `waitForElement(selector, timeout)`

等待元素出现。

```typescript
/**
 * 等待元素出现
 * @param selector - CSS 选择器
 * @param timeout - 超时时间（毫秒）
 * @returns Promise<Element | null> - 找到的元素
 */
async function waitForElement(selector: string, timeout?: number): Promise<Element | null>
```

**使用示例**:

```typescript
import { waitForElement } from '@/utils/domHelper'

// 等待帖子内容加载
const postContent = await waitForElement('.post-content', 5000)
if (postContent) {
  // 处理帖子内容
  processPostContent(postContent)
}
```

#### `observeElement(selector, callback, options)`

观察元素变化。

```typescript
/**
 * 观察元素变化
 * @param selector - CSS 选择器
 * @param callback - 变化回调
 * @param options - MutationObserver 选项
 * @returns Function - 停止观察函数
 */
function observeElement(
  selector: string,
  callback: (element: Element) => void,
  options?: MutationObserverInit,
): () => void
```

**使用示例**:

```typescript
import { observeElement } from '@/utils/domHelper'

// 观察动态加载的内容
const stopObserving = observeElement(
  '.dynamic-content',
  element => {
    console.log('内容已更新:', element)
    processNewContent(element)
  },
  { childList: true, subtree: true },
)

// 停止观察
// stopObserving()
```

#### `injectStyle(css)`

注入 CSS 样式。

```typescript
/**
 * 注入 CSS 样式
 * @param css - CSS 样式字符串
 * @returns string - 样式 ID（用于移除）
 */
function injectStyle(css: string): string
```

**使用示例**:

```typescript
import { injectStyle } from '@/utils/domHelper'

// 注入深色主题样式
const styleId = injectStyle(`
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  .post {
    border-color: #333;
  }
`)

// 移除样式
// removeStyle(styleId)
```

#### `removeStyle(styleId)`

移除注入的样式。

```typescript
/**
 * 移除注入的样式
 * @param styleId - 样式 ID
 */
function removeStyle(styleId: string): void
```

### 高级功能

#### `createElement(tag, attributes, children)`

创建 DOM 元素。

```typescript
/**
 * 创建 DOM 元素
 * @param tag - 标签名
 * @param attributes - 属性对象
 * @param children - 子元素
 * @returns HTMLElement
 */
function createElement(tag: string, attributes?: Record<string, string>, children?: (string | Node)[]): HTMLElement
```

#### `debounce(func, wait)`

防抖函数。

```typescript
/**
 * 防抖函数
 * @param func - 要执行的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void
```

#### `throttle(func, limit)`

节流函数。

```typescript
/**
 * 节流函数
 * @param func - 要执行的函数
 * @param limit - 时间限制（毫秒）
 * @returns 节流后的函数
 */
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void
```

## 数据验证工具 (validationHelper.ts)

### 概述

提供数据验证功能，包括表单验证、数据格式检查等。

### 主要函数

#### `validateEmail(email)`

验证邮箱格式。

```typescript
/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns boolean - 是否有效
 */
function validateEmail(email: string): boolean
```

#### `validateUrl(url)`

验证 URL 格式。

```typescript
/**
 * 验证 URL 格式
 * @param url - URL 地址
 * @returns boolean - 是否有效
 */
function validateUrl(url: string): boolean
```

#### `validateRequired(value)`

验证必填字段。

```typescript
/**
 * 验证必填字段
 * @param value - 字段值
 * @returns boolean - 是否有效
 */
function validateRequired(value: any): boolean
```

#### `validateLength(value, min, max)`

验证长度范围。

```typescript
/**
 * 验证长度范围
 * @param value - 字段值
 * @param min - 最小长度
 * @param max - 最大长度
 * @returns boolean - 是否有效
 */
function validateLength(value: string, min?: number, max?: number): boolean
```

### 验证器组合

#### `createValidator(rules)`

创建验证器。

```typescript
/**
 * 创建验证器
 * @param rules - 验证规则
 * @returns 验证函数
 */
function createValidator(rules: ValidationRule[]): ValidatorFunction
```

**使用示例**:

```typescript
import { createValidator } from '@/utils/validationHelper'

// 创建用户表单验证器
const validateUser = createValidator([
  { field: 'username', rules: ['required', { minLength: 3 }, { maxLength: 20 }] },
  { field: 'email', rules: ['required', 'email'] },
  { field: 'password', rules: ['required', { minLength: 6 }] },
])

// 验证数据
const errors = validateUser({
  username: 'test',
  email: 'test@example.com',
  password: '123456',
})

if (Object.keys(errors).length === 0) {
  console.log('验证通过')
} else {
  console.log('验证错误:', errors)
}
```

## 工具函数统一导出

所有工具函数通过 `src/utils/index.ts` 统一导出：

```typescript
// 功能管理
export {
  initializeFeatures,
  getFeatureState,
  setFeatureState,
  checkFeatureDependencies,
  resolveFeatureConflicts,
} from './featureManager'

// 存储操作
export { set, get, remove, clear, getAll, setMultiple, getMultiple, watch } from './storageHelper'

// 消息通信
export { sendMessage, onMessage, sendToContentScript, broadcastToAllTabs, MESSAGE_TYPES } from './messageHelper'

// URL 匹配
export { matchesPattern, getCurrentUrl, isTargetPage, setTargetPatterns, addTargetPattern } from './urlMatcher'

// DOM 操作
export {
  waitForElement,
  observeElement,
  injectStyle,
  removeStyle,
  createElement,
  debounce,
  throttle,
} from './domHelper'

// 数据验证
export { validateEmail, validateUrl, validateRequired, validateLength, createValidator } from './validationHelper'
```

## 使用示例

### 1. 完整的功能管理示例

```typescript
import { initializeFeatures, getFeatureState, setFeatureState, checkFeatureDependencies } from '@/utils'

// 初始化功能
await initializeFeatures()

// 检查并启用功能
const featureId = 'dark-theme'

// 检查依赖
const unmetDeps = await checkFeatureDependencies(featureId)
if (unmetDeps.length === 0) {
  // 启用功能
  const success = await setFeatureState(featureId, true)
  if (success) {
    console.log(`功能 ${featureId} 已启用`)
  }
}

// 获取功能状态
const isEnabled = await getFeatureState(featureId)
console.log(`功能状态: ${isEnabled}`)
```

### 2. 存储和消息通信示例

```typescript
import { set, get, sendMessage, onMessage } from '@/utils'

// 存储用户设置
await set('user_settings', {
  theme: 'dark',
  notifications: true,
})

// 获取用户设置
const settings = await get('user_settings')

// 发送消息到 content script
const response = await sendMessage('APPLY_THEME', {
  theme: settings.theme,
})

// 监听消息
const unsubscribe = onMessage('THEME_CHANGED', data => {
  console.log('主题已更改:', data.theme)
  updateUI(data.theme)
})
```

### 3. DOM 操作和验证示例

```typescript
import { waitForElement, injectStyle, validateEmail, debounce } from '@/utils'

// 等待表单加载
const form = await waitForElement('#user-form', 3000)
if (form) {
  // 注入样式
  const styleId = injectStyle(`
    #user-form {
      border: 1px solid #ccc;
      padding: 20px;
    }
  `)

  // 验证邮箱
  const emailInput = form.querySelector('#email')
  if (emailInput) {
    emailInput.addEventListener(
      'input',
      debounce(e => {
        const email = e.target.value
        if (!validateEmail(email)) {
          showError('邮箱格式不正确')
        }
      }, 300),
    )
  }
}
```

## 最佳实践

### 1. 错误处理

```typescript
import { getFeatureState } from '@/utils'

try {
  const state = await getFeatureState('dark-theme')
  console.log('功能状态:', state)
} catch (error) {
  console.error('获取功能状态失败:', error)
  // 提供 fallback 值
  const fallbackState = false
}
```

### 2. 性能优化

```typescript
import { debounce, throttle } from '@/utils'

// 使用防抖处理频繁触发的事件
const handleSearch = debounce(query => {
  performSearch(query)
}, 300)

// 使用节流处理滚动事件
const handleScroll = throttle(() => {
  checkScrollPosition()
}, 100)
```

### 3. 资源清理

```typescript
import { onMessage, observeElement } from '@/utils'

// 在组件卸载时清理资源
onMounted(() => {
  // 监听消息
  const unsubscribeMessage = onMessage('UPDATE', handleUpdate)

  // 观察元素
  const stopObserving = observeElement('.content', handleContentChange)

  // 清理函数
  onUnmounted(() => {
    unsubscribeMessage()
    stopObserving()
  })
})
```

## 相关文档

- [项目文件结构](./file-structure.md) - 项目文件结构说明
- [所有Vue组件](./components.md) - Vue 组件详细说明
- [可组合函数式架构](../development/composable-architecture.md) - 可组合函数使用指南

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
