# 代码风格规范

本文档定义了 52pjhelper 项目的代码风格规范，所有贡献者必须遵守这些规范以确保代码质量的一致性。

## 核心原则

### 1. 函数式编程优先
**必须使用 ES6+ 函数式风格，禁止使用 `class` 风格**。

### 2. 类型安全
使用 TypeScript 严格模式，避免 `any` 类型。

### 3. 简洁明了
代码应该易于理解和维护，避免过度设计。

### 4. 一致性
整个项目保持统一的代码风格。

## 语言风格要求

### 禁止使用 class
```typescript
// ✅ 推荐：函数式风格
export const createFeatureManager = (options: CreateFeatureManagerOptions) => {
  const { config, onEnable, onDisable, onInit } = options

  const enable = () => {
    if (onEnable) onEnable()
  }

  const disable = () => {
    if (onDisable) onDisable()
  }

  const init = () => {
    if (onInit) onInit()
  }

  return {
    enable,
    disable,
    init,
    config
  }
}

// ❌ 禁止：class 风格
export class FeatureManager {
  private config: FeatureConfig

  constructor(config: FeatureConfig) {
    this.config = config
  }

  enable() {
    // 启用逻辑
  }

  disable() {
    // 禁用逻辑
  }
}
```

### 箭头函数使用
```typescript
// ✅ 推荐：箭头函数
const add = (a: number, b: number) => a + b

// ✅ 推荐：函数表达式
const multiply = function(a: number, b: number) {
  return a * b
}

// ❌ 禁止：class 方法
class Calculator {
  add(a: number, b: number) {
    return a + b
  }
}
```

### 模块化导出
```typescript
// ✅ 推荐：ES 模块导出
export const utils = {
  formatDate,
  validateEmail,
  sanitizeInput
}

export { default as StorageHelper } from './storageHelper'

// ❌ 禁止：CommonJS 风格
module.exports = {
  formatDate,
  validateEmail
}
```

## Vue 组件开发规范

### 使用 `<script setup>` 语法
```vue
<!-- ✅ 推荐：Composition API + script setup -->
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const message = ref('Hello World')

onMounted(() => {
  console.log('Component mounted')
})
</script>

<!-- ❌ 禁止：Options API -->
<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      message: 'Hello World'
    }
  },
  mounted() {
    console.log('Component mounted')
  }
})
</script>
```

### 组件命名
- 组件文件使用 PascalCase：`UserCard.vue`
- 组件名使用 PascalCase：`UserCard`
- 目录名使用 kebab-case：`user-components/`

### 组件结构
```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
// 导入
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  title: string
  count?: number
}

// 属性定义
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 事件定义
const emit = defineEmits<{
  'update:title': [title: string]
  'click': [event: MouseEvent]
}>()

// 响应式状态
const message = ref('')
const doubledCount = computed(() => props.count * 2)

// 方法
const handleClick = () => {
  emit('click', event)
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<style scoped>
/* 组件样式 */
</style>
```

## 工具类和辅助函数

### 函数式工具类
```typescript
// ✅ 推荐：函数式工具类
export const storageHelper = {
  loadBoolean: (key: string, defaultValue: boolean = false): Promise<boolean> => {
    return browser.storage.local.get(key).then(result =>
      (result[key] as boolean | undefined) ?? defaultValue
    )
  },

  saveBoolean: (key: string, value: boolean): Promise<void> => {
    return browser.storage.local.set({ [key]: value })
  }
}

// ❌ 禁止：class 风格工具类
export class StorageHelper {
  static async loadBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
    const result = await browser.storage.local.get(key)
    return (result[key] as boolean | undefined) ?? defaultValue
  }

  static async saveBoolean(key: string, value: boolean): Promise<void> {
    await browser.storage.local.set({ [key]: value })
  }
}
```

### 工具函数设计原则
1. **单一职责**：每个函数只做一件事
2. **纯函数优先**：避免副作用，便于测试
3. **明确命名**：函数名能完整描述其功能
4. **适当抽象**：避免过度抽象或抽象不足

## TypeScript 规范

### 类型定义
```typescript
// ✅ 推荐：interface 描述对象结构
interface User {
  id: number
  name: string
  email: string
}

// ✅ 推荐：type 用于联合/交叉类型
type UserRole = 'admin' | 'moderator' | 'user'
type UserWithRole = User & { role: UserRole }

// ❌ 禁止：any 类型
const data: any = getData() // 错误！

// ✅ 正确：使用 unknown 或具体类型
const data: unknown = getData()
const userData: User = getUserData()
```

### 泛型使用
```typescript
// ✅ 推荐：使用泛型提高复用性
function identity<T>(value: T): T {
  return value
}

// ✅ 推荐：约束泛型类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

### 可选链和空值合并
```typescript
// ✅ 推荐：使用可选链和空值合并
const userName = user?.profile?.name ?? '匿名用户'

// ❌ 禁止：冗长的空值检查
let userName = '匿名用户'
if (user && user.profile && user.profile.name) {
  userName = user.profile.name
}
```

## 命名规范

### 变量和函数
```typescript
// ✅ 推荐：camelCase
const userName = '张三'
function fetchUserData() { /* ... */ }
const isLoading = ref(false)

// ❌ 禁止：其他命名风格
const user_name = '张三'  // snake_case
function FetchUserData() { /* ... */ }  // PascalCase
const IS_LOADING = ref(false)  // 常量风格
```

### 常量
```typescript
// ✅ 推荐：UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const DEFAULT_TIMEOUT = 5000
const API_ENDPOINTS = {
  USER: '/api/user',
  POST: '/api/post'
}

// 枚举也使用 UPPER_SNAKE_CASE
enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}
```

### 文件和目录
```
// ✅ 推荐：
src/
├── components/
│   ├── UserCard.vue      # PascalCase
│   └── user-list/        # kebab-case
├── utils/
│   └── storageHelper.ts  # camelCase
└── configs/
    └── navigation.json   # kebab-case
```

## 格式规范

### 缩进和空格
- 使用 2 个空格缩进
- 操作符前后添加空格
- 逗号后添加空格
- 对象字面量冒号后添加空格

```typescript
// ✅ 推荐
const user = {
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
}

function calculate(a: number, b: number): number {
  return a + b * 2
}

// ❌ 禁止
const user={
  name:'张三',
  age:25,
  email:'zhangsan@example.com'
}

function calculate(a:number,b:number):number{
  return a+b*2
}
```

### 行长度
- 最大行长度：100 字符
- 超过时适当换行
- 保持可读性优先

```typescript
// ✅ 推荐：适当换行
const result = someVeryLongFunctionName(
  parameter1,
  parameter2,
  parameter3
)

// ✅ 推荐：链式调用换行
const data = await fetch(url)
  .then(response => response.json())
  .then(data => processData(data))
  .catch(error => handleError(error))
```

### 引号使用
- 字符串使用单引号：`'字符串'`
- 模板字符串使用反引号：`` `模板${变量}` ``
- JSX 属性使用双引号：`<div className="container">`

## 注释规范

### 文档注释
```typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户信息对象
 * @throws {Error} 当用户不存在时抛出错误
 */
async function getUserInfo(userId: number): Promise<User> {
  // 实现...
}
```

### 行内注释
```typescript
// ✅ 推荐：解释为什么，而不是是什么
// 需要缓存结果，因为计算成本高
const result = expensiveCalculation()

// ❌ 禁止：无意义的注释
// 设置变量 x 为 10
const x = 10
```

### TODO 注释
```typescript
// TODO: 优化算法复杂度，目前是 O(n^2)
function processData(data: any[]) {
  // 当前实现
}

// FIXME: 这里有个边界条件需要处理
function calculateTotal(items: Item[]) {
  // 有问题的代码
}
```

## 错误处理

### 异步错误处理
```typescript
// ✅ 推荐：使用 async/await 和 try-catch
async function fetchData() {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error // 重新抛出或返回默认值
  }
}

// ❌ 禁止：忽略错误或使用 .catch() 链式
fetch(url)
  .then(response => response.json())
  .then(data => console.log(data))
  // 错误被静默忽略！
```

### 错误类型
```typescript
// 定义自定义错误类型
class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

// 使用
throw new NetworkError('连接超时', 408)
```

## 测试规范


  describe('loadBoolean', () => {
    it('应该返回默认值当键不存在时', async () => {
      const result = await storageHelper.loadBoolean('nonexistent', true)
      expect(result).toBe(true)
    })

    it('应该返回存储的值当键存在时', async () => {
      await browser.storage.local.set({ testKey: false })
      const result = await storageHelper.loadBoolean('testKey', true)
      expect(result).toBe(false)
    })
  })
})
```

## 代码质量检查清单

在提交代码前检查：

### 语法和类型
- [ ] 通过 TypeScript 类型检查：`npx tsc --noEmit`
- [ ] 通过 Vue 类型检查：`npx vue-tsc --noEmit`
- [ ] 没有语法错误

### 代码风格
- [ ] 代码使用 ES6+ 函数式风格
- [ ] 没有使用 `class` 关键字
- [ ] 使用箭头函数和函数表达式
- [ ] 使用 ES 模块导入导出
- [ ] Vue 组件使用 script setup 语法
- [ ] 工具类采用对象字面量形式

### 命名规范
- [ ] 变量和函数使用 camelCase
- [ ] 常量使用 UPPER_SNAKE_CASE
- [ ] 组件文件使用 PascalCase
- [ ] 目录使用 kebab-case

### 格式规范
- [ ] 使用 2 个空格缩进
- [ ] 行长度不超过 100 字符
- [ ] 适当的空行分隔逻辑块
- [ ] 一致的引号使用

### 注释和文档
- [ ] 复杂的函数有文档注释
- [ ] 有意义的行内注释
- [ ] 清理调试用的 console.log
- [ ] 更新相关的文档

### 测试
- [ ] 新功能有测试覆盖
- [ ] 修复 bug 有回归测试
- [ ] 所有测试通过
- [ ] 测试描述清晰

## 构建和测试命令

### 代码检查
```bash
# TypeScript 类型检查
npx tsc --noEmit

# Vue 类型检查
npx vue-tsc --noEmit

# ESLint 检查
pnpm lint

# Prettier 格式化检查
pnpm format:check
```

### 格式化
```bash
# 使用 Prettier 格式化代码
pnpm format

# 格式化特定文件
npx prettier --write src/utils/storageHelper.ts
```


## 工具配置

### ESLint 配置
项目使用基于 `@antfu/eslint-config` 的 ESLint 配置，包含：
- TypeScript 规则
- Vue 3 规则
- 导入排序规则
- 代码风格规则

### Prettier 配置
项目使用 Prettier 进行代码格式化，配置包括：
- 单引号
- 2 空格缩进
- 尾随逗号
- 100 字符行宽

### Git Hooks
项目配置了 Git Hooks，在提交前自动：
- 运行类型检查
- 运行 ESLint
- 运行测试
- 格式化代码

## 例外情况

### 第三方库兼容
当与第三方库交互时，可能需要暂时放宽规则：
```typescript
// 允许使用 any 当第三方库类型不完善时
const result: any = thirdPartyLibrary.doSomething()

// 但应该尽快转换为具体类型
const typedResult = result as SpecificType
```

### 遗留代码
对于遗留代码的修改：
1. 优先修复问题，不强制重构
2. 逐步改进，避免大规模重写
3. 添加 TODO 注释标记需要改进的地方

## 相关文档
- [ESLint 规则](https://eslint.org/docs/rules/)
- [Prettier 选项](https://prettier.io/docs/en/options.html)
- [TypeScript 编码指南](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [Vue 风格指南](https://vuejs.org/style-guide/)

---

*最后更新：2026-04-17*  
*文档版本：1.0.0*