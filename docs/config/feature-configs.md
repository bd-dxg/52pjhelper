# 功能配置文件

本文档详细介绍了功能配置文件的格式、结构和配置选项。

## 配置文件位置

每个功能模块的配置文件独立存放在其功能目录下：

```
src/features/<name>/config.json
```

当前所有功能配置文件：

```
src/features/
├── navigation/config.json              # 导航菜单配置
├── versionCheck/config.json            # 版本更新检查配置
├── contentFilter/config.json           # 灌水筛选配置
├── avatarQuery/config.json             # 头像查询配置
├── quickReply/config.json              # 快捷回复配置
├── floorHighlighter/config.json        # 楼层高亮配置
├── nativeFloorDisplay/config.json      # 原生楼层显示配置
├── selectAll/config.json               # 全选功能配置
├── tableSelector/config.json           # 分表选择器配置
├── userLinkQuery/config.json           # 管理页面查询配置
├── autofills/config.json               # 自动填充配置
├── duplicateReplyDetection/config.json # 重复回帖检测配置
├── rowClickToCheck/config.json         # 勾选范围配置
├── defaultTime/config.json             # 默认查询时间配置
├── duplicatePostDetection/config.json  # 重复发帖检测配置
├── userCloudDiskList/config.json       # 用户网盘名单配置
└── tableDataExtractor/config.json      # 表格数据提取配置
```

通过 `@features` 路径别名导入：

```typescript
import contentFilterConfig from '@features/contentFilter/config.json'
import versionCheckConfig from '@features/versionCheck/config.json'
```

## 配置结构

### 完整配置示例（以灌水筛选为例）

```json
{
  "name": "灌水筛选",
  "description": "在管理页面创建可拖动的过滤卡片，支持正则和简单匹配，高亮符合条件的行",
  "defaultEnabled": true,
  "storageKey": "contentFilterEnabled",
  "filtersStorageKey": "contentFilterRules",
  "maxTextLength": 12,
  "targetPages": ["forum.php?mod=modcp&action=thread&op=post"],
  "presets": [
    {
      "name": "常见灌水",
      "pattern": "mark|推荐|好用|方便|需要|厉害",
      "isRegex": true
    }
  ]
}
```

## 配置字段说明

### 通用字段

| 字段             | 类型       | 必填 | 说明                   | 示例                            |
| ---------------- | ---------- | ---- | ---------------------- | ------------------------------- |
| `name`           | `string`   | 是   | 功能名称               | `"灌水筛选"`                    |
| `description`    | `string`   | 是   | 功能详细描述           | `"在管理页面创建可拖动的过滤卡片"` |
| `defaultEnabled` | `boolean`  | 否   | 默认启用状态           | `true`                          |
| `storageKey`     | `string`   | 是   | 功能开关的存储键名     | `"contentFilterEnabled"`        |

### 功能特定字段

不同功能可能包含额外的配置字段，例如：

- `targetPages` - 适用的页面路径（数组）
- `presets` - 预设规则列表
- `checkInterval` - 检查间隔时间（毫秒）
- `threadUrl` - 相关帖子链接

具体字段请参考各功能的 `config.json` 文件。

## 配置文件示例

### 1. 版本更新检查 (`versionCheck/config.json`)

```json
{
  "name": "版本更新检查",
  "description": "定期检查是否有新版本发布",
  "defaultEnabled": true,
  "storageKey": "versionCheckEnabled",
  "checkInterval": 86400000,
  "threadUrl": "https://www.52pojie.cn/thread-1830279-1-1.html",
  "threadTitle": "【管理插件】吾爱管理效率助手",
  "versionPattern": "V(\\d+\\.\\d+\\.\\d+)",
  "lastCheckKey": "lastVersionCheckTime",
  "latestVersionKey": "latestVersion",
  "updateDismissedKey": "updateDismissed"
}
```

### 2. 头像查询 (`avatarQuery/config.json`)

```json
{
  "name": "头像查询",
  "description": "鼠标移入头像显示用户违规记录",
  "storageKey": "avatarQueryEnabled",
  "defaultEnabled": true
}
```

## 配置加载和使用

### 1. 加载功能配置

```typescript
// 导入特定功能的配置
import contentFilterConfig from '@features/contentFilter/config.json'
import versionCheckConfig from '@features/versionCheck/config.json'

// 获取功能开关默认值
const getDefaultEnabled = (config: { defaultEnabled?: boolean }) => {
  return config.defaultEnabled ?? false
}
```

### 2. 功能配置验证

```typescript
import type { FeatureConfig } from './types'

const validateFeatureConfig = (config: unknown): config is FeatureConfig => {
  const cfg = config as Record<string, unknown>
  return typeof cfg?.name === 'string' && typeof cfg?.description === 'string'
}
```

### 3. 功能状态管理

```typescript
import contentFilterConfig from '@features/contentFilter/config.json'

// 获取功能开关状态
const getFeatureState = async (): Promise<boolean> => {
  const storageKey = contentFilterConfig.storageKey
  const result = await browser.storage.local.get(storageKey)
  return result[storageKey] ?? contentFilterConfig.defaultEnabled ?? false
}
```

## 相关文档

- [配置文件概述](./overview.md) - 配置文件整体结构
- [导航菜单配置](./navigation-config.md) - 导航菜单详细配置

---

_文档版本：2.0.0_  
_最后更新：2026-05-28_
