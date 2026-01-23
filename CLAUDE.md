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
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm zip          # 打包扩展
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

## 主要文件

| 文件                           | 作用                       |
| ------------------------------ | -------------------------- |
| `src/configs/navigation.json`  | 导航菜单配置               |
| `src/configs/quickReply.json`  | 快捷回复配置               |
| `src/configs/quickQuery.json`  | 便捷查询配置               |
| `src/utils/navigationHider.ts` | 导航菜单管理工具类         |
| `src/utils/quickQuery.ts`      | 便捷查询管理工具类         |
| `src/utils/themeManager.ts`    | 主题管理工具类             |
| `src/entries/contents.ts`      | Content Script，初始化功能 |
| `src/pages/SettingsPanel.vue`  | 设置面板组件（主容器）     |
| `src/components/NavigationSettings.vue` | 导航菜单设置组件 |
| `src/components/QuickQueryToggle.vue` | 便捷查询功能开关组件 |
| `src/components/QuickReplyToggle.vue` | 快捷回复功能开关组件 |
| `src/components/FloorHighlighterToggle.vue` | 楼层高亮功能开关组件 |

## 路径别名配置

项目配置了以下路径别名以简化导入：

- `@` → `src/`
- `@com` → `src/components/`
- `@utils` → `src/utils/`
- `@ent` → `src/entries/`
- `@pages` → `src/pages/`

## 许可证

项目采用 AGPL-3.0-only 许可证。
