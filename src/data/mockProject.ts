import { ProjectData, AgentAssetData, RecentArtifact } from '@/types/project';

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
        icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
        emoji: '🔍',
      },
      {
        type: 'framia',
        name: 'Framia',
        displayName: 'Framia',
        icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
        emoji: '🎨',
      },
    ],
    lastModifiedBy: { type: 'agent', name: 'Hunter' },
    lastActivity: 'Created new deck',
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
        icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
        emoji: '🔍',
      },
    ],
    lastModifiedBy: { type: 'user', name: 'You' },
    lastActivity: 'Analysis completed',
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
        icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
        emoji: '💻',
      },
    ],
    lastModifiedBy: { type: 'agent', name: 'Enter' },
    lastActivity: 'Code refactored',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
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
      icon: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
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

