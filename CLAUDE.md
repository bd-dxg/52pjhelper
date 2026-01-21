# 52pjhelper 项目配置

## 项目概述

这是一个基于 WXT 框架构建的浏览器扩展，旨在提升论坛管理效率。项目使用现代化的开发工具和架构，提供便捷的浏览器扩展开发体验。

## 技术栈

- **框架**: WXT ^0.20.13 - 现代化的浏览器扩展开发框架
- **语言**: TypeScript
- **包管理器**: pnpm
- **构建工具**: Vite（WXT 内置）

## 项目结构

```
52pjhelper/
├── entries/              # 入口文件目录
│   └── background.ts    # 后台脚本
├── components/          # React 组件目录
│   └── navConsole/      # 导航控制台组件
├── images/              # 图像资源
├── src/                 # 源代码目录（根据 wxt.config.ts 配置）
├── dist/                # 编译输出目录
├── index.html           # 扩展 popup 页面
├── package.json         # 项目依赖配置
├── pnpm-lock.yaml       # 依赖锁定文件
├── prettier.config.ts   # Prettier 格式化配置
└── wxt.config.ts        # WXT 框架配置
```

## 开发命令

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

### 安装依赖

```bash
pnpm install
```

## WXT 配置说明

项目配置文件 `wxt.config.ts` 内容：

```typescript
import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",           // 源代码目录
  outDir: "dist",          // 输出目录
  entrypointsDir: "entries", // 入口文件目录
});
```

## 核心功能

### 后台脚本 (`entries/background.ts`)

```typescript
export default defineBackground(() => {
  console.log("Hello world!");
});
```

### 导航控制台组件 (`components/navConsole/index.ts`)

待实现的导航控制台组件。

## 开发规范

### 文件操作规范

**核心原则**: 必须使用专用工具，禁止使用 Shell 命令操作文件

| 操作     | 必须使用       | 严格禁止                                   |
| -------- | -------------- | ------------------------------------------ |
| 创建文件 | **Write 工具** | `touch`、`New-Item`、`echo >`、`cat <<EOF` |
| 编辑文件 | **Edit 工具**  | `sed`、`awk`                               |
| 读取文件 | **Read 工具**  | `cat`、`head`、`tail`、`Get-Content`       |
| 搜索文件 | **Glob 工具**  | `find`、`Get-ChildItem`、`ls`              |
| 搜索内容 | **Grep 工具**  | `grep`、`rg`、`Select-String`              |

**Bash 工具仅用于**: 包管理（`pnpm install`）、版本控制（`git status`）等系统命令

### Git 操作规范

**原则**: 只允许读取，禁止修改

**允许**: `git log`、`git status`、`git diff`、`git branch`、`git show`

**禁止**: `git commit`、`git push`、`git pull`、`git merge`、`git rebase`、`git reset`

## 代码格式化

使用 Prettier 进行代码格式化，配置文件位于 `prettier.config.ts`。

## 浏览器支持

WXT 框架支持所有现代浏览器，包括：

- Chrome (最新版)
- Firefox (最新版)
- Edge (最新版)

## 许可证

项目采用 AGPL-3.0-only 许可证。
