---
name: new-feature-checklist
description: 创建新功能时的完整检查清单，确保符合项目架构规范、UI 适配、公共组件复用等要求
---

# 新功能开发检查清单

在为 52pjhelper 项目创建新功能时，除了满足业务需求外，必须确保以下流程和规范都得到满足。

## 快速开始

创建新功能时，按照以下检查清单逐步验证：

## 一、目录结构规范

### 1.1 功能目录位置

- [ ] 在 `src/features/<featureName>/` 下创建功能目录（使用 camelCase 命名）
- [ ] 目录名称清晰描述功能用途

### 1.2 必需文件

- [ ] `config.json` - 功能配置文件（必需）
- [ ] `utils.ts` 或 `index.ts` - 功能核心逻辑（必需）
- [ ] `<FeatureName>Toggle.vue` - 功能开关组件（如有开关需求）

### 1.3 可选文件

- [ ] `types.ts` - 类型定义（复杂功能）
- [ ] 其他按职责拆分的模块文件

## 二、配置文件规范

### 2.1 config.json 必需字段

```json
{
  "name": "功能中文名称",
  "description": "功能详细描述",
  "defaultEnabled": true,
  "storageKey": "featureNameEnabled"
}
```

### 2.2 存储键命名规范

- [ ] 使用驼峰命名法
- [ ] 前缀为功能英文名称
- [ ] 以 `Enabled` 结尾（开关状态）
- [ ] 示例：`avatarQueryEnabled`、`quickReplyEnabled`

### 2.3 可选字段

- [ ] `targetPages` - 目标页面 URL 模式数组（如需要页面匹配）
- [ ] 其他功能特定配置

## 三、功能逻辑实现

### 3.1 使用公共工具

**必须使用**以下公共工具，禁止重复造轮子：

| 工具 | 用途 | 导入方式 |
|------|------|----------|
| `storageHelper` | 存储操作 | `import { storageHelper } from '@utils/storageHelper'` |
| `urlMatcher` | URL 匹配 | `import { urlMatcher } from '@utils/urlMatcher'` |
| `messageHelper` | 消息通信 | `import { messageHelper } from '@utils/messageHelper'` |
| `featureManager` | 功能管理 | `import { createFeatureManager } from '@utils/featureManager'` |

### 3.2 使用可组合函数

**推荐使用** `useFeatureToggleWithNotification`（新功能）：

```typescript
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'
import config from '@features/featureName/config.json'

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification({
  ...config,
  messageType: 'TOGGLE_FEATURE_NAME',
})
```

### 3.3 导出规范

- [ ] 导出工厂函数 `create<FeatureName>()`
- [ ] 导出必要的公共 API
- [ ] 功能内部使用相对路径导入

## 四、UI 组件规范

### 4.1 功能开关组件模板

```vue
<template>
  <div class="toggle-container">
    <label class="toggle-label" @click.stop="toggleFeature" :title="config.description">
      <span>{{ config.name }}</span>
      <div class="toggle-switch">
        <input type="checkbox" :checked="enabled" disabled :aria-label="config.name" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useFeatureToggleWithNotification } from '@/composables/useFeatureToggleWithNotification'
import config from '@features/featureName/config.json'

const { enabled, toggleFeature, isToggling } = useFeatureToggleWithNotification({
  ...config,
  messageType: 'TOGGLE_FEATURE_NAME',
})
</script>
```

### 4.2 样式规范

- [ ] 使用共享样式类名：`.toggle-container`、`.toggle-label`、`.toggle-switch`、`.slider`
- [ ] 样式定义在 `src/styles/toggle.css` 中
- [ ] 禁止在组件中定义重复样式

## 五、深浅色主题适配

### 5.1 主题适配要求

**如果功能包含 UI 样式，必须同时适配深色和浅色主题。**

### 5.2 实现方式

使用 CSS 变量或类选择器适配主题：

```css
/* 浅色主题（默认） */
.feature-element {
  background-color: #ffffff;
  color: #333333;
}

/* 深色主题 */
.dark .feature-element {
  background-color: #1a1a1a;
  color: #e0e0e0;
}
```

### 5.3 主题检测

使用 `themeManager` 工具：

```typescript
import { getCurrentTheme, watchThemeChange } from '@/utils/themeManager'

const theme = getCurrentTheme() // 'light' | 'dark'
const unwatch = watchThemeChange((newTheme) => {
  // 响应主题变化
})
```

### 5.4 验证清单

- [ ] 浅色主题下样式正常显示
- [ ] 深色主题下样式正常显示
- [ ] 主题切换时 UI 正确响应
- [ ] 不使用硬编码颜色值（使用 CSS 变量）

## 六、通知系统集成

### 6.1 使用统一通知系统

**禁止**使用 `alert()`、`console.log()` 或自定义提示框。

**必须使用** `useNotification` 可组合函数：

```typescript
import { useNotification } from '@/composables/useNotification'

const { success, error, warning, info } = useNotification()

// 成功通知
success('操作成功完成', { title: '成功' })

// 错误通知
error('操作失败，请重试', { title: '错误' })
```

### 6.2 通知持续时间

| 类型 | 持续时间 | 说明 |
|------|----------|------|
| success | 3000ms | 操作成功 |
| error | 5000ms | 操作失败 |
| warning | 4000ms | 警告信息 |
| info | 3000ms | 普通信息 |

## 七、注册与集成

### 7.1 Content Script 注册

在 `src/entries/contents/initialization.ts` 中注册功能：

```typescript
import { createFeatureName } from '@features/featureName'

// 初始化功能
managers.featureName = createFeatureName()
```

### 7.2 设置面板集成

在 `src/pages/SettingsPanel.vue` 或对应的 `*FeaturesToggle.vue` 中引入开关组件：

```vue
<script setup>
import FeatureNameToggle from '@features/featureName/FeatureNameToggle.vue'
</script>

<template>
  <FeatureNameToggle />
</template>
```

## 八、错误处理

### 8.1 通信容错

与 content script 通信时，必须添加 try-catch：

```typescript
try {
  const response = await browser.runtime.sendMessage({
    type: 'TOGGLE_FEATURE',
    feature: 'featureName',
  })
  if (response?.success) {
    return response.data
  }
} catch (error) {
  console.warn('与 content script 通信失败:', error)
  return getDefaultState()
}
```

### 8.2 页面检查

在发送消息前，检查当前页面：

```typescript
if (!window.location.hostname.includes('52pojie.cn')) {
  console.warn('非目标页面，跳过消息发送')
  return null
}
```

## 九、代码规范

### 9.1 TypeScript 规范

- [ ] 使用严格 TypeScript 配置
- [ ] 禁止使用 `any` 类型（用 `unknown` 替代）
- [ ] 使用 `interface` 描述对象结构
- [ ] 使用 `type` 用于联合/交叉类型

### 9.2 命名规范

| 场景 | 风格 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `fetchUserData` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 组件文件 | PascalCase | `UserCard.vue` |
| 类型/接口 | PascalCase | `UserProfile` |

### 9.3 代码质量

- [ ] 文件不超过 300 行
- [ ] 函数单一职责
- [ ] 使用 ES6+ 语法
- [ ] 禁止使用 `var`
- [ ] 注释使用简体中文

## 十、验证与测试

### 10.1 类型检查

```bash
npx tsc --noEmit
npx vue-tsc --noEmit
```

### 10.2 功能验证

- [ ] 功能开关正常工作
- [ ] 配置正确保存和读取
- [ ] 目标页面匹配正确
- [ ] 通知系统正常工作

### 10.3 主题验证

- [ ] 浅色主题显示正常
- [ ] 深色主题显示正常
- [ ] 主题切换无闪烁

## 附录：新功能目录结构示例

```
src/features/newFeature/
├── config.json              # 功能配置
├── types.ts                 # 类型定义（可选）
├── utils.ts                 # 核心逻辑
├── NewFeatureToggle.vue     # 开关组件（可选）
└── index.ts                 # 统一导出（可选）
```

## 相关文档

- [模块结构](../../docs/architecture/module-structure.md)
- [组件开发指南](../../docs/development/component-guide.md)
- [可组合函数式架构](../../docs/development/composable-architecture.md)
- [功能配置文件](../../docs/config/feature-configs.md)
- [存储键命名规范](../../docs/config/storage-keys.md)
- [最佳实践](../../docs/development/best-practices.md)
