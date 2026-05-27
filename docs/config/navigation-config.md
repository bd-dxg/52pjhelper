# 导航菜单配置

本文档详细介绍了导航菜单的配置结构、选项和使用方法。

## 配置文件位置

```
src/features/navigation/config.json
```

通过路径别名 `@features` 导入：

```typescript
import navigationConfig from '@features/navigation/config.json'
```

## 配置结构

### 完整配置示例

```json
{
  "storageKey": "52pjhelper_nav_config",
  "menus": [
    {
      "id": "mn_portal",
      "name": "门户",
      "selector": "#mn_portal"
    },
    {
      "id": "mn_forum",
      "name": "网站",
      "selector": "#mn_forum"
    },
    {
      "id": "mn_Na063",
      "name": "新帖",
      "selector": "#mn_Na063"
    }
  ]
}
```

## 配置字段说明

### 根级字段

| 字段          | 类型     | 必填 | 说明                           | 示例                       |
| ------------- | -------- | ---- | ------------------------------ | -------------------------- |
| `storageKey`  | `string` | 是   | 存储键名，用于保存菜单显示状态 | `"52pjhelper_nav_config"`  |
| `menus`       | `Menu[]` | 是   | 菜单项数组                     | `[...]`                    |

### 菜单项字段 (Menu)

| 字段       | 类型     | 必填 | 说明                       | 示例            |
| ---------- | -------- | ---- | -------------------------- | --------------- |
| `id`       | `string` | 是   | 菜单项唯一标识符           | `"mn_forum"`    |
| `name`     | `string` | 是   | 菜单项显示名称             | `"网站"`        |
| `selector` | `string` | 是   | DOM 选择器，用于定位页面元素 | `"#mn_forum"`  |

## 配置示例

### 完整导航菜单配置

```json
{
  "storageKey": "52pjhelper_nav_config",
  "menus": [
    { "id": "mn_portal", "name": "门户", "selector": "#mn_portal" },
    { "id": "mn_forum", "name": "网站", "selector": "#mn_forum" },
    { "id": "mn_Na063", "name": "新帖", "selector": "#mn_Na063" },
    { "id": "mn_forum_11", "name": "专辑", "selector": "#mn_forum_11" },
    { "id": "mn_home_4", "name": "家园", "selector": "#mn_home_4" },
    { "id": "mn_N12a7", "name": "排行榜", "selector": "#mn_N12a7" },
    { "id": "mn_N05be", "name": "总版规", "selector": "#mn_N05be" },
    { "id": "mn_N34c9", "name": "投诉举报", "selector": "#mn_N34c9" },
    { "id": "mn_Na678", "name": "爱盘", "selector": "#mn_Na678" },
    { "id": "mn_Ndb2c", "name": "管理", "selector": "#mn_Ndb2c" },
    { "id": "mn_N0a2c", "name": "帮助", "selector": "#mn_N0a2c" }
  ]
}
```

## 配置加载和使用

### 1. 加载配置

```typescript
// 通过路径别名导入导航配置
import navigationConfig from '@features/navigation/config.json'

// 验证配置
const validateNavigationConfig = (config: unknown): boolean => {
  const cfg = config as Record<string, unknown>
  return Array.isArray(cfg?.menus)
}
```

### 2. 生成导航菜单

```typescript
import navigationConfig from '@features/navigation/config.json'

// 生成导航菜单数据
const generateNavigationMenu = () => {
  return navigationConfig.menus.map(menu => ({
    id: menu.id,
    name: menu.name,
    selector: menu.selector,
  }))
}
```

### 3. 保存菜单显示状态

```typescript
import navigationConfig from '@features/navigation/config.json'

// 保存菜单显示/隐藏状态
const saveMenuState = async (hiddenMenuIds: string[]) => {
  await browser.storage.local.set({
    [navigationConfig.storageKey]: hiddenMenuIds,
  })
}

// 读取菜单显示/隐藏状态
const loadMenuState = async (): Promise<string[]> => {
  const result = await browser.storage.local.get(navigationConfig.storageKey)
  return result[navigationConfig.storageKey] ?? []
}
```

## 配置更新和维护

### 添加新菜单项

在 `src/features/navigation/config.json` 的 `menus` 数组中添加新项：

```json
{
  "id": "mn_new_menu",
  "name": "新菜单",
  "selector": "#mn_new_menu"
}
```

### 移除菜单项

从 `menus` 数组中移除对应项即可。

## 相关文档

- [配置文件概述](./overview.md) - 配置文件整体结构
- [功能配置文件](./feature-configs.md) - 功能配置详细说明

---

_文档版本：2.0.0_
_最后更新：2026-05-28_
