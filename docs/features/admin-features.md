# 后台管理功能组

后台管理功能组专为论坛管理员和版主设计，提供高效的管理工具和自动化功能。

## 功能列表

### 1. 头像查询

鼠标移动到用户头像时，自动显示该用户的违规记录。

**功能特点**：

- 实时查询用户违规信息
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储

**使用场景**：

- 快速了解用户历史行为
- 辅助管理决策
- 提高审核效率

### 2. 快捷回复

在举报处理页面添加快捷回复短语下拉框。

**功能特点**：

- 预定义常用回复短语
- 支持自定义短语
- 一键插入回复内容

**预设短语**：

- "已经处理，感谢您对吾爱破解论坛的支持！"
- "欢迎分析讨论交流，吾爱破解论坛有你更精彩！"
- 更多短语可自定义添加

### 3. 自动填充

智能监控多种表单，满足条件时自动填充回复内容。

**支持的表单**：

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

**技术特点**：

- 使用 MutationObserver 监听动态创建的表单
- 使用配置驱动的表单检测机制，易于扩展
- 使用 WeakSet 防止重复绑定，避免内存泄漏

### 4. 全选功能

在管理页面添加"除第一条全选"按钮，方便批量操作。

**功能特点**：

- "除第一条全选"按钮，方便批量操作
- "删除"按钮，快速执行删除操作
- 支持启用/禁用功能切换

**使用场景**：

- 批量删除违规内容
- 快速选择多个项目
- 提高管理效率

### 5. 分表选择器优化

将分表选择器替换为按钮式界面，提高操作效率。

**优化内容**：

- 按钮式界面，提高操作效率
- 支持隐藏特定分表，简化界面
- 蛇形布局设计，优化按钮排列

**优势**：

- 减少点击次数
- 直观的分表状态显示
- 响应式布局，适应不同屏幕

### 6. 管理页面查询

在管理页面鼠标移动到用户名链接时，自动显示该用户的违规记录。

**目标页面**：

- `forum.php?mod=modcp&action=moderate&op=threads`

**功能特点**：

- 实时查询用户违规信息
- 非侵入式显示方式
- 支持启用/禁用功能切换

### 7. 重复回帖检测

在帖子详情页面检测当天内同一用户的多次回帖，高亮显示重复回帖的楼层。

**检测规则**：

- 自动检测帖子详情页面（https://www.52pojie.cn/thread-*-*-*.html）
- 检测当天内同一用户的多次回帖
- 高亮显示重复回帖的楼层，使用黄色背景和左侧橙色边框
- 楼层号变为红色加粗，更醒目

**技术特点**：

- 使用 UID 作为用户唯一标识，避免用户名重复
- 精确匹配日期部分，避免日期误匹配
- 集成通知系统，操作反馈更直观

**配置支持**：

- 配置文件：`src/features/duplicateReplyDetection/config.json`
- 支持启用/禁用功能切换
- 默认启用

### 8. 勾选范围

在管理页面上点击表格行（tr）来勾选对应的复选框，提高操作效率。

**兼容性**：

- 支持多种页面：帖子管理页面和回收站页面
- 兼容两种页面结构：单 tbody 多 tr 和多 tbody 单 tr
- 复选框选择器支持 delete[] 和 moderate[] 两种 name 属性

**智能排除**：

- 排除有 class 属性的 tr 元素（如表头、空行等）
- 防止点击行内超链接或按钮时触发复选框勾选
- 使用 WeakSet 防止重复绑定，避免内存泄漏

### 9. 灌水筛选

在管理页面创建可拖动的过滤卡片，自动筛选灌水内容。

**过滤功能**：

- 支持两种匹配模式：正则表达式和简单文本匹配
- 一行一个条件，满足任意条件即可高亮
- 匹配目标：`#moderate tbody .xg1` 元素的文本内容

**智能限制**：

- 文本长度限制：超过 12 个汉字的文本不进行匹配
- 触发时机：失去卡片焦点时开始匹配
- 匹配成功后高亮对应的表格行（`#moderate > table > tbody > tr`）

**预设规则**：

- 常见灌水：匹配常见灌水关键词（mark、推荐、好用、支持、给力等）
- 标点数字灌水：匹配连续数字、感叹号、波浪号等

**存储功能**：

- 卡片位置和过滤规则自动保存到浏览器存储
- 支持动态添加/删除过滤条件
- 支持启用/禁用功能切换

### 10. 用户网盘名单

高亮显示网盘名单用户，鼠标悬停时显示用户的网盘信息。

详细文档请查看：[用户网盘名单详解](user-cloud-disk-list.md)

### 11. 版本更新检查

通过浏览器定时器定期检查新版本，提醒用户更新。

**检查机制**：

- 通过浏览器定时器（alarms API）定期检查新版本（默认 24 小时）
- 通过浏览器通知（notifications API）提醒用户更新
- 在设置页面显示 UpdateBanner 横幅提示

**用户控制**：

- 支持忽略特定版本的更新提示
- 扩展安装/更新时自动执行检查
- 提供立即检查更新功能

## 配置说明

### 存储键命名规范

所有后台管理功能使用统一的存储键命名规范：

- `avatarQueryEnabled` - 头像查询开关
- `quickReplyEnabled` - 快捷回复开关
- `autoFillEnabled` - 自动填充开关
- `selectAllEnabled` - 全选功能开关
- `tableSelectorEnabled` - 分表选择器开关
- `userLinkQueryEnabled` - 管理页面查询开关
- `duplicateReplyDetectionEnabled` - 重复回帖检测开关
- `rowClickToCheckEnabled` - 勾选范围开关
- `contentFilterEnabled` - 灌水筛选开关
- `userCloudDiskListEnabled` - 网盘名单开关
- `versionCheckEnabled` - 版本更新检查开关

### 默认状态

大多数后台管理功能默认启用，但用户可以根据需要关闭特定功能。

## 技术架构

### 组件结构

```
src/components/
├── AdminFeaturesToggle.vue      # 后台管理功能组组件
└── （各功能的 Toggle 组件已迁移至对应 features 目录）

src/features/
├── avatarQuery/
│   ├── config.json
│   ├── utils.ts
│   └── AvatarQueryToggle.vue
├── quickReply/
│   ├── config.json
│   ├── utils.ts
│   └── QuickReplyToggle.vue
├── autofills/
│   ├── config.json
│   ├── base.ts
│   ├── rateForm.ts
│   ├── moderateForm.ts
│   ├── reportForm.ts
│   ├── index.ts
│   └── AutoFillToggle.vue
├── selectAll/
│   ├── config.json
│   ├── utils.ts
│   └── SelectAllToggle.vue
├── tableSelector/
│   ├── config.json
│   ├── utils.ts
│   └── TableSelectorToggle.vue
├── userLinkQuery/
│   ├── config.json
│   ├── utils.ts
│   └── UserLinkQueryToggle.vue
├── duplicateReplyDetection/
│   ├── config.json
│   ├── utils.ts
│   └── DuplicateReplyDetectionToggle.vue
├── rowClickToCheck/
│   ├── config.json
│   ├── utils.ts
│   └── RowClickToCheckToggle.vue
├── contentFilter/
│   ├── config.json
│   ├── types.ts
│   ├── config.ts
│   ├── state.ts
│   ├── filtering.ts
│   ├── matcher.ts
│   ├── storage.ts
│   ├── ui.ts
│   ├── index.ts
│   └── ContentFilterToggle.vue
├── userCloudDiskList/
│   ├── config.json
│   ├── types.ts
│   ├── config.ts
│   ├── data.ts
│   ├── factory.ts
│   ├── manager.ts
│   ├── ui.ts
│   ├── processing.ts
│   ├── events.ts
│   ├── index.ts
│   ├── UserCloudDiskListToggle.vue
│   └── CloudDiskListUpdateButton.vue
└── versionCheck/
    ├── config.json
    ├── versionChecker.ts
    └── VersionCheck.vue
```

### 工具类支持

```
src/features/
├── avatarQuery/
│   ├── utils.ts                  # 头像查询管理
│   └── ...
├── userLinkQuery/
│   ├── utils.ts                  # 管理页面查询管理
│   └── ...
├── quickReply/
│   ├── utils.ts                  # 快捷回复管理
│   └── ...
├── autofills/                    # 自动填充模块化实现
│   ├── base.ts                   # 基础设施
│   ├── rateForm.ts               # 评分表单
│   ├── moderateForm.ts           # 处理表单
│   ├── reportForm.ts             # 举报表单
│   └── index.ts                  # 统一导出
├── selectAll/
│   ├── utils.ts                  # 全选功能管理
│   └── ...
├── tableSelector/
│   ├── utils.ts                  # 分表选择器管理
│   └── ...
├── duplicateReplyDetection/
│   ├── utils.ts                  # 重复回帖检测管理
│   └── ...
├── rowClickToCheck/
│   ├── utils.ts                  # 勾选范围管理
│   └── ...
├── contentFilter/                # 灌水筛选模块化实现
│   ├── types.ts                  # 类型定义
│   ├── config.ts                 # 配置常量
│   ├── state.ts                  # 状态管理
│   ├── filtering.ts              # 过滤逻辑
│   ├── matcher.ts                # 匹配引擎
│   ├── storage.ts                # 存储管理
│   ├── ui.ts                     # UI 实现
│   └── index.ts                  # 统一导出
├── userCloudDiskList/            # 用户网盘名单模块化实现
│   ├── types.ts                  # 类型定义
│   ├── config.ts                 # 配置常量
│   ├── data.ts                   # 数据加载和保存
│   ├── ui.ts                     # 样式和弹窗UI
│   ├── processing.ts             # 用户名处理和扫描
│   ├── events.ts                 # 事件监听
│   ├── manager.ts                # 核心管理器逻辑
│   ├── factory.ts                # 工厂函数
│   └── index.ts                  # 统一导出
└── versionCheck/
    ├── versionChecker.ts         # 版本更新检查
    └── ...
```

## 使用指南

### 功能启用

1. 打开扩展设置页面
2. 找到"后台管理功能"组
3. 点击对应功能的开关按钮
4. 在目标页面上功能自动生效

### 配置管理

- **快捷回复**：可以添加、删除、修改预设短语
- **自动填充**：可以配置触发条件和填充内容
- **灌水筛选**：可以自定义过滤规则和匹配模式
- **分表选择器**：可以隐藏不需要的分表

### 批量操作

- 使用"全选功能"快速选择多个项目
- 使用"勾选范围"点击行即可勾选
- 结合"删除"按钮进行批量删除

## 性能优化

### 内存管理

- 使用 WeakSet 防止重复绑定，避免内存泄漏
- 及时清理事件监听器
- 优化 DOM 查询性能

### 响应速度

- 使用防抖和节流优化频繁操作
- 缓存查询结果，减少重复请求
- 异步加载非关键资源

## 常见问题

### Q: 自动填充功能不生效怎么办？

A: 请检查是否在正确的页面上，以及表单结构是否符合预期。

### Q: 灌水筛选规则如何添加？

A: 在灌水筛选卡片中输入规则，一行一个条件，支持正则表达式。

### Q: 如何关闭版本更新提示？

A: 在版本更新提示横幅上点击"忽略此版本"。

### Q: 分表选择器按钮显示不全？

A: 可以隐藏不常用的分表，或者调整浏览器窗口大小。

### Q: 用户网盘名单数据如何更新？

A: 支持手动更新和自动检查更新（默认1天），数据自动从表格数据提取器加载。

### Q: 用户网盘名单功能支持哪些网盘厂商？

A: 支持百度、夸克、迅雷等多种网盘厂商，数据格式包含网盘ID和帖子链接。

## 相关文档

- [自动填充详解](auto-fill.md)
- [灌水筛选配置指南](content-filter.md)
- [用户网盘名单详解](user-cloud-disk-list.md)
- [组件开发指南](../development/component-guide.md)
- [可组合函数式架构](../development/composable-architecture.md)

---

_最后更新：2026-05-20_  
_文档版本：1.2.0（新增重复回帖检测功能，移除重复发帖检测功能）_
