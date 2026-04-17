# 技术栈详解

## 概述

52pjhelper 项目采用现代化的前端技术栈，专为浏览器扩展开发优化。技术栈选择考虑了开发效率、性能优化、维护成本和浏览器兼容性等多个因素。

## 核心框架

### WXT 框架 (^0.20.13)
**定位**: 浏览器扩展开发框架

**选择理由**:
1. **现代化架构**: 基于 Vite，提供优秀的开发体验
2. **TypeScript 原生支持**: 完整的类型安全保证
3. **模块化设计**: 支持按需加载和代码分割
4. **开发工具完善**: 热重载、调试工具等

**关键特性**:
- **Manifest V3 支持**: 完全兼容 Chrome 扩展最新标准
- **多入口支持**: 支持 content scripts、popup、background 等
- **构建优化**: 自动代码分割和资源优化
- **开发服务器**: 提供热重载和实时预览

**配置文件示例** (`wxt.config.ts`):
```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  manifest: {
    name: '52pjhelper',
    version: '1.0.0',
    manifest_version: 3,
    permissions: ['storage', 'activeTab'],
    content_scripts: [
      {
        matches: ['https://www.52pojie.cn/*'],
        js: ['entries/content/index.ts']
      }
    ]
  }
});
```

## 编程语言

### TypeScript (^5.9.3)
**定位**: 类型安全的 JavaScript 超集

**选择理由**:
1. **类型安全**: 编译时类型检查，减少运行时错误
2. **开发体验**: 智能代码补全和重构支持
3. **团队协作**: 明确的接口定义，便于团队协作
4. **维护性**: 类型系统提供代码文档和约束

**关键配置** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

## 包管理器

### pnpm (10.28.0)
**定位**: 快速、节省磁盘空间的包管理器

**选择理由**:
1. **性能优势**: 比 npm/yarn 更快的安装速度
2. **磁盘效率**: 使用硬链接和符号链接，节省磁盘空间
3. **严格性**: 默认使用严格模式，避免幽灵依赖
4. **Monorepo 支持**: 优秀的 Monorepo 支持

**关键命令**:
```bash
# 安装依赖
pnpm install

# 添加开发依赖
pnpm add -D typescript

# 添加生产依赖
pnpm add vue

# 运行脚本
pnpm run build
```

**配置文件** (`package.json` 片段):
```json
{
  "scripts": {
    "dev": "wxt",
    "build": "wxt build",
    "type-check": "tsc --noEmit && vue-tsc --noEmit"
  },
  "devDependencies": {
    "wxt": "^0.20.13",
    "typescript": "^5.9.3",
    "vue-tsc": "^2.0.0"
  },
  "dependencies": {
    "vue": "^3.5.27"
  }
}
```

## UI 框架

### Vue 3 (^3.5.27)
**定位**: 渐进式 JavaScript 框架

**选择理由**:
1. **组合式 API**: 更好的逻辑复用和代码组织
2. **性能优化**: 更小的包体积和更快的渲染
3. **TypeScript 支持**: 完整的类型支持
4. **生态系统**: 丰富的插件和工具链

**关键特性**:
- **`<script setup>` 语法**: 简化组件编写
- **响应式系统**: 基于 Proxy 的响应式系统
- **组合式函数**: 逻辑复用的最佳实践
- **单文件组件**: 模板、脚本、样式一体化

**组件示例**:
```vue
<template>
  <div class="feature-toggle">
    <label>
      <input
        type="checkbox"
        :checked="enabled"
        @change="toggleFeature"
      />
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  featureKey: string;
  label: string;
}>();

const enabled = ref(false);

async function toggleFeature() {
  enabled.value = !enabled.value;
  // 保存到存储
  await browser.storage.local.set({
    [props.featureKey]: enabled.value
  });
}
</script>

<style scoped>
.feature-toggle {
  margin: 8px 0;
}
</style>
```

## 浏览器支持

### Chrome (Manifest V3)
**定位**: 主要目标浏览器

**支持策略**:
1. **Manifest V3**: 使用最新的扩展标准
2. **现代 API**: 使用 Promise-based API
3. **安全最佳实践**: 遵循 Chrome 扩展安全指南
4. **性能优化**: 针对 Chrome 进行性能优化

**关键 API**:
- **`chrome.storage`**: 本地存储 API
- **`chrome.runtime`**: 运行时通信 API
- **`chrome.tabs`**: 标签页管理 API
- **`chrome.scripting`**: 脚本注入 API

## 开发工具链

### 构建工具
- **Vite**: 基于原生 ES 模块的构建工具
- **Rollup**: 生产环境打包工具
- **ESBuild**: 极速的 JavaScript 打包器

### 代码质量工具
- **ESLint**: JavaScript/TypeScript 代码检查
- **Prettier**: 代码格式化工具
- **oxlint**: 快速的 JavaScript/TypeScript linter
- **oxfmt**: 快速的代码格式化工具

### 测试工具
- **Vitest**: 基于 Vite 的测试框架
- **Playwright**: 端到端测试框架
- **Testing Library**: 组件测试工具

## 样式方案

### CSS 方案
1. **原生 CSS**: 使用 CSS 变量和现代特性
2. **Scoped CSS**: Vue 单文件组件的样式作用域
3. **CSS 模块**: 局部作用域的 CSS 类名
4. **PostCSS**: CSS 转换和优化

### 设计系统
1. **CSS 变量**: 统一的主题和设计令牌
2. **响应式设计**: 移动端友好的布局
3. **无障碍支持**: WCAG 2.1 标准兼容
4. **性能优化**: 关键 CSS 和代码分割

## 开发工作流

### 开发环境
```bash
# 1. 安装依赖
pnpm install

# 2. 类型检查
pnpm run type-check

# 3. 开发服务器（由用户手动执行）
# pnpm run dev

# 4. 构建（由用户手动执行）
# pnpm run build
```

### 代码规范
1. **TypeScript 严格模式**: 启用所有严格检查
2. **ESLint 规则**: 自定义代码质量规则
3. **Prettier 格式化**: 统一的代码格式
4. **提交规范**: Conventional Commits

### 测试策略
1. **单元测试**: 测试独立的功能模块
2. **集成测试**: 测试模块间交互
3. **端到端测试**: 测试完整用户流程
4. **性能测试**: 监控性能指标

## 部署和发布

### 构建配置
```typescript
// wxt.config.ts
export default defineConfig({
  // 开发配置
  dev: {
    server: {
      port: 3000
    }
  },
  
  // 生产配置
  build: {
    minify: true,
    sourcemap: false
  },
  
  // 实验性功能
  experimental: {
    includeBrowserPolyfill: true
  }
});
```

### 发布流程
1. **版本管理**: 语义化版本控制
2. **代码签名**: Chrome Web Store 要求
3. **发布审核**: 扩展商店审核流程
4. **更新策略**: 向后兼容和迁移

## 性能优化

### 加载性能
1. **代码分割**: 按需加载功能模块
2. **资源优化**: 图片和字体优化
3. **缓存策略**: 合理的缓存配置
4. **懒加载**: 延迟加载非关键资源

### 运行时性能
1. **事件委托**: 减少事件监听器数量
2. **虚拟 DOM**: Vue 的高效更新机制
3. **内存管理**: 及时清理资源
4. **防抖节流**: 优化频繁操作

### 构建优化
1. **Tree Shaking**: 移除未使用代码
2. **压缩混淆**: 减少代码体积
3. **模块合并**: 减少 HTTP 请求
4. **预加载**: 关键资源预加载

## 安全考虑

### 内容安全
1. **CSP 策略**: 内容安全策略配置
2. **输入验证**: 用户输入验证和清理
3. **XSS 防护**: 跨站脚本攻击防护
4. **CSRF 防护**: 跨站请求伪造防护

### 数据安全
1. **存储加密**: 敏感数据加密存储
2. **传输安全**: HTTPS 和加密通信
3. **权限最小化**: 最小必要权限原则
4. **隐私保护**: 用户隐私数据保护

---

**相关链接**：
- [架构概述](overview.md)
- [Content Script 架构](content-script.md)
- [模块结构](module-structure.md)
- [开发文档](../development/getting-started.md)