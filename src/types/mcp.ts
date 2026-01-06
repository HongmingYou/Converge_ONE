/**
 * MCP (Model Context Protocol) App Definition
 * 支持动态注册和扩展的应用定义接口
 */

export type AppProvider = 'native' | 'mcp' | 'custom';

export type AppOutputType = 'image' | 'code' | 'document' | 'data' | 'action';

export type AppInputType = 'text' | 'image' | 'file' | 'context';

export interface MCPApp {
  // 基础信息
  id: string;
  name: string;
  icon: string;
  description: string;
  provider: AppProvider;
  
  // 能力声明
  capabilities: {
    primary: string[];    // ['design', 'graphics']
    secondary: string[];  // ['ui', 'mockup']
  };
  
  // 触发条件
  triggers: {
    keywords: string[];
    patterns: RegExp[];
    contextTypes?: string[];  // 需要什么类型的上下文
  };
  
  // 输入输出
  input: {
    accepts: AppInputType[];
    maxSize?: number;
  };
  output: {
    type: AppOutputType;
    formats: string[];
  };
  
  // MCP 配置
  mcpEndpoint?: string;
  mcpVersion?: string;
  
  // 元数据
  metadata?: {
    category?: string;  // 'design', 'development', 'research', 'automation'
    tags?: string[];
    author?: string;
    version?: string;
  };
}

