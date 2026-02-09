# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架构建的浏览器扩展，专为提升吾爱破解论坛(52pojie.cn)管理效率而设计。项目使用现代化的开发工具和架构，提供便捷的浏览器扩展开发体验。

## 技术栈

- **框架**: WXT ^0.20.13
- **语言**: TypeScript ^5.9.3
- **包管理器**: pnpm@10.28.0
- **UI 框架**: Vue ^3.5.27
- **浏览器支持**: Chrome（Manifest V3）

## 开发命令

```bash
pnpm install      # 安装依赖
npx tsc --noEmit  # TypeScript 类型检查
npx vue-tsc --noEmit # vue3+ts 类型检查
pnpm test         # 运行单元测试
pnpm test:coverage # 运行测试并生成覆盖率报告
```

**重要提示**：

- **禁止运行** `pnpm dev` 和 `pnpm build` 命令
- 这些命令会启动开发服务器或构建项目，可能导致不必要的资源占用
- 如需构建或运行项目，请由用户手动执行

## 测试架构

项目使用 Vitest 进行单元测试，测试文件独立于源代码目录：

- **测试目录**: `tests/` - 镜像 `src/` 的目录结构
  - `utils/` - 工具类测试
    - `storageHelper.spec.ts` - 存储辅助工具测试（34 个测试用例，覆盖率 64.38%）
  - `components/` - Vue 组件测试（待添加）
  - `composables/` - 可组合函数测试（待添加）
  - `features/` - 功能集成测试（待添加）

**测试规范**：
- 测试文件使用 `.spec.ts` 后缀
- 测试文件路径镜像源文件路径
- 使用 `fakeBrowser` 模拟浏览器扩展 API
- 使用 `happy-dom` 作为测试环境
- 详细文档：[tests/README.md](tests/README.md)、[docs/testing-summary-storageHelper.md](docs/testing-summary-storageHelper.md)

## 项目架构

项目采用 WXT 框架的模块化架构，引入了现代化的可组合函数式编程模式：

- **入口文件**: `src/entries/` - 包含 content script 和 popup 入口
  - `contents/` - Content Script 模块化入口（已重构）
    - `index.ts` - 主入口文件，协调各模块
    - `initialization.ts` - 功能初始化模块
    - `messageHandler.ts` - 消息处理器模块
    - `storageListener.ts` - 存储监听器模块
- **页面**: `src/pages/` - Vue 3 页面组件目录
- **组件**: `src/components/` - Vue 3 组件目录
- **可组合函数**: `src/composables/` - Vue 3 可组合函数目录
  - `useFeatureToggle.ts` - 功能切换可组合函数，提供统一的功能开关逻辑
- **配置文件**: `src/configs/` - JSON 格式的配置文件
- **工具类**: `src/utils/` - 核心功能实现
  - `featureManager.ts` - 功能管理器，提供统一的功能管理模式
  - `storageHelper.ts` - 存储操作辅助工具，提供统一的浏览器存储操作接口
  - `messageHelper.ts` - 消息通信辅助工具，提供统一的浏览器消息通信接口
  - `urlMatcher.ts` - URL 匹配工具，提供统一的 URL 匹配功能
- **配置**: `wxt.config.ts` - WXT 框架配置

### Content Script 架构说明

Content Script 采用模块化设计，遵循 WXT 框架的最佳实践：

1. **主入口** (`index.ts`，46 行)
   - 负责协调各个功能模块
   - 创建管理器实例容器
   - 防止重复初始化

2. **初始化模块** (`initialization.ts`，68 行)
   - 初始化所有功能管理器
   - 统一管理功能启动逻辑

3. **消息处理器** (`messageHandler.ts`，375 行)
   - 处理来自 popup 的消息
   - 统一的消息路由和响应

4. **存储监听器** (`storageListener.ts`，156 行)
   - 监听浏览器存储变化
   - 实现跨页面状态同步

**优势**：

- 模块职责清晰，易于维护
- 符合 WXT 框架规范
- 代码复用性高
- 便于单元测试

## 核心功能

### 1. 导航菜单管理

- 允许用户在吾爱破解论坛上自定义显示/隐藏导航菜单
- 配置通过浏览器 storage 本地存储
- 支持实时切换显示/隐藏状态
- 提供重置为默认配置功能

### 2. 头像查询

- 鼠标移动到用户头像时，自动显示该用户的违规记录
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 3. 深色主题支持

- 自动检测系统主题（深色/浅色模式）
- 实时响应系统主题变化
- 使用 CSS 变量实现主题切换

### 4. 快捷回复

- 在举报处理页面添加快捷回复短语下拉框
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 5. 楼层高亮

- 根据URL参数高亮指定楼层
- 提高管理效率
- 支持启用/禁用功能切换

### 6. 原生楼层显示

- 显示已结帖的原生楼层，方便管理悬赏贴
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 7. 紧凑布局

- 优化了组件布局，描述文字移至悬停提示，减少页面滚动
- 标签和开关在同一行显示，节省空间
- 优化了所有间距，提高空间利用率

### 8. 样式管理优化

- 每个组件管理自己的样式，符合组件化原则
- Toggle 组件样式统一在 `src/styles/toggle.css` 中
- 全局 CSS 变量定义在 `src/entries/popup/index.html` 中
- 使用 `scoped` 避免样式污染，提高代码可维护性

### 9. 组件分组

- 将功能开关按用途分为两组：通用功能组和后台管理功能组
- 通用功能组（`GeneralFeaturesToggle.vue`）：楼层高亮、原生楼层、重贴检测
- 后台管理功能组（`AdminFeaturesToggle.vue`）：头像查询、快捷回复、自动填充、全选、分表选择、默认时间、审核查询、勾选范围、灌水筛选
- 提高代码可维护性，减少主组件代码量（从 536 行减少到 349 行）

### 10. 全选功能

- 在管理页面添加"除第一条全选"按钮，方便批量操作
- 添加"删除"按钮，快速执行删除操作
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 11. 分表选择器优化

- 将分表选择器替换为按钮式界面，提高操作效率
- 支持隐藏特定分表，简化界面
- 蛇形布局设计，优化按钮排列
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 12. 管理页面查询

- 在管理页面（forum.php?mod=modcp&action=moderate&op=threads）鼠标移动到用户名链接时，自动显示该用户的违规记录
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 13. 自动填充

- 智能监控多种表单，满足条件时自动填充回复内容
- 使用 MutationObserver 监听动态创建的表单
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 使用配置驱动的表单检测机制，易于扩展
- 使用 WeakSet 防止重复绑定，避免内存泄漏

**支持的表单：**

1. **评分表单（rateform）**
   - 监控 `score2`（威望）和 `score6`（热心值）输入框
   - 当 `score2 > 0` 或 `score6 = 1` 时自动填充
   - 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"

2. **处理表单（moderateform）**
   - 监控 `typeid` 下拉框的选项
   - 选择"已答复"时填充："欢迎分析讨论交流，吾爱破解论坛有你更精彩！"
   - 选择"已处理"时填充："已经处理，感谢您对吾爱破解论坛的支持！"

3. **举报表单（reportform）**
   - 监控所有 `select[name*="creditsvalue"]` 元素
   - 当选择正数值（如 +1, +2, +5）时自动填充对应的 `input[name*="msg"]`
   - 填充内容："已经处理，感谢您对吾爱破解论坛的支持！"

### 15. 重复发帖检测

- 在论坛列表页面检测当天发布的重复发帖，高亮显示重复发帖的行
- 支持精确匹配和模糊匹配目标页面
- 配置通过浏览器 storage 本地存储
- 配置文件支持动态修改目标页面
- 自动检测日期格式（支持 2026-01-27 和 2026-1-27 两种格式）
- 高亮显示重复发帖的行，使用黄色背景
- 支持启用/禁用功能切换

### 16. 勾选范围

- 在管理页面上点击表格行（tr）来勾选对应的复选框，提高操作效率
- 支持多种页面：帖子管理页面和回收站页面
- 兼容两种页面结构：单 tbody 多 tr 和多 tbody 单 tr
- 复选框选择器支持 delete[] 和 moderate[] 两种 name 属性
- 排除有 class 属性的 tr 元素（如表头、空行等）
- 防止点击行内超链接或按钮时触发复选框勾选
- 使用 WeakSet 防止重复绑定，避免内存泄漏
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 17. 灌水筛选

- 在管理页面（forum.php?mod=modcp&action=thread&op=post）创建可拖动的过滤卡片
- 支持两种匹配模式：正则表达式和简单文本匹配
- 一行一个条件，满足任意条件即可高亮
- 匹配目标：`#moderate tbody .xg1` 元素的文本内容
- 文本长度限制：超过 12 个汉字的文本不进行匹配
- 触发时机：失去卡片焦点时开始匹配
- 匹配成功后高亮对应的表格行（`#moderate > table > tbody > tr`）
- 支持动态添加/删除过滤条件
- 卡片位置和过滤规则自动保存到浏览器存储
- 内置预设规则：
  - 常见灌水：匹配常见灌水关键词（mark、推荐、好用、支持、给力等）
  - 标点数字灌水：匹配连续数字、感叹号、波浪号等
- 支持启用/禁用功能切换

## 主要文件

### Content Script 入口（模块化架构）

| 文件                                      | 作用                              |
| ----------------------------------------- | --------------------------------- |
| `src/entries/contents/index.ts`           | Content Script 主入口，协调各模块 |
| `src/entries/contents/initialization.ts`  | 功能初始化模块                    |
| `src/entries/contents/messageHandler.ts`  | 消息处理器模块                    |
| `src/entries/contents/storageListener.ts` | 存储监听器模块                    |

### 配置文件

| 文件                                      | 作用                 |
| ----------------------------------------- | -------------------- |
| `src/configs/navigation.json`             | 导航菜单配置         |
| `src/configs/quickReply.json`             | 快捷回复配置         |
| `src/configs/avatarQuery.json`            | 头像查询配置         |
| `src/configs/userLinkQuery.json`          | 管理页面查询配置     |
| `src/configs/selectAll.json`              | 全选功能配置         |
| `src/configs/tableSelector.json`          | 分表选择器配置       |
| `src/configs/defaultTime.json`            | 默认查询时间配置     |
| `src/configs/autoFill.json`               | 自动填充配置         |
| `src/configs/rowClickToCheck.json`        | 勾选范围功能配置     |
| `src/configs/duplicatePostDetection.json` | 重复发帖检测功能配置 |
| `src/configs/contentFilter.json`          | 灌水筛选功能配置     |

### 工具类

| 文件                                  | 作用                                           |
| ------------------------------------- | ---------------------------------------------- |
| `src/utils/navigationHider.ts`        | 导航菜单管理工具类                             |
| `src/utils/avatarQuery.ts`            | 头像查询管理工具类                             |
| `src/utils/userLinkQuery.ts`          | 管理页面查询管理工具类                         |
| `src/utils/userViolationFetcher.ts`   | 用户违规信息获取公共工具                       |
| `src/utils/quickReply.ts`             | 快捷回复管理工具类                             |
| `src/utils/floorHighlighter.ts`       | 楼层高亮管理工具类                             |
| `src/utils/userInfo.ts`               | 用户信息获取和缓存工具类                       |
| `src/utils/themeManager.ts`           | 主题管理工具类                                 |
| `src/utils/nativeFloorDisplay.ts`     | 原生楼层显示管理工具类                         |
| `src/utils/selectAll.ts`              | 全选功能管理工具类                             |
| `src/utils/tableSelector.ts`          | 分表选择器管理工具类                           |
| `src/utils/defaultTime.ts`            | 默认查询时间管理工具类                         |
| `src/utils/autoFill.ts`               | 自动填充管理工具类                             |
| `src/utils/rowClickToCheck.ts`        | 勾选范围功能管理工具类                         |
| `src/utils/duplicatePostDetection.ts` | 重复发帖检测管理工具类                         |
| `src/utils/contentFilter.ts`          | 灌水筛选管理工具类                             |
| `src/utils/featureManager.ts`         | 功能管理器，提供统一的功能管理模式             |
| `src/utils/storageHelper.ts`          | 存储操作辅助工具，提供统一的浏览器存储操作接口 |
| `src/utils/messageHelper.ts`          | 消息通信辅助工具，提供统一的浏览器消息通信接口 |
| `src/utils/urlMatcher.ts`             | URL 匹配工具，提供统一的 URL 匹配功能          |

### Vue 组件

| 文件                                              | 作用                                                   |
| ------------------------------------------------- | ------------------------------------------------------ |
| `src/pages/SettingsPanel.vue`                     | 设置面板组件（主容器）                                 |
| `src/components/NavigationSettings.vue`           | 导航菜单设置组件                                       |
| `src/components/GeneralFeaturesToggle.vue`        | 通用功能组（头像查询、楼层高亮、原生楼层、重贴检测）   |
| `src/components/AdminFeaturesToggle.vue`          | 后台管理功能组（快捷回复、自动填充、全选、分表选择等） |
| `src/components/AvatarQueryToggle.vue`            | 头像查询功能开关组件                                   |
| `src/components/UserLinkQueryToggle.vue`          | 管理页面查询功能开关组件                               |
| `src/components/QuickReplyToggle.vue`             | 快捷回复功能开关组件                                   |
| `src/components/FloorHighlighterToggle.vue`       | 楼层高亮功能开关组件                                   |
| `src/components/NativeFloorDisplayToggle.vue`     | 原生楼层显示功能开关组件                               |
| `src/components/SelectAllToggle.vue`              | 全选功能开关组件                                       |
| `src/components/TableSelectorToggle.vue`          | 分表选择器功能开关组件                                 |
| `src/components/DefaultTimeToggle.vue`            | 默认查询时间功能开关组件                               |
| `src/components/AutoFillToggle.vue`               | 自动填充功能开关组件                                   |
| `src/components/RowClickToCheckToggle.vue`        | 勾选范围功能开关组件                                   |
| `src/components/DuplicatePostDetectionToggle.vue` | 重复发帖检测功能开关组件                               |
| `src/components/ContentFilterToggle.vue`          | 灌水筛选功能开关组件                                   |

### 样式文件

| 文件                           | 作用                               |
| ------------------------------ | ---------------------------------- |
| `src/entries/popup/index.html` | 全局 CSS 变量定义（浅色/深色主题） |
| `src/styles/toggle.css`        | Toggle 组件共享样式                |

## 路径别名配置

项目配置了以下路径别名以简化导入：

- `@` → `src/`
- `@com` → `src/components/`
- `@utils` → `src/utils/`
- `@ent` → `src/entries/`
- `@pages` → `src/pages/`
- `@conf` → `src/configs/`

## 开发注意事项

### 1. 自动导入机制

项目使用 WXT 框架集成的 `unplugin-auto-import` 插件，自动导入常用的 API 和工具函数。

#### 1.1 已自动导入的内容

以下内容**无需显式 import**，可以直接使用：

**Vue 核心 API**：

- 响应式 API：`ref`, `reactive`, `computed`, `readonly`, `shallowRef`, `shallowReactive`
- 生命周期钩子：`onMounted`, `onUnmounted`, `onBeforeMount`, `onBeforeUnmount`, `onUpdated`, `onBeforeUpdate`
- 侦听器：`watch`, `watchEffect`, `watchPostEffect`, `watchSyncEffect`
- 工具函数：`nextTick`, `toRef`, `toRefs`, `unref`, `isRef`, `toValue`
- 组件 API：`createApp`, `defineComponent`, `defineAsyncComponent`
- 其他：`inject`, `provide`, `getCurrentInstance`, `h`, `createVNode`

**WXT 浏览器 API**：

- `browser`（来自 `wxt/browser`）

**WXT 框架 API**：

- `defineContentScript`, `defineBackground`, `defineUnlistedScript`

#### 1.2 仍需显式导入的内容

以下内容**仍然需要显式 import**：

1. **类型定义**：

   ```typescript
   import type { Ref, ComputedRef } from 'vue'
   ```

2. **项目内的自定义模块**：

   ```typescript
   import { useFeatureToggle } from '@/composables/useFeatureToggle'
   import config from '@/configs/avatarQuery.json'
   import { storageHelper } from '@/utils/storageHelper'
   ```

3. **第三方库**：

   ```typescript
   import axios from 'axios'
   import dayjs from 'dayjs'
   ```

4. **Vue 组件**：
   ```typescript
   import NavigationSettings from '@com/NavigationSettings.vue'
   ```

#### 1.3 最佳实践

- **避免冗余导入**：不要显式导入已自动导入的 API（如 `ref`, `computed`, `onMounted` 等）
- **保持一致性**：统一使用自动导入机制，保持代码风格一致
- **类型安全**：保留必要的类型导入，确保 TypeScript 类型检查正常工作
- **IDE 支持**：自动导入的 API 在 IDE 中仍然有完整的类型提示和自动补全

#### 1.4 示例对比

**❌ 错误示例（冗余导入）**：

```typescript
import { ref, onMounted, computed } from 'vue'
import { createApp } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
```

**✅ 正确示例（使用自动导入）**：

```typescript
// 无需导入，直接使用
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 仅导入类型定义
import type { Ref } from 'vue'
const myRef: Ref<number> = ref(0)
```

### 2. 可组合函数式架构

项目引入了 Vue 3 的可组合函数式架构，提供统一的功能开关逻辑：

#### 2.1 useFeatureToggle 可组合函数

**文件位置**: `src/composables/useFeatureToggle.ts`

**作用**: 提供统一的功能开关逻辑，封装了通用的功能开关逻辑，包括初始化、切换和状态管理。

**特点**:

- 统一的功能开关逻辑
- 内置防抖机制，防止重复点击
- 统一的错误处理和用户反馈
- 简化了组件代码，提高了可维护性

**使用示例**:

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

#### 2.2 功能管理器模式

**文件位置**: `src/utils/featureManager.ts`

**作用**: 功能管理器基类，提供统一的功能管理模式，封装了功能启用/禁用、状态切换和初始化逻辑。

**特点**:

- 统一的功能管理模式
- 支持目标页面匹配和自动初始化
- 提供一致的 API 接口，便于扩展和维护

**使用示例**:

```typescript
import { createFeatureManager, type CreateFeatureManagerOptions } from '@/utils/featureManager'
import config from '@/configs/avatarQuery.json'

const options: CreateFeatureManagerOptions = {
  config,
  onEnable: () => {
    // 启用功能时的操作
  },
  onDisable: () => {
    // 禁用功能时的操作
  },
  onInit: () => {
    // 初始化时的操作（可选）
  },
}

const avatarQueryManager = createFeatureManager(options)
```

#### 2.3 存储操作规范化

**文件位置**: `src/utils/storageHelper.ts`

**作用**: 存储操作辅助工具，提供统一的浏览器存储操作接口。

**特点**:

- 支持多种数据类型：布尔值、字符串、数组、对象
- 内置错误处理和默认值支持
- 提供批量操作和清空功能
- 统一了存储操作的方式，减少重复代码

**使用示例**:

```typescript
import { storageHelper } from '@/utils/storageHelper'

// 加载配置
const enabled = await storageHelper.loadBoolean('avatarQueryEnabled', true)

// 保存配置
await storageHelper.saveBoolean('avatarQueryEnabled', false)
```

#### 2.4 消息通信规范化

**文件位置**: `src/utils/messageHelper.ts`

**作用**: 消息通信辅助工具，提供统一的浏览器消息通信接口。

**特点**:

- 封装了消息发送和响应处理
- 支持功能切换的通用逻辑
- 内置目标网站检查和错误处理
- 统一了组件与 Content Script 的通信方式

**使用示例**:

```typescript
import { messageHelper } from '@/utils/messageHelper'

// 向当前标签页发送消息
const response = await messageHelper.sendToCurrentTab('GET_STATUS')

// 切换功能状态
await messageHelper.toggleFeature({
  messageType: 'TOGGLE_AVATAR_QUERY',
  storageKey: 'avatarQueryEnabled',
  currentValue: enabled,
  featureName: '头像查询',
  onSuccess: newEnabled => {
    // 成功处理
  },
  onMessage: (text, type) => {
    // 处理用户反馈
  },
})
```

#### 2.5 URL 匹配工具

**文件位置**: `src/utils/urlMatcher.ts`

**作用**: URL 匹配工具，提供统一的 URL 匹配功能。

**特点**:

- 支持多种匹配模式：精确匹配、包含匹配、正则匹配、通配符匹配
- 自动检测匹配模式，简化配置
- 内置安全检查，防止正则表达式注入
- 提供简化的目标页面匹配方法

**使用示例**:

```typescript
import { urlMatcher } from '@/utils/urlMatcher'

// 检查 URL 是否匹配目标页面
const isTargetPage = urlMatcher.isTargetPage(window.location.href, [
  'https://www.52pojie.cn/forum-*.html',
  'https://www.52pojie.cn/thread-*.html',
])
```

### 3. Popup 与 Content Script 通信问题

#### 问题现象

当 popup 在非 52pojie.cn 页面打开时，控制台会出现以下错误：

```
获取用户信息失败: Error: Could not establish connection. Receiving end does not exist.
Failed to get quick query status from content script: Error: Could not establish connection. Receiving end does not exist.
```

#### 解决思路

- **避免不必要的通信**：组件初始化时，应优先从 `browser.storage` 读取配置，而非直接与 content script 通信
- **错误处理优化**：在尝试与 content script 通信时，必须添加适当的错误处理
- **通信时机控制**：只有在确认当前页面是 52pojie.cn 时，才尝试与 content script 通信

#### 修复方案（已实施）

1. **SettingsPanel.vue**：优化用户信息获取的错误处理，通信失败时不显示错误信息
2. **所有 Toggle 组件**：移除 `onMounted` 时从 content script 获取状态的代码，只从 storage 读取配置

### 4. 功能开关组件开发规范

#### 4.1 使用 useFeatureToggle 可组合函数

**推荐方式**：使用 `useFeatureToggle` 可组合函数简化功能开关组件的开发。

**完整的功能开关组件结构**：

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

**优势**：

- 代码更加简洁
- 统一的功能开关逻辑
- 内置错误处理和用户反馈
- 简化了组件维护

#### 4.2 功能配置文件规范

**配置文件结构**：

```json
{
  "name": "功能名称",
  "description": "功能描述",
  "defaultEnabled": true,
  "storageKey": "featureKey",
  "targetPages": ["https://www.52pojie.cn/forum-*.html"]
}
```

**存储键命名规范**：

- 使用驼峰命名法
- 前缀统一使用功能英文名称
- 示例：`avatarQueryEnabled`、`quickReplyEnabled`

**新增配置项**：

- `targetPages`：功能适用的目标页面数组，支持通配符匹配

#### 4.3 组件初始化规范

**正确的初始化方式**：

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

**避免的错误做法**：

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

### 5. 最佳实践

1. **配置存储优先**：所有组件状态都应支持从 `browser.storage` 读取和保存
2. **通信容错**：与 content script 通信时，必须添加 try-catch 错误处理
3. **页面判断**：在发送消息前，必须检查当前页面是否是 52pojie.cn
4. **用户体验**：通信失败时，应提供适当的 fallback 方案，而不是报错
5. **代码简洁**：避免在初始化阶段进行不必要的通信，保持代码简洁和高效

### 6. 新建功能开发注意事项

#### 6.1 父子组件传值注意事项

##### 6.1.1 事件通信（子组件→父组件）

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

##### 6.1.2 属性传递（父组件→子组件）

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

##### 6.1.3 消息提示机制

**统一处理原则**：

- 所有提示信息应由父组件 `SettingsPanel.vue` 统一处理
- 子组件只负责发送事件，不处理具体的提示逻辑
- 这样可以保持代码一致性，避免重复实现

**实现示例**（子组件中）：

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

#### 6.2 组件初始化规范

**正确的初始化方式**：

```typescript
import { ref, onMounted } from 'vue'
import featureConfig from '@/configs/feature.json'

const enabled = ref(featureConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = featureConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? featureConfig.defaultEnabled
})
```

**避免的错误做法**：

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

#### 6.3 功能开关组件模板

**完整的功能开关组件结构**：

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
import { ref, onMounted } from 'vue'
import featureConfig from '@/configs/feature.json'

const enabled = ref(featureConfig.defaultEnabled)
const emit = defineEmits(['show-message'])
const STORAGE_KEY = featureConfig.storageKey

onMounted(async () => {
  const result = await browser.storage.local.get(STORAGE_KEY)
  enabled.value = (result[STORAGE_KEY] as boolean | undefined) ?? featureConfig.defaultEnabled
})

const toggleFeature = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_FEATURE' })
      if (response?.success) {
        enabled.value = response.enabled
        emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
      } else {
        emit('show-message', '切换功能失败', 'error')
      }
    } else {
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
      emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
    }
  } catch (error) {
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await browser.storage.local.set({ [STORAGE_KEY]: newEnabled })
    emit('show-message', enabled.value ? '功能已启用' : '功能已禁用', 'success')
  }
}
</script>
```

#### 6.4 功能配置文件规范

**配置文件结构**：

```json
{
  "name": "功能名称",
  "description": "功能描述",
  "defaultEnabled": true,
  "storageKey": "featureKey"
}
```

**存储键命名规范**：

- 使用驼峰命名法
- 前缀统一使用功能英文名称
- 示例：`avatarQueryEnabled`、`quickReplyEnabled`

### 7. Manifest 文件管理

**版本号管理**：

- 每次发布新版本时，需要更新 `wxt.config.ts` 中的版本号
- 版本号格式：`主版本号.次版本号.修订号`
- 功能新增：提升次版本号
- Bug 修复：提升修订号
- 重大重构：提升主版本号

**权限配置**：

- 添加新功能时，检查是否需要额外的权限
- 权限配置在 `wxt.config.ts` 的 `permissions` 数组中
- 只请求必要的权限，遵循最小权限原则

## 许可证

项目采用 AGPL-3.0-only 许可证。
