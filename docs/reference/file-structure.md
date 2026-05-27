# 项目文件结构参考

本文档详细介绍了项目的文件结构和各个目录的用途。

## 项目根目录结构

```
52pjhelper/
├── src/                    # 源代码目录
├── docs/                   # 项目文档
├── public/                 # 静态资源
├── dist/                   # 开发构建输出
├── Task/                   # 任务规划文件
├── node_modules/           # 依赖包
├── .gitignore             # Git 忽略文件
├── .oxfmtrc.json          # 代码格式化配置
├── CLAUDE.md              # 精简版项目指南
├── LICENSE                # AGPL-3.0 许可证
├── README.md              # 项目说明
├── index.html             # HTML 入口
├── originalVersionClaude.md # 原始版本备份
├── package.json           # 项目配置和依赖
├── pnpm-lock.yaml         # pnpm 锁文件
├── tsconfig.json          # TypeScript 配置
└── wxt.config.ts          # WXT 框架配置
```

## 源代码目录结构 (`src/`)

### 核心目录

```
src/
├── entries/               # 浏览器扩展入口点
├── pages/                # Vue 页面组件
├── components/           # 共享 Vue 组件
├── composables/          # Vue 可组合函数
├── features/             # 功能模块（自包含）
├── utils/                # 共享工具函数
├── styles/               # 全局样式文件
└── vite-env.d.ts         # Vite 环境类型声明
```

> **注意**：`src/configs/`、`src/types/`、`src/assets/` 目录已移除。配置文件现分散在各 `src/features/<name>/config.json` 中，类型定义内联于各模块。

### 入口点目录 (`src/entries/`)

```
src/entries/
├── popup/                # Popup 页面入口
│   ├── index.html        # Popup HTML 模板
│   ├── main.ts           # Popup 主入口
│   └── App.vue           # Popup 根组件
├── contents/             # Content Script 模块化入口
│   ├── index.ts          # 主入口，协调各模块
│   ├── initialization.ts # 功能初始化模块
│   ├── messageHandler.ts # 消息处理器模块
│   └── storageListener.ts # 存储监听器模块
└── background/           # Background Script 入口
    └── index.ts          # Background 主入口
```

### 页面目录 (`src/pages/`)

```
src/pages/
└── SettingsPanel.vue     # 设置面板页面
```

### 功能模块目录 (`src/features/`)

每个功能模块为自包含目录，包含自身配置、逻辑和 UI 组件，模块间互不依赖。

```
src/features/
├── autofills/                    # 自动填充
│   ├── config.json              # 模块配置
│   ├── index.ts                 # 统一导出
│   ├── base.ts                  # 基础填充逻辑
│   ├── rateForm.ts              # 评分表单填充
│   ├── moderateForm.ts          # 审核表单填充
│   ├── reportForm.ts            # 举报表单填充
│   └── AutoFillToggle.vue      # 功能开关组件
├── avatarQuery/                  # 头像查询
│   ├── config.json
│   ├── utils.ts
│   └── AvatarQueryToggle.vue
├── contentFilter/                # 灌水筛选
│   ├── config.json
│   ├── config.ts                # 配置解析模块
│   ├── types.ts                 # 模块类型定义
│   ├── state.ts                 # 状态管理
│   ├── filtering.ts             # 过滤逻辑
│   ├── matcher.ts               # 匹配器
│   ├── storage.ts               # 存储操作
│   ├── ui.ts                    # UI 渲染
│   ├── index.ts
│   └── ContentFilterToggle.vue
├── defaultTime/                  # 默认时间填充
│   ├── config.json
│   ├── utils.ts
│   └── DefaultTimeToggle.vue
├── duplicatePostDetection/       # 重复发帖检测
│   ├── config.json
│   ├── utils.ts
│   └── DuplicatePostDetectionToggle.vue
├── duplicateReplyDetection/      # 重复回帖检测
│   ├── config.json
│   ├── utils.ts
│   └── DuplicateReplyDetectionToggle.vue
├── floorHighlighter/             # 楼层高亮
│   ├── config.json
│   ├── utils.ts
│   └── FloorHighlighterToggle.vue
├── nativeFloorDisplay/           # 原生楼层显示
│   ├── config.json
│   ├── utils.ts
│   └── NativeFloorDisplayToggle.vue
├── navigation/                   # 导航菜单管理
│   ├── config.json
│   ├── navigationHider.ts       # 导航隐藏逻辑
│   └── NavigationSettings.vue
├── quickReply/                   # 快捷回复
│   ├── config.json
│   ├── utils.ts
│   └── QuickReplyToggle.vue
├── rowClickToCheck/              # 勾选范围
│   ├── config.json
│   ├── utils.ts
│   └── RowClickToCheckToggle.vue
├── selectAll/                    # 全选功能
│   ├── config.json
│   ├── utils.ts
│   └── SelectAllToggle.vue
├── tableDataExtractor/           # 表格数据提取
│   ├── config.json
│   └── tableDataExtractor.ts
├── tableSelector/                # 分表选择器
│   ├── config.json
│   ├── utils.ts
│   └── TableSelectorToggle.vue
├── userCloudDiskList/            # 用户网盘名单
│   ├── config.json
│   ├── config.ts                # 配置解析
│   ├── types.ts                 # 模块类型定义
│   ├── data.ts                  # 数据处理
│   ├── factory.ts               # 工厂函数
│   ├── manager.ts               # 状态管理
│   ├── processing.ts            # 数据加工
│   ├── ui.ts                    # UI 渲染
│   ├── events.ts                # 事件处理
│   ├── index.ts
│   ├── UserCloudDiskListToggle.vue
│   └── CloudDiskListUpdateButton.vue
├── userLinkQuery/                # 管理页面查询
│   ├── config.json
│   ├── utils.ts
│   └── UserLinkQueryToggle.vue
└── versionCheck/                 # 版本更新检查
    ├── config.json
    ├── versionChecker.ts
    └── VersionCheck.vue
```

### 功能模块典型结构

```
src/features/<feature-name>/
├── config.json           # 功能配置（名称、描述、开关状态、目标页面等）
├── config.ts             # 配置解析（可选，复杂配置时使用）
├── types.ts              # 模块内部类型（可选）
├── utils.ts              # 功能逻辑（简单功能）
├── index.ts              # 统一导出（复杂功能）
└── <Feature>Toggle.vue   # 功能开关组件
```

### 共享组件目录 (`src/components/`)

```
src/components/
├── AdminFeaturesToggle.vue          # 后台管理功能组开关
├── GeneralFeaturesToggle.vue        # 通用功能组开关
├── Notification.vue                 # 通知组件
├── NotificationContainer.vue        # 通知容器组件
├── NotificationIcon.vue             # 通知图标组件
├── NotificationDemo.vue             # 通知演示组件
├── NotificationExampleToggle.vue    # 通知示例开关
└── TestNotificationToggle.vue       # 通知测试开关
```

### 可组合函数目录 (`src/composables/`)

```
src/composables/
├── useFeatureToggle.ts              # 功能切换可组合函数
├── useFeatureToggleWithNotification.ts  # 带通知的功能切换可组合函数
└── useNotification.ts               # 通知系统可组合函数
```

### 工具类目录 (`src/utils/`)

```
src/utils/
├── featureManager.ts        # 功能管理器
├── storageHelper.ts         # 存储操作辅助工具
├── messageHelper.ts         # 消息通信辅助工具
├── urlMatcher.ts            # URL 匹配工具
├── themeManager.ts          # 主题管理工具
├── userInfo.ts              # 用户信息工具
└── userViolationFetcher.ts  # 用户违规记录获取
```

### 样式目录 (`src/styles/`)

```
src/styles/
├── common.css               # 全局通用样式
├── toggle.css               # 开关组件样式
├── buttons.css              # 按钮样式
└── messages.css             # 消息/通知样式
```

## 文档目录结构 (`docs/`)

```
docs/
├── README.md                        # 文档入口
├── code-style.md                    # 代码风格规范
├── architecture/                    # 架构文档
│   ├── overview.md                 # 架构概述
│   ├── content-script.md           # Content Script 架构
│   ├── technical-stack.md          # 技术栈详解
│   └── module-structure.md         # 模块结构
├── features/                        # 功能文档
│   ├── admin-features.md           # 后台管理功能组
│   ├── auto-fill.md                # 自动填充功能
│   ├── avatar-query.md             # 头像查询
│   ├── compact-layout.md           # 紧凑布局
│   ├── content-filter.md           # 灌水筛选
│   ├── dark-theme.md               # 深色主题支持
│   ├── duplicate-post-detection.md # 重复发帖检测
│   ├── duplicate-reply-detection.md # 重复回帖检测
│   ├── general-features.md         # 通用功能组
│   ├── navigation-management.md    # 导航菜单管理
│   ├── quick-reply.md              # 快捷回复
│   ├── row-click-to-check.md       # 勾选范围
│   ├── select-all.md               # 全选功能
│   ├── table-selector.md           # 分表选择器
│   └── user-link-query.md          # 管理页面查询
├── development/                     # 开发文档
│   ├── getting-started.md          # 快速开始指南
│   ├── commands.md                 # 开发命令指南
│   ├── auto-import.md              # 自动导入机制
│   ├── composable-architecture.md  # 可组合函数式架构
│   ├── communication.md            # Popup与Content Script通信
│   ├── component-guide.md          # 功能开关组件规范
│   ├── notification-system.md      # 通知系统说明
│   ├── notification-migration.md   # 通知系统迁移指南
│   └── best-practices.md           # 开发最佳实践
├── config/                          # 配置文档
│   ├── overview.md                 # 配置文件概述
│   ├── navigation-config.md        # 导航菜单配置
│   ├── feature-configs.md          # 功能配置文件
│   └── storage-keys.md             # 存储键命名规范
└── reference/                       # 参考文档
    ├── file-structure.md           # 项目文件结构（本文档）
    ├── components.md               # 所有Vue组件
    ├── utils.md                    # 工具函数和类
    └── configs.md                  # 所有JSON配置文件
```

## 构建输出目录

### 开发构建输出

```
dist/
└── chrome-mv3-dev/                # Chrome 开发版本
    ├── manifest.json              # 扩展清单
    ├── contents.js                # Content Script
    ├── background.js              # Background Script
    ├── popup.html                 # Popup 页面
    ├── popup.js                   # Popup 脚本
    └── assets/                    # 静态资源
```

### 生产构建输出

```
.output/
└── chrome-mv3/                    # Chrome 生产版本
    ├── manifest.json
    ├── contents.js
    ├── background.js
    ├── popup.html
    ├── popup.js
    └── assets/
```

## 配置文件说明

### 项目配置文件

| 文件             | 用途                 | 重要字段                                                        |
| ---------------- | -------------------- | --------------------------------------------------------------- |
| `package.json`   | 项目配置和依赖管理   | `name`, `version`, `scripts`, `dependencies`, `devDependencies` |
| `tsconfig.json`  | TypeScript 配置      | `compilerOptions`, `include`, `exclude`                         |
| `wxt.config.ts`  | WXT 框架配置         | `manifest`, `runner`, `vite`                                   |
| `.oxfmtrc.json`  | 代码格式化配置       | 格式化规则                                                      |

### Git 配置文件

| 文件             | 用途                      |
| ---------------- | ------------------------- |
| `.gitignore`     | 指定 Git 忽略的文件和目录 |

## 路径别名

项目在 `wxt.config.ts` 中定义了以下路径别名：

| 别名       | 映射路径               | 用途                     |
| ---------- | ---------------------- | ------------------------ |
| `@`        | `src/`                 | 源代码根目录             |
| `@com`     | `src/components/`      | 共享组件                 |
| `@utils`   | `src/utils/`           | 共享工具函数             |
| `@ent`     | `src/entries/`         | 入口点目录               |
| `@pages`   | `src/pages/`           | 页面组件                 |
| `@features` | `src/features/`       | 功能模块                 |

> **已删除**：`@conf`（原指向 `src/configs/`，该目录已移除）

### 导入示例

```typescript
// 共享工具
import { storageHelper } from '@utils/storageHelper'
import Notification from '@com/Notification.vue'

// 功能模块配置（相对路径，模块内部使用）
import { contentFilterConfig } from './config'

// 功能模块配置（绝对路径，跨模块引用）
import config from '@features/quickReply/config.json'

// 可组合函数
import { useFeatureToggle } from '@/composables/useFeatureToggle'
```

## 重要文件说明

### 1. 入口文件

- `src/entries/contents/index.ts` - Content Script 主入口
- `src/entries/popup/main.ts` - Popup 页面入口
- `src/entries/background/index.ts` - Background Script 入口

### 2. 核心工具文件

- `src/utils/featureManager.ts` - 功能管理器，统一管理所有功能
- `src/utils/storageHelper.ts` - 存储操作辅助工具
- `src/utils/messageHelper.ts` - 消息通信辅助工具
- `src/utils/urlMatcher.ts` - URL 匹配工具
- `src/utils/themeManager.ts` - 主题管理工具
- `src/utils/userInfo.ts` - 用户信息工具
- `src/utils/userViolationFetcher.ts` - 用户违规记录获取

### 3. 可组合函数文件

- `src/composables/useFeatureToggle.ts` - 功能切换可组合函数
- `src/composables/useFeatureToggleWithNotification.ts` - 带通知的功能切换
- `src/composables/useNotification.ts` - 通知系统可组合函数

### 4. 功能模块配置文件

每个功能模块通过 `config.json` 声明自身配置，格式示例：

```json
{
  "name": "功能名称",
  "description": "功能描述",
  "defaultEnabled": true,
  "storageKey": "功能存储键",
  "targetPages": ["目标页面URL片段"]
}
```

## 文件命名规范

### 1. 文件命名规则

| 文件类型         | 命名规范        | 示例                               |
| ---------------- | --------------- | ---------------------------------- |
| Vue 组件         | PascalCase      | `FloorHighlighterToggle.vue`       |
| TypeScript 文件  | camelCase       | `featureManager.ts`                |
| 配置文件         | camelCase       | `config.json`                      |
| 测试文件         | `.spec.ts` 后缀 | `featureManager.spec.ts`           |
| 样式文件         | kebab-case      | `common.css`                       |

### 2. 目录命名规则

| 目录类型       | 命名规范   | 示例                          |
| -------------- | ---------- | ----------------------------- |
| 源代码目录     | 小写复数   | `components/`, `utils/`       |
| 功能模块目录   | camelCase  | `avatarQuery/`, `contentFilter/` |
| 测试目录       | 小写       | `tests/`, `fixtures/`         |
| 构建输出目录   | kebab-case | `chrome-mv3-dev/`             |

## 文件组织原则

项目采用**功能模块化架构**，功能相关代码内聚在 `src/features/<name>/` 目录中：

```
src/
├── features/                         # 功能模块（自包含）
│   ├── contentFilter/               # 灌水筛选
│   │   ├── config.json              # 模块配置
│   │   ├── config.ts                # 配置解析
│   │   ├── types.ts                 # 模块类型
│   │   ├── filtering.ts             # 核心逻辑
│   │   ├── matcher.ts               # 匹配器
│   │   ├── storage.ts               # 存储
│   │   ├── ui.ts                    # UI 渲染
│   │   ├── state.ts                 # 状态管理
│   │   ├── index.ts                 # 统一导出
│   │   └── ContentFilterToggle.vue  # 功能开关组件
│   └── ...                          # 其他功能模块
├── components/                       # 共享 UI 组件
├── composables/                      # 共享可组合函数
├── utils/                            # 共享工具函数
└── styles/                           # 全局样式
```

## 文件查找指南

### 1. 查找功能代码

功能代码按模块组织在 `src/features/<name>/` 下：

- 功能开关组件：`src/features/<name>/<Name>Toggle.vue`
- 功能逻辑：`src/features/<name>/utils.ts` 或独立模块文件
- 功能配置：`src/features/<name>/config.json`

### 2. 查找共享组件

- 所有共享组件：`src/components/` 目录
- 功能组开关：`AdminFeaturesToggle.vue`（后台）、`GeneralFeaturesToggle.vue`（通用）
- 通知相关：`Notification*.vue`

### 3. 查找工具函数

- 共享工具：`src/utils/` 目录
- 功能专用工具：对应 `src/features/<name>/` 目录下

### 4. 查找配置

- 功能配置：`src/features/<name>/config.json`
- WXT 框架配置：`wxt.config.ts`
- TypeScript 配置：`tsconfig.json`

## 文件维护建议

### 1. 保持文件简洁

- 单个文件不超过 300 行
- 功能复杂的文件拆分为多个小文件
- 使用模块化组织代码

### 2. 统一导入导出

- 功能模块内部使用相对路径导入
- 跨模块引用使用路径别名（`@utils`、`@com` 等）
- 避免深层嵌套导入

### 3. 定期清理

- 删除未使用的文件和代码
- 合并重复的代码
- 更新过时的依赖

## 相关文档

- [所有Vue组件](./components.md) - Vue 组件详细说明
- [工具函数和类](./utils.md) - 工具函数详细说明
- [所有JSON配置文件](./configs.md) - 配置文件详细说明

---

_文档版本：2.0.0_
_最后更新：2026-05-28_
