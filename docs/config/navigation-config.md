# 导航菜单配置

本文档详细介绍了导航菜单的配置结构、选项和使用方法。

## 配置文件位置

```
src/configs/navigation.json
```

## 配置结构

### 完整配置示例

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "menus": [
    {
      "id": "general",
      "title": "通用功能",
      "icon": "settings",
      "description": "适用于所有用户的通用功能设置",
      "collapsible": true,
      "defaultCollapsed": false,
      "items": [
        {
          "id": "dark-theme",
          "title": "深色主题",
          "description": "自动检测系统主题或手动切换深色模式",
          "icon": "moon",
          "category": "appearance",
          "defaultEnabled": true,
          "requiresReload": false,
          "storageKey": "dark_theme_enabled",
          "dependencies": [],
          "conflicts": []
        }
      ]
    }
  ]
}
```

## 配置字段说明

### 根级字段

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `version` | `string` | 是 | 配置版本号，遵循语义化版本 | `"1.0.0"` |
| `lastUpdated` | `string` | 否 | 最后更新时间（ISO 8601格式） | `"2026-04-17"` |
| `menus` | `Menu[]` | 是 | 菜单组数组 | `[...]` |

### 菜单组字段 (Menu)

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | `string` | 是 | 菜单组唯一标识符 | `"general"` |
| `title` | `string` | 是 | 菜单组显示标题 | `"通用功能"` |
| `icon` | `string` | 否 | 菜单组图标名称 | `"settings"` |
| `description` | `string` | 否 | 菜单组描述文本 | `"适用于所有用户的通用功能设置"` |
| `collapsible` | `boolean` | 否 | 是否可折叠，默认 `true` | `true` |
| `defaultCollapsed` | `boolean` | 否 | 默认是否折叠，默认 `false` | `false` |
| `items` | `MenuItem[]` | 是 | 菜单项数组 | `[...]` |

### 菜单项字段 (MenuItem)

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `id` | `string` | 是 | 功能唯一标识符 | `"dark-theme"` |
| `title` | `string` | 是 | 功能显示标题 | `"深色主题"` |
| `description` | `string` | 否 | 功能详细描述 | `"自动检测系统主题或手动切换深色模式"` |
| `icon` | `string` | 否 | 功能图标名称 | `"moon"` |
| `category` | `string` | 否 | 功能分类 | `"appearance"` |
| `defaultEnabled` | `boolean` | 否 | 默认是否启用，默认 `false` | `true` |
| `requiresReload` | `boolean` | 否 | 启用后是否需要刷新页面，默认 `false` | `false` |
| `storageKey` | `string` | 否 | 存储键名，默认使用 `id` | `"dark_theme_enabled"` |
| `dependencies` | `string[]` | 否 | 依赖的其他功能ID | `["feature-a", "feature-b"]` |
| `conflicts` | `string[]` | 否 | 冲突的其他功能ID | `["feature-c"]` |

## 配置示例

### 1. 通用功能菜单组

```json
{
  "id": "general",
  "title": "通用功能",
  "icon": "settings",
  "description": "适用于所有用户的通用功能设置",
  "collapsible": true,
  "defaultCollapsed": false,
  "items": [
    {
      "id": "dark-theme",
      "title": "深色主题",
      "description": "自动检测系统主题或手动切换深色模式",
      "icon": "moon",
      "category": "appearance",
      "defaultEnabled": true,
      "requiresReload": false,
      "storageKey": "dark_theme_enabled"
    },
    {
      "id": "compact-layout",
      "title": "紧凑布局",
      "description": "优化组件间距，提供更紧凑的界面布局",
      "icon": "compress",
      "category": "layout",
      "defaultEnabled": false,
      "requiresReload": true,
      "storageKey": "compact_layout_enabled"
    },
    {
      "id": "navigation-management",
      "title": "导航菜单管理",
      "description": "自定义显示/隐藏导航菜单项",
      "icon": "menu",
      "category": "navigation",
      "defaultEnabled": true,
      "requiresReload": false,
      "storageKey": "navigation_management_enabled"
    }
  ]
}
```

### 2. 后台管理菜单组

```json
{
  "id": "admin",
  "title": "后台管理",
  "icon": "shield",
  "description": "论坛管理专用功能，需要管理员权限",
  "collapsible": true,
  "defaultCollapsed": true,
  "items": [
    {
      "id": "avatar-query",
      "title": "头像查询",
      "description": "鼠标悬停显示用户违规记录",
      "icon": "user-check",
      "category": "user-management",
      "defaultEnabled": true,
      "requiresReload": false,
      "storageKey": "avatar_query_enabled"
    },
    {
      "id": "quick-reply",
      "title": "快捷回复",
      "description": "举报处理页面快捷回复模板",
      "icon": "message-square",
      "category": "moderation",
      "defaultEnabled": true,
      "requiresReload": false,
      "storageKey": "quick_reply_enabled"
    },
    {
      "id": "auto-fill",
      "title": "自动填充",
      "description": "智能表单自动填充，提高管理效率",
      "icon": "edit-3",
      "category": "automation",
      "defaultEnabled": true,
      "requiresReload": false,
      "storageKey": "auto_fill_enabled"
    }
  ]
}
```

### 3. 高级功能菜单组

```json
{
  "id": "advanced",
  "title": "高级功能",
  "icon": "zap",
  "description": "高级功能和实验性特性",
  "collapsible": true,
  "defaultCollapsed": true,
  "items": [
    {
      "id": "content-filter",
      "title": "灌水筛选",
      "description": "可拖动的过滤卡片，智能识别灌水内容",
      "icon": "filter",
      "category": "content-moderation",
      "defaultEnabled": false,
      "requiresReload": true,
      "storageKey": "content_filter_enabled",
      "dependencies": ["user-link-query"]
    },
    {
      "id": "duplicate-post-detection",
      "title": "重复发帖检测",
      "description": "高亮显示重复发帖内容",
      "icon": "copy",
      "category": "content-moderation",
      "defaultEnabled": false,
      "requiresReload": true,
      "storageKey": "duplicate_post_detection_enabled"
    }
  ]
}
```

## 配置加载和使用

### 1. 加载配置

```typescript
// 导入导航配置
import navigationConfig from '@/configs/navigation.json'

// 验证配置
const validateNavigationConfig = (config: any): boolean => {
  if (!config.version || !config.menus) {
    return false
  }
  
  // 验证菜单结构
  return config.menus.every((menu: any) => 
    menu.id && menu.title && Array.isArray(menu.items)
  )
}

if (!validateNavigationConfig(navigationConfig)) {
  throw new Error('无效的导航配置')
}
```

### 2. 生成导航菜单

```typescript
// 生成导航菜单数据
const generateNavigationMenu = () => {
  return navigationConfig.menus.map(menu => ({
    id: menu.id,
    title: menu.title,
    icon: menu.icon,
    description: menu.description,
    collapsible: menu.collapsible ?? true,
    defaultCollapsed: menu.defaultCollapsed ?? false,
    items: menu.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      category: item.category,
      defaultEnabled: item.defaultEnabled ?? false,
      requiresReload: item.requiresReload ?? false,
      storageKey: item.storageKey || item.id,
      dependencies: item.dependencies || [],
      conflicts: item.conflicts || [],
      // 获取当前状态
      enabled: getFeatureState(item.storageKey || item.id)
    }))
  }))
}
```

### 3. 处理功能依赖

```typescript
// 检查功能依赖
const checkFeatureDependencies = (featureId: string): string[] => {
  const menu = navigationConfig.menus.find(m => 
    m.items.some(item => item.id === featureId)
  )
  
  if (!menu) {
    return []
  }
  
  const feature = menu.items.find(item => item.id === featureId)
  if (!feature?.dependencies) {
    return []
  }
  
  // 检查依赖的功能是否已启用
  const unmetDependencies = feature.dependencies.filter(depId => {
    const depState = getFeatureState(depId)
    return !depState
  })
  
  return unmetDependencies
}

// 启用功能前检查依赖
const enableFeatureWithDependencies = async (featureId: string): Promise<boolean> => {
  const unmetDependencies = checkFeatureDependencies(featureId)
  
  if (unmetDependencies.length > 0) {
    console.warn(`功能 ${featureId} 依赖以下未启用的功能:`, unmetDependencies)
    return false
  }
  
  // 启用功能
  await setFeatureState(featureId, true)
  return true
}
```

### 4. 处理功能冲突

```typescript
// 检查功能冲突
const checkFeatureConflicts = (featureId: string): string[] => {
  const menu = navigationConfig.menus.find(m => 
    m.items.some(item => item.id === featureId)
  )
  
  if (!menu) {
    return []
  }
  
  const feature = menu.items.find(item => item.id === featureId)
  if (!feature?.conflicts) {
    return []
  }
  
  // 检查冲突的功能是否已启用
  const activeConflicts = feature.conflicts.filter(conflictId => {
    const conflictState = getFeatureState(conflictId)
    return conflictState
  })
  
  return activeConflicts
}

// 处理功能冲突
const resolveFeatureConflicts = async (featureId: string): Promise<boolean> => {
  const activeConflicts = checkFeatureConflicts(featureId)
  
  if (activeConflicts.length > 0) {
    // 自动禁用冲突的功能
    for (const conflictId of activeConflicts) {
      console.log(`自动禁用冲突功能: ${conflictId}`)
      await setFeatureState(conflictId, false)
    }
  }
  
  // 启用新功能
  await setFeatureState(featureId, true)
  return true
}
```

## 配置更新和维护

### 1. 添加新功能

```json
{
  "id": "new-feature",
  "title": "新功能",
  "description": "新功能的详细描述",
  "icon": "star",
  "category": "new",
  "defaultEnabled": false,
  "requiresReload": false,
  "storageKey": "new_feature_enabled",
  "dependencies": [],
  "conflicts": []
}
```

### 2. 更新现有功能

```json
{
  "id": "existing-feature",
  "title": "更新后的标题",
  "description": "更新后的描述",
  "icon": "updated-icon",
  "category": "updated-category",
  "defaultEnabled": true,  // 更改默认值
  "requiresReload": true,  // 更改重载要求
  "storageKey": "existing_feature_enabled",
  "dependencies": ["new-dependency"],  // 添加依赖
  "conflicts": ["conflicting-feature"]  // 添加冲突
}
```

### 3. 移除功能

```json
// 从 items 数组中移除对应的功能项
{
  "id": "menu-group",
  "title": "菜单组",
  "items": [
    // 移除不再需要的功能项
    // { "id": "removed-feature", ... }
  ]
}
```

## 配置验证工具

### 1. 配置验证脚本

```typescript
// 验证导航配置
const validateNavigationConfig = (config: any): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  // 检查必填字段
  if (!config.version) {
    errors.push('缺少 version 字段')
  }
  
  if (!Array.isArray(config.menus)) {
    errors.push('menus 必须是数组')
  }
  
  // 检查每个菜单组
  config.menus?.forEach((menu: any, index: number) => {
    if (!menu.id) {
      errors.push(`菜单组 ${index}: 缺少 id 字段`)
    }
    
    if (!menu.title) {
      errors.push(`菜单组 ${menu.id}: 缺少 title 字段`)
    }
    
    // 检查菜单项
    menu.items?.forEach((item: any, itemIndex: number) => {
      if (!item.id) {
        errors.push(`菜单组 ${menu.id}, 项目 ${itemIndex}: 缺少 id 字段`)
      }
      
      if (!item.title) {
        errors.push(`功能 ${item.id}: 缺少 title 字段`)
      }
      
      // 检查存储键唯一性
      const storageKey = item.storageKey || item.id
      const duplicate = config.menus.flatMap((m: any) => m.items)
        .filter((i: any) => (i.storageKey || i.id) === storageKey)
      
      if (duplicate.length > 1) {
        warnings.push(`存储键 ${storageKey} 被多个功能使用`)
      }
    })
  })
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
```

### 2. 配置迁移工具

```typescript
// 迁移旧版本配置
const migrateNavigationConfig = (oldConfig: any, targetVersion: string): any => {
  const migratedConfig = { ...oldConfig }
  
  // 版本 1.0.0 → 1.1.0 迁移
  if (oldConfig.version === '1.0.0' && targetVersion === '1.1.0') {
    // 添加新字段
    migratedConfig.menus = migratedConfig.menus.map((menu: any) => ({
      ...menu,
      collapsible: menu.collapsible ?? true,
      defaultCollapsed: menu.defaultCollapsed ?? false,
      items: menu.items.map((item: any) => ({
        ...item,
        dependencies: item.dependencies || [],
        conflicts: item.conflicts || []
      }))
    }))
  }
  
  migratedConfig.version = targetVersion
  migratedConfig.lastUpdated = new Date().toISOString().split('T')[0]
  
  return migratedConfig
}
```

## 相关文档

- [配置文件概述](../overview.md) - 配置文件整体结构
- [功能配置文件](./feature-configs.md) - 功能配置详细说明
- [存储键命名规范](./storage-keys.md) - 存储键命名规范

---

*文档版本：1.0.0*  
*最后更新：2026-04-17*