# 待完成测试任务

本文档记录需要真实页面 HTML 结构才能完成的单元测试任务。

## 已完成

| 模块 | 覆盖率 | 状态 |
|------|--------|------|
| `storageHelper.ts` | 100% | ✅ 已完成 |
| `userViolationFetcher.ts` | 93.54% | ✅ 已完成 |
| `tableSelector.ts` | 97.22% | ✅ 已完成 |

## 待补充测试的模块

### 1. rowClickToCheck.ts（优先级：高）

**当前覆盖率**: 100% ✅
**状态**: 已完成

---

### 2. tableSelector.ts（优先级：高）

**当前覆盖率**: 97.22% ✅
**状态**: 已完成

**测试文件**: `tests/utils/tableSelector.spec.ts`
**测试用例数**: 45 个
**测试总结**: [docs/testing-summary-tableSelector.md](testing-summary-tableSelector.md)

**已覆盖功能**:
- ✅ 初始化流程和配置加载
- ✅ 启用/禁用/切换功能
- ✅ 样式注入和清理
- ✅ DOM 操作（创建按钮容器、蛇形布局）
- ✅ 按钮点击事件处理
- ✅ 隐藏分表索引管理
- ✅ 当前选中状态高亮
- ✅ 非目标页面行为
- ✅ 存储持久化

**未覆盖行**: 159-160, 179, 367（边界情况，可选补充）

---

### 3. userLinkQuery.ts（优先级：高）

**当前覆盖率**: 100% ✅
**状态**: 已完成

---

### 4. autoFill.ts（优先级：中）

**当前覆盖率**: 0%

**需要的页面结构**:

#### 4.1 rateForm.ts
- 评分表单（rateform）的 HTML 结构
- `score2`（威望）和 `score6`（热心值）输入框

#### 4.2 moderateForm.ts
- 处理表单（moderateform）的 HTML 结构
- `typeid` 下拉框结构

#### 4.3 reportForm.ts
- 举报表单（reportform）的 HTML 结构
- `select[name*="creditsvalue"]` 元素
- `input[name*="msg"]` 元素

**测试要点**:
- 表单检测和自动填充
- MutationObserver 监听动态表单
- 条件触发逻辑

---

## 不需要页面结构的模块（建议用 E2E 测试）

| 模块 | 原因 |
|------|------|
| `entries/contents/*.ts` | 入口文件，协调代码，集成测试更合适 |
| `entries/popup/main.ts` | Vue 应用入口，仅 4 行初始化代码 |

---

## 如何提供页面结构

在新会话中，请提供以下信息：

1. **页面 URL**: 完整的页面地址
2. **HTML 片段**: 相关 DOM 结构的 HTML 代码
3. **关键选择器**: 代码中使用的 CSS 选择器对应的元素

示例格式：

```html
<!-- userViolationFetcher 需要的页面结构 -->
<div class="violation-record">
  <table>
    <tr>
      <td>违规时间</td>
      <td>违规原因</td>
      <td>处理结果</td>
    </tr>
    <!-- 具体数据行 -->
  </table>
</div>
```

---

## 当前测试覆盖率概览

```
utils 目录整体覆盖率: 85%+

已达到 100% 的模块:
- storageHelper.ts ✅
- featureManager.ts ✅
- urlMatcher.ts ✅
- navigationHider.ts ✅
- themeManager.ts ✅
- userInfo.ts ✅
- floorHighlighter.ts ✅
- defaultTime.ts ✅
- avatarQuery.ts ✅
- quickReply.ts ✅
- nativeFloorDisplay.ts ✅
- duplicatePostDetection.ts ✅
- selectAll.ts ✅
- userLinkQuery.ts ✅
- rowClickToCheck.ts ✅

已达到 90%+ 的模块:
- userViolationFetcher.ts: 93.54% ✅
- tableSelector.ts: 97.22% ✅

需要提升的模块:
- utils/autofills/*.ts: 0% → 目标 80%+
```
