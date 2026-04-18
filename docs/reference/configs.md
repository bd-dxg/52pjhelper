# JSON 配置文件参考

本文档详细介绍了项目中所有的 JSON 配置文件，包括文件结构、字段说明和配置示例。

## 配置文件目录结构

```
src/configs/
├── navigation.json          # 导航菜单配置
├── storage-keys.json       # 存储键命名规范
└── features/               # 功能配置文件目录
    ├── general.json       # 通用功能配置
    ├── admin.json         # 后台管理功能配置
    ├── auto-fill.json     # 自动填充功能配置
    └── ...                # 其他功能配置文件
```

## 导航菜单配置 (navigation.json)

### 文件位置

`src/configs/navigation.json`

### 文件结构

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

### 字段说明

#### 根级字段

| 字段          | 类型     | 必填 | 说明         | 示例           |
| ------------- | -------- | ---- | ------------ | -------------- |
| `version`     | `string` | 是   | 配置版本号   | `"1.0.0"`      |
| `lastUpdated` | `string` | 否   | 最后更新时间 | `"2026-04-17"` |
| `menus`       | `Menu[]` | 是   | 菜单组数组   | `[...]`        |

#### 菜单组字段 (Menu)

| 字段               | 类型         | 必填 | 说明             | 示例                             |
| ------------------ | ------------ | ---- | ---------------- | -------------------------------- |
| `id`               | `string`     | 是   | 菜单组唯一标识符 | `"general"`                      |
| `title`            | `string`     | 是   | 菜单组显示标题   | `"通用功能"`                     |
| `icon`             | `string`     | 否   | 菜单组图标名称   | `"settings"`                     |
| `description`      | `string`     | 否   | 菜单组描述文本   | `"适用于所有用户的通用功能设置"` |
| `collapsible`      | `boolean`    | 否   | 是否可折叠       | `true`                           |
| `defaultCollapsed` | `boolean`    | 否   | 默认是否折叠     | `false`                          |
| `items`            | `MenuItem[]` | 是   | 菜单项数组       | `[...]`                          |

#### 菜单项字段 (MenuItem)

| 字段             | 类型       | 必填 | 说明             | 示例                                   |
| ---------------- | ---------- | ---- | ---------------- | -------------------------------------- |
| `id`             | `string`   | 是   | 功能唯一标识符   | `"dark-theme"`                         |
| `title`          | `string`   | 是   | 功能显示标题     | `"深色主题"`                           |
| `description`    | `string`   | 否   | 功能详细描述     | `"自动检测系统主题或手动切换深色模式"` |
| `icon`           | `string`   | 否   | 功能图标名称     | `"moon"`                               |
| `category`       | `string`   | 否   | 功能分类         | `"appearance"`                         |
| `defaultEnabled` | `boolean`  | 否   | 默认是否启用     | `true`                                 |
| `requiresReload` | `boolean`  | 否   | 是否需要刷新页面 | `false`                                |
| `storageKey`     | `string`   | 否   | 存储键名         | `"dark_theme_enabled"`                 |
| `dependencies`   | `string[]` | 否   | 依赖的其他功能ID | `["feature-a"]`                        |
| `conflicts`      | `string[]` | 否   | 冲突的其他功能ID | `["feature-b"]`                        |

### 配置示例

#### 通用功能菜单组

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
    }
  ]
}
```

## 存储键命名规范 (storage-keys.json)

### 文件位置

`src/configs/storage-keys.json`

### 文件结构

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "description": "浏览器存储键命名规范",
  "keys": {
    "user_settings": "user_settings",
    "feature_toggles": "feature_toggles",
    "navigation_state": "navigation_state",
    "app_config": "app_config",
    "session_data": "session_data"
  },
  "patterns": {
    "feature": "{feature_name}_enabled",
    "feature_settings": "{feature_name}_settings",
    "user_data": "user_{data_type}",
    "cache": "cache_{cache_key}"
  }
}
```

### 字段说明

#### 根级字段

| 字段          | 类型     | 必填 | 说明           | 示例                     |
| ------------- | -------- | ---- | -------------- | ------------------------ |
| `version`     | `string` | 是   | 配置版本号     | `"1.0.0"`                |
| `lastUpdated` | `string` | 否   | 最后更新时间   | `"2026-04-17"`           |
| `description` | `string` | 否   | 配置描述       | `"浏览器存储键命名规范"` |
| `keys`        | `object` | 是   | 预定义存储键   | `{...}`                  |
| `patterns`    | `object` | 否   | 存储键命名模式 | `{...}`                  |

#### 预定义存储键

| 键名               | 类型     | 说明         | 使用场景                  |
| ------------------ | -------- | ------------ | ------------------------- |
| `user_settings`    | `string` | 用户设置     | 存储用户个性化设置        |
| `feature_toggles`  | `string` | 功能开关状态 | 存储所有功能启用状态      |
| `navigation_state` | `string` | 导航状态     | 存储导航菜单展开/折叠状态 |
| `app_config`       | `string` | 应用配置     | 存储应用级配置            |
| `session_data`     | `string` | 会话数据     | 存储临时会话数据          |

#### 命名模式

| 模式               | 格式                      | 示例                  | 说明         |
| ------------------ | ------------------------- | --------------------- | ------------ |
| `feature`          | `{feature_name}_enabled`  | `dark_theme_enabled`  | 功能开关状态 |
| `feature_settings` | `{feature_name}_settings` | `dark_theme_settings` | 功能特定设置 |
| `user_data`        | `user_{data_type}`        | `user_preferences`    | 用户数据     |
| `cache`            | `cache_{cache_key}`       | `cache_user_avatar`   | 缓存数据     |

### 配置示例

#### 完整配置示例

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-04-17",
  "description": "浏览器存储键命名规范",
  "keys": {
    "user_settings": "user_settings",
    "feature_toggles": "feature_toggles",
    "navigation_state": "navigation_state",
    "app_config": "app_config",
    "session_data": "session_data",
    "theme_preferences": "theme_preferences",
    "language_settings": "language_settings",
    "notification_preferences": "notification_preferences",
    "accessibility_settings": "accessibility_settings",
    "privacy_settings": "privacy_settings"
  },
  "patterns": {
    "feature": "{feature_name}_enabled",
    "feature_settings": "{feature_name}_settings",
    "user_data": "user_{data_type}",
    "cache": "cache_{cache_key}",
    "temp": "temp_{identifier}",
    "sync": "sync_{data_type}"
  }
}
```

## 功能配置文件 (features/)

### 文件位置

`src/configs/features/`

### 通用功能配置 (general.json)

#### 文件结构

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

#### 字段说明

| 字段          | 类型     | 必填 | 说明         | 示例                         |
| ------------- | -------- | ---- | ------------ | ---------------------------- |
| `version`     | `string` | 是   | 配置版本号   | `"1.0.0"`                    |
| `lastUpdated` | `string` | 否   | 最后更新时间 | `"2026-04-17"`               |
| `category`    | `string` | 是   | 功能分类     | `"general"`                  |
| `description` | `string` | 否   | 配置描述     | `"适用于所有用户的通用功能"` |
| `features`    | `object` | 是   | 功能配置对象 | `{...}`                      |

#### 功能配置字段

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

### 后台管理功能配置 (admin.json)

#### 配置示例

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
    }
  }
}
```

### 自动填充功能配置 (auto-fill.json)

#### 配置示例

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
    }
  }
}
```

## 配置文件加载和使用

### 1. 导入配置文件

```typescript
// 导入导航配置
import navigationConfig from '@/configs/navigation.json'

// 导入功能配置
import generalFeatures from '@/configs/features/general.json'
import adminFeatures from '@/configs/features/admin.json'

// 导入存储键配置
import storageKeys from '@/configs/storage-keys.json'
```

### 2. 配置验证

```typescript
// 验证配置结构
const validateConfig = (config: any, schema: any): boolean => {
  // 检查必填字段
  if (!config.version) {
    return false
  }

  // 根据 schema 验证配置
  // ...

  return true
}

// 验证导航配置
if (!validateConfig(navigationConfig, navigationSchema)) {
  throw new Error('无效的导航配置')
}
```

### 3. 配置合并

```typescript
// 合并所有功能配置
const mergeFeatureConfigs = (configs: any[]): any => {
  return configs.reduce((merged, config) => {
    return {
      ...merged,
      ...config.features,
    }
  }, {})
}

// 获取所有功能配置
const allFeatures = mergeFeatureConfigs([generalFeatures, adminFeatures])
```

### 4. 配置使用

```typescript
// 使用导航配置生成菜单
const generateNavigationMenu = () => {
  return navigationConfig.menus.map(menu => ({
    id: menu.id,
    title: menu.title,
    items: menu.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      enabled: getFeatureState(item.storageKey || item.id),
    })),
  }))
}

// 使用存储键配置
const saveUserSettings = async (settings: any) => {
  await browser.storage.local.set({
    [storageKeys.keys.user_settings]: settings,
  })
}
```

## 配置管理工具

### 1. 配置查看工具

```typescript
// 查看所有配置
const viewAllConfigs = () => {
  console.log('=== 导航配置 ===')
  console.log(JSON.stringify(navigationConfig, null, 2))

  console.log('=== 功能配置 ===')
  console.log(JSON.stringify(allFeatures, null, 2))

  console.log('=== 存储键配置 ===')
  console.log(JSON.stringify(storageKeys, null, 2))
}
```

### 2. 配置验证工具

```typescript
// 验证所有配置
const validateAllConfigs = (): ValidationResult => {
  const errors: string[] = []

  // 验证导航配置
  if (!navigationConfig.menus || !Array.isArray(navigationConfig.menus)) {
    errors.push('导航配置缺少 menus 字段或格式错误')
  }

  // 验证功能配置
  if (!allFeatures || typeof allFeatures !== 'object') {
    errors.push('功能配置格式错误')
  }

  // 验证存储键配置
  if (!storageKeys.keys || typeof storageKeys.keys !== 'object') {
    errors.push('存储键配置缺少 keys 字段或格式错误')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### 3. 配置导出工具

```typescript
// 导出配置
const exportConfig = (configName: string): string => {
  let config: any

  switch (configName) {
    case 'navigation':
      config = navigationConfig
      break
    case 'features':
      config = allFeatures
      break
    case 'storage-keys':
      config = storageKeys
      break
    default:
      config = {
        navigation: navigationConfig,
        features: allFeatures,
        storageKeys: storageKeys,
      }
  }

  return JSON.stringify(config, null, 2)
}

// 下载配置
const downloadConfig = (configName: string) => {
  const configStr = exportConfig(configName)
  const filename = `${configName}-config-${new Date().toISOString().split('T')[0]}.json`

  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
```

### 4. 配置导入工具

```typescript
// 导入配置
const importConfig = async (configStr: string, configType: string): Promise<boolean> => {
  try {
    const config = JSON.parse(configStr)

    // 验证配置
    if (!config.version) {
      throw new Error('配置缺少 version 字段')
    }

    // 根据配置类型处理
    switch (configType) {
      case 'navigation':
        // 保存导航配置
        await saveConfigFile('src/configs/navigation.json', config)
        break
      case 'features':
        // 保存功能配置
        await saveConfigFile('src/configs/features/imported.json', config)
        break
      default:
        throw new Error(`不支持的配置类型: ${configType}`)
    }

    return true
  } catch (error) {
    console.error('导入配置失败:', error)
    return false
  }
}
```

## 配置更新和维护

### 1. 添加新功能配置

```json
{
  "new-feature": {
    "name": "新功能",
    "description": "新功能的详细描述",
    "category": "new",
    "defaultEnabled": false,
    "storageKey": "new_feature_enabled",
    "requiresReload": false,
    "dependencies": [],
    "conflicts": [],
    "settings": {
      "option1": "value1",
      "option2": "value2"
    }
  }
}
```

### 2. 更新现有配置

```json
{
  "existing-feature": {
    "name": "更新后的功能名称",
    "description": "更新后的功能描述",
    "category": "updated-category",
    "defaultEnabled": true,
    "storageKey": "existing_feature_enabled",
    "requiresReload": true,
    "dependencies": ["new-dependency"],
    "conflicts": ["conflicting-feature"],
    "settings": {
      "newOption": "newValue",
      "existingOption": "updatedValue"
    }
  }
}
```

### 3. 配置版本迁移

```typescript
// 配置迁移函数
const migrateConfig = (oldConfig: any, targetVersion: string): any => {
  const migratedConfig = { ...oldConfig }

  // 版本 1.0.0 → 1.1.0 迁移
  if (oldConfig.version === '1.0.0' && targetVersion === '1.1.0') {
    // 添加新字段
    if (migratedConfig.menus) {
      migratedConfig.menus = migratedConfig.menus.map((menu: any) => ({
        ...menu,
        collapsible: menu.collapsible ?? true,
        defaultCollapsed: menu.defaultCollapsed ?? false,
      }))
    }

    // 更新功能配置
    if (migratedConfig.features) {
      migratedConfig.features = Object.entries(migratedConfig.features).reduce(
        (acc, [key, value]: [string, any]) => {
          acc[key] = {
            ...value,
            dependencies: value.dependencies || [],
            conflicts: value.conflicts || [],
          }
          return acc
        },
        {} as Record<string, any>,
      )
    }
  }

  migratedConfig.version = targetVersion
  migratedConfig.lastUpdated = new Date().toISOString().split('T')[0]

  return migratedConfig
}
```

## 配置最佳实践

### 1. 版本控制

- 每个配置文件必须包含 `version` 字段
- 使用语义化版本 (SemVer)
- 重大变更时升级主版本号

### 2. 向后兼容

- 新增字段应该是可选的
- 移除字段时提供迁移路径
- 保持默认值与旧版本兼容

### 3. 配置验证

- 在加载时验证配置结构
- 提供详细的错误信息
- 支持配置修复或回退

### 4. 性能考虑

- 按需加载配置
- 缓存已加载的配置
- 支持配置热更新

## 相关文档

- [配置文件概述](../config/overview.md) - 配置文件整体结构
- [导航菜单配置](../config/navigation-config.md) - 导航菜单详细配置
- [功能配置文件](../config/feature-configs.md) - 功能配置详细说明
- [存储键命名规范](../config/storage-keys.md) - 存储键命名规范

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
