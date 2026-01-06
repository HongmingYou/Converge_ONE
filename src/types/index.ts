export type ViewMode = 'chat' | 'projects' | 'settings';

// Chat mode for Main Stage
export type ChatMode = 'default' | 'library' | 'project';

// AI Model types
export type AIModel = 'claude-4.5' | 'gemini-3-pro' | 'gpt-5';

// Project Context for Project Chat Mode
export interface ProjectContext {
  projectId: string;
  projectName: string;
  systemPrompt?: string;
  knowledgeIds?: string[];
  attachedFileIds?: string[];
}

// Generic status for all apps
export type ArtifactStatus = 'idle' | 'thinking' | 'generating' | 'building' | 'completed';

// App types
export type AppType = 'framia' | 'enter' | 'hunter' | 'combos';

// Library item types
export type LibraryItemType = 'image' | 'code' | 'document' | 'workflow';

// Library views
export type LibraryView = 'all' | 'artifacts' | 'knowledge' | 'trash';
export type DisplayMode = 'grid' | 'list';

// Context Data for Agent collaboration
export interface ArtifactContextData {
  summary: string;  // Human-readable summary
  structuredData: Record<string, any>;  // Machine-readable structured data (JSON)
  tags: string[];  // Keywords for quick matching
  sourceArtifactId: string;  // Source Artifact ID
  sourceName: string;  // Source app name (e.g., "Hunter", "Framia")
  dataSize?: string;  // Optional: display size (e.g., "2KB")
}

// Single artifact in Canvas
export interface Artifact {
  id: string;
  appType: AppType;
  appName: string;
  appIcon: string;
  status: ArtifactStatus;
  title: string;
  output?: string;  // Single output (for backward compatibility)
  outputs?: string[];  // Multiple outputs (for Framia multi-image support)
  createdAt: number;
  messageId: string;
  editUrl?: string;
  contextData?: ArtifactContextData;  // Context data for agent collaboration
}

// Library Artifact - Auto-saved from Canvas
export interface LibraryArtifact {
  id: string;
  type: LibraryItemType;
  title: string;
  thumbnail?: string;
  content: string;  // URL or code content
  appType: AppType;
  appName: string;
  appIcon: string;
  createdAt: number;
  sessionId: string;  // 来源对话 ID
  sessionTitle?: string;  // 对话标题
  prompt: string;  // 原始 prompt
  usedCount: number;  // 被引用次数
  isDeleted: boolean;  // 软删除标记
}

// Mentioned Asset - For @mentioning artifacts in chat
export interface MentionedAsset {
  id: string;
  type: 'artifact' | 'artifact-output';  // 整个artifact或单个产物
  artifactId: string;
  outputIndex?: number;  // Framia多图时的索引
  title: string;
  thumbnail: string;
  appIcon: string;
  appName: string;
}

// Knowledge Collection
export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isGlobalContext: boolean;  // 是否设为全局上下文
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

// Knowledge Item - Updated definition
export interface KnowledgeItem {
  id: string;
  collectionId?: string;  // 所属 Collection
  title: string;
  type: 'pdf' | 'doc' | 'txt' | 'markdown' | 'code' | 'csv' | 'url' | 'context-card';
  size: string;
  uploadedAt: number;
  summary?: string;  // AI 生成的摘要
  content?: string;  // For context cards
  usedInChats: string[];  // 被引用的对话 ID
  isDeleted: boolean;
  // Future: embedding for RAG
  tag?: string;  // Kept for backward compatibility
  date?: string;  // Kept for backward compatibility
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'file' | 'app-response';
  agentName?: string;
  metadata?: Record<string, unknown>;
  artifactId?: string;
  appData?: {
    appType: AppType;
    appName: string;
    appIcon: string;
    status: ArtifactStatus;
    introText?: string;
    followUpText?: string;
  };
  selectedApp?: {
    name: string;
    icon: string;
  };
  libraryRefs?: string[];  // 引用的 Library 文件 IDs
  contextSnapshot?: ArtifactContextData[];  // Available context at message send time
  selectedModel?: AIModel;  // Selected AI model for this message
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

