# 开发最佳实践

本文档总结了项目开发中的最佳实践、经验和建议，帮助开发者编写高质量、可维护的代码。

## 核心原则

### 1. 配置存储优先

**原则**：所有组件状态都应支持从 `browser.storage` 读取和保存。

**实现示例**：

```typescript
// 使用 useFeatureToggle 管理功能状态
const { enabled, toggle } = useFeatureToggle('feature-name')

// 状态自动与浏览器存储同步
watch(enabled, (newValue) => {
  // 状态变化时自动保存到存储
  console.log(`功能状态已更新: ${newValue}`)
})
```

**好处**：
- 用户设置持久化
- 跨会话状态保持
- 支持用户自定义配置

### 2. 通信容错

**原则**：与 content script 通信时，必须添加 try-catch 错误处理。

**实现示例**：

```typescript
// 发送消息到 content script
const sendMessageToContentScript = async () => {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'GET_FEATURE_STATE',
      feature: 'feature-name'
    })
    
    if (response?.success) {
      return response.data
    }
  } catch (error) {
    console.warn('与 content script 通信失败:', error)
    // 提供 fallback 方案
    return getDefaultState()
  }
}
```

### 3. 页面判断

**原则**：在发送消息前，必须检查当前页面是否是 52pojie.cn。

**实现示例**：

```typescript
// 检查当前页面是否是目标网站
const isTargetPage = () => {
  return window.location.hostname.includes('52pojie.cn')
}

// 安全的消息发送
const safeSendMessage = async (message: any) => {
  if (!isTargetPage()) {
    console.warn('非目标页面，跳过消息发送')
    return null
  }
  
  try {
    return await browser.runtime.sendMessage(message)
  } catch (error) {
    console.warn('消息发送失败:', error)
    return null
  }
}
```

### 4. 用户体验优先

**原则**：通信失败时，应提供适当的 fallback 方案，而不是报错。

**实现示例**：

```typescript
// 优雅的错误处理
const loadUserSettings = async () => {
  try {
    const settings = await browser.storage.local.get('userSettings')
    return settings.userSettings || getDefaultSettings()
  } catch (error) {
    console.warn('加载用户设置失败，使用默认设置:', error)
    return getDefaultSettings()
  }
}
```

### 5. 代码简洁高效

**原则**：避免在初始化阶段进行不必要的通信，保持代码简洁和高效。

**实现示例**：

```typescript
// 延迟加载非关键数据
const { data, load } = useLazyData()

// 在需要时才加载
onMounted(() => {
  if (needsData.value) {
    load()
  }
})
```

## Vue 组件开发最佳实践

### 1. 组件设计原则

#### 单一职责原则
每个组件只负责一个特定的功能或 UI 部分。

```vue
<!-- Good: 专门的按钮组件 -->
<template>
  <button :class="classes" @click="$emit('click')">
    <slot />
  </button>
</template>

<!-- Bad: 包含过多逻辑的组件 -->
<template>
  <div>
    <button>按钮</button>
    <input v-model="search" />
    <ul>...</ul>
  </div>
</template>
```

#### 可组合性
组件应该易于组合和重用。

```vue
<!-- Good: 可组合的组件 -->
<template>
  <Card>
    <CardHeader>
      <CardTitle>标题</CardTitle>
    </CardHeader>
    <CardContent>
      <slot />
    </CardContent>
  </Card>
</template>
```

### 2. Props 设计

#### 明确的接口
使用 TypeScript 定义明确的 props 接口。

```typescript
interface ButtonProps {
  // 必填属性
  label: string
  
  // 可选属性
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = defineProps<ButtonProps>()
```

#### 合理的默认值
为可选属性提供合理的默认值。

```typescript
withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})
```

### 3. 事件通信

#### 明确的事件命名
使用 kebab-case 命名自定义事件。

```typescript
// 子组件定义事件
const emit = defineEmits<{
  'click': [event: MouseEvent]
  'update:model-value': [value: string]
  'custom-event': [data: CustomData]
}>()

// 触发事件
emit('click', event)
emit('update:model-value', newValue)
```

#### 父组件监听
在父组件中明确监听事件。

```vue
<template>
  <ChildComponent
    @click="handleClick"
    @update:model-value="handleUpdate"
    @custom-event="handleCustom"
  />
</template>
```

## 状态管理最佳实践

### 1. 使用可组合函数

#### 功能状态管理
使用 `useFeatureToggle` 管理功能开关状态。

```typescript
// 统一的功能状态管理
const { enabled, toggle, isLoading } = useFeatureToggle('dark-mode')

// 状态自动持久化
watch(enabled, (newValue) => {
  document.documentElement.classList.toggle('dark', newValue)
})
```

#### 本地状态管理
对于组件内部状态，使用 `ref` 和 `computed`。

```typescript
// 响应式状态
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}
```

### 2. 存储操作

#### 统一存储接口
使用 `storageHelper` 进行存储操作。

```typescript
// 存储用户设置
const saveUserSettings = async (settings: UserSettings) => {
  await storageHelper.set('userSettings', settings)
}

// 读取用户设置
const loadUserSettings = async (): Promise<UserSettings> => {
  return await storageHelper.get('userSettings') || defaultSettings
}
```

#### 存储键命名规范
遵循统一的存储键命名规范。

```typescript
// Good: 清晰的命名
const STORAGE_KEYS = {
  USER_SETTINGS: 'user_settings',
  FEATURE_TOGGLES: 'feature_toggles',
  RECENT_SEARCHES: 'recent_searches'
}

// 使用
await storageHelper.set(STORAGE_KEYS.USER_SETTINGS, settings)
```

## 性能优化最佳实践

### 1. 减少不必要的渲染

#### 使用 computed
对于派生数据，使用 `computed` 而不是在模板中计算。

```vue
<template>
  <!-- Good: 使用 computed -->
  <div>{{ formattedDate }}</div>
  
  <!-- Bad: 在模板中计算 -->
  <div>{{ new Date(date).toLocaleDateString() }}</div>
</template>

<script setup>
const formattedDate = computed(() => {
  return new Date(props.date).toLocaleDateString()
})
</script>
```

#### 使用 v-memo
对于复杂组件，使用 `v-memo` 避免不必要的重新渲染。

```vue
<template>
  <div v-memo="[user.id, user.name]">
    <!-- 只有 user.id 或 user.name 变化时才重新渲染 -->
    <UserProfile :user="user" />
  </div>
</template>
```

### 2. 懒加载

#### 组件懒加载
对于非关键组件，使用动态导入。

```vue
<script setup>
// 懒加载组件
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>

<template>
  <Suspense>
    <template #default>
      <HeavyComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

#### 数据懒加载
对于非关键数据，延迟加载。

```typescript
// 懒加载数据
const loadData = async () => {
  if (!dataLoaded.value) {
    isLoading.value = true
    try {
      data.value = await fetchData()
      dataLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }
}

// 在需要时加载
onMounted(() => {
  if (shouldLoadData.value) {
    loadData()
  }
})
```

## 错误处理最佳实践

### 1. 全局错误处理

#### Vue 错误处理
注册全局错误处理器。

```typescript
// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)
  
  // 发送错误报告
  reportError(err)
}
```

#### Promise 错误处理
处理未捕获的 Promise 错误。

```typescript
// 全局 Promise 错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason)
  event.preventDefault()
})
```

### 2. 组件级错误处理

#### 错误边界
使用错误边界组件捕获子组件错误。

```vue
<template>
  <ErrorBoundary>
    <UnstableComponent />
  </ErrorBoundary>
</template>

<script setup>
const ErrorBoundary = defineComponent({
  data() {
    return { hasError: false }
  },
  errorCaptured(err, instance, info) {
    this.hasError = true
    console.error('组件错误:', err)
    return false // 阻止错误继续向上传播
  },
  render() {
    return this.hasError 
      ? h('div', '组件加载失败') 
      : this.$slots.default?.()
  }
})
</script>
```

## 代码质量最佳实践

### 1. 类型安全

#### 严格的 TypeScript 配置
使用严格的 TypeScript 配置。

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

#### 避免 any 类型
使用 `unknown` 代替 `any`。

```typescript
// Good: 使用 unknown
const parseData = (data: unknown): ParsedData => {
  if (isValidData(data)) {
    return data as ParsedData
  }
  throw new Error('无效数据')
}

// Bad: 使用 any
const parseData = (data: any): ParsedData => {
  return data // 没有类型检查
}
```

### 2. 代码组织

#### 单一文件原则
每个文件只包含一个主要的导出。

```typescript
// Good: 单一导出
export const useFeatureToggle = (featureName: string) => {
  // 实现
}

// Bad: 多个不相关的导出
export const useFeatureToggle = () => { /* ... */ }
export const useUserData = () => { /* ... */ }
export const formatDate = () => { /* ... */ }
```

#### 合理的文件大小
保持文件大小在 300 行以内。

```bash
# 检查文件大小
find src -name "*.ts" -o -name "*.vue" | xargs wc -l | sort -n
```

## 测试最佳实践

### 1. 测试策略

#### 单元测试
测试独立的函数和组件。

```typescript
// 测试工具函数
describe('storageHelper', () => {
  it('应该正确设置和获取值', async () => {
    await storageHelper.set('test', 'value')
    const result = await storageHelper.get('test')
    expect(result).toBe('value')
  })
})
```

#### 组件测试
测试组件渲染和交互。

```typescript
// 测试 Vue 组件
describe('FeatureToggle', () => {
  it('应该正确渲染开关状态', async () => {
    const wrapper = mount(FeatureToggle, {
      props: { feature: 'dark-mode' }
    })
    
    expect(wrapper.find('.toggle').classes()).toContain('off')
    
    await wrapper.find('.toggle').trigger('click')
    expect(wrapper.find('.toggle').classes()).toContain('on')
  })
})
```

### 2. 测试数据

#### 使用测试工厂
创建可重用的测试数据工厂。

```typescript
// 用户测试数据工厂
const createTestUser = (overrides = {}): User => ({
  id: 1,
  name: '测试用户',
  email: 'test@example.com',
  ...overrides
})

// 在测试中使用
const user = createTestUser({ name: '自定义用户' })
```

#### 模拟外部依赖
模拟浏览器 API 和其他外部依赖。

```typescript
// 模拟 browser.storage
vi.mock('@/utils/storageHelper', () => ({
  storageHelper: {
    get: vi.fn().mockResolvedValue({ darkMode: true }),
    set: vi.fn().mockResolvedValue(undefined)
  }
}))
```

## 相关文档

- [代码风格规范](../code-style.md) - 详细的代码规范要求
- [组件开发指南](../component-guide.md) - 功能开关组件规范
- [自动导入机制](../auto-import.md) - 无需显式导入的API
- [可组合函数式架构](../composable-architecture.md) - Vue 3组合式API

---

*文档版本：1.0.0*  
*最后更新：2026-04-17*