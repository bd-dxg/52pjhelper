# 配置文件概述

本文档介绍了项目的配置文件结构、用途和配置方法。

## 配置文件结构

项目采用功能模块化的配置文件结构，每个功能模块的配置文件位于其对应的 `src/features/<name>/config.json`：

```
src/features/
├── navigation/config.json           # 导航菜单配置
├── versionCheck/config.json         # 版本更新检查配置
├── contentFilter/config.json        # 灌水筛选配置
├── avatarQuery/config.json          # 头像查询配置
├── quickReply/config.json           # 快捷回复配置
├── floorHighlighter/config.json     # 楼层高亮配置
├── nativeFloorDisplay/config.json   # 原生楼层显示配置
├── selectAll/config.json            # 全选功能配置
├── tableSelector/config.json        # 分表选择器配置
├── userLinkQuery/config.json        # 管理页面查询配置
├── autofills/config.json            # 自动填充配置
├── duplicateReplyDetection/config.json  # 重复回帖检测配置
├── rowClickToCheck/config.json      # 勾选范围配置
├── defaultTime/config.json          # 默认查询时间配置
├── duplicatePostDetection/config.json   # 重复发帖检测配置
├── userCloudDiskList/config.json    # 用户网盘名单配置
└── tableDataExtractor/config.json   # 表格数据提取配置
```

路径别名：
- `@features` → `./src/features/`
- `@` → `./src/`

## 配置文件类型

### 1. 导航配置 (`navigation/config.json`)

定义论坛导航菜单的显示/隐藏配置。

```json
{
  "storageKey": "52pjhelper_nav_config",
  "menus": [
    {
      "id": "mn_forum",
      "name": "网站",
      "selector": "#mn_forum"
    }
  ]
}
```

### 2. 功能配置 (`<feature>/config.json`)

每个功能模块独立维护自己的配置文件，定义功能名称、描述、开关状态等：

```json
{
  "name": "灌水筛选",
  "description": "在管理页面创建可拖动的过滤卡片",
  "defaultEnabled": true,
  "storageKey": "contentFilterEnabled"
}
```

## 配置加载机制

### 通过路径别名导入

配置文件通过 `@features` 别名导入：

```typescript
// 导入功能配置
import contentFilterConfig from '@features/contentFilter/config.json'
import navigationConfig from '@features/navigation/config.json'
import versionCheckConfig from '@features/versionCheck/config.json'
```

## 配置管理

### 1. 配置验证

配置文件通过 TypeScript 类型保证结构正确：

```typescript
// 配置接口定义
interface FeatureConfig {
  name: string
  description: string
  defaultEnabled?: boolean
  storageKey?: string
}

// 验证配置
const validateConfig = (config: unknown): config is FeatureConfig => {
  const cfg = config as Record<string, unknown>
  return typeof cfg?.name === 'string' && typeof cfg?.description === 'string'
}
```

### 2. 功能配置获取

每个功能从自己的 `config.json` 读取配置：

```typescript
import contentFilterConfig from '@features/contentFilter/config.json'

// 获取功能开关默认值
const getDefaultEnabled = (config: { defaultEnabled?: boolean }) => {
  return config.defaultEnabled ?? false
}
```

### 3. 配置更新

运行时通过 `browser.storage.local` 更新功能状态：

```typescript
// 更新功能开关状态
const setFeatureEnabled = async (storageKey: string, enabled: boolean) => {
  await browser.storage.local.set({ [storageKey]: enabled })
}
```

## 配置使用示例

### 1. 功能开关配置

```typescript
// 从功能目录的 config.json 中读取配置
import contentFilterConfig from '@features/contentFilter/config.json'

// 初始化功能开关
const initializeFeature = (config: { name: string; storageKey?: string; defaultEnabled?: boolean }) => {
  const storageKey = config.storageKey ?? 'unknown'

  return {
    name: config.name,
    storageKey,
    defaultEnabled: config.defaultEnabled ?? false,
  }
}
```

### 2. 导航菜单配置

```typescript
// 从配置生成导航菜单
import navigationConfig from '@features/navigation/config.json'

const generateNavigationMenu = () => {
  return navigationConfig.menus.map(menu => ({
    id: menu.id,
    name: menu.name,
    selector: menu.selector,
  }))
}
```

## 配置最佳实践

### 1. 模块化

- 每个功能的配置独立存放在 `src/features/<name>/config.json`
- 功能之间不共享配置文件

### 2. 向后兼容

- 新增字段应该是可选的
- 移除字段需要提供迁移路径
- 保持默认值与旧版本兼容

### 3. 配置验证

- 在加载时验证配置结构
- 提供详细的错误信息

### 4. 性能考虑

- 配置文件通过构建工具静态导入，无需运行时请求
- 缓存已加载的配置

## 配置调试

### 1. 配置查看

```typescript
// 查看功能配置
import contentFilterConfig from '@features/contentFilter/config.json'
import navigationConfig from '@features/navigation/config.json'

console.log('灌水筛选配置:', contentFilterConfig)
console.log('导航配置:', navigationConfig)
```

## 相关文档

- [导航菜单配置](./navigation-config.md) - 导航菜单详细配置说明
- [功能配置文件](./feature-configs.md) - 功能配置详细说明

---

_文档版本：2.0.0_  
_最后更新：2026-05-28_
