# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 WXT 框架构建的浏览器扩展，专为提升吾爱破解论坛(52pojie.cn)管理效率而设计。项目使用现代化的开发工具和架构，提供便捷的浏览器扩展开发体验。

## 技术栈

- **框架**: WXT ^0.20.13 - 现代化的浏览器扩展开发框架
- **语言**: TypeScript
- **包管理器**: pnpm
- **构建工具**: Vite（WXT 内置）
- **UI 框架**: Vue 3
- **浏览器支持**: Chrome（Manifest V3）

## 开发命令

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```
启动开发服务器，监听文件变化并自动重新加载扩展。

### 构建生产版本
```bash
pnpm build
```
构建生产版本的浏览器扩展，输出到 `dist/` 目录。

### 打包扩展
```bash
pnpm zip
```
将构建好的扩展打包成 ZIP 文件，便于分发和安装。

## 项目架构与核心功能

### 1. 架构概览

项目采用 WXT 框架的模块化架构：

- **入口文件**: `src/entries/` - 包含 content script 和 popup 入口
- **组件**: `src/components/` - Vue 3 组件目录
- **工具类**: `src/utils/` - 核心功能实现
- **配置**: `wxt.config.ts` - WXT 框架配置
- **样式**: 组件内联样式（Vue SFC scoped styles）

### 2. 核心功能 - 导航菜单管理

#### 功能描述
- 允许用户在吾爱破解论坛上自定义显示/隐藏导航菜单
- 配置通过浏览器 storage 本地存储
- 支持实时切换显示/隐藏状态
- 提供重置为默认配置功能

#### 主要文件

| 文件 | 作用 |
|------|------|
| `src/utils/navigationHider.ts` | 导航菜单管理工具类，包含配置存储和 DOM 操作方法 |
| `src/entries/contents.ts` | Content Script，在论坛页面注入并初始化导航隐藏功能 |
| `src/entries/popup/main.ts` | Popup 入口文件，初始化 Vue 应用 |
| `src/components/navConsole/NavConsole.vue` | 主 UI 组件，提供菜单显示/隐藏控制界面 |

#### 核心接口与类型

```typescript
// 导航菜单配置
interface NavMenuConfig {
  id: string
  name: string
  selector: string
}

// 用户配置
interface UserNavConfig {
  hiddenMenus: string[]
}
```

#### 默认导航菜单配置
```typescript
const DEFAULT_NAV_MENUS: NavMenuConfig[] = [
  { id: 'mn_portal', name: '门户', selector: '#mn_portal' },
  { id: 'mn_forum', name: '网站', selector: '#mn_forum' },
  { id: 'mn_Na063', name: '新帖', selector: '#mn_Na063' },
  { id: 'mn_forum_11', name: '专辑', selector: '#mn_forum_11' },
  { id: 'mn_home_4', name: '家园', selector: '#mn_home_4' },
  { id: 'mn_N12a7', name: '排行榜', selector: '#mn_N12a7' },
  { id: 'mn_N05be', name: '总版规', selector: '#mn_N05be' },
  { id: 'mn_N34c9', name: '投诉举报', selector: '#mn_N34c9' },
  { id: 'mn_Na678', name: '爱盘', selector: '#mn_Na678' },
  { id: 'mn_Ndb2c', name: '管理', selector: '#mn_Ndb2c' },
  { id: 'mn_N0a2c', name: '帮助', selector: '#mn_N0a2c' },
]
```

### 3. 消息通信机制

- **Popup → Content Script**: 通过 `browser.tabs.sendMessage` 发送配置更新消息
- **Content Script → Popup**: 监听消息并立即应用 DOM 更改

## WXT 配置详解

项目配置文件 `wxt.config.ts` 内容：

```typescript
import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  targetBrowsers: ['chrome'],
  entrypointsDir: 'entries',
  modules: ['@wxt-dev/module-vue'],
  manifestVersion: 3,
  manifest: {
    name: '吾爱管理效率助手',
    description: '提升论坛管理效率',
    version: '1.0',
    action: {
      default_icon: 'images/icon-128.png',
    },
    icons: {
      '16': 'images/icon-16.png',
      '48': 'images/icon-48.png',
      '128': 'images/icon-128.png',
    },
    permissions: ['storage'],
    host_permissions: ['https://www.52pojie.cn/*'],
    content_scripts: [
      {
        matches: ['https://www.52pojie.cn/*'],
        js: ['contents.js'],
      },
    ],
  },
})
```

## 文件操作规范

**核心原则**: 必须使用专用工具，禁止使用 Shell 命令操作文件

| 操作     | 必须使用       | 严格禁止                                   |
| -------- | -------------- | ------------------------------------------ |
| 创建文件 | **Write 工具** | `touch`、`New-Item`、`echo >`、`cat <<EOF` |
| 编辑文件 | **Edit 工具**  | `sed`、`awk`                               |
| 读取文件 | **Read 工具**  | `cat`、`head`、`tail`、`Get-Content`       |
| 搜索文件 | **Glob 工具**  | `find`、`Get-ChildItem`、`ls`              |
| 搜索内容 | **Grep 工具**  | `grep`、`rg`、`Select-String`              |

**Bash 工具仅用于**: 包管理（`pnpm install`）、版本控制（`git status`）等系统命令

## Git 操作规范

**原则**: 只允许读取，禁止修改

**允许**: `git log`、`git status`、`git diff`、`git branch`、`git show`

**禁止**: `git commit`、`git push`、`git pull`、`git merge`、`git rebase`、`git reset`

## 代码格式化

使用 Prettier 进行代码格式化，配置文件位于 `prettier.config.ts`。

## 许可证

项目采用 AGPL-3.0-only 许可证。
