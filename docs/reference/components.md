# Vue 组件参考

本文档列出了项目中所有的 Vue 组件，包括组件说明、Props、Events 和使用示例。

## 组件目录结构

```
src/components/                # 共享 UI 组件
├── AdminFeaturesToggle.vue    # 后台管理功能开关列表
├── GeneralFeaturesToggle.vue  # 通用功能开关列表
├── Notification.vue           # 基础通知组件
├── NotificationContainer.vue  # 全局通知容器
├── NotificationDemo.vue       # 通知演示组件
├── NotificationExampleToggle.vue # 通知示例开关
├── NotificationIcon.vue       # 通知图标组件
└── TestNotificationToggle.vue # 通知测试开关
```

> **注意**：功能特定的 Toggle 组件已迁移到各自的功能模块目录中（`src/features/<name>/`），不再放在 `src/components/` 下。

## 功能模块内的 Toggle 组件

每个功能模块都包含自己的 Toggle 组件，位于 `src/features/<name>/` 目录下：

```
src/features/
├── avatarQuery/AvatarQueryToggle.vue
├── autofills/AutoFillToggle.vue
├── contentFilter/ContentFilterToggle.vue
├── defaultTime/DefaultTimeToggle.vue
├── duplicatePostDetection/DuplicatePostDetectionToggle.vue
├── duplicateReplyDetection/DuplicateReplyDetectionToggle.vue
├── floorHighlighter/FloorHighlighterToggle.vue
├── nativeFloorDisplay/NativeFloorDisplayToggle.vue
├── navigation/NavigationSettings.vue
├── quickReply/QuickReplyToggle.vue
├── rowClickToCheck/RowClickToCheckToggle.vue
├── selectAll/SelectAllToggle.vue
├── tableSelector/TableSelectorToggle.vue
├── userCloudDiskList/UserCloudDiskListToggle.vue
├── userCloudDiskList/CloudDiskListUpdateButton.vue
├── userLinkQuery/UserLinkQueryToggle.vue
└── versionCheck/VersionCheck.vue
```

## 共享 UI 组件

### AdminFeaturesToggle - 后台管理功能开关列表

**文件位置**: `src/components/AdminFeaturesToggle.vue`

**说明**: 后台管理页面的功能开关列表容器，展示所有后台管理相关的功能开关。

**使用示例**:

```vue
<template>
  <AdminFeaturesToggle />
</template>
```

### GeneralFeaturesToggle - 通用功能开关列表

**文件位置**: `src/components/GeneralFeaturesToggle.vue`

**说明**: 通用页面的功能开关列表容器，展示所有通用功能开关。

**使用示例**:

```vue
<template>
  <GeneralFeaturesToggle />
</template>
```

## 通知系统组件

### Notification - 基础通知组件

**文件位置**: `src/components/Notification.vue`

**说明**: 基础通知组件，支持多种通知类型和配置。

**Props**:

| 名称        | 类型                                                           | 默认值      | 说明         |
| ----------- | -------------------------------------------------------------- | ----------- | ------------ |
| `type`      | `'success' \| 'error' \| 'warning' \| 'info' \| 'update'`     | `'info'`    | 通知类型     |
| `message`   | `string`                                                       | `''`        | 通知内容     |
| `title`     | `string`                                                       | `''`        | 通知标题     |
| `duration`  | `number`                                                       | `3000`      | 自动消失时间（毫秒） |
| `dismissible` | `boolean`                                                    | `true`      | 是否可手动关闭 |
| `position`  | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'center'` | `'top-right'` | 显示位置 |
| `actions`   | `NotificationAction[]`                                         | `[]`        | 操作按钮数组 |

**Events**:

| 名称     | 参数       | 说明         |
| -------- | ---------- | ------------ |
| `dismiss`| 无         | 关闭通知     |
| `action` | `action`   | 点击操作按钮 |

**使用示例**:

```vue
<template>
  <Notification
    type="success"
    message="操作成功完成"
    title="成功"
    :duration="3000"
    :dismissible="true"
    position="top-right"
    :actions="actions"
    @dismiss="handleDismiss"
    @action="handleAction" />
</template>
```

### NotificationContainer - 全局通知容器

**文件位置**: `src/components/NotificationContainer.vue`

**说明**: 全局通知容器，自动显示所有通过 `useNotification` 发出的通知。需要在应用根组件中引入。

**使用示例**:

```vue
<template>
  <div>
    <!-- 应用内容 -->
    <NotificationContainer />
  </div>
</template>
```

### NotificationIcon - 通知图标组件

**文件位置**: `src/components/NotificationIcon.vue`

**说明**: 根据通知类型显示对应的图标。

### NotificationDemo - 通知演示组件

**文件位置**: `src/components/NotificationDemo.vue`

**说明**: 通知系统的完整演示组件，展示所有通知类型和配置选项。

## 通用组件使用指南

### 1. 组件导入

```vue
<template>
  <!-- 使用自动导入，无需显式导入 -->
  <NotificationContainer />
</template>

<script setup>
// 组件已通过 auto-import 自动导入
</script>
```

### 2. 组件 Props 传递

```vue
<template>
  <!-- 使用 v-bind 传递多个 props -->
  <Notification v-bind="notificationProps" />
</template>

<script setup>
const notificationProps = {
  type: 'success',
  message: '操作成功',
  title: '提示',
}
</script>
```

### 3. 事件处理

```vue
<template>
  <Notification @dismiss="handleDismiss" @action="handleAction" />
</template>

<script setup>
const handleDismiss = () => {
  console.log('通知已关闭')
}

const handleAction = (action) => {
  console.log('点击了操作按钮:', action.label)
}
</script>
```

## 组件开发规范

### 1. Props 设计规范

- 使用 TypeScript 接口定义 Props
- 为可选 Props 提供合理的默认值
- 使用 `withDefaults` 定义默认值

```typescript
interface NotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'update'
  message?: string
  title?: string
  duration?: number
}

const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info',
  message: '',
  title: '',
  duration: 3000,
})
```

### 2. 事件设计规范

- 使用 `defineEmits` 定义事件
- 事件名使用 kebab-case
- 提供明确的事件参数类型

```typescript
const emit = defineEmits<{
  dismiss: []
  action: [action: NotificationAction]
}>()
```

### 3. 样式设计规范

- 使用 scoped 样式
- 遵循 BEM 命名规范
- 使用 CSS 变量定义可定制样式

## 相关文档

- [项目文件结构](./file-structure.md) - 项目文件结构说明
- [工具函数和类](./utils.md) - 工具函数详细说明
- [功能开关组件指南](../development/component-guide.md) - 功能开关组件开发指南
- [通知系统指南](../development/notification-system.md) - 通知系统使用说明

---

_文档版本：2.0.0_
_最后更新：2026-05-28_
_更新内容：反映功能模块化重构后的组件结构_
