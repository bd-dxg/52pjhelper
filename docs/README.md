# 52pjhelper 项目文档

欢迎来到 52pjhelper 项目文档中心！这是一个基于 WXT 框架构建的浏览器扩展，专为提升吾爱破解论坛(52pojie.cn)管理效率而设计。

## 快速导航

- **[项目概述](#项目概述)** - 项目简介和目标
- **[快速开始](#快速开始)** - 新开发者入门指南
- **[文档目录](#文档目录)** - 完整的文档结构
- **[贡献指南](#贡献指南)** - 如何参与项目开发

## 项目概述

52pjhelper 是一个现代化的浏览器扩展，为吾爱破解论坛的管理员和版主提供高效的管理工具。项目采用最新的前端技术栈，注重代码质量和开发体验。

### 核心价值

- **提高管理效率**：自动化重复性管理任务
- **优化用户体验**：提供便捷的功能开关和配置
- **代码质量优先**：采用现代化的开发实践和架构
- **易于扩展**：模块化设计，便于添加新功能

### 技术特色

- 🚀 基于 WXT 框架的现代浏览器扩展
- 💪 TypeScript 类型安全
- 🎯 Vue 3 组合式 API
- 📦 模块化架构设计
- 🧪 完善的测试体系

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Git

### 安装步骤

1. 克隆项目

   ```bash
   # 使用项目实际仓库 URL 替换 <repository-url>
   git clone <repository-url>
   cd 52pjhelper
   ```

2. 安装依赖

   ```bash
   pnpm install
   ```

3. 类型检查
   ```bash
   npx tsc --noEmit
   npx vue-tsc --noEmit
   ```

### 开发命令

```bash
# 安装依赖
pnpm install

# 类型检查
npx tsc --noEmit
npx vue-tsc --noEmit
```

**重要提示**：禁止运行 `pnpm dev` 和 `pnpm build` 命令，这些命令会启动开发服务器或构建项目，可能导致不必要的资源占用。如需构建或运行项目，请手动执行。

## 文档目录

### 架构文档

了解项目的整体架构和设计理念。

- [架构概述](architecture/overview.md) - 项目整体架构
- [Content Script 架构](architecture/content-script.md) - Content Script 模块化设计
- [技术栈详解](architecture/technical-stack.md) - 使用的技术和工具
- [模块结构](architecture/module-structure.md) - 代码模块组织

### 功能文档

详细了解每个功能的设计和实现。

#### 通用功能

- [通用功能组](features/general-features.md) - 楼层高亮、原生楼层、重贴检测
- [导航菜单管理](features/navigation-management.md) - 自定义显示/隐藏导航菜单
- [深色主题支持](features/dark-theme.md) - 自动主题检测和切换
- [紧凑布局](features/compact-layout.md) - 优化组件布局

#### 后台管理功能

- [后台管理功能组](features/admin-features.md) - 头像查询、快捷回复、自动填充、用户黑名单等
- [头像查询](features/avatar-query.md) - 鼠标悬停显示用户违规记录
- [快捷回复](features/quick-reply.md) - 举报处理页面快捷回复
- [自动填充](features/auto-fill.md) - 智能表单自动填充
- [全选功能](features/select-all.md) - 批量操作工具
- [分表选择器](features/table-selector.md) - 按钮式分表选择界面
- [管理页面查询](features/user-link-query.md) - 用户链接违规查询
- [勾选范围](features/row-click-to-check.md) - 点击表格行勾选复选框
- [灌水筛选](features/content-filter.md) - 可拖动的过滤卡片
- [重复发帖检测](features/duplicate-post-detection.md) - 高亮显示重复发帖
- [用户黑名单](features/admin-features.md#10-用户黑名单) - 高亮显示黑名单用户并显示网盘信息

### 开发文档

开发指南和最佳实践。

- [快速开始](development/getting-started.md) - 新开发者入门指南
- [开发命令](development/commands.md) - 所有可用的开发命令
- [自动导入机制](development/auto-import.md) - 无需显式导入的 API
- [可组合函数式架构](development/composable-architecture.md) - Vue 3 组合式 API
- [通信机制](development/communication.md) - Popup 与 Content Script 通信
- [组件开发指南](development/component-guide.md) - 功能开关组件规范
- [通知系统指南](development/notification-system.md) - 统一的通知系统使用
- [通知系统迁移指南](development/notification-migration.md) - 从旧系统迁移到新系统
- [最佳实践](development/best-practices.md) - 开发经验和建议

### 配置文档

项目配置文件和存储键管理。

- [配置概述](config/overview.md) - 配置文件结构
- [导航配置](config/navigation-config.md) - 导航菜单配置
- [功能配置](config/feature-configs.md) - 所有功能配置文件
- [存储键规范](config/storage-keys.md) - 存储键命名规范

### 参考文档

详细的文件参考和 API 文档。

- [文件结构参考](reference/file-structure.md) - 项目文件结构
- [组件参考](reference/components.md) - 所有 Vue 组件
- [工具类参考](reference/utils.md) - 工具函数和类
- [配置文件参考](reference/configs.md) - 所有 JSON 配置文件

### 代码规范

- [代码风格规范](code-style.md) - 编码规范和约定

## 贡献指南

我们欢迎所有形式的贡献！以下是参与项目开发的一些指南。

### 报告问题

1. 在提交问题前，请先搜索是否已有类似问题
2. 使用问题模板提供详细信息
3. 包括复现步骤、预期行为和实际行为

### 提交代码

1. Fork 项目并创建特性分支
2. 遵循代码风格规范
3. 添加或更新测试
4. 确保所有测试通过
5. 提交清晰的提交信息

### 开发流程

1. **讨论功能**：在开始编码前讨论设计
2. **编写测试**：测试驱动开发
3. **代码审查**：所有更改都需要审查
4. **持续集成**：确保 CI 通过

### 代码规范

- 使用 TypeScript 和严格的类型检查
- 遵循 ESLint 和 Prettier 配置
- 编写清晰的注释和文档
- 保持函数单一职责

## 许可证

本项目采用 AGPL-3.0-only 许可证。详见 [LICENSE](../LICENSE) 文件。

## 获取帮助

- 📖 **文档**：查看相关文档页面
- 🐛 **问题**：在 GitHub Issues 报告问题
- 💬 **讨论**：参与项目讨论
- 🔧 **开发**：查看开发文档获取技术帮助

---

_最后更新：2026-04-18_  
_文档版本：1.0.1（更新用户黑名单模块化重构）_
