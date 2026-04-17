# 自动填充功能

自动填充功能智能监控多种表单，满足条件时自动填充回复内容，大幅提高管理效率。

## 功能概述

自动填充功能通过监控页面上的表单元素，在特定条件下自动填充预设的回复内容，减少重复性输入工作。

## 支持的表单类型

### 1. 评分表单（rateform）
**监控目标**：`score2`（威望）和 `score6`（热心值）输入框

**触发条件**：
- 当 `score2 > 0`（给予正威望）
- 或 `score6 = 1`（给予热心值）

**填充内容**：
```
已经处理，感谢您对吾爱破解论坛的支持！
```

**使用场景**：
- 对优秀内容进行评分时
- 奖励热心帮助的用户时
- 快速完成评分操作

### 2. 处理表单（moderateform）
**监控目标**：`typeid` 下拉框的选项

**触发条件**：
- 选择"已答复"选项
- 选择"已处理"选项

**填充内容**：
- 选择"已答复"时：
  ```
  欢迎分析讨论交流，吾爱破解论坛有你更精彩！
  ```
- 选择"已处理"时：
  ```
  已经处理，感谢您对吾爱破解论坛的支持！
  ```

**使用场景**：
- 处理用户举报时
- 审核帖子内容时
- 快速选择处理结果并添加说明

### 3. 举报表单（reportform）
**监控目标**：所有 `select[name*="creditsvalue"]` 元素

**触发条件**：
- 当选择正数值（如 +1, +2, +5 等）

**填充内容**：
```
已经处理，感谢您对吾爱破解论坛的支持！
```

**填充目标**：对应的 `input[name*="msg"]` 输入框

**使用场景**：
- 处理用户举报并给予奖励时
- 快速完成举报处理流程

## 技术实现

### 监控机制
```typescript
// 使用 MutationObserver 监听动态创建的表单
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      // 检查新添加的节点中是否有目标表单
      checkAndBindForms(mutation.addedNodes)
    }
  })
})

// 监听整个文档的变化
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
})
```

### 表单检测
采用配置驱动的表单检测机制，易于扩展新的表单类型：

```typescript
const formConfigs = [
  {
    type: 'rateform',
    selector: 'form[name="rateform"]',
    fields: [
      { name: 'score2', condition: (value) => parseInt(value) > 0 },
      { name: 'score6', condition: (value) => parseInt(value) === 1 }
    ],
    message: '已经处理，感谢您对吾爱破解论坛的支持！'
  },
  // 更多表单配置...
]
```

### 内存管理
使用 WeakSet 防止重复绑定，避免内存泄漏：

```typescript
const boundForms = new WeakSet<HTMLFormElement>()

function bindFormEvents(form: HTMLFormElement) {
  if (boundForms.has(form)) {
    return // 避免重复绑定
  }
  
  boundForms.add(form)
  // 绑定事件监听器...
}
```

## 配置管理

### 配置文件
自动填充的配置存储在 `src/configs/autoFill.json`：

```json
{
  "name": "自动填充",
  "description": "智能监控多种表单，满足条件时自动填充回复内容",
  "defaultEnabled": true,
  "storageKey": "autoFillEnabled",
  "targetPages": [
    "https://www.52pojie.cn/forum.php?mod=misc*",
    "https://www.52pojie.cn/forum.php?mod=modcp*"
  ]
}
```

### 存储键
- `autoFillEnabled` - 功能开关状态
- `autoFillMessages` - 自定义填充内容（可选）

## 使用指南

### 启用功能
1. 打开扩展设置页面
2. 找到"自动填充"功能开关
3. 点击启用按钮
4. 在支持的表单页面上功能自动生效

### 自定义配置
目前支持以下自定义选项：

1. **启用/禁用特定表单类型**（计划中）
2. **修改填充内容**（计划中）
3. **添加新的表单规则**（需要代码修改）

### 验证功能
启用功能后，可以：
1. 打开一个评分页面
2. 输入正数的威望值
3. 观察是否自动填充了回复内容
4. 测试其他表单类型

## 高级功能

### 动态表单检测
自动填充功能能够检测动态创建的表单，即使表单在页面加载后通过 JavaScript 添加。

### 条件匹配
支持复杂的条件匹配逻辑，包括：
- 数值比较（大于、等于、小于）
- 字符串匹配
- 多条件组合

### 错误处理
- 表单元素不存在时静默失败
- 网络错误时重试机制
- 配置错误时使用默认值

## 性能优化

### 延迟加载
表单检测和事件绑定在页面加载完成后进行，不影响初始加载速度。

### 选择性监控
只监控包含目标表单的页面区域，减少不必要的 DOM 遍历。

### 事件委托
使用事件委托减少事件监听器数量，提高性能。

## 常见问题

### Q: 为什么自动填充没有生效？
A: 请检查：
1. 功能是否已启用
2. 是否在正确的页面上
3. 表单结构是否符合预期
4. 浏览器控制台是否有错误信息

### Q: 如何添加新的表单类型？
A: 需要修改源代码中的表单配置数组，添加新的配置项。

### Q: 自动填充会影响表单的正常提交吗？
A: 不会，自动填充只修改输入框的值，不影响表单的提交逻辑。

### Q: 可以禁用特定类型的表单填充吗？
A: 当前版本不支持，但可以在配置文件中注释掉对应的配置项。

### Q: 填充内容可以自定义吗？
A: 当前使用预设内容，未来版本计划支持自定义。

## 开发扩展

### 添加新的表单类型
1. 在 `src/configs/autoFill.json` 中添加目标页面
2. 在 `src/utils/autoFill.ts` 中添加表单配置
3. 实现表单检测和事件绑定逻辑
4. 添加测试用例

### 修改填充逻辑
1. 更新表单配置中的条件判断
2. 修改消息内容
3. 调整触发时机

## 相关文档
- [后台管理功能组](admin-features.md)
- [可组合函数式架构](../development/composable-architecture.md)
- [MutationObserver API 参考](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)
- [组件开发指南](../development/component-guide.md)

---

*最后更新：2026-04-17*  
*文档版本：1.0.0*