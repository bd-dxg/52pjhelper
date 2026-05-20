# 模块结构

## 概述

52pjhelper 项目采用模块化架构设计，将功能按职责划分为不同的模块。这种设计提高了代码的可维护性、可测试性和可扩展性，同时支持团队协作开发。

## 目录结构

```
src/
├── entries/                    # 入口文件
│   ├── content/               # Content Script 入口
│   │   ├── index.ts           # 主入口，协调各模块
│   │   ├── initialization.ts  # 功能初始化模块
│   │   ├── messageHandler.ts  # 消息处理器模块
│   │   └── storageListener.ts # 存储监听器模块
│   └── background/            # Background Script
│       └── index.ts           # 版本检查等后台任务
│
├── configs/                   # 配置文件
│   ├── navigation.json        # 导航菜单配置
│   ├── quickReply.json        # 快捷回复配置
│   ├── avatarQuery.json       # 头像查询配置
│   ├── userLinkQuery.json     # 管理页面查询配置
│   ├── selectAll.json         # 全选功能配置
│   ├── tableSelector.json     # 分表选择器配置
│   ├── defaultTime.json       # 默认查询时间配置
│   ├── autoFill.json          # 自动填充配置
│   ├── rowClickToCheck.json   # 勾选范围功能配置
│   ├── duplicateReplyDetection.json # 重复回帖检测配置
│   ├── contentFilter.json     # 灌水筛选配置
│   └── versionCheck.json      # 版本更新检查配置
│
├── utils/                     # 工具类
│   ├── navigationHider.ts     # 导航菜单管理工具类
│   ├── avatarQuery.ts         # 头像查询管理工具类
│   ├── userLinkQuery.ts       # 管理页面查询管理工具类
│   ├── userViolationFetcher.ts # 用户违规信息获取工具
│   ├── quickReply.ts          # 快捷回复管理工具类
│   ├── floorHighlighter.ts    # 楼层高亮管理工具类
│   ├── userInfo.ts            # 用户信息获取和缓存工具类
│   ├── themeManager.ts        # 主题管理工具类
│   ├── nativeFloorDisplay.ts  # 原生楼层显示管理工具类
│   ├── selectAll.ts           # 全选功能管理工具类
│   ├── tableSelector.ts       # 分表选择器管理工具类
│   ├── defaultTime.ts         # 默认查询时间管理工具类
│   ├── autoFill.ts            # 自动填充管理工具类
│   ├── rowClickToCheck.ts     # 勾选范围功能管理工具类
│   ├── duplicateReplyDetection.ts # 重复回帖检测管理工具类
│   ├── contentFilter.ts       # 灌水筛选管理工具类
│   ├── featureManager.ts      # 功能管理器
│   ├── storageHelper.ts       # 存储操作辅助工具
│   ├── messageHelper.ts       # 消息通信辅助工具
│   └── urlMatcher.ts          # URL 匹配工具
│
├── components/                # Vue 组件
│   ├── GeneralFeaturesToggle.vue     # 通用功能组开关
│   ├── AdminFeaturesToggle.vue       # 后台管理功能组开关
│   ├── NavigationToggle.vue          # 导航菜单功能开关
│   ├── AvatarQueryToggle.vue         # 头像查询功能开关
│   ├── QuickReplyToggle.vue          # 快捷回复功能开关
│   ├── FloorHighlighterToggle.vue    # 楼层高亮功能开关
│   ├── NativeFloorDisplayToggle.vue  # 原生楼层显示功能开关
│   ├── ThemeToggle.vue               # 主题功能开关
│   ├── CompactLayoutToggle.vue       # 紧凑布局功能开关
│   ├── SelectAllToggle.vue           # 全选功能开关组件
│   ├── TableSelectorToggle.vue       # 分表选择器功能开关组件
│   ├── DefaultTimeToggle.vue         # 默认查询时间功能开关组件
│   ├── AutoFillToggle.vue            # 自动填充功能开关组件
│   ├── RowClickToCheckToggle.vue     # 勾选范围功能开关组件
│   ├── DuplicateReplyDetectionToggle.vue # 重复回帖检测功能开关组件
│   └── ContentFilterToggle.vue       # 灌水筛选功能开关组件
│
└── styles/                    # 样式文件
    ├── toggle.css            # Toggle 组件样式
    └── variables.css         # CSS 变量定义
```

## 入口模块

### Content Script 入口 (`src/entries/content/`)

**职责**: 在吾爱破解论坛页面上注入功能代码

| 文件                 | 作用               | 关键特性                       |
| -------------------- | ------------------ | ------------------------------ |
| `index.ts`           | 主入口，协调各模块 | 防止重复初始化，创建管理器容器 |
| `initialization.ts`  | 功能初始化模块     | 统一初始化逻辑，错误处理       |
| `messageHandler.ts`  | 消息处理器模块     | 消息路由，异步处理             |
| `storageListener.ts` | 存储监听器模块     | 状态同步，变化通知             |

### Background Script (`src/entries/background/`)

**职责**: 处理后台任务和跨页面通信

| 文件       | 作用               | 关键特性           |
| ---------- | ------------------ | ------------------ |
| `index.ts` | 版本检查等后台任务 | 定时检查，通知提醒 |

## 配置模块

### 配置文件 (`src/configs/`)

**职责**: 管理各功能的配置参数

| 文件                          | 对应功能     | 配置示例                  |
| ----------------------------- | ------------ | ------------------------- |
| `navigation.json`             | 导航菜单     | `{"enabled": true}`       |
| `quickReply.json`             | 快捷回复     | `{"phrases": ["已处理"]}` |
| `avatarQuery.json`            | 头像查询     | `{"enabled": true}`       |
| `userLinkQuery.json`          | 管理页面查询 | `{"enabled": true}`       |
| `selectAll.json`              | 全选功能     | `{"enabled": true}`       |
| `tableSelector.json`          | 分表选择器   | `{"enabled": true}`       |
| `defaultTime.json`            | 默认查询时间 | `{"days": 7}`             |
| `autoFill.json`               | 自动填充     | `{"enabled": true}`       |
| `rowClickToCheck.json`        | 勾选范围     | `{"enabled": true}`       |
| `duplicatePostDetection.json` | 重复发帖检测 | `{"enabled": true}`       |
| `contentFilter.json`          | 灌水筛选     | `{"enabled": true}`       |
| `versionCheck.json`           | 版本更新检查 | `{"interval": 24}`        |

## 工具模块

### 功能工具类 (`src/utils/`)

**职责**: 实现具体的功能逻辑

| 文件                        | 对应功能         | 关键方法                                        |
| --------------------------- | ---------------- | ----------------------------------------------- |
| `navigationHider.ts`        | 导航菜单管理     | `hideNavigation()`, `showNavigation()`          |
| `avatarQuery.ts`            | 头像查询         | `queryUserViolations()`, `showViolationPanel()` |
| `userLinkQuery.ts`          | 管理页面查询     | `queryUserInfo()`, `displayUserInfo()`          |
| `userViolationFetcher.ts`   | 用户违规信息获取 | `fetchViolations()`, `cacheViolations()`        |
| `quickReply.ts`             | 快捷回复         | `addQuickReply()`, `removeQuickReply()`         |
| `floorHighlighter.ts`       | 楼层高亮         | `highlightFloor()`, `clearHighlights()`         |
| `userInfo.ts`               | 用户信息获取     | `getUserInfo()`, `cacheUserInfo()`              |
| `themeManager.ts`           | 主题管理         | `enableDarkTheme()`, `enableLightTheme()`       |
| `nativeFloorDisplay.ts`     | 原生楼层显示     | `showNativeFloors()`, `hideNativeFloors()`      |
| `selectAll.ts`              | 全选功能         | `selectAllExceptFirst()`, `deleteSelected()`    |
| `tableSelector.ts`          | 分表选择器       | `switchTable()`, `createButtonLayout()`         |
| `defaultTime.ts`            | 默认查询时间     | `setDefaultTime()`, `getDefaultTime()`          |
| `autoFill.ts`               | 自动填充         | `autoFillForm()`, `monitorForms()`              |
| `rowClickToCheck.ts`        | 勾选范围         | `handleRowClick()`, `updateVisualFeedback()`    |
| `duplicatePostDetection.ts` | 重复发帖检测     | `detectDuplicates()`, `highlightDuplicates()`   |
| `contentFilter.ts`          | 灌水筛选         | `filterContent()`, `createFilterCard()`         |

### 通用工具类 (`src/utils/`)

**职责**: 提供通用的辅助功能

| 文件                | 作用         | 关键方法                              |
| ------------------- | ------------ | ------------------------------------- |
| `featureManager.ts` | 功能管理器   | `enableFeature()`, `disableFeature()` |
| `storageHelper.ts`  | 存储操作辅助 | `getStorage()`, `setStorage()`        |
| `messageHelper.ts`  | 消息通信辅助 | `sendMessage()`, `onMessage()`        |
| `urlMatcher.ts`     | URL 匹配工具 | `matchUrl()`, `isTargetPage()`        |

## 组件模块

### Vue 组件 (`src/components/`)

**职责**: 实现用户界面和交互

| 组件                               | 对应功能                 | 关键特性               |
| ---------------------------------- | ------------------------ | ---------------------- |
| `GeneralFeaturesToggle.vue`        | 通用功能组开关           | 分组管理，批量控制     |
| `AdminFeaturesToggle.vue`          | 后台管理功能组开关       | 分组管理，批量控制     |
| `NavigationToggle.vue`             | 导航菜单功能开关         | 实时切换，状态保存     |
| `AvatarQueryToggle.vue`            | 头像查询功能开关         | 状态管理，配置保存     |
| `QuickReplyToggle.vue`             | 快捷回复功能开关         | 短语管理，实时预览     |
| `FloorHighlighterToggle.vue`       | 楼层高亮功能开关         | URL参数检测，高亮控制  |
| `NativeFloorDisplayToggle.vue`     | 原生楼层显示功能开关     | 楼层检测，显示控制     |
| `ThemeToggle.vue`                  | 主题功能开关             | 系统主题检测，实时切换 |
| `CompactLayoutToggle.vue`          | 紧凑布局功能开关         | 布局优化，空间节省     |
| `SelectAllToggle.vue`              | 全选功能开关组件         | 批量操作，状态管理     |
| `TableSelectorToggle.vue`          | 分表选择器功能开关组件   | 界面切换，配置管理     |
| `DefaultTimeToggle.vue`            | 默认查询时间功能开关组件 | 时间设置，状态保存     |
| `AutoFillToggle.vue`               | 自动填充功能开关组件     | 表单监控，智能填充     |
| `RowClickToCheckToggle.vue`        | 勾选范围功能开关组件     | 行点击，状态反馈       |
| `DuplicatePostDetectionToggle.vue` | 重复发帖检测功能开关组件 | 重复检测，高亮显示     |
| `ContentFilterToggle.vue`          | 灌水筛选功能开关组件     | 过滤规则，卡片界面     |

## 样式模块

### 样式文件 (`src/styles/`)

**职责**: 管理项目的样式和主题

| 文件            | 作用            | 关键内容           |
| --------------- | --------------- | ------------------ |
| `toggle.css`    | Toggle 组件样式 | 开关样式，过渡效果 |
| `variables.css` | CSS 变量定义    | 颜色变量，尺寸变量 |

## 模块间通信

### 1. 入口模块 ↔ 工具模块

```typescript
// 入口模块调用工具模块
import { navigationHider } from '@/utils/navigationHider'

// 初始化功能
navigationHider.initialize()
```

### 2. 工具模块 ↔ 配置模块

```typescript
// 工具模块读取配置
import navigationConfig from '@/configs/navigation.json'

// 使用配置
if (navigationConfig.enabled) {
  // 执行功能
}
```

### 3. 组件模块 ↔ 工具模块

```typescript
// 组件调用工具功能
import { themeManager } from '@/utils/themeManager'

// 切换主题
function toggleTheme() {
  themeManager.toggleTheme()
}
```

### 4. Content Script ↔ Background Script

```typescript
// Content Script 发送消息
browser.runtime.sendMessage({
  type: 'checkVersion',
  payload: { force: true },
})

// Background Script 接收消息
browser.runtime.onMessage.addListener(message => {
  if (message.type === 'checkVersion') {
    checkVersionUpdate(message.payload.force)
  }
})
```

## 模块设计原则

### 1. 单一职责原则

- 每个模块只负责一个明确的功能
- 避免功能交叉和职责重叠
- 提高代码的可测试性

### 2. 开闭原则

- 模块对扩展开放，对修改封闭
- 通过接口和抽象类实现扩展
- 支持新功能的无缝集成

### 3. 依赖倒置原则

- 高层模块不依赖低层模块
- 两者都依赖抽象接口
- 提高模块的灵活性

### 4. 接口隔离原则

- 客户端不应依赖不需要的接口
- 接口尽量小而专一
- 减少模块间的耦合

## 扩展性设计

### 1. 新功能添加流程

1. **创建配置文件**: 在 `src/configs/` 中添加 JSON 配置
2. **创建工具类**: 在 `src/utils/` 中实现功能逻辑
3. **创建组件**: 在 `src/components/` 中添加 Vue 组件
4. **注册功能**: 在初始化模块中注册新功能
5. **更新文档**: 更新相关文档和测试

### 2. 功能模块模板

```typescript
// 工具类模板
export class NewFeatureManager {
  private enabled = false

  async initialize(): Promise<void> {
    // 初始化逻辑
  }

  async enable(): Promise<void> {
    this.enabled = true
    await this.onEnable()
  }

  async disable(): Promise<void> {
    this.enabled = false
    await this.onDisable()
  }

  private async onEnable(): Promise<void> {
    // 启用时的逻辑
  }

  private async onDisable(): Promise<void> {
    // 禁用时的逻辑
  }
}
```

### 3. 配置模块模板

```json
{
  "newFeature": {
    "enabled": true,
    "configOption1": "value1",
    "configOption2": "value2"
  }
}
```

## 测试策略

### 1. 单元测试

- 测试独立的工具模块
- 模拟依赖和环境
- 验证边界条件

### 2. 集成测试

- 测试模块间交互
- 验证通信机制
- 测试配置加载

### 3. 组件测试

- 测试 Vue 组件渲染
- 验证用户交互
- 测试状态管理

### 4. 端到端测试

- 测试完整功能流程
- 验证页面交互
- 测试性能指标

## 维护和升级

### 1. 版本兼容性

- 保持向后兼容的 API
- 提供版本迁移指南
- 处理配置格式变化

### 2. 依赖管理

- 定期更新依赖版本
- 测试兼容性变化
- 提供升级指南

### 3. 代码重构

- 遵循重构最佳实践
- 保持测试覆盖率
- 提供重构文档

---

**相关链接**：

- [架构概述](overview.md)
- [Content Script 架构](content-script.md)
- [技术栈详解](technical-stack.md)
- [开发文档](../development/composable-architecture.md)
