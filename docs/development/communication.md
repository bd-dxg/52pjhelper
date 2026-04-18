# Popup 与 Content Script 通信

## 通信架构概述

项目采用浏览器扩展的标准通信架构，包含以下组件：

| 组件                  | 作用                       | 通信方式                   |
| --------------------- | -------------------------- | -------------------------- |
| **Popup**             | 用户界面，功能开关控制     | 向 Content Script 发送消息 |
| **Content Script**    | 页面注入脚本，执行实际功能 | 接收 Popup 消息并响应      |
| **Background Script** | 后台服务（本项目未使用）   | 消息中转（可选）           |

## 通信问题与解决方案

### 问题现象

当 popup 在非 52pojie.cn 页面打开时，控制台会出现以下错误：

```
获取用户信息失败: Error: Could not establish connection. Receiving end does not exist.
Failed to get quick query status from content script: Error: Could not establish connection. Receiving end does not exist.
```

### 问题原因

1. **不必要的通信**：组件初始化时直接与 content script 通信
2. **缺少错误处理**：通信失败时未正确处理错误
3. **通信时机不当**：未检查当前页面是否为目标网站

### 解决思路

#### 1. 避免不必要的通信

组件初始化时，应优先从 `browser.storage` 读取配置，而非直接与 content script 通信。

#### 2. 错误处理优化

在尝试与 content script 通信时，必须添加适当的错误处理。

#### 3. 通信时机控制

只有在确认当前页面是 52pojie.cn 时，才尝试与 content script 通信。

### 修复方案（已实施）

#### 1. SettingsPanel.vue 优化

优化用户信息获取的错误处理，通信失败时不显示错误信息。

#### 2. Toggle 组件优化

移除 `onMounted` 时从 content script 获取状态的代码，只从 storage 读取配置。

## 通信最佳实践

### 1. 使用 messageHelper 工具类

**文件位置**: `src/utils/messageHelper.ts`

**作用**: 提供统一的浏览器消息通信接口，封装了消息发送和响应处理。

**使用示例**:

```typescript
import { messageHelper } from '@/utils/messageHelper'

// 向当前标签页发送消息
try {
  const response = await messageHelper.sendToCurrentTab('GET_STATUS')
  console.log('状态获取成功:', response)
} catch (error) {
  console.warn('通信失败，使用默认值:', error)
  // 使用默认值或从 storage 读取
}

// 切换功能状态
await messageHelper.toggleFeature({
  messageType: 'TOGGLE_AVATAR_QUERY',
  storageKey: 'avatarQueryEnabled',
  currentValue: enabled,
  featureName: '头像查询',
  onSuccess: newEnabled => {
    // 成功处理
  },
  onMessage: (text, type) => {
    // 处理用户反馈
  },
})
```

### 2. 优先使用 storage 读取配置

在组件初始化时，优先从 `browser.storage` 读取配置：

```typescript
import { storageHelper } from '@/utils/storageHelper'

// 正确：从 storage 读取配置
const enabled = await storageHelper.loadBoolean('avatarQueryEnabled', true)

// 错误：直接与 content script 通信获取状态
// const response = await browser.tabs.sendMessage(tabId, { type: 'GET_STATUS' })
```

### 3. 添加适当的错误处理

所有与 content script 的通信都必须包含错误处理：

```typescript
async function getStatusFromContentScript() {
  try {
    const response = await messageHelper.sendToCurrentTab('GET_STATUS')
    return response
  } catch (error) {
    // 通信失败时的处理逻辑
    console.warn('无法从 content script 获取状态，使用默认值')
    return { enabled: false }
  }
}
```

### 4. 检查目标页面

在通信前检查当前页面是否为 52pojie.cn：

```typescript
import { urlMatcher } from '@/utils/urlMatcher'

async function shouldCommunicateWithContentScript() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (tabs.length === 0) return false

  const currentUrl = tabs[0].url || ''
  return urlMatcher.isTargetPage(currentUrl, ['https://www.52pojie.cn/*', 'https://*.52pojie.cn/*'])
}
```

## 通信模式

### 1. 单向通知模式

Popup 通知 Content Script 执行操作，无需等待响应。

```typescript
// Popup 发送通知
await messageHelper.sendToCurrentTab('EXECUTE_ACTION', { action: 'highlight' })

// Content Script 接收通知
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXECUTE_ACTION') {
    executeAction(message.data.action)
  }
})
```

### 2. 请求-响应模式

Popup 请求数据，Content Script 返回响应。

```typescript
// Popup 发送请求
const userInfo = await messageHelper.sendToCurrentTab('GET_USER_INFO')

// Content Script 处理请求
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_USER_INFO') {
    const userInfo = getUserInfo()
    sendResponse(userInfo)
  }
  return true // 保持消息通道开放
})
```

### 3. 状态同步模式

Content Script 主动向 Popup 报告状态变化。

```typescript
// Content Script 发送状态更新
browser.runtime.sendMessage({
  type: 'STATUS_UPDATE',
  data: { enabled: true, count: 5 },
})

// Popup 监听状态更新
browser.runtime.onMessage.addListener(message => {
  if (message.type === 'STATUS_UPDATE') {
    updateUI(message.data)
  }
})
```

## 消息类型定义

项目使用统一的消息类型定义：

| 消息类型         | 方向                   | 用途         | 数据格式                    |
| ---------------- | ---------------------- | ------------ | --------------------------- |
| `TOGGLE_*`       | Popup → Content Script | 切换功能状态 | `{ enabled: boolean }`      |
| `GET_STATUS`     | Popup → Content Script | 获取功能状态 | `{ enabled: boolean }`      |
| `STATUS_UPDATE`  | Content Script → Popup | 状态变化通知 | `{ enabled: boolean, ... }` |
| `EXECUTE_ACTION` | Popup → Content Script | 执行特定操作 | `{ action: string, ... }`   |

## 常见问题排查

### Q: 通信失败，错误信息 "Receiving end does not exist"

A: 当前标签页未注入 content script。检查：

1. 当前页面是否为 52pojie.cn
2. content script 是否正确注入
3. 是否在扩展管理页面打开了 popup

### Q: 消息发送后未收到响应

A: 检查：

1. Content Script 是否正确监听消息
2. 是否在监听器中调用了 `sendResponse`
3. 监听器是否返回 `true`（保持消息通道开放）

### Q: 通信延迟或超时

A: 考虑：

1. 添加超时处理
2. 使用 Promise.race 设置超时限制
3. 优化 Content Script 的处理逻辑

## 性能优化建议

### 1. 减少不必要的通信

- 优先使用 storage 存储配置
- 批量处理相关操作
- 缓存频繁使用的数据

### 2. 优化消息大小

- 只发送必要的数据
- 压缩大型数据
- 使用增量更新

### 3. 异步处理

- 使用 async/await 处理异步通信
- 避免阻塞 UI 线程
- 合理使用 Promise.all 并行处理

## 相关链接

- [可组合函数式架构](composable-architecture.md)
- [功能开关组件开发指南](component-guide.md)
- [自动导入机制](auto-import.md)
- [存储键命名规范](../../config/storage-keys.md)
