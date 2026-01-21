# 吾爱管理效率助手

一个专为吾爱破解论坛(52pojie.cn)设计的浏览器扩展，提供便捷的导航菜单管理功能，提升论坛管理效率。

## 功能特性

- **导航菜单管理**: 允许用户自定义显示/隐藏论坛顶部导航菜单
- **实时预览**: 点击按钮实时切换菜单显示/隐藏状态
- **本地存储**: 配置自动保存到浏览器本地存储
- **一键重置**: 支持恢复默认导航菜单配置
- **直观界面**: 蓝色背景表示菜单显示，灰色背景表示菜单隐藏

## 安装与使用

### 开发模式

1. 安装依赖：
   ```bash
   pnpm install
   ```

2. 启动开发服务器：
   ```bash
   pnpm dev
   ```

3. 加载扩展：
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录下的 `dist/` 文件夹

### 生产构建

1. 构建生产版本：
   ```bash
   pnpm build
   ```

2. 打包扩展：
   ```bash
   pnpm zip
   ```

## 项目结构

```
52pjhelper/
├── src/
│   ├── components/         # Vue 3 组件目录
│   │   └── navConsole/    # 导航控制台组件
│   │       ├── NavConsole.vue
│   │       └── index.ts
│   ├── entries/            # 入口文件目录
│   │   ├── contents.ts    # Content Script（页面注入脚本）
│   │   └── popup/         # Popup 页面入口
│   │       ├── main.ts
│   │       └── style.css
│   └── utils/             # 工具类目录
│       └── navigationHider.ts  # 导航菜单管理工具
├── public/                # 静态资源
├── dist/                  # 编译输出目录
├── index.html             # Popup 页面 HTML
├── wxt.config.ts          # WXT 框架配置
└── package.json           # 项目依赖
```

## 技术栈

- **框架**: WXT ^0.20.13（现代化浏览器扩展开发框架）
- **语言**: TypeScript
- **UI 框架**: Vue 3
- **构建工具**: Vite（WXT 内置）
- **包管理器**: pnpm
- **浏览器支持**: Chrome (Manifest V3)

## 使用说明

1. 安装扩展后，点击浏览器工具栏中的扩展图标
2. 在弹出的界面中，点击导航菜单按钮可切换其显示/隐藏状态
3. 蓝色背景表示菜单当前可见，灰色背景表示菜单当前隐藏
4. 点击"重置为默认"按钮可恢复所有菜单的显示状态

## 许可证

项目采用 AGPL-3.0-only 许可证。
