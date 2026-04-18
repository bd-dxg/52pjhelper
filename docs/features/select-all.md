# 全选功能

## 功能概述

全选功能为吾爱破解论坛管理页面提供批量操作工具，添加"除第一条全选"按钮和"删除"按钮，方便管理员快速执行批量操作。

## 功能特性

### 1. 除第一条全选按钮

- 自动勾选除第一条记录外的所有复选框
- 适用于需要批量操作但保留第一条记录的场景
- 提高管理效率，减少手动勾选操作

### 2. 删除按钮

- 快速执行删除操作
- 与全选功能配合使用，实现批量删除
- 减少操作步骤，提高工作效率

### 3. 功能开关控制

- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理

1. **DOM 操作**：通过 JavaScript 操作页面元素，识别管理页面的复选框
2. **事件监听**：监听按钮点击事件，执行相应的批量操作
3. **存储管理**：使用浏览器 storage API 保存功能开关状态

### 代码结构

```
src/
├── entries/
│   └── content/
│       └── features/
│           └── select-all/
│               ├── index.ts          # 功能入口文件
│               ├── select-all.ts     # 全选功能实现
│               └── config.ts         # 配置管理
```

### 核心逻辑

```typescript
// 全选功能实现示例
export function selectAllExceptFirst() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]')
  if (checkboxes.length > 1) {
    for (let i = 1; i < checkboxes.length; i++) {
      ;(checkboxes[i] as HTMLInputElement).checked = true
    }
  }
}

// 删除功能实现示例
export function deleteSelected() {
  const selectedItems = getSelectedItems()
  if (selectedItems.length > 0) {
    // 执行删除操作
    confirmDelete(selectedItems)
  }
}
```

## 配置选项

### 功能开关配置

```json
{
  "selectAll": {
    "enabled": true,
    "buttonText": "除第一条全选",
    "deleteButtonText": "删除"
  }
}
```

### 存储键定义

- `52pjhelper:selectAll:enabled` - 功能启用状态
- `52pjhelper:selectAll:lastUsed` - 最后使用时间戳

## 使用场景

### 1. 批量删除违规内容

管理员在管理页面发现大量违规内容时，可以使用全选功能快速选中需要删除的记录，然后一键删除。

### 2. 批量操作保留参考

当需要批量操作但需要保留第一条记录作为参考时，使用"除第一条全选"功能。

### 3. 日常管理效率提升

在日常管理工作中，减少重复的勾选操作，提高工作效率。

## 注意事项

### 1. 权限验证

- 功能仅在管理页面生效
- 需要管理员权限才能执行删除操作
- 操作前会有确认提示，避免误操作

### 2. 数据安全

- 删除操作不可逆，操作前请确认
- 建议在执行批量删除前备份重要数据
- 系统会记录操作日志，便于追溯

### 3. 兼容性

- 支持 Chrome 浏览器（Manifest V3）
- 与论坛管理页面结构兼容
- 不影响原有功能正常使用

## 相关功能

- **[分表选择器](table-selector.md)** - 按钮式分表选择界面
- **[勾选范围](row-click-to-check.md)** - 点击表格行勾选复选框
- **[自动填充](auto-fill.md)** - 智能表单自动填充

## 故障排除

### 常见问题

1. **按钮不显示**
   - 检查是否在管理页面
   - 确认功能开关已启用
   - 检查浏览器扩展是否正常运行

2. **全选功能无效**
   - 检查页面结构是否发生变化
   - 确认复选框选择器是否正确
   - 查看浏览器控制台是否有错误信息

3. **删除操作失败**
   - 确认有管理员权限
   - 检查网络连接是否正常
   - 查看论坛API接口状态

### 调试方法

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签页
3. 查看是否有错误信息
4. 检查网络请求状态

## 版本历史

| 版本  | 日期       | 更新内容                         |
| ----- | ---------- | -------------------------------- |
| 1.0.0 | 2024-01-15 | 初始版本，实现基本全选和删除功能 |
| 1.1.0 | 2024-02-10 | 优化按钮样式，添加操作确认提示   |
| 1.2.0 | 2024-03-05 | 添加操作日志记录，提高安全性     |

---

**相关链接**：

- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)
