# 快速开始

欢迎参与 52pjhelper 项目开发！本文档将指导你快速搭建开发环境并开始贡献代码。

## 环境要求

### 必备工具
- **Node.js** 18.0.0 或更高版本
- **pnpm** 8.0.0 或更高版本（推荐使用最新版）
- **Git** 2.20.0 或更高版本
- **Chrome 浏览器** 最新版本（用于测试）

### 可选工具
- **Visual Studio Code**（推荐编辑器）
- **Vue Language Features (Volar)** 扩展
- **ESLint** 和 **Prettier** 扩展

## 环境搭建

### 1. 克隆项目
```bash
# 克隆项目到本地（使用项目实际仓库 URL 替换 <repository-url>）
git clone <repository-url>
cd 52pjhelper

# 或者使用 SSH（使用实际用户名替换 username）
git clone git@github.com:username/52pjhelper.git
cd 52pjhelper
```

### 2. 安装依赖
```bash
# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或者使用 npm
npm install
```

### 3. 验证安装
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 检查 pnpm 版本
pnpm --version  # 应该 >= 8.0.0

# 检查 TypeScript 编译
npx tsc --version
```

## 开发命令

### 基础命令
```bash
# 安装依赖
pnpm install

# 类型检查
npx tsc --noEmit          # TypeScript 类型检查
npx vue-tsc --noEmit      # Vue 3 + TypeScript 类型检查

# 代码质量检查
pnpm lint                 # ESLint 检查
pnpm format               # Prettier 格式化
```

### 开发服务器
```bash
# 启动开发服务器（谨慎使用）
pnpm dev

# 构建项目（谨慎使用）
pnpm build
```

**重要提示**：
- `pnpm dev` 和 `pnpm build` 命令会启动开发服务器或构建项目
- 这些命令可能导致不必要的资源占用
- 如需构建或运行项目，请手动执行并注意资源使用

## 项目结构

### 主要目录
```
52pjhelper/
├── src/                    # 源代码
│   ├── entries/           # 入口文件
│   │   ├── contents/      # Content Script
│   │   ├── popup/         # Popup 页面
│   │   └── background/    # Background Script
│   ├── components/        # Vue 组件
│   ├── pages/            # Vue 页面
│   ├── composables/      # 可组合函数
│   ├── utils/            # 工具类
│   └── configs/          # 配置文件
├── docs/                  # 项目文档
├── public/               # 静态资源
└── dist/                 # 构建输出
```

### 配置文件
```
52pjhelper/
├── wxt.config.ts         # WXT 框架配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── eslint.config.js      # ESLint 配置
├── prettier.config.js    # Prettier 配置
└── package.json          # 项目依赖和脚本
```

## 开发工作流

### 1. 创建分支
```bash
# 从 main 分支创建新分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 开发功能
```bash
# 安装依赖（如果需要）
pnpm install

# 运行类型检查
npx tsc --noEmit
npx vue-tsc --noEmit

```

### 3. 提交代码
```bash
# 添加更改
git add .

# 提交更改（使用有意义的提交信息）
git commit -m "feat: 添加新功能描述"

# 或者使用交互式提交
git commit
```

### 4. 代码审查
```bash
# 推送分支到远程
git push origin feature/your-feature-name

# 创建 Pull Request
# 在 GitHub 上创建 PR，等待代码审查
```

### 5. 合并代码
- 通过代码审查后，合并到 main 分支
- 删除特性分支
- 更新本地仓库

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规则
- 使用有意义的变量和函数名
- 添加必要的注释

### 提交规范
使用约定式提交：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `chore:` 构建过程或辅助工具

## 调试技巧

### 浏览器调试
1. 打开 Chrome 扩展管理页面（chrome://extensions/）
2. 开启"开发者模式"
3. 加载已解压的扩展程序（选择项目目录）
4. 使用 Chrome DevTools 调试

### VS Code 调试
1. 安装 Debugger for Chrome 扩展
2. 配置 launch.json 文件
3. 设置断点并启动调试

### 控制台日志
```typescript
// 使用 console.log 进行调试
console.log('调试信息:', variable)

// 使用 console.group 组织日志
console.group('功能模块')
console.log('步骤1:', data1)
console.log('步骤2:', data2)
console.groupEnd()
```

## 常见问题

### Q: 类型检查失败怎么办？
A: 检查 TypeScript 错误信息，修复类型错误。如果遇到第三方库类型问题，可以尝试：
```bash
# 更新类型定义
pnpm add -D @types/package-name

# 或者添加类型声明
// src/types/global.d.ts
declare module 'package-name'
```


### Q: 构建失败怎么办？
A: 检查构建错误信息，常见问题包括：
- 缺少依赖
- 类型错误
- 配置问题

### Q: 如何添加新的依赖？
A: 使用 pnpm 添加依赖：
```bash
# 生产依赖
pnpm add package-name

# 开发依赖
pnpm add -D package-name

# 更新依赖
pnpm update package-name
```

## 学习资源

### 项目相关
- [WXT 框架文档](https://wxt.dev/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

### 开发工具
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [ESLint 配置](https://eslint.org/docs/user-guide/configuring/)

### 代码规范
- [约定式提交](https://www.conventionalcommits.org/)
- [Airbnb JavaScript 风格指南](https://github.com/airbnb/javascript)
- [Google TypeScript 风格指南](https://google.github.io/styleguide/tsguide.html)

## 获取帮助

### 项目内部
- 查看相关文档
- 阅读现有代码示例
- 查看测试用例

### 外部资源
- Stack Overflow
- GitHub Issues
- 官方文档

### 社区支持
- 项目讨论区
- 开发者群组
- 技术论坛

## 下一步
- [查看架构文档](../architecture/overview.md)
- [学习自动导入机制](auto-import.md)
- [了解可组合函数式架构](composable-architecture.md)
- [阅读最佳实践](best-practices.md)

---

*最后更新：2026-04-17*  
*文档版本：1.0.0*