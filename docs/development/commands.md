# 开发命令指南

本文档详细介绍了项目中所有可用的开发命令及其使用场景。

## 核心开发命令

### 依赖管理

```bash
# 安装项目依赖
pnpm install

# 安装特定依赖包
pnpm add <package-name>

# 安装开发依赖
pnpm add -D <package-name>

# 更新依赖包
pnpm update <package-name>

# 移除依赖包
pnpm remove <package-name>
```

### 类型检查

```bash
# TypeScript 类型检查
npx tsc --noEmit

# Vue 3 + TypeScript 类型检查
npx vue-tsc --noEmit
```

**重要提示**：

- 每次修改代码后都应运行类型检查，确保类型安全
- 类型检查不会生成实际文件，仅验证类型正确性
- 建议在提交代码前运行类型检查

### 代码格式化

```bash
# 使用 oxfmt 格式化代码
npx oxfmt

# 检查代码格式问题
npx oxfmt --check
```

### 代码质量检查

```bash
# 使用 oxlint 检查代码质量
npx oxlint

# 修复可自动修复的问题
npx oxlint --fix
```

## 构建和运行命令

**重要安全提示**：

- **禁止在 Claude Code 中运行** `pnpm dev` 和 `pnpm build` 命令
- 这些命令会启动开发服务器或构建项目，可能导致不必要的资源占用
- 如需构建或运行项目，请由用户手动执行

### 开发服务器

```bash
# 启动开发服务器（用户手动执行）
pnpm dev

# 指定浏览器
pnpm dev --browser chrome
pnpm dev --browser firefox
```

### 构建项目

```bash
# 构建生产版本（用户手动执行）
pnpm build

# 构建特定浏览器版本
pnpm build --browser chrome
pnpm build --browser firefox
```

### 预览构建结果

```bash
# 预览构建结果（用户手动执行）
pnpm preview
```

## 测试命令

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test src/components/__tests__/MyComponent.spec.ts

# 运行测试并生成覆盖率报告
pnpm test --coverage

# 以 UI 模式运行测试
pnpm test --ui
```

### 测试开发

```bash
# 监听模式运行测试
pnpm test --watch

# 运行特定测试套件
pnpm test --run <test-name>
```

## 代码质量工具

### 代码格式化配置

项目使用 `oxfmt` 作为代码格式化工具，配置文件位于项目根目录：

```json
// .oxfmt.json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 代码检查配置

项目使用 `oxlint` 作为代码检查工具，配置继承自项目预设：

```json
// .oxlint.json
{
  "extends": ["recommended"],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error"
  }
}
```

## 项目维护命令

### 清理命令

```bash
# 清理构建产物
pnpm clean

# 清理 node_modules 并重新安装
pnpm reinstall
```

### 依赖检查

```bash
# 检查过时的依赖包
pnpm outdated

# 检查依赖包的安全漏洞
pnpm audit

# 修复安全漏洞
pnpm audit fix
```

## 环境变量

项目支持以下环境变量：

```bash
# 开发环境
NODE_ENV=development

# 生产环境
NODE_ENV=production

# 调试模式
DEBUG=true
```

## 命令使用最佳实践

### 1. 开发工作流

1. **开始开发前**：

   ```bash
   pnpm install
   ```

2. **编写代码时**：

   ```bash
   # 定期运行类型检查
   npx tsc --noEmit
   npx vue-tsc --noEmit

   # 定期格式化代码
   npx oxfmt
   ```

3. **提交代码前**：
   ```bash
   # 运行完整的代码质量检查
   npx tsc --noEmit
   npx vue-tsc --noEmit
   npx oxfmt --check
   npx oxlint
   ```

### 2. 安全注意事项

1. **避免资源占用**：
   - 不要在 Claude Code 中运行 `pnpm dev` 或 `pnpm build`
   - 这些命令会启动长期运行的进程，占用系统资源

2. **权限管理**：
   - 只运行必要的命令
   - 避免运行需要管理员权限的命令

3. **环境隔离**：
   - 确保在正确的项目目录中运行命令
   - 避免影响其他项目

### 3. 故障排除

#### 常见问题

1. **依赖安装失败**：

   ```bash
   # 清理缓存并重试
   pnpm store prune
   pnpm install
   ```

2. **类型检查错误**：

   ```bash
   # 检查 TypeScript 配置
   npx tsc --showConfig

   # 检查特定文件的类型
   npx tsc --noEmit src/path/to/file.ts
   ```

3. **构建失败**：
   - 检查依赖版本兼容性
   - 检查环境变量配置
   - 查看构建日志中的详细错误信息

## 相关文档

- [快速开始指南](../getting-started.md) - 新开发者入门指南
- [代码风格规范](../code-style.md) - 详细的代码规范要求
- [最佳实践指南](../best-practices.md) - 开发经验和建议

---

_文档版本：1.0.0_  
_最后更新：2026-04-17_
