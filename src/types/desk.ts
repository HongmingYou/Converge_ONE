import { AIModel, ChatbotMode } from '@/types';

// Data source from project sources
export interface DataSource {
  id: string;
  name: string;
  type: 'document' | 'database' | 'api' | 'audio';
  size: string;
  lastUpdated: string;
  isSelected?: boolean;
}

// Chat message in project
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHighlighted?: boolean;
  citations?: string[];
}

// Note/File item
export interface Note {
  id: number | string;
  type: 'note' | 'audio-clip' | 'folder';
  title: string;
  content: string;
  tags: string[];
  date: string;
  duration?: string;
  isNew?: boolean;
  parentId?: number | string;
  isExpanded?: boolean;
  isLoading?: boolean;
  fileType?: 'infographic' | 'ppt' | 'mindmap';
  sourceId?: string;
  createdBy?: 'user' | 'agent';
}

// Slash command for editor
export interface SlashCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

// Active item in editor (can be source, asset, or note)
export type ActiveItem =
  | { id: string | number; type: 'source'; data: DataSource }
  | { id: string | number; type: 'asset'; data: Note }
  | { id: string | number; type: 'note'; data: Note };

// Panel visibility state
export interface PanelState {
  showSources: boolean;
  showEditor: boolean;
  showStudio: boolean;
}

// Editor state
export interface EditorState {
  showSlashMenu: boolean;
  slashQuery: string;
  selectedSlashIndex: number;
  showFloatingToolbar: boolean;
  selectedText: string;
  floatingToolbarPosition: { top: number; left: number };
  wordCount: number;
  isSaving: boolean;
}

// Chat state
export interface ChatState {
  input: string;
  isAIThinking: boolean;
  selectedModel: AIModel;
  chatbotMode: ChatbotMode;
  showModelMenu: boolean;
}
