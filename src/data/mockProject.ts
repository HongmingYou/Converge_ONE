import { ProjectData, AgentAssetData, RecentArtifact, ProjectSource, ProjectFile, ProjectConversation } from '@/types/project';
import { APP_ICONS } from '@/lib/app-icons';

export const MOCK_PROJECTS: ProjectData[] = [
  {
    id: 'proj-001',
    name: 'Q3 Competitor Analysis',
    type: 'deck',
    sourcesCount: 8,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'published',
    description: 'Comprehensive analysis of top 3 competitors in Q3 2024',
    collaboratingAgents: [
      {
        type: 'hunter',
        name: 'Hunter',
        displayName: 'Hunter',
        icon: APP_ICONS.Hunter,
        emoji: '🔍',
      },
      {
        type: 'framia',
        name: 'Framia',
        displayName: 'Framia',
        icon: APP_ICONS.Framia,
        emoji: '🎨',
      },
    ],
    lastModifiedBy: { type: 'agent', name: 'Hunter' },
    lastActivity: 'Created new deck',
    // 统一的数据模型
    sources: [
      {
        id: 'source-001',
        type: 'file',
        name: 'Q3 2024 Financial Report.pdf',
        content: 'Q3 2024 Financial Report\n\nRevenue: $45M\nGrowth: 45% YoY\nKey Highlights:\n- Cloud services revenue increased 45%\n- Mobile advertising recovered with 12% growth\n- Asia-Pacific region contributed 30% of new profits',
        metadata: {
          size: '2.4 MB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 2,
          indexed: true,
          mimeType: 'application/pdf',
        },
        attachedFileId: 'file-001',
      },
      {
        id: 'source-002',
        type: 'file',
        name: 'Project Titan Architecture',
        content: 'Project Titan Architecture\n\nMicroservices Architecture:\n- Service granularity needs optimization\n- Inter-service latency increasing\n- Recommendation: Service consolidation in Q4',
        metadata: {
          size: '856 KB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 5,
          indexed: true,
          mimeType: 'text/plain',
        },
        attachedFileId: 'file-002',
      },
      {
        id: 'source-003',
        type: 'file',
        name: 'Competitor Analysis.txt',
        content: 'Competitor Analysis\n\nMain competitors:\n- Company A: Strong in enterprise market\n- Company B: Leading in consumer segment\n- Company C: Emerging player with innovative features',
        metadata: {
          size: '124 KB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 24,
          indexed: false,
          mimeType: 'text/plain',
        },
        attachedFileId: 'file-003',
      },
      {
        id: 'source-004',
        type: 'file',
        name: 'Meeting_Oct12.mp3',
        content: 'Audio transcript: CEO discussion about AI strategy. "AI is not just a feature, it is the foundation."',
        metadata: {
          size: '12.5 MB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          indexed: true,
          mimeType: 'audio/mpeg',
        },
        attachedFileId: 'file-004',
      },
    ],
    files: [
      // Agent 生成的文件 (asset)
      {
        id: 'file-101',
        type: 'note',
        title: 'Q3 核心增长摘要',
        content: '云服务增长 45%，移动广告回暖。亚太地区表现强劲，成为新的利润增长引擎。',
        sourceId: 'source-001',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 2,
          updatedAt: Date.now() - 1000 * 60 * 60 * 2,
          tags: ['Finance', 'Q3'],
          wordCount: 28,
        },
      },
      {
        id: 'file-102',
        type: 'infographic',
        title: '竞争对手分析图',
        content: 'Infographic content placeholder',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24,
          tags: ['InfoGraphic'],
          wordCount: 0,
        },
      },
      {
        id: 'file-103',
        type: 'audio-clip',
        title: 'CEO 关于 AI 战略的发言',
        content: 'Audio clip extracted from 00:14:20. "AI is not just a feature, it is the foundation."',
        sourceId: 'source-004',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          tags: ['Strategy'],
          wordCount: 15,
        },
      },
      // 用户创建的文件
      {
        id: 'file-104',
        type: 'note',
        title: '我的研究笔记',
        content: '这是用户手动创建的笔记，记录一些个人想法和观察。',
        createdBy: 'user',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
          tags: ['Personal'],
          wordCount: 20,
        },
      },
      {
        id: 'folder-001',
        type: 'folder',
        title: 'Research Notes',
        content: '',
        createdBy: 'user',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
          tags: [],
          isExpanded: true,
        },
      },
    ],
    conversations: [
      {
        id: 'conv-001',
        messages: [
          {
            id: 'msg-001',
            role: 'user',
            content: '基于 Q3 财报，帮我总结一下主要增长点。',
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: 'msg-002',
            role: 'assistant',
            content: '根据 Q3 财报，主要增长点如下：\n\n**云服务收入同比增长 45%**\n主要得益于新企业客户的签约。这表明我们在企业级市场的渗透率正在稳步提升。\n\n**移动端广告业务回暖**\n环比增长 12%，这是一个非常积极的信号，尤其是在上半年广告市场整体疲软的背景下。\n\n**海外市场拓展顺利**\n亚太地区贡献了新增利润的 30%，证明了全球化战略的有效性。',
            timestamp: new Date(Date.now() - 3500000),
            citations: ['source-001', 'source-002'],
          },
        ],
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3500000,
      },
      {
        id: 'conv-001b',
        messages: [
          {
            id: 'msg-001b-001',
            role: 'user',
            content: '把这份对手分析做成一个 1 页的 executive summary，给 CEO 看。',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          },
          {
            id: 'msg-001b-002',
            role: 'assistant',
            content:
              '当然。下面是一页版的 Executive Summary（适合 CEO 速读）：\n\n**市场格局**\n- 竞争对手 A：企业市场强势，销售周期长但客单价高。\n- 竞争对手 B：消费端领先，品牌与渠道优势明显。\n- 竞争对手 C：新兴玩家，功能创新快但交付与稳定性待验证。\n\n**我们在 Q3 的关键优势**\n- 云服务收入同比增长 45%，企业侧扩张正在起势。\n- 亚太贡献新增利润 30%，国际化验证有效。\n\n**Q4 建议（3 条）**\n1) 企业侧：用“行业解决方案 + 成功案例”缩短决策链。\n2) 产品侧：优先补齐稳定性/集成能力，压制 C 的差异化。\n3) 增长侧：在亚太复制标杆打法，强化渠道伙伴。\n',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.8),
            citations: ['source-001', 'source-003'],
          },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        updatedAt: Date.now() - 1000 * 60 * 60 * 5.8,
      },
      {
        id: 'conv-001c',
        messages: [
          {
            id: 'msg-001c-001',
            role: 'user',
            content: '我想基于 Q3 财报做一张信息图，重点突出 45% 和 30% 这两个数字，给我文案+结构。',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
          },
          {
            id: 'msg-001c-002',
            role: 'assistant',
            content:
              '给你一个可直接交付设计的结构：\n\n**标题**：Q3 增长亮点一图读懂\n\n**主视觉（大数字）**\n- 45% YoY：云服务收入增长\n- 30%：亚太贡献新增利润\n\n**三条支撑信息（小卡片）**\n1) 企业客户签约带动收入结构优化\n2) 移动广告回暖（+12%）形成第二增长曲线\n3) 海外扩张验证：亚太成为利润引擎\n\n**页脚**：数据来源：Q3 2024 财报 + 内部项目资料',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 19.7),
            citations: ['source-001'],
          },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
        updatedAt: Date.now() - 1000 * 60 * 60 * 19.7,
      },
    ],
  },
  {
    id: 'proj-002',
    name: 'Pricing Strategy Review',
    type: 'deck',
    sourcesCount: 5,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'draft',
    description: 'Strategic pricing recommendations based on market research',
    collaboratingAgents: [
      {
        type: 'hunter',
        name: 'Hunter',
        displayName: 'Hunter',
        icon: APP_ICONS.Hunter,
        emoji: '🔍',
      },
    ],
    lastModifiedBy: { type: 'user', name: 'You' },
    lastActivity: 'Analysis completed',
    sources: [
      {
        id: 'source-201',
        type: 'file',
        name: 'Market Research Data.csv',
        content: 'Market Research Data\n\nCompetitor Pricing:\n- Company A: $49/month\n- Company B: $79/month\n- Company C: $99/month\n\nMarket Trends:\n- Price sensitivity increasing\n- Value-based pricing preferred',
        metadata: {
          size: '1.2 MB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 24,
          indexed: true,
          mimeType: 'text/csv',
        },
      },
      {
        id: 'source-202',
        type: 'file',
        name: 'Customer Feedback Survey.pdf',
        content: 'Customer Feedback Survey Results\n\nKey Findings:\n- 65% willing to pay premium for better features\n- Price is secondary to value\n- Monthly subscription preferred over annual',
        metadata: {
          size: '856 KB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 20,
          indexed: true,
          mimeType: 'application/pdf',
        },
      },
    ],
    files: [
      // Agent 生成的文件
      {
        id: 'file-201',
        type: 'note',
        title: '定价策略建议',
        content: '基于市场调研和客户反馈，建议采用分层定价策略：\n- 基础版：$49/月\n- 专业版：$79/月\n- 企业版：$149/月',
        sourceId: 'source-201',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24,
          tags: ['Pricing', 'Strategy'],
          wordCount: 45,
        },
      },
      // 用户创建的文件
      {
        id: 'file-202',
        type: 'note',
        title: '定价讨论记录',
        content: '与产品团队讨论后的一些想法...',
        createdBy: 'user',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 20,
          updatedAt: Date.now() - 1000 * 60 * 60 * 20,
          tags: ['Meeting'],
          wordCount: 10,
        },
      },
    ],
    conversations: [
      {
        id: 'conv-002',
        messages: [
          {
            id: 'msg-201',
            role: 'user',
            content: '帮我分析一下市场定价策略',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            id: 'msg-202',
            role: 'assistant',
            content: '根据市场调研数据，我建议采用分层定价策略。主要竞争对手的价格区间在 $49-$99/月，我们可以在这个范围内提供更具竞争力的方案。',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
            citations: ['source-201', 'source-202'],
          },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
        updatedAt: Date.now() - 1000 * 60 * 60 * 23,
      },
      {
        id: 'conv-002b',
        messages: [
          {
            id: 'msg-002b-001',
            role: 'user',
            content: '给我一个定价实验（A/B）方案：怎么验证 $79 档是否合理？',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          },
          {
            id: 'msg-002b-002',
            role: 'assistant',
            content:
              '可以用分层实验验证 $79 档：\n\n**实验设计**\n- 人群：新注册 & 近 30 天活跃\n- 方案 A：$79/月（现有）\n- 方案 B：$69/月（降价）或 $89/月（提价）\n\n**核心指标**\n- 转化率（试用→付费）\n- ARPU / 付费用户留存（D30）\n- 退款率/客服工单\n\n**注意点**\n- 同步控制权益差异，避免混淆变量\n- 至少跑满 2 周，覆盖工作日/周末行为差异',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11.7),
            citations: ['source-201', 'source-202'],
          },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 12,
        updatedAt: Date.now() - 1000 * 60 * 60 * 11.7,
      },
    ],
  },
  {
    id: 'proj-003',
    name: 'Technical Architecture Notes',
    type: 'note',
    sourcesCount: 12,
    lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: 'draft',
    description: 'System architecture decisions and trade-offs',
    collaboratingAgents: [
      {
        type: 'enter',
        name: 'Enter',
        displayName: 'Enter',
        icon: APP_ICONS.Enter,
        emoji: '💻',
      },
    ],
    lastModifiedBy: { type: 'agent', name: 'Enter' },
    lastActivity: 'Code refactored',
    sources: [
      {
        id: 'source-301',
        type: 'file',
        name: 'Architecture Design Doc.md',
        content: '# Architecture Design\n\n## System Overview\n- Microservices architecture\n- API Gateway pattern\n- Event-driven communication\n\n## Key Decisions\n- Use PostgreSQL for primary data\n- Redis for caching\n- Kafka for event streaming',
        metadata: {
          size: '45 KB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          indexed: true,
          mimeType: 'text/markdown',
        },
      },
      {
        id: 'source-302',
        type: 'file',
        name: 'Database Schema.sql',
        content: '-- Database Schema\n\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) UNIQUE,\n  created_at TIMESTAMP\n);\n\nCREATE TABLE projects (\n  id UUID PRIMARY KEY,\n  user_id UUID REFERENCES users(id),\n  name VARCHAR(255),\n  created_at TIMESTAMP\n);',
        metadata: {
          size: '12 KB',
          uploadedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          indexed: false,
          mimeType: 'text/sql',
        },
      },
    ],
    files: [
      // Agent 生成的文件
      {
        id: 'file-301',
        type: 'note',
        title: '架构设计要点',
        content: '系统采用微服务架构，使用 API Gateway 模式。主要技术栈：\n- PostgreSQL 作为主数据库\n- Redis 用于缓存\n- Kafka 用于事件流',
        sourceId: 'source-301',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          tags: ['Architecture', 'Tech'],
          wordCount: 38,
        },
      },
      {
        id: 'file-302',
        type: 'document',
        title: 'Dashboard Component',
        content: 'export function Dashboard() {\n  return (\n    <div className="grid grid-cols-3 gap-4">\n      <KPICard title="Users" value={1234} />\n      <KPICard title="Revenue" value="$45K" />\n    </div>\n  );\n}',
        createdBy: 'agent',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          updatedAt: Date.now() - 1000 * 60 * 60 * 4,
          tags: ['Code', 'React'],
          wordCount: 15,
        },
      },
      // 用户创建的文件
      {
        id: 'file-303',
        type: 'note',
        title: '技术选型思考',
        content: '关于技术栈的一些个人思考和笔记...',
        createdBy: 'user',
        metadata: {
          createdAt: Date.now() - 1000 * 60 * 60 * 24,
          updatedAt: Date.now() - 1000 * 60 * 60 * 24,
          tags: ['Tech'],
          wordCount: 12,
        },
      },
    ],
    conversations: [
      {
        id: 'conv-003',
        messages: [
          {
            id: 'msg-301',
            role: 'user',
            content: '帮我设计系统架构',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          },
          {
            id: 'msg-302',
            role: 'assistant',
            content: '我建议采用微服务架构，使用 API Gateway 模式。这样可以提高系统的可扩展性和可维护性。',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5),
            citations: ['source-301'],
          },
        ],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5,
      },
    ],
  },
];

// Mock Agent Assets Data
export const MOCK_AGENT_ASSETS: AgentAssetData[] = [
  {
    id: 'asset-001',
    type: 'image',
    title: 'Product Launch Poster',
    preview: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=400&auto=format&fit=crop',
    agent: {
      type: 'framia',
      name: 'Framia',
      displayName: 'Framia',
      icon: APP_ICONS.Framia,
      emoji: '🎨',
    },
    actionLabel: 'Generated Image',
    conversationId: 'chat-001',
    messageId: 'msg-104',
    sourceContext: 'Re: Q3 Competitor Analysis',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isPinned: false,
    prompt: '设计一张产品发布海报，主题是"AI 赋能创作，解放生产力"，要科技感',
  },
  {
    id: 'asset-002',
    type: 'code',
    title: 'SaaS Dashboard Component',
    preview: {
      language: 'typescript',
      snippet: `export function Dashboard() {\n  return (\n    <div className="grid grid-cols-3 gap-4">\n      <KPICard title="Users" value={1234} />\n      <KPICard title="Revenue" value="$45K" />\n    </div>\n  );\n}`,
    },
    agent: {
      type: 'enter',
      name: 'Enter',
      displayName: 'Enter',
      icon: APP_ICONS.Enter,
      emoji: '💻',
    },
    actionLabel: 'Drafted Code',
    conversationId: 'chat-003',
    messageId: 'msg-304',
    sourceContext: 'Re: SaaS 仪表板原型设计',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isPinned: true,
    prompt: '把这个设计转换成可运行的 React 代码',
  },
  {
    id: 'asset-003',
    type: 'document',
    title: 'AI Agent Market Report 2025',
    preview: {
      title: 'AI Agent Market Report 2025',
      previewLines: [
        'Market Size: $450B by 2025',
        'Key Trends: Multi-modal capabilities, Self-learning',
        'Investment Hotspots: Development platforms, Security tools',
      ],
    },
    agent: {
      type: 'hunter',
      name: 'Hunter',
      displayName: 'Hunter',
      icon: APP_ICONS.Hunter,
      emoji: '🔍',
    },
    actionLabel: 'Generated Report',
    conversationId: 'chat-002',
    messageId: 'msg-202',
    sourceContext: 'Re: AI Agent 市场趋势报告',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    isPinned: false,
    prompt: '帮我深度调研一下 2025 年 AI Agent 市场的发展趋势',
  },
  {
    id: 'asset-004',
    type: 'data',
    title: 'Competitor Pricing Analysis',
    preview: {
      keyMetrics: {
        'Jasper AI': '$39-$99/mo',
        'Copy.ai': '$49+/mo',
        'Writesonic': '$19-$99/mo',
      },
    },
    agent: {
      type: 'hunter',
      name: 'Hunter',
      displayName: 'Hunter',
      icon: APP_ICONS.Hunter,
      emoji: '🔍',
    },
    actionLabel: 'Analyzed Data',
    conversationId: 'chat-001',
    messageId: 'msg-102',
    sourceContext: 'Re: 产品发布全流程：调研+设计+开发',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    isPinned: false,
    prompt: '调研一下市场上类似产品的定价和功能',
  },
  {
    id: 'asset-005',
    type: 'workflow',
    title: 'Social Media Automation Workflow',
    preview: {},
    agent: {
      type: 'combos',
      name: 'Combos',
      displayName: 'Combos',
        icon: APP_ICONS.Combos,
      emoji: '⚙️',
    },
    actionLabel: 'Created Workflow',
    conversationId: 'chat-004',
    messageId: 'msg-402',
    sourceContext: 'Re: 社交媒体自动化工作流',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    isPinned: false,
    prompt: '创建一个自动化工作流：每天早上 9 点抓取科技新闻，总结成 Twitter 风格的短文',
  },
  {
    id: 'asset-006',
    type: 'image',
    title: 'Landing Page Design',
    preview: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=400&auto=format&fit=crop',
    agent: {
      type: 'framia',
      name: 'Framia',
      displayName: 'Framia',
      icon: APP_ICONS.Framia,
      emoji: '🎨',
    },
    actionLabel: 'Created Design',
    conversationId: 'chat-001',
    messageId: 'msg-106',
    sourceContext: 'Re: 产品发布全流程：调研+设计+开发',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    isPinned: false,
    prompt: '快速搭建一个产品介绍的落地页',
  },
];

// Mock Recent Artifacts Data
export const MOCK_RECENT_ARTIFACTS: RecentArtifact[] = [
  {
    id: 'artifact-001',
    title: 'Q3 Market Analysis Report',
    fileType: 'doc',
    projectId: 'proj-001',
    projectName: 'Q3 Competitor Analysis',
    lastModifiedTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isEmpty: false,
  },
  {
    id: 'artifact-002',
    title: 'Product Launch Poster',
    fileType: 'image',
    projectId: 'proj-001',
    projectName: 'Q3 Competitor Analysis',
    lastModifiedTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isEmpty: false,
  },
  {
    id: 'artifact-003',
    title: 'Dashboard Component',
    fileType: 'code',
    projectId: 'proj-003',
    projectName: 'Technical Architecture Notes',
    lastModifiedTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    isEmpty: false,
  },
];

