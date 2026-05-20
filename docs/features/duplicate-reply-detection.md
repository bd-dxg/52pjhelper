# 重复回帖检测

## 功能概述

重复回帖检测功能在吾爱破解论坛帖子详情页面自动检测当天内同一用户的多次回帖，并通过高亮显示帮助管理员快速识别。使用 UID 作为用户唯一标识，精确匹配日期，避免误匹配。

## 功能特性

### 1. 智能重复检测

- 在帖子详情页面检测当天内同一用户的多次回帖
- 使用 UID 作为用户唯一标识，避免用户名重复
- 精确匹配日期部分，避免日期误匹配
- 支持所有帖子详情页面

### 2. 视觉高亮显示

- 高亮显示重复回帖的楼层，使用黄色背景
- 左侧添加橙色边框，更醒目
- 楼层号变为红色加粗，快速定位
- 样式与论坛主题协调

### 3. 功能开关控制

- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 默认启用，用户可根据需要关闭
- 集成通知系统，操作反馈更直观

### 4. 页面自动匹配

- 自动识别帖子详情页面
- 使用通配符匹配模式：`https://www.52pojie.cn/thread-*-*-*.html`
- 无需手动配置目标页面
- 支持所有帖子类型

## 技术实现

### 实现原理

1. **页面检测**：检测当前页面是否为帖子详情页面
2. **数据提取**：提取所有回帖的用户信息、楼层号、发帖时间
3. **日期过滤**：筛选出当天的回帖
4. **重复判断**：基于 UID 统计每个用户的回帖次数
5. **结果展示**：高亮显示重复回帖的楼层

### 代码结构

```
src/
├── utils/
│   └── duplicateReplyDetection.ts    # 核心逻辑
├── components/
│   └── DuplicateReplyDetectionToggle.vue # 功能开关组件
└── configs/
    └── duplicateReplyDetection.json   # 配置文件
```

### 核心逻辑

```typescript
// 重复回帖检测管理器
export function createDuplicateReplyDetection(): IDuplicateReplyDetection {
  // 获取所有回帖信息
  const getAllReplies = (): ReplyInfo[] => {
    const posts = Array.from(document.querySelectorAll('[id^="post_"]')).filter(p => {
      return !['post_reply', 'post_new', 'post_replytmp'].includes(p.id) &&
        !p.id.includes('post_rate')
    })

    return posts.map(post => {
      // 获取用户名、UID、楼层号、发帖时间
      // ...
    })
  }

  // 检测重复回帖
  const detectDuplicateReplies = (): void => {
    const todayStr = getTodayString()
    const allReplies = getAllReplies()

    // 筛选今天的回帖（精确匹配日期部分）
    const todayReplies = allReplies.filter(reply => {
      const replyDate = extractDateFromTime(reply.time)
      return replyDate === todayStr
    })

    // 统计每个用户今天的回帖次数
    const userReplyCount: Record<string, { count: number; replies: ReplyInfo[] }> = {}

    todayReplies.forEach(reply => {
      if (reply.uid !== 'N/A') {
        if (!userReplyCount[reply.uid]) {
          userReplyCount[reply.uid] = { count: 0, replies: [] }
        }
        userReplyCount[reply.uid].count++
        userReplyCount[reply.uid].replies.push(reply)
      }
    })

    // 找出今天回帖次数 > 1 的用户并高亮
    Object.values(userReplyCount).forEach(userData => {
      if (userData.count > 1) {
        userData.replies.forEach(reply => {
          reply.element.classList.add('duplicate-reply-highlight')
        })
      }
    })
  }
}
```

## 配置选项

### 配置文件

配置文件位于 `src/configs/duplicateReplyDetection.json`：

```json
{
  "name": "重复回帖检测",
  "description": "在帖子详情页面检测当天内同一用户的多次回帖，高亮显示重复回帖的楼层",
  "defaultEnabled": true,
  "storageKey": "duplicateReplyDetectionEnabled",
  "targetPages": [
    "https://www.52pojie.cn/thread-*-*-*.html"
  ]
}
```

### 配置说明

- **name**：功能显示名称
- **description**：功能描述
- **defaultEnabled**：默认启用状态
- **storageKey**：浏览器存储键名
- **targetPages**：目标页面匹配模式

### 存储键

- `duplicateReplyDetectionEnabled` - 功能启用状态

## 使用场景

### 1. 论坛内容管理

管理员可以快速识别帖子中同一用户的多次回帖，维护内容质量。

### 2. 灌水行为检测

通过检测同一用户的频繁回帖，识别可能的灌水行为。

### 3. 用户行为分析

分析用户的回帖模式，了解用户行为特征。

### 4. 内容质量监控

监控帖子内容质量，及时发现和处理重复回帖问题。

## 使用说明

### 启用/禁用功能

1. 打开扩展设置页面
2. 找到"后台管理功能"组
3. 点击"重复回帖检测"开关按钮
4. 状态立即生效，无需刷新页面

### 查看检测结果

1. 访问帖子详情页面
2. 如果有用户当天多次回帖，相关楼层会自动高亮
3. 高亮楼层显示黄色背景和左侧橙色边框
4. 楼层号变为红色加粗，更醒目

### 配置调整

如需修改目标页面匹配模式，可编辑配置文件：

```json
{
  "targetPages": [
    "https://www.52pojie.cn/thread-*-*-*.html",
    "https://www.52pojie.cn/forum.php?mod=viewthread*"
  ]
}
```

## 注意事项

### 1. 准确性考虑

- 使用 UID 作为用户唯一标识，避免用户名重复
- 精确匹配日期部分，避免日期误匹配
- 支持多种日期格式

### 2. 性能优化

- 仅在目标页面执行检测
- 使用高效的 DOM 查询
- 避免不必要的重复计算

### 3. 用户体验

- 高亮样式与论坛主题协调
- 支持启用/禁用功能切换
- 集成通知系统，操作反馈更直观

### 4. 兼容性

- 支持所有帖子详情页面
- 兼容论坛的动态加载机制
- 不影响其他功能的正常使用

## 相关功能

- **[灌水筛选](content-filter.md)** - 可拖动的过滤卡片
- **[勾选范围](row-click-to-check.md)** - 点击表格行勾选复选框
- **[全选功能](select-all.md)** - 批量操作工具

## 故障排除

### 常见问题

1. **检测无效**
   - 检查是否在帖子详情页面
   - 确认功能开关已启用
   - 检查目标页面配置是否正确

2. **误报**
   - 确认日期格式是否正确
   - 检查是否有其他干扰因素
   - 查看控制台是否有错误信息

3. **样式问题**
   - 检查是否有其他样式冲突
   - 确认浏览器支持相关 CSS 属性
   - 尝试刷新页面

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签页，查看检测日志
3. 使用 Elements 面板检查高亮样式
4. 检查存储中的配置值

## 版本历史

| 版本  | 日期       | 更新内容                               |
| ----- | ---------- | -------------------------------------- |
| 1.0.0 | 2026-05-20 | 初始版本，实现基本重复回帖检测功能     |

---

**相关链接**：

- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)
