# 吾爱管理效率助手

一个专为吾爱破解论坛(52pojie.cn)设计的浏览器扩展，提供便捷的导航菜单管理功能，提升论坛管理效率。

## 功能特性

- **导航菜单管理**: 允许用户自定义显示/隐藏论坛顶部导航菜单
- **头像查询**: 鼠标移动到用户头像时，自动显示该用户的违规记录
- **深色主题支持**: 自动检测并适配系统主题（深色/浅色模式）
- **快捷回复**: 在举报处理页面添加快捷回复短语下拉框
- **楼层高亮**: 根据URL参数高亮指定楼层，提高管理效率
- **原生楼层显示**: 显示已结帖的原生楼层，方便管理悬赏贴
- **全选功能**: 在管理页面添加"除第一条全选"按钮，方便批量操作
- **分表选择器**: 将分表选择器替换为按钮式界面，提高操作效率
- **默认查询时间**: 将查询开始时间默认设置为2008-03-13，自动提交查询
- **管理页面查询**: 在管理页面鼠标移动到用户名链接时，自动显示该用户的违规记录
- **自动填充**: 智能监控多种表单，满足条件时自动填充回复内容
  - 评分表单（rateform）：根据评分自动填充
  - 处理表单（moderateform）：根据处理类型自动填充不同内容
  - 举报表单（reportform）：根据积分奖励自动填充
- **实时预览**: 点击按钮实时切换菜单显示/隐藏状态
- **用户信息缓存**: 在非 52pojie.cn 页面显示缓存的用户信息，避免显示"未登录 游客"字样
- **一键重置**: 支持恢复默认导航菜单配置
- **紧凑布局**: 优化了组件布局，描述文字移至悬停提示，减少页面滚动
- **样式统一管理**: 重构子组件样式管理，统一在父组件中管理，提高代码可维护性

## 安装与使用

### 开发模式

1. 安装依赖：
   ```bash
   pnpm install
   ```

2. 启动开发服务器：
   ```bash
   pnpm dev
   ```

3. 加载扩展：
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录下的 `dist/` 文件夹

### 生产构建

1. 构建生产版本：
   ```bash
   pnpm build
   ```

2. 打包扩展：
   ```bash
   pnpm zip
   ```

## 项目结构

```
52pjhelper/
├── src/
│   ├── components/              # Vue 3 组件目录
│   │   ├── NavigationSettings.vue     # 导航菜单设置组件
│   │   ├── AvatarQueryToggle.vue      # 头像查询功能开关组件
│   │   ├── QuickReplyToggle.vue       # 快捷回复功能开关组件
│   │   ├── FloorHighlighterToggle.vue # 楼层高亮功能开关组件
│   │   ├── NativeFloorDisplayToggle.vue # 原生楼层显示功能开关组件
│   │   ├── SelectAllToggle.vue          # 全选功能开关组件
│   │   ├── TableSelectorToggle.vue      # 分表选择器功能开关组件
│   │   ├── DefaultTimeToggle.vue        # 默认查询时间功能开关组件
│   │   ├── AutoFillToggle.vue           # 自动填充功能开关组件
│   │   └── UserLinkQueryToggle.vue      # 管理页面查询功能开关组件
│   ├── configs/                 # 配置文件目录
│   │   ├── navigation.json     # 导航菜单配置
│   │   ├── quickReply.json     # 快捷回复配置
│   │   ├── avatarQuery.json    # 头像查询配置
│   │   ├── selectAll.json      # 全选功能配置
│   │   ├── tableSelector.json  # 分表选择器配置
│   │   ├── defaultTime.json    # 默认查询时间配置
│   │   ├── autoFill.json       # 自动填充配置
│   │   └── userLinkQuery.json  # 管理页面查询配置
│   ├── entries/                 # 入口文件目录
│   │   ├── contents.ts         # Content Script（页面注入脚本）
│   │   └── popup/              # Popup 页面入口
│   │       ├── App.vue         # 根组件
│   │       ├── main.ts         # 入口文件
│   │       └── index.html      # HTML 模板
│   ├── pages/                  # 页面组件目录
│   │   └── SettingsPanel.vue   # 设置面板主组件（容器）
│   └── utils/                  # 工具类目录
│       ├── navigationHider.ts  # 导航菜单管理工具
│       ├── avatarQuery.ts       # 头像查询管理工具
│       ├── quickReply.ts        # 快捷回复管理工具
│       ├── floorHighlighter.ts  # 楼层高亮管理工具
│       ├── userInfo.ts          # 用户信息获取和缓存工具
│       ├── themeManager.ts      # 主题管理工具
│       ├── nativeFloorDisplay.ts # 原生楼层显示工具
│       ├── selectAll.ts         # 全选功能管理工具
│       ├── tableSelector.ts     # 分表选择器管理工具
│       ├── defaultTime.ts       # 默认查询时间管理工具
│       ├── autoFill.ts          # 自动填充管理工具
│       ├── userLinkQuery.ts     # 管理页面查询管理工具
│       └── userViolationFetcher.ts # 用户违规信息获取公共工具
├── public/                     # 静态资源
│   └── images/                 # 扩展图标
├── dist/                       # 编译输出目录
├── wxt.config.ts               # WXT 框架配置（含路径别名）
├── prettier.config.ts          # Prettier 配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 项目依赖
```

## 技术栈

- **框架**: WXT ^0.20.13（现代化浏览器扩展开发框架）
- **语言**: TypeScript ^5.9.3
- **UI 框架**: Vue ^3.5.27
- **构建工具**: Vite（WXT 内置）
- **包管理器**: pnpm@10.28.0
- **代码格式化**: Prettier ^3.8.0
- **浏览器支持**: Chrome (Manifest V3)

## 使用说明

### 导航菜单管理

1. 点击浏览器工具栏中的扩展图标
2. 在"导航菜单设置"选项卡中，点击菜单按钮可切换其显示/隐藏状态
3. 蓝色背景表示菜单当前可见，灰色背景表示菜单当前隐藏
4. 点击"重置为默认"按钮可恢复所有菜单的显示状态

### 头像查询

1. 在"更多设置"选项卡中，启用"头像查询"开关
2. 访问吾爱破解论坛，将鼠标移动到用户头像上
3. 自动显示该用户的违规记录（如有）

### 全选功能

1. 在"更多设置"选项卡中，启用"全选功能"开关
2. 访问管理页面（forum.php?mod=modcp&action=thread&op=post）
3. 页面会添加"除第一条 全选"按钮和"删除"按钮
4. 点击"除第一条 全选"按钮可以快速选择除第一条外的所有项目
5. 点击"删除"按钮可以执行删除操作

### 分表选择器

1. 在"更多设置"选项卡中，启用"分表选择"开关
2. 访问管理页面（forum.php?mod=modcp&action=thread&op=post）
3. 原始的分表选择器会被替换为按钮式界面
4. 按钮布局优化为蛇形排列，提高操作效率
5. 支持隐藏特定分表，简化界面

### 默认查询时间

1. 在"更多设置"选项卡中，启用"默认时间"开关
2. 访问管理页面（forum.php?mod=modcp&action=thread&op=post）
3. 查询开始时间会自动设置为2008-03-13
4. 页面会自动提交查询，确保时间切换生效

### 管理页面查询

1. 在"更多设置"选项卡中，启用"管理页面查询"开关
2. 访问管理页面（forum.php?mod=modcp&action=moderate&op=threads）
3. 将鼠标移动到用户名链接上
4. 自动显示该用户的违规记录（如有）

### 自动填充

1. 在"更多设置"选项卡中，启用"自动填充"开关
2. 功能会自动监控以下表单并智能填充：

**评分表单（rateform）**
- 当 `score2`（威望）输入框的值大于 0 时
- 或 `score6`（热心值）输入框的值等于 1 时
- 自动在 `reason` 输入框填入："已经处理，感谢您对吾爱破解论坛的支持！"

**处理表单（moderateform）**
- 当选择"已答复"时，自动填入："欢迎分析讨论交流，吾爱破解论坛有你更精彩！"
- 当选择"已处理"时，自动填入："已经处理，感谢您对吾爱破解论坛的支持！"

**举报表单（reportform）**
- 当任一积分奖励下拉框选择正数值（如 +1, +2, +5 等）时
- 自动在对应的消息输入框填入："已经处理，感谢您对吾爱破解论坛的支持！"

### 主题切换

- 扩展会自动检测并适配系统主题
- 当系统切换深色/浅色模式时，扩展界面会自动跟随变化

## 许可证

项目采用 AGPL-3.0-only 许可证。
