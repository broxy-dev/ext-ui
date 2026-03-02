# Broxy Extension UI

[English](./README.md)

一个现代化的 Broxy MCP (Model Context Protocol) 服务器 Web 管理界面，使用 React、TypeScript 和 Tailwind CSS 构建。

## 功能特性

- **路由管理** - 创建和管理自定义 API 路由，支持 JavaScript 处理函数
- **MCP 工具** - 定义和配置 MCP 工具，支持自定义输入参数
- **实时日志** - 监控 API 调用和工具执行的日志
- **认证设置** - 可选的 Token 认证，保护 API 和 MCP 端点
- **初始化脚本** - 服务器启动后执行自定义 JavaScript 代码
- **数据导入导出** - 备份和恢复配置数据
- **深色/浅色主题** - 切换界面主题
- **国际化支持** - 支持中英文界面

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件原语 (shadcn/ui 模式)
- **Monaco Editor** - 代码编辑器
- **i18next** - 国际化

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 运行代码检查
npm run lint
```

## 项目结构

```
src/
  components/       # React 组件
    ui/            # 基础 UI 组件 (shadcn/ui)
  hooks/           # 自定义 React Hooks
  lib/             # 工具函数
  types/           # TypeScript 类型定义
  i18n/            # 国际化配置和语言文件
```

## 许可证

MIT
