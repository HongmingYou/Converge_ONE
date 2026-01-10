项目介绍：Converge ONE

一、项目概述

Converge ONE 是一个 AI 原生的生产力工作空间，它将多个 AI 智能体（Framia、Enter、Hunter、Combos）整合到一个统一的协作平台中。这是一款旨在取代传统工作空间产品（如 Notion、Slack、ClickUp）的下一代产品，专为人机协作而设计。

技术栈：
- 前端：React 19 + TypeScript + Vite
- 样式：Tailwind CSS + shadcn/ui 组件库
- 状态管理：React Context + TanStack React Query
- 路由：React Router v7

---
二、核心功能

1. 多视图界面

- Chat 视图：统一的对话界面，支持多智能体工作流
- Projects 视图：长期结构化的文档工作空间
- Settings 视图：设置页面（结构已就绪，UI 待完善）

2. 四大核心 AI 智能体
┌────────┬────────────────┬────────────────────┬───────────────────────┐
│ 智能体 │      用途      │        输入        │         输出          │
├────────┼────────────────┼────────────────────┼───────────────────────┤
│ Framia │ 视觉设计与图形 │ 文本、上下文       │ 图片（PNG/JPG/SVG）   │
├────────┼────────────────┼────────────────────┼───────────────────────┤
│ Enter  │ 代码与应用开发 │ 文本、上下文、图片 │ 代码（React/TS/HTML） │
├────────┼────────────────┼────────────────────┼───────────────────────┤
│ Hunter │ 调研与分析     │ 文本、文件         │ 文档（PDF/Markdown）  │
├────────┼────────────────┼────────────────────┼───────────────────────┤
│ Combos │ 工作流自动化   │ 文本、上下文       │ 动作（JSON/YAML）     │
└────────┴────────────────┴────────────────────┴───────────────────────┘
3. 智能对话系统

- 支持 @AppName 语法路由到特定智能体
- 智能体间上下文传递（Context Passing）
- 实时 Artifact Canvas 展示智能体输出
- 支持多种 AI 模型选择（Claude 4.5、Gemini 3、GPT-5）

4. 项目管理

- 创建结构化项目进行深度工作
- 支持笔记、演示文稿、思维导图等类型
- 资源管理（文件、URL、知识库引用）

5. 资源库系统

- 自动保存对话中的 Artifacts
- 多种显示模式（网格、列表）
- 过滤器：全部、Artifacts、知识、回收站

---
三、用户旅程

首页（PrimarySidebar）
    ├── Chat 模式（默认）
    │   ├── 空状态 或 历史对话
    │   ├── 输入区域（消息输入、App选择器、模型选择器、文件附件）
    │   ├── 消息历史
    │   └── 右侧面板：Artifact Canvas（多输出展示、状态指示器）
    │
    ├── Projects 模式
    │   ├── 工作空间中心（最近工作、项目网格）
    │   ├── 创建新项目弹窗
    │   └── 点击项目 → Desk（编辑器）
    │       ├── 左侧：文件浏览器 & 对话
    │       ├── 中间：编辑器/预览
    │       └── 右侧：资源 & 对话列表
    │
    └── Settings 模式（结构已就绪）

---
四、待解决的问题与技术债务 (2026-01-11 更新)

### 1. 组件迁移与清理 (Refactoring Cleanup)

虽然核心重构已完成，但旧代码仍残留在项目中，导致逻辑重复和潜在的维护问题。

- **AddFiles 组件群**:
    - **现状**: `UnifiedAddFiles.tsx` 已创建，但旧组件 (`AddFilesButton.tsx`, `AddFilesPopover.tsx`, `AddFilesModal.tsx`) 仍存在且被使用。
    - **位置**:
        - `src/components/chat/InputArea.tsx` 仍引用旧的 `AddFilesPopover.tsx`。
        - `src/components/chat/ChatEmptyState.tsx` 仍使用旧的 `AddFilesButton.tsx`。
        - `src/components/AddFilesModal.tsx` 仍存在。
    - **问题**: 重复的 `formatFileSize`、`getFileIcon` 逻辑在这些旧文件中依然存在。
    - **行动**: 替换引用，删除旧文件。

### 2. 文本提及 (Mentions) 系统不一致

- **位置**: `ChatView.tsx` (渲染) vs `InputArea.tsx` (编辑/输入)
- **问题**:
    - 逻辑重复：两处分别实现了类似的解析逻辑 (`renderTextWithMentions` vs `parseTextWithMentions`)。
    - 样式不一致：ChatView 使用 `bg-white/20`，InputArea 使用 `bg-gray-100`。
    - 实现方式：InputArea 混合了 React 虚拟 DOM 和直接 DOM 操作 (`innerHTML`, `appendChild`)，较为脆弱。

### 3. 工具函数重复

尽管 `src/lib/utils.ts` 已更新，但以下函数在旧组件未删除前仍被重复定义：
- `formatFileSize` (在旧的 AddFiles 组件中)
- `getFileIcon` (在旧的 AddFiles 组件中)

### 4. 输入验证缺失 (Security & UX)

- **URL 输入**: 无格式验证，无 fetch 失败处理。
- **项目名称**: 无空检查、长度限制。
- **文件上传**: 无大小/类型严格验证。

### 5. 无障碍 (Accessibility)

- 图片缺失 `alt` 文本。
- 交互元素 (如文件树展开) 缺失 ARIA 标签。
- 键盘导航支持不完善。

---
五、已完成的重构 (Completed)

1. **Desk 组件拆分 (✅ Done)**
   - `Desk.tsx` 从 1850+ 行缩减至 ~450 行。
   - 拆分为 `FileTreePanel`, `ChatPanel`, `EditorPanel`。
   - 数据流通过 `use-project-data` Hook 进行了简化。

2. **统一文件组件架构 (✅ Done - 架构层面)**
   - 创建了 `UnifiedAddFiles.tsx` 和 `use-file-attachment.ts`。
   - *注意：旧组件尚需替换和删除。*

3. **工具函数库 (✅ Done)**
   - `src/lib/utils.ts` 已包含 `formatFileSize`, `formatTimeAgo` 等通用函数。

---
六、下一步行动计划 (Action Plan)

**高优先级 (立即执行):**

1. **完成 AddFiles 组件迁移**:
   - [ ] 修改 `InputArea.tsx` 引入 `UnifiedAddFiles` 中的 `AddFilesPopover`。
   - [ ] 修改 `ChatEmptyState.tsx` 使用新组件替代 `AddFilesButton`。
   - [ ] 验证无误后，删除 `src/components/chat/AddFilesButton.tsx`, `src/components/chat/AddFilesPopover.tsx` (旧), `src/components/AddFilesModal.tsx`。

2. **统一提及系统 (Mention System)**:
   - [ ] 提取提及解析逻辑为纯函数 (解析字符串 -> Token 列表)。
   - [ ] 创建统一的 `<MentionBadge />` 组件以保证样式一致。
   - [ ] 重构 `InputArea` 的渲染逻辑，尽量减少直接 DOM 操作。

**中优先级:**

1. **增加输入验证**:
   - [ ] 在 `UnifiedAddFiles` 中添加 URL 和文件校验。
   - [ ] 在 `NewProjectModal` 中添加表单验证。

2. **UI/UX 细节完善**:
   - [ ] 统一应用内的图标使用 (Lucide React)。
   - [ ] 优化加载状态 (Skeletons)。
