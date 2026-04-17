# 项目文件结构参考

本文档详细介绍了项目的文件结构和各个目录的用途。

## 项目根目录结构

```
52pjhelper/
├── src/                    # 源代码目录
├── docs/                   # 项目文档
├── public/                 # 静态资源
├── tests/                  # 测试文件
├── Task/                   # 任务规划文件
├── node_modules/           # 依赖包
├── .gitignore             # Git 忽略文件
├── .oxfmt.json            # 代码格式化配置
├── .oxlint.json           # 代码检查配置
├── CLAUDE.md              # 精简版项目指南
├── CLAUDE_ORIGINAL.md     # 原始完整文档备份
├── originalVersionClaude.md # 原始版本备份
├── package.json           # 项目配置和依赖
├── tsconfig.json          # TypeScript 配置
├── wxt.config.ts          # WXT 框架配置
└── README.md              # 项目说明
```

## 源代码目录结构 (`src/`)

### 核心目录

```
src/
├── entries/               # 浏览器扩展入口点
├── pages/                # Vue 页面组件
├── components/           # Vue 可复用组件
├── composables/          # Vue 可组合函数
├── utils/                # 工具函数和类
├── configs/              # JSON 配置文件
├── types/                # TypeScript 类型定义
├── assets/               # 静态资源（图片、样式等）
└── styles/               # 全局样式文件
```

### 入口点目录 (`src/entries/`)

```
src/entries/
├── content.ts            # Content Script 主入口
├── popup/               # Popup 页面入口
│   ├── main.ts          # Popup 主入口
│   └── App.vue          # Popup 根组件
├── background.ts        # Background Script 入口
└── options/             # 选项页面入口
    ├── main.ts          # 选项页面主入口
    └── App.vue          # 选项页面根组件
```

### Content Script 模块化结构

```
src/entries/contents/     # Content Script 模块化入口（已重构）
├── index.ts             # 主入口文件，协调各模块
├── initialization.ts    # 功能初始化模块
├── messageHandler.ts    # 消息处理器模块
├── storageListener.ts   # 存储监听器模块
└── modules/             # 功能模块目录
    ├── darkTheme.ts     # 深色主题模块
    ├── compactLayout.ts # 紧凑布局模块
    ├── avatarQuery.ts   # 头像查询模块
    └── ...              # 其他功能模块
```

### 页面目录 (`src/pages/`)

```
src/pages/
├── PopupPage.vue        # Popup 主页面
├── OptionsPage.vue      # 选项设置页面
└── components/          # 页面专用组件
    ├── FeatureToggle.vue # 功能开关组件
    ├── NavigationMenu.vue # 导航菜单组件
    └── SettingsPanel.vue # 设置面板组件
```

### 组件目录 (`src/components/`)

```
src/components/
├── common/              # 通用组件
│   ├── Button.vue       # 按钮组件
│   ├── Checkbox.vue     # 复选框组件
│   ├── Switch.vue       # 开关组件
│   ├── Input.vue        # 输入框组件
│   └── Card.vue         # 卡片组件
├── features/            # 功能相关组件
│   ├── DarkThemeToggle.vue # 深色主题开关
│   ├── CompactLayoutToggle.vue # 紧凑布局开关
│   └── NavigationSettings.vue # 导航设置组件
└── layout/              # 布局组件
    ├── Header.vue       # 页头组件
    ├── Sidebar.vue      # 侧边栏组件
    └── Footer.vue       # 页脚组件
```

### 可组合函数目录 (`src/composables/`)

```
src/composables/
├── useFeatureToggle.ts  # 功能切换可组合函数
├── useStorage.ts        # 存储操作可组合函数
├── useMessage.ts        # 消息通信可组合函数
├── useTheme.ts          # 主题管理可组合函数
├── useNavigation.ts     # 导航管理可组合函数
└── index.ts             # 统一导出文件
```

### 工具类目录 (`src/utils/`)

```
src/utils/
├── featureManager.ts    # 功能管理器
├── storageHelper.ts     # 存储操作辅助工具
├── messageHelper.ts     # 消息通信辅助工具
├── urlMatcher.ts        # URL 匹配工具
├── domHelper.ts         # DOM 操作辅助工具
├── validationHelper.ts  # 数据验证工具
└── index.ts             # 统一导出文件
```

### 配置文件目录 (`src/configs/`)

```
src/configs/
├── navigation.json      # 导航菜单配置
├── storage-keys.json    # 存储键命名规范
└── features/           # 功能配置文件
    ├── general.json    # 通用功能配置
    ├── admin.json      # 后台管理功能配置
    ├── auto-fill.json  # 自动填充功能配置
    └── ...             # 其他功能配置
```

### 类型定义目录 (`src/types/`)

```
src/types/
├── index.ts            # 类型定义主文件
├── feature.ts          # 功能相关类型
├── storage.ts          # 存储相关类型
├── message.ts          # 消息通信类型
├── config.ts           # 配置相关类型
└── dom.ts              # DOM 相关类型
```

### 样式目录 (`src/styles/`)

```
src/styles/
├── index.css           # 全局样式入口
├── variables.css       # CSS 变量定义
├── reset.css           # 样式重置
├── utilities.css       # 工具类样式
├── components/         # 组件样式
│   ├── button.css      # 按钮样式
│   ├── card.css        # 卡片样式
│   └── form.css        # 表单样式
└── themes/             # 主题样式
    ├── light.css       # 浅色主题
    └── dark.css        # 深色主题
```

## 文档目录结构 (`docs/`)

```
docs/
├── README.md                      # 文档入口
├── code-style.md                  # 代码风格规范
├── architecture/                  # 架构文档
│   ├── overview.md               # 架构概述
│   ├── content-script.md         # Content Script 架构
│   ├── technical-stack.md        # 技术栈详解
│   └── module-structure.md       # 模块结构
├── features/                      # 功能文档
│   ├── general-features.md       # 通用功能组
│   ├── admin-features.md         # 后台管理功能组
│   ├── navigation-management.md  # 导航菜单管理
│   ├── dark-theme.md             # 深色主题支持
│   ├── compact-layout.md         # 紧凑布局
│   ├── avatar-query.md           # 头像查询
│   ├── quick-reply.md            # 快捷回复
│   ├── auto-fill.md              # 自动填充功能
│   ├── select-all.md             # 全选功能
│   ├── table-selector.md         # 分表选择器
│   ├── user-link-query.md        # 管理页面查询
│   ├── row-click-to-check.md     # 勾选范围
│   ├── content-filter.md         # 灌水筛选
│   └── duplicate-post-detection.md # 重复发帖检测
├── development/                   # 开发文档
│   ├── getting-started.md        # 快速开始指南
│   ├── commands.md               # 开发命令指南
│   ├── auto-import.md            # 自动导入机制
│   ├── composable-architecture.md # 可组合函数式架构
│   ├── communication.md          # Popup与Content Script通信
│   ├── component-guide.md        # 功能开关组件规范
│   └── best-practices.md         # 开发最佳实践
├── config/                        # 配置文档
│   ├── overview.md               # 配置文件概述
│   ├── navigation-config.md      # 导航菜单配置
│   ├── feature-configs.md        # 功能配置文件
│   └── storage-keys.md           # 存储键命名规范
└── reference/                     # 参考文档
    ├── file-structure.md         # 项目文件结构（本文档）
    ├── components.md             # 所有Vue组件
    ├── utils.md                  # 工具函数和类
    └── configs.md                # 所有JSON配置文件
```

## 测试目录结构 (`tests/`)

```
tests/
├── unit/                         # 单元测试
│   ├── utils/                   # 工具函数测试
│   │   ├── featureManager.spec.ts
│   │   ├── storageHelper.spec.ts
│   │   └── messageHelper.spec.ts
│   ├── composables/             # 可组合函数测试
│   │   ├── useFeatureToggle.spec.ts
│   │   └── useStorage.spec.ts
│   └── components/              # 组件测试
│       ├── Button.spec.ts
│       ├── Checkbox.spec.ts
│       └── FeatureToggle.spec.ts
├── e2e/                         # 端到端测试
│   ├── popup.spec.ts            # Popup 页面测试
│   ├── content-script.spec.ts   # Content Script 测试
│   └── background.spec.ts       # Background Script 测试
└── fixtures/                    # 测试数据
    ├── users.json               # 用户测试数据
    ├── posts.json               # 帖子测试数据
    └── settings.json            # 设置测试数据
```

## 构建输出目录

### 开发构建输出

```
dist/
├── chrome-mv3-dev/              # Chrome 开发版本
│   ├── manifest.json           # 扩展清单
│   ├── background.js           # Background Script
│   ├── content.js              # Content Script
│   ├── popup.html              # Popup 页面
│   ├── popup.js                # Popup 脚本
│   ├── options.html            # 选项页面
│   ├── options.js              # 选项页面脚本
│   └── assets/                 # 静态资源
└── firefox-mv2-dev/             # Firefox 开发版本
    └── ...                     # 类似结构
```

### 生产构建输出

```
.output/
├── chrome-mv3/                  # Chrome 生产版本
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── options.html
│   ├── options.js
│   └── assets/
└── firefox-mv2/                 # Firefox 生产版本
    └── ...                     # 类似结构
```

## 配置文件说明

### 项目配置文件

| 文件 | 用途 | 重要字段 |
|------|------|----------|
| `package.json` | 项目配置和依赖管理 | `name`, `version`, `scripts`, `dependencies`, `devDependencies` |
| `tsconfig.json` | TypeScript 配置 | `compilerOptions`, `include`, `exclude` |
| `wxt.config.ts` | WXT 框架配置 | `manifest`, `runner`, `dev`, `build` |
| `.oxfmt.json` | 代码格式化配置 | `printWidth`, `tabWidth`, `singleQuote` |
| `.oxlint.json` | 代码检查配置 | `extends`, `rules` |

### Git 配置文件

| 文件 | 用途 |
|------|------|
| `.gitignore` | 指定 Git 忽略的文件和目录 |
| `.gitattributes` | 文件属性配置（如果有） |

## 重要文件说明

### 1. 入口文件

- `src/entries/content.ts` - Content Script 主入口
- `src/entries/popup/main.ts` - Popup 页面入口
- `src/entries/background.ts` - Background Script 入口

### 2. 核心工具文件

- `src/utils/featureManager.ts` - 功能管理器，统一管理所有功能
- `src/utils/storageHelper.ts` - 存储操作辅助工具
- `src/utils/messageHelper.ts` - 消息通信辅助工具

### 3. 可组合函数文件

- `src/composables/useFeatureToggle.ts` - 功能切换可组合函数
- `src/composables/useStorage.ts` - 存储操作可组合函数

### 4. 配置文件

- `src/configs/navigation.json` - 导航菜单配置
- `src/configs/features/general.json` - 通用功能配置

## 文件命名规范

### 1. 文件命名规则

| 文件类型 | 命名规范 | 示例 |
|----------|----------|------|
| Vue 组件 | PascalCase | `FeatureToggle.vue` |
| TypeScript 文件 | camelCase | `featureManager.ts` |
| 配置文件 | kebab-case | `navigation-config.json` |
| 测试文件 | `.spec.ts` 后缀 | `featureManager.spec.ts` |
| 样式文件 | kebab-case | `dark-theme.css` |

### 2. 目录命名规则

| 目录类型 | 命名规范 | 示例 |
|----------|----------|------|
| 源代码目录 | 小写复数 | `components/`, `utils/` |
| 功能模块目录 | 小写单数 | `feature/`, `module/` |
| 测试目录 | 小写 | `tests/`, `fixtures/` |
| 构建输出目录 | kebab-case | `chrome-mv3-dev/` |

## 文件组织原则

### 1. 按功能组织

```
src/
├── features/                    # 按功能组织
│   ├── dark-theme/             # 深色主题功能
│   │   ├── DarkThemeToggle.vue
│   │   ├── useDarkTheme.ts
│   │   └── dark-theme.css
│   ├── compact-layout/         # 紧凑布局功能
│   │   ├── CompactLayoutToggle.vue
│   │   ├── useCompactLayout.ts
│   │   └── compact-layout.css
│   └── ...                     # 其他功能
```

### 2. 按类型组织（当前结构）

```
src/
├── components/                 # 所有组件
├── composables/               # 所有可组合函数
├── utils/                     # 所有工具函数
└── styles/                    # 所有样式文件
```

### 3. 混合组织（推荐）

```
src/
├── components/                # 通用组件
├── features/                 # 功能相关代码
│   ├── dark-theme/          # 深色主题
│   │   ├── components/      # 功能专用组件
│   │   ├── composables/     # 功能专用可组合函数
│   │   └── styles/          # 功能专用样式
│   └── ...                  # 其他功能
├── utils/                    # 通用工具函数
└── styles/                   # 全局样式
```

## 文件查找指南

### 1. 查找组件

- 通用组件：`src/components/common/`
- 功能组件：`src/components/features/`
- 布局组件：`src/components/layout/`

### 2. 查找工具函数

- 核心工具：`src/utils/` 目录
- 功能相关工具：对应功能目录下的 `utils/` 子目录

### 3. 查找配置

- 导航配置：`src/configs/navigation.json`
- 功能配置：`src/configs/features/` 目录
- 存储键配置：`src/configs/storage-keys.json`

### 4. 查找类型定义

- 所有类型：`src/types/` 目录
- 按模块导入：`import type { Feature } from '@/types/feature'`

## 文件维护建议

### 1. 保持文件简洁

- 单个文件不超过 300 行
- 功能复杂的文件拆分为多个小文件
- 使用模块化组织代码

### 2. 统一导入导出

- 使用 `index.ts` 文件统一导出
- 避免深层嵌套导入
- 使用路径别名简化导入

### 3. 定期清理

- 删除未使用的文件和代码
- 合并重复的代码
- 更新过时的依赖

## 相关文档

- [所有Vue组件](./components.md) - Vue 组件详细说明
- [工具函数和类](./utils.md) - 工具函数详细说明
- [所有JSON配置文件](./configs.md) - 配置文件详细说明

---

*文档版本：1.0.0*  
*最后更新：2026-04-17*