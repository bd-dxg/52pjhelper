# 用户网盘名单

## 功能概述

用户网盘名单功能在吾爱破解论坛帖子详情页高亮显示被列入网盘黑名单的用户，鼠标悬停时弹出浮层展示该用户的网盘记录（厂商、ID、帖子链接、记录者），辅助管理员快速识别违规用户。

## 功能特性

### 1. 用户高亮

- 自动扫描页面中所有用户名元素（选择器 `.pls .pi .authi a`）
- 匹配网盘名单中的用户后，添加黑色背景 + 白色文字的高亮样式
- 通过 `forumId`（论坛用户名）进行匹配，使用 `Set` 数据结构实现 O(1) 查找

### 2. 悬停信息弹窗

- 鼠标悬停高亮用户时，显示固定定位的浮层弹窗
- 弹窗内容为表格，包含列：网盘厂商、网盘ID、帖子链接、记录者
- 有备注信息时在表格下方额外展示
- 弹窗支持自身悬停（移入弹窗时不隐藏）
- 智能定位：依次尝试右侧 → 左侧 → 下方，确保在视口范围内

### 3. 动态内容监听

- 使用 `MutationObserver` 监听整个 `document.body` 的 DOM 变化
- 当新增节点中包含用户名元素时，触发防抖扫描（300ms 延迟）
- 适用于 AJAX 动态加载楼层等场景

### 4. 数据更新机制

- **手动更新**：点击"更新网盘名单"按钮，后台打开数据源页面，触发表格数据提取后关闭
- **自动更新**：进入数据源页面时自动检测距上次更新是否超过 24 小时，超过则重新加载
- **更新按钮组件**：`CloudDiskListUpdateButton.vue` 独立封装更新流程

### 5. 功能开关控制

- 通过 `UserCloudDiskListToggle.vue` 提供启用/禁用切换
- 切换时自动注入/移除样式、挂载/卸载事件监听器
- 配置通过 `browser.storage.local` 持久化

## 数据结构

### 表格格式

数据来源为论坛帖子中的表格，标准列定义：

| 列序号 | 字段 | 说明 |
|--------|------|------|
| 0 | 序号 | 新用户行有值，同一用户后续行显示 `-` |
| 1 | 论坛ID | 用户论坛用户名，唯一标识 |
| 2 | 网盘厂商 | 百度、夸克、迅雷等 |
| 3 | 网盘ID | 网盘账号，可能包含 `*` 遮挡 |
| 4 | 帖子链接 | 证据帖子地址，`-` 表示无链接 |
| 5 | 记录者 | 记录该条信息的管理员 |
| 6 | 备注 | 可选备注信息 |

### 解析规则

- 序号非 `-` 且论坛ID有效时，视为新用户条目起始
- 同一用户后续行（序号为 `-`）的网盘记录自动追加到当前用户
- 自动跳过表头行、模板行和空行（通过关键词检测）
- 重复的网盘记录（厂商 + ID 相同）自动去重

## 代码结构

```
src/features/userCloudDiskList/
├── config.json                    # 功能配置（名称、存储键、更新间隔等）
├── types.ts                       # 类型定义
├── config.ts                      # 配置常量（存储键、默认数据、防抖延迟）
├── data.ts                        # 数据加载、解析、保存逻辑
├── processing.ts                  # 用户名扫描、高亮处理、防抖扫描
├── events.ts                      # MutationObserver 监听管理
├── ui.ts                          # 样式注入、弹窗创建与定位
├── manager.ts                     # 核心管理器（状态、生命周期）
├── factory.ts                     # 工厂函数 createUserCloudDiskList
├── index.ts                       # 统一导出
├── UserCloudDiskListToggle.vue    # 功能开关组件
└── CloudDiskListUpdateButton.vue  # 数据更新按钮组件
```

### 模块职责

| 模块 | 职责 |
|------|------|
| `types.ts` | 定义 `CloudStorageRecord`、`UserCloudDiskListItem`、`IUserCloudDiskList` 等接口 |
| `config.ts` | 从 `config.json` 导出存储键常量，定义默认示例数据和防抖延迟 |
| `data.ts` | 三级数据加载策略：本地存储 → 表格提取器 → DOM 直接解析；保存与自动更新判断 |
| `processing.ts` | 扫描页面用户名元素，匹配高亮，提供防抖扫描和清理方法 |
| `events.ts` | 管理 `MutationObserver` 实例的创建与销毁，过滤仅用户名相关的 DOM 变化 |
| `ui.ts` | 注入 CSS 样式，创建/管理弹窗 DOM，实现智能定位算法 |
| `manager.ts` | 封装完整的 enable/disable/toggle 生命周期，协调各模块 |
| `factory.ts` | 暴露 `createUserCloudDiskList()` 创建管理器实例并异步初始化 |

## 数据加载优先级

```
本地存储有数据 ──→ 直接使用
    ↓ 无数据
表格提取器结果 ──→ 解析并保存后使用
    ↓ 不可用
DOM 直接解析 ──→ 解析目标帖子中的表格
    ↓ 失败
内置默认数据 ──→ config.ts 中的示例数据
```

在数据源页面（`thread-2094795-1-1.html`）上会优先从表格提取器重新加载最新数据并更新本地存储。

## 存储键

| 键名 | 类型 | 说明 |
|------|------|------|
| `userCloudDiskListEnabled` | `boolean` | 功能开关状态 |
| `userCloudDiskList_data` | `UserCloudDiskListItem[]` | 网盘名单数据 |
| `userCloudDiskList_lastUpdate` | `number` | 上次更新时间戳（毫秒） |

## 公开 API

```typescript
import { createUserCloudDiskList } from '@features/userCloudDiskList'

const cloudDiskList = createUserCloudDiskList()

await cloudDiskList.enable()           // 启用功能
await cloudDiskList.disable()          // 禁用功能
const isEnabled = cloudDiskList.getStatus()  // 获取状态

await cloudDiskList.updateData(data)   // 手动更新数据
const data = await cloudDiskList.getData()  // 获取当前数据
await cloudDiskList.reloadData()       // 重新加载并重新扫描
const needUpdate = await cloudDiskList.shouldAutoUpdate()  // 检查是否需要自动更新
```

## 相关文档

- [灌水筛选配置指南](content-filter.md)
- [组件开发指南](../development/component-guide.md)
- [可组合函数式架构](../development/composable-architecture.md)

---

_最后更新：2026-05-28_
_文档版本：1.0.0_
