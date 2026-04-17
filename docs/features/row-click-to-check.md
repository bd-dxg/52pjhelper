# 勾选范围

## 功能概述

勾选范围功能在吾爱破解论坛管理页面上，允许用户点击表格行（tr）来勾选对应的复选框，大幅提高操作效率。该功能支持多种管理页面，包括帖子管理页面和回收站页面。

## 功能特性

### 1. 行点击勾选
- 点击表格行即可勾选该行对应的复选框
- 支持单选和多选模式
- 提供视觉反馈，明确显示选中状态
- 减少鼠标移动距离，提高操作效率

### 2. 多页面支持
- **帖子管理页面**：forum.php?mod=modcp&action=moderate&op=threads
- **回收站页面**：forum.php?mod=modcp&action=recyclebin&op=thread
- **其他管理页面**：支持扩展其他管理页面
- 自动检测页面类型，应用相应的勾选逻辑

### 3. 智能选择模式
- **普通模式**：点击行勾选对应复选框
- **Shift多选**：按住Shift键点击可进行范围选择
- **Ctrl多选**：按住Ctrl键点击可进行多选/取消选择
- **全选/取消**：支持全选和取消全选操作

### 4. 视觉反馈
- 选中行高亮显示，提供明确的视觉反馈
- 支持自定义高亮颜色和样式
- 提供悬停效果，增强用户体验
- 状态持久化，页面刷新后保持选中状态

### 5. 功能开关控制
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理
1. **页面检测**：检测当前页面类型，应用相应的勾选逻辑
2. **事件委托**：使用事件委托监听表格行点击事件
3. **复选框操作**：操作对应的复选框元素，实现勾选功能
4. **状态管理**：管理选中状态，支持复杂的选择操作

### 代码结构
```
src/
├── entries/
│   └── content/
│       └── features/
│           └── row-click-to-check/
│               ├── index.ts          # 功能入口文件
│               ├── row-click.ts      # 行点击勾选实现
│               ├── selection.ts      # 选择逻辑管理
│               ├── visual-feedback.ts # 视觉反馈实现
│               └── config.ts         # 配置管理
```

### 核心逻辑
```typescript
// 行点击事件处理
export function handleRowClick(event: MouseEvent, row: HTMLElement): void {
  const checkbox = findCheckboxInRow(row);
  if (!checkbox) return;
  
  // 处理键盘修饰键
  if (event.shiftKey) {
    handleShiftSelection(row, checkbox);
  } else if (event.ctrlKey || event.metaKey) {
    handleCtrlSelection(checkbox);
  } else {
    handleNormalSelection(checkbox);
  }
  
  // 更新视觉反馈
  updateVisualFeedback(row, checkbox.checked);
}

// 查找行中的复选框
function findCheckboxInRow(row: HTMLElement): HTMLInputElement | null {
  return row.querySelector('input[type="checkbox"]');
}

// 处理Shift键范围选择
function handleShiftSelection(currentRow: HTMLElement, currentCheckbox: HTMLInputElement): void {
  if (!lastSelectedRow) {
    handleNormalSelection(currentCheckbox);
    return;
  }
  
  const rows = getTableRows();
  const startIndex = rows.indexOf(lastSelectedRow);
  const endIndex = rows.indexOf(currentRow);
  
  if (startIndex === -1 || endIndex === -1) return;
  
  const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
  const isChecked = currentCheckbox.checked;
  
  for (let i = min; i <= max; i++) {
    const checkbox = findCheckboxInRow(rows[i]);
    if (checkbox) {
      checkbox.checked = isChecked;
      updateVisualFeedback(rows[i], isChecked);
    }
  }
}
```

## 配置选项

### 功能开关配置
```json
{
  "rowClickToCheck": {
    "enabled": true,
    "highlightColor": "#e6f7ff",
    "hoverColor": "#f5f5f5",
    "selectionMode": "normal",
    "persistSelection": true
  }
}
```

### 视觉配置
- **高亮颜色**：选中行的背景颜色
- **悬停颜色**：鼠标悬停时的背景颜色
- **边框样式**：选中行的边框样式
- **过渡效果**：状态变化的过渡动画

### 行为配置
- **选择模式**：`normal`（普通）、`shift`（Shift选择）、`ctrl`（Ctrl选择）
- **状态持久化**：是否在页面刷新后保持选中状态
- **双击行为**：双击行时的操作（选中/取消/无操作）
- **右键菜单**：是否启用右键菜单功能

### 存储键定义
- `52pjhelper:rowClickToCheck:enabled` - 功能启用状态
- `52pjhelper:rowClickToCheck:selection` - 当前选中状态
- `52pjhelper:rowClickToCheck:config` - 功能配置

## 使用场景

### 1. 批量操作管理
管理员需要批量处理多个帖子时，可以快速选择多个行，然后执行批量操作。

### 2. 快速内容审核
在审核大量内容时，可以快速选择需要审核的条目，提高审核效率。

### 3. 数据筛选处理
在处理数据筛选结果时，可以快速选择符合条件的数据行。

### 4. 日常管理任务
在日常管理工作中，减少鼠标操作，提高工作效率。

## 注意事项

### 1. 兼容性考虑
- 确保与原有复选框功能兼容
- 不影响原有的表单提交逻辑
- 支持动态加载的表格内容
- 兼容不同的浏览器和操作系统

### 2. 性能优化
- 使用事件委托减少事件监听器数量
- 避免频繁的DOM操作
- 实现虚拟滚动支持大型表格
- 优化内存使用，避免内存泄漏

### 3. 用户体验
- 提供明确的状态反馈
- 支持键盘快捷键操作
- 确保触摸设备兼容性
- 提供操作撤销功能

### 4. 可访问性
- 确保键盘导航支持
- 提供适当的ARIA属性
- 支持屏幕阅读器
- 符合WCAG无障碍标准

## 相关功能

- **[全选功能](select-all.md)** - 批量操作工具
- **[分表选择器](table-selector.md)** - 按钮式分表选择界面
- **[灌水筛选](content-filter.md)** - 可拖动的过滤卡片

## 故障排除

### 常见问题
1. **点击无效**
   - 检查是否在支持的管理页面
   - 确认功能开关已启用
   - 检查页面结构是否发生变化
   - 查看是否有其他扩展冲突

2. **选择状态错误**
   - 检查选择逻辑是否正确
   - 确认键盘修饰键状态
   - 查看事件处理是否正确
   - 检查状态管理逻辑

3. **视觉反馈异常**
   - 检查CSS样式是否正确加载
   - 确认颜色配置是否正确
   - 查看是否有样式冲突
   - 检查浏览器兼容性

### 调试方法
1. 打开浏览器开发者工具（F12）
2. 切换到 Elements 标签页，检查行元素和复选框
3. 切换到 Console 标签页，查看错误信息
4. 使用 Event Listeners 面板检查事件绑定

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2024-01-30 | 初始版本，实现基本行点击勾选功能 |
| 1.1.0 | 2024-02-25 | 添加Shift和Ctrl多选支持 |
| 1.2.0 | 2024-03-20 | 优化视觉反馈，添加配置界面 |
| 1.3.0 | 2024-04-15 | 支持状态持久化，优化性能 |

---

**相关链接**：
- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)