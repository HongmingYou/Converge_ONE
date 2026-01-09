/**
 * Project 相关类型定义
 */

export interface Workspace {
  id: string;
  name: string;
  type: 'one' | 'knowledge';  // ONE's Project / Knowledge Base
  icon?: string;
  description?: string;
  artifactCount: number;
  sourceCount: number;
  createdAt: number;
  updatedAt: number;
  template?: 'research' | 'project' | 'learning';
}

export interface WorkspaceSource {
  id: string;
  workspaceId: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'url' | 'image';
  size: string;
  uploadedAt: number;
  content?: string; // For text-based sources
  url?: string; // For URL sources
  indexed: boolean; // Whether it's been indexed for RAG
}

export interface WorkspaceNote {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceOutput {
  id: string;
  workspaceId: string;
  type: 'slides' | 'summary' | 'report';
  title: string;
  content: string; // URL or content
  createdAt: number;
}

export interface WorkspaceChatMessage {
  id: string;
  workspaceId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[]; // Source IDs referenced
  createdAt: number;
}

// Project Hub Types (from workspace-extracted)
// Agent 类型 - 支持新旧两套体系
export type AgentType = 'github-monitor' | 'social-monitor' | 'email-monitor' | 'human-post';
// 新的 Agent App 类型 (与 Chat 流程一致)
export type AgentAppType = 'framia' | 'enter' | 'hunter' | 'combos';

// 业务分类
export type CategoryType = 'all' | 'business' | 'product' | 'competitor';

// 数据来源平台
export type SourcePlatform = 'gmail' | 'github' | 'linear' | 'figma' | 'slack' | 'twitter' | 'jira' | 'notion';

export interface AgentInfo {
  type: AgentType;
  name: string; // Agent 名称，如 "GitHub Monitor" 或人名
  displayName?: string; // 新的显示名称，如 "Sales Agent", "Dev Sentinel"
  icon: string; // Icon name for lucide-react
  color: string; // Tailwind color class for pill background
  authorName?: string; // 如果是人工发布，显示发布者名字
  avatar?: string; // 头像 URL 或 emoji
  avatarFallback?: string; // 头像 fallback 文字（用于显示首字母）
  emoji?: string; // Optional emoji for visual identity
}

// Agent App Info (用于新的资产流)
export interface AgentAppInfo {
  type: AgentAppType;
  name: string; // Agent 名称，如 "Framia", "Hunter"
  displayName?: string;
  icon: string; // Icon URL
  emoji?: string;
  color?: string; // Tailwind color class
}

export interface Mention {
  userId: string;
  userName: string;
  position?: { start: number; end: number }; // For highlighting in text
}

export type ReactionType = '👍' | '❤️' | '😂' | '🎉' | '🔥' | '💡' | '👏' | '🚀';

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  reactions?: Reaction[];
}

export interface CardData {
  id: number;
  type: 'celebration' | 'technical' | 'voice' | 'intelligence';
  size: '1x1' | '2x1' | '1x2' | '2x2';
  title: string;
  summary: string;
  meta: string;
  details: string;
  tags: string[];
  // Agent information
  agent: AgentInfo;
  // Business category for filtering
  category: CategoryType;
  // Source platform for filtering
  sourcePlatform: SourcePlatform;
  // Number of raw data points this card was generated from
  sourceCount?: number;
  // Mentions - users mentioned in this card
  mentions?: Mention[];
  // Time information
  timeAgo: string; // e.g., "2h ago"
  timestamp?: Date;
  // Interaction data
  likes?: number;
  comments?: number;
  reactions?: Reaction[]; // All reactions on this card
  commentsList?: Comment[]; // All comments on this card
  // Related documents
  relatedDocs?: Array<{ id: string; name: string; type: string }>;
}

// Asset Types
export type AssetType = 'document' | 'image' | 'code' | 'data' | 'workflow';

// Asset Preview (用于不同类型资产的预览数据)
export interface AssetPreview {
  type: AssetType;
  // For document: { title: string, previewLines: string[] }
  // For image: { thumbnail: string }
  // For code: { language: string, snippet: string }
  // For data: { chartType: string, keyMetrics: Record<string, any> }
  [key: string]: any;
}

// Agent Asset Data (新的资产流数据结构)
export interface AgentAssetData {
  id: string;
  type: AssetType;
  title: string;
  preview: string | AssetPreview; // URL string or structured preview object
  agent: AgentAppInfo;
  actionLabel: string; // "Generated Image", "Drafted Code", "Analyzed Data"
  conversationId: string; // 来源对话 ID
  messageId: string; // 来源消息 ID
  sourceContext: string; // 简短上下文，如 "Re: Q3 Competitor..."
  createdAt: Date;
  isPinned: boolean;
  prompt?: string; // 原始 prompt，用于 Remix
}

// Project Types
export type ProjectType = 'note' | 'deck' | 'mindmap';
export type ProjectStatus = 'draft' | 'published';

// Recent Artifact Types
export type ArtifactFileType = 'note' | 'doc' | 'image' | 'slide' | 'code';

export interface RecentArtifact {
  id: string;
  title: string;
  fileType: ArtifactFileType;
  projectId: string;
  projectName: string;
  lastModifiedTime: Date;
  isEmpty: boolean;
}

// Attached file types
export type AttachedFileSource = 'library' | 'url' | 'local' | 'search';

export interface AttachedFile {
  id: string;
  source: AttachedFileSource;
  name: string;
  // For library files
  libraryId?: string;
  // For URL files
  url?: string;
  // For local files
  file?: File;
  size?: string;
  type?: string;
  // For web search results
  searchResultId?: string;
  description?: string; // For URL and search results
}

export interface WebSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
}

// Project Source - 统一的数据源（文件/URL/搜索/Library）
export interface ProjectSource {
  id: string;
  type: 'file' | 'url' | 'library' | 'search';
  name: string;
  content?: string; // 文件内容（文本）或URL
  metadata: {
    size?: string;
    uploadedAt: number;
    indexed: boolean; // 是否已索引用于RAG
    mimeType?: string; // MIME类型
    thumbnail?: string; // 预览图（用于图片/PDF）
  };
  // 关联的AttachedFile（如果是从attachedFiles创建的）
  attachedFileId?: string;
}

// Project File - 项目内的文件（note/document/artifact）
export interface ProjectFile {
  id: string;
  type: 'note' | 'document' | 'infographic' | 'ppt' | 'mindmap' | 'audio-clip' | 'folder';
  title: string;
  content: string; // 实际内容
  parentId?: string; // 文件夹结构
  sourceId?: string; // 关联的source ID（如果是从source创建的）
  createdBy: 'user' | 'agent'; // 区分用户创建还是Agent生成
  metadata: {
    createdAt: number;
    updatedAt: number;
    tags: string[];
    wordCount?: number;
    isExpanded?: boolean; // 用于文件夹
    isLoading?: boolean; // 用于生成中的文件
  };
}

// Project Conversation - 项目内的对话记录
export interface ProjectConversation {
  id: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    citations?: string[]; // 引用的source IDs
  }>;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectData {
  id: string;
  name: string;
  type: ProjectType;
  sourcesCount: number;
  lastModified: Date;
  status: ProjectStatus;
  thumbnail?: string;
  description?: string;
  collaboratingAgents?: AgentAppInfo[]; // 参与项目的 Agent 列表
  lastModifiedBy?: { type: 'user' | 'agent'; name: string }; // 最后修改者
  lastActivity?: string; // Last activity description (e.g., "Created new deck", "Analysis completed")
  // Project Context Mode fields
  systemPrompt?: string; // Custom instructions/system prompt
  knowledgeIds?: string[]; // Knowledge collection IDs for RAG
  attachedFileIds?: string[]; // Attached file IDs (deprecated, use attachedFiles)
  attachedFiles?: AttachedFile[]; // Attached files (Library, URL, Local)
  // 统一的数据模型（新增）
  sources?: ProjectSource[]; // 项目数据源
  files?: ProjectFile[]; // 项目文件（note/document/artifact）
  conversations?: ProjectConversation[]; // 项目对话记录
}

