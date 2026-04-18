# 管理页面查询

## 功能概述

管理页面查询功能在吾爱破解论坛管理页面（forum.php?mod=modcp&action=moderate&op=threads）中，当鼠标移动到用户名链接时，自动显示该用户的违规记录。这帮助管理员快速了解用户的违规历史，提高管理决策效率。

## 功能特性

### 1. 鼠标悬停查询

- 鼠标悬停在用户名链接上时自动触发查询
- 实时显示用户的违规记录信息
- 无需点击或跳转页面，提高操作效率

### 2. 违规记录展示

- 显示用户的违规次数和类型
- 展示最近的违规记录详情
- 提供违规时间、原因和处理结果
- 支持分页显示大量违规记录

### 3. 智能缓存机制

- 查询结果自动缓存，减少重复请求
- 缓存过期时间可配置
- 支持手动刷新缓存
- 避免频繁请求服务器，提高性能

### 4. 功能开关控制

- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理

1. **事件监听**：监听用户名链接的鼠标悬停事件
2. **数据获取**：通过论坛API获取用户违规记录
3. **界面展示**：创建浮动面板显示查询结果
4. **缓存管理**：使用浏览器 storage API 缓存查询结果

### 代码结构

```
src/
├── entries/
│   └── content/
│       └── features/
│           └── user-link-query/
│               ├── index.ts          # 功能入口文件
│               ├── query-engine.ts   # 查询引擎实现
│               ├── display-panel.ts  # 显示面板组件
│               ├── cache-manager.ts  # 缓存管理
│               └── config.ts         # 配置管理
```

### 核心逻辑

```typescript
// 查询用户违规记录
export async function queryUserViolations(userId: string): Promise<ViolationRecord[]> {
  // 检查缓存
  const cached = cacheManager.get(userId)
  if (cached && !cacheManager.isExpired(userId)) {
    return cached
  }

  // 从服务器获取数据
  const response = await fetch(`/api/user/violations?uid=${userId}`)
  const data = await response.json()

  // 更新缓存
  cacheManager.set(userId, data.violations)

  return data.violations
}

// 显示查询结果
export function showViolationPanel(userLink: HTMLElement, violations: ViolationRecord[]): void {
  const panel = createPanelElement()
  panel.innerHTML = renderViolationList(violations)

  // 定位面板
  const rect = userLink.getBoundingClientRect()
  panel.style.left = `${rect.left}px`
  panel.style.top = `${rect.bottom + 5}px`

  document.body.appendChild(panel)

  // 添加鼠标离开事件
  userLink.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (!panel.matches(':hover')) {
        panel.remove()
      }
    }, 300)
  })
}
```

## 配置选项

### 功能开关配置

```json
{
  "userLinkQuery": {
    "enabled": true,
    "cacheDuration": 3600,
    "maxRecords": 10,
    "showDetails": true,
    "autoHideDelay": 3000
  }
}
```

### 查询配置

- **缓存时间**：查询结果的缓存持续时间（秒）
- **最大记录数**：单次显示的最大违规记录数
- **显示详情**：是否显示详细的违规信息
- **自动隐藏延迟**：面板自动隐藏的延迟时间（毫秒）

### 存储键定义

- `52pjhelper:userLinkQuery:enabled` - 功能启用状态
- `52pjhelper:userLinkQuery:cache` - 查询缓存数据
- `52pjhelper:userLinkQuery:config` - 功能配置

## 使用场景

### 1. 快速用户评估

管理员在处理举报或审核内容时，可以快速查看用户的违规历史，辅助决策。

### 2. 批量管理操作

在处理多个用户时，可以快速了解每个用户的违规情况，制定相应的管理策略。

### 3. 预防性管理

通过了解用户的违规模式，可以提前采取预防措施，减少违规行为。

### 4. 数据统计分析

收集用户的违规数据，用于统计分析和管理决策支持。

## 注意事项

### 1. 隐私保护

- 仅显示必要的违规信息
- 不显示用户的敏感个人信息
- 遵守论坛的隐私政策
- 用户可请求删除缓存数据

### 2. 性能优化

- 使用防抖技术减少频繁查询
- 实现智能缓存机制
- 优化DOM操作，避免性能问题
- 支持请求取消，避免无效查询

### 3. 用户体验

- 查询结果展示清晰易读
- 支持键盘导航和屏幕阅读器
- 提供加载状态提示
- 错误处理友好

### 4. 网络请求

- 实现请求重试机制
- 支持离线模式（使用缓存数据）
- 处理网络超时和错误
- 优化请求频率，避免服务器压力

## 相关功能

- **[头像查询](avatar-query.md)** - 鼠标悬停显示用户违规记录
- **[快捷回复](quick-reply.md)** - 举报处理页面快捷回复
- **[自动填充](auto-fill.md)** - 智能表单自动填充

## 故障排除

### 常见问题

1. **查询结果不显示**
   - 检查是否在管理页面
   - 确认功能开关已启用
   - 检查网络连接是否正常
   - 查看浏览器控制台是否有错误信息

2. **缓存不更新**
   - 检查缓存配置是否正确
   - 确认缓存键是否唯一
   - 尝试手动清除缓存
   - 检查存储空间是否充足

3. **面板定位错误**
   - 检查页面布局是否发生变化
   - 确认CSS样式是否正确加载
   - 查看是否有其他扩展冲突

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签页，检查API请求
3. 切换到 Application 标签页，检查缓存数据
4. 切换到 Console 标签页，查看错误信息

## 版本历史

| 版本  | 日期       | 更新内容                   |
| ----- | ---------- | -------------------------- |
| 1.0.0 | 2024-01-25 | 初始版本，实现基本查询功能 |
| 1.1.0 | 2024-02-20 | 添加缓存机制，优化性能     |
| 1.2.0 | 2024-03-15 | 支持分页显示，添加配置界面 |
| 1.3.0 | 2024-04-10 | 优化网络请求，添加错误处理 |

---

**相关链接**：

- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)
