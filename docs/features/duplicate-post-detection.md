# 重复发帖检测

## 功能概述

重复发帖检测功能在吾爱破解论坛列表页面自动检测当天发布的重复发帖，并通过高亮显示帮助管理员快速识别。支持精确匹配和模糊匹配目标页面，提供灵活的配置选项和智能的日期格式识别。

## 功能特性

### 1. 智能重复检测

- 在论坛列表页面检测当天发布的重复发帖
- 基于发帖内容和时间进行智能匹配
- 支持跨版块重复检测
- 提供详细的重复检测报告

### 2. 双模式页面匹配

- **精确匹配**：完全匹配指定的URL模式
- **模糊匹配**：匹配包含特定关键词的URL
- **动态配置**：配置文件支持动态修改目标页面
- **智能识别**：自动识别论坛页面结构

### 3. 日期格式智能识别

- 自动检测日期格式，支持多种格式：
  - `2026-01-27`（标准格式）
  - `2026-1-27`（简写格式）
  - 其他常见日期格式
- 支持自定义日期格式配置
- 提供日期解析和验证功能

### 4. 视觉高亮显示

- 高亮显示重复发帖的行，使用黄色背景
- 提供不同严重程度的高亮颜色
- 支持自定义高亮样式
- 提供悬停提示，显示重复详情

### 5. 功能开关控制

- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理

1. **页面检测**：检测当前页面是否为论坛列表页面
2. **内容提取**：提取帖子标题、作者、发布时间等信息
3. **重复判断**：基于内容和时间判断是否为重复发帖
4. **结果展示**：高亮显示重复发帖的行
5. **配置管理**：管理目标页面配置和功能设置

### 代码结构

```
src/
├── entries/
│   └── content/
│       └── features/
│           └── duplicate-post-detection/
│               ├── index.ts          # 功能入口文件
│               ├── detection-engine.ts # 检测引擎实现
│               ├── content-analyzer.ts # 内容分析器
│               ├── date-parser.ts    # 日期解析器
│               ├── highlight-manager.ts # 高亮管理器
│               └── config.ts         # 配置管理
```

### 核心逻辑

```typescript
// 重复发帖检测引擎
export class DuplicateDetectionEngine {
  private posts: PostInfo[] = []
  private config: DetectionConfig

  // 检测重复发帖
  detectDuplicates(): DetectionResult[] {
    const duplicates: DetectionResult[] = []
    const postMap = new Map<string, PostInfo[]>()

    // 按内容分组
    for (const post of this.posts) {
      const key = this.generateContentKey(post)
      if (!postMap.has(key)) {
        postMap.set(key, [])
      }
      postMap.get(key)!.push(post)
    }

    // 找出重复
    for (const [key, posts] of postMap) {
      if (posts.length > 1) {
        // 检查是否为同一天
        const sameDayPosts = this.filterSameDayPosts(posts)
        if (sameDayPosts.length > 1) {
          duplicates.push({
            contentKey: key,
            posts: sameDayPosts,
            detectionTime: new Date(),
          })
        }
      }
    }

    return duplicates
  }

  // 生成内容键
  private generateContentKey(post: PostInfo): string {
    // 基于标题和作者生成唯一键
    return `${post.title.toLowerCase().trim()}|${post.author}`
  }

  // 过滤同一天的帖子
  private filterSameDayPosts(posts: PostInfo[]): PostInfo[] {
    const today = new Date()
    return posts.filter(post => {
      const postDate = this.parseDate(post.publishTime)
      return this.isSameDay(postDate, today)
    })
  }

  // 日期解析
  private parseDate(dateStr: string): Date {
    // 支持多种日期格式
    const formats = ['yyyy-MM-dd', 'yyyy-M-d', 'yyyy/MM/dd', 'yyyy/M/d']

    for (const format of formats) {
      const date = this.tryParse(dateStr, format)
      if (date) return date
    }

    // 默认使用当前日期
    return new Date()
  }

  // 判断是否为同一天
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }
}
```

## 配置选项

### 功能开关配置

```json
{
  "duplicatePostDetection": {
    "enabled": true,
    "matchingMode": "fuzzy",
    "targetPages": ["forum.php?mod=forumdisplay*"],
    "dateFormats": ["yyyy-MM-dd", "yyyy-M-d"],
    "highlightColor": "#fff3cd",
    "similarityThreshold": 0.8
  }
}
```

### 检测配置

- **匹配模式**：`exact`（精确）、`fuzzy`（模糊）
- **目标页面**：需要检测的页面URL模式
- **日期格式**：支持的日期格式列表
- **相似度阈值**：内容相似度判断阈值（0-1）

### 高亮配置

- **高亮颜色**：重复发帖的高亮颜色
- **边框样式**：高亮边框样式
- **悬停效果**：鼠标悬停时的效果
- **动画效果**：高亮显示的动画效果

### 存储键定义

- `52pjhelper:duplicatePostDetection:enabled` - 功能启用状态
- `52pjhelper:duplicatePostDetection:config` - 功能配置
- `52pjhelper:duplicatePostDetection:cache` - 检测结果缓存

## 使用场景

### 1. 论坛内容管理

管理员可以快速识别论坛中的重复发帖，维护内容质量。

### 2. 批量内容审核

在处理大量新帖时，可以快速筛选出重复内容，提高审核效率。

### 3. 用户行为分析

通过分析重复发帖模式，了解用户行为特征。

### 4. 内容质量监控

监控论坛内容质量，及时发现和处理重复内容问题。

## 注意事项

### 1. 准确性考虑

- 优化内容相似度算法，提高检测准确性
- 支持自定义相似度阈值
- 提供误报反馈机制
- 持续优化检测规则

### 2. 性能优化

- 实现增量检测，避免全量扫描
- 使用缓存机制，减少重复计算
- 优化DOM操作，避免性能问题
- 支持大型数据集的检测

### 3. 用户体验

- 提供清晰的检测结果展示
- 支持检测结果的导出和分享
- 提供详细的重复杂信息
- 确保界面响应迅速

### 4. 隐私保护

- 仅分析公开的帖子信息
- 不收集用户隐私数据
- 遵守论坛的隐私政策
- 提供数据清理功能

## 相关功能

- **[灌水筛选](content-filter.md)** - 可拖动的过滤卡片
- **[勾选范围](row-click-to-check.md)** - 点击表格行勾选复选框
- **[全选功能](select-all.md)** - 批量操作工具

## 故障排除

### 常见问题

1. **检测无效**
   - 检查是否在正确的论坛列表页面
   - 确认功能开关已启用
   - 检查目标页面配置是否正确
   - 查看日期格式设置

2. **误报过多**
   - 调整相似度阈值
   - 优化内容匹配算法
   - 检查日期判断逻辑
   - 更新检测规则

3. **性能问题**
   - 检查帖子数量是否过多
   - 确认检测算法是否优化
   - 查看是否有内存泄漏
   - 检查浏览器性能限制

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签页，查看检测日志
3. 使用 Performance 面板分析性能问题
4. 检查 Network 面板中的请求情况

## 版本历史

| 版本  | 日期       | 更新内容                         |
| ----- | ---------- | -------------------------------- |
| 1.0.0 | 2024-02-10 | 初始版本，实现基本重复检测功能   |
| 1.1.0 | 2024-03-05 | 添加双模式页面匹配，优化检测算法 |
| 1.2.0 | 2024-03-30 | 支持多种日期格式，添加高亮配置   |
| 1.3.0 | 2024-04-25 | 优化性能，添加相似度阈值配置     |

---

**相关链接**：

- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)
