# 可组合函数式架构

项目引入了 Vue 3 的可组合函数式架构，提供统一的功能开关逻辑和代码组织模式。

## 架构概述

可组合函数式架构基于 Vue 3 的组合式 API，将通用逻辑封装为可复用的函数，提高代码的可维护性和复用性。

### 核心设计原则

1. **单一职责**：每个可组合函数只负责一个特定的功能
2. **可复用性**：函数可以在多个组件中重复使用
3. **响应式**：充分利用 Vue 3 的响应式系统
4. **类型安全**：完整的 TypeScript 类型支持

## 核心可组合函数

### useFeatureToggle

**文件位置**: `src/composables/useFeatureToggle.ts`

**作用**: 提供统一的功能开关逻辑，封装了通用的功能开关逻辑，包括初始化、切换和状态管理。

**特点**:

- 统一的功能开关逻辑
- 内置防抖机制，防止重复点击
- 统一的错误处理和用户反馈
- 简化了组件代码，提高了可维护性

**使用示例**:

```typescript
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import config from '@features/avatarQuery/config.json'

const { enabled, toggleFeature, isToggling } = useFeatureToggle(
  {
    ...config,
    messageType: 'TOGGLE_AVATAR_QUERY',
  },
  (text, type) => {
    // 处理用户反馈
    emit('show-message', text, type)
  },
)
```

**API 参考**:

| 属性/方法         | 类型                  | 说明             |
| ----------------- | --------------------- | ---------------- |
| `enabled`         | `Ref<boolean>`        | 功能是否启用     |
| `isToggling`      | `Ref<boolean>`        | 是否正在切换状态 |
| `toggleFeature()` | `() => Promise<void>` | 切换功能状态     |
| `initialize()`    | `() => Promise<void>` | 初始化功能状态   |

**注意**：这是传统方式，推荐使用新的 `useFeatureToggleWithNotification` 可组合函数，它集成了通知系统，无需手动处理消息事件。

## 核心工具类

### 功能管理器 (featureManager)

**文件位置**: `src/utils/featureManager.ts`

**作用**: 功能管理器基类，提供统一的功能管理模式，封装了功能启用/禁用、状态切换和初始化逻辑。

**特点**:

- 统一的功能管理模式
- 支持目标页面匹配和自动初始化
- 提供一致的 API 接口，便于扩展和维护

**使用示例**:

```typescript
import { createFeatureManager, type CreateFeatureManagerOptions } from '@/utils/featureManager'
import config from '@features/avatarQuery/config.json'

const options: CreateFeatureManagerOptions = {
  config,
  onEnable: () => {
    // 启用功能时的操作
  },
  onDisable: () => {
    // 禁用功能时的操作
  },
  onInit: () => {
    // 初始化时的操作（可选）
  },
}

const avatarQueryManager = createFeatureManager(options)
```

### 存储操作辅助工具 (storageHelper)

**文件位置**: `src/utils/storageHelper.ts`

**作用**: 存储操作辅助工具，提供统一的浏览器存储操作接口。

**特点**:

- 支持多种数据类型：布尔值、字符串、数组、对象
- 内置错误处理和默认值支持
- 提供批量操作和清空功能
- 统一了存储操作的方式，减少重复代码

**使用示例**:

```typescript
import { storageHelper } from '@/utils/storageHelper'

// 加载配置
const enabled = await storageHelper.loadBoolean('avatarQueryEnabled', true)

// 保存配置
await storageHelper.saveBoolean('avatarQueryEnabled', false)

// 加载对象
const config = await storageHelper.loadObject('userConfig', { theme: 'light' })

// 保存数组
await storageHelper.saveArray('recentSearches', ['query1', 'query2'])
```

### 消息通信辅助工具 (messageHelper)

**文件位置**: `src/utils/messageHelper.ts`

**作用**: 消息通信辅助工具，提供统一的浏览器消息通信接口。

**特点**:

- 封装了消息发送和响应处理
- 支持功能切换的通用逻辑
- 内置目标网站检查和错误处理
- 统一了组件与 Content Script 的通信方式

**使用示例**:

```typescript
import { messageHelper } from '@/utils/messageHelper'

// 向当前标签页发送消息
const response = await messageHelper.sendToCurrentTab('GET_STATUS')

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

### URL 匹配工具 (urlMatcher)

**文件位置**: `src/utils/urlMatcher.ts`

**作用**: URL 匹配工具，提供统一的 URL 匹配功能。

**特点**:

- 支持多种匹配模式：精确匹配、包含匹配、正则匹配、通配符匹配
- 自动检测匹配模式，简化配置
- 内置安全检查，防止正则表达式注入
- 提供简化的目标页面匹配方法

**使用示例**:

```typescript
import { urlMatcher } from '@/utils/urlMatcher'

// 检查 URL 是否匹配目标页面
const isTargetPage = urlMatcher.isTargetPage(window.location.href, [
  'https://www.52pojie.cn/forum-*.html',
  'https://www.52pojie.cn/thread-*.html',
])

// 检查是否包含特定路径
const containsPath = urlMatcher.contains('forum-', window.location.href)

// 使用正则表达式匹配
const regexMatch = urlMatcher.regexMatch(/thread-\d+-\d+-\d+\.html/, window.location.href)
```

## 架构优势

### 1. 代码复用性

通过可组合函数，相同的逻辑可以在多个组件中复用，减少重复代码。

### 2. 可维护性

功能逻辑集中管理，修改一处即可影响所有使用该逻辑的组件。

### 3. 测试友好

可组合函数可以独立测试，无需依赖组件上下文。

### 4. 类型安全

完整的 TypeScript 类型支持，提供更好的开发体验。

### 5. 渐进式采用

可以逐步将现有代码迁移到可组合函数架构，无需一次性重写。

## 最佳实践

### 1. 命名规范

- 可组合函数以 `use` 开头，如 `useFeatureToggle`
- 工具类使用描述性名称，如 `storageHelper`
- 类型定义使用 PascalCase

### 2. 错误处理

- 所有异步操作都需要错误处理
- 使用统一的错误处理模式
- 提供用户友好的错误信息

### 3. 响应式管理

- 合理使用 `ref` 和 `reactive`
- 避免不必要的响应式包装
- 使用 `computed` 处理派生状态

### 4. 性能优化

- 使用 `watchEffect` 和 `watch` 时注意依赖收集
- 避免在渲染函数中执行昂贵操作
- 合理使用缓存和记忆化

## 迁移指南

### 从选项式 API 迁移

1. 将 `data` 转换为 `ref` 或 `reactive`
2. 将 `methods` 转换为普通函数
3. 将 `computed` 转换为 `computed` 函数
4. 将生命周期钩子转换为对应的组合式 API

### 从混合模式迁移

1. 识别可复用的逻辑
2. 提取为可组合函数
3. 更新组件使用新函数
4. 移除旧的混合代码

## 相关链接

- [自动导入机制](auto-import.md)
- [功能开关组件开发指南](component-guide.md)
- [Popup 与 Content Script 通信](communication.md)
- [项目文件结构](../../reference/file-structure.md)
