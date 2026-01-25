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
```

## 项目架构

项目采用 WXT 框架的模块化架构：

- **入口文件**: `src/entries/` - 包含 content script 和 popup 入口
- **页面**: `src/pages/` - Vue 3 页面组件目录
- **配置文件**: `src/configs/` - JSON 格式的配置文件
- **工具类**: `src/utils/` - 核心功能实现
- **配置**: `wxt.config.ts` - WXT 框架配置

## 核心功能

### 1. 导航菜单管理

- 允许用户在吾爱破解论坛上自定义显示/隐藏导航菜单
- 配置通过浏览器 storage 本地存储
- 支持实时切换显示/隐藏状态
- 提供重置为默认配置功能

### 2. 便捷查询

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

### 8. 样式统一管理

- 重构子组件样式管理，统一在父组件 SettingsPanel.vue 中管理
- 使用 :deep() 穿透选择器确保父组件样式能应用到子组件
- 移除所有子组件中的重复样式定义，提高代码可维护性

### 9. 全选功能

- 在管理页面添加"除第一条全选"按钮，方便批量操作
- 添加"删除"按钮，快速执行删除操作
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 10. 分表选择器优化

- 将分表选择器替换为按钮式界面，提高操作效率
- 支持隐藏特定分表，简化界面
- 蛇形布局设计，优化按钮排列
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

### 12. 管理页面查询

- 在管理页面（forum.php?mod=modcp&action=moderate&op=threads）鼠标移动到用户名链接时，自动显示该用户的违规记录
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

## 主要文件

| 文件                                        | 作用                       |
| ------------------------------------------- | -------------------------- |
| `src/configs/navigation.json`               | 导航菜单配置               |
| `src/configs/quickReply.json`               | 快捷回复配置               |
| `src/configs/quickQuery.json`               | 便捷查询配置               |
| `src/utils/navigationHider.ts`              | 导航菜单管理工具类         |
| `src/utils/quickQuery.ts`                   | 便捷查询管理工具类         |
| `src/utils/quickReply.ts`                   | 快捷回复管理工具类         |
| `src/utils/floorHighlighter.ts`             | 楼层高亮管理工具类         |
| `src/utils/userInfo.ts`                     | 用户信息获取和缓存工具类   |
| `src/utils/themeManager.ts`                 | 主题管理工具类             |
| `src/utils/nativeFloorDisplay.ts`           | 原生楼层显示管理工具类     |
| `src/entries/contents.ts`                   | Content Script，初始化功能 |
| `src/pages/SettingsPanel.vue`               | 设置面板组件（主容器）     |
| `src/components/NavigationSettings.vue`     | 导航菜单设置组件           |
| `src/components/QuickQueryToggle.vue`       | 便捷查询功能开关组件       |
| `src/components/QuickReplyToggle.vue`       | 快捷回复功能开关组件       |
| `src/components/FloorHighlighterToggle.vue` | 楼层高亮功能开关组件       |
| `src/components/NativeFloorDisplayToggle.vue` | 原生楼层显示功能开关组件   |
| `src/components/SelectAllToggle.vue`          | 全选功能开关组件           |
| `src/components/TableSelectorToggle.vue`      | 分表选择器功能开关组件     |
| `src/components/DefaultTimeToggle.vue`        | 默认查询时间功能开关组件   |
| `src/configs/selectAll.json`                  | 全选功能配置               |
| `src/configs/tableSelector.json`              | 分表选择器配置             |
| `src/configs/defaultTime.json`                | 默认查询时间配置           |
| `src/configs/userLinkQuery.json`              | 管理页面查询配置           |
| `src/utils/selectAll.ts`                      | 全选功能管理工具类         |
| `src/utils/tableSelector.ts`                  | 分表选择器管理工具类       |
| `src/utils/defaultTime.ts`                    | 默认查询时间管理工具类     |
| `src/utils/userLinkQuery.ts`                  | 管理页面查询管理工具类     |

## 路径别名配置

项目配置了以下路径别名以简化导入：

- `@` → `src/`
- `@com` → `src/components/`
- `@utils` → `src/utils/`
- `@ent` → `src/entries/`
- `@pages` → `src/pages/`

## 开发注意事项

### 1. Popup 与 Content Script 通信问题

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

### 2. 新增功能开发规范

#### 2.1 组件初始化
```typescript
// 错误做法 - 会在非 52pojie.cn 页面报错
onMounted(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  const response = await browser.tabs.sendMessage(tab.id!, { type: 'GET_STATUS' })
  // ...
})

// 正确做法 - 优先从 storage 读取
onMounted(async () => {
  const storedValue = await loadConfigFromStorage()
  enabled.value = storedValue
})
```

#### 2.2 功能切换
```typescript
const toggleFeature = async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id && tab.url?.includes('52pojie.cn')) {
      // 与 content script 通信
      const response = await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_FEATURE' })
      if (response?.success) {
        enabled.value = response.enabled
      }
    } else {
      // 非 52pojie.cn 页面，直接修改 storage
      const newEnabled = !enabled.value
      enabled.value = newEnabled
      await saveConfigToStorage(newEnabled)
    }
  } catch (error) {
    // 通信失败时，直接修改 storage
    const newEnabled = !enabled.value
    enabled.value = newEnabled
    await saveConfigToStorage(newEnabled)
  }
}
```

#### 2.3 错误处理
```typescript
// 错误做法 - 会在控制台显示不必要的错误
onMounted(async () => {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    const response = await browser.tabs.sendMessage(tab.id!, { type: 'GET_STATUS' })
    if (response?.success) {
      enabled.value = response.enabled
    }
  } catch (error) {
    console.error('Error:', error) // 会在非 52pojie.cn 页面显示错误
  }
})

// 正确做法 - 静默处理通信错误
onMounted(async () => {
  const storedValue = await loadConfigFromStorage()
  enabled.value = storedValue

  // 仅在页面是 52pojie.cn 时尝试同步状态，且不显示错误
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (tab.id && tab.url?.includes('52pojie.cn')) {
    try {
      const response = await browser.tabs.sendMessage(tab.id, { type: 'GET_STATUS' })
      if (response?.success) {
        enabled.value = response.enabled
      }
    } catch (error) {
      // 通信失败时，保持 storage 中的值，不显示错误
    }
  }
})
```

### 3. 最佳实践

1. **配置存储优先**：所有组件状态都应支持从 `browser.storage` 读取和保存
2. **通信容错**：与 content script 通信时，必须添加 try-catch 错误处理
3. **页面判断**：在发送消息前，必须检查当前页面是否是 52pojie.cn
4. **用户体验**：通信失败时，应提供适当的 fallback 方案，而不是报错
5. **代码简洁**：避免在初始化阶段进行不必要的通信，保持代码简洁和高效

## 许可证

项目采用 AGPL-3.0-only 许可证。
