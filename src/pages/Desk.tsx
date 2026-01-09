import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Mic, 
  Sparkles, 
  Play, 
  MoreHorizontal,
  Layout,
  List,
  Grid,
  PenTool,
  ArrowRight,
  Maximize2,
  Clock,
  Plus,
  Database,
  PanelLeft,
  PanelRight,
  ChevronRight,
  ChevronDown,
  Folder,
  Check,
  Bold,
  Italic,
  Link,
  Highlighter,
  Type,
  List as ListIcon,
  Quote,
  Code,
  Wand2,
  Save,
  X,
  Edit,
  Trash2,
  FolderPlus,
  FilePlus,
  Folder as FolderIcon,
  Upload,
  Image,
  Presentation,
  Network,
  Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PrimarySidebar } from '@/components/PrimarySidebar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { MOCK_PROJECTS } from '@/data/mockProject';
import { ChatbotMode, AIModel, LibraryArtifact } from '@/types';
import { AttachedFile, ProjectSource, ProjectFile } from '@/types/project';
import { AddFilesModal } from '@/components/AddFilesModal';
import { MOCK_LIBRARY_ARTIFACTS } from '@/data/mock';
import { useProjects } from '@/context/ProjectContext';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface DataSource {
  id: string;
  name: string;
  type: 'document' | 'database' | 'api' | 'audio';
  size: string;
  lastUpdated: string;
  isSelected?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHighlighted?: boolean;
  citations?: (string | number)[]; // Support both string IDs and number indices
}

interface Note {
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
  sourceId?: string; // 关联的source ID
  createdBy?: 'user' | 'agent'; // 区分用户创建还是Agent生成
}

interface SlashCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', icon: Type, description: 'Big section heading' },
  { id: 'h2', label: 'Heading 2', icon: Type, description: 'Medium section heading' },
  { id: 'h3', label: 'Heading 3', icon: Type, description: 'Small section heading' },
  { id: 'bullet', label: 'Bulleted List', icon: ListIcon, description: 'Create a bulleted list' },
  { id: 'numbered', label: 'Numbered List', icon: ListIcon, description: 'Create a numbered list' },
  { id: 'quote', label: 'Quote', icon: Quote, description: 'Capture a quote' },
  { id: 'code', label: 'Code Block', icon: Code, description: 'Insert a code block' },
  { id: 'ai', label: 'AI Assist', icon: Wand2, description: 'Get AI help with writing' },
];

// Helper functions to convert Project data to Desk display formats
const convertProjectSourceToDataSource = (source: ProjectSource): DataSource => {
  const getType = (sourceType: ProjectSource['type']): DataSource['type'] => {
    if (sourceType === 'file') {
      const mimeType = source.metadata.mimeType || '';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType.startsWith('image/')) return 'document';
      return 'document';
    }
    return 'document';
  };

  const timeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return {
    id: source.id,
    name: source.name,
    type: getType(source.type),
    size: source.metadata.size || 'Unknown',
    lastUpdated: timeAgo(source.metadata.uploadedAt),
    isSelected: false,
  };
};

const convertProjectFileToNote = (file: ProjectFile): Note => {
  const timeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getFileType = (type: ProjectFile['type']): Note['type'] => {
    if (type === 'folder') return 'folder';
    if (type === 'audio-clip') return 'audio-clip';
    return 'note';
  };

  return {
    id: file.id,
    type: getFileType(file.type),
    title: file.title,
    content: file.content,
    tags: file.metadata.tags,
    date: timeAgo(file.metadata.updatedAt),
    parentId: file.parentId,
    isExpanded: file.metadata.isExpanded,
    isLoading: file.metadata.isLoading,
    fileType: file.type === 'infographic' ? 'infographic' : 
               file.type === 'ppt' ? 'ppt' : 
               file.type === 'mindmap' ? 'mindmap' : undefined,
    sourceId: file.sourceId,
    createdBy: file.createdBy,
  };
};

export default function Desk() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get('card_id');
  const msgId = searchParams.get('msg_id');
  const sourceCardId = searchParams.get('source_card_id');
  
  // Get project data from Context
  const { getProject, updateProject } = useProjects();
  const project = projectId ? getProject(projectId) : null;
  
  // Convert project sources to DataSource format for display
  // Fallback: if no sources, create from attachedFiles
  const projectSources: DataSource[] = project?.sources?.map(convertProjectSourceToDataSource) || 
    (project?.attachedFiles?.map((file) => ({
      id: file.id,
      name: file.name,
      type: (file.type === 'image' ? 'document' : 'document') as DataSource['type'],
      size: file.size || 'Unknown',
      lastUpdated: 'Just now',
      isSelected: false,
    })) || []);
  
  // Convert project files to Note format for display
  const projectFiles: Note[] = project?.files?.map(convertProjectFileToNote) || [];
  
  // Convert project conversations to ChatMessage format
  const projectChatHistory: ChatMessage[] = project?.conversations?.[0]?.messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    citations: msg.citations,
  })) || [];
  
  const [sources, setSources] = useState<DataSource[]>(projectSources);
  const [notes, setNotes] = useState<Note[]>(projectFiles);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(projectChatHistory);
  const [projectAttachedFiles, setProjectAttachedFiles] = useState<AttachedFile[]>(project?.attachedFiles || []);
  
  // Update data when project changes
  useEffect(() => {
    if (projectId && project) {
      // Sources: use project.sources or fallback to attachedFiles
      const updatedSources = project.sources?.map(convertProjectSourceToDataSource) || 
        (project.attachedFiles?.map((file) => ({
          id: file.id,
          name: file.name,
          type: (file.type === 'image' ? 'document' : 'document') as DataSource['type'],
          size: file.size || 'Unknown',
          lastUpdated: 'Just now',
          isSelected: false,
        })) || []);
      
      const updatedFiles = project.files?.map(convertProjectFileToNote) || [];
      const updatedChatHistory = project.conversations?.[0]?.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        citations: msg.citations,
      })) || [];
      
      setSources(updatedSources);
      setNotes(updatedFiles);
      setChatHistory(updatedChatHistory);
      setProjectAttachedFiles(project.attachedFiles || []);
    }
  }, [projectId, project]);
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(false);
  const [draggedSource, setDraggedSource] = useState<DataSource | null>(null);
  const [isDraggingOverInput, setIsDraggingOverInput] = useState(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [isInputFloating, setIsInputFloating] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  const [showEditor, setShowEditor] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['sources', 'asset']);
  const [activeView, setActiveView] = useState<'chat' | 'projects'>('projects');
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  
  // Chatbot state
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-4.5');
  const [chatbotMode, setChatbotMode] = useState<ChatbotMode>('chat');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  
  // Editor state
  const [editorContent, setEditorContent] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // File system state
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };

    if (showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelMenu]);
  
  // Track scroll for header border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Update word count
  useEffect(() => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (activeNote) {
      const words = activeNote.content.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [notes, activeNoteId]);

  // Handle text selection for floating toolbar
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowFloatingToolbar(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      
      if (text.length > 0 && editorRef.current?.contains(range.commonAncestorContainer)) {
        setSelectedText(text);
        const rect = range.getBoundingClientRect();
        setFloatingToolbarPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2
        });
        setShowFloatingToolbar(true);
      } else {
        setShowFloatingToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Context restoration effect
  useEffect(() => {
    if (cardId || msgId || sourceCardId) {
      const timer = setTimeout(() => {
        if (cardId) {
          setSources(prev => prev.map(source => 
            source.id === '1' ? { ...source, isSelected: true } : source
          ));
        }

        if (sourceCardId) {
          setSources(prev => prev.map(source => 
            source.id === '1' ? { ...source, isSelected: true } : source
          ));
        }

        if (msgId) {
          setChatHistory(prev => prev.map((msg, idx) => 
            idx === 1 ? { ...msg, isHighlighted: true } : msg
          ));

          setTimeout(() => {
            const highlightedElement = document.querySelector('[data-highlighted="true"]');
            if (highlightedElement) {
              highlightedElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          }, 100);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [cardId, msgId, sourceCardId]);

  // Clear highlight after 3 seconds
  useEffect(() => {
    const highlighted = chatHistory.find(msg => msg.isHighlighted);
    if (highlighted) {
      const timer = setTimeout(() => {
        setChatHistory(prev => prev.map(msg => ({ ...msg, isHighlighted: false })));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [chatHistory]);

  const toggleSource = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, isSelected: !source.isSelected } : source
    ));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgId = Date.now().toString();
    const userInput = input.trim();
    
    // Check if it's a quick action command
    const isInfoGraphic = userInput.includes('信息图');
    const isPPT = userInput.includes('PPT') || userInput.includes('演示文稿');
    const isMindMap = userInput.includes('思维导图');
    
    // Add user message
    setChatHistory(prev => [...prev, { 
      id: newMsgId, 
      role: 'user', 
      content: userInput,
      timestamp: new Date()
    }]);
    
    setInput('');
    setIsAIThinking(true);
    
    // If it's a quick action, create loading file and show message
    if (isInfoGraphic || isPPT || isMindMap) {
      const fileId = Date.now();
      const fileType = isInfoGraphic ? 'infographic' : isPPT ? 'ppt' : 'mindmap';
      const fileName = isInfoGraphic ? '信息图' : isPPT ? 'PPT演示文稿' : '思维导图';
      
      // Create loading file in file tree (Agent 生成的文件)
      setNotes(prev => [{
        id: fileId,
        type: 'note',
        title: fileName,
        content: '',
        tags: ['Generating'],
        date: 'Just now',
        isLoading: true,
        fileType: fileType as 'infographic' | 'ppt' | 'mindmap',
        isNew: true,
        createdBy: 'agent', // Agent 生成的文件
      }, ...prev]);
      
      // Show assistant message
      setTimeout(() => {
        setIsAIThinking(false);
        setChatHistory(prev => [...prev, {
          id: (newMsgId + 1).toString(),
          role: 'assistant',
          content: '文件生成中，生成完成后你可以在文件树中查看、这期间可以继续对话',
          timestamp: new Date(),
          citations: []
        }]);
      }, 500);
      
      // After 5 seconds, remove loading state
      setTimeout(() => {
        setNotes(prev => prev.map(note => 
          note.id === fileId 
            ? { ...note, isLoading: false, tags: note.tags.filter(t => t !== 'Generating').concat([fileType === 'infographic' ? 'InfoGraphic' : fileType === 'ppt' ? 'PPT' : 'MindMap']) }
            : note
        ));
      }, 5000);
    } else {
      // Normal chat flow
      setTimeout(() => {
        setIsAIThinking(false);
        setChatHistory(prev => [...prev, {
          id: (newMsgId + 1).toString(),
          role: 'assistant',
          content: '好的，我已经捕捉到了这个关键信息。这是一条非常有价值的洞察，我已将其整理为新的笔记卡片。',
          timestamp: new Date(),
          citations: []
        }]);
        setNotes(prev => [{
          id: Date.now(),
          type: 'note',
          title: 'User Insight',
          content: userInput,
          tags: ['New'],
          date: 'Just now',
          isNew: true,
          createdBy: 'agent', // Agent 生成的笔记
        }, ...prev]);
      }, 800);
    }
  };

  const handleDragStart = (source: DataSource) => (e: React.DragEvent) => {
    setDraggedSource(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', source.id);
  };

  const handleDragEnd = () => {
    setDraggedSource(null);
    setIsDraggingOverInput(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverInput(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverInput(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverInput(false);
    
    if (draggedSource) {
      setInput(`基于 ${draggedSource.name}，`);
      inputRef.current?.focus();
    }
    
    setDraggedSource(null);
  };

  const getSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'database':
        return Database;
      case 'api':
        return Sparkles;
      case 'audio':
        return Mic;
    }
  };

  // Handle slash command
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lastLine = textBeforeCursor.split('\n').pop() || '';

    if (e.key === '/' && lastLine.trim() === '') {
      e.preventDefault();
      setShowSlashMenu(true);
      setSlashQuery('');
      setSelectedSlashIndex(0);
    } else if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(prev => Math.min(prev + 1, SLASH_COMMANDS.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = SLASH_COMMANDS[selectedSlashIndex];
        if (command) {
          handleSlashCommand(command);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      } else if (e.key.length === 1) {
        setSlashQuery(prev => prev + e.key);
      }
    }
  };

  const handleSlashCommand = (command: SlashCommand) => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    if (!activeNote || !editorRef.current) return;

    let insertText = '';
    switch (command.id) {
      case 'h1':
        insertText = '# ';
        break;
      case 'h2':
        insertText = '## ';
        break;
      case 'h3':
        insertText = '### ';
        break;
      case 'bullet':
        insertText = '- ';
        break;
      case 'numbered':
        insertText = '1. ';
        break;
      case 'quote':
        insertText = '> ';
        break;
      case 'code':
        insertText = '```\n\n```';
        break;
      case 'ai':
        // Trigger AI assist
        break;
    }

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = activeNote.content.substring(0, start - 1) + insertText + activeNote.content.substring(end);
    
    setNotes(prev => prev.map(n => 
      n.id === activeNote.id ? { ...n, content: newContent } : n
    ));

    setShowSlashMenu(false);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length - 1, start + insertText.length - 1);
    }, 0);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  // File operations
  const handleCreateNote = (parentId?: string | number) => {
    const newId = Date.now();
    const newNote: Note = {
      id: newId,
      type: 'note',
      title: 'Untitled Note',
      content: '',
      tags: ['New'],
      date: 'Just now',
      isNew: true,
      parentId: parentId,
      createdBy: 'user', // 用户创建的文件
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
    startRenaming(newNote);
    
    // If created inside a folder, ensure it's expanded
    if (parentId) {
      setNotes(prev => prev.map(n => 
        n.id === parentId ? { ...n, isExpanded: true } : n
      ));
    }
  };

  const handleCreateFolder = (parentId?: string | number) => {
    const newId = Date.now();
    const newFolder: Note = {
      id: newId,
      type: 'folder',
      title: 'New Folder',
      content: '',
      tags: [],
      date: 'Just now',
      isNew: true,
      parentId: parentId,
      isExpanded: true,
      createdBy: 'user', // 用户创建的文件夹
    };
    setNotes(prev => [newFolder, ...prev]);
    startRenaming(newFolder);

    // If created inside a folder, ensure it's expanded
    if (parentId) {
      setNotes(prev => prev.map(n => 
        n.id === parentId ? { ...n, isExpanded: true } : n
      ));
    }
  };

  const toggleFolder = (id: string | number) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, isExpanded: !n.isExpanded } : n
    ));
  };

  const handleDelete = (id: string | number) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const startRenaming = (note: Note) => {
    setEditingId(note.id);
    setEditingName(note.title);
  };

  const handleRename = () => {
    if (editingId) {
      setNotes(prev => prev.map(n => 
        n.id === editingId ? { ...n, title: editingName } : n
      ));
      setEditingId(null);
    }
  };

  // Mock breadcrumb data
  const breadcrumbItems = [
    { label: 'Project', path: '/?view=projects' },
    { label: project?.name || 'Project', path: `/project/${projectId}` },
  ];

  const renderFileTreeItem = (item: Note, level = 0, isInsideVirtualFolder = false) => {
    const hasChildren = notes.some(n => n.parentId === item.id);
    // IDE 风格的缩进：每级 12px，基础 8px
    const paddingLeft = level * 12 + 8;

    // 获取文件图标
    const getFileIcon = () => {
      if (item.isLoading) {
        return <Loader2 size={16} className="text-orange-500 animate-spin flex-shrink-0" />;
      }
      if (item.fileType === 'infographic') {
        return <Image size={16} className={cn("flex-shrink-0", activeNoteId === item.id ? "text-orange-500" : "text-emerald-500")} />;
      }
      if (item.fileType === 'ppt') {
        return <Presentation size={16} className={cn("flex-shrink-0", activeNoteId === item.id ? "text-orange-500" : "text-red-500")} />;
      }
      if (item.fileType === 'mindmap') {
        return <Network size={16} className={cn("flex-shrink-0", activeNoteId === item.id ? "text-orange-500" : "text-purple-500")} />;
      }
      if (item.type === 'audio-clip') {
        return <Mic size={16} className={cn("flex-shrink-0", activeNoteId === item.id ? "text-orange-500" : "text-amber-500")} />;
      }
      return <FileText size={16} className={cn("flex-shrink-0", activeNoteId === item.id ? "text-orange-500" : "text-gray-400")} />;
    };

    return (
        <div key={item.id}>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div 
                        onClick={() => {
                            if (item.isLoading) return;
                            if (item.type === 'folder') {
                                toggleFolder(item.id);
                            } else {
                                setActiveNoteId(item.id);
                                setShowEditor(true);
                            }
                        }}
                        className={cn(
                            "flex items-center h-7 pr-2 text-[13px] transition-colors group relative",
                            item.isLoading 
                                ? "cursor-wait text-gray-400" 
                                : "cursor-pointer hover:bg-gray-100/80 text-gray-700",
                            activeNoteId === item.id && !item.isLoading && "bg-orange-50 text-orange-700"
                        )}
                        style={{ paddingLeft }}
                    >
                        {/* 文件夹展开箭头或占位 */}
                        {item.type === 'folder' ? (
                            <ChevronRight 
                                size={16} 
                                className={cn(
                                    "text-gray-400 transition-transform flex-shrink-0 mr-0.5", 
                                    item.isExpanded && "rotate-90",
                                    !hasChildren && "opacity-0"
                                )} 
                            />
                        ) : (
                            <span className="w-[16px] flex-shrink-0 mr-0.5" />
                        )}

                        {/* 图标 */}
                        {item.type === 'folder' ? (
                            <FolderIcon size={16} className="text-blue-500 fill-blue-500/20 flex-shrink-0 mr-2" />
                        ) : (
                            <span className="mr-2">{getFileIcon()}</span>
                        )}
                        
                        {/* 文件名 */}
                        {editingId === item.id ? (
                            <input
                                autoFocus
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                className="flex-1 bg-white border border-blue-400 rounded px-1.5 py-0.5 text-[13px] focus:outline-none min-w-0"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className={cn(
                                "truncate flex-1",
                                item.isLoading && "text-gray-400 italic"
                            )}>
                                {item.title}
                                {item.isLoading && <span className="ml-1.5 text-[11px] text-gray-400">(生成中...)</span>}
                            </span>
                        )}

                        {/* Hover Actions - 仅文件夹 */}
                        {item.type === 'folder' && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCreateFolder(item.id); }}
                                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                                    title="New Folder"
                                >
                                    <FolderPlus size={14} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCreateNote(item.id); }}
                                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                                    title="New Note"
                                >
                                    <FilePlus size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => startRenaming(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                    </ContextMenuItem>
                    {item.type === 'folder' && (
                        <>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => handleCreateNote(item.id)}>
                                <FilePlus className="mr-2 h-4 w-4" />
                                New File
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => handleCreateFolder(item.id)}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                New Folder
                            </ContextMenuItem>
                        </>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Recursive Children */}
            <AnimatePresence>
                {item.type === 'folder' && item.isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {notes
                            .filter(n => n.parentId === item.id)
                            .map(child => renderFileTreeItem(child, level + 1, isInsideVirtualFolder))
                        }
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
  };

  const handleFilesChange = (newFiles: AttachedFile[]) => {
    if (!projectId || !project) return;
    
    // Convert AttachedFile to ProjectSource
    const newSources: ProjectSource[] = newFiles.map((file) => ({
      id: file.id,
      type: file.source === 'library' ? 'library' : 
            file.source === 'url' ? 'url' : 
            file.source === 'search' ? 'search' : 'file',
      name: file.name,
      content: file.description || '',
      metadata: {
        size: file.size,
        uploadedAt: Date.now(),
        indexed: false,
        mimeType: file.type,
      },
      attachedFileId: file.id,
    }));
    
    // Merge with existing sources (avoid duplicates)
    const existingSourceIds = new Set(project.sources?.map(s => s.id) || []);
    const uniqueNewSources = newSources.filter(s => !existingSourceIds.has(s.id));
    const updatedSources = [...(project.sources || []), ...uniqueNewSources];
    
    // Update project
    updateProject(projectId, {
      attachedFiles: newFiles,
      sources: updatedSources,
      sourcesCount: updatedSources.length,
    });
    
    setIsAddFilesModalOpen(false);
  };

  const renderFileTreePanelContent = () => {
    // 分组文件：agent 生成的 vs 用户创建的
    const agentFiles = notes.filter(n => n.createdBy === 'agent' && !n.parentId);
    const userFiles = notes.filter(n => n.createdBy === 'user' && !n.parentId);
    
    // 渲染虚拟文件夹内的文件项（无 chevron 占位）
    const renderVirtualFolderItem = (item: Note | DataSource, isSource = false) => {
      if (isSource) {
        const source = item as DataSource;
        const Icon = getSourceIcon(source.type);
        return (
          <div 
            key={source.id} 
            draggable
            onDragStart={handleDragStart(source)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (!project) return;
              const existingFile = project.files?.find(f => f.sourceId === source.id);
              if (existingFile) {
                setActiveNoteId(existingFile.id as string | number);
                setShowEditor(true);
              } else {
                const projectSource = project.sources?.find(s => s.id === source.id);
                if (!projectSource) return;
                const newFile: ProjectFile = {
                  id: `file-${Date.now()}`,
                  type: 'note',
                  title: projectSource.name,
                  content: projectSource.content || `Content from ${projectSource.name}`,
                  sourceId: projectSource.id,
                  createdBy: 'user',
                  metadata: {
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    tags: ['Source'],
                    wordCount: (projectSource.content || '').split(/\s+/).filter(w => w.length > 0).length,
                  },
                };
                const updatedFiles = [...(project.files || []), newFile];
                updateProject(projectId!, { files: updatedFiles });
                const newNote = convertProjectFileToNote(newFile);
                setNotes(prev => [newNote, ...prev]);
                setActiveNoteId(newFile.id as string | number);
                setShowEditor(true);
              }
            }}
            className="flex items-center h-7 pl-8 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group"
          >
            <Icon size={16} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0 mr-2" />
            <span className="truncate">{source.name}</span>
          </div>
        );
      }
      
      // Agent 文件项
      const note = item as Note;
      const getFileIcon = () => {
        if (note.isLoading) return <Loader2 size={16} className="text-orange-500 animate-spin flex-shrink-0" />;
        if (note.fileType === 'infographic') return <Image size={16} className="text-emerald-500 flex-shrink-0" />;
        if (note.fileType === 'ppt') return <Presentation size={16} className="text-red-500 flex-shrink-0" />;
        if (note.fileType === 'mindmap') return <Network size={16} className="text-purple-500 flex-shrink-0" />;
        if (note.type === 'audio-clip') return <Mic size={16} className="text-amber-500 flex-shrink-0" />;
        return <FileText size={16} className="text-gray-400 flex-shrink-0" />;
      };
      
      return (
        <div 
          key={note.id}
          onClick={() => {
            if (note.isLoading) return;
            setActiveNoteId(note.id);
            setShowEditor(true);
          }}
          className={cn(
            "flex items-center h-7 pl-8 pr-2 text-[13px] cursor-pointer group",
            note.isLoading ? "text-gray-400 cursor-wait" : "text-gray-700 hover:bg-gray-100/80",
            activeNoteId === note.id && !note.isLoading && "bg-orange-50 text-orange-700"
          )}
        >
          <span className="mr-2">{getFileIcon()}</span>
          <span className={cn("truncate", note.isLoading && "italic")}>
            {note.title}
            {note.isLoading && <span className="ml-1.5 text-[11px] text-gray-400">(生成中...)</span>}
          </span>
        </div>
      );
    };
    
    return (
      <>
        <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h2 className="font-semibold text-[13px] text-gray-600 uppercase tracking-wide">Files</h2>
            <div className="flex items-center gap-0.5">
                <button 
                    onClick={() => setIsAddFilesModalOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    title="Upload Files"
                >
                    <Upload size={16} />
                </button>
                <button 
                    onClick={() => handleCreateFolder()}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    title="New Folder"
                >
                    <FolderPlus size={16} />
                </button>
                <button 
                    onClick={() => handleCreateNote()}
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                    title="New Note"
                >
                    <FilePlus size={16} />
                </button>
            </div>
        </div>
        <ScrollArea className="flex-1">
            <div className="py-1">
                {/* Sources Folder - 上传的文件和搜索的文件 */}
                <div>
                    <div 
                        onClick={() => setExpandedFolders(prev => prev.includes('sources') ? prev.filter(f => f !== 'sources') : [...prev, 'sources'])}
                        className="flex items-center h-7 pl-2 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group"
                    >
                        <ChevronRight 
                          size={16} 
                          className={cn(
                            "text-gray-400 transition-transform flex-shrink-0 mr-0.5",
                            expandedFolders.includes('sources') && "rotate-90"
                          )} 
                        />
                        <FolderIcon size={16} className="text-orange-500 fill-orange-500/20 flex-shrink-0 mr-2" />
                        <span className="font-medium">Sources</span>
                        <span className="text-[11px] text-gray-400 ml-auto">{sources.length}</span>
                    </div>
                    <AnimatePresence>
                        {expandedFolders.includes('sources') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {sources.length === 0 ? (
                                    <div className="h-7 pl-8 flex items-center text-[12px] text-gray-400 italic">
                                        No sources yet
                                    </div>
                                ) : (
                                    sources.map(source => renderVirtualFolderItem(source, true))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Asset Folder - Agent 生成的文件 */}
                <div>
                    <div 
                        onClick={() => setExpandedFolders(prev => prev.includes('asset') ? prev.filter(f => f !== 'asset') : [...prev, 'asset'])}
                        className="flex items-center h-7 pl-2 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group"
                    >
                        <ChevronRight 
                          size={16} 
                          className={cn(
                            "text-gray-400 transition-transform flex-shrink-0 mr-0.5",
                            expandedFolders.includes('asset') && "rotate-90"
                          )} 
                        />
                        <Sparkles size={16} className="text-purple-500 flex-shrink-0 mr-2" />
                        <span className="font-medium">Asset</span>
                        <span className="text-[11px] text-gray-400 ml-auto">{agentFiles.length}</span>
                    </div>
                    <AnimatePresence>
                        {expandedFolders.includes('asset') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {agentFiles.length === 0 ? (
                                    <div className="h-7 pl-8 flex items-center text-[12px] text-gray-400 italic">
                                        No assets yet
                                    </div>
                                ) : (
                                    agentFiles.map(item => renderVirtualFolderItem(item, false))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Files - 用户创建的文件（直接显示在根目录） */}
                {userFiles.map(item => renderFileTreeItem(item, 0))}
            </div>
        </ScrollArea>
      </>
    );
  };

  const renderChatContent = (isCompact: boolean) => {
    const filteredCommands = SLASH_COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
    );

    return (
      <>
        {/* Panel Header - Removed model selector */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-50/30">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" />
            <span className="font-medium text-sm text-gray-500">AI Assistant</span>
          </div>
          <div className="flex gap-1 items-center">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
              <Clock size={16}/>
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
              <MoreHorizontal size={16}/>
            </button>
          </div>
        </div>

        {/* Chat Content Area - Card Style */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className={cn("py-6 space-y-4 scroll-smooth", isCompact ? "px-4" : "px-8")} ref={chatContainerRef}>
            {chatHistory.map(msg => (
              <motion.div
                key={msg.id}
                data-highlighted={msg.isHighlighted}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: msg.isHighlighted 
                    ? 'rgba(254, 243, 199, 0.5)' 
                    : 'transparent'
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex flex-col",
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                {msg.role === 'user' ? (
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tr-sm text-gray-800 text-[14px] font-medium leading-relaxed max-w-[85%] shadow-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className={cn("max-w-full group", isCompact ? "" : "pr-4")}>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="prose prose-slate max-w-none">
                        <div className="font-serif text-[15px] leading-7 text-[#2C2C2C]">
                          {msg.content.split('\n').map((line, i) => {
                            const citationMatch = line.match(/Q3\s*财报|Q3\s*Financial\s*Report/i);
                            const sourceId = citationMatch ? '1' : null;
                            const percentageMatch = line.match(/(\d+%)/g);
                            const parts = line.split(/(\d+%)/g);
                            
                            return (
                              <div key={i} className="mb-3">
                                {line.startsWith('**') ? (
                                  <strong className="block text-gray-900 font-bold font-serif text-base mb-1 mt-4">
                                    {line.replace(/\*\*/g, '')}
                                  </strong>
                                ) : citationMatch ? (
                                  <span
                                    onMouseEnter={() => sourceId && setHighlightedSourceId(sourceId)}
                                    onMouseLeave={() => setHighlightedSourceId(null)}
                                    className="text-orange-600 underline decoration-orange-300 cursor-pointer hover:text-orange-700 transition-colors"
                                  >
                                    {parts.map((part, idx) => 
                                      percentageMatch?.includes(part) ? (
                                        <span key={idx} className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs">
                                          {part}
                                        </span>
                                      ) : (
                                        <span key={idx}>{part}</span>
                                      )
                                    )}
                                  </span>
                                ) : percentageMatch ? (
                                  <span>
                                    {parts.map((part, idx) => 
                                      percentageMatch.includes(part) ? (
                                        <span key={idx} className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs">
                                          {part}
                                        </span>
                                      ) : (
                                        <span key={idx}>{part}</span>
                                      )
                                    )}
                                  </span>
                                ) : (
                                  <span>{line}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Context Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[10px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                          <PenTool size={10}/> Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <div className="h-24" ref={chatEndRef}></div>
          </div>
        </ScrollArea>

        {/* Modern Input Area with Quick Actions and Internal Controls */}
        <div className="p-4 border-t border-gray-100 bg-white">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setInput('帮我生成一张信息图');
                inputRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
            >
              <Image size={14} className="text-orange-500" />
              <span>InfoGraphic</span>
            </button>
            <button
              onClick={() => {
                setInput('帮我生成一个PPT演示文稿');
                inputRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
            >
              <Presentation size={14} className="text-orange-500" />
              <span>PPT</span>
            </button>
            <button
              onClick={() => {
                setInput('帮我生成一个思维导图');
                inputRef.current?.focus();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
            >
              <Network size={14} className="text-orange-500" />
              <span>MindStudio</span>
            </button>
          </div>

          {/* Input Box with Internal Controls */}
          <div 
            className={cn(
              "relative bg-gray-50 border border-gray-200 rounded-xl transition-all",
              isDraggingOverInput && "scale-105 border-orange-400 bg-orange-50/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Textarea */}
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isDraggingOverInput ? "Drop file..." : "Ask AI..."}
              className={cn(
                "w-full bg-transparent border-none rounded-xl px-4 pt-3 pb-12 text-sm focus:outline-none focus:ring-0 resize-none transition-all",
                "min-h-[120px] max-h-[200px]"
              )}
              rows={3}
            />

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-t border-gray-200 rounded-b-xl bg-gray-50/50">
              {/* Left: Mode Toggle */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setChatbotMode('chat')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    chatbotMode === 'chat'
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Chat
                </button>
                <button
                  onClick={() => setChatbotMode('agent')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    chatbotMode === 'agent'
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Agent
                </button>
              </div>

              {/* Right: Model Selector and Send Button */}
              <div className="flex items-center gap-2">
                {/* Model Selector */}
                <div className="relative" ref={modelMenuRef}>
                  <button
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Sparkles size={12} className="text-orange-500" />
                    <span className="capitalize">{selectedModel.replace('-', ' ')}</span>
                    <ChevronDown size={12} className={cn("text-gray-400 transition-transform", showModelMenu && "rotate-180")} />
                  </button>
                  
                  {/* Model Dropdown Menu */}
                  <AnimatePresence>
                    {showModelMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                      >
                        {(['claude-4.5', 'gemini-3-pro', 'gpt-5'] as AIModel[]).map((model) => (
                          <button
                            key={model}
                            onClick={() => {
                              setSelectedModel(model);
                              setShowModelMenu(false);
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between",
                              selectedModel === model 
                                ? "bg-orange-50 text-orange-700 font-medium" 
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <span className="capitalize">{model.replace('-', ' ')}</span>
                            {selectedModel === model && (
                              <Check size={14} className="text-orange-600" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Send Button */}
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isAIThinking}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    input.trim() && !isAIThinking
                      ? 'text-orange-600 hover:bg-orange-50' 
                      : 'text-gray-300 cursor-not-allowed'
                  )}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderEditorPanelContent = () => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    const filteredCommands = SLASH_COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
    );

    return (
      <>
        {/* Editor Header with Info Bar */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-gray-50/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowEditor(false);
                setActiveNoteId(null);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              title="Close Editor"
            >
              <X size={16} />
            </button>
            <span className="text-gray-400"><FileText size={18}/></span>
            <span className="font-serif font-bold text-lg text-gray-800">
              {activeNote ? activeNote.title : 'Untitled'}
            </span>
            {activeNote?.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {wordCount} words
            </span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                isSaving
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              )}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Saved'}
            </button>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 relative">
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto py-12 px-12 relative">
              {activeNote ? (
                <div className="prose prose-lg prose-slate max-w-none relative">
                  <textarea 
                    ref={editorRef}
                    value={activeNote.content}
                    onChange={(e) => {
                      setNotes(prev => prev.map(n => 
                        n.id === activeNote.id ? {...n, content: e.target.value} : n
                      ));
                    }}
                    onKeyDown={handleEditorKeyDown}
                    className="w-full min-h-[calc(100vh-300px)] resize-none outline-none border-none text-gray-700 text-lg leading-relaxed bg-transparent font-serif placeholder:text-gray-300"
                    placeholder="Type '/' for commands..."
                  />
                  
                  {/* Slash Command Menu */}
                  <AnimatePresence>
                    {showSlashMenu && (
                      <motion.div
                        ref={slashMenuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[280px] mt-2"
                        style={{ top: editorRef.current ? editorRef.current.selectionStart : 0 }}
                      >
                        {filteredCommands.map((cmd, idx) => {
                          const Icon = cmd.icon;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => handleSlashCommand(cmd)}
                              className={cn(
                                "w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors",
                                idx === selectedSlashIndex
                                  ? "bg-orange-50 text-orange-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              <Icon size={18} className={idx === selectedSlashIndex ? "text-orange-600" : "text-gray-400"} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{cmd.label}</div>
                                <div className="text-xs text-gray-500">{cmd.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Floating Format Toolbar */}
                  <AnimatePresence>
                    {showFloatingToolbar && selectedText && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
                        style={{
                          top: floatingToolbarPosition.top,
                          left: floatingToolbarPosition.left,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bold">
                          <Bold size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Italic">
                          <Italic size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Link">
                          <Link size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Highlight">
                          <Highlighter size={16} className="text-gray-600" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="AI Rewrite">
                          <Wand2 size={16} className="text-orange-600" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <FileText size={48} strokeWidth={1} className="mb-4 text-gray-300"/>
                  <p>Select a note from the file tree to start editing</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  };

  const renderNotesPanelContent = () => (
    <>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-50/30 sticky top-0 bg-white z-10">
            <h2 className="font-serif font-bold text-lg">Studio</h2>
            {/* View Mode Toggles */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                    )}
                >
                    <Grid size={14} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                    )}
                >
                    <List size={14} />
                </button>
            </div>
        </div>
        
        {/* Tools Grid */}
        <div className="px-5 py-4 border-b border-gray-50/30">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Create</span>
            <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Play size={12} fill="currentColor"/>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">Audio</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Layout size={12} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Deck</span>
                </button>
            </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-3 bg-[#FAFAFA]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recent Notes</span>
                {notes.map(note => (
                    <motion.div 
                        key={note.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-1">
                                {note.tags.map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-[9px] uppercase font-bold text-gray-500 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {note.type === 'audio-clip' && <Mic size={12} className="text-orange-500" />}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug group-hover:text-orange-700 transition-colors">
                            {note.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                            {note.content}
                        </p>

                        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">{note.date}</span>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-500 transition-all">
                                <Maximize2 size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen bg-[#FAFAF9] font-sans text-[#1A1A1A] overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Left Navigation Sidebar */}
      <PrimarySidebar 
        activeView={activeView}
        setActiveView={(view) => {
          // If clicking Chat or Settings, navigate to home page
          if (view === 'chat' || view === 'settings') {
            navigate(view === 'chat' ? '/' : '/?view=settings');
          } else if (view === 'projects') {
            setActiveView(view);
          }
        }}
        recentProjects={MOCK_PROJECTS}
        onProjectClick={(projectId) => navigate(`/project/${projectId}`)}
        onLogoClick={() => navigate('/')}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global Header */}
        <header 
          ref={headerRef}
          className={cn(
            "flex-shrink-0 h-16 flex items-center justify-between px-8 z-40 transition-all duration-300",
            "bg-white/60 backdrop-blur-md",
            isScrolled && "border-b border-gray-200/50"
          )}
        >
          <div className="flex items-center gap-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="flex items-center gap-2">
            {(cardId || msgId || sourceCardId) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full"
              >
                {sourceCardId ? 'Context loaded from Agent Stream' : 'Context restored from Dashboard'}
              </motion.div>
            )}

            {/* Panel Toggle Buttons */}
            <div className="flex items-center gap-1 mx-2 px-2 py-1 bg-white/50 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setShowSources(!showSources)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  showSources 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                title={showSources ? "Hide Sources" : "Show Sources"}
              >
                <PanelLeft size={16} />
              </button>
              <button
                onClick={() => setShowStudio(!showStudio)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  showStudio 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                title={showStudio ? "Hide Studio" : "Show Studio"}
              >
                <PanelRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Project */}
        <main className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden min-h-0">
        
        {/* === Left Panel === */}
        <motion.div
          initial={false}
          animate={{
            width: showSources ? 280 : 0,
            opacity: showSources ? 1 : 0,
            marginRight: showSources ? 0 : -24,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
        >
            {renderFileTreePanelContent()}
        </motion.div>

        {/* === Center Panel === */}
        <motion.div
          initial={false}
          animate={{
            flex: showEditor ? 1 : 0,
            width: showEditor ? 'auto' : 0,
            opacity: showEditor ? 1 : 0,
            marginRight: showEditor ? 0 : -24,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden relative"
        >
             {renderEditorPanelContent()}
        </motion.div>

        {/* === Right Panel (Chat) === */}
        <motion.div
          initial={false}
          animate={{
            flex: 1,
            maxWidth: !showEditor && !showSources ? '1200px' : '100%',
            marginLeft: !showEditor && !showSources ? 'auto' : 0,
            marginRight: !showEditor && !showSources ? 'auto' : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
        >
            {renderChatContent(!showEditor)}
        </motion.div>

      </main>
      </div>

      {/* Add Files Modal */}
      <AddFilesModal
        open={isAddFilesModalOpen}
        onOpenChange={setIsAddFilesModalOpen}
        onFilesChange={handleFilesChange}
        libraryArtifacts={MOCK_LIBRARY_ARTIFACTS}
        initialFiles={projectAttachedFiles}
      />
    </div>
  );
}

