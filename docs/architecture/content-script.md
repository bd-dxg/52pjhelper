# Content Script 架构

## 概述

Content Script 是浏览器扩展的核心组件，负责在吾爱破解论坛页面上注入功能代码。本项目采用模块化设计，遵循 WXT 框架的最佳实践，确保代码的可维护性、可扩展性和性能优化。

## 架构设计原则

### 1. 模块化设计

- 每个功能独立成模块，职责清晰
- 模块间通过明确定义的接口通信
- 支持按需加载，减少资源占用
- 便于单元测试和调试

### 2. 松耦合架构

- 功能模块之间最小化依赖
- 通过事件和消息进行通信
- 支持热插拔功能模块
- 便于功能扩展和维护

### 3. 性能优化

- 延迟加载非关键功能
- 使用事件委托减少事件监听器
- 实现智能缓存机制
- 优化DOM操作，避免重排重绘

### 4. 错误隔离

- 每个功能模块独立错误处理
- 防止单个功能故障影响整体
- 提供详细的错误日志
- 支持优雅降级

## 核心模块

### 1. 主入口模块 (`index.ts`)

**位置**: `src/entries/content/index.ts` (46行)

**职责**:

- 协调各个功能模块的初始化
- 创建管理器实例容器
- 防止重复初始化
- 提供统一的错误处理

**关键代码**:

```typescript
// 防止重复初始化
if (window.__52pjhelperInitialized) {
  console.warn('52pjhelper already initialized')
  return
}
window.__52pjhelperInitialized = true

// 创建管理器容器
const managers: FeatureManager[] = []

// 初始化所有功能管理器
try {
  const initializationResult = await initializeFeatures()
  managers.push(...initializationResult.managers)
} catch (error) {
  console.error('Failed to initialize features:', error)
}
```

### 2. 初始化模块 (`initialization.ts`)

**位置**: `src/entries/content/initialization.ts` (68行)

**职责**:

- 统一管理所有功能管理器的初始化
- 处理功能依赖关系
- 提供初始化状态监控
- 支持初始化重试机制

**关键代码**:

```typescript
export async function initializeFeatures(): Promise<InitializationResult> {
  const managers: FeatureManager[] = []
  const errors: InitializationError[] = []

  // 按顺序初始化功能
  for (const featureConfig of FEATURE_CONFIGS) {
    try {
      const manager = await createFeatureManager(featureConfig)
      managers.push(manager)
    } catch (error) {
      errors.push({
        feature: featureConfig.name,
        error: error as Error,
        timestamp: new Date(),
      })
    }
  }

  return { managers, errors }
}
```

### 3. 消息处理器 (`messageHandler.ts`)

**位置**: `src/entries/content/messageHandler.ts` (375行)

**职责**:

- 处理来自 popup 的消息通信
- 统一的消息路由和响应机制
- 支持异步消息处理
- 提供消息验证和安全性检查

**关键代码**:

```typescript
export class MessageHandler {
  private handlers = new Map<string, MessageHandlerFunction>()

  // 注册消息处理器
  registerHandler(type: string, handler: MessageHandlerFunction): void {
    this.handlers.set(type, handler)
  }

  // 处理消息
  async handleMessage(message: ExtensionMessage): Promise<MessageResponse> {
    const handler = this.handlers.get(message.type)
    if (!handler) {
      return {
        success: false,
        error: `No handler for message type: ${message.type}`,
      }
    }

    try {
      const result = await handler(message.payload)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
```

### 4. 存储监听器 (`storageListener.ts`)

**位置**: `src/entries/content/storageListener.ts` (156行)

**职责**:

- 监听浏览器存储变化
- 实现跨页面状态同步
- 处理存储冲突和合并
- 提供存储变化事件通知

**关键代码**:

```typescript
export class StorageListener {
  private listeners = new Map<string, StorageChangeCallback[]>()

  // 初始化监听
  initialize(): void {
    browser.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName)
    })
  }

  // 处理存储变化
  private handleStorageChange(changes: { [key: string]: browser.storage.StorageChange }, areaName: string): void {
    for (const [key, change] of Object.entries(changes)) {
      const keyListeners = this.listeners.get(key)
      if (keyListeners) {
        keyListeners.forEach(listener => {
          listener(change, areaName)
        })
      }
    }
  }

  // 注册存储变化监听器
  addChangeListener(key: string, callback: StorageChangeCallback): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(callback)
  }
}
```

## 功能管理器模式

### 管理器工厂函数

项目使用函数式风格创建功能管理器（禁止使用 `class`）：

```typescript
export const createFeatureManager = (config: FeatureConfig) => {
  let enabled = false

  const enable = async () => {
    enabled = true
    await onEnable()
  }

  const disable = async () => {
    enabled = false
    await onDisable()
  }

  const isEnabled = () => enabled

  return {
    enable,
    disable,
    isEnabled,
    config,
  }
}
```

### 功能管理器实现示例

```typescript
import { createFeatureManager } from '@/utils/featureManager'

export const createNavigationManager = () => {
  let navigationElement: HTMLElement | null = null

  const onEnable = async () => {
    if (navigationElement) {
      navigationElement.style.display = 'block'
    }
  }

  const onDisable = async () => {
    if (navigationElement) {
      navigationElement.style.display = 'none'
    }
  }

  const initialize = async () => {
    navigationElement = document.querySelector('#navigation')
  }

  const manager = createFeatureManager({
    name: 'navigation',
    onEnable,
    onDisable,
  })

  return {
    ...manager,
    initialize,
  }
}
```

## 通信机制

### 1. Popup ↔ Content Script 通信

- 使用 `browser.runtime.sendMessage` API
- 支持请求-响应模式
- 提供类型安全的消息接口
- 处理通信超时和错误

### 2. 功能模块间通信

- 使用自定义事件系统
- 支持事件冒泡和捕获
- 提供事件命名空间
- 实现事件取消机制

### 3. 存储同步通信

- 通过 `browser.storage` API 同步状态
- 支持实时状态更新
- 处理存储冲突
- 提供存储变化事件

## 错误处理策略

### 1. 初始化错误处理

- 记录详细的错误日志
- 提供错误恢复机制
- 支持部分功能降级
- 防止错误传播

### 2. 运行时错误处理

- 使用 try-catch 包装关键操作
- 提供用户友好的错误提示
- 实现错误上报机制
- 支持错误重试

### 3. 通信错误处理

- 处理消息超时
- 验证消息格式
- 提供错误响应
- 实现重试机制

## 性能优化策略

### 1. 资源加载优化

- 按需加载功能模块
- 使用代码分割
- 实现懒加载机制
- 优化资源缓存

### 2. DOM 操作优化

- 使用事件委托
- 批量DOM操作
- 避免强制同步布局
- 使用虚拟DOM技术

### 3. 内存管理优化

- 及时清理事件监听器
- 使用 WeakMap/WeakSet
- 实现对象池
- 监控内存使用

## 测试策略

### 1. 单元测试

- 测试独立的功能模块
- 模拟浏览器环境
- 验证边界条件
- 确保代码覆盖率

### 2. 集成测试

- 测试模块间交互
- 验证通信机制
- 测试错误处理
- 确保系统稳定性

### 3. 端到端测试

- 测试完整用户流程
- 验证页面交互
- 测试性能指标
- 确保用户体验

## 部署和维护

### 1. 版本管理

- 遵循语义化版本控制
- 提供版本迁移指南
- 支持向后兼容
- 管理功能开关

### 2. 监控和日志

- 收集性能指标
- 记录错误日志
- 监控用户行为
- 提供分析报告

### 3. 更新策略

- 支持热更新
- 提供更新通知
- 处理更新冲突
- 确保数据迁移

---

**相关链接**：

- [架构概述](overview.md)
- [技术栈详解](technical-stack.md)
- [模块结构](module-structure.md)
- [开发文档](../development/composable-architecture.md)

---

_文档版本：1.1.0_
_最后更新：2026-05-28_
_更新内容：更新功能管理器示例为函数式风格_
