# 灌水筛选

## 功能概述

灌水筛选功能在吾爱破解论坛管理页面（forum.php?mod=modcp&action=thread&op=post）创建可拖动的过滤卡片，帮助管理员快速识别和筛选灌水内容。支持正则表达式和简单文本匹配两种模式，提供灵活的过滤条件和智能匹配机制。

## 功能特性

### 1. 可拖动过滤卡片

- 在管理页面创建可拖动的过滤卡片界面
- 支持拖拽调整卡片位置
- 卡片位置自动保存到浏览器存储
- 提供直观的过滤条件管理界面

### 2. 双模式匹配引擎

- **正则表达式匹配**：支持复杂的模式匹配
- **简单文本匹配**：支持关键词和短语匹配
- **智能切换**：根据输入内容自动选择合适的匹配模式
- **性能优化**：优化匹配算法，提高处理效率

### 3. 灵活的过滤条件

- 一行一个条件，满足任意条件即可高亮
- 支持动态添加、编辑和删除过滤条件
- 条件支持启用/禁用状态控制
- 过滤规则自动保存到浏览器存储

### 4. 智能匹配机制

- **匹配目标**：`#moderate tbody .xg1` 元素的文本内容
- **文本长度限制**：超过12个汉字的文本不进行匹配
- **触发时机**：失去卡片焦点时开始匹配
- **匹配结果**：匹配成功后高亮对应的表格行（`#moderate > table > tbody > tr`）

### 5. 内置预设规则

- **常见灌水**：匹配常见灌水关键词（mark、推荐、好用、支持、给力等）
- **标点数字灌水**：匹配连续数字、感叹号、波浪号等
- **自定义规则**：支持用户自定义过滤规则
- **规则导入导出**：支持规则数据的导入和导出

### 6. 功能开关控制

- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理

1. **界面创建**：在管理页面创建可拖动的过滤卡片
2. **事件处理**：处理卡片拖拽、焦点、输入等事件
3. **匹配引擎**：实现双模式匹配算法
4. **结果展示**：高亮显示匹配的表格行
5. **存储管理**：保存卡片位置和过滤规则

### 代码结构

```
src/features/contentFilter/
├── config.json              # 配置文件
├── types.ts                 # 类型定义
├── config.ts                # 配置常量
├── state.ts                 # 状态管理
├── filtering.ts             # 过滤逻辑
├── matcher.ts               # 匹配引擎
├── storage.ts               # 存储管理
├── ui.ts                    # UI 实现
├── index.ts                 # 统一导出
└── ContentFilterToggle.vue  # 功能开关组件
```

### 核心逻辑

```typescript
// 匹配引擎实现
export class MatchingEngine {
  private rules: FilterRule[] = []

  // 添加规则
  addRule(rule: FilterRule): void {
    this.rules.push(rule)
  }

  // 执行匹配
  match(text: string): MatchResult {
    // 文本长度检查
    if (this.isTextTooLong(text)) {
      return { matched: false, matchedRules: [] }
    }

    const matchedRules: FilterRule[] = []

    for (const rule of this.rules) {
      if (!rule.enabled) continue

      let matched = false
      if (rule.type === 'regex') {
        matched = this.matchRegex(text, rule.pattern)
      } else {
        matched = this.matchText(text, rule.pattern)
      }

      if (matched) {
        matchedRules.push(rule)
      }
    }

    return {
      matched: matchedRules.length > 0,
      matchedRules,
    }
  }

  // 正则匹配
  private matchRegex(text: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i')
      return regex.test(text)
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error)
      return false
    }
  }

  // 文本匹配
  private matchText(text: string, pattern: string): boolean {
    return text.toLowerCase().includes(pattern.toLowerCase())
  }

  // 文本长度检查
  private isTextTooLong(text: string): boolean {
    // 中文字符计数
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
    return chineseChars.length > 12
  }
}
```

## 配置选项

### 功能开关配置

```json
{
  "contentFilter": {
    "enabled": true,
    "cardPosition": { "x": 100, "y": 100 },
    "defaultRules": ["常见灌水", "标点数字灌水"],
    "matchingMode": "auto",
    "highlightColor": "#fff3cd"
  }
}
```

### 卡片配置

- **位置配置**：卡片的初始位置和拖拽范围
- **尺寸配置**：卡片的宽度和高度
- **样式配置**：卡片的颜色、边框、阴影等样式
- **行为配置**：卡片的显示/隐藏、自动保存等行为

### 匹配配置

- **匹配模式**：`auto`（自动）、`regex`（正则）、`text`（文本）
- **高亮颜色**：匹配成功时的高亮颜色
- **匹配延迟**：输入后的匹配延迟时间（毫秒）
- **性能限制**：单次匹配的最大规则数量

### 存储键定义

- `52pjhelper:contentFilter:enabled` - 功能启用状态
- `52pjhelper:contentFilter:cardPosition` - 卡片位置
- `52pjhelper:contentFilter:rules` - 过滤规则
- `52pjhelper:contentFilter:config` - 功能配置

## 使用场景

### 1. 灌水内容识别

管理员可以快速识别论坛中的灌水内容，提高管理效率。

### 2. 批量内容审核

在处理大量内容时，可以快速筛选出需要重点关注的内容。

### 3. 规则学习和优化

通过分析匹配结果，不断优化过滤规则，提高识别准确率。

### 4. 团队协作管理

团队成员可以共享过滤规则，统一管理标准。

## 注意事项

### 1. 性能考虑

- 优化匹配算法，避免性能问题
- 实现防抖机制，减少频繁匹配
- 支持大型数据集的增量匹配
- 避免阻塞页面渲染

### 2. 准确性保障

- 提供规则验证机制，避免无效规则
- 支持规则测试功能，验证匹配效果
- 提供匹配统计，分析规则效果
- 支持误报反馈，持续优化规则

### 3. 用户体验

- 提供清晰的匹配结果展示
- 支持匹配结果的导出和分享
- 提供规则管理的便捷操作
- 确保界面响应迅速

### 4. 可扩展性

- 支持自定义匹配算法
- 提供插件机制，扩展匹配功能
- 支持第三方规则导入
- 提供API接口，支持外部调用

## 相关功能

- **[重复回帖检测](duplicate-reply-detection.md)** - 高亮显示当天内同一用户的多次回帖
- **[勾选范围](row-click-to-check.md)** - 点击表格行勾选复选框
- **[全选功能](select-all.md)** - 批量操作工具

## 故障排除

### 常见问题

1. **卡片不显示**
   - 检查是否在正确的管理页面
   - 确认功能开关已启用
   - 检查CSS样式是否正确加载
   - 查看是否有其他扩展冲突

2. **匹配无效**
   - 检查过滤规则是否正确
   - 确认匹配模式设置
   - 检查文本长度限制
   - 查看匹配目标元素是否存在

3. **性能问题**
   - 检查规则数量是否过多
   - 确认匹配算法是否优化
   - 查看是否有内存泄漏
   - 检查浏览器性能限制

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签页，查看错误信息
3. 使用 Performance 面板分析性能问题
4. 检查 Network 面板中的资源加载

## 版本历史

| 版本  | 日期       | 更新内容                     |
| ----- | ---------- | ---------------------------- |
| 1.0.0 | 2024-02-05 | 初始版本，实现基本过滤功能   |
| 1.1.0 | 2024-03-01 | 添加拖拽功能，优化界面设计   |
| 1.2.0 | 2024-03-25 | 支持双模式匹配，添加预设规则 |
| 1.3.0 | 2024-04-20 | 优化性能，添加规则导入导出   |

---

**相关链接**：

- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)
