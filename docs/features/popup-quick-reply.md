# 弹窗快捷回复

## 功能概述

弹窗快捷回复功能在吾爱破解论坛的管理弹窗中（如删除/屏蔽/警告操作或评分操作），自动替换原有快捷回复列表为用户自定义的预设内容，提高管理效率。

## 核心特性

### 1. 智能弹窗识别

- **自动检测**：通过 MutationObserver 监控 `#reasonselect` 元素的出现
- **类型判断**：根据 `fwin` 属性自动识别弹窗类型（`rate` 评分 / `mods` 管理操作）
- **动态替换**：根据弹窗类型自动选择对应的预设列表

### 2. 预设内容管理

- **自定义预设**：支持用户自定义管理操作和评分理由预设
- **默认配置**：内置常用的管理回复预设
- **存储同步**：预设配置保存到 `browser.storage.local`，跨页面同步

### 3. 完整事件绑定

- **点击填充**：点击预设项可将文本填充到回复输入框
- **悬停效果**：鼠标悬停时显示高亮效果，模仿原始行为
- **性能优化**：DOM 查询移出循环，避免重复查询

### 4. 状态恢复

- **原始内容保存**：替换前保存原始列表内容（使用 `textContent` 避免 XSS）
- **功能关闭恢复**：功能关闭时自动恢复原始列表内容
- **错误处理**：JSON 解析失败时安全降级

## 技术实现

### 架构设计

```
弹窗快捷回复功能
├── 观察器模块 (observer.ts)
│   ├── MutationObserver 监控
│   ├── 元素出现检测
│   └── 去重处理
├── 工具函数 (utils.ts)
│   ├── 预设配置管理
│   ├── 列表替换逻辑
│   ├── 事件绑定
│   └── 状态恢复
└── 配置文件 (config.json)
    ├── 功能开关
    ├── 目标页面
    └── 预设内容
```

### 核心组件

#### 1. 观察器模块 (`src/features/popupQuickReply/observer.ts`)

```typescript
type PopupCallback = (element: HTMLElement) => void

/**
 * 监控 DOM 变化，当指定选择器的元素出现时触发回调
 */
export const observePopup = (selector: string, callback: PopupCallback): (() => void) => {
  const seen = new Set<Element>()

  const check = () => {
    const el = document.querySelector(selector)
    if (el && !seen.has(el)) {
      seen.add(el)
      callback(el as HTMLElement)
    }
  }

  const observer = new MutationObserver(check)

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return () => observer.disconnect()
}
```

#### 2. 工具函数 (`src/features/popupQuickReply/utils.ts`)

```typescript
/**
 * 替换快捷回复下拉列表
 */
const replaceQuickReplyList = (list: HTMLElement, presets: string[]): void => {
  // 保存原始列表项文本用于恢复（避免 innerHTML 的 XSS 风险）
  const originalItems: string[] = []
  const originalLis = list.querySelectorAll('li')
  originalLis.forEach((li) => {
    originalItems.push(li.textContent || '')
  })
  list.setAttribute('data-original-items', JSON.stringify(originalItems))

  // 清空原有列表项
  while (list.firstChild) {
    list.removeChild(list.firstChild)
  }

  // 查找对应的 textarea（在循环外查找，避免重复查询）
  const textarea = document.querySelector('#reason') as HTMLTextAreaElement | null

  // 添加自定义快捷回复项
  presets.forEach((preset) => {
    const li = document.createElement('li')
    li.textContent = preset

    // 绑定点击事件，将文本填充到 textarea
    li.addEventListener('click', () => {
      if (textarea) {
        textarea.value = preset
      }
    })

    // 绑定鼠标悬停事件，模仿原始行为
    li.addEventListener('mouseover', () => {
      li.className = 'xi2 cur1'
    })
    li.addEventListener('mouseout', () => {
      li.className = ''
    })

    list.appendChild(li)
  })
}
```

#### 3. 配置文件 (`src/features/popupQuickReply/config.json`)

```json
{
  "name": "回复替换",
  "description": "在管理弹窗中替换原有内容",
  "defaultEnabled": true,
  "storageKey": "popupQuickReplyEnabled",
  "targetPages": [
    "https://www.52pojie.cn/forum.php?mod=viewthread&tid=*",
    "https://www.52pojie.cn/thread-*"
  ],
  "presets": {
    "mods": [
      "请勿灌水,已删除灌水回复 条,继续灌水违规+1",
      "悬赏区禁止同求,继续同求违规+1"
    ],
    "rate": ["警告后继续灌水,违规+1"]
  }
}
```

## 配置说明

### 功能开关

弹窗快捷回复功能可以通过配置开关启用或禁用：

- **存储键**：`popupQuickReplyEnabled`
- **默认值**：`true`（启用）
- **配置位置**：后台管理功能组设置

### 预设配置

预设配置存储在 `browser.storage.local` 中：

- **存储键**：`popupQuickReplyPresets`
- **数据结构**：
  ```typescript
  interface PresetConfig {
    mods: string[]  // 管理操作预设
    rate: string[]  // 评分理由预设
  }
  ```

### 目标页面

功能仅在以下页面生效：

- `https://www.52pojie.cn/forum.php?mod=viewthread&tid=*`
- `https://www.52pojie.cn/thread-*`

## 使用场景

### 1. 批量管理操作

在处理大量举报时，使用预设的管理回复可以：

- 减少重复输入时间
- 保持回复内容一致性
- 提高处理效率

### 2. 评分操作

在进行评分操作时，快速选择常用的评分理由：

- 警告后继续灌水
- 违规+1 等

### 3. 标准化回复

确保所有管理员使用标准化的回复内容：

- 避免个人化表述差异
- 符合论坛规范要求
- 提供专业统一的用户体验

## 数据管理

### 本地存储结构

```typescript
interface PopupQuickReplyStorage {
  // 功能状态
  popupQuickReplyEnabled: boolean

  // 预设配置
  popupQuickReplyPresets: {
    mods: string[]
    rate: string[]
  }
}
```

### 数据同步机制

预设配置通过 `storageHelper` 工具进行存储和读取，支持跨页面同步。

## 性能优化

### 1. DOM 查询优化

- **循环外查询**：`#reason` textarea 的查询移出循环，避免重复查询
- **选择器缓存**：使用 `querySelector` 一次性查询目标元素

### 2. 事件绑定优化

- **事件委托**：使用直接事件绑定，避免事件委托的复杂性
- **内存管理**：功能关闭时自动清理事件监听器

### 3. 状态恢复优化

- **文本存储**：使用 `textContent` 存储原始内容，避免 `innerHTML` 的安全风险
- **JSON 序列化**：将原始内容序列化为 JSON 存储，恢复时解析

## 安全与隐私

### 数据安全

- **XSS 防护**：使用 `textContent` 替代 `innerHTML` 存储原始内容
- **输入验证**：预设内容经过类型检查
- **权限控制**：仅访问必要的存储空间

### 隐私保护

- **本地存储**：所有数据存储在本地，不上传服务器
- **最小权限**：仅访问论坛页面的 DOM 元素

## 测试指南

### 功能测试

1. **弹窗检测**：验证功能能正确检测到管理弹窗
2. **类型识别**：验证能正确区分评分和管理操作弹窗
3. **列表替换**：验证预设列表正确替换原始列表
4. **点击填充**：验证点击预设项能正确填充到输入框
5. **状态恢复**：验证功能关闭时能正确恢复原始列表

### 性能测试

1. **内存使用**：监控功能运行时的内存占用
2. **响应速度**：测试列表替换的响应时间
3. **事件处理**：测试大量预设项时的事件处理性能

### 兼容性测试

1. **浏览器兼容**：在不同浏览器版本测试
2. **页面兼容**：在论坛不同页面测试功能
3. **设备兼容**：在不同设备上测试响应式设计

## 故障排除

### 常见问题

1. **弹窗不显示替换内容**
   - 检查功能是否已启用
   - 验证是否在正确的页面（帖子详情页）
   - 清除浏览器缓存后重试

2. **点击预设项无反应**
   - 检查回复输入框是否存在
   - 验证事件绑定是否成功
   - 查看浏览器控制台错误信息

3. **预设内容丢失**
   - 检查本地存储是否正常
   - 验证配置同步功能
   - 尝试重新导入预设

### 调试方法

```javascript
// 检查功能状态
console.log('弹窗快捷回复状态:', {
  enabled: await browser.storage.local.get('popupQuickReplyEnabled'),
  presets: await browser.storage.local.get('popupQuickReplyPresets'),
})

// 检查观察器状态
console.log('观察器状态:', {
  isObserving: cleanupObserver !== null,
})
```

## 相关功能

- **[快捷回复](./quick-reply.md)** - 举报处理页面的快捷回复
- **[配置同步](./config-sync.md)** - 预设配置的导入导出
- **[自动填充](./auto-fill.md)** - 相关的表单自动化功能
- **[组件开发指南](../development/component-guide.md)** - 创建功能开关组件的指南

## 最佳实践

### 预设设计建议

1. **简洁明确**：预设内容应简洁明了，避免歧义
2. **分类合理**：按处理类型合理分类预设
3. **定期更新**：根据论坛规则变化更新预设库

### 使用建议

1. **组合使用**：可以组合多个预设形成完整回复
2. **个性化调整**：在标准预设基础上适当个性化
3. **效率优先**：优先使用高频预设，提高效率

## 参考资料

- [吾爱破解论坛管理规范](https://www.52pojie.cn/rules)
- [浏览器扩展存储API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [MutationObserver API](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)

---

**注意**：使用弹窗快捷回复功能时，请确保回复内容符合论坛管理规定，保持专业和礼貌的沟通态度。