# 自动导入机制

项目使用 WXT 框架集成的 `unplugin-auto-import` 插件，自动导入常用的 API 和工具函数。

## 已自动导入的内容

以下内容**无需显式 import**，可以直接使用：

### Vue 核心 API

#### 响应式 API

- `ref` - 创建响应式数据引用
- `reactive` - 创建响应式对象
- `computed` - 创建计算属性
- `readonly` - 创建只读响应式对象
- `shallowRef` - 创建浅层响应式引用
- `shallowReactive` - 创建浅层响应式对象

#### 生命周期钩子

- `onMounted` - 组件挂载后执行
- `onUnmounted` - 组件卸载前执行
- `onBeforeMount` - 组件挂载前执行
- `onBeforeUnmount` - 组件卸载前执行
- `onUpdated` - 组件更新后执行
- `onBeforeUpdate` - 组件更新前执行

#### 侦听器

- `watch` - 侦听响应式数据变化
- `watchEffect` - 立即执行并追踪依赖
- `watchPostEffect` - DOM 更新后执行
- `watchSyncEffect` - 同步执行

#### 工具函数

- `nextTick` - 等待下一个 DOM 更新周期
- `toRef` - 将响应式对象的属性转换为 ref
- `toRefs` - 将响应式对象转换为普通对象，每个属性都是 ref
- `unref` - 获取 ref 的值
- `isRef` - 检查是否为 ref
- `toValue` - 获取值（处理 ref 和普通值）

#### 组件 API

- `createApp` - 创建 Vue 应用实例
- `defineComponent` - 定义 Vue 组件
- `defineAsyncComponent` - 定义异步组件

#### 其他

- `inject` - 注入依赖
- `provide` - 提供依赖
- `getCurrentInstance` - 获取当前组件实例
- `h` - 创建虚拟节点
- `createVNode` - 创建虚拟节点

### WXT 浏览器 API

- `browser`（来自 `wxt/browser`）- 浏览器扩展 API 的封装

### WXT 框架 API

- `defineContentScript` - 定义 Content Script
- `defineBackground` - 定义 Background Script
- `defineUnlistedScript` - 定义未列出的 Script

## 仍需显式导入的内容

以下内容**仍然需要显式 import**：

### 1. 类型定义

```typescript
import type { Ref, ComputedRef } from 'vue'
```

### 2. 项目内的自定义模块

```typescript
import { useFeatureToggle } from '@/composables/useFeatureToggle'
import config from '@/configs/avatarQuery.json'
import { storageHelper } from '@/utils/storageHelper'
```

### 3. 第三方库

```typescript
import axios from 'axios'
import dayjs from 'dayjs'
```

### 4. Vue 组件

```typescript
import NavigationSettings from '@com/NavigationSettings.vue'
```

## 最佳实践

### 避免冗余导入

不要显式导入已自动导入的 API（如 `ref`, `computed`, `onMounted` 等）。

### 保持一致性

统一使用自动导入机制，保持代码风格一致。

### 类型安全

保留必要的类型导入，确保 TypeScript 类型检查正常工作。

### IDE 支持

自动导入的 API 在 IDE 中仍然有完整的类型提示和自动补全。

## 示例对比

### ❌ 错误示例（冗余导入）

```typescript
import { ref, onMounted, computed } from 'vue'
import { createApp } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
```

### ✅ 正确示例（使用自动导入）

```typescript
// 无需导入，直接使用
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 仅导入类型定义
import type { Ref } from 'vue'
const myRef: Ref<number> = ref(0)
```

## 路径别名配置

项目配置了以下路径别名以简化导入：

| 别名     | 对应路径          | 用途         |
| -------- | ----------------- | ------------ |
| `@/*`    | `./src/*`         | 源代码根目录 |
| `@com/*` | `./src/components/*` | Vue 组件目录 |
| `@utils/*` | `./src/utils/*`   | 工具函数目录 |
| `@ent/*` | `./src/entries/*` | 入口文件目录 |
| `@pages/*` | `./src/pages/*`   | 页面组件目录 |
| `@conf/*` | `./src/configs/*` | 配置文件目录 |

**注意**：所有路径别名都使用 `./` 前缀，这是 TypeScript 的最新推荐做法，移除了弃用的 `baseUrl` 配置。

## 常见问题

### Q: 自动导入的 API 在 IDE 中无法识别怎么办？

A: 确保 IDE 的 TypeScript 配置正确，重启 IDE 或重新加载项目。

### Q: 如何查看哪些 API 被自动导入了？

A: 查看 `wxt.config.ts` 文件中的 `autoImport` 配置。

### Q: 可以自定义自动导入的 API 吗？

A: 可以，在 `wxt.config.ts` 中配置 `autoImport` 选项。

## 相关链接

- [Vue 3 组合式 API](composable-architecture.md)
- [功能开关组件开发指南](component-guide.md)
- [项目文件结构](../../reference/file-structure.md)
