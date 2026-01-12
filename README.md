# Converge ONE

一款融合「Agent 执行」与「个人创作」的一站式 AI 工作台。将分散在各处的 AI 能力汇聚在统一场域，让用户可以指挥 AI 专家团队完成各类泛办公场景任务。

## 项目简介

Converge ONE 是一个 AI-Native 的工作台产品，旨在探索并定义人与 Agents Team 的协作范式。它既是招之即来的超级团队，也是辅助工作的顺手工具。

### 核心特性

- 💬 **Chat Interface**: 对标 ChatGPT/Gemini/Claude Web 的基础对话体验，支持多模型切换
- 🎨 **App Invocation**: 支持连接垂直应用（Framia、Enter）并激活对应的产物生产链路
- 📊 **Dynamic Canvas**: 垂直应用的产物在对话流旁的 Canvas 内展示
- 📚 **Library**: Chat 页面内产生的产物自动存放在 Library 中，支持溯源和进一步对话
- 📁 **Projects**: 创建项目工作空间，支持上传文档和 URL，进行封闭域的知识问答

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Radix UI + shadcn/ui
- **样式**: Tailwind CSS
- **路由**: React Router v7
- **状态管理**: React Query (TanStack Query)
- **表单处理**: React Hook Form + Zod
- **动画**: Framer Motion
- **包管理**: pnpm

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8.6

### 安装依赖

```bash
pnpm install
# 或使用项目提供的快捷命令
pnpm run pInstall
```

### 开发模式

```bash
pnpm run dev
```

### 构建

```bash
# 开发环境构建
pnpm run build

# 生产环境构建
pnpm run build:prod
```

### 预览

```bash
pnpm run preview
```

### 代码检查

```bash
pnpm run lint
```

## Git 仓库管理

本项目配置了多个远程仓库，可以同时推送到 GitHub 和 GitLab。

### 当前远程仓库配置

- **origin**: GitHub 仓库
  - 地址: `git@github.com:HongmingYou/Converge_ONE.git`
- **gitlab**: GitLab 仓库
  - 地址: `git@gitlab.knoffice.tech:hmyou/converge_one.git`

### 查看远程仓库

```bash
git remote -v
```

### 推送到不同仓库

#### 推送到 GitHub (origin)

```bash
# 推送当前分支到 GitHub
git push origin main

# 推送并设置上游分支
git push -u origin main

# 推送所有分支
git push origin --all

# 推送所有标签
git push origin --tags
```

#### 推送到 GitLab (gitlab)

```bash
# 推送当前分支到 GitLab
git push gitlab main

# 推送并设置上游分支
git push -u gitlab main

# 推送所有分支
git push gitlab --all

# 推送所有标签
git push gitlab --tags
```

#### 同时推送到多个仓库

```bash
# 方法 1: 依次推送
git push origin main && git push gitlab main

# 方法 2: 使用别名（推荐）
# 在 ~/.gitconfig 中添加：
# [alias]
#   pushall = !git push origin && git push gitlab
# 然后使用：
git pushall
```

### 添加新的远程仓库

```bash
# 添加新的远程仓库
git remote add <remote-name> <repository-url>

# 例如：添加一个新的 GitLab 仓库
git remote add gitlab-backup git@gitlab.knoffice.tech:backup/converge_one.git
```

### 修改远程仓库地址

```bash
# 修改现有远程仓库地址
git remote set-url <remote-name> <new-url>

# 例如：修改 gitlab 远程地址
git remote set-url gitlab git@gitlab.knoffice.tech:new-path/converge_one.git
```

### 删除远程仓库

```bash
# 删除远程仓库
git remote remove <remote-name>

# 例如：删除 gitlab 远程
git remote remove gitlab
```

### 从不同仓库拉取代码

```bash
# 从 GitHub 拉取
git pull origin main

# 从 GitLab 拉取
git pull gitlab main

# 从所有远程仓库获取更新（不合并）
git fetch --all
```

### 常用 Git 工作流示例

#### 场景 1: 日常开发并推送到两个仓库

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 进行开发并提交
git add .
git commit -m "feat: add new feature"

# 3. 推送到 GitHub
git push origin feature/new-feature

# 4. 推送到 GitLab
git push gitlab feature/new-feature
```

#### 场景 2: 同步两个仓库的代码

```bash
# 1. 从 GitHub 拉取最新代码
git pull origin main

# 2. 推送到 GitLab（保持同步）
git push gitlab main
```

#### 场景 3: 设置默认推送仓库

```bash
# 设置 GitLab 为默认推送仓库
git push -u gitlab main

# 之后可以直接使用
git push
```

## 项目结构

```
Converge_ONE/
├── src/
│   ├── components/      # React 组件
│   │   ├── chat/        # 聊天相关组件
│   │   ├── desk/        # 工作台组件
│   │   ├── ui/          # UI 基础组件
│   │   └── ...
│   ├── pages/           # 页面组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具函数和库
│   ├── context/         # React Context
│   ├── types/           # TypeScript 类型定义
│   └── data/            # 模拟数据
├── public/              # 静态资源
├── package.json
└── vite.config.ts
```

## 开发指南

### 代码规范

项目使用 ESLint 进行代码检查，请确保提交前通过 lint 检查：

```bash
pnpm run lint
```

### 提交规范

建议使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

示例：
```bash
git commit -m "feat: add chat interface component"
git commit -m "fix: resolve canvas rendering issue"
```

