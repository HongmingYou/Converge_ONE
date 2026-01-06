import { AgentType, AgentAppType } from '@/types/project';

// Agent 默认头像（emoji）
export const getAgentAvatar = (agentType: AgentType): string => {
  // 根据 Agent 类型返回默认头像
  switch (agentType) {
    case 'github-monitor':
      return 'GM'; // GitHub Monitor
    case 'social-monitor':
      return 'SM'; // Social Monitor
    case 'email-monitor':
      return 'EM'; // Email Monitor
    case 'human-post':
      return 'H'; // Human Post
    default:
      return 'A';
  }
};

// Agent color mapping for pill backgrounds
export const getAgentColor = (agentType: AgentType): string => {
  switch (agentType) {
    case 'github-monitor':
      return 'bg-blue-100 text-blue-700'; // 蓝色 - 技术/代码相关
    case 'social-monitor':
      return 'bg-purple-100 text-purple-700'; // 紫色 - 社媒/社区相关
    case 'email-monitor':
      return 'bg-amber-100 text-amber-700'; // 琥珀色 - 邮件/支持相关
    case 'human-post':
      return 'bg-stone-100 text-stone-700'; // 灰色 - 人工发布
    default:
      return 'bg-stone-100 text-stone-700';
  }
};

// Agent App 默认头像（emoji）
export const getAgentAppAvatar = (agentAppType: AgentAppType): string => {
  switch (agentAppType) {
    case 'framia':
      return '🎨'; // Framia - 设计
    case 'enter':
      return '💻'; // Enter - 代码
    case 'hunter':
      return '🔍'; // Hunter - 研究
    case 'combos':
      return '⚙️'; // Combos - 工作流
    default:
      return '🤖';
  }
};

// Agent App color mapping
export const getAgentAppColor = (agentAppType: AgentAppType): string => {
  switch (agentAppType) {
    case 'framia':
      return 'bg-teal-100 text-teal-700'; // 青色 - 设计相关
    case 'enter':
      return 'bg-violet-100 text-violet-700'; // 紫色 - 代码相关
    case 'hunter':
      return 'bg-orange-100 text-orange-700'; // 橙色 - 研究相关
    case 'combos':
      return 'bg-blue-100 text-blue-700'; // 蓝色 - 工作流相关
    default:
      return 'bg-stone-100 text-stone-700';
  }
};

// Agent App 动作标签映射
export const getAgentAppActionLabel = (agentAppType: AgentAppType, assetType: string): string => {
  const actionMap: Record<AgentAppType, Record<string, string>> = {
    framia: {
      image: 'Generated Image',
      document: 'Created Design',
      default: 'Designed',
    },
    enter: {
      code: 'Drafted Code',
      document: 'Built Application',
      default: 'Developed',
    },
    hunter: {
      data: 'Analyzed Data',
      document: 'Generated Report',
      default: 'Researched',
    },
    combos: {
      workflow: 'Created Workflow',
      document: 'Automated Process',
      default: 'Automated',
    },
  };
  
  return actionMap[agentAppType]?.[assetType] || actionMap[agentAppType]?.default || 'Created';
};

