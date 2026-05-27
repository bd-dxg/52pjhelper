# 模块结构

## 概述

52pjhelper 项目采用功能内聚的模块化架构设计。每个功能的配置、逻辑和 UI 聚合在 `src/features/<name>/` 目录下，共享工具、组件和可组合函数分别放在 `src/utils/`、`src/components/`、`src/composables/` 中。这种设计提高了代码的可维护性、可测试性和可扩展性，同时支持团队协作开发。

## 目录结构

```
src/
├── features/                      # 功能模块（按功能聚合）
│   ├── autofills/                 # 自动填充
│   ├── avatarQuery/               # 头像查询
│   ├── contentFilter/             # 灌水筛选
│   ├── defaultTime/               # 默认时间
│   ├── duplicatePostDetection/    # 重复发帖检测
│   ├── duplicateReplyDetection/   # 重复回帖检测
│   ├── floorHighlighter/          # 楼层高亮
│   ├── navigation/                # 导航菜单
│   ├── nativeFloorDisplay/        # 原生楼层显示
│   ├── quickReply/                # 快捷回复
│   ├── rowClickToCheck/           # 勾选范围
│   ├── selectAll/                 # 全选
│   ├── tableDataExtractor/        # 表格数据提取
│   ├── tableSelector/             # 分表选择器
│   ├── userCloudDiskList/         # 用户网盘名单
│   ├── userLinkQuery/             # 管理页面查询
│   └── versionCheck/              # 版本更新检查
│
├── utils/                         # 共享工具（7 个文件）
│   ├── storageHelper.ts           # 存储操作辅助（18+ 消费者）
│   ├── urlMatcher.ts              # URL 匹配（9 消费者）
│   ├── messageHelper.ts           # 消息通信辅助
│   ├── featureManager.ts          # 功能管理器基类
│   ├── userInfo.ts                # 用户信息获取
│   ├── userViolationFetcher.ts    # 用户违规信息获取
│   └── themeManager.ts            # 主题管理
│
├── components/                    # 共享 UI 组件（8 个文件）
│   ├── AdminFeaturesToggle.vue    # 后台管理功能组开关
│   ├── GeneralFeaturesToggle.vue  # 通用功能组开关
│   ├── Notification.vue           # 通知组件
│   ├── NotificationContainer.vue  # 通知容器
│   ├── NotificationIcon.vue       # 通知图标
│   ├── NotificationDemo.vue       # 通知演示
│   ├── NotificationExampleToggle.vue  # 通知示例开关
│   └── TestNotificationToggle.vue # 通知测试开关
│
├── composables/                   # 可组合函数
│   ├── useFeatureToggle.ts
│   ├── useFeatureToggleWithNotification.ts
│   └── useNotification.ts
│
├── entries/                       # WXT 入口（不移动）
│   ├── contents/                  # Content Script 入口
│   │   ├── index.ts               # 主入口，协调各模块
│   │   ├── initialization.ts      # 功能初始化模块
│   │   ├── messageHandler.ts      # 消息处理器模块
│   │   └── storageListener.ts     # 存储监听器模块
│   ├── background/                # Background Script
│   │   └── index.ts               # 版本检查等后台任务
│   └── popup/                     # Popup 入口
│       ├── index.html
│       ├── main.ts
│       └── App.vue
│
├── pages/                         # 页面组件
│   └── SettingsPanel.vue          # 设置面板主页面
│
└── styles/                        # 共享样式
    ├── toggle.css                 # Toggle 组件样式
    ├── buttons.css                # 按钮样式
    ├── common.css                 # 通用样式
    └── messages.css               # 消息提示样式
```

## 功能模块（`src/features/`）

**职责**: 按功能聚合配置、逻辑和 UI，实现高内聚低耦合

每个功能目录遵循统一的结构约定：

```
src/features/<name>/
├── config.json          # 功能默认配置（存储键、开关状态等）
├── utils.ts / index.ts  # 功能核心逻辑（或拆分为多个模块）
└── <Name>Toggle.vue     # Popup 设置面板中的功能开关组件（可选）
```

| 功能目录                  | 说明             | 主要文件                                                              |
| ------------------------- | ---------------- | --------------------------------------------------------------------- |
| `autofills/`              | 自动填充         | `base.ts`, `rateForm.ts`, `moderateForm.ts`, `reportForm.ts`, `index.ts`, `AutoFillToggle.vue` |
| `avatarQuery/`            | 头像查询         | `utils.ts`, `config.json`, `AvatarQueryToggle.vue`                   |
| `contentFilter/`          | 灌水筛选         | `types.ts`, `config.ts`, `state.ts`, `filtering.ts`, `matcher.ts`, `storage.ts`, `ui.ts`, `index.ts`, `config.json`, `ContentFilterToggle.vue` |
| `defaultTime/`            | 默认时间         | `utils.ts`, `config.json`, `DefaultTimeToggle.vue`                   |
| `duplicatePostDetection/` | 重复发帖检测     | `utils.ts`, `config.json`, `DuplicatePostDetectionToggle.vue`        |
| `duplicateReplyDetection/`| 重复回帖检测     | `utils.ts`, `config.json`, `DuplicateReplyDetectionToggle.vue`       |
| `floorHighlighter/`       | 楼层高亮         | `utils.ts`, `config.json`, `FloorHighlighterToggle.vue`              |
| `navigation/`             | 导航菜单         | `navigationHider.ts`, `config.json`, `NavigationSettings.vue`        |
| `nativeFloorDisplay/`     | 原生楼层显示     | `utils.ts`, `config.json`, `NativeFloorDisplayToggle.vue`            |
| `quickReply/`             | 快捷回复         | `utils.ts`, `config.json`, `QuickReplyToggle.vue`                    |
| `rowClickToCheck/`        | 勾选范围         | `utils.ts`, `config.json`, `RowClickToCheckToggle.vue`               |
| `selectAll/`              | 全选             | `utils.ts`, `config.json`, `SelectAllToggle.vue`                     |
| `tableDataExtractor/`     | 表格数据提取     | `tableDataExtractor.ts`, `config.json`                               |
| `tableSelector/`          | 分表选择器       | `utils.ts`, `config.json`, `TableSelectorToggle.vue`                 |
| `userCloudDiskList/`      | 用户网盘名单     | `types.ts`, `config.ts`, `data.ts`, `factory.ts`, `manager.ts`, `ui.ts`, `processing.ts`, `events.ts`, `index.ts`, `config.json`, `UserCloudDiskListToggle.vue`, `CloudDiskListUpdateButton.vue` |
| `userLinkQuery/`          | 管理页面查询     | `utils.ts`, `config.json`, `UserLinkQueryToggle.vue`                 |
| `versionCheck/`           | 版本更新检查     | `versionChecker.ts`, `config.json`, `VersionCheck.vue`               |

## 入口模块

### Content Script 入口 (`src/entries/contents/`)

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

## 共享工具模块（`src/utils/`）

**职责**: 提供跨功能复用的通用辅助功能

| 文件                | 作用         | 关键方法                              |
| ------------------- | ------------ | ------------------------------------- |
| `storageHelper.ts`  | 存储操作辅助 | `getStorage()`, `setStorage()`, `loadBoolean()`, `saveBoolean()` |
| `urlMatcher.ts`     | URL 匹配工具 | `matchUrl()`, `isTargetPage()`        |
| `messageHelper.ts`  | 消息通信辅助 | `sendMessage()`, `onMessage()`        |
| `featureManager.ts` | 功能管理器   | `enableFeature()`, `disableFeature()` |
| `userInfo.ts`       | 用户信息获取 | `getUserInfo()`, `cacheUserInfo()`    |
| `userViolationFetcher.ts` | 用户违规信息获取 | `fetchViolations()`, `cacheViolations()` |
| `themeManager.ts`   | 主题管理     | `enableDarkTheme()`, `enableLightTheme()` |

## 共享组件模块（`src/components/`）

**职责**: 实现跨功能复用的用户界面

| 组件                          | 作用           | 关键特性               |
| ----------------------------- | -------------- | ---------------------- |
| `GeneralFeaturesToggle.vue`   | 通用功能组开关 | 分组管理，批量控制     |
| `AdminFeaturesToggle.vue`     | 后台管理功能组开关 | 分组管理，批量控制 |
| `Notification.vue`            | 通知组件       | 多种通知类型           |
| `NotificationContainer.vue`   | 通知容器       | 通知定位和布局         |
| `NotificationIcon.vue`        | 通知图标       | 图标样式               |
| `NotificationDemo.vue`        | 通知演示       | 演示和预览             |
| `NotificationExampleToggle.vue` | 通知示例开关 | 示例触发               |
| `TestNotificationToggle.vue`  | 通知测试开关   | 测试触发               |

## 可组合函数（`src/composables/`）

**职责**: 提供 Vue 3 组合式 API 的可复用逻辑

| 文件                           | 作用               | 关键特性                   |
| ------------------------------ | ------------------ | -------------------------- |
| `useFeatureToggle.ts`          | 功能开关逻辑       | 统一的启用/禁用逻辑        |
| `useFeatureToggleWithNotification.ts` | 带通知的功能开关 | 功能开关 + 通知提示 |
| `useNotification.ts`           | 通知系统           | 通知创建和管理             |

## 样式模块（`src/styles/`）

**职责**: 管理项目的共享样式

| 文件            | 作用            | 关键内容           |
| --------------- | --------------- | ------------------ |
| `toggle.css`    | Toggle 组件样式 | 开关样式，过渡效果 |
| `buttons.css`   | 按钮样式        | 按钮通用样式       |
| `common.css`    | 通用样式        | 全局基础样式       |
| `messages.css`  | 消息提示样式    | 通知消息样式       |

## 模块间通信

### 1. 入口模块 → 功能模块

```typescript
// src/entries/contents/initialization.ts
import { createContentFilter } from '@features/contentFilter'
import { initializeNavigationHider } from '@features/navigation/navigationHider'
import { createUserCloudDiskList } from '@features/userCloudDiskList'

// 初始化功能
managers.contentFilter = createContentFilter()
initializeNavigationHider()
```

### 2. 功能模块 → 共享工具

```typescript
// src/features/contentFilter/index.ts
import { storageHelper } from '@utils/storageHelper'
import { urlMatcher } from '@utils/urlMatcher'

// 使用共享工具
const enabled = await storageHelper.loadBoolean(STORAGE_KEY, contentFilterConfig.defaultEnabled)
```

### 3. 功能模块内部（相对路径）

```typescript
// src/features/contentFilter/index.ts
import { contentFilterConfig, STORAGE_KEY } from './config'
import { performFiltering } from './filtering'
import { contentFilterState } from './state'
```

### 4. 功能配置文件内部引用

```typescript
// src/features/navigation/navigationHider.ts
import navConfig from './config.json'
```

### 5. 共享组件 → 功能模块

```typescript
// src/components/GeneralFeaturesToggle.vue
import FloorHighlighterToggle from '@features/floorHighlighter/FloorHighlighterToggle.vue'
import NativeFloorDisplayToggle from '@features/nativeFloorDisplay/NativeFloorDisplayToggle.vue'
```

### 6. 页面 → 功能模块和共享组件

```typescript
// src/pages/SettingsPanel.vue
import NavigationSettings from '@features/navigation/NavigationSettings.vue'
import GeneralFeaturesToggle from '@com/GeneralFeaturesToggle.vue'
import AdminFeaturesToggle from '@com/AdminFeaturesToggle.vue'
import VersionCheck from '@features/versionCheck/VersionCheck.vue'
import CloudDiskListUpdateButton from '@features/userCloudDiskList/CloudDiskListUpdateButton.vue'
```

### 7. Content Script ↔ Background Script

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

## 路径别名

| 别名       | 映射路径         | 用途                         |
| ---------- | ---------------- | ---------------------------- |
| `@`        | `src/`           | 根目录                       |
| `@com`     | `src/components/`| 共享组件                     |
| `@utils`   | `src/utils/`     | 共享工具                     |
| `@ent`     | `src/entries/`   | 入口文件                     |
| `@pages`   | `src/pages/`     | 页面组件                     |
| `@features`| `src/features/`  | 功能模块                     |

## 模块设计原则

### 1. 功能内聚原则

- 每个功能的所有文件聚合在 `src/features/<name>/` 目录下
- 功能内部使用**相对路径**导入同目录文件
- 功能之间通过 `@features/<name>` 别名导入，不直接依赖内部路径

### 2. 共享与功能分离

- `src/utils/` 仅存放被多个功能共同依赖的通用工具
- `src/components/` 仅存放被多个页面或功能共同使用的 UI 组件
- `src/composables/` 存放跨功能复用的 Vue 组合式逻辑

### 3. 单一职责原则

- 每个模块只负责一个明确的功能
- 避免功能交叉和职责重叠
- 提高代码的可测试性

### 4. 开闭原则

- 模块对扩展开放，对修改封闭
- 新功能通过新增目录实现，不修改已有功能
- 支持新功能的无缝集成

## 扩展性设计

### 新功能添加流程

1. **创建功能目录**: 在 `src/features/` 下创建新功能目录（kebab-case 命名）
2. **添加配置文件**: 创建 `config.json`，定义默认配置和存储键
3. **实现功能逻辑**: 创建 `utils.ts`（或按职责拆分为多个文件），导出 `create<Name>()` 工厂函数
4. **创建开关组件**（可选）: 创建 `<Name>Toggle.vue`，使用 `useFeatureToggle` 可组合函数
5. **注册功能**: 在 `src/entries/contents/initialization.ts` 中调用初始化函数
6. **集成到设置面板**: 在 `src/pages/SettingsPanel.vue` 或对应的 `*FeaturesToggle.vue` 中引入开关组件

### 功能模块模板

```typescript
// src/features/newFeature/config.json
{
  "storageKey": "newFeature",
  "defaultEnabled": true
}

// src/features/newFeature/utils.ts
import featureConfig from './config.json'
import { storageHelper } from '@utils/storageHelper'

const STORAGE_KEY = featureConfig.storageKey

export const enableFeature = async (): Promise<void> => {
  // 启用时的逻辑
}

export const disableFeature = (): void => {
  // 禁用时的逻辑
}

export const createNewFeature = () => {
  // 初始化逻辑

  return {
    toggle: async () => {
      const enabled = await storageHelper.loadBoolean(STORAGE_KEY, featureConfig.defaultEnabled)
      const newEnabled = !enabled
      await storageHelper.saveBoolean(STORAGE_KEY, newEnabled)
      if (newEnabled) await enableFeature()
      else disableFeature()
      return newEnabled
    },
    getStatus: () => storageHelper.loadBoolean(STORAGE_KEY, featureConfig.defaultEnabled),
  }
}
```

## 测试策略

### 1. 单元测试

- 测试独立的工具模块和功能逻辑
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
