# 存储键命名规范

## 概述

存储键用于在浏览器存储中保存用户配置和功能状态。统一的命名规范有助于代码维护和调试。

## 命名规则

### 基本规则
1. **驼峰命名法**：使用 camelCase
2. **功能前缀**：以功能英文名称开头
3. **状态后缀**：以 `Enabled` 结尾表示开关状态
4. **描述性**：名称应清晰描述存储的内容

### 格式
```
[功能名称][具体内容][数据类型]
```

## 存储键列表

### 通用功能组

| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `navigationEnabled` | `boolean` | `true` | 导航菜单管理开关 |
| `darkThemeEnabled` | `boolean` | `true` | 深色主题开关 |
| `compactLayoutEnabled` | `boolean` | `true` | 紧凑布局开关 |

### 后台管理功能组

#### 头像查询
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `avatarQueryEnabled` | `boolean` | `true` | 头像查询功能开关 |
| `avatarQueryHistory` | `Array<object>` | `[]` | 查询历史记录 |

#### 快捷回复
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `quickReplyEnabled` | `boolean` | `true` | 快捷回复功能开关 |
| `quickReplyPhrases` | `Array<string>` | `[]` | 预设短语列表 |
| `quickReplyLastUsed` | `string` | `""` | 最后使用的短语 |

#### 楼层高亮
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `floorHighlighterEnabled` | `boolean` | `true` | 楼层高亮功能开关 |
| `floorHighlighterColor` | `string` | `"#ffeb3b"` | 高亮颜色 |

#### 原生楼层显示
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `nativeFloorDisplayEnabled` | `boolean` | `true` | 原生楼层显示开关 |

#### 全选功能
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `selectAllEnabled` | `boolean` | `true` | 全选功能开关 |

#### 分表选择器
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `tableSelectorEnabled` | `boolean` | `true` | 分表选择器开关 |
| `tableSelectorHidden` | `Array<string>` | `[]` | 隐藏的分表列表 |

#### 管理页面查询
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `userLinkQueryEnabled` | `boolean` | `true` | 管理页面查询开关 |
| `defaultQueryTime` | `string` | `"24h"` | 默认查询时间 |

#### 自动填充
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `autoFillEnabled` | `boolean` | `true` | 自动填充功能开关 |
| `autoFillMessages` | `object` | `{}` | 自定义填充内容 |

#### 重复发帖检测
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `duplicatePostDetectionEnabled` | `boolean` | `true` | 重复发帖检测开关 |

#### 勾选范围
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `rowClickToCheckEnabled` | `boolean` | `true` | 勾选范围功能开关 |

#### 灌水筛选
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `contentFilterEnabled` | `boolean` | `true` | 灌水筛选功能开关 |
| `contentFilterRules` | `Array<string>` | `[]` | 过滤规则列表 |
| `contentFilterPosition` | `object` | `{x: 0, y: 0}` | 卡片位置 |

#### 版本更新检查
| 存储键 | 数据类型 | 默认值 | 描述 |
|--------|----------|--------|------|
| `versionCheckEnabled` | `boolean` | `true` | 版本更新检查开关 |
| `lastVersionCheck` | `number` | `0` | 最后检查时间戳 |
| `ignoredVersions` | `Array<string>` | `[]` | 忽略的版本列表 |

## 存储操作

### 使用 storageHelper 工具类

推荐使用 `storageHelper` 工具类进行存储操作：

```typescript
import { storageHelper } from '@/utils/storageHelper'

// 加载布尔值
const enabled = await storageHelper.loadBoolean('avatarQueryEnabled', true)

// 保存布尔值
await storageHelper.saveBoolean('avatarQueryEnabled', false)

// 加载数组
const rules = await storageHelper.loadArray('contentFilterRules', [])

// 保存对象
await storageHelper.saveObject('contentFilterPosition', { x: 100, y: 200 })

// 批量操作
await storageHelper.saveMultiple({
  'avatarQueryEnabled': true,
  'quickReplyEnabled': false,
  'contentFilterRules': ['规则1', '规则2']
})

// 清空所有存储
await storageHelper.clearAll()
```

### 直接使用 browser.storage

```typescript
// 获取单个键值
const result = await browser.storage.local.get('avatarQueryEnabled')
const enabled = result.avatarQueryEnabled ?? true

// 设置单个键值
await browser.storage.local.set({ 'avatarQueryEnabled': false })

// 获取多个键值
const results = await browser.storage.local.get([
  'avatarQueryEnabled',
  'quickReplyEnabled',
  'contentFilterEnabled'
])

// 删除键值
await browser.storage.local.remove('avatarQueryEnabled')

// 清空所有
await browser.storage.local.clear()
```

## 数据类型说明

### 布尔值 (boolean)
用于功能开关状态。

### 字符串 (string)
用于文本配置，如颜色值、时间设置等。

### 数组 (Array)
用于列表数据，如历史记录、规则列表等。

### 对象 (object)
用于复杂配置，如位置信息、自定义设置等。

### 数字 (number)
用于时间戳、计数等。

## 迁移和兼容性

### 版本升级
当存储结构发生变化时：

1. **添加新字段**：新版本可以添加新字段，不影响旧版本
2. **修改字段类型**：需要提供迁移脚本
3. **删除字段**：旧数据可以保留，新版本忽略

### 迁移示例
```typescript
async function migrateStorage() {
  const oldData = await browser.storage.local.get('oldKey')
  if (oldData.oldKey) {
    // 转换旧数据到新格式
    const newData = transformData(oldData.oldKey)
    await browser.storage.local.set({ 'newKey': newData })
    await browser.storage.local.remove('oldKey')
  }
}
```

## 调试技巧

### 查看所有存储
```javascript
// 在浏览器控制台中
chrome.storage.local.get(null, (data) => {
  console.log('所有存储数据:', data)
})
```

### 清除特定功能存储
```javascript
// 清除头像查询相关存储
chrome.storage.local.remove([
  'avatarQueryEnabled',
  'avatarQueryHistory'
])
```

### 导出存储数据
```javascript
chrome.storage.local.get(null, (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'storage-backup.json'
  a.click()
})
```

## 最佳实践

### 1. 使用默认值
所有存储操作都应提供合理的默认值。

### 2. 错误处理
存储操作可能失败，需要适当的错误处理。

### 3. 数据验证
存储前验证数据格式，避免存储无效数据。

### 4. 定期清理
定期清理不再使用的存储数据。

### 5. 隐私考虑
避免存储敏感用户信息。

## 相关链接

- [组件开发指南](../development/component-guide.md)
- [可组合函数式架构](../development/composable-architecture.md)
- [自动导入机制](../development/auto-import.md)
- [所有功能配置文件](feature-configs.md)