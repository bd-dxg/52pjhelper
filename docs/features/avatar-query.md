# 头像查询

## 功能概述

头像查询功能允许管理员在吾爱破解论坛的管理页面中，通过鼠标悬停在用户头像上，快速查看该用户的违规记录和历史行为。这大大提高了管理效率，无需跳转到用户详情页面即可获取关键信息。

## 核心特性

### 1. 智能信息展示

- **鼠标悬停触发**：鼠标移动到用户头像时自动显示违规记录
- **实时数据获取**：从论坛API获取最新的用户违规信息
- **格式化展示**：以清晰易读的格式展示违规记录

### 2. 数据内容

- **违规次数**：显示用户的总违规次数
- **违规类型**：列出具体的违规类型（如灌水、广告、恶意行为等）
- **处理状态**：显示违规的处理状态（已处理、待处理、申诉中）
- **时间范围**：展示最近一段时间的违规记录

### 3. 交互设计

- **非侵入式**：仅在需要时显示，不干扰正常浏览
- **快速关闭**：鼠标移开或点击其他地方自动关闭
- **可配置显示**：支持自定义显示内容和格式

## 技术实现

### 架构设计

头像查询功能采用以下架构：

```
用户界面层 (UI Layer)
    ↓
业务逻辑层 (Business Logic)
    ↓
数据访问层 (Data Access)
    ↓
论坛API层 (Forum API)
```

### 核心组件

#### 1. 头像查询开关组件 (`AvatarQueryToggle.vue`)

```vue
<template>
  <div class="avatar-query-toggle">
    <label>
      <input type="checkbox" v-model="enabled" @change="toggleFeature" />
      启用头像查询
    </label>
    <p class="description">鼠标悬停在用户头像上显示违规记录</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

const enabled = ref(false)
const storageKey = 'avatarQueryEnabled'

// 初始化状态
onMounted(async () => {
  const result = await browser.storage.local.get(storageKey)
  enabled.value = result[storageKey] ?? true // 默认启用
})

// 切换功能状态
const toggleFeature = async () => {
  await browser.storage.local.set({ [storageKey]: enabled.value })
}
</script>
```

#### 2. 头像查询工具类 (`src/features/avatarQuery/utils.ts`)

```typescript
/**
 * 头像查询管理工具类
 */
export class AvatarQueryManager {
  private enabled: boolean = true

  /**
   * 初始化头像查询功能
   */
  async initialize(): Promise<void> {
    // 从存储加载配置
    const config = await this.loadConfig()
    this.enabled = config.enabled

    if (this.enabled) {
      this.setupEventListeners()
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听头像元素的鼠标悬停事件
    document.addEventListener('mouseover', this.handleAvatarHover.bind(this))
  }

  /**
   * 处理头像悬停事件
   */
  private async handleAvatarHover(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement
    if (!this.isAvatarElement(target)) return

    const userId = this.extractUserId(target)
    if (!userId) return

    // 获取用户违规记录
    const violations = await this.fetchUserViolations(userId)

    // 显示违规记录
    this.displayViolations(target, violations)
  }

  /**
   * 获取用户违规记录
   */
  private async fetchUserViolations(userId: string): Promise<Violation[]> {
    // 调用论坛API获取数据
    const response = await fetch(`/api/user/violations/${userId}`)
    return response.json()
  }

  // ... 其他方法
}
```

#### 3. 配置文件 (`src/features/avatarQuery/config.json`)

```json
{
  "defaultEnabled": true,
  "displayTimeout": 3000,
  "maxViolationsToShow": 5,
  "refreshInterval": 300000,
  "apiEndpoints": {
    "violations": "/api/user/violations",
    "userInfo": "/api/user/info"
  }
}
```

## 配置说明

### 功能开关

头像查询功能可以通过配置开关启用或禁用：

- **存储键**：`avatarQueryEnabled`
- **默认值**：`true`（启用）
- **配置位置**：后台管理功能组设置

### 高级配置

```typescript
// 高级配置选项
const advancedConfig = {
  // 显示设置
  displayDuration: 3000, // 显示时长（毫秒）
  maxRecords: 5, // 最大显示记录数
  autoHide: true, // 自动隐藏

  // 数据设置
  cacheDuration: 300000, // 缓存时长（毫秒）
  refreshOnHover: true, // 悬停时刷新数据

  // 样式设置
  theme: 'default', // 显示主题
  position: 'bottom', // 显示位置
  animation: 'fade', // 动画效果
}
```

## 使用场景

### 1. 快速审核

在审核用户举报或违规内容时，管理员可以快速查看相关用户的违规历史，辅助决策。

### 2. 用户行为分析

通过查看用户的违规记录，了解用户的行为模式，识别潜在的问题用户。

### 3. 效率提升

减少页面跳转和手动查询的时间，提高管理操作的效率。

## 数据安全与隐私

### 数据保护

- **本地存储**：用户配置仅存储在本地浏览器中
- **API权限**：仅获取必要的违规记录信息
- **数据加密**：敏感信息在传输过程中加密

### 隐私考虑

- **最小化数据**：仅获取和显示必要的违规信息
- **用户同意**：功能默认启用但用户可以禁用
- **数据清理**：定期清理本地缓存数据

## 性能优化

### 1. 数据缓存

```typescript
// 数据缓存实现
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number }>()

  async getWithCache(key: string, fetchFn: () => Promise<any>, ttl: number) {
    const cached = this.cache.get(key)

    // 检查缓存是否有效
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }

    // 获取新数据
    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }
}
```

### 2. 延迟加载

- **按需加载**：仅在悬停时加载用户数据
- **分批请求**：避免同时发起大量请求
- **请求去重**：避免重复请求相同用户数据

### 3. 内存管理

- **缓存清理**：定期清理过期缓存
- **事件解绑**：页面卸载时正确清理事件监听器
- **DOM清理**：及时移除不再需要的DOM元素

## 错误处理

### 网络错误处理

```typescript
try {
  const violations = await this.fetchUserViolations(userId)
  this.displayViolations(target, violations)
} catch (error) {
  if (error instanceof NetworkError) {
    this.showErrorMessage('网络连接失败，请检查网络设置')
  } else if (error instanceof APIError) {
    this.showErrorMessage('无法获取用户数据，请稍后重试')
  } else {
    console.error('头像查询错误:', error)
    this.showErrorMessage('发生未知错误')
  }
}
```

### 降级策略

1. **数据不可用**：显示"数据暂不可用"提示
2. **API失败**：使用本地缓存数据（如果可用）
3. **完全失败**：禁用功能并显示错误状态

## 测试指南

### 功能测试

1. **悬停测试**：验证鼠标悬停时是否显示违规记录
2. **数据准确性**：验证显示的违规记录是否准确
3. **性能测试**：测试数据加载和显示的性能

### 兼容性测试

1. **浏览器兼容**：在支持的浏览器版本测试
2. **页面兼容**：在论坛的不同页面测试
3. **网络条件**：在不同网络条件下测试

### 安全测试

1. **XSS防护**：验证用户输入的安全性
2. **数据泄露**：确保不会泄露敏感信息
3. **权限检查**：验证API调用的权限控制

## 版本历史

| 版本  | 日期       | 变更说明                   |
| ----- | ---------- | -------------------------- |
| 1.0.0 | 2024-01-20 | 初始版本，基础头像查询功能 |
| 1.1.0 | 2024-03-10 | 增加数据缓存，提高性能     |
| 1.2.0 | 2024-05-15 | 优化UI设计，增加动画效果   |
| 1.3.0 | 2024-08-20 | 增强错误处理，提高稳定性   |
| 1.4.0 | 2024-11-05 | 集成用户行为分析功能       |

## 故障排除

### 常见问题

1. **悬停不显示信息**
   - 检查功能是否已启用
   - 验证网络连接是否正常
   - 清除浏览器缓存后重试

2. **数据显示不完整**
   - 检查API响应是否完整
   - 验证数据解析逻辑
   - 查看浏览器控制台错误

3. **性能问题**
   - 检查网络请求数量
   - 验证缓存机制是否正常工作
   - 监控内存使用情况

### 调试方法

```javascript
// 启用调试模式
localStorage.setItem('avatarQueryDebug', 'true')

// 查看详细日志
console.log('头像查询调试信息:', {
  enabled: avatarQueryEnabled,
  cacheSize: cache.size,
  lastRequest: lastRequestTime,
})
```

## 相关功能

- **[后台管理功能组](./admin-features.md)** - 头像查询属于后台管理功能
- **[快捷回复](./quick-reply.md)** - 与头像查询协同使用的管理工具
- **[用户链接查询](./user-link-query.md)** - 相关的用户信息查询功能
- **[组件开发指南](../development/component-guide.md)** - 创建功能开关组件的指南

## 参考资料

- [吾爱破解论坛API文档](https://www.52pojie.cn/api-docs)
- [浏览器扩展开发指南](https://developer.chrome.com/docs/extensions/)
- [Vue 3 组合式API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**注意**：使用头像查询功能时，请遵守论坛规则和用户隐私政策。仅将获取的信息用于正当的管理目的。
