# 功能配置文件

本文档详细介绍了功能配置文件的格式、结构和配置选项。

## 配置文件位置

功能配置文件按类别分组，位于 `src/configs/features/` 目录：

```
src/configs/features/
├── general.json       # 通用功能配置
├── admin.json         # 后台管理功能配置
├── auto-fill.json     # 自动填充功能配置
└── ...                # 其他功能配置文件
```

## 配置结构

### 完整配置示例

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "category": "general",
  "description": "通用功能配置",
  "features": {
    "dark-theme": {
      "name": "深色主题",
      "description": "自动检测系统主题或手动切换深色模式",
      "category": "appearance",
      "defaultEnabled": true,
      "storageKey": "dark_theme_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "autoDetect": true,
        "defaultTheme": "system",
        "schedule": {
          "enabled": false,
          "startTime": "18:00",
          "endTime": "08:00"
        }
      }
    }
  }
}
```

## 配置字段说明

### 根级字段

| 字段          | 类型     | 必填 | 说明         | 示例             |
| ------------- | -------- | ---- | ------------ | ---------------- |
| `version`     | `string` | 是   | 配置版本号   | `"1.0.0"`        |
| `lastUpdated` | `string` | 否   | 最后更新时间 | `"2026-04-17"`   |
| `category`    | `string` | 是   | 功能分类     | `"general"`      |
| `description` | `string` | 否   | 配置描述     | `"通用功能配置"` |
| `features`    | `object` | 是   | 功能配置对象 | `{...}`          |

### 功能配置字段

| 字段             | 类型       | 必填 | 说明             | 示例                                   |
| ---------------- | ---------- | ---- | ---------------- | -------------------------------------- |
| `name`           | `string`   | 是   | 功能名称         | `"深色主题"`                           |
| `description`    | `string`   | 是   | 功能详细描述     | `"自动检测系统主题或手动切换深色模式"` |
| `category`       | `string`   | 否   | 功能子分类       | `"appearance"`                         |
| `defaultEnabled` | `boolean`  | 否   | 默认启用状态     | `true`                                 |
| `storageKey`     | `string`   | 否   | 存储键名         | `"dark_theme_enabled"`                 |
| `requiresReload` | `boolean`  | 否   | 是否需要刷新页面 | `false`                                |
| `dependencies`   | `string[]` | 否   | 依赖的功能ID     | `["feature-a"]`                        |
| `conflicts`      | `string[]` | 否   | 冲突的功能ID     | `["feature-b"]`                        |
| `settings`       | `object`   | 否   | 功能特定设置     | `{...}`                                |

## 配置文件示例

### 1. 通用功能配置 (`general.json`)

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "category": "general",
  "description": "适用于所有用户的通用功能",
  "features": {
    "dark-theme": {
      "name": "深色主题",
      "description": "自动检测系统主题或手动切换深色模式",
      "category": "appearance",
      "defaultEnabled": true,
      "storageKey": "dark_theme_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "autoDetect": true,
        "defaultTheme": "system"
      }
    },
    "compact-layout": {
      "name": "紧凑布局",
      "description": "优化组件间距，提供更紧凑的界面布局",
      "category": "layout",
      "defaultEnabled": false,
      "storageKey": "compact_layout_enabled",
      "requiresReload": true,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "spacingLevel": "medium",
        "fontSize": "default"
      }
    },
    "navigation-management": {
      "name": "导航菜单管理",
      "description": "自定义显示/隐藏导航菜单项",
      "category": "navigation",
      "defaultEnabled": true,
      "storageKey": "navigation_management_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "defaultVisible": true,
        "rememberState": true
      }
    }
  }
}
```

### 2. 后台管理功能配置 (`admin.json`)

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "category": "admin",
  "description": "论坛管理专用功能",
  "features": {
    "avatar-query": {
      "name": "头像查询",
      "description": "鼠标悬停显示用户违规记录",
      "category": "user-management",
      "defaultEnabled": true,
      "storageKey": "avatar_query_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "cacheDuration": 3600,
        "showDetails": true,
        "highlightColor": "#ff6b6b"
      }
    },
    "quick-reply": {
      "name": "快捷回复",
      "description": "举报处理页面快捷回复模板",
      "category": "moderation",
      "defaultEnabled": true,
      "storageKey": "quick_reply_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "templates": ["已处理，感谢反馈", "请提供更多信息", "已警告用户"],
        "autoInsert": true
      }
    },
    "auto-fill": {
      "name": "自动填充",
      "description": "智能表单自动填充，提高管理效率",
      "category": "automation",
      "defaultEnabled": true,
      "storageKey": "auto_fill_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "autoDetectForms": true,
        "fillDelay": 500,
        "confirmBeforeFill": true
      }
    }
  }
}
```

### 3. 自动填充功能配置 (`auto-fill.json`)

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "category": "auto-fill",
  "description": "自动填充功能详细配置",
  "features": {
    "auto-fill-basic": {
      "name": "基础自动填充",
      "description": "自动填充常见表单字段",
      "category": "basic",
      "defaultEnabled": true,
      "storageKey": "auto_fill_basic_enabled",
      "requiresReload": false,
      "dependencies": [],
      "conflicts": [],
      "settings": {
        "fields": ["username", "email", "phone"],
        "autoSave": true,
        "encryption": false
      }
    },
    "auto-fill-advanced": {
      "name": "高级自动填充",
      "description": "智能识别和填充复杂表单",
      "category": "advanced",
      "defaultEnabled": false,
      "storageKey": "auto_fill_advanced_enabled",
      "requiresReload": false,
      "dependencies": ["auto-fill-basic"],
      "conflicts": [],
      "settings": {
        "useAI": true,
        "confidenceThreshold": 0.8,
        "learningEnabled": true
      }
    },
    "auto-fill-templates": {
      "name": "模板管理",
      "description": "管理自动填充模板",
      "category": "templates",
      "defaultEnabled": true,
      "storageKey": "auto_fill_templates_enabled",
      "requiresReload": false,
      "dependencies": ["auto-fill-basic"],
      "conflicts": [],
      "settings": {
        "maxTemplates": 10,
        "syncAcrossDevices": false,
        "backupEnabled": true
      }
    }
  }
}
```

## 配置加载和使用

### 1. 加载功能配置

```typescript
// 加载特定类别的功能配置
import generalFeatures from '@/configs/features/general.json'
import adminFeatures from '@/configs/features/admin.json'

// 合并所有功能配置
const loadAllFeatures = () => {
  const configs = [generalFeatures, adminFeatures]

  return configs.reduce((allFeatures, config) => {
    return {
      ...allFeatures,
      ...config.features,
    }
  }, {})
}

// 获取所有功能配置
const allFeatures = loadAllFeatures()
```

### 2. 功能配置验证

```typescript
// 验证功能配置
interface FeatureConfig {
  name: string
  description: string
  category?: string
  defaultEnabled?: boolean
  storageKey?: string
  requiresReload?: boolean
  dependencies?: string[]
  conflicts?: string[]
  settings?: Record<string, any>
}

const validateFeatureConfig = (config: any): config is FeatureConfig => {
  if (!config.name || !config.description) {
    return false
  }

  // 验证依赖和冲突
  if (config.dependencies && !Array.isArray(config.dependencies)) {
    return false
  }

  if (config.conflicts && !Array.isArray(config.conflicts)) {
    return false
  }

  return true
}

// 验证配置文件
const validateFeatureFile = (configFile: any): boolean => {
  if (!configFile.version || !configFile.features) {
    return false
  }

  // 验证所有功能配置
  return Object.values(configFile.features).every(validateFeatureConfig)
}
```

### 3. 功能状态管理

```typescript
// 使用功能配置初始化状态
const initializeFeatureState = (featureId: string) => {
  const featureConfig = allFeatures[featureId]

  if (!featureConfig) {
    throw new Error(`未找到功能配置: ${featureId}`)
  }

  const storageKey = featureConfig.storageKey || featureId

  return {
    id: featureId,
    name: featureConfig.name,
    description: featureConfig.description,
    category: featureConfig.category,
    defaultEnabled: featureConfig.defaultEnabled ?? false,
    storageKey,
    requiresReload: featureConfig.requiresReload ?? false,
    dependencies: featureConfig.dependencies || [],
    conflicts: featureConfig.conflicts || [],
    settings: featureConfig.settings || {},
  }
}

// 获取功能状态
const getFeatureState = async (featureId: string): Promise<boolean> => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig) {
    return false
  }

  const storageKey = featureConfig.storageKey || featureId
  const result = await browser.storage.local.get(storageKey)

  if (result[storageKey] !== undefined) {
    return result[storageKey]
  }

  // 返回默认值
  return featureConfig.defaultEnabled ?? false
}
```

### 4. 功能设置管理

```typescript
// 获取功能设置
const getFeatureSettings = (featureId: string): Record<string, any> => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig) {
    return {}
  }

  return featureConfig.settings || {}
}

// 更新功能设置
const updateFeatureSettings = async (featureId: string, updates: Record<string, any>): Promise<boolean> => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig) {
    return false
  }

  const settingsKey = `${featureId}_settings`
  const currentSettings = await browser.storage.local.get(settingsKey)

  const newSettings = {
    ...(currentSettings[settingsKey] || {}),
    ...updates,
  }

  await browser.storage.local.set({
    [settingsKey]: newSettings,
  })

  return true
}
```

## 高级配置功能

### 1. 功能依赖管理

```typescript
// 检查功能依赖
const checkFeatureDependencies = (featureId: string): string[] => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig?.dependencies) {
    return []
  }

  const unmetDependencies = featureConfig.dependencies.filter(depId => {
    const depConfig = allFeatures[depId]
    if (!depConfig) {
      console.warn(`依赖功能不存在: ${depId}`)
      return true
    }

    // 检查依赖功能是否启用
    return !getFeatureState(depId)
  })

  return unmetDependencies
}

// 启用功能及其依赖
const enableFeatureWithDependencies = async (featureId: string): Promise<boolean> => {
  const unmetDependencies = checkFeatureDependencies(featureId)

  if (unmetDependencies.length > 0) {
    // 先启用依赖
    for (const depId of unmetDependencies) {
      await enableFeatureWithDependencies(depId)
    }
  }

  // 启用目标功能
  await setFeatureState(featureId, true)
  return true
}
```

### 2. 功能冲突解决

```typescript
// 检查功能冲突
const checkFeatureConflicts = (featureId: string): string[] => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig?.conflicts) {
    return []
  }

  const activeConflicts = featureConfig.conflicts.filter(conflictId => {
    const conflictConfig = allFeatures[conflictId]
    if (!conflictConfig) {
      return false
    }

    // 检查冲突功能是否启用
    return getFeatureState(conflictId)
  })

  return activeConflicts
}

// 解决功能冲突
const resolveFeatureConflicts = async (featureId: string): Promise<boolean> => {
  const activeConflicts = checkFeatureConflicts(featureId)

  if (activeConflicts.length > 0) {
    // 询问用户或自动处理冲突
    const shouldDisableConflicts = confirm(
      `启用 ${featureId} 将禁用以下冲突功能:\n${activeConflicts.join(', ')}\n是否继续?`,
    )

    if (!shouldDisableConflicts) {
      return false
    }

    // 禁用冲突功能
    for (const conflictId of activeConflicts) {
      await setFeatureState(conflictId, false)
    }
  }

  // 启用目标功能
  await setFeatureState(featureId, true)
  return true
}
```

### 3. 功能设置验证

```typescript
// 定义设置验证规则
interface SettingValidationRule {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  enum?: any[]
}

// 功能设置验证
const validateFeatureSettings = (featureId: string, settings: Record<string, any>): ValidationResult => {
  const featureConfig = allFeatures[featureId]
  if (!featureConfig?.settings) {
    return { valid: true, errors: [] }
  }

  const errors: string[] = []
  const defaultSettings = featureConfig.settings

  // 验证每个设置项
  Object.entries(settings).forEach(([key, value]) => {
    const defaultValue = defaultSettings[key]

    if (defaultValue === undefined) {
      errors.push(`未知设置项: ${key}`)
      return
    }

    // 类型检查
    if (typeof value !== typeof defaultValue) {
      errors.push(`设置项 ${key} 类型不匹配: 期望 ${typeof defaultValue}, 实际 ${typeof value}`)
    }

    // 数组长度检查
    if (Array.isArray(defaultValue) && Array.isArray(value)) {
      if (value.length === 0 && defaultValue.length > 0) {
        errors.push(`设置项 ${key} 不能为空数组`)
      }
    }

    // 数字范围检查
    if (typeof defaultValue === 'number' && typeof value === 'number') {
      if (key.includes('Threshold') && (value < 0 || value > 1)) {
        errors.push(`设置项 ${key} 必须在 0-1 之间`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

## 配置维护工具

### 1. 配置导出工具

```typescript
// 导出功能配置
const exportFeatureConfig = (category?: string): string => {
  let configToExport: any

  if (category) {
    // 导出特定类别
    const configFile = require(`@/configs/features/${category}.json`)
    configToExport = configFile
  } else {
    // 导出所有配置
    configToExport = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      features: loadAllFeatures(),
    }
  }

  return JSON.stringify(configToExport, null, 2)
}

// 下载配置
const downloadFeatureConfig = (category?: string) => {
  const configStr = exportFeatureConfig(category)
  const filename = category ? `features-${category}.json` : 'all-features.json'

  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
```

### 2. 配置导入工具

```typescript
// 导入功能配置
const importFeatureConfig = async (configStr: string, category: string): Promise<boolean> => {
  try {
    const config = JSON.parse(configStr)

    // 验证配置
    if (!validateFeatureFile(config)) {
      throw new Error('无效的功能配置')
    }

    // 保存配置
    const configPath = `src/configs/features/${category}.json`
    await saveConfigFile(configPath, config)

    return true
  } catch (error) {
    console.error('导入功能配置失败:', error)
    return false
  }
}

// 从文件导入
const importFeatureConfigFromFile = async (file: File): Promise<boolean> => {
  const text = await file.text()
  const category = file.name.replace('features-', '').replace('.json', '')

  return await importFeatureConfig(text, category)
}
```

### 3. 配置迁移工具

```typescript
// 迁移功能配置
const migrateFeatureConfig = (oldConfig: any, targetVersion: string): any => {
  const migratedConfig = { ...oldConfig }

  // 版本 1.0.0 → 1.1.0 迁移
  if (oldConfig.version === '1.0.0' && targetVersion === '1.1.0') {
    // 为所有功能添加默认设置
    migratedConfig.features = Object.entries(oldConfig.features).reduce(
      (acc, [featureId, featureConfig]: [string, any]) => {
        acc[featureId] = {
          ...featureConfig,
          dependencies: featureConfig.dependencies || [],
          conflicts: featureConfig.conflicts || [],
          settings: featureConfig.settings || {},
        }
        return acc
      },
      {} as Record<string, any>,
    )
  }

  migratedConfig.version = targetVersion
  migratedConfig.lastUpdated = new Date().toISOString().split('T')[0]

  return migratedConfig
}
```

## 相关文档

- [配置文件概述](../overview.md) - 配置文件整体结构
- [导航菜单配置](./navigation-config.md) - 导航菜单详细配置
- [存储键命名规范](./storage-keys.md) - 存储键命名规范

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
