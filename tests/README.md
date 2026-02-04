# 测试目录

本目录包含 52pjhelper 浏览器扩展的所有测试文件。

## 目录结构

测试目录镜像 `src/` 目录的结构：

```
tests/
├── utils/              # 工具类测试
│   ├── storageHelper.spec.ts
│   ├── urlMatcher.spec.ts
│   ├── messageHelper.spec.ts
│   ├── featureManager.spec.ts
│   ├── userInfo.spec.ts
│   ├── themeManager.spec.ts
│   ├── avatarQuery.spec.ts
│   ├── quickReply.spec.ts
│   ├── floorHighlighter.spec.ts
│   ├── navigationHider.spec.ts
│   ├── nativeFloorDisplay.spec.ts
│   ├── defaultTime.spec.ts
│   ├── duplicatePostDetection.spec.ts
│   ├── selectAll.spec.ts
│   ├── tableSelector.spec.ts
│   ├── userLinkQuery.spec.ts
│   ├── rowClickToCheck.spec.ts
│   └── contentFilter.spec.ts
├── components/         # Vue 组件测试
│   ├── AvatarQueryToggle.spec.ts
│   ├── QuickReplyToggle.spec.ts
│   ├── FloorHighlighterToggle.spec.ts
│   ├── NativeFloorDisplayToggle.spec.ts
│   ├── AutoFillToggle.spec.ts
│   ├── DuplicatePostDetectionToggle.spec.ts
│   ├── SelectAllToggle.spec.ts
│   ├── UserLinkQueryToggle.spec.ts
│   ├── DefaultTimeToggle.spec.ts
│   ├── RowClickToCheckToggle.spec.ts
│   ├── TableSelectorToggle.spec.ts
│   ├── ContentFilterToggle.spec.ts
│   ├── AdminFeaturesToggle.spec.ts
│   ├── GeneralFeaturesToggle.spec.ts
│   ├── NavigationSettings.spec.ts
│   └── SettingsPanel.spec.ts
├── composables/        # 可组合函数测试（待添加）
├── entries/            # 入口文件测试（待添加）
└── features/           # 功能集成测试（待添加）
```

## 测试文件命名规范

- 测试文件使用 `.spec.ts` 后缀
- 测试文件与源文件同名
- 测试文件路径镜像源文件路径

**示例**：
- 源文件：`src/utils/storageHelper.ts`
- 测试文件：`tests/utils/storageHelper.spec.ts`

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试 UI 界面
pnpm test:ui

# 监听模式（开发环境）
pnpm test -- --watch
```

## 编写测试

### 基本模板

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { yourFunction } from '@/utils/yourModule'

describe('yourFunction', () => {
  beforeEach(() => {
    // 重置 fake browser 状态
    fakeBrowser.reset()
  })

  it('应该正确执行功能', async () => {
    // Arrange: 准备测试数据
    const input = 'test'

    // Act: 执行操作
    const result = await yourFunction(input)

    // Assert: 验证结果
    expect(result).toBe('expected')
  })
})
```

### 测试组织原则

1. **使用 describe 分组**：按功能或类型分组相关测试
2. **清晰的测试描述**：使用中文描述测试意图
3. **AAA 模式**：Arrange（准备）、Act（执行）、Assert（验证）
4. **测试独立性**：每个测试应该独立运行，使用 `beforeEach` 重置状态

## 测试覆盖率

当前测试覆盖率：

### 基础工具类（6 个）
- ✅ **storageHelper.ts**: 67.12%（34 个测试用例）
- ✅ **urlMatcher.ts**: 100% 🎉（36 个测试用例）
- ✅ **messageHelper.ts**: 83.33%（9 个测试用例）
- ✅ **featureManager.ts**: 100% 🎉（29 个测试用例）
- ✅ **userInfo.ts**: 100% 🎉（30 个测试用例）
- ✅ **themeManager.ts**: 100% 🎉（24 个测试用例）

### 功能工具类（12/12 完成）
- ✅ **avatarQuery.ts**: 100% 🎉（28 个测试用例）
- ✅ **quickReply.ts**: 100% 🎉（18 个测试用例）
- ✅ **floorHighlighter.ts**: 100% 🎉（21 个测试用例）
- ✅ **navigationHider.ts**: 100% 🎉（30 个测试用例）
- ✅ **nativeFloorDisplay.ts**: 100% 🎉（18 个测试用例）
- ✅ **defaultTime.ts**: 100% 🎉（18 个测试用例）
- ✅ **duplicatePostDetection.ts**: 100% 🎉（18 个测试用例）
- ✅ **selectAll.ts**: 100% 🎉（20 个测试用例）
- ✅ **tableSelector.ts**: 100% 🎉（18 个测试用例）
- ✅ **userLinkQuery.ts**: 100% 🎉（25 个测试用例）
- ✅ **rowClickToCheck.ts**: 100% 🎉（15 个测试用例）
- ✅ **contentFilter.ts**: 待验证（28 个测试用例）

### Vue 组件（16 个）
- ✅ 所有功能开关组件: 100% 🎉（144 个测试用例）
- ✅ 组合组件: 100% 🎉（30 个测试用例）
- ✅ 主容器组件: 100% 🎉（47 个测试用例）

**总计**：34 个测试文件，648 个测试用例

目标：所有核心工具类达到 80% 以上的测试覆盖率。

## 参考资料

- [WXT 单元测试文档](https://wxt.dev/guide/essentials/unit-testing.html)
- [Vitest 官方文档](https://vitest.dev/)
- [功能工具类测试总结](../docs/testing-summary-feature-utils-2026-02-03.md)
- [Vue 组件测试总结](../docs/vue-components-testing-summary.md)
