import { Message, KnowledgeItem, Agent, LibraryArtifact, KnowledgeCollection } from '@/types';
import { CardData } from '@/types/project';

// Chat History - Showcases multi-app workflows
export const MOCK_HISTORY = [
  { id: '1', title: '产品发布全流程：调研+设计+开发', time: 'Today', projectId: undefined },
  { id: '2', title: 'AI Agent 市场趋势报告', time: 'Today', projectId: 'proj-001' }, // Q3 Competitor Analysis
  { id: '3', title: 'SaaS 仪表板原型设计', time: 'Yesterday', projectId: 'proj-003' }, // Technical Architecture Notes
  { id: '4', title: '社交媒体自动化工作流', time: 'Yesterday', projectId: undefined },
  { id: '5', title: '竞品分析与营销海报', time: 'Previous 7 Days', projectId: 'proj-001' }, // Q3 Competitor Analysis
];

// APP Icons
const APP_ICONS = {
  hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
  enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
  combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
  framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
};

// Full Chat Conversations
export const MOCK_FULL_CHATS: Record<string, Message[]> = {
  // Chat 1: Multi-App Product Launch Workflow (Hunter → Framia → Enter)
  '1': [
    {
      id: '101',
      role: 'user',
      type: 'text',
      content: '我们要发布一款 AI 写作助手产品，帮我先调研一下市场上类似产品的定价和功能',
      selectedApp: {
        name: 'Hunter',
        icon: APP_ICONS.hunter
      }
    },
    {
      id: '102',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-101',
      appData: {
        appType: 'hunter',
        appName: 'Hunter',
        appIcon: APP_ICONS.hunter,
        status: 'completed',
        introText: '我将使用 Hunter 帮你搜索和分析竞品信息',
        followUpText: `市场调研已完成！主要发现：

**竞品定价**
• Jasper AI: $39-$99/月（按字数计费）
• Copy.ai: $49/月起（无限字数）
• Writesonic: $19-$99/月（分级方案）

**核心功能**
• AI 内容生成（博客、营销文案、社交媒体）
• 多语言支持
• SEO 优化建议
• 团队协作功能

**市场空白**
• 缺少垂直行业定制（法律、医疗等）
• 实时协作编辑体验不佳

需要我继续深入分析某个方向吗？`
      },
      contextSnapshot: []  // First message, no context
    },
    {
      id: '103',
      role: 'user',
      type: 'text',
      content: '很好！现在帮我设计一张产品发布海报，主题是"AI 赋能创作，解放生产力"，要科技感',
      selectedApp: {
        name: 'Framia',
        icon: APP_ICONS.framia
      }
    },
    {
      id: '104',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-102',
      appData: {
        appType: 'framia',
        appName: 'Framia',
        appIcon: APP_ICONS.framia,
        status: 'completed',
        introText: '我将使用 Framia 完成你的设计任务',
        followUpText: `海报设计已完成！主要元素：

**视觉风格**
• 渐变背景：深蓝到紫色（科技感）
• 主视觉：AI 神经网络图案
• 字体：现代无衬线，加粗标题

**内容层次**
• 主标题："AI 赋能创作"
• 副标题："解放生产力，专注创意"
• Call-to-Action："免费试用 14 天"

你可以在右侧 Canvas 中查看完整效果，或点击 "Edit in Framia" 进行调整！`
      },
      contextSnapshot: [
        {
          summary: 'Market research on AI writing tools: pricing ranges from $19-$99/month',
          structuredData: {
            competitors: ['Jasper AI', 'Copy.ai', 'Writesonic'],
            priceRange: { min: 19, max: 99 },
            keyFeatures: ['AI content generation', 'Multi-language', 'SEO optimization'],
            marketGaps: ['Vertical industry customization', 'Real-time collaboration']
          },
          tags: ['research', 'pricing', 'competitor', 'ai-writing', 'market-gap'],
          sourceArtifactId: 'artifact-101',
          sourceName: 'Hunter',
          dataSize: '2KB'
        }
      ]
    },
    {
      id: '105',
      role: 'user',
      type: 'text',
      content: '完美！最后帮我快速搭建一个产品介绍的落地页，要有产品特性展示和注册表单',
      selectedApp: {
        name: 'Enter',
        icon: APP_ICONS.enter
      }
    },
    {
      id: '106',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-103',
      appData: {
        appType: 'enter',
        appName: 'Enter',
        appIcon: APP_ICONS.enter,
        status: 'completed',
        introText: '我将使用 Enter 为你构建落地页',
        followUpText: `落地页已构建完成！包含以下模块：

**页面结构**
• Hero Section：大标题 + CTA 按钮
• Features Grid：4 大核心功能卡片
• Pricing Table：3 个定价方案
• Email Signup Form：集成表单验证

**技术栈**
• React + TypeScript
• Tailwind CSS 响应式设计
• Framer Motion 动画效果

你可以在右侧预览，点击 "Open in Enter" 继续编辑代码或部署上线！`
      },
      contextSnapshot: [
        {
          summary: 'Market research on AI writing tools: pricing ranges from $19-$99/month',
          structuredData: {
            competitors: ['Jasper AI', 'Copy.ai', 'Writesonic'],
            priceRange: { min: 19, max: 99 },
            keyFeatures: ['AI content generation', 'Multi-language', 'SEO optimization'],
            marketGaps: ['Vertical industry customization', 'Real-time collaboration']
          },
          tags: ['research', 'pricing', 'competitor', 'ai-writing', 'market-gap'],
          sourceArtifactId: 'artifact-101',
          sourceName: 'Hunter',
          dataSize: '2KB'
        },
        {
          summary: 'Product launch poster design with tech-focused visual style',
          structuredData: {
            colors: ['#4F46E5', '#7C3AED'],
            style: 'Tech-focused gradient',
            components: ['Main title', 'Subtitle', 'CTA button'],
            designSystem: { borderRadius: '8px', typography: 'Modern sans-serif' }
          },
          tags: ['design', 'poster', 'branding', 'tech-style', 'visual'],
          sourceArtifactId: 'artifact-102',
          sourceName: 'Framia',
          dataSize: '1.5KB'
        }
      ]
    }
  ],

  // Chat 2: Hunter Deep Research
  '2': [
    {
      id: '201',
      role: 'user',
      type: 'text',
      content: '帮我深度调研一下 2025 年 AI Agent 市场的发展趋势，生成一份完整报告',
      selectedApp: {
        name: 'Hunter',
        icon: APP_ICONS.hunter
      }
    },
    {
      id: '202',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-201',
      appData: {
        appType: 'hunter',
        appName: 'Hunter',
        appIcon: APP_ICONS.hunter,
        status: 'completed',
        introText: '我将使用 Hunter 帮你搜索和分析 AI Agent 市场趋势',
        followUpText: `市场趋势报告已生成！核心洞察：

**市场规模**
• 2025 年预计达 $450 亿美元
• 年复合增长率 38.5%
• 企业级 AI Agent 占比 62%

**关键趋势**
1. **多模态能力**：文本+图像+语音融合
2. **自主学习**：从用户反馈中持续优化
3. **垂直行业定制**：医疗、法律、金融专用 Agent
4. **协作型 Agent**：多个 Agent 协同完成复杂任务

**投资热点**
• Agent 开发平台（如 LangChain, AutoGPT）
• Agent 安全与合规工具
• Agent 性能监控与分析

完整报告已在 Canvas 中展示，可导出为 PDF！`
      }
    },
    {
      id: '203',
      role: 'user',
      type: 'text',
      content: '很详细！能再补充一下主要的竞争对手和他们的产品特点吗？'
    },
    {
      id: '204',
      role: 'assistant',
      type: 'text',
      content: `当然，这里是主要竞争对手分析：

**OpenAI GPTs**
• 优势：生态最成熟，用户基数大
• 劣势：定制化能力有限

**Anthropic Claude**
• 优势：上下文窗口最长（200K tokens）
• 劣势：API 价格较高

**Google Gemini**
• 优势：多模态能力强，整合 Google 生态
• 劣势：企业级功能待完善

**开源方案（LangChain + Llama）**
• 优势：成本低，完全可控
• 劣势：需要技术团队维护

建议关注"协作型 Agent"和"垂直行业定制"两个方向，市场空间更大！`
    }
  ],

  // Chat 3: Design to Code Workflow (Framia → Enter)
  '3': [
    {
      id: '301',
      role: 'user',
      type: 'text',
      content: '我需要设计一个 SaaS 产品的仪表板界面，要有数据可视化，现代简洁风格',
      selectedApp: {
        name: 'Framia',
        icon: APP_ICONS.framia
      }
    },
    {
      id: '302',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-301',
      appData: {
        appType: 'framia',
        appName: 'Framia',
        appIcon: APP_ICONS.framia,
        status: 'completed',
        introText: '我将使用 Framia 完成仪表板的设计',
        followUpText: `仪表板设计已完成！设计要点：

**布局结构**
• 顶部导航：Logo + 搜索 + 用户头像
• 左侧边栏：功能模块导航
• 主内容区：Grid 布局的数据卡片

**数据可视化**
• 折线图：展示用户增长趋势
• 饼图：流量来源分布
• 数据卡片：关键指标（KPI）
• 表格：最近活动列表

**设计系统**
• 配色：白底 + 蓝紫渐变主题色
• 圆角：8px 统一圆角
• 阴影：轻微卡片阴影增强层次

你可以在 Canvas 中查看完整设计稿！`
      },
      contextSnapshot: []
    },
    {
      id: '303',
      role: 'user',
      type: 'text',
      content: '太棒了！帮我把这个设计转换成可运行的 React 代码',
      selectedApp: {
        name: 'Enter',
        icon: APP_ICONS.enter
      }
    },
    {
      id: '304',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-302',
      appData: {
        appType: 'enter',
        appName: 'Enter',
        appIcon: APP_ICONS.enter,
        status: 'completed',
        introText: '我将使用 Enter 将设计转换为代码',
        followUpText: `React 仪表板代码已生成！技术细节：

**组件架构**
\`\`\`
Dashboard/
├── Sidebar.tsx
├── TopNav.tsx
├── KPICards.tsx
├── Charts/
│   ├── LineChart.tsx
│   └── PieChart.tsx
└── ActivityTable.tsx
\`\`\`

**使用的库**
• Recharts：图表可视化
• Tailwind CSS：样式系统
• React Icons：图标库
• TypeScript：类型安全

**已实现功能**
✅ 响应式布局（适配移动端）
✅ 主题切换（明暗模式）
✅ 模拟数据接口
✅ 加载状态处理

在 Canvas 中预览，点击 "Open in Enter" 查看完整代码！`
      },
      contextSnapshot: [
        {
          summary: 'SaaS dashboard design with modern layout and data visualization components',
          structuredData: {
            layout: ['Top nav', 'Left sidebar', 'Main grid'],
            charts: ['Line chart', 'Pie chart', 'KPI cards', 'Activity table'],
            designSystem: {
              colors: ['white', '#4F46E5', '#7C3AED'],
              borderRadius: '8px',
              shadows: 'Light card shadows'
            }
          },
          tags: ['design', 'dashboard', 'data-viz', 'ui', 'layout'],
          sourceArtifactId: 'artifact-301',
          sourceName: 'Framia',
          dataSize: '1.8KB'
        }
      ]
    }
  ],

  // Chat 4: Workflow Automation with Combos
  '4': [
    {
      id: '401',
      role: 'user',
      type: 'text',
      content: '帮我创建一个自动化工作流：每天早上 9 点抓取科技新闻，总结成 Twitter 风格的短文，然后发布到我的账号',
      selectedApp: {
        name: 'Combos',
        icon: APP_ICONS.combos
      }
    },
    {
      id: '402',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-401',
      appData: {
        appType: 'combos',
        appName: 'Combos',
        appIcon: APP_ICONS.combos,
        status: 'completed',
        introText: '我将使用 Combos 处理这个自动化工作流程',
        followUpText: `工作流已创建！流程架构：

**工作流步骤**
1. **定时触发**：每天 09:00 AM (UTC+8)
2. **数据采集**：抓取 TechCrunch + The Verge 头条
3. **内容处理**：
   • GPT-4 总结要点
   • 限制 280 字符
   • 添加相关 hashtag
4. **发布执行**：调用 Twitter API 发帖
5. **日志记录**：保存执行记录到 Google Sheets

**已配置功能**
✅ 失败重试机制（最多 3 次）
✅ 邮件通知（成功/失败）
✅ 内容质量检查（过滤低质内容）

**预计效果**
• 每天自动发布 3-5 条科技动态
• 节省 30 分钟人工操作时间
• 保持账号活跃度

工作流可视化流程图已在 Canvas 中展示！点击 "Edit in Combos" 调整配置。`
      }
    },
    {
      id: '403',
      role: 'user',
      type: 'text',
      content: '能不能加一个功能：如果某条新闻特别火爆（评论数>500），自动追加一条深度解读？'
    },
    {
      id: '404',
      role: 'assistant',
      type: 'text',
      content: `当然可以！我来为你添加这个智能追踪功能：

**新增步骤**
5.5. **热度监控**
   • 每小时检查已发布推文的互动数据
   • 判断条件：评论数 > 500 OR 转发数 > 1000
   • 触发深度分析流程

6. **深度解读生成**
   • 调用 GPT-4 生成 Thread（3-5 条连续推文）
   • 包含：背景介绍、影响分析、行业观点
   • 自动 @ 原推文形成 Thread

7. **质量控制**
   • 人工审核开关（可选）
   • 避免重复追踪同一话题

这样你的账号不仅有日常资讯，还能在热点事件时提供深度内容，大大提升影响力！

需要我帮你配置这个升级版工作流吗？`
    }
  ],

  // Chat 5: Competitor Analysis + Marketing Design
  '5': [
    {
      id: '501',
      role: 'user',
      type: 'text',
      content: '分析一下 Notion AI 的核心功能和定价策略',
      selectedApp: {
        name: 'Hunter',
        icon: APP_ICONS.hunter
      }
    },
    {
      id: '502',
      role: 'assistant',
      type: 'app-response',
      content: '',
      artifactId: 'artifact-501',
      appData: {
        appType: 'hunter',
        appName: 'Hunter',
        appIcon: APP_ICONS.hunter,
        status: 'completed',
        introText: '我将使用 Hunter 分析 Notion AI',
        followUpText: `Notion AI 竞品分析完成：

**核心功能**
• AI 写作助手（草稿生成、润色、翻译）
• 自动摘要（会议记录、文档总结）
• 表格数据处理（填充、分析）
• 模板智能推荐

**定价策略**
• Add-on 模式：$10/用户/月（需先订阅 Notion）
• 无免费额度（2023 年 11 月后）
• 企业版：需联系销售

**竞争优势**
✅ 深度整合 Notion 生态
✅ 多语言支持优秀
✅ 协作场景体验好

**劣势**
❌ 需要 Notion 订阅门槛
❌ AI 功能相对基础
❌ 价格偏高（对比独立 AI 工具）

建议：如果做竞品，可以主打"独立使用 + 更强 AI 能力"！`
      }
    },
    {
      id: '503',
      role: 'user',
      type: 'text',
      content: '基于这个分析，帮我设计一张对比海报，突出我们的优势'
    },
    {
      id: '504',
      role: 'assistant',
      type: 'text',
      content: '好的，我来设计一张竞品对比海报。请稍等...'
    }
  ]
};

// Knowledge Base Items - Updated to reflect multi-app workflows
export const MOCK_KB_ITEMS: KnowledgeItem[] = [
  { id: '1', title: 'AI_Agent_Market_Report_2025.pdf', type: 'pdf', date: 'Jan 2', size: '3.8 MB', tag: 'Research' },
  { id: '2', title: 'Product_Launch_Poster_v3.png', type: 'image', date: 'Jan 2', size: '5.2 MB', tag: 'Design' },
  { id: '3', title: 'SaaS_Dashboard_Component.tsx', type: 'doc', date: 'Jan 1', size: '24 KB', tag: 'Code' },
  { id: '4', title: 'Social_Media_Workflow.json', type: 'doc', date: 'Jan 1', size: '8 KB', tag: 'Automation' },
  { id: '5', title: 'Notion_Competitor_Analysis.pdf', type: 'pdf', date: 'Dec 28', size: '2.1 MB', tag: 'Research' },
  { id: '6', title: 'Landing_Page_Mockup.fig', type: 'image', date: 'Dec 27', size: '6.4 MB', tag: 'Design' },
];

// Agents - Updated to align with the 4 apps
export const MOCK_AGENTS: Agent[] = [
  { 
    id: '1', 
    name: 'Design Master', 
    description: 'Powered by Framia - Create stunning visuals', 
    icon: '🎨', 
    gradient: 'from-teal-400 via-emerald-500 to-cyan-500' 
  },
  { 
    id: '2', 
    name: 'Code Builder', 
    description: 'Powered by Enter - Build apps instantly', 
    icon: '💻', 
    gradient: 'from-violet-400 via-purple-500 to-indigo-500' 
  },
  { 
    id: '3', 
    name: 'Research Pro', 
    description: 'Powered by Hunter - Deep market insights', 
    icon: '🔍', 
    gradient: 'from-orange-400 via-amber-500 to-yellow-500' 
  },
  { 
    id: '4', 
    name: 'Workflow Wizard', 
    description: 'Powered by Combos - Automate everything', 
    icon: '⚙️', 
    gradient: 'from-blue-400 via-indigo-500 to-purple-500' 
  },
];

// ==================== Library Mock Data ====================

// Mock Library Artifacts - Auto-saved from Canvas
export const MOCK_LIBRARY_ARTIFACTS: LibraryArtifact[] = [
  {
    id: 'lib-art-1',
    type: 'image',
    title: '产品发布海报 - AI 赋能创作',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=400&auto=format&fit=crop',
    content: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop',
    appType: 'framia',
    appName: 'Framia',
    appIcon: APP_ICONS.framia,
    createdAt: Date.now() - 86400000, // 1 day ago
    sessionId: '1',
    sessionTitle: '产品发布全流程：调研+设计+开发',
    prompt: '设计一张产品发布海报，主题是"AI 赋能创作，解放生产力"，要科技感',
    usedCount: 3,
    isDeleted: false
  },
  {
    id: 'lib-art-2',
    type: 'code',
    title: 'SaaS Dashboard Component',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop',
    content: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    appType: 'enter',
    appName: 'Enter',
    appIcon: APP_ICONS.enter,
    createdAt: Date.now() - 172800000, // 2 days ago
    sessionId: '3',
    sessionTitle: 'SaaS 仪表板原型设计',
    prompt: '把这个设计转换成可运行的 React 代码',
    usedCount: 1,
    isDeleted: false
  },
  {
    id: 'lib-art-3',
    type: 'document',
    title: 'AI Agent 市场趋势报告 2025',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop',
    content: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    appType: 'hunter',
    appName: 'Hunter',
    appIcon: APP_ICONS.hunter,
    createdAt: Date.now() - 259200000, // 3 days ago
    sessionId: '2',
    sessionTitle: 'AI Agent 市场趋势报告',
    prompt: '帮我深度调研一下 2025 年 AI Agent 市场的发展趋势',
    usedCount: 5,
    isDeleted: false
  },
  {
    id: 'lib-art-4',
    type: 'workflow',
    title: '社交媒体自动化工作流',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop',
    content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    appType: 'combos',
    appName: 'Combos',
    appIcon: APP_ICONS.combos,
    createdAt: Date.now() - 345600000, // 4 days ago
    sessionId: '4',
    sessionTitle: '社交媒体自动化工作流',
    prompt: '创建一个自动化工作流：每天早上 9 点抓取科技新闻，总结成 Twitter 风格的短文',
    usedCount: 2,
    isDeleted: false
  },
  {
    id: 'lib-art-5',
    type: 'image',
    title: '产品落地页设计',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=400&auto=format&fit=crop',
    content: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop',
    appType: 'framia',
    appName: 'Framia',
    appIcon: APP_ICONS.framia,
    createdAt: Date.now() - 432000000, // 5 days ago
    sessionId: '1',
    sessionTitle: '产品发布全流程：调研+设计+开发',
    prompt: '快速搭建一个产品介绍的落地页',
    usedCount: 0,
    isDeleted: false
  }
];

// Mock Knowledge Collections
export const MOCK_KNOWLEDGE_COLLECTIONS: KnowledgeCollection[] = [
  {
    id: 'col-1',
    name: 'Brand Guidelines',
    description: '公司品牌视觉规范，包含 Logo、配色、字体等',
    icon: '📘',
    isGlobalContext: true,  // 已设为全局上下文
    itemCount: 3,
    createdAt: Date.now() - 2592000000, // 30 days ago
    updatedAt: Date.now() - 86400000
  },
  {
    id: 'col-2',
    name: 'API Documentation',
    description: '后端 API 接口文档与技术规范',
    icon: '📙',
    isGlobalContext: false,
    itemCount: 5,
    createdAt: Date.now() - 1728000000, // 20 days ago
    updatedAt: Date.now() - 172800000
  },
  {
    id: 'col-3',
    name: 'Product Requirements',
    description: '产品需求文档与功能说明',
    icon: '📗',
    isGlobalContext: false,
    itemCount: 2,
    createdAt: Date.now() - 864000000, // 10 days ago
    updatedAt: Date.now() - 259200000
  }
];

// Mock Knowledge Items - Extended with new fields
export const MOCK_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  // Brand Guidelines Collection
  {
    id: 'kb-1',
    collectionId: 'col-1',
    title: 'Logo_Usage_Guide.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: Date.now() - 2592000000,
    summary: 'Logo 使用规范，包含颜色、尺寸、留白要求。主色调：#4F46E5（靛蓝），辅助色：#10B981（翠绿）',
    usedInChats: ['1', '5'],
    isDeleted: false,
    tag: 'Brand'
  },
  {
    id: 'kb-2',
    collectionId: 'col-1',
    title: 'Color_Palette.pdf',
    type: 'pdf',
    size: '1.2 MB',
    uploadedAt: Date.now() - 2500000000,
    summary: '品牌配色方案，主色系、辅助色、灰度色板',
    usedInChats: ['1'],
    isDeleted: false,
    tag: 'Design'
  },
  {
    id: 'kb-3',
    collectionId: 'col-1',
    title: 'Brand_Voice_Context',
    type: 'context-card',
    size: '2 KB',
    uploadedAt: Date.now() - 2400000000,
    content: '品牌语调：专业、友好、创新。目标用户：25-40 岁产品经理和开发者。写作风格：简洁直接，避免行话。',
    usedInChats: ['1', '2', '4'],
    isDeleted: false,
    tag: 'Context'
  },
  
  // API Documentation Collection
  {
    id: 'kb-4',
    collectionId: 'col-2',
    title: 'API_Reference_v2.3.md',
    type: 'markdown',
    size: '156 KB',
    uploadedAt: Date.now() - 1728000000,
    summary: 'RESTful API 接口文档，包含认证、用户管理、数据查询等模块',
    usedInChats: ['3'],
    isDeleted: false,
    tag: 'Tech'
  },
  {
    id: 'kb-5',
    collectionId: 'col-2',
    title: 'Database_Schema.sql',
    type: 'code',
    size: '45 KB',
    uploadedAt: Date.now() - 1700000000,
    summary: 'PostgreSQL 数据库结构，包含用户表、订单表、产品表等',
    usedInChats: [],
    isDeleted: false,
    tag: 'Tech'
  },
  
  // Product Requirements Collection
  {
    id: 'kb-6',
    collectionId: 'col-3',
    title: 'Feature_Roadmap_Q1_2025.pdf',
    type: 'pdf',
    size: '3.1 MB',
    uploadedAt: Date.now() - 864000000,
    summary: 'Q1 产品路线图，重点功能：多 Agent 协作、Library 功能、实时协作编辑',
    usedInChats: ['2'],
    isDeleted: false,
    tag: 'Product'
  },
  
  // Standalone items (no collection)
  {
    id: 'kb-7',
    collectionId: undefined,
    title: 'Competitor_Analysis_Notion.pdf',
    type: 'pdf',
    size: '2.8 MB',
    uploadedAt: Date.now() - 432000000,
    summary: 'Notion AI 竞品分析：功能对比、定价策略、市场定位',
    usedInChats: ['5'],
    isDeleted: false,
    tag: 'Research'
  }
];

// Mock Agent Intel Stream Data
export const MOCK_AGENT_INTEL_DATA: CardData[] = [
  {
    id: 1,
    type: 'celebration',
    size: '2x2',
    title: '大客户签约: TCL',
    summary: 'ARR 增长 $50k。这是一个重要的里程碑，不仅是因为收入，更意味着我们在大B销售的突破。',
    meta: '刚刚 · 销售团队',
    details: '我们刚刚收到了 Acme Corp 的签约确认邮件。这笔交易历时 6 个月，由 Sarah 牵头。',
    tags: ['#Sales', '#Win', '#Milestone'],
    agent: {
      type: 'email-monitor',
      name: 'Inbox Assistant',
      displayName: 'Inbox Assistant',
      icon: 'Mail',
      color: 'bg-amber-100 text-amber-700',
      emoji: '📧',
    },
    category: 'business',
    sourcePlatform: 'gmail',
    timeAgo: '2h ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 2,
    type: 'technical',
    size: '1x1',
    title: 'GitHub 仓库更新',
    summary: '检测到新的 PR 合并，涉及核心功能优化',
    meta: '3小时前 · 开发团队',
    details: 'PR #123 已合并到主分支，包含性能优化和 bug 修复',
    tags: ['#GitHub', '#PR'],
    agent: {
      type: 'github-monitor',
      name: 'Dev Agent',
      displayName: 'Dev Agent',
      icon: 'Code',
      color: 'bg-blue-100 text-blue-700',
      emoji: '⚙️',
    },
    category: 'product',
    sourcePlatform: 'github',
    timeAgo: '3h ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 3,
    type: 'intelligence',
    size: '2x1',
    title: '竞品动态：新产品发布',
    summary: '主要竞争对手发布了新的 AI 功能，值得关注其市场反应',
    meta: '5小时前 · 市场团队',
    details: '竞争对手 X 公司今天发布了新的 AI 助手功能，在社交媒体上引起了广泛讨论',
    tags: ['#Competitor', '#Market'],
    agent: {
      type: 'social-monitor',
      name: 'Social Monitor',
      displayName: 'Social Monitor',
      icon: 'TrendingUp',
      color: 'bg-purple-100 text-purple-700',
      emoji: '📊',
    },
    category: 'competitor',
    sourcePlatform: 'twitter',
    timeAgo: '5h ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: 4,
    type: 'voice',
    size: '1x2',
    title: '客户反馈汇总',
    summary: '本周收集了 23 条客户反馈，主要集中在用户体验优化方面',
    meta: '1天前 · 产品团队',
    details: '通过多个渠道收集的客户反馈显示，用户最关心的是界面易用性和响应速度',
    tags: ['#Feedback', '#UX'],
    agent: {
      type: 'email-monitor',
      name: 'Support Agent',
      displayName: 'Support Agent',
      icon: 'MessageSquare',
      color: 'bg-amber-100 text-amber-700',
      emoji: '💬',
    },
    category: 'product',
    sourcePlatform: 'slack',
    timeAgo: '1d ago',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Mock Web Search Results
import { WebSearchResult } from '@/types/project';

export const MOCK_WEB_SEARCH_RESULTS: WebSearchResult[] = [
  {
    id: 'search-1',
    title: 'AI Agent Development Guide - Complete Tutorial',
    url: 'https://example.com/ai-agent-guide',
    snippet: 'Learn how to build AI agents from scratch. This comprehensive guide covers everything from basic concepts to advanced implementations.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-2',
    title: 'Best Practices for AI Agent Architecture',
    url: 'https://example.com/ai-architecture',
    snippet: 'Discover the best practices for designing scalable AI agent architectures. Includes patterns, anti-patterns, and real-world examples.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-3',
    title: 'LangChain vs AutoGPT: Which Framework to Choose?',
    url: 'https://example.com/langchain-autogpt',
    snippet: 'A detailed comparison of LangChain and AutoGPT frameworks for building AI agents. Pros, cons, and use cases for each.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-4',
    title: 'Multi-Agent Systems: Coordination and Communication',
    url: 'https://example.com/multi-agent-systems',
    snippet: 'Explore how multiple AI agents can work together to solve complex problems. Includes coordination strategies and communication protocols.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-5',
    title: 'AI Agent Security: Protecting Your Intelligent Systems',
    url: 'https://example.com/ai-security',
    snippet: 'Security considerations for AI agents. Learn about common vulnerabilities and how to protect your agent-based systems.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-6',
    title: 'Building Conversational AI Agents with Natural Language',
    url: 'https://example.com/conversational-ai',
    snippet: 'A practical guide to building conversational AI agents that can understand and respond to natural language inputs effectively.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-7',
    title: 'AI Agent Performance Optimization Techniques',
    url: 'https://example.com/ai-performance',
    snippet: 'Optimize your AI agents for better performance. Covers caching, parallel processing, and resource management strategies.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-8',
    title: 'Enterprise AI Agent Deployment Strategies',
    url: 'https://example.com/enterprise-deployment',
    snippet: 'Learn how to deploy AI agents in enterprise environments. Includes scalability, monitoring, and maintenance best practices.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-9',
    title: 'AI Agent Testing and Quality Assurance',
    url: 'https://example.com/ai-testing',
    snippet: 'Comprehensive guide to testing AI agents. Covers unit testing, integration testing, and performance benchmarking.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
  {
    id: 'search-10',
    title: 'The Future of AI Agents: Trends and Predictions',
    url: 'https://example.com/ai-future',
    snippet: 'Explore the future of AI agents and emerging trends. Includes predictions about autonomous agents and their impact on industries.',
    favicon: 'https://www.google.com/s2/favicons?domain=example.com',
  },
];

// Mock Recent Uploads - Simulates files uploaded in previous conversations
import { RecentUploadItem } from '@/lib/recent-uploads';

export const MOCK_RECENT_UPLOADS: RecentUploadItem[] = [
  {
    id: 'recent-1',
    name: 'Q3_Competitor_Analysis.pdf',
    type: 'application/pdf',
    size: '2.4 MB',
    uploadedAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: 'recent-2',
    name: 'Product_Roadmap_2025.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '1.8 MB',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: 'recent-3',
    name: 'Brand_Guidelines_v3.png',
    type: 'image/png',
    size: '4.2 MB',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=200&auto=format&fit=crop',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
  },
  {
    id: 'recent-4',
    name: 'User_Research_Notes.md',
    type: 'text/markdown',
    size: '156 KB',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: 'recent-5',
    name: 'Sales_Data_Q4.csv',
    type: 'text/csv',
    size: '890 KB',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
  },
];
