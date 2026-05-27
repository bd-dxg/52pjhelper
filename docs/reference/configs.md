# JSON 配置文件参考

本文档详细介绍了项目中的功能配置文件，包括文件结构、字段说明和配置示例。

## 配置文件目录结构

配置文件已从 `src/configs/` 迁移到各功能模块目录中，每个功能拥有独立的 `config.json`：

```
src/features/
├── avatarQuery/config.json
├── autofills/config.json
├── contentFilter/config.json
├── defaultTime/config.json
├── duplicatePostDetection/config.json
├── duplicateReplyDetection/config.json
├── floorHighlighter/config.json
├── nativeFloorDisplay/config.json
├── navigation/config.json
├── quickReply/config.json
├── rowClickToCheck/config.json
├── selectAll/config.json
├── tableDataExtractor/config.json
├── tableSelector/config.json
├── userCloudDiskList/config.json
├── userLinkQuery/config.json
└── versionCheck/config.json
```

> **注意**：旧的 `src/configs/` 目录已删除。`@conf` 路径别名已移除，改用 `@features` 别名（指向 `src/features/`）。

## 功能配置文件通用结构

每个功能的 `config.json` 遵循统一的结构：

```json
{
  "name": "功能名称",
  "description": "功能描述",
  "storageKey": "feature_key_enabled",
  "defaultEnabled": true,
  "requiresReload": false,
  "messageType": "TOGGLE_FEATURE_NAME"
}
```

### 字段说明

| 字段             | 类型       | 必填 | 说明                 | 示例                           |
| ---------------- | ---------- | ---- | -------------------- | ------------------------------ |
| `name`           | `string`   | 是   | 功能显示名称         | `"头像查询"`                   |
| `description`    | `string`   | 是   | 功能详细描述         | `"鼠标悬停显示用户违规记录"`   |
| `storageKey`     | `string`   | 是   | 浏览器存储键名       | `"avatarQueryEnabled"`         |
| `defaultEnabled` | `boolean`  | 否   | 默认启用状态         | `true`                         |
| `requiresReload` | `boolean`  | 否   | 切换后是否需要刷新页面 | `false`                      |
| `messageType`    | `string`   | 否   | 通信消息类型         | `"TOGGLE_AVATAR_QUERY"`        |

## 配置文件示例

### 头像查询 (avatarQuery/config.json)

```json
{
  "name": "头像查询",
  "description": "鼠标悬停显示用户违规记录",
  "storageKey": "avatarQueryEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_AVATAR_QUERY"
}
```

### 快捷回复 (quickReply/config.json)

```json
{
  "name": "快捷回复",
  "description": "举报处理页面快捷回复模板",
  "storageKey": "quickReplyEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_QUICK_REPLY"
}
```

### 导航菜单 (navigation/config.json)

```json
{
  "name": "导航菜单管理",
  "description": "自定义显示/隐藏导航菜单",
  "storageKey": "navigationEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_NAVIGATION"
}
```

### 内容过滤 (contentFilter/config.json)

```json
{
  "name": "灌水筛选",
  "description": "可拖动的过滤卡片",
  "storageKey": "contentFilterEnabled",
  "defaultEnabled": false,
  "messageType": "TOGGLE_CONTENT_FILTER"
}
```

### 用户网盘名单 (userCloudDiskList/config.json)

```json
{
  "name": "用户网盘名单",
  "description": "高亮显示网盘名单用户并显示网盘信息",
  "storageKey": "userCloudDiskListEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_USER_CLOUD_DISK_LIST"
}
```

### 自动填充 (autofills/config.json)

```json
{
  "name": "自动填充",
  "description": "智能表单自动填充",
  "storageKey": "autofillsEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_AUTOFILLS"
}
```

### 重复回帖检测 (duplicatePostDetection/config.json)

```json
{
  "name": "重复回帖检测",
  "description": "高亮显示当天内同一用户的多次回帖",
  "storageKey": "duplicatePostDetectionEnabled",
  "defaultEnabled": true,
  "messageType": "TOGGLE_DUPLICATE_POST_DETECTION"
}
```

## 配置文件导入方式

### 从外部导入（推荐使用 `@features` 别名）

```typescript
// 使用 @features 路径别名
import avatarQueryConfig from '@features/avatarQuery/config.json'
import quickReplyConfig from '@features/quickReply/config.json'
```

### 功能内部导入（使用相对路径）

```typescript
// 在功能模块内部，使用相对路径
import config from './config.json'
```

### 在 Toggle 组件中使用

```vue
<script setup lang="ts">
import featureConfig from '@features/avatarQuery/config.json'
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'

const config = {
  name: featureConfig.name,
  description: featureConfig.description,
  storageKey: featureConfig.storageKey,
  defaultEnabled: featureConfig.defaultEnabled,
  messageType: featureConfig.messageType,
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>
```

## 配置与存储键映射

每个功能的 `storageKey` 字段对应浏览器存储中的实际键名：

| 功能             | storageKey                    | 说明               |
| ---------------- | ----------------------------- | ------------------ |
| 头像查询         | `avatarQueryEnabled`          | 头像查询开关状态   |
| 快捷回复         | `quickReplyEnabled`           | 快捷回复开关状态   |
| 楼层高亮         | `floorHighlighterEnabled`     | 楼层高亮开关状态   |
| 原生楼层显示     | `nativeFloorDisplayEnabled`   | 原生楼层显示开关   |
| 全选功能         | `selectAllEnabled`            | 全选功能开关状态   |
| 分表选择器       | `tableSelectorEnabled`        | 分表选择器开关状态 |
| 自动填充         | `autofillsEnabled`            | 自动填充开关状态   |
| 重复回帖检测     | `duplicatePostDetectionEnabled` | 重复回帖检测开关 |
| 重复回帖检测     | `duplicateReplyDetectionEnabled` | 重复回帖检测开关 |
| 灌水筛选         | `contentFilterEnabled`        | 灌水筛选开关状态   |
| 用户网盘名单     | `userCloudDiskListEnabled`    | 网盘名单开关状态   |
| 导航菜单管理     | `navigationEnabled`           | 导航菜单开关状态   |
| 版本更新检查     | `versionCheckEnabled`         | 版本检查开关状态   |

## 添加新功能配置

### 步骤 1：创建功能目录

在 `src/features/` 下创建新的功能目录，包含 `config.json`：

```json
{
  "name": "新功能",
  "description": "新功能的详细描述",
  "storageKey": "newFeatureEnabled",
  "defaultEnabled": false,
  "messageType": "TOGGLE_NEW_FEATURE"
}
```

### 步骤 2：在 Toggle 组件中引用

```typescript
import newFeatureConfig from '@features/newFeature/config.json'
```

## 配置最佳实践

### 1. 命名规范

- `storageKey` 使用 camelCase：`featureNameEnabled`
- `messageType` 使用 UPPER_SNAKE_CASE：`TOGGLE_FEATURE_NAME`
- `name` 使用中文，面向用户显示

### 2. 向后兼容

- 新增字段应该是可选的
- 保持 `storageKey` 不变，避免用户数据丢失

### 3. 默认值

- `defaultEnabled` 应根据功能重要性和影响范围谨慎设置
- 可能影响页面加载的功能默认为 `false`

## 相关文档

- [配置文件概述](../config/overview.md) - 配置文件整体结构
- [功能开关组件指南](../development/component-guide.md) - 功能开关组件开发指南
- [可组合函数式架构](../development/composable-architecture.md) - 可组合函数使用指南
- [通知系统指南](../development/notification-system.md) - 通知系统使用说明

---

_文档版本：2.0.0_
_最后更新：2026-05-28_
_更新内容：反映功能模块化重构后的配置文件结构_
