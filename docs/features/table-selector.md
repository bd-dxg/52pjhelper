# 分表选择器

## 功能概述

分表选择器功能将传统的下拉选择器替换为按钮式界面，优化了吾爱破解论坛管理页面的分表选择体验。通过蛇形布局设计和可隐藏特定分表的特性，提高了操作效率和界面简洁度。

## 功能特性

### 1. 按钮式界面
- 将下拉选择器替换为直观的按钮界面
- 每个分表对应一个独立的按钮
- 点击按钮即可快速切换分表
- 提高操作效率，减少点击次数

### 2. 蛇形布局设计
- 按钮采用蛇形排列方式，优化空间利用
- 根据屏幕宽度自动调整按钮布局
- 确保界面整洁美观，操作便捷
- 支持响应式设计，适应不同屏幕尺寸

### 3. 可隐藏特定分表
- 支持隐藏不常用的分表，简化界面
- 用户可自定义显示哪些分表按钮
- 减少界面干扰，聚焦核心功能
- 配置通过浏览器 storage 本地存储

### 4. 功能开关控制
- 支持启用/禁用功能切换
- 配置通过浏览器 storage 本地存储
- 用户可根据需要灵活控制功能使用

## 技术实现

### 实现原理
1. **DOM 替换**：检测页面中的分表选择器元素，替换为按钮式界面
2. **事件处理**：为每个按钮绑定点击事件，实现分表切换功能
3. **布局算法**：实现蛇形布局算法，优化按钮排列
4. **配置管理**：使用浏览器 storage API 保存显示配置和功能状态

### 代码结构
```
src/
├── entries/
│   └── content/
│       └── features/
│           └── table-selector/
│               ├── index.ts          # 功能入口文件
│               ├── table-selector.ts # 分表选择器实现
│               ├── layout.ts         # 蛇形布局算法
│               └── config.ts         # 配置管理
```

### 核心逻辑
```typescript
// 蛇形布局算法示例
export function createSnakeLayout(
  buttons: HTMLElement[],
  containerWidth: number,
  buttonWidth: number,
  buttonHeight: number
): void {
  let x = 0;
  let y = 0;
  let direction = 1; // 1: 向右, -1: 向左
  
  buttons.forEach((button, index) => {
    button.style.position = 'absolute';
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    
    x += direction * (buttonWidth + 10);
    
    // 检查是否超出容器边界
    if (x + buttonWidth > containerWidth || x < 0) {
      direction *= -1;
      x = direction > 0 ? 0 : containerWidth - buttonWidth;
      y += buttonHeight + 10;
    }
  });
}

// 分表切换功能
export function switchTable(tableId: string): void {
  const selectElement = document.querySelector('select[name="table"]') as HTMLSelectElement;
  if (selectElement) {
    selectElement.value = tableId;
    selectElement.dispatchEvent(new Event('change'));
  }
}
```

## 配置选项

### 功能开关配置
```json
{
  "tableSelector": {
    "enabled": true,
    "layout": "snake",
    "buttonSize": "medium",
    "hiddenTables": ["table5", "table8"]
  }
}
```

### 显示配置
- **布局模式**：`snake`（蛇形）、`grid`（网格）、`linear`（线性）
- **按钮尺寸**：`small`、`medium`、`large`
- **隐藏分表**：可配置隐藏特定分表的按钮

### 存储键定义
- `52pjhelper:tableSelector:enabled` - 功能启用状态
- `52pjhelper:tableSelector:hiddenTables` - 隐藏的分表列表
- `52pjhelper:tableSelector:layout` - 布局模式配置

## 使用场景

### 1. 快速分表切换
管理员在处理多个分表的内容时，可以通过按钮快速切换，无需操作下拉菜单。

### 2. 简化管理界面
隐藏不常用的分表，减少界面干扰，让管理员更专注于当前工作。

### 3. 提高操作效率
按钮式界面比下拉选择器更直观，减少操作步骤，提高工作效率。

### 4. 个性化配置
管理员可以根据自己的使用习惯，自定义显示哪些分表按钮。

## 注意事项

### 1. 兼容性考虑
- 确保与原分表选择器的功能完全兼容
- 不影响原有的分表切换逻辑
- 支持论坛页面的动态加载

### 2. 性能优化
- 使用事件委托减少事件监听器数量
- 避免频繁的 DOM 操作
- 使用防抖技术优化布局计算

### 3. 用户体验
- 按钮需要有明确的状态反馈（选中/未选中）
- 提供悬停效果和点击反馈
- 确保按钮在移动设备上也能正常操作

### 4. 可访问性
- 确保键盘导航支持
- 提供适当的 ARIA 属性
- 支持屏幕阅读器

## 相关功能

- **[全选功能](select-all.md)** - 批量操作工具
- **[管理页面查询](user-link-query.md)** - 用户链接违规查询
- **[勾选范围](row-click-to-check.md)** - 点击表格行勾选复选框

## 故障排除

### 常见问题
1. **按钮不显示**
   - 检查是否在管理页面
   - 确认功能开关已启用
   - 检查页面结构是否发生变化

2. **布局混乱**
   - 检查容器宽度计算是否正确
   - 确认按钮尺寸配置是否合理
   - 查看是否有 CSS 样式冲突

3. **分表切换失败**
   - 检查原分表选择器是否存在
   - 确认分表 ID 是否正确
   - 查看浏览器控制台是否有错误信息

### 调试方法
1. 打开浏览器开发者工具（F12）
2. 切换到 Elements 标签页，检查生成的按钮元素
3. 切换到 Console 标签页，查看错误信息
4. 使用 Network 标签页检查网络请求

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2024-01-20 | 初始版本，实现基本按钮式界面 |
| 1.1.0 | 2024-02-15 | 添加蛇形布局算法，优化界面排列 |
| 1.2.0 | 2024-03-10 | 支持隐藏特定分表，添加配置界面 |
| 1.3.0 | 2024-04-05 | 优化响应式设计，支持移动设备 |

---

**相关链接**：
- [功能开关组件开发指南](../development/component-guide.md)
- [配置文档](../config/feature-configs.md)
- [最佳实践](../development/best-practices.md)