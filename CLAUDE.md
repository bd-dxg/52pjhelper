# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **注意**：本文档已重构为模块化结构。完整文档请查看 [docs/README.md](docs/README.md)。

## 快速导航

- **[完整文档](docs/README.md)** - 完整的项目文档
- **[快速开始](#快速开始)** - 新开发者入门指南
- **[核心功能](#核心功能)** - 主要功能概览
- **[开发指南](#开发指南)** - 开发注意事项

## 项目概述

这是一个基于 WXT 框架构建的浏览器扩展，专为提升吾爱破解论坛(52pojie.cn)管理效率而设计。项目使用现代化的开发工具和架构，提供便捷的浏览器扩展开发体验。

### 技术栈
- **框架**: WXT ^0.20.13
- **语言**: TypeScript ^5.9.3
- **包管理器**: pnpm@10.28.0
- **UI 框架**: Vue ^3.5.27
- **浏览器支持**: Chrome（Manifest V3）

## 快速开始

### 开发命令
```bash
pnpm install      # 安装依赖
npx tsc --noEmit  # TypeScript 类型检查
npx vue-tsc --noEmit # vue3+ts 类型检查
```

**重要提示**：
- **禁止运行** `pnpm dev` 和 `pnpm build` 命令
- 这些命令会启动开发服务器或构建项目，可能导致不必要的资源占用
- 如需构建或运行项目，请由用户手动执行

## 核心功能

### 通用功能
- **导航菜单管理** - 自定义显示/隐藏导航菜单
- **深色主题支持** - 自动检测系统主题
- **紧凑布局** - 优化组件布局
- **样式管理优化** - 组件化样式管理
- **组件分组** - 按用途分组功能开关
- **通知系统** - 统一的通知提示系统，支持多种通知类型

### 后台管理功能
- **头像查询** - 鼠标悬停显示用户违规记录
- **快捷回复** - 举报处理页面快捷回复
- **楼层高亮** - 根据URL参数高亮指定楼层
- **原生楼层显示** - 显示已结帖的原生楼层
- **全选功能** - 批量操作工具
- **分表选择器** - 按钮式分表选择界面
- **管理页面查询** - 用户链接违规查询
- **自动填充** - 智能表单自动填充
- **重复发帖检测** - 高亮显示重复发帖
- **勾选范围** - 点击表格行勾选复选框
- **灌水筛选** - 可拖动的过滤卡片
- **用户网盘名单** - 高亮显示网盘名单用户并显示网盘信息
- **版本更新检查** - 自动检查新版本

## 开发指南

### 项目架构
项目采用 WXT 框架的模块化架构，引入了现代化的可组合函数式编程模式。详细架构文档请查看 [docs/architecture/](docs/architecture/)。

### 自动导入机制
项目使用 WXT 框架集成的 `unplugin-auto-import` 插件，自动导入常用的 API 和工具函数。详情请查看 [docs/development/auto-import.md](docs/development/auto-import.md)。

### 可组合函数式架构
项目引入了 Vue 3 的可组合函数式架构，提供统一的功能开关逻辑。详情请查看 [docs/development/composable-architecture.md](docs/development/composable-architecture.md)。

### 通信机制
Popup 与 Content Script 通信需要特殊处理，避免在非目标页面报错。详情请查看 [docs/development/communication.md](docs/development/communication.md)。

### 功能开关组件开发
使用 `useFeatureToggle` 可组合函数简化功能开关组件的开发。详情请查看 [docs/development/component-guide.md](docs/development/component-guide.md)。

## 文档结构

### 完整文档索引
所有详细文档已重构到 `docs/` 目录：

```
docs/
├── README.md                      # 文档入口
├── architecture/                  # 架构文档
├── features/                      # 功能文档
├── development/                   # 开发文档
├── config/                        # 配置文档
├── reference/                     # 参考文档
└── code-style.md                  # 代码规范
```

### 主要文档链接
- **[架构文档](docs/architecture/)** - 项目架构和设计
- **[功能文档](docs/features/)** - 所有功能详细说明
- **[开发文档](docs/development/)** - 开发指南和最佳实践
- **[配置文档](docs/config/)** - 配置文件说明
- **[参考文档](docs/reference/)** - 文件结构和 API 参考
- **[代码规范](docs/code-style.md)** - 编码规范和约定

## 代码风格规范

项目遵循严格的代码风格规范：
- 使用 ES6+ 函数式风格，禁止 `class`
- Vue 组件使用 `<script setup>` 语法
- 工具类采用对象字面量形式
- 详细的命名规范和格式要求

完整规范请查看 [docs/code-style.md](docs/code-style.md)。

## 许可证

项目采用 AGPL-3.0-only 许可证。

---

*本文档最后更新：2026-04-19*  
*文档版本：2.1.0（更新通知系统、用户网盘名单重构）*