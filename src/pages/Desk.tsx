import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PanelLeft, PanelRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrimarySidebar } from '@/components/PrimarySidebar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { MOCK_PROJECTS } from '@/data/mockProject';
import { MOCK_LIBRARY_ARTIFACTS } from '@/data/mock';
import { AIModel, ChatbotMode } from '@/types';
import { UnifiedAddFilesModal } from '@/components/chat/UnifiedAddFiles';
import { useProjectData } from '@/hooks/use-project-data';
import { FileTreePanel, ChatPanel, EditorPanel } from '@/components/desk';
import { DataSource, Note, ActiveItem, ChatMessage } from '@/types/desk';
import type { ProjectConversation } from '@/types/project';

export default function Desk() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Use the project data hook for simplified data flow
  const {
    project,
    sources,
    notes,
    conversations,
    attachedFiles,
    handleFilesChange,
    updateProject,
  } = useProjectData({ projectId });

  // Local UI state (not persisted)
  const [localNotes, setLocalNotes] = useState<Note[]>([]);
  const [localChatHistory, setLocalChatHistory] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'projects'>('projects');
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);
  const [draggedSource, setDraggedSource] = useState<DataSource | null>(null);
  const [isDraggingOverInput, setIsDraggingOverInput] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Chatbot state
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-4.5');
  const [chatbotMode, setChatbotMode] = useState<ChatbotMode>('chat');

  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync notes and chatHistory from project data
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      setLocalChatHistory([]);
      setActiveConversationId(null);
      return;
    }

    const hasActive = activeConversationId && conversations.some((c) => c.id === activeConversationId);
    const nextActiveId = hasActive ? activeConversationId : conversations[0].id;
    if (nextActiveId !== activeConversationId) setActiveConversationId(nextActiveId);

    const activeConv = conversations.find((c) => c.id === nextActiveId) || conversations[0];
    const mapped = activeConv.messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      citations: msg.citations?.map(String),
    }));
    setLocalChatHistory(mapped);
  }, [conversations, activeConversationId]);

  const conversationSummaries = useMemo(() => {
    const list = (conversations || []).map((c: ProjectConversation) => {
      const firstUser = c.messages.find((m) => m.role === 'user');
      const lastMsg = c.messages[c.messages.length - 1];
      const title = (firstUser?.content || 'New chat').trim().slice(0, 36) || 'New chat';
      const preview = (lastMsg?.content || '').trim().replace(/\s+/g, ' ').slice(0, 120);
      return {
        id: c.id,
        title,
        updatedAt: c.updatedAt,
        messageCount: c.messages.length,
        preview,
      };
    });
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations]);

  const ensureConversationExists = useCallback((): string | null => {
    if (!projectId || !project) return null;
    if (project.conversations && project.conversations.length > 0) return project.conversations[0].id;
    const newId = `conv-${Date.now()}`;
    updateProject(projectId, {
      conversations: [
        {
          id: newId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
    });
    return newId;
  }, [projectId, project, updateProject]);

  const handleNewChat = useCallback(() => {
    if (!projectId || !project) return;
    const newId = `conv-${Date.now()}`;
    const nextConversations: ProjectConversation[] = [
      {
        id: newId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      ...(project.conversations || []),
    ];
    updateProject(projectId, { conversations: nextConversations });
    setActiveConversationId(newId);
    setLocalChatHistory([]);
    setInput('');
    setIsAIThinking(false);
  }, [projectId, project, updateProject]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  // Track scroll for header border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sending messages
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const activeId = activeConversationId || ensureConversationExists();
    if (!activeId || !projectId || !project) return;

    const newMsgId = Date.now().toString();
    const userInput = input.trim();

    const persistConversationMessages = (messages: ChatMessage[]) => {
      const nextConversations = (project.conversations || []).some((c) => c.id === activeId)
        ? (project.conversations || []).map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  messages: messages.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp,
                    citations: m.citations,
                  })),
                  updatedAt: Date.now(),
                }
              : c
          )
        : [
            {
              id: activeId,
              messages: messages.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.timestamp,
                citations: m.citations,
              })),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...(project.conversations || []),
          ];

      updateProject(projectId, { conversations: nextConversations });
    };

    // Check if it's a quick action command
    const isInfoGraphic = userInput.includes('信息图');
    const isPPT = userInput.includes('PPT') || userInput.includes('演示文稿');
    const isMindMap = userInput.includes('思维导图');

    // Add user message
    const userMessage: ChatMessage = {
      id: newMsgId,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    setLocalChatHistory((prev) => {
      const next = [...prev, userMessage];
      persistConversationMessages(next);
      return next;
    });

    setInput('');
    setIsAIThinking(true);

    // If it's a quick action, create loading file
    if (isInfoGraphic || isPPT || isMindMap) {
      const fileId = Date.now();
      const fileType = isInfoGraphic ? 'infographic' : isPPT ? 'ppt' : 'mindmap';
      const fileName = isInfoGraphic ? '信息图' : isPPT ? 'PPT演示文稿' : '思维导图';

      // Create loading file
      const newNote: Note = {
        id: fileId,
        type: 'note',
        title: fileName,
        content: '',
        tags: ['Generating'],
        date: 'Just now',
        isLoading: true,
        fileType: fileType as 'infographic' | 'ppt' | 'mindmap',
        isNew: true,
        createdBy: 'agent',
      };
      setLocalNotes((prev) => [newNote, ...prev]);

      // Show assistant message
      setTimeout(() => {
        setIsAIThinking(false);
        const assistantMessage: ChatMessage = {
          id: (parseInt(newMsgId) + 1).toString(),
          role: 'assistant',
          content: '文件生成中，生成完成后你可以在文件树中查看、这期间可以继续对话',
          timestamp: new Date(),
          citations: [],
        };
        setLocalChatHistory((prev) => {
          const next = [...prev, assistantMessage];
          persistConversationMessages(next);
          return next;
        });
      }, 500);

      // After 5 seconds, remove loading state
      setTimeout(() => {
        setLocalNotes((prev) =>
          prev.map((note) =>
            note.id === fileId
              ? {
                  ...note,
                  isLoading: false,
                  tags: note.tags
                    .filter((t) => t !== 'Generating')
                    .concat([fileType === 'infographic' ? 'InfoGraphic' : fileType === 'ppt' ? 'PPT' : 'MindMap']),
                }
              : note
          )
        );
      }, 5000);
    } else {
      // Normal chat flow
      setTimeout(() => {
        setIsAIThinking(false);
        const assistantMessage: ChatMessage = {
          id: (parseInt(newMsgId) + 1).toString(),
          role: 'assistant',
          content: '好的，我已经捕捉到了这个关键信息。这是一条非常有价值的洞察，我已将其整理为新的笔记卡片。',
          timestamp: new Date(),
          citations: [],
        };
        setLocalChatHistory((prev) => {
          const next = [...prev, assistantMessage];
          persistConversationMessages(next);
          return next;
        });

        const newNote: Note = {
          id: Date.now(),
          type: 'note',
          title: 'User Insight',
          content: userInput,
          tags: ['New'],
          date: 'Just now',
          isNew: true,
          createdBy: 'agent',
        };
        setLocalNotes((prev) => [newNote, ...prev]);
      }, 800);
    }
  }, [input, activeConversationId, ensureConversationExists, projectId, project, updateProject]);

  // File tree operations
  const handleCreateNote = useCallback((parentId?: string | number) => {
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
      createdBy: 'user',
    };
    setLocalNotes((prev) => [newNote, ...prev]);
    setActiveItem({ id: newId, type: 'note', data: newNote });
    setShowEditor(true);
  }, []);

  const handleCreateFolder = useCallback((parentId?: string | number) => {
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
      createdBy: 'user',
    };
    setLocalNotes((prev) => [newFolder, ...prev]);
  }, []);

  const handleDeleteNote = useCallback(
    (id: string | number) => {
      setLocalNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeItem?.id === id) {
        setActiveItem(null);
        setShowEditor(false);
      }
    },
    [activeItem]
  );

  const handleRenameNote = useCallback((id: string | number, newTitle: string) => {
    setLocalNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title: newTitle } : n)));
  }, []);

  const handleToggleFolder = useCallback((id: string | number) => {
    setLocalNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isExpanded: !n.isExpanded } : n)));
  }, []);

  const handleNoteUpdate = useCallback((noteId: string | number, updates: Partial<Note>) => {
    setLocalNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...updates } : n)));
    setActiveItem((prev) => {
      if (!prev || prev.id !== noteId || prev.type === 'source') return prev;
      const updatedData = { ...(prev.data as Note), ...updates };
      return { ...prev, data: updatedData } as ActiveItem;
    });
  }, []);

  const handleItemSelect = useCallback((item: ActiveItem) => {
    setActiveItem(item);
    setShowEditor(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false);
    setActiveItem(null);
  }, []);

  const handleSave = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (source: DataSource) => (e: React.DragEvent) => {
      setDraggedSource(source);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', source.id);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedSource(null);
    setIsDraggingOverInput(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverInput(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOverInput(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOverInput(false);

      if (draggedSource) {
        setInput(`基于 ${draggedSource.name}，`);
        inputRef.current?.focus();
      }

      setDraggedSource(null);
    },
    [draggedSource]
  );

  const handleFilesChangeWrapper = useCallback(
    (files: typeof attachedFiles) => {
      handleFilesChange(files);
      setIsAddFilesModalOpen(false);
    },
    [handleFilesChange]
  );

  // Breadcrumb data
  const breadcrumbItems = [
    { label: 'Project', path: '/?view=projects' },
    { label: project?.name || 'Project', path: `/project/${projectId}` },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAF9] font-sans text-[#1A1A1A] overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Left Navigation Sidebar */}
      <PrimarySidebar
        activeView={activeView}
        setActiveView={(view) => {
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
            'flex-shrink-0 h-16 flex items-center justify-between px-8 z-40 transition-all duration-300',
            'bg-white/60 backdrop-blur-md',
            isScrolled && 'border-b border-gray-200/50'
          )}
        >
          <div className="flex items-center gap-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="flex items-center gap-2">
            {/* Panel Toggle Buttons */}
            <div className="flex items-center gap-1 mx-2 px-2 py-1 bg-white/50 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setShowSources(!showSources)}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  showSources
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
                title={showSources ? 'Hide Sources' : 'Show Sources'}
              >
                <PanelLeft size={16} />
              </button>
              <button
                onClick={() => setShowStudio(!showStudio)}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  showStudio
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                )}
                title={showStudio ? 'Hide Studio' : 'Show Studio'}
              >
                <PanelRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Project */}
        <main className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden min-h-0">
          {/* === Left Panel: File Tree === */}
          <motion.div
            initial={false}
            animate={{
              width: showSources ? 280 : 0,
              opacity: showSources ? 1 : 0,
              marginRight: showSources ? 0 : -24,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
          >
            <FileTreePanel
              sources={sources}
              notes={localNotes}
              activeItem={activeItem}
              onItemSelect={handleItemSelect}
              onCreateNote={handleCreateNote}
              onCreateFolder={handleCreateFolder}
              onDeleteNote={handleDeleteNote}
              onRenameNote={handleRenameNote}
              onToggleFolder={handleToggleFolder}
              onOpenAddFilesModal={() => setIsAddFilesModalOpen(true)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          </motion.div>

          {/* === Center Panel: Editor === */}
          <motion.div
            initial={false}
            animate={{
              flex: showEditor ? 1 : 0,
              width: showEditor ? 'auto' : 0,
              opacity: showEditor ? 1 : 0,
              marginRight: showEditor ? 0 : -24,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden relative"
          >
            <EditorPanel
              activeItem={activeItem}
              onClose={handleCloseEditor}
              onNoteUpdate={handleNoteUpdate}
              onSave={handleSave}
            />
          </motion.div>

          {/* === Right Panel: Chat === */}
          <motion.div
            initial={false}
            animate={{
              flex: 1,
              maxWidth: !showEditor && !showSources ? '1200px' : '100%',
              marginLeft: !showEditor && !showSources ? 'auto' : 0,
              marginRight: !showEditor && !showSources ? 'auto' : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
          >
            <ChatPanel
              chatHistory={localChatHistory}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isAIThinking={isAIThinking}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              chatbotMode={chatbotMode}
              onModeChange={setChatbotMode}
              conversations={conversationSummaries}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
              isDraggingOverInput={isDraggingOverInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isCompact={!showEditor}
            />
          </motion.div>
        </main>
      </div>

      {/* Add Files Modal */}
      <UnifiedAddFilesModal
        open={isAddFilesModalOpen}
        onOpenChange={setIsAddFilesModalOpen}
        onFilesChange={handleFilesChangeWrapper}
        libraryArtifacts={MOCK_LIBRARY_ARTIFACTS}
        initialFiles={attachedFiles}
      />
    </div>
  );
}
