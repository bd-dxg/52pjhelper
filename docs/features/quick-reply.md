# 快捷回复

## 功能概述

快捷回复功能在吾爱破解论坛的举报处理页面中添加了一个智能回复短语下拉框，允许管理员快速选择和使用预定义的回复短语，大幅提高举报处理效率，减少重复输入。

## 核心特性

### 1. 智能回复短语库

- **预定义短语**：内置常用的举报处理回复短语
- **分类管理**：按处理类型分类（如警告、删除、禁言等）
- **快速搜索**：支持关键词搜索快速定位短语

### 2. 便捷操作界面

- **下拉选择**：通过下拉框快速选择回复短语
- **一键插入**：点击即可将短语插入回复框
- **实时预览**：选择时预览完整回复内容

### 3. 个性化配置

- **自定义短语**：管理员可以添加、编辑、删除回复短语
- **短语分组**：支持创建自定义短语分组
- **导入导出**：支持短语库的备份和恢复

## 技术实现

### 架构设计

快捷回复功能采用模块化设计：

```
用户界面层 (UI Layer)
    ├── 下拉选择组件
    ├── 短语管理界面
    └── 设置配置界面
        ↓
业务逻辑层 (Business Logic)
    ├── 短语管理服务
    ├── 搜索过滤服务
    └── 数据同步服务
        ↓
数据存储层 (Data Storage)
    ├── 本地存储 (browser.storage)
    └── 短语配置文件
```

### 核心组件

#### 1. 快捷回复开关组件

```vue
<template>
  <div class="quick-reply-toggle">
    <label>
      <input type="checkbox" v-model="enabled" @change="toggleFeature" />
      启用快捷回复
    </label>
    <p class="description">在举报处理页面添加快捷回复短语下拉框</p>

    <!-- 高级设置（展开/收起） -->
    <div v-if="showAdvanced" class="advanced-settings">
      <label>
        <input type="checkbox" v-model="autoInsert" />
        自动插入选中短语
      </label>
      <label>
        <input type="checkbox" v-model="showPreview" />
        显示短语预览
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

const enabled = ref(true)
const autoInsert = ref(true)
const showPreview = ref(true)
const showAdvanced = ref(false)

const storageKeys = {
  enabled: 'quickReplyEnabled',
  autoInsert: 'quickReplyAutoInsert',
  showPreview: 'quickReplyShowPreview',
}

// 初始化状态
onMounted(async () => {
  const storage = await browser.storage.local.get(Object.values(storageKeys))
  enabled.value = storage[storageKeys.enabled] ?? true
  autoInsert.value = storage[storageKeys.autoInsert] ?? true
  showPreview.value = storage[storageKeys.showPreview] ?? true
})

// 保存配置
const saveConfig = async () => {
  await browser.storage.local.set({
    [storageKeys.enabled]: enabled.value,
    [storageKeys.autoInsert]: autoInsert.value,
    [storageKeys.showPreview]: showPreview.value,
  })
}

// 切换功能状态
const toggleFeature = async () => {
  await saveConfig()
  // 通知内容脚本更新状态
  if (typeof browser !== 'undefined') {
    browser.runtime.sendMessage({
      type: 'QUICK_REPLY_TOGGLE',
      enabled: enabled.value,
    })
  }
}
</script>
```

#### 2. 短语管理工具类 (`src/features/quickReply/utils.ts`)

```typescript
/**
 * 快捷回复短语管理工具类
 */
export class QuickReplyManager {
  private phrases: QuickReplyPhrase[] = []
  private categories: string[] = []

  /**
   * 初始化短语库
   */
  async initialize(): Promise<void> {
    // 加载默认短语
    await this.loadDefaultPhrases()

    // 加载用户自定义短语
    await this.loadUserPhrases()

    // 初始化分类
    this.categories = this.extractCategories()
  }

  /**
   * 加载默认短语
   */
  private async loadDefaultPhrases(): Promise<void> {
    const response = await fetch('/assets/phrases/default-phrases.json')
    const defaultPhrases = await response.json()
    this.phrases.push(...defaultPhrases)
  }

  /**
   * 加载用户自定义短语
   */
  private async loadUserPhrases(): Promise<void> {
    const storage = await browser.storage.local.get('quickReplyUserPhrases')
    const userPhrases = storage.quickReplyUserPhrases || []
    this.phrases.push(...userPhrases)
  }

  /**
   * 搜索短语
   */
  searchPhrases(keyword: string, category?: string): QuickReplyPhrase[] {
    return this.phrases.filter(phrase => {
      const matchesKeyword = phrase.content.includes(keyword) || phrase.tags?.some(tag => tag.includes(keyword))

      const matchesCategory = !category || phrase.category === category

      return matchesKeyword && matchesCategory
    })
  }

  /**
   * 添加用户短语
   */
  async addUserPhrase(phrase: Omit<QuickReplyPhrase, 'id'>): Promise<void> {
    const newPhrase: QuickReplyPhrase = {
      ...phrase,
      id: this.generatePhraseId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    }

    this.phrases.push(newPhrase)
    await this.saveUserPhrases()
  }

  /**
   * 保存用户短语
   */
  private async saveUserPhrases(): Promise<void> {
    const userPhrases = this.phrases.filter(p => p.isCustom)
    await browser.storage.local.set({ quickReplyUserPhrases: userPhrases })
  }

  // ... 其他方法
}

// 短语类型定义
interface QuickReplyPhrase {
  id: string
  content: string
  category: string
  tags?: string[]
  description?: string
  isCustom?: boolean
  createdAt?: string
  usageCount?: number
}
```

#### 3. 默认短语配置文件 (`src/features/quickReply/config.json`)

```json
{
  "phrases": [
    {
      "id": "warning-001",
      "content": "您好，您的发言涉嫌违规，请遵守论坛规则。",
      "category": "警告",
      "tags": ["违规", "警告", "提醒"],
      "description": "一般违规警告"
    },
    {
      "id": "delete-001",
      "content": "该内容违反论坛规定，已做删除处理。",
      "category": "删除",
      "tags": ["删除", "违规", "处理"],
      "description": "内容删除通知"
    },
    {
      "id": "ban-001",
      "content": "由于多次违规，账号已被暂时禁言。",
      "category": "禁言",
      "tags": ["禁言", "违规", "处罚"],
      "description": "账号禁言通知"
    },
    {
      "id": "spam-001",
      "content": "检测到灌水行为，请勿发布无意义内容。",
      "category": "灌水",
      "tags": ["灌水", "无意义", "警告"],
      "description": "灌水行为警告"
    },
    {
      "id": "ad-001",
      "content": "禁止发布广告内容，已做相应处理。",
      "category": "广告",
      "tags": ["广告", "违规", "处理"],
      "description": "广告内容处理"
    }
  ],
  "categories": ["警告", "删除", "禁言", "灌水", "广告", "其他"]
}
```

## 配置说明

### 功能开关

快捷回复功能可以通过配置开关启用或禁用：

- **存储键**：`quickReplyEnabled`
- **默认值**：`true`（启用）
- **配置位置**：后台管理功能组设置

### 高级配置选项

```typescript
const quickReplyConfig = {
  // 基本设置
  enabled: true,
  autoInsert: true, // 自动插入选中短语
  showPreview: true, // 显示短语预览

  // 显示设置
  maxPhrases: 50, // 最大显示短语数
  showCategories: true, // 显示分类
  showSearch: true, // 显示搜索框

  // 行为设置
  insertAtCursor: true, // 在光标位置插入
  appendNewline: true, // 插入后换行
  clearSelection: true, // 插入后清除选择

  // 数据设置
  syncAcrossDevices: false, // 跨设备同步
  backupInterval: 86400000, // 备份间隔（24小时）

  // 隐私设置
  trackUsage: false, // 跟踪使用统计
  anonymizeData: true, // 匿名化使用数据
}
```

## 使用场景

### 1. 批量举报处理

在处理大量举报时，使用快捷回复可以：

- 减少重复输入时间
- 保持回复内容一致性
- 提高处理效率

### 2. 标准化回复

确保所有管理员使用标准化的回复内容：

- 避免个人化表述差异
- 符合论坛规范要求
- 提供专业统一的用户体验

### 3. 新人培训

新管理员可以快速学习：

- 标准的处理流程
- 合适的回复用语
- 常见的处理场景

## 数据管理与同步

### 本地存储结构

```typescript
interface QuickReplyStorage {
  // 功能状态
  enabled: boolean
  autoInsert: boolean
  showPreview: boolean

  // 用户数据
  userPhrases: QuickReplyPhrase[]
  userCategories: string[]

  // 使用统计
  usageStats: {
    totalUses: number
    categoryUses: Record<string, number>
    phraseUses: Record<string, number>
    lastUsed: string
  }

  // 配置
  settings: QuickReplyConfig
}
```

### 数据同步机制

```typescript
class QuickReplySyncManager {
  /**
   * 同步用户数据
   */
  async syncUserData(): Promise<void> {
    try {
      // 检查同步状态
      const lastSync = await this.getLastSyncTime()
      const needsSync = Date.now() - lastSync > this.syncInterval

      if (!needsSync) return

      // 执行同步
      const localData = await this.getLocalData()
      const remoteData = await this.fetchRemoteData()

      // 合并数据（远程优先）
      const mergedData = this.mergeData(localData, remoteData)

      // 保存合并后的数据
      await this.saveData(mergedData)
      await this.updateSyncTime()
    } catch (error) {
      console.error('快捷回复数据同步失败:', error)
      // 降级处理：继续使用本地数据
    }
  }
}
```

## 性能优化

### 1. 短语搜索优化

```typescript
// 使用索引提高搜索性能
class PhraseSearchIndex {
  private contentIndex: Map<string, Set<string>> = new Map()
  private tagIndex: Map<string, Set<string>> = new Map()
  private categoryIndex: Map<string, Set<string>> = new Map()

  // 构建索引
  buildIndex(phrases: QuickReplyPhrase[]): void {
    phrases.forEach(phrase => {
      // 内容索引
      this.addToIndex(this.contentIndex, phrase.content, phrase.id)

      // 标签索引
      phrase.tags?.forEach(tag => {
        this.addToIndex(this.tagIndex, tag, phrase.id)
      })

      // 分类索引
      this.addToIndex(this.categoryIndex, phrase.category, phrase.id)
    })
  }

  // 快速搜索
  search(keyword: string): string[] {
    const results = new Set<string>()

    // 多索引联合搜索
    this.searchIndex(this.contentIndex, keyword, results)
    this.searchIndex(this.tagIndex, keyword, results)
    this.searchIndex(this.categoryIndex, keyword, results)

    return Array.from(results)
  }
}
```

### 2. 延迟加载

- **按需加载**：仅在打开下拉框时加载短语数据
- **分页加载**：大量短语时分页显示
- **缓存机制**：缓存常用短语和搜索结果

## 安全与隐私

### 数据安全

- **本地加密**：敏感配置信息本地加密存储
- **输入验证**：用户自定义短语内容安全验证
- **XSS防护**：防止跨站脚本攻击

### 隐私保护

- **匿名统计**：使用统计匿名化处理
- **数据隔离**：用户数据本地存储，不上传
- **权限控制**：仅必要的数据访问权限

## 测试指南

### 功能测试

1. **下拉框测试**：验证下拉选择功能正常工作
2. **短语插入**：测试短语插入回复框的功能
3. **搜索过滤**：验证搜索和过滤功能

### 性能测试

1. **加载速度**：测试短语库加载时间
2. **搜索响应**：测试搜索操作的响应速度
3. **内存使用**：监控功能的内存占用

### 兼容性测试

1. **浏览器兼容**：在不同浏览器版本测试
2. **页面兼容**：在论坛不同页面测试功能
3. **设备兼容**：在不同设备上测试响应式设计

## 版本历史

| 版本  | 日期       | 变更说明                   |
| ----- | ---------- | -------------------------- |
| 1.0.0 | 2024-02-05 | 初始版本，基础快捷回复功能 |
| 1.1.0 | 2024-04-12 | 增加短语搜索和分类功能     |
| 1.2.0 | 2024-06-20 | 支持用户自定义短语         |
| 1.3.0 | 2024-09-05 | 优化UI设计，增加使用统计   |
| 1.4.0 | 2024-11-15 | 增强数据同步和备份功能     |

## 故障排除

### 常见问题

1. **下拉框不显示**
   - 检查功能是否已启用
   - 验证是否在正确的页面（举报处理页面）
   - 清除浏览器缓存后重试

2. **短语无法插入**
   - 检查回复框是否可编辑
   - 验证自动插入设置是否正确
   - 查看浏览器控制台错误信息

3. **自定义短语丢失**
   - 检查本地存储是否正常
   - 验证数据备份功能
   - 尝试恢复备份数据

### 调试方法

```javascript
// 启用详细日志
localStorage.setItem('quickReplyDebug', 'true')

// 检查功能状态
console.log('快捷回复状态:', {
  enabled: await browser.storage.local.get('quickReplyEnabled'),
  phrasesCount: quickReplyManager.phrases.length,
  lastError: lastErrorMessage,
})
```

## 相关功能

- **[后台管理功能组](./admin-features.md)** - 快捷回复属于后台管理功能
- **[头像查询](./avatar-query.md)** - 协同使用的用户信息查询功能
- **[自动填充](./auto-fill.md)** - 相关的表单自动化功能
- **[组件开发指南](../development/component-guide.md)** - 创建功能开关组件的指南

## 最佳实践

### 短语设计建议

1. **简洁明确**：短语内容应简洁明了，避免歧义
2. **分类合理**：按处理类型合理分类短语
3. **定期更新**：根据论坛规则变化更新短语库

### 使用建议

1. **组合使用**：可以组合多个短语形成完整回复
2. **个性化调整**：在标准短语基础上适当个性化
3. **效率优先**：优先使用高频短语，提高效率

## 参考资料

- [吾爱破解论坛管理规范](https://www.52pojie.cn/rules)
- [浏览器扩展存储API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Vue 3 响应式系统](https://vuejs.org/guide/extras/reactivity-in-depth.html)

---

**注意**：使用快捷回复功能时，请确保回复内容符合论坛管理规定，保持专业和礼貌的沟通态度。
