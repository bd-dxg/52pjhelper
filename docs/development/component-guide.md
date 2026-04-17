# 功能开关组件开发指南

## 概述

功能开关组件是项目的核心 UI 组件，用于控制各个功能的启用/禁用状态。本指南介绍如何使用 `useFeatureToggle` 可组合函数简化功能开关组件的开发。

## 组件结构

### 完整的功能开关组件模板

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
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import featureConfig from '@/configs/feature.json'

const emit = defineEmits(['show-message'])

const { enabled, toggleFeature, isToggling } = useFeatureToggle(
  {
    ...featureConfig,
    messageType: 'TOGGLE_FEATURE',
  },
  (text, type) => {
    emit('show-message', text, type)
  },
)
</script>
```

## 使用 useFeatureToggle 可组合函数

### 优势

- **代码简洁**：大幅减少重复代码
- **统一逻辑**：所有功能开关使用相同的逻辑
- **错误处理**：内置错误处理和用户反馈
- **易于维护**：修改一处即可影响所有组件

### API 参考

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `enabled` | `Ref<boolean>` | 功能是否启用 |
| `isToggling` | `Ref<boolean>` | 是否正在切换状态 |
| `toggleFeature()` | `() => Promise<void>` | 切换功能状态 |
| `initialize()` | `() => Promise<void>` | 初始化功能状态 |

### 使用示例

```typescript
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import config from '@/configs/avatarQuery.json'

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

## 功能配置文件规范

### 配置文件结构

```json
{
  "name": "功能名称",
  "description": "功能描述",
  "defaultEnabled": true,
  "storageKey": "featureKey",
  "targetPages": ["https://www.52pojie.cn/forum-*.html"]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 功能显示名称 |
| `description` | `string` | 是 | 功能详细描述 |
| `defaultEnabled` | `boolean` | 是 | 默认启用状态 |
| `storageKey` | `string` | 是 | 存储键名 |
| `targetPages` | `string[]` | 是 | 目标页面URL模式 |

### 存储键命名规范

- 使用驼峰命名法
- 前缀统一使用功能英文名称
- 以 `Enabled` 结尾
- 示例：`avatarQueryEnabled`、`quickReplyEnabled`

## 组件初始化规范

### 正确的初始化方式

```typescript
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import featureConfig from '@/configs/feature.json'

const { enabled, toggleFeature, isToggling } = useFeatureToggle(
  {
    ...featureConfig,
    messageType: 'TOGGLE_FEATURE',
  },
  (text, type) => {
    // 处理用户反馈
  },
)
```

### 避免的错误做法

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

## 父子组件通信

### 事件通信（子组件→父组件）

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

### 属性传递（父组件→子组件）

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
  enabled: false,
})

// 使用属性
console.log(props.config)
console.log(props.enabled)
```

## 消息提示机制

### 统一处理原则

- 所有提示信息应由父组件 `SettingsPanel.vue` 统一处理
- 子组件只负责发送事件，不处理具体的提示逻辑
- 这样可以保持代码一致性，避免重复实现

### 实现示例（子组件中）

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

## 样式规范

### CSS 类名规范

| 类名 | 用途 |
|------|------|
| `.toggle-container` | 组件容器 |
| `.toggle-label` | 标签元素 |
| `.toggle-switch` | 开关容器 |
| `.slider` | 开关滑块 |

### 共享样式

所有功能开关组件共享 `src/styles/toggle.css` 中的样式：

```css
/* 开关组件基础样式 */
.toggle-container {
  /* 基础样式 */
}

.toggle-label {
  /* 标签样式 */
}

.toggle-switch {
  /* 开关容器样式 */
}

.slider {
  /* 滑块样式 */
}
```

## 最佳实践

### 1. 配置存储优先
所有组件状态都应支持从 `browser.storage` 读取和保存。

### 2. 通信容错
与 content script 通信时，必须添加 try-catch 错误处理。

### 3. 页面判断
在发送消息前，必须检查当前页面是否是 52pojie.cn。

### 4. 用户体验
通信失败时，应提供适当的 fallback 方案，而不是报错。

### 5. 代码简洁
避免在初始化阶段进行不必要的通信，保持代码简洁和高效。

## 新建功能开发流程

### 步骤 1：创建配置文件
在 `src/configs/` 目录下创建 JSON 配置文件。

### 步骤 2：创建组件文件
在 `src/components/` 目录下创建 Vue 组件文件。

### 步骤 3：使用 useFeatureToggle
在组件中使用 `useFeatureToggle` 可组合函数。

### 步骤 4：注册组件
在 `src/entries/popup/main.ts` 中注册组件（如果需要）。

### 步骤 5：添加到设置页面
在 `src/pages/settings/SettingsPanel.vue` 中添加组件引用。

## 示例：创建头像查询功能开关

### 1. 创建配置文件
`src/configs/avatarQuery.json`:

```json
{
  "name": "头像查询",
  "description": "鼠标悬停显示用户违规记录",
  "defaultEnabled": true,
  "storageKey": "avatarQueryEnabled",
  "targetPages": [
    "https://www.52pojie.cn/forum-*.html",
    "https://www.52pojie.cn/thread-*.html"
  ]
}
```

### 2. 创建组件文件
`src/components/AvatarQueryToggle.vue`:

```vue
<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" title="鼠标悬停显示用户违规记录">
      <span>头像查询</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled aria-label="头像查询" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import config from '@/configs/avatarQuery.json'

const emit = defineEmits(['show-message'])

const { enabled, toggleFeature, isToggling } = useFeatureToggle(
  {
    ...config,
    messageType: 'TOGGLE_AVATAR_QUERY',
  },
  (text, type) => {
    emit('show-message', text, type)
  },
)
</script>
```

## 相关链接

- [可组合函数式架构](composable-architecture.md)
- [自动导入机制](auto-import.md)
- [Popup 与 Content Script 通信](communication.md)
- [存储键命名规范](../../config/storage-keys.md)
- [所有功能配置文件](../../config/feature-configs.md)