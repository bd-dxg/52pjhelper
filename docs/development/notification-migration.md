# 通知系统迁移指南

## 概述

项目引入了统一的通知系统，用于替代原有的 `show-message` 事件机制。本文档指导如何将现有组件迁移到新的通知系统。

## 迁移优势

### 原有方式的问题

- 每个组件都需要定义 `show-message` 事件
- 父组件需要手动处理消息显示
- 样式不统一，难以维护
- 不支持多种通知类型和位置

### 新系统的优势

- **统一管理**：全局通知管理器
- **多种类型**：支持 success、error、warning、info、update
- **灵活配置**：可配置位置、持续时间、操作按钮
- **向后兼容**：完全兼容现有代码
- **易于使用**：提供可组合函数和快捷函数

## 迁移步骤

### 步骤1：更新组件导入

#### 原有方式

```typescript
import { useFeatureToggle } from '@/composables/useFeatureToggle'
```

#### 新方式（推荐）

```typescript
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'
```

### 步骤2：移除事件定义

#### 原有方式

```typescript
const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()
```

#### 新方式

**无需定义事件**，通知系统自动处理。

### 步骤3：更新 useFeatureToggle 调用

#### 原有方式

```typescript
const { enabled, toggleFeature, isToggling } = useFeatureToggle(config, (text, type) => {
  emit('show-message', text, type)
})
```

#### 新方式

```typescript
const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification(config)
```

### 步骤4：移除父组件的事件处理

#### 原有方式

```vue
<template>
  <ChildComponent @show-message="handleShowMessage" />
</template>

<script setup>
const handleShowMessage = (text, type) => {
  // 处理消息显示
}
</script>
```

#### 新方式

**无需处理事件**，通知自动显示。

## 完整迁移示例

### 迁移前：UserCloudDiskListToggle.vue

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
import userCloudDiskListConfig from '@features/userCloudDiskList/config.json'
import { useFeatureToggle } from '@/composables/useFeatureToggle'

const emit = defineEmits<{
  (e: 'show-message', text: string, type: 'success' | 'error'): void
}>()

const config = {
  name: userCloudDiskListConfig.name,
  description: userCloudDiskListConfig.description,
  storageKey: userCloudDiskListConfig.storageKey,
  defaultEnabled: userCloudDiskListConfig.defaultEnabled,
  messageType: 'TOGGLE_USER_CloudDiskList',
}

const { enabled, toggleFeature, isToggling } = useFeatureToggle(config, (text, type) => {
  emit('show-message', text, type)
})
</script>
```

### 迁移后：UserCloudDiskListToggle.vue

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
import userCloudDiskListConfig from '@features/userCloudDiskList/config.json'
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

## 高级用法

### 自定义通知内容

如果需要自定义通知内容，可以直接使用 `useNotification`：

```typescript
import { useNotification } from '@/composables/useNotification'

const { success, error, update } = useNotification()

// 显示自定义通知
success('黑名单数据已更新', {
  title: '数据同步',
  duration: 5000,
  position: 'top-right',
})

// 显示带操作的通知
update('发现新版本 v2.0.0', {
  title: '版本更新',
  actions: [
    {
      label: '立即更新',
      type: 'primary',
      handler: () => {
        // 更新逻辑
      },
    },
    {
      label: '忽略',
      handler: () => {
        // 忽略逻辑
      },
    },
  ],
})
```

### 在非组件中使用

在任何 JavaScript/TypeScript 文件中使用：

```typescript
import { notification } from '@/composables/useNotification'

// 显示通知
notification.success('操作成功')
notification.error('操作失败')
notification.update('数据已更新')
```

## 向后兼容性

### 保持兼容

现有的 `show-message` 事件机制仍然有效。SettingsPanel 中的 `showMessage` 函数已经更新为同时使用新旧两种方式：

```typescript
// 显示消息（兼容旧接口）
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  const { success, error } = useNotification()

  if (type === 'success') {
    success(text, { title: '操作成功' })
  } else {
    error(text, { title: '操作失败' })
  }

  // 保持向后兼容
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
```

### 逐步迁移策略

1. **第一阶段**：保持现有代码不变，新组件使用新系统
2. **第二阶段**：逐步迁移现有组件到新系统
3. **第三阶段**：移除旧的 `show-message` 事件机制

## 常见问题

### Q1：迁移后通知不显示？

确保在根组件中添加了 `NotificationContainer`：

```vue
<template>
  <div>
    <!-- 应用内容 -->
    <NotificationContainer />
  </div>
</template>
```

### Q2：如何自定义通知样式？

修改 `Notification.vue` 组件中的样式，或通过 CSS 变量覆盖。

### Q3：如何限制通知数量？

通知管理器默认最多显示 5 个通知，可以在 `useNotification.ts` 中修改 `maxNotifications` 值。

### Q4：如何调试通知系统？

使用 `NotificationDemo.vue` 组件测试所有通知类型和配置。

## 下一步

1. 查看 [通知系统指南](notification-system.md) 了解完整功能
2. 使用 `NotificationDemo.vue` 进行测试
3. 逐步迁移现有组件
4. 根据需要自定义通知样式

## 支持

如有问题，请查看：

- [通知系统指南](notification-system.md)
- [组件开发指南](component-guide.md)
- [可组合函数式架构](composable-architecture.md)

---

_文档版本：1.1.0_  
_最后更新：2026-05-28_  
_更新内容：修正配置文件导入路径_
