# 导航菜单管理

允许用户在吾爱破解论坛上自定义显示/隐藏导航菜单，简化界面布局。

## 功能概述

导航菜单管理功能让用户可以根据个人习惯自定义论坛导航菜单的显示/隐藏状态，提供更简洁的浏览体验。

## 功能特点

### 1. 配置本地存储

- 配置通过浏览器 storage 本地存储
- 支持实时切换显示/隐藏状态
- 提供重置为默认配置功能

### 2. 实时切换

- 切换状态立即生效，无需刷新页面
- 视觉反馈清晰，显示当前状态
- 支持批量操作

### 3. 默认配置恢复

- 一键恢复所有菜单为默认显示状态
- 支持选择性重置
- 配置备份和恢复

## 支持的导航菜单

### 主要导航菜单

1. **首页** - 论坛首页链接
2. **论坛** - 论坛分区列表
3. **导读** - 最新帖子导读
4. **排行榜** - 用户排名和统计
5. **淘帖** - 精华帖子收藏
6. **家园** - 个人空间
7. **群组** - 用户群组
8. **应用** - 论坛应用
9. **插件** - 论坛插件
10. **帮助** - 论坛帮助文档

### 二级导航菜单

- 各分区子菜单
- 快捷导航链接
- 个人中心菜单

## 技术实现

### 存储结构

```typescript
// 导航菜单配置
interface NavigationConfig {
  enabled: boolean
  position?: number
  customName?: string
}

// 存储格式
interface NavigationStorage {
  [menuId: string]: NavigationConfig
}

// 示例存储数据
{
  "home": { "enabled": true, "position": 1 },
  "forum": { "enabled": true, "position": 2 },
  "guide": { "enabled": false, "position": 3 },
  "rank": { "enabled": true, "position": 4 }
}
```

### 菜单检测和操作

```typescript
// 检测导航菜单元素
function detectNavigationMenus(): HTMLElement[] {
  return Array.from(document.querySelectorAll('#nv li, .nav li, .menu li'))
}

// 切换菜单显示状态
function toggleMenuVisibility(menuId: string, enabled: boolean): void {
  const menu = document.querySelector(`[data-menu-id="${menuId}"]`)
  if (menu) {
    menu.style.display = enabled ? '' : 'none'
  }
}

// 保存配置
async function saveNavigationConfig(config: NavigationStorage): Promise<void> {
  await browser.storage.local.set({ navigationConfig: config })
}
```

### 事件处理

```typescript
// 监听菜单点击事件
function setupMenuEventListeners(): void {
  const menus = detectNavigationMenus()
  menus.forEach(menu => {
    menu.addEventListener('click', event => {
      // 处理菜单点击
      handleMenuClick(event, menu)
    })
  })
}

// 右键菜单自定义
function setupContextMenu(): void {
  document.addEventListener('contextmenu', event => {
    const target = event.target as HTMLElement
    if (target.matches('#nv li, .nav li')) {
      event.preventDefault()
      showCustomizationMenu(target, event)
    }
  })
}
```

## 配置管理

### 配置文件

`src/configs/navigation.json`:

```json
{
  "name": "导航菜单管理",
  "description": "自定义显示/隐藏导航菜单",
  "defaultEnabled": true,
  "storageKey": "navigationEnabled",
  "targetPages": ["https://www.52pojie.cn/*"],
  "defaultMenus": [
    { "id": "home", "name": "首页", "enabled": true },
    { "id": "forum", "name": "论坛", "enabled": true },
    { "id": "guide", "name": "导读", "enabled": true },
    { "id": "rank", "name": "排行榜", "enabled": true }
  ]
}
```

### 存储键

- `navigationEnabled` - 功能开关状态
- `navigationConfig` - 菜单配置数据
- `navigationCustomOrder` - 自定义排序

## 使用指南

### 启用功能

1. 打开扩展设置页面
2. 找到"导航菜单管理"功能开关
3. 点击启用按钮
4. 在论坛页面上右键点击导航菜单进行配置

### 自定义菜单

1. **隐藏菜单**：右键点击菜单，选择"隐藏此菜单"
2. **显示菜单**：在设置页面中启用已隐藏的菜单
3. **调整顺序**：拖拽菜单项调整显示顺序
4. **重命名菜单**：右键菜单选择"重命名"

### 批量操作

1. **全部显示**：恢复所有菜单为默认状态
2. **全部隐藏**：隐藏所有非必要菜单
3. **导入/导出**：备份和恢复配置

### 重置设置

1. 在扩展设置页面找到"导航菜单管理"
2. 点击"重置为默认"按钮
3. 确认重置操作

## 高级功能

### 1. 自定义菜单项

支持添加自定义导航链接：

- 添加常用页面快捷方式
- 创建自定义分类
- 集成外部工具链接

### 2. 分组管理

将相关菜单分组显示：

- 按功能分组（浏览、社交、工具）
- 按使用频率分组
- 自定义分组名称

### 3. 条件显示

根据条件自动显示/隐藏菜单：

- 根据用户权限显示
- 根据时间显示（如夜间模式）
- 根据页面类型显示

### 4. 样式自定义

- 自定义菜单图标
- 调整菜单颜色和大小
- 添加动画效果

## 性能优化

### 延迟加载

菜单检测和事件绑定在页面加载完成后进行。

### 选择性监控

只监控包含导航菜单的页面区域。

### 事件委托

使用事件委托减少事件监听器数量。

### 缓存配置

缓存菜单配置，减少存储读取次数。

## 常见问题

### Q: 为什么某些菜单无法隐藏？

A: 核心功能菜单（如首页、论坛）可能被强制显示，这是论坛的限制。

### Q: 隐藏的菜单如何恢复？

A: 在扩展设置页面找到"导航菜单管理"，启用对应的菜单。

### Q: 自定义排序会丢失吗？

A: 配置会自动保存到浏览器存储，除非清除浏览器数据。

### Q: 支持其他论坛吗？

A: 目前仅支持吾爱破解论坛，需要针对不同论坛调整选择器。

### Q: 可以添加新的菜单项吗？

A: 支持添加自定义链接，但需要手动配置。

## 开发扩展

### 添加新论坛支持

1. 更新 `targetPages` 配置
2. 调整菜单选择器
3. 测试菜单检测功能

### 添加新功能

1. 扩展 `NavigationConfig` 接口
2. 更新存储结构
3. 实现新的UI控件

### 性能优化

1. 优化菜单检测算法
2. 减少DOM操作次数
3. 使用虚拟滚动处理大量菜单

## 相关文档

- [通用功能组](general-features.md)
- [组件开发指南](../development/component-guide.md)
- [存储键命名规范](../config/storage-keys.md)
- [可组合函数式架构](../development/composable-architecture.md)

---

_最后更新：2026-04-17_  
_文档版本：1.0.0_
