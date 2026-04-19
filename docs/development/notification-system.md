# 通知系统使用指南

## 概述

项目引入了统一的通知系统，用于显示各种状态提示，包括：

- 功能开关状态切换提示
- 版本更新提示
- 网盘名单更新提示
- 操作成功/失败反馈
- 警告和信息提示

## 核心组件

### 1. Notification 组件

基础通知组件，支持多种通知类型和配置。

```vue
<template>
  <Notification
    type="success"
    message="操作成功完成"
    title="成功"
    duration="3000"
    dismissible="true"
    position="top-right"
    :actions="actions"
    @dismiss="handleDismiss"
    @action="handleAction" />
</template>

<script setup lang="ts">
import Notification from '@com/Notification.vue'

const actions = [
  {
    label: '确定',
    type: 'primary',
    handler: () => console.log('确定点击'),
  },
  {
    label: '取消',
    handler: () => console.log('取消点击'),
  },
]
</script>
```

### 2. NotificationContainer 组件

全局通知容器，自动显示所有通知。

```vue
<template>
  <div>
    <!-- 应用内容 -->
    <NotificationContainer />
  </div>
</template>
```

## 使用方式

### 方式一：使用 useNotification 可组合函数（推荐）

```typescript
import { useNotification } from '@composables/useNotification'

const { success, error, warning, info, update } = useNotification()

// 显示成功通知
success('操作成功完成', { title: '成功' })

// 显示错误通知
error('操作失败，请重试', { title: '错误' })

// 显示警告通知
warning('磁盘空间不足', { title: '警告' })

// 显示信息通知
info('新消息已到达', { title: '信息' })

// 显示更新通知
update('发现新版本 v2.0.0', { title: '版本更新' })

// 自定义通知
show('自定义消息', {
  type: 'info',
  title: '自定义标题',
  duration: 5000,
  position: 'bottom-right',
  actions: [
    {
      label: '确定',
      type: 'primary',
      handler: () => console.log('确定'),
    },
  ],
})
```

### 方式二：使用快捷函数

```typescript
import { notification } from '@composables/useNotification'

// 在任何地方使用
notification.success('操作成功')
notification.error('操作失败')
notification.update('发现新版本')
```

## 与功能开关集成

### 使用 useFeatureToggleWithNotification

新的可组合函数自动集成通知系统：

```vue
<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="config.description">
      <span>{{ config.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" @click.stop :aria-label="config.name" :disabled="isToggling" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import userCloudDiskListConfig from '@/configs/userCloudDiskList.json'
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'

const config = {
  name: userCloudDiskListConfig.name,
  description: userCloudDiskListConfig.description,
  storageKey: userCloudDiskListConfig.storageKey,
  defaultEnabled: userCloudDiskListConfig.defaultEnabled,
  messageType: 'TOGGLE_USER_CloudDiskList',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
</script>
```

## 配置选项

### NotificationOptions 接口

```typescript
interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info' | 'update'
  title?: string
  duration?: number // 自动消失时间（毫秒），0 表示不自动消失
  dismissible?: boolean // 是否可手动关闭
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  actions?: NotificationAction[]
}

interface NotificationAction {
  label: string
  type?: 'primary' | 'secondary' | 'danger'
  handler: () => void
}
```

## 通知类型说明

| 类型    | 颜色 | 图标 | 使用场景                     |
| ------- | ---- | ---- | ---------------------------- |
| success | 绿色 | ✓    | 操作成功、保存成功、启用成功 |
| error   | 红色 | ⚠    | 操作失败、网络错误、验证失败 |
| warning | 橙色 | ⚠    | 警告提示、风险提示、确认提示 |
| info    | 蓝色 | ℹ    | 信息提示、状态更新、普通消息 |
| update  | 紫色 | 🔄   | 版本更新、数据更新、系统更新 |

## 位置说明

| 位置         | 描述   | 适用场景               |
| ------------ | ------ | ---------------------- |
| top-right    | 右上角 | 默认位置，操作反馈     |
| top-left     | 左上角 | 重要通知，需要立即关注 |
| bottom-right | 右下角 | 次要通知，不打扰用户   |
| bottom-left  | 左下角 | 状态更新，持续显示     |
| center       | 居中   | 重要确认、需要用户操作 |

## 最佳实践

### 1. 通知内容

- **简洁明了**：通知内容不超过 2 行
- **包含动作**：告诉用户发生了什么和下一步该做什么
- **使用标题**：重要通知添加标题

### 2. 持续时间

- **成功通知**：3000ms（3秒）
- **错误通知**：5000ms（5秒）
- **警告通知**：4000ms（4秒）
- **信息通知**：3000ms（3秒）
- **更新通知**：0ms（手动关闭）

### 3. 使用场景

```typescript
// 功能开关切换
success(enabled ? '功能已启用' : '功能已禁用', { title: '功能切换' })

// 版本更新
update(`发现新版本 ${latestVersion}，当前版本 ${currentVersion}`, {
  title: '版本更新',
  actions: [
    {
      label: '立即更新',
      type: 'primary',
      handler: openUpdatePage,
    },
    {
      label: '忽略',
      handler: dismissUpdate,
    },
  ],
})

// 数据更新
info('黑名单数据已更新', { title: '数据同步' })

// 操作确认
warning('确定要删除这个项目吗？此操作不可撤销。', {
  title: '确认删除',
  actions: [
    {
      label: '删除',
      type: 'danger',
      handler: deleteItem,
    },
    {
      label: '取消',
      handler: cancelDelete,
    },
  ],
})
```

## 向后兼容

通知系统完全向后兼容现有的 `show-message` 事件机制。现有的组件无需修改即可继续使用。

## 示例

查看 `NotificationDemo.vue` 组件了解完整的使用示例。

## 注意事项

1. **避免通知轰炸**：同一时间不要显示太多通知
2. **重要通知优先**：使用不同的位置和持续时间区分重要性
3. **用户可操作**：重要的确认操作应该提供按钮
4. **可访问性**：通知支持屏幕阅读器，使用正确的 ARIA 属性
