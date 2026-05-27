# 工具函数和类参考

本文档列出了项目中所有的工具函数和类，包括功能说明、参数和用法示例。

## 工具类目录结构

```
src/utils/
├── featureManager.ts        # 功能管理器
├── storageHelper.ts         # 存储操作辅助工具
├── messageHelper.ts         # 消息通信辅助工具
├── urlMatcher.ts            # URL 匹配工具
├── userInfo.ts              # 用户信息获取工具
├── userViolationFetcher.ts  # 用户违规信息获取工具
└── themeManager.ts          # 主题管理工具
```

> **注意**：功能特定的工具已迁移到各自的功能模块目录（`src/features/<name>/`），如 `userCloudDiskList`、`autofills` 等。`src/utils/` 仅保留跨功能共享的工具。

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

## 用户信息获取工具 (userInfo.ts)

### 概述

提供从页面中获取当前登录用户信息的功能。

### 主要函数

#### `getUserInfo()`

从页面 DOM 中获取当前登录用户的信息，包括用户名、等级、头像、权限等。

**使用示例**:

```typescript
import { getUserInfo } from '@/utils/userInfo'

const userInfo = getUserInfo()
if (userInfo.isLoggedIn) {
  console.log('当前用户:', userInfo.username)
  console.log('是否管理员:', userInfo.permissions.isAdmin)
}
```

## 用户违规信息获取工具 (userViolationFetcher.ts)

### 概述

提供公共的用户违规记录查询功能，用于头像查询等管理功能。

### 主要函数

#### `fetchUserViolation(userId)`

查询指定用户的违规记录，带超时控制。

**使用示例**:

```typescript
import { fetchUserViolation } from '@/utils/userViolationFetcher'

const violation = await fetchUserViolation(userId)
if (violation) {
  console.log('违规记录:', violation)
}
```

## 主题管理工具 (themeManager.ts)

### 概述

提供系统主题检测和切换功能，支持深色/浅色模式。

### 主要函数

#### `getCurrentTheme()`

获取当前系统主题。

```typescript
import { getCurrentTheme } from '@/utils/themeManager'

const theme = getCurrentTheme() // 'light' | 'dark'
```

#### `applyTheme(theme)`

应用主题到 HTML 根元素。

```typescript
import { applyTheme } from '@/utils/themeManager'

applyTheme('dark')
```

#### `watchThemeChange(callback)`

监听系统主题变化，返回清理函数。

```typescript
import { watchThemeChange } from '@/utils/themeManager'

const unwatch = watchThemeChange((newTheme) => {
  console.log('主题变化:', newTheme)
  applyTheme(newTheme)
})

// 取消监听
// unwatch()
```

## 用户网盘名单功能模块 (userCloudDiskList)

### 概述

用户网盘名单功能已迁移到独立的功能模块目录。该功能提供高亮显示网盘名单用户的功能，鼠标悬停时显示用户的网盘信息。

### 模块位置

```
src/features/userCloudDiskList/
├── index.ts                     # 统一导出所有公共API
├── types.ts                     # 类型定义（接口和类型别名）
├── config.ts                    # 配置常量和默认数据
├── config.json                  # 功能配置（名称、描述、存储键等）
├── data.ts                      # 数据加载、保存和自动更新检查
├── ui.ts                        # 样式注入、弹窗创建和显示逻辑
├── processing.ts                # 用户名处理、扫描和防抖逻辑
├── events.ts                    # DOM 变化监听和事件管理
├── manager.ts                   # 核心管理器逻辑
├── factory.ts                   # 工厂函数，创建管理器实例
├── UserCloudDiskListToggle.vue  # 功能开关组件
└── CloudDiskListUpdateButton.vue # 数据更新按钮组件
```

### 导入方式

```typescript
// 从功能模块导入
import { createUserCloudDiskList } from '@features/userCloudDiskList'

// 或使用相对路径（功能内部）
import { createUserCloudDiskList } from './factory'
```

### 主要函数

#### `createUserCloudDiskList()`

创建用户网盘名单管理器实例：

```typescript
import { createUserCloudDiskList } from '@features/userCloudDiskList'

const manager = createUserCloudDiskList()
await manager.enable()
const isEnabled = manager.getStatus()
```

#### `loadCloudDiskListDataFromTableExtractor()`

从表格数据提取器加载黑名单数据：

```typescript
import { loadCloudDiskListDataFromTableExtractor } from '@features/userCloudDiskList'

const data = await loadCloudDiskListDataFromTableExtractor()
console.log(`从表格解析出 ${data.length} 个用户`)
```

#### `loadCloudDiskListData()`

加载黑名单数据（优先从本地存储加载，无数据时从表格提取器加载）：

```typescript
import { loadCloudDiskListData } from '@features/userCloudDiskList'

const data = await loadCloudDiskListData()
```

### 配置常量

```typescript
export const STORAGE_KEY = 'userCloudDiskList_enabled'
export const DATA_STORAGE_KEY = 'userCloudDiskList_data'
export const LAST_UPDATE_KEY = 'userCloudDiskList_lastUpdate'
export const AUTO_UPDATE_INTERVAL = 24 * 60 * 60 * 1000 // 1天
```

## 最佳实践

### 1. 错误处理

```typescript
import { getFeatureState } from '@/utils/featureManager'

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
import { debounce } from '@/utils/urlMatcher' // 如有需要

// 使用防抖处理频繁触发的事件
const handleSearch = debounce(query => {
  performSearch(query)
}, 300)
```

### 3. 资源清理

```typescript
import { watchThemeChange } from '@/utils/themeManager'

// 在组件卸载时清理资源
onMounted(() => {
  const unwatch = watchThemeChange(handleThemeChange)

  onUnmounted(() => {
    unwatch()
  })
})
```

## 相关文档

- [项目文件结构](./file-structure.md) - 项目文件结构说明
- [所有Vue组件](./components.md) - Vue 组件详细说明
- [可组合函数式架构](../development/composable-architecture.md) - 可组合函数使用指南

---

_文档版本：2.0.0_
_最后更新：2026-05-28_
_更新内容：反映功能模块化重构后的工具目录结构，移除不存在的工具模块，新增共享工具文档_
