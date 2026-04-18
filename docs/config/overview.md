# 配置文件概述

本文档介绍了项目的配置文件结构、用途和配置方法。

## 配置文件结构

项目采用模块化的配置文件结构，所有配置文件都位于 `src/configs/` 目录下：

```
src/configs/
├── navigation.json          # 导航菜单配置
├── features/               # 功能配置文件目录
│   ├── general.json       # 通用功能配置
│   ├── admin.json         # 后台管理功能配置
│   └── auto-fill.json     # 自动填充功能配置
└── storage-keys.json      # 存储键命名规范
```

## 配置文件类型

### 1. 导航配置 (`navigation.json`)

定义浏览器扩展的导航菜单结构和行为。

```json
{
  "version": "1.0.0",
  "menus": [
    {
      "id": "general",
      "title": "通用功能",
      "items": [
        {
          "id": "dark-theme",
          "title": "深色主题",
          "description": "自动检测系统主题或手动切换深色模式",
          "defaultEnabled": true
        }
      ]
    }
  ]
}
```

### 2. 功能配置 (`features/` 目录)

按功能分组的功能开关配置。

```json
{
  "version": "1.0.0",
  "features": {
    "dark-theme": {
      "name": "深色主题",
      "description": "自动检测系统主题或手动切换深色模式",
      "category": "general",
      "defaultEnabled": true,
      "storageKey": "dark_theme_enabled"
    }
  }
}
```

### 3. 存储键配置 (`storage-keys.json`)

定义浏览器存储中使用的键名规范。

```json
{
  "version": "1.0.0",
  "keys": {
    "user_settings": "user_settings",
    "feature_toggles": "feature_toggles",
    "navigation_state": "navigation_state"
  }
}
```

## 配置加载机制

### 自动加载

配置文件在应用启动时自动加载：

```typescript
// 配置文件加载器
import navigationConfig from '@/configs/navigation.json'
import generalFeatures from '@/configs/features/general.json'
import adminFeatures from '@/configs/features/admin.json'

// 合并配置
const allFeatures = {
  ...generalFeatures.features,
  ...adminFeatures.features,
}
```

### 动态导入

支持按需动态导入配置文件：

```typescript
// 动态加载配置
const loadFeatureConfig = async (category: string) => {
  const config = await import(`@/configs/features/${category}.json`)
  return config.default
}
```

## 配置管理

### 1. 配置验证

所有配置文件都包含版本号和结构验证：

```typescript
// 配置验证接口
interface BaseConfig {
  version: string
  [key: string]: any
}

// 验证配置版本
const validateConfig = (config: BaseConfig, expectedVersion: string): boolean => {
  return config.version === expectedVersion
}
```

### 2. 配置合并

支持多配置文件合并：

```typescript
// 合并功能配置
const mergeFeatureConfigs = (configs: FeatureConfig[]): FeatureConfig => {
  return configs.reduce(
    (merged, config) => {
      return {
        ...merged,
        features: {
          ...merged.features,
          ...config.features,
        },
      }
    },
    { version: '1.0.0', features: {} },
  )
}
```

### 3. 配置更新

支持运行时配置更新：

```typescript
// 更新配置
const updateConfig = async (configPath: string, updates: any) => {
  const currentConfig = await loadConfig(configPath)
  const newConfig = { ...currentConfig, ...updates }

  // 验证新配置
  if (validateConfig(newConfig)) {
    await saveConfig(configPath, newConfig)
    return true
  }
  return false
}
```

## 配置使用示例

### 1. 功能开关配置

```typescript
// 从配置中获取功能设置
const getFeatureConfig = (featureId: string) => {
  const allConfigs = loadAllFeatureConfigs()
  return allConfigs.features[featureId]
}

// 使用配置初始化功能
const initializeFeature = (featureId: string) => {
  const config = getFeatureConfig(featureId)

  if (!config) {
    throw new Error(`未找到功能配置: ${featureId}`)
  }

  return {
    id: featureId,
    name: config.name,
    description: config.description,
    defaultEnabled: config.defaultEnabled,
    storageKey: config.storageKey,
  }
}
```

### 2. 导航菜单配置

```typescript
// 从配置生成导航菜单
const generateNavigationMenu = () => {
  const config = navigationConfig

  return config.menus.map(menu => ({
    id: menu.id,
    title: menu.title,
    items: menu.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      enabled: getFeatureState(item.id),
    })),
  }))
}
```

### 3. 存储键配置

```typescript
// 使用规范的存储键
import storageKeys from '@/configs/storage-keys.json'

const saveUserSettings = async (settings: UserSettings) => {
  await browser.storage.local.set({
    [storageKeys.keys.user_settings]: settings,
  })
}

const loadUserSettings = async (): Promise<UserSettings> => {
  const result = await browser.storage.local.get(storageKeys.keys.user_settings)
  return result[storageKeys.keys.user_settings]
}
```

## 配置最佳实践

### 1. 版本控制

- 每个配置文件都必须包含 `version` 字段
- 版本号遵循语义化版本规范 (SemVer)
- 重大变更需要升级主版本号

### 2. 向后兼容

- 新增字段应该是可选的
- 移除字段需要提供迁移路径
- 保持默认值与旧版本兼容

### 3. 配置验证

- 在加载时验证配置结构
- 提供详细的错误信息
- 支持配置修复或回退

### 4. 性能考虑

- 按需加载配置，避免一次性加载所有配置
- 缓存已加载的配置
- 支持配置热更新

## 配置调试

### 1. 配置查看

```typescript
// 查看所有配置
const viewAllConfigs = () => {
  console.log('导航配置:', navigationConfig)
  console.log('功能配置:', loadAllFeatureConfigs())
  console.log('存储键配置:', storageKeys)
}
```

### 2. 配置验证

```typescript
// 验证所有配置
const validateAllConfigs = () => {
  const configs = [
    { name: 'navigation', config: navigationConfig, version: '1.0.0' },
    { name: 'features-general', config: generalFeatures, version: '1.0.0' },
    { name: 'storage-keys', config: storageKeys, version: '1.0.0' },
  ]

  const results = configs.map(({ name, config, version }) => ({
    name,
    valid: validateConfig(config, version),
    version: config.version,
  }))

  console.log('配置验证结果:', results)
  return results.every(result => result.valid)
}
```

### 3. 配置导出

```typescript
// 导出当前配置
const exportConfigs = () => {
  const configs = {
    navigation: navigationConfig,
    features: loadAllFeatureConfigs(),
    storageKeys: storageKeys,
  }

  const blob = new Blob([JSON.stringify(configs, null, 2)], {
    type: 'application/json',
  })

  return URL.createObjectURL(blob)
}
```

## 相关文档

- [导航菜单配置](./navigation-config.md) - 导航菜单详细配置说明
- [功能配置文件](./feature-configs.md) - 功能配置详细说明
- [存储键命名规范](./storage-keys.md) - 存储键命名规范

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
