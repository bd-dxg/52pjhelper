# Vue 组件参考

本文档列出了项目中所有的 Vue 组件，包括组件说明、Props、Events 和使用示例。

## 组件目录结构

```
src/components/
├── common/              # 通用基础组件
├── features/           # 功能相关组件
├── layout/             # 布局组件
└── pages/              # 页面专用组件
```

## 通用基础组件

### Button - 按钮组件

**文件位置**: `src/components/common/Button.vue`

**说明**: 通用的按钮组件，支持多种变体和状态。

**Props**:

| 名称        | 类型                                                           | 默认值      | 说明         |
| ----------- | -------------------------------------------------------------- | ----------- | ------------ |
| `variant`   | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | 按钮变体     |
| `size`      | `'sm' \| 'md' \| 'lg'`                                         | `'md'`      | 按钮尺寸     |
| `disabled`  | `boolean`                                                      | `false`     | 是否禁用     |
| `loading`   | `boolean`                                                      | `false`     | 加载状态     |
| `type`      | `'button' \| 'submit' \| 'reset'`                              | `'button'`  | 按钮类型     |
| `fullWidth` | `boolean`                                                      | `false`     | 是否宽度100% |

**Events**:

| 名称    | 参数         | 说明     |
| ------- | ------------ | -------- |
| `click` | `MouseEvent` | 点击事件 |

**使用示例**:

```vue
<template>
  <Button variant="primary" size="md" :loading="isLoading" @click="handleClick">点击我</Button>
</template>
```

### Checkbox - 复选框组件

**文件位置**: `src/components/common/Checkbox.vue`

**说明**: 复选框组件，支持标签和中间状态。

**Props**:

| 名称            | 类型      | 默认值  | 说明     |
| --------------- | --------- | ------- | -------- |
| `modelValue`    | `boolean` | `false` | 绑定值   |
| `label`         | `string`  | `''`    | 标签文本 |
| `disabled`      | `boolean` | `false` | 是否禁用 |
| `indeterminate` | `boolean` | `false` | 中间状态 |

**Events**:

| 名称                | 参数      | 说明       |
| ------------------- | --------- | ---------- |
| `update:modelValue` | `boolean` | 值更新事件 |

**使用示例**:

```vue
<template>
  <Checkbox v-model="checked" label="同意条款" :disabled="isDisabled" />
</template>
```

### Switch - 开关组件

**文件位置**: `src/components/common/Switch.vue`

**说明**: 开关切换组件，用于功能启用/禁用。

**Props**:

| 名称          | 类型      | 默认值  | 说明     |
| ------------- | --------- | ------- | -------- |
| `modelValue`  | `boolean` | `false` | 绑定值   |
| `label`       | `string`  | `''`    | 标签文本 |
| `description` | `string`  | `''`    | 描述文本 |
| `disabled`    | `boolean` | `false` | 是否禁用 |
| `loading`     | `boolean` | `false` | 加载状态 |

**Events**:

| 名称                | 参数      | 说明         |
| ------------------- | --------- | ------------ |
| `update:modelValue` | `boolean` | 值更新事件   |
| `change`            | `boolean` | 状态改变事件 |

**使用示例**:

```vue
<template>
  <Switch
    v-model="enabled"
    label="深色主题"
    description="启用深色模式"
    :loading="isSaving"
    @change="handleThemeChange" />
</template>
```

### Input - 输入框组件

**文件位置**: `src/components/common/Input.vue`

**说明**: 文本输入框组件，支持多种类型和验证。

**Props**:

| 名称          | 类型                                                   | 默认值      | 说明     |
| ------------- | ------------------------------------------------------ | ----------- | -------- |
| `modelValue`  | `string`                                               | `''`        | 绑定值   |
| `type`        | `'text' \| 'password' \| 'email' \| 'number' \| 'url'` | `'text'`    | 输入类型 |
| `placeholder` | `string`                                               | `''`        | 占位文本 |
| `disabled`    | `boolean`                                              | `false`     | 是否禁用 |
| `readonly`    | `boolean`                                              | `false`     | 是否只读 |
| `error`       | `string`                                               | `''`        | 错误信息 |
| `maxlength`   | `number`                                               | `undefined` | 最大长度 |

**Events**:

| 名称                | 参数         | 说明         |
| ------------------- | ------------ | ------------ |
| `update:modelValue` | `string`     | 值更新事件   |
| `input`             | `string`     | 输入事件     |
| `blur`              | `FocusEvent` | 失去焦点事件 |
| `focus`             | `FocusEvent` | 获得焦点事件 |

**使用示例**:

```vue
<template>
  <Input v-model="username" type="text" placeholder="请输入用户名" :error="usernameError" @blur="validateUsername" />
</template>
```

### Card - 卡片组件

**文件位置**: `src/components/common/Card.vue`

**说明**: 卡片容器组件，用于内容分组。

**Props**:

| 名称       | 类型                             | 默认值 | 说明         |
| ---------- | -------------------------------- | ------ | ------------ |
| `title`    | `string`                         | `''`   | 卡片标题     |
| `subtitle` | `string`                         | `''`   | 卡片副标题   |
| `padding`  | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距大小   |
| `shadow`   | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | 阴影大小     |
| `border`   | `boolean`                        | `true` | 是否显示边框 |

**Slots**:

| 名称      | 说明         |
| --------- | ------------ |
| `default` | 卡片内容     |
| `header`  | 卡片头部     |
| `footer`  | 卡片底部     |
| `actions` | 卡片操作区域 |

**使用示例**:

```vue
<template>
  <Card title="功能设置" subtitle="管理扩展功能" padding="md">
    <template #header>
      <div class="card-header-actions">
        <Button size="sm">重置</Button>
      </div>
    </template>

    <div class="card-content">
      <!-- 卡片内容 -->
    </div>

    <template #footer>
      <div class="card-footer">
        <Button variant="primary">保存</Button>
      </div>
    </template>
  </Card>
</template>
```

## 功能相关组件

### FeatureToggle - 功能开关组件

**文件位置**: `src/components/features/FeatureToggle.vue`

**说明**: 功能开关组件，集成 `useFeatureToggle` 可组合函数。

**Props**:

| 名称          | 类型      | 默认值  | 说明             |
| ------------- | --------- | ------- | ---------------- |
| `feature`     | `string`  | `''`    | 功能标识符       |
| `label`       | `string`  | `''`    | 功能名称         |
| `description` | `string`  | `''`    | 功能描述         |
| `disabled`    | `boolean` | `false` | 是否禁用         |
| `showStatus`  | `boolean` | `true`  | 是否显示状态文本 |

**Events**:

| 名称     | 参数      | 说明             |
| -------- | --------- | ---------------- |
| `change` | `boolean` | 功能状态改变事件 |

**使用示例**:

```vue
<template>
  <FeatureToggle feature="dark-theme" label="深色主题" description="启用深色模式界面" @change="handleThemeToggle" />
</template>

<script setup>
const handleThemeToggle = enabled => {
  console.log(`深色主题 ${enabled ? '启用' : '禁用'}`)
}
</script>
```

### DarkThemeToggle - 深色主题开关

**文件位置**: `src/components/features/DarkThemeToggle.vue`

**说明**: 深色主题专用开关组件。

**Props**:

| 名称           | 类型      | 默认值  | 说明                 |
| -------------- | --------- | ------- | -------------------- |
| `autoDetect`   | `boolean` | `true`  | 是否自动检测系统主题 |
| `showSchedule` | `boolean` | `false` | 是否显示定时切换选项 |

**Events**:

| 名称           | 参数                          | 说明         |
| -------------- | ----------------------------- | ------------ |
| `theme-change` | `'light' \| 'dark' \| 'auto'` | 主题改变事件 |

**使用示例**:

```vue
<template>
  <DarkThemeToggle :auto-detect="true" @theme-change="handleThemeChange" />
</template>
```

### CompactLayoutToggle - 紧凑布局开关

**文件位置**: `src/components/features/CompactLayoutToggle.vue`

**说明**: 紧凑布局专用开关组件。

**Props**:

| 名称           | 类型                             | 默认值     | 说明     |
| -------------- | -------------------------------- | ---------- | -------- |
| `spacingLevel` | `'tight' \| 'normal' \| 'loose'` | `'normal'` | 间距级别 |
| `fontSize`     | `'small' \| 'medium' \| 'large'` | `'medium'` | 字体大小 |

**Events**:

| 名称            | 参数                                    | 说明             |
| --------------- | --------------------------------------- | ---------------- |
| `layout-change` | `{ spacing: string, fontSize: string }` | 布局设置改变事件 |

**使用示例**:

```vue
<template>
  <CompactLayoutToggle :spacing-level="spacing" :font-size="fontSize" @layout-change="updateLayout" />
</template>
```

### NavigationSettings - 导航设置组件

**文件位置**: `src/components/features/NavigationSettings.vue`

**说明**: 导航菜单管理组件。

**Props**:

| 名称            | 类型         | 默认值 | 说明             |
| --------------- | ------------ | ------ | ---------------- |
| `menuItems`     | `MenuItem[]` | `[]`   | 菜单项列表       |
| `collapsible`   | `boolean`    | `true` | 是否可折叠       |
| `rememberState` | `boolean`    | `true` | 是否记住展开状态 |

**Events**:

| 名称          | 参数                                 | 说明           |
| ------------- | ------------------------------------ | -------------- |
| `item-toggle` | `{ id: string, enabled: boolean }`   | 菜单项开关事件 |
| `menu-toggle` | `{ id: string, collapsed: boolean }` | 菜单组折叠事件 |

**使用示例**:

```vue
<template>
  <NavigationSettings :menu-items="navigationItems" @item-toggle="handleItemToggle" />
</template>
```

## 布局组件

### Header - 页头组件

**文件位置**: `src/components/layout/Header.vue`

**说明**: 页面头部组件，包含 logo 和导航。

**Props**:

| 名称       | 类型      | 默认值          | 说明          |
| ---------- | --------- | --------------- | ------------- |
| `title`    | `string`  | `'52pj Helper'` | 页面标题      |
| `showLogo` | `boolean` | `true`          | 是否显示 logo |
| `showNav`  | `boolean` | `true`          | 是否显示导航  |

**Slots**:

| 名称     | 说明     |
| -------- | -------- |
| `left`   | 左侧内容 |
| `center` | 中间内容 |
| `right`  | 右侧内容 |

**使用示例**:

```vue
<template>
  <Header title="功能设置">
    <template #left>
      <Button variant="ghost" @click="goBack">
        <ArrowLeftIcon />
      </Button>
    </template>

    <template #right>
      <Button variant="ghost">
        <SettingsIcon />
      </Button>
    </template>
  </Header>
</template>
```

### Sidebar - 侧边栏组件

**文件位置**: `src/components/layout/Sidebar.vue`

**说明**: 侧边栏导航组件。

**Props**:

| 名称             | 类型            | 默认值    | 说明       |
| ---------------- | --------------- | --------- | ---------- |
| `items`          | `SidebarItem[]` | `[]`      | 侧边栏项目 |
| `collapsed`      | `boolean`       | `false`   | 是否折叠   |
| `width`          | `string`        | `'250px'` | 宽度       |
| `collapsedWidth` | `string`        | `'60px'`  | 折叠时宽度 |

**Events**:

| 名称              | 参数      | 说明             |
| ----------------- | --------- | ---------------- |
| `item-click`      | `string`  | 项目点击事件     |
| `collapse-change` | `boolean` | 折叠状态改变事件 |

**使用示例**:

```vue
<template>
  <Sidebar :items="sidebarItems" :collapsed="isCollapsed" @item-click="handleSidebarClick" />
</template>
```

### Footer - 页脚组件

**文件位置**: `src/components/layout/Footer.vue`

**说明**: 页面底部组件。

**Props**:

| 名称          | 类型      | 默认值 | 说明           |
| ------------- | --------- | ------ | -------------- |
| `showVersion` | `boolean` | `true` | 是否显示版本号 |
| `showLinks`   | `boolean` | `true` | 是否显示链接   |
| `copyright`   | `string`  | `''`   | 版权信息       |

**Slots**:

| 名称     | 说明     |
| -------- | -------- |
| `left`   | 左侧内容 |
| `center` | 中间内容 |
| `right`  | 右侧内容 |

**使用示例**:

```vue
<template>
  <Footer :show-version="true" copyright="© 2026 52pj Helper">
    <template #left>
      <a href="#" class="footer-link">帮助</a>
      <a href="#" class="footer-link">反馈</a>
    </template>

    <template #right>
      <span class="version">v1.0.0</span>
    </template>
  </Footer>
</template>
```

## 页面专用组件

### PopupPage - Popup 主页面

**文件位置**: `src/pages/PopupPage.vue`

**说明**: Popup 窗口的主页面组件。

**Props**: 无

**Slots**: 无

**功能**:

- 显示功能开关列表
- 提供快速设置入口
- 显示扩展状态信息

**使用示例**:

```vue
<template>
  <PopupPage />
</template>

<script setup>
// 直接使用，无需额外配置
</script>
```

### OptionsPage - 选项设置页面

**文件位置**: `src/pages/OptionsPage.vue`

**说明**: 扩展选项设置页面组件。

**Props**: 无

**Slots**: 无

**功能**:

- 完整的功能设置
- 高级配置选项
- 数据导入导出
- 重置和恢复功能

**使用示例**:

```vue
<template>
  <OptionsPage />
</template>

<script setup>
// 直接使用，无需额外配置
</script>
```

## 组件使用指南

### 1. 组件导入

```vue
<template>
  <!-- 使用自动导入，无需显式导入 -->
  <Button>点击我</Button>
  <Switch v-model="enabled" />
</template>

<script setup>
// 组件已通过 auto-import 自动导入
</script>
```

### 2. 组件 Props 传递

```vue
<template>
  <!-- 使用 v-bind 传递多个 props -->
  <Button v-bind="buttonProps" />

  <!-- 动态绑定 props -->
  <Input :type="inputType" :placeholder="placeholderText" />
</template>

<script setup>
const buttonProps = {
  variant: 'primary',
  size: 'lg',
  disabled: false,
}

const inputType = ref('text')
const placeholderText = ref('请输入内容')
</script>
```

### 3. 事件处理

```vue
<template>
  <!-- 使用 @ 语法监听事件 -->
  <Switch @change="handleSwitchChange" />

  <!-- 使用内联处理 -->
  <Button @click="count++">增加 {{ count }}</Button>
</template>

<script setup>
const handleSwitchChange = enabled => {
  console.log('开关状态:', enabled)
}

const count = ref(0)
</script>
```

### 4. Slot 使用

```vue
<template>
  <Card title="用户信息">
    <!-- 默认 slot -->
    <div class="user-info">
      <p>用户名: {{ user.name }}</p>
      <p>邮箱: {{ user.email }}</p>
    </div>

    <!-- 具名 slot -->
    <template #footer>
      <Button @click="editUser">编辑</Button>
    </template>
  </Card>
</template>
```

### 5. 组件样式定制

```vue
<template>
  <!-- 使用 class 定制样式 -->
  <Button class="custom-button">自定义按钮</Button>

  <!-- 使用 style 绑定 -->
  <Card :style="{ backgroundColor: cardColor }">内容</Card>
</template>

<style scoped>
.custom-button {
  border-radius: 20px;
  font-weight: bold;
}
</style>
```

## 组件开发规范

### 1. Props 设计规范

- 使用 TypeScript 接口定义 Props
- 为可选 Props 提供合理的默认值
- 使用 `withDefaults` 定义默认值

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})
```

### 2. 事件设计规范

- 使用 `defineEmits` 定义事件
- 事件名使用 kebab-case
- 提供明确的事件参数类型

```typescript
const emit = defineEmits<{
  click: [event: MouseEvent]
  'update:model-value': [value: string]
  'custom-event': [data: CustomData]
}>()
```

### 3. Slot 设计规范

- 为复杂组件提供具名 slot
- 在组件文档中说明 slot 用途
- 为 slot 提供合理的默认内容

```vue
<template>
  <div class="card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <div class="card-body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### 4. 样式设计规范

- 使用 CSS 变量定义可定制样式
- 遵循 BEM 命名规范
- 提供主题支持

```vue
<template>
  <button :class="['button', `button--${variant}`, `button--${size}`]">
    <slot />
  </button>
</template>

<style scoped>
.button {
  --button-bg: var(--color-primary);
  --button-color: var(--color-white);

  background-color: var(--button-bg);
  color: var(--button-color);
}

.button--secondary {
  --button-bg: var(--color-secondary);
}

.button--outline {
  background-color: transparent;
  border: 2px solid var(--button-bg);
  color: var(--button-bg);
}
</style>
```

## 组件测试

### 1. 单元测试示例

```typescript
// Button.spec.ts
import { mount } from '@vue/test-utils'
import Button from '@/components/common/Button.vue'

describe('Button', () => {
  it('渲染正确的变体', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary' },
    })

    expect(wrapper.classes()).toContain('button--primary')
  })

  it('触发点击事件', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
```

### 2. 快照测试

```typescript
describe('Button 快照', () => {
  it('匹配快照', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary', size: 'md' },
      slots: { default: '点击我' },
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
```

## 相关文档

- [项目文件结构](./file-structure.md) - 项目文件结构说明
- [工具函数和类](./utils.md) - 工具函数详细说明
- [功能开关组件指南](../development/component-guide.md) - 功能开关组件开发指南

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
