# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架构建的浏览器扩展，专为提升吾爱破解论坛(52pojie.cn)管理效率而设计。项目使用现代化的开发工具和架构，提供便捷的浏览器扩展开发体验。

## 技术栈

- **框架**: WXT ^0.20.13
- **语言**: TypeScript ^5.9.3
- **包管理器**: pnpm@10.28.0
- **UI 框架**: Vue ^3.5.27
- **浏览器支持**: Chrome（Manifest V3）

## 开发命令

```bash
pnpm install      # 安装依赖
npx tsc --noEmit  # TypeScript 类型检查
npx vue-tsc --noEmit # vue3+ts 类型检查
```

**重要提示**：
- **禁止运行** `pnpm dev` 和 `pnpm build` 命令
- 这些命令会启动开发服务器或构建项目，可能导致不必要的资源占用
- 如需构建或运行项目，请由用户手动执行

## 项目架构

项目采用 WXT 框架的模块化架构：

- **入口文件**: `src/entries/` - 包含 content script 和 popup 入口
  - `contents/` - Content Script 模块化入口（已重构）
    - `index.ts` - 主入口文件，协调各模块
    - `initialization.ts` - 功能初始化模块
    - `messageHandler.ts` - 消息处理器模块
    - `storageListener.ts` - 存储监听器模块
- **页面**: `src/pages/` - Vue 3 页面组件目录
- **配置文件**: `src/configs/` - JSON 格式的配置文件
- **工具类**: `src/utils/` - 核心功能实现
- **配置**: `wxt.config.ts` - WXT 框架配置

### Content Script 架构说明

Content Script 采用模块化设计，遵循 WXT 框架的最佳实践：

1. **主入口** (`index.ts`，46 行)
   - 负责协调各个功能模块
   - 创建管理器实例容器
   - 防止重复初始化

2. **初始化模块** (`initialization.ts`，68 行)
   - 初始化所有功能管理器
   - 统一管理功能启动逻辑

3. **消息处理器** (`messageHandler.ts`，375 行)
   - 处理来自 popup 的消息
   - 统一的消息路由和响应

4. **存储监听器** (`storageListener.ts`，156 行)
   - 监听浏览器存储变化
   - 实现跨页面状态同步

**优势**：
- 模块职责清晰，易于维护
- 符合 WXT 框架规范
- 代码复用性高
- 便于单元测试

## 核心功能

### 1. 导航菜单管理

- 允许用户在吾爱破解论坛上自定义显示/隐藏导航菜单
- 配置通过浏览器 storage 本地存储
- 支持实时切换显示/隐藏状态
- 提供重置为默认配置功能

### 2. 头像查询

- 鼠标移动到用户头像时，自动显示该用户的违规记录
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 3. 深色主题支持

- 自动检测系统主题（深色/浅色模式）
- 实时响应系统主题变化
- 使用 CSS 变量实现主题切换

### 4. 快捷回复

- 在举报处理页面添加快捷回复短语下拉框
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 5. 楼层高亮

- 根据URL参数高亮指定楼层
- 提高管理效率
- 支持启用/禁用功能切换

### 6. 原生楼层显示

- 显示已结帖的原生楼层，方便管理悬赏贴
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 7. 紧凑布局

- 优化了组件布局，描述文字移至悬停提示，减少页面滚动
- 标签和开关在同一行显示，节省空间

### 8. 样式统一管理

- 重构子组件样式管理，统一在父组件 SettingsPanel.vue 中管理
- 使用 :deep() 穿透选择器确保父组件样式能应用到子组件
- 移除所有子组件中的重复样式定义，提高代码可维护性

### 9. 全选功能

- 在管理页面添加"除第一条全选"按钮，方便批量操作
- 添加"删除"按钮，快速执行删除操作
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 10. 分表选择器优化

- 将分表选择器替换为按钮式界面，提高操作效率
- 支持隐藏特定分表，简化界面
- 蛇形布局设计，优化按钮排列
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 12. 管理页面查询

- 在管理页面（forum.php?mod=modcp&action=moderate&op=threads）鼠标移动到用户名链接时，自动显示该用户的违规记录
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 13. 自动填充

- 智能监控多种表单，满足条件时自动填充回复内容
- 使用 MutationObserver 监听动态创建的表单
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 使用配置驱动的表单检测机制，易于扩展
- 使用 WeakSet 防止重复绑定，避免内存泄漏

**支持的表单：**

1. **评分表单（rateform）**
   - 监控 `score2`（威望）和 `score6`（热心值）输入框
   - 当 `score2 > 0` 或 `score6 = 1` 时自动填充
   - 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"

2. **处理表单（moderateform）**
   - 监控 `typeid` 下拉框的选项
   - 选择"已答复"时填充："欢迎分析讨论交流，吾爱破解论坛有你更精彩！"
   - 选择"已处理"时填充："已经处理，感谢您对吾爱破解论坛的支持！"

3. **举报表单（reportform）**
   - 监控所有 `select[name*="creditsvalue"]` 元素
   - 当选择正数值（如 +1, +2, +5）时自动填充对应的 `input[name*="msg"]`
   - 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"

### 15. 重复发帖检测
- 在论坛列表页面检测当天发布的重复发帖，高亮显示重复发帖的行
- 支持精确匹配和模糊匹配目标页面
- 配置通过浏览器 storage 本地存储
- 配置文件支持动态修改目标页面
- 自动检测日期格式（支持 2026-01-27 和 2026-1-27 两种格式）
- 高亮显示重复发帖的行，使用黄色背景
- 支持启用/禁用功能切换

- 在管理页面上点击表格行（tr）来勾选对应的复选框，提高操作效率
- 排除有 class 属性的 tr 元素（如表头、空行等）
- 防止点击行内超链接或按钮时触发复选框勾选
- 使用 WeakSet 防止重复绑定，避免内存泄漏
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

## 主要文件

### Content Script 入口（模块化架构）

| 文件                                        | 作用                       |
| ------------------------------------------- | -------------------------- |
| `src/entries/contents/index.ts`             | Content Script 主入口，协调各模块 |
| `src/entries/contents/initialization.ts`    | 功能初始化模块             |
| `src/entries/contents/messageHandler.ts`    | 消息处理器模块             |
| `src/entries/contents/storageListener.ts`   | 存储监听器模块             |

### 配置文件

| 文件                                        | 作用                       |
| ------------------------------------------- | -------------------------- |
| `src/configs/navigation.json`               | 导航菜单配置               |
| `src/configs/quickReply.json`               | 快捷回复配置               |
| `src/configs/avatarQuery.json`              | 头像查询配置               |
| `src/configs/userLinkQuery.json`            | 管理页面查询配置           |
| `src/configs/selectAll.json`                | 全选功能配置               |
| `src/configs/tableSelector.json`            | 分表选择器配置             |
| `src/configs/defaultTime.json`              | 默认查询时间配置           |
| `src/configs/autoFill.json`                 | 自动填充配置               |
| `src/configs/rowClickToCheck.json`          | 勾选范围功能配置           |
| `src/configs/duplicatePostDetection.json`   | 重复发帖检测功能配置       |

### 工具类

| 文件                                        | 作用                       |
| ------------------------------------------- | -------------------------- |
| `src/utils/navigationHider.ts`              | 导航菜单管理工具类         |
| `src/utils/avatarQuery.ts`                  | 头像查询管理工具类         |
| `src/utils/userLinkQuery.ts`                | 管理页面查询管理工具类     |
| `src/utils/userViolationFetcher.ts`         | 用户违规信息获取公共工具   |
| `src/utils/quickReply.ts`                   | 快捷回复管理工具类         |
| `src/utils/floorHighlighter.ts`             | 楼层高亮管理工具类         |
| `src/utils/userInfo.ts`                     | 用户信息获取和缓存工具类   |
| `src/utils/themeManager.ts`                 | 主题管理工具类             |
| `src/utils/nativeFloorDisplay.ts`           | 原生楼层显示管理工具类     |
| `src/utils/selectAll.ts`                    | 全选功能管理工具类         |
| `src/utils/tableSelector.ts`                | 分表选择器管理工具类       |
| `src/utils/defaultTime.ts`                  | 默认查询时间管理工具类     |
| `src/utils/autoFill.ts`                     | 自动填充管理工具类         |
| `src/utils/rowClickToCheck.ts`              | 勾选范围功能管理工具类     |
| `src/utils/duplicatePostDetection.ts`       | 重复发帖检测管理工具类     |

### Vue 组件

| 文件                                        | 作用                       |
| ------------------------------------------- | -------------------------- |
| `src/pages/SettingsPanel.vue`               | 设置面板组件（主容器）     |
| `src/components/NavigationSettings.vue`     | 导航菜单设置组件           |
| `src/components/AvatarQueryToggle.vue`      | 头像查询功能开关组件       |
| `src/components/UserLinkQueryToggle.vue`    | 管理页面查询功能开关组件   |
| `src/components/QuickReplyToggle.vue`       | 快捷回复功能开关组件       |
| `src/components/FloorHighlighterToggle.vue` | 楼层高亮功能开关组件       |
| `src/components/NativeFloorDisplayToggle.vue` | 原生楼层显示功能开关组件   |
| `src/components/SelectAllToggle.vue`        | 全选功能开关组件           |
| `src/components/TableSelectorToggle.vue`    | 分表选择器功能开关组件     |
| `src/components/DefaultTimeToggle.vue`      | 默认查询时间功能开关组件   |
| `src/components/AutoFillToggle.vue`         | 自动填充功能开关组件       |
| `src/components/RowClickToCheckToggle.vue`  | 勾选范围功能开关组件       |
| `src/components/DuplicatePostDetectionToggle.vue` | 重复发帖检测功能开关组件   |

## 路径别名配置

项目配置了以下路径别名以简化导入：

- `@` → `src/`
- `@com` → `src/components/`
- `@utils` → `src/utils/`
- `@ent` → `src/entries/`
- `@pages` → `src/pages/`

## 开发注意事项

### 0. 工具类使用规范

#### 0.1 函数式 API vs 类 API

项目中的工具类提供了两种使用方式：

1. **推荐方式**：使用 `createXxx()` 函数（函数式编程）
2. **已弃用方式**：使用 `XxxManager` 类（面向对象编程）

**示例**：
```typescript
// ✅ 推荐：使用函数式 API
import { createFloorHighlighter, type IFloorHighlighter } from '@utils/floorHighlighter'

const floorHighlighter: IFloorHighlighter = createFloorHighlighter()

// ❌ 已弃用：使用类 API（会显示弃用警告）
import { FloorHighlighter } from '@utils/floorHighlighter'

const floorHighlighter = new FloorHighlighter()
```

**适用的工具类**：
- `createFloorHighlighter()` / `FloorHighlighter`
- `createAvatarQuery()` / `AvatarQueryManager`
- `createUserLinkQuery()` / `UserLinkQueryManager`
- `createNativeFloorDisplay()` / `NativeFloorDisplay`
- `createSelectAll()` / `SelectAllManager`
- `createTableSelector()` / `TableSelectorManager`
- `createDefaultTime()` / `DefaultTimeManager`
- `createDuplicatePostDetection()` / `DuplicatePostDetectionManager`

**为什么使用函数式 API**：
- 更符合现代 JavaScript/TypeScript 开发习惯
- 避免 `this` 绑定问题
- 更容易进行函数组合和测试
- 减少内存占用（闭包 vs 类实例）

### 1. Popup 与 Content Script 通信问题

#### 问题现象
当 popup 在非 52pojie.cn 页面打开时，控制台会出现以下错误：
```
获取用户信息失败: Error: Could not establish connection. Receiving end does not exist.
Failed to get quick query status from content script: Error: Could not establish connection. Receiving end does not exist.
```

#### 解决思路
- **避免不必要的通信**：组件初始化时，应优先从 `browser.storage` 读取配置，而非直接与 content script 通信
- **错误处理优化**：在尝试与 content script 通信时，必须添加适当的错误处理
- **通信时机控制**：只有在确认当前页面是 52pojie.cn 时，才尝试与 content script 通信

#### 修复方案（已实施）
1. **SettingsPanel.vue**：优化用户信息获取的错误处理，通信失败时不显示错误信息
2. **所有 Toggle 组件**：移除 `onMounted` 时从 content script 获取状态的代码，只从 storage 读取配置

### 2. 新增功能开发规范

#### 2.1 组件初始化
```typescript
// 错误做法 - 会在非 52pojie.cn 页面报错
onMounted(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  const response = await browser.tabs.sendMessage(tab.id!, { type: 'GET_STATUS' })
  // ...
})

// 正确做法 - 优先从 storage 读取
onMounted(async () => {
  const storedValue = await loadConfigFromStorage()
  enabled.value = storedValue
})
```

#### 2.2 功能切换
```typescript
const toggleFeature = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      // 与 content script 通信
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_FEATURE' })
      if (response?.success) {
        enabled.value = response.enabled
      }
    } else {
      // 非 52pojie.cn 页面，直接修改 storage
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
    }
  } catch (error) {
    // 通信失败时，直接修改 storage
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
  }
}
```

#### 2.3 错误处理
```typescript
// 错误做法 - 会在控制台显示不必要的错误
onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    const response = await browser.tabs.sendMessage(tab.id!, { type: 'GET_STATUS' })
    if (response?.success) {
      enabled.value = response.enabled
    }
  } catch (error) {
    console.error('Error:', error) // 会在非 52pojie.cn 页面显示错误
  }
})

// 正确做法 - 静默处理通信错误
onMounted(async () => {
  const storedValue = await loadConfigFromStorage()
  enabled.value = storedValue

  // 仅在页面是 52pojie.cn 时尝试同步状态，且不显示错误
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (tab.id && tab.url?.includes('52pojie.cn')) {
    try {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_STATUS' })
      if (response?.success) {
        enabled.value = response.enabled
      }
    } catch (error) {
      // 通信失败时，保持 storage 中的值，不显示错误
    }
  }
})
```

### 3. 最佳实践

1. **配置存储优先**：所有组件状态都应支持从 `browser.storage` 读取和保存
2. **通信容错**：与 content script 通信时，必须添加 try-catch 错误处理
3. **页面判断**：在发送消息前，必须检查当前页面是否是 52pojie.cn
4. **用户体验**：通信失败时，应提供适当的 fallback 方案，而不是报错
5. **代码简洁**：避免在初始化阶段进行不必要的通信，保持代码简洁和高效

### 4. 新建功能开发注意事项

#### 4.1 父子组件传值注意事项

##### 4.1.1 事件通信（子组件→父组件）

**子组件（发送事件）**：
```typescript
// 在子组件中定义事件
const emit = defineEmits(['show-message'])

// 在需要时触发事件
emit('show-message', '消息内容', 'success')
```

**父组件（监听事件）**：
```vue
<!-- 在模板中绑定事件监听器 -->
<ChildComponent @show-message="handleShowMessage" />

<script setup lang="ts">
// 事件处理函数
const handleShowMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text
  messageType.value = type
}
</script>
```

##### 4.1.2 属性传递（父组件→子组件）

**父组件（传递属性）**：
```vue
<ChildComponent :config="someConfig" :enabled="isEnabled" />
```

**子组件（接收属性）**：
```typescript
// 在子组件中定义属性
interface Props {
  config: any
  enabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabled: false
})

// 使用属性
console.log(props.config)
console.log(props.enabled)
```

##### 4.1.3 消息提示机制

**统一处理原则**：
- 所有提示信息应由父组件 `SettingsPanel.vue` 统一处理
- 子组件只负责发送事件，不处理具体的提示逻辑
- 这样可以保持代码一致性，避免重复实现

**实现示例**（子组件中）：
```typescript
const toggleFeature = async () => {
  try {
    // 业务逻辑...
    emit('show-message', '功能已启用', 'success')
  } catch (error) {
    emit('show-message', '操作失败', 'error')
  }
}
```

#### 4.2 组件初始化规范

**正确的初始化方式**：
```typescript
import { ref, onMounted } from 'vue'
import featureConfig from '@/configs/feature.json'

const enabled = ref(featureConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = featureConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? featureConfig.defaultEnabled
})
```

**避免的错误做法**：
```typescript
// 错误做法 - 会在非 52pojie.cn 页面报错
onMounted(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  const response = await browser.tabs.sendMessage(tab.id!, { type: 'GET_STATUS' })
  if (response?.success) {
    enabled.value = response.enabled
  }
})
```

#### 4.3 功能开关组件模板

**完整的功能开关组件结构**：
```vue
<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="featureConfig.description">
      <span>{{ featureConfig.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled :aria-label="featureConfig.name" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import featureConfig from '@/configs/feature.json'

const enabled = ref(featureConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = featureConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? featureConfig.defaultEnabled
})

const toggleFeature = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_FEATURE' })
      if (response?.success) {
        enabled.value = response.enabled
        emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
      } else {
        emit('show-message', '切换功能失败', 'error')
      }
    } else {
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
      emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
    }
  } catch (error) {
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
    emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
  }
}
</script>
```

#### 4.4 功能配置文件规范

**配置文件结构**：
```json
{
  "name": "功能名称",
  "description": "功能描述",
  "defaultEnabled": true,
  "storageKey": "featureKey"
}
```

**存储键命名规范**：
- 使用驼峰命名法
- 前缀统一使用功能英文名称
- 示例：`avatarQueryEnabled`、`quickReplyEnabled`

### 5. Manifest 文件管理

**版本号管理**：
- 每次发布新版本时，需要更新 `wxt.config.ts` 中的版本号
- 版本号格式：`主版本号.次版本号.修订号`
- 功能新增：提升次版本号
- Bug 修复：提升修订号
- 重大重构：提升主版本号

**权限配置**：
- 添加新功能时，检查是否需要额外的权限
- 权限配置在 `wxt.config.ts` 的 `permissions` 数组中
- 只请求必要的权限，遵循最小权限原则

## 许可证

项目采用 AGPL-3.0-only 许可证。
