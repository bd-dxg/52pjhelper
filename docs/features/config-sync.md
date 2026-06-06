# 配置同步

## 功能概述

配置同步功能允许用户将插件配置导出为论坛帖子格式，并从帖子导入配置，实现跨设备配置同步。

## 核心特性

### 1. 配置导出

- **BBCode 格式**：将配置转换为论坛支持的 BBCode 格式
- **自动复制**：导出后自动复制到剪贴板
- **安全存储**：配置数据本地存储，不上传服务器

### 2. 配置导入

- **智能解析**：支持多种格式（纯 JSON、BBCode、code 标签）
- **域名白名单**：仅支持吾爱破解论坛链接，防止 SSRF 攻击
- **配置过滤**：只允许导入预期的配置项，防止恶意数据注入
- **地址保存**：导入地址自动保存，下次打开时自动填充

### 3. 安全机制

- **SSRF 防护**：域名白名单验证
- **XSS 防护**：使用 `textContent` 替代 `innerHTML`
- **输入验证**：配置项白名单机制
- **错误处理**：完善的错误处理和用户反馈

## 技术实现

### 架构设计

```
配置同步功能
├── 核心逻辑 (configSync.ts)
│   ├── 导出配置
│   ├── 导入配置
│   ├── URL 验证
│   ├── 配置解析
│   └── 安全校验
├── UI 组件 (ConfigSyncToggle.vue)
│   ├── 导出界面
│   ├── 导入界面
│   ├── 状态反馈
│   └── 地址保存
└── 存储管理
    ├── 导入地址存储
    └── 配置数据存储
```

### 核心组件

#### 1. 核心逻辑 (`src/features/configSync/configSync.ts`)

```typescript
/**
 * 导入地址存储键
 */
const IMPORT_URL_STORAGE_KEY = 'configSyncImportUrl'

/**
 * 允许导入的域名白名单
 * 防止 SSRF 攻击
 */
const ALLOWED_HOSTNAMES = ['www.52pojie.cn', '52pojie.cn']

/**
 * 允许导入的配置键白名单
 * 只允许导入预期的配置项，防止恶意数据注入
 */
const ALLOWED_IMPORT_KEYS = new Set([
  'popupQuickReplyEnabled',
  'popupQuickReplyPresets',
])

/**
 * 导出当前插件配置
 */
export const exportConfig = async (): Promise<ExportResult> => {
  try {
    const result = await browser.storage.local.get(EXPORT_KEYS)
    const config: Record<string, unknown> = {}

    // 构建导出配置
    if (result.popupQuickReplyPresets !== undefined) {
      config.popupQuickReplyPresets = result.popupQuickReplyPresets
    } else {
      config.popupQuickReplyPresets = getDefaultPopupQuickReplyPresets()
    }

    if (result.popupQuickReplyEnabled !== undefined) {
      config.popupQuickReplyEnabled = result.popupQuickReplyEnabled
    }

    return { success: true, data: config }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出配置失败',
    }
  }
}

/**
 * 从论坛帖子导入配置
 */
export const importConfig = async (url: string): Promise<ImportResult> => {
  try {
    // 校验 URL 域名
    if (!isAllowedUrl(url)) {
      return { success: false, error: '仅支持吾爱破解论坛链接' }
    }

    // 解析帖子 URL
    const parsed = parsePostUrl(url)
    if (!parsed) {
      return { success: false, error: '无法识别帖子链接格式' }
    }

    // 获取帖子页面
    const response = await fetch(generatePostUrl(parsed.threadId), {
      credentials: 'include',
    })

    if (!response.ok) {
      return { success: false, error: `获取帖子失败: ${response.status}` }
    }

    // GBK 解码（论坛使用 GBK 编码）
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('gbk')
    const html = decoder.decode(buffer)

    // 提取配置
    const configStr = extractCodeFromHtml(html, parsed.postId)
    if (!configStr) {
      return { success: false, error: '帖子中未找到有效的配置数据' }
    }

    // 解析配置
    const rawConfig = parseConfigFromText(configStr)
    if (!rawConfig) {
      return { success: false, error: '配置数据格式无效' }
    }

    // 过滤配置
    const config = filterConfig(rawConfig)

    // 写入 storage
    await browser.storage.local.set(config)

    return { success: true, count: Object.keys(config).length }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '导入配置失败',
    }
  }
}
```

#### 2. UI 组件 (`src/features/configSync/ConfigSyncToggle.vue`)

```vue
<template>
  <div class="config-sync-section">
    <h3 class="section-title">配置同步</h3>
    <p class="section-desc">导出当前配置到论坛帖子，或从帖子导入配置</p>

    <!-- 导出区域 -->
    <div class="sync-card">
      <div class="card-header">
        <span class="card-icon">💾</span>
        <span class="card-title">导出配置</span>
      </div>
      <p class="card-desc">导出为 BBCode 格式，可粘贴到论坛帖子</p>
      <button class="sync-btn export-btn" :disabled="isExporting" @click="handleExport">
        {{ isExporting ? '导出中...' : '导出配置' }}
      </button>
      <div v-if="exportResult" class="result-message" :class="exportResult.success ? 'success' : 'error'">
        {{ exportResult.message }}
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="sync-card">
      <div class="card-header">
        <span class="card-icon">🔗</span>
        <span class="card-title">导入配置</span>
      </div>
      <p class="card-desc">粘贴论坛帖子链接，导入其中的配置</p>
      <div class="import-input-group">
        <input
          v-model="importUrl"
          type="text"
          class="import-input"
          placeholder="粘贴帖子链接..."
          :disabled="isImporting" />
        <button class="sync-btn import-btn" :disabled="isImporting || !importUrl.trim()" @click="handleImport">
          {{ isImporting ? '导入中...' : '导入' }}
        </button>
      </div>
      <div v-if="importResult" class="result-message" :class="importResult.success ? 'success' : 'error'">
        {{ importResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { exportConfig, configToBBCode, importConfig, getSavedImportUrl, saveImportUrl } from './configSync'

// 组件挂载时加载保存的导入地址
onMounted(async () => {
  try {
    importUrl.value = await getSavedImportUrl()
  } catch (error) {
    console.warn('加载导入地址失败:', error instanceof Error ? error.message : error)
  }
})

// 处理导出配置
const handleExport = async () => {
  isExporting.value = true
  exportResult.value = null

  try {
    const result = await exportConfig()

    if (result.success && result.data) {
      const bbCode = configToBBCode(result.data)
      const copied = await copyToClipboard(bbCode)
      exportResult.value = {
        success: true,
        message: copied
          ? `已复制 ${Object.keys(result.data).length} 项配置到剪贴板，可粘贴到论坛帖子`
          : `导出失败，请手动复制`,
      }
    } else {
      exportResult.value = {
        success: false,
        message: result.error || '导出失败',
      }
    }
  } catch (error) {
    exportResult.value = {
      success: false,
      message: error instanceof Error ? error.message : '导出失败',
    }
  } finally {
    isExporting.value = false
  }
}

// 处理导入配置
const handleImport = async () => {
  if (!importUrl.value.trim()) {
    return
  }

  isImporting.value = true
  importResult.value = null

  try {
    const result = await importConfig(importUrl.value.trim())

    if (result.success) {
      // 导入成功后保存地址
      await saveImportUrl(importUrl.value.trim())
      importResult.value = {
        success: true,
        message: `成功导入 ${result.count} 项配置，请刷新页面生效`,
      }
    } else {
      importResult.value = {
        success: false,
        message: result.error || '导入失败',
      }
    }
  } catch (error) {
    importResult.value = {
      success: false,
      message: error instanceof Error ? error.message : '导入失败',
    }
  } finally {
    isImporting.value = false
  }
}
</script>
```

## 配置说明

### 存储键

| 存储键 | 类型 | 说明 |
|--------|------|------|
| `configSyncImportUrl` | string | 保存的导入地址 |
| `popupQuickReplyEnabled` | boolean | 弹窗快捷回复开关 |
| `popupQuickReplyPresets` | object | 弹窗快捷回复预设 |

### 导出配置结构

```typescript
interface ExportConfig {
  popupQuickReplyEnabled?: boolean
  popupQuickReplyPresets?: {
    mods: string[]
    rate: string[]
  }
}
```

### 导入配置过滤

仅允许导入以下配置项：

- `popupQuickReplyEnabled` - 弹窗快捷回复开关
- `popupQuickReplyPresets` - 弹窗快捷回复预设

其他配置项会被过滤掉，防止恶意数据注入。

## 使用场景

### 1. 跨设备配置同步

在不同设备间同步插件配置：

1. 在设备 A 上导出配置
2. 将配置粘贴到论坛帖子
3. 在设备 B 上从帖子导入配置

### 2. 配置备份

定期备份插件配置：

1. 导出配置到论坛帖子
2. 保存帖子链接作为备份
3. 需要时从帖子导入恢复

### 3. 团队配置共享

管理员团队共享配置：

1. 创建包含配置的论坛帖子
2. 团队成员从帖子导入配置
3. 保持团队配置一致性

## 数据管理

### 本地存储结构

```typescript
interface ConfigSyncStorage {
  // 导入地址
  configSyncImportUrl: string

  // 弹窗快捷回复配置
  popupQuickReplyEnabled: boolean
  popupQuickReplyPresets: {
    mods: string[]
    rate: string[]
  }
}
```

### 数据流程

```
导出流程：
browser.storage.local → exportConfig() → configToBBCode() → 剪贴板

导入流程：
帖子链接 → fetch() → extractCodeFromHtml() → parseConfigFromText() → filterConfig() → browser.storage.local
```

## 安全与隐私

### 安全机制

1. **SSRF 防护**
   - 域名白名单验证
   - 仅支持 `www.52pojie.cn` 和 `52pojie.cn`

2. **XSS 防护**
   - 使用 `textContent` 替代 `innerHTML`
   - HTML 实体解码
   - 残留 HTML 标签清理

3. **配置过滤**
   - 配置项白名单机制
   - 只允许导入预期的配置项
   - 防止恶意数据注入

4. **错误处理**
   - 完善的错误捕获和处理
   - 用户友好的错误提示
   - 静默处理非关键错误

### 隐私保护

- **本地存储**：所有数据存储在本地，不上传服务器
- **最小权限**：仅访问必要的存储空间
- **数据隔离**：用户个人信息（如 `userInfoCache`）不同步

## 性能优化

### 1. 网络请求优化

- **超时控制**：设置合理的请求超时时间
- **错误重试**：网络失败时提供重试机制
- **缓存策略**：避免重复请求相同内容

### 2. DOM 操作优化

- **批量操作**：减少 DOM 操作次数
- **事件委托**：使用事件委托提高性能
- **内存管理**：及时清理事件监听器

### 3. 存储优化

- **异步操作**：所有存储操作使用异步 API
- **批量写入**：减少存储操作次数
- **错误恢复**：存储失败时提供降级方案

## 测试指南

### 功能测试

1. **导出功能**
   - 验证配置正确导出为 BBCode 格式
   - 验证自动复制到剪贴板功能
   - 验证导出结果反馈

2. **导入功能**
   - 验证从论坛帖子导入配置
   - 验证多种格式解析（JSON、BBCode、code 标签）
   - 验证配置过滤功能
   - 验证导入地址保存

3. **安全测试**
   - 验证域名白名单功能
   - 验证配置项过滤功能
   - 验证 XSS 防护功能

### 性能测试

1. **网络性能**
   - 测试配置导入的响应时间
   - 测试网络失败时的处理

2. **存储性能**
   - 测试配置保存和读取速度
   - 测试大量配置项时的性能

### 兼容性测试

1. **浏览器兼容**：在不同浏览器版本测试
2. **页面兼容**：在论坛不同页面测试功能
3. **设备兼容**：在不同设备上测试响应式设计

## 故障排除

### 常见问题

1. **导出失败**
   - 检查剪贴板权限
   - 验证配置数据格式
   - 查看浏览器控制台错误

2. **导入失败**
   - 检查帖子链接是否正确
   - 验证是否为吾爱破解论坛链接
   - 确认帖子中包含有效的配置数据

3. **配置未生效**
   - 检查导入的配置项是否在白名单中
   - 验证配置数据格式是否正确
   - 尝试刷新页面或重启浏览器

### 调试方法

```javascript
// 检查配置同步状态
console.log('配置同步状态:', {
  importUrl: await browser.storage.local.get('configSyncImportUrl'),
  popupQuickReplyEnabled: await browser.storage.local.get('popupQuickReplyEnabled'),
  popupQuickReplyPresets: await browser.storage.local.get('popupQuickReplyPresets'),
})

// 测试 URL 验证
console.log('URL 验证:', {
  'valid': isAllowedUrl('https://www.52pojie.cn/thread-123-1-1.html'),
  'invalid': isAllowedUrl('https://evil.com/thread-123-1-1.html'),
})
```

## 相关功能

- **[弹窗快捷回复](./popup-quick-reply.md)** - 配置同步的主要应用场景
- **[快捷回复](./quick-reply.md)** - 相关的快捷回复功能
- **[组件开发指南](../development/component-guide.md)** - 创建功能开关组件的指南
- **[通信机制](../development/communication.md)** - Popup 与 Content Script 通信

## 最佳实践

### 配置设计建议

1. **模块化设计**：配置按功能模块组织，便于管理和同步
2. **版本控制**：配置结构支持版本演进，向后兼容
3. **安全性优先**：配置项白名单机制，防止恶意数据注入

### 使用建议

1. **定期备份**：定期导出配置作为备份
2. **团队同步**：管理员团队使用配置同步功能保持配置一致
3. **安全意识**：仅从可信来源导入配置

## 参考资料

- [吾爱破解论坛管理规范](https://www.52pojie.cn/rules)
- [浏览器扩展存储API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [TextDecoder API](https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder)

---

**注意**：使用配置同步功能时，请确保配置内容符合论坛管理规定，不要导入不可信来源的配置。