import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { ViewMode, Message, Artifact, ArtifactStatus, AppType, LibraryArtifact, KnowledgeCollection, KnowledgeItem, ChatMode, MentionedAsset } from '@/types';
import { MOCK_FULL_CHATS, MOCK_LIBRARY_ARTIFACTS, MOCK_KNOWLEDGE_COLLECTIONS, MOCK_KNOWLEDGE_ITEMS, MOCK_HISTORY } from '@/data/mock';
import { Sidebar } from '@/components/Sidebar';
import { PrimarySidebar } from '@/components/PrimarySidebar';
import { ChatView } from '@/components/ChatView';
import { WorkspaceHub } from '@/components/workspace/WorkspaceHub';
import { LibraryView } from '@/components/library/LibraryView';
import { MOCK_AGENT_INTEL_DATA } from '@/data/mock';
import { MOCK_PROJECTS } from '@/data/mockProject';
import { ProjectData, AttachedFile } from '@/types/project';
import { useProjects } from '@/context/ProjectContext';
import { SearchModal } from '@/components/SearchModal';
import { ArtifactCanvas } from '@/components/ArtifactCanvas';
import { NewProjectModal } from '@/components/NewProjectModal';
import { useOnboarding } from '@/hooks/use-onboarding';
import { getSessionContext, buildSystemPrompt, createMockContextData } from '@/lib/context-bus';
import { toast } from '@/hooks/use-toast';
import { appRegistry } from '@/lib/app-registry';

// Mock outputs
const MOCK_OUTPUTS = {
  framia: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop',
  enter: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
  hunter: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
  combos: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
};

// Multiple outputs for Framia (multiple generated images)
const MOCK_FRAMIA_OUTPUTS = [
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1200&auto=format&fit=crop',
];

// App configurations
const APP_CONFIG: Record<string, { type: AppType; editUrl: string }> = {
  Framia: { type: 'framia', editUrl: 'https://framia.pro/project/6b9df416-353c-4293-94cb-da1ea22bffd8' },
  Enter: { type: 'enter', editUrl: 'https://enter.pro/project/demo-calculator' },
  Hunter: { type: 'hunter', editUrl: 'https://hunter.pro/report/demo' },
  Combos: { type: 'combos', editUrl: 'https://combos.pro/workflow/demo' },
};

// Intro texts per app
const INTRO_TEXTS: Record<AppType, string> = {
  framia: '我将使用 Framia 完成你的设计任务',
  enter: '我将使用 Enter 为你构建软件应用',
  hunter: '我将使用 Hunter 帮你搜索和分析信息',
  combos: '我将使用 Combos 处理你的工作流程',
};

// Follow-up texts per app
const FOLLOW_UP_TEXTS: Record<AppType, string> = {
  framia: `设计已完成！你可以：
• 在右侧 Canvas 中查看完整效果
• 点击 "Edit in Framia" 进行更多定制
• 告诉我需要修改的地方
• 下载为 PNG/PDF 格式

需要我帮你做什么调整吗？`,
  enter: `应用已构建完成！你可以：
• 在右侧 Canvas 中预览应用
• 点击 "Open in Enter" 继续编辑代码
• 告诉我需要添加的功能
• 部署到线上环境

需要我帮你做什么调整吗？`,
  hunter: `报告已生成！你可以：
• 在右侧 Canvas 中查看完整报告
• 导出为 PDF 或 Excel
• 告诉我需要深入分析的部分

还需要了解什么信息吗？`,
  combos: `工作流程已完成！你可以：
• 在右侧 Canvas 中查看结果
• 保存为模板以便复用
• 调整参数重新运行

需要我帮你做什么调整吗？`,
};

export default function Index() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewMode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Chat Mode State
  const [chatMode, setChatMode] = useState<ChatMode>('default');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { projects, addProject, updateProject: updateProjectInContext } = useProjects();
  
  // Chat History State (with projectId support)
  const [chatHistory, setChatHistory] = useState<Array<{ id: string; title: string; time: string; projectId?: string }>>(MOCK_HISTORY);
  
  // New Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Artifacts State (replaces single Framia state)
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  
  // Mentioned Assets State
  const [mentionedAssets, setMentionedAssets] = useState<MentionedAsset[]>([]);
  
  // Library State
  const [libraryArtifacts, setLibraryArtifacts] = useState<LibraryArtifact[]>(MOCK_LIBRARY_ARTIFACTS);
  const [knowledgeCollections, setKnowledgeCollections] = useState<KnowledgeCollection[]>(MOCK_KNOWLEDGE_COLLECTIONS);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE_ITEMS);
  
  // Track sidebar state before Canvas opened
  const [sidebarStateBeforeCanvas, setSidebarStateBeforeCanvas] = useState(true);

  // Computed: is Canvas open?
  const isCanvasOpen = artifacts.length > 0;

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadChatHistory = (chatId: string) => {
    if (!chatId) {
      // Clear chat
      setActiveChatId(null);
      setMessages([]);
      return;
    }
    setActiveChatId(chatId);
    setMessages(MOCK_FULL_CHATS[chatId] || []);
    setActiveView('chat');
    // Reset artifacts when loading history
    setArtifacts([]);
    setActiveArtifactId(null);
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setActiveView('chat');
    setChatMode('default');
    setActiveProjectId(null);
    // Reset artifacts
    setArtifacts([]);
    setActiveArtifactId(null);
  };

  const handleSendMessage = (text = inputValue, selectedApp?: { name: string; icon: string } | null) => {
    if (!text.trim() && mentionedAssets.length === 0) return;

    // Parse @App mentions from text
    const mentionPattern = /@(\w+)/g;
    const mentions: Array<{ name: string; icon: string }> = [];
    let match;
    
    while ((match = mentionPattern.exec(text)) !== null) {
      const appName = match[1];
      const app = appRegistry.getByName(appName);
      if (app) {
        mentions.push({ name: app.name, icon: app.icon });
      }
    }

    // Determine which app to use:
    // 1. selectedApp (from old badge system, for backward compatibility)
    // 2. First @mention in text
    const appToUse = selectedApp || (mentions.length > 0 ? mentions[0] : null);

    // Create user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: text,
      selectedApp: appToUse || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setShowMentionMenu(false);
    
    // Clear mentioned assets after sending
    setMentionedAssets([]);

    // Check if an app was selected or mentioned
    if (appToUse && APP_CONFIG[appToUse.name]) {
      startAppFlow(appToUse.name, appToUse.icon, text);
    } else {
      // Normal response flow
      simulateNormalResponse(text);
    }
  };

  const startAppFlow = (appName: string, appIcon: string, userPrompt: string) => {
    const config = APP_CONFIG[appName];
    if (!config) return;

    // **CONTEXT BUS INTEGRATION**
    // Step 1: Collect context from all completed artifacts in current session
    const sessionContext = getSessionContext(artifacts);
    
    // Step 2: Build system prompt with context (for production API call)
    const systemPrompt = buildSystemPrompt(sessionContext, config.type);
    
    // Log context for debugging (in production, this would be sent to the App API)
    if (sessionContext.length > 0) {
      console.log('[Context Bus] Available context:', sessionContext);
      console.log('[Context Bus] System prompt:', systemPrompt);
    }

    const artifactId = `artifact-${Date.now()}`;
    const messageId = `msg-${Date.now() + 1}`;

    // Create artifact
    const newArtifact: Artifact = {
      id: artifactId,
      appType: config.type,
      appName: appName,
      appIcon: appIcon,
      status: 'thinking',
      title: userPrompt.slice(0, 30),
      createdAt: Date.now(),
      messageId: messageId,
      editUrl: config.editUrl,
      // Context will be added when completed
    };

    // Auto-collapse sidebar when Canvas opens (if first artifact)
    if (artifacts.length === 0) {
      setSidebarStateBeforeCanvas(isSidebarOpen);
      setIsSidebarOpen(false);
    }

    // Add artifact and set as active
    setArtifacts(prev => [...prev, newArtifact]);
    setActiveArtifactId(artifactId);

    // Create assistant message with context snapshot
    setTimeout(() => {
      const appResponseMsg: Message = {
        id: messageId,
        role: 'assistant',
        type: 'app-response',
        content: '',
        artifactId: artifactId,
        appData: {
          appType: config.type,
          appName: appName,
          appIcon: appIcon,
          status: 'thinking',
          introText: INTRO_TEXTS[config.type],
          followUpText: FOLLOW_UP_TEXTS[config.type],
        },
        contextSnapshot: sessionContext  // Store context at message creation time
      };
      setMessages(prev => [...prev, appResponseMsg]);
    }, 500);

    // Progress through states
    setTimeout(() => {
      updateArtifactStatus(artifactId, 'generating');
    }, 2500);

    setTimeout(() => {
      updateArtifactStatus(artifactId, 'building');
    }, 4500);

    // Complete and add context data
    setTimeout(() => {
      const output = MOCK_OUTPUTS[config.type];
      
      // For Framia, use multiple outputs; for others, use single output
      const artifactUpdate = config.type === 'framia'
        ? { outputs: MOCK_FRAMIA_OUTPUTS, output: MOCK_FRAMIA_OUTPUTS[0] } // First image as primary output for backward compatibility
        : { output };
      
      // **CONTEXT BUS: Generate context data for this artifact**
      const contextData = createMockContextData({
        id: artifactId,
        appType: config.type,
        appName: appName,
        appIcon: appIcon,
        status: 'completed',
        title: userPrompt.slice(0, 30),
        createdAt: Date.now(),
        messageId: messageId,
        editUrl: config.editUrl,
        output: config.type === 'framia' ? MOCK_FRAMIA_OUTPUTS[0] : output
      }, userPrompt);
      
      // Update artifact with output(s) AND context data
      setArtifacts(prev => prev.map(a => 
        a.id === artifactId 
          ? { ...a, status: 'completed', ...artifactUpdate, contextData } 
          : a
      ));

      // Update message status
      setMessages(prev => prev.map(msg => 
        msg.artifactId === artifactId && msg.appData
          ? { ...msg, appData: { ...msg.appData, status: 'completed' } }
          : msg
      ));

      // Auto-save to Library
      const completedArtifact = {
        id: artifactId,
        appType: config.type,
        appName: appName,
        appIcon: appIcon,
        status: 'completed' as ArtifactStatus,
        title: userPrompt.slice(0, 30),
        createdAt: Date.now(),
        messageId: messageId,
        editUrl: config.editUrl,
        ...artifactUpdate,
        contextData: contextData
      };
      saveToLibrary(completedArtifact, config.type === 'framia' ? MOCK_FRAMIA_OUTPUTS[0] : output);
    }, 6500);
  };

  const updateArtifactStatus = (id: string, status: ArtifactStatus, output?: string) => {
    setArtifacts(prev => prev.map(a => 
      a.id === id ? { ...a, status, output: output || a.output } : a
    ));

    // Also update the linked message
    setMessages(prev => prev.map(msg => 
      msg.artifactId === id && msg.appData
        ? { ...msg, appData: { ...msg.appData, status } }
        : msg
    ));
  };

  // Save completed artifact to Library
  const saveToLibrary = (artifact: Artifact, output: string) => {
    const libId = `lib-${artifact.id}`;
    
    // Check if already saved
    const alreadySaved = libraryArtifacts.some(item => item.id === libId);
    if (alreadySaved) return;

    // Get type mapping
    const getTypeFromApp = (appType: AppType): LibraryArtifact['type'] => {
      if (appType === 'framia') return 'image';
      if (appType === 'enter') return 'code';
      if (appType === 'hunter') return 'document';
      if (appType === 'combos') return 'workflow';
      return 'image';
    };

    // Extract prompt from messages
    const relatedMessage = messages.find(m => m.artifactId === artifact.id);
    const userMessage = relatedMessage 
      ? messages[messages.indexOf(relatedMessage) - 1]
      : null;
    const prompt = userMessage?.content || artifact.title;

    // Get session title (from active chat or default)
    const sessionTitle = activeChatId 
      ? `Chat ${activeChatId}`
      : 'New Chat';

    const libraryItem: LibraryArtifact = {
      id: libId,
      type: getTypeFromApp(artifact.appType),
      title: artifact.title,
      thumbnail: output,
      content: output,
      appType: artifact.appType,
      appName: artifact.appName,
      appIcon: artifact.appIcon,
      createdAt: artifact.createdAt || Date.now(),
      sessionId: activeChatId || 'new-chat',
      sessionTitle,
      prompt,
      usedCount: 0,
      isDeleted: false
    };

    setLibraryArtifacts(prev => [libraryItem, ...prev]);
  };

  const closeArtifact = (id: string) => {
    setArtifacts(prev => {
      const newArtifacts = prev.filter(a => a.id !== id);
      
      // If closing active artifact, switch to another or close Canvas
      if (activeArtifactId === id) {
        if (newArtifacts.length > 0) {
          setActiveArtifactId(newArtifacts[newArtifacts.length - 1].id);
        } else {
          setActiveArtifactId(null);
          // Restore sidebar state when all artifacts closed
          setIsSidebarOpen(sidebarStateBeforeCanvas);
        }
      }
      
      return newArtifacts;
    });
  };

  // Open or reopen an artifact from a message
  const openArtifactFromMessage = (message: Message) => {
    if (!message.artifactId || !message.appData) return;
    
    // Check if artifact already exists
    const existingArtifact = artifacts.find(a => a.id === message.artifactId);
    
    if (existingArtifact) {
      // Just switch to it
      setActiveArtifactId(existingArtifact.id);
    } else {
      // Recreate the artifact from message data
      const config = APP_CONFIG[message.appData.appName];
      if (!config) return;

      // Auto-collapse sidebar when Canvas opens (if first artifact)
      if (artifacts.length === 0) {
        setSidebarStateBeforeCanvas(isSidebarOpen);
        setIsSidebarOpen(false);
      }

      const reopenedArtifact: Artifact = {
        id: message.artifactId,
        appType: message.appData.appType,
        appName: message.appData.appName,
        appIcon: message.appData.appIcon,
        status: message.appData.status,
        title: 'Reopened artifact',
        createdAt: Date.now(),
        messageId: message.id,
        editUrl: config.editUrl,
        output: MOCK_OUTPUTS[message.appData.appType], // Use mock output for completed
        ...(message.appData.appType === 'framia' 
          ? { outputs: MOCK_FRAMIA_OUTPUTS, output: MOCK_FRAMIA_OUTPUTS[0] }
          : {}),
      };

      setArtifacts(prev => [...prev, reopenedArtifact]);
      setActiveArtifactId(reopenedArtifact.id);
    }
  };

  const closeAllArtifacts = () => {
    setArtifacts([]);
    setActiveArtifactId(null);
    // Restore sidebar state
    setIsSidebarOpen(sidebarStateBeforeCanvas);
  };

  // Open artifact from Library
  const openArtifactFromLibrary = (libraryItem: LibraryArtifact) => {
    // Switch to chat view
    setActiveView('chat');

    // Check if this artifact is already in Canvas
    const artifactId = libraryItem.id.replace('lib-', '');
    const existingArtifact = artifacts.find(a => a.id === artifactId || a.id === libraryItem.id);
    
    if (existingArtifact) {
      // Just switch to it
      setActiveArtifactId(existingArtifact.id);
      return;
    }

    // Auto-collapse sidebar when Canvas opens (if first artifact)
    if (artifacts.length === 0) {
      setSidebarStateBeforeCanvas(isSidebarOpen);
      setIsSidebarOpen(false);
    }

    // Create artifact from library item
    const config = APP_CONFIG[libraryItem.appName];
    const reopenedArtifact: Artifact = {
      id: libraryItem.id,
      appType: libraryItem.appType,
      appName: libraryItem.appName,
      appIcon: libraryItem.appIcon,
      status: 'completed',
      title: libraryItem.title,
      createdAt: libraryItem.createdAt,
      messageId: libraryItem.sessionId,
      editUrl: config?.editUrl,
      output: libraryItem.content,
      ...(libraryItem.appType === 'framia' 
        ? { outputs: MOCK_FRAMIA_OUTPUTS, output: MOCK_FRAMIA_OUTPUTS[0] }
        : {}),
    };

    setArtifacts(prev => [...prev, reopenedArtifact]);
    setActiveArtifactId(reopenedArtifact.id);

    // Update used count
    setLibraryArtifacts(prev => prev.map(item =>
      item.id === libraryItem.id
        ? { ...item, usedCount: item.usedCount + 1 }
        : item
    ));
  };

  // Toggle Global Context for a collection
  const toggleGlobalContext = (collectionId: string) => {
    setKnowledgeCollections(prev => prev.map(col =>
      col.id === collectionId
        ? { ...col, isGlobalContext: !col.isGlobalContext, updatedAt: Date.now() }
        : col
    ));
  };

  // Library handlers
  const handleTraceBack = (sessionId: string) => {
    setChatMode('default');
    loadChatHistory(sessionId);
  };

  const handleChatWithAsset = (artifact: LibraryArtifact) => {
    setChatMode('default');
    startNewChat();
    // Pre-load artifact context (in production, this would attach context to the first message)
    // For now, we'll just switch to chat mode
    setTimeout(() => {
      // In production, you would inject the artifact context here
      console.log('Chat with asset:', artifact);
    }, 100);
  };

  const handleViewAsset = (artifact: LibraryArtifact) => {
    // Open artifact in Canvas
    openArtifactFromLibrary(artifact);
  };

  // Project handlers
  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    setChatMode('project');
    setActiveChatId(null);
    setMessages([]);
    setArtifacts([]);
    setActiveArtifactId(null);
  };

  const handleNewProject = () => {
    // Open new project modal
    setIsNewProjectModalOpen(true);
  };

  // Create project from Chat page - stay in chat mode
  const handleCreateProjectFromChat = (name: string, files: AttachedFile[]) => {
    // Create new project
    const newProject: ProjectData = {
      id: `project-${Date.now()}`,
      name,
      type: 'note',
      sourcesCount: files.length,
      lastModified: new Date(),
      status: 'draft',
      description: files.length > 0 ? `${files.length} document${files.length > 1 ? 's' : ''} attached` : undefined,
      attachedFiles: files,
    };
    
    addProject(newProject);
    
    // Show toast notification
    toast({
      title: "Project created",
      description: `"${name}" has been created successfully`,
    });
    
    // Set as active project and switch to project chat mode
    setActiveProjectId(newProject.id);
    setChatMode('project');
  };

  // Create project from Projects page - navigate to Desk
  const handleCreateProjectFromProjects = (name: string, files: AttachedFile[]) => {
    // Create new project
    const newProject: ProjectData = {
      id: `project-${Date.now()}`,
      name,
      type: 'note',
      sourcesCount: files.length,
      lastModified: new Date(),
      status: 'draft',
      description: files.length > 0 ? `${files.length} document${files.length > 1 ? 's' : ''} attached` : undefined,
      attachedFiles: files,
    };
    
    addProject(newProject);
    
    // Show toast notification
    toast({
      title: "Project created",
      description: `"${name}" has been created successfully`,
    });
    
    // Navigate to Desk page
    navigate(`/project/${newProject.id}`);
  };

  // Determine which callback to use based on current view
  const handleCreateProject = activeView === 'projects' 
    ? handleCreateProjectFromProjects 
    : handleCreateProjectFromChat;

  const handleUpdateProject = (updates: Partial<ProjectData>) => {
    if (!activeProjectId) return;
    updateProjectInContext(activeProjectId, updates);
  };

  const handleToggleKnowledge = (knowledgeId: string) => {
    if (!activeProjectId) return;
    const currentProject = projects.find(p => p.id === activeProjectId);
    if (!currentProject) return;

    const currentKnowledgeIds = currentProject.knowledgeIds || [];
    const newKnowledgeIds = currentKnowledgeIds.includes(knowledgeId)
      ? currentKnowledgeIds.filter(id => id !== knowledgeId)
      : [...currentKnowledgeIds, knowledgeId];

    handleUpdateProject({ knowledgeIds: newKnowledgeIds.length > 0 ? newKnowledgeIds : undefined });
  };

  const handleFilesChange = (files: import('@/types/project').AttachedFile[]) => {
    if (!activeProjectId) return;
    handleUpdateProject({ attachedFiles: files });
  };

  // Chat archiving handler
  const handleArchiveChat = (chatId: string, projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const chat = chatHistory.find(c => c.id === chatId);
    
    if (!project || !chat) return;
    
    // Update chat's projectId
    setChatHistory(prev => prev.map(c => 
      c.id === chatId ? { ...c, projectId } : c
    ));
    
    // Show toast notification
    toast({
      title: "Chat archived",
      description: `"${chat.title}" moved to ${project.name}`,
    });
    
    // If the archived chat was active, clear it
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  };

  // Get current project
  const currentProject = activeProjectId 
    ? projects.find(p => p.id === activeProjectId)
    : null;

  const simulateNormalResponse = (text: string) => {
    setTimeout(() => {
      if (text.includes('图') || text.includes('画') || text.includes('image')) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1620641788427-b9f4dbf2700f?q=80&w=1200&auto=format&fit=crop',
          agentName: 'Visual Artist'
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          type: 'text',
          content: 'Here is the information you requested. I can help you refine this further or convert it into a document format if needed.'
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    }, 800);
  };

  const handleInputCheck = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.endsWith('@')) {
      setShowMentionMenu(true);
    } else if (!val.includes('@') && showMentionMenu) {
      setShowMentionMenu(false);
    }
  };

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
    if (!isSidebarOpen && !isCanvasOpen) {
      setIsSidebarOpen(true);
    }
    // Close Canvas when changing views
    if (view !== 'chat') {
      closeAllArtifacts();
    }
  };

  // Get current artifact status for ChatView
  const currentArtifact = artifacts.find(a => a.id === activeArtifactId);
  const currentArtifactStatus = currentArtifact?.status || 'idle';

  // Secondary sidebar visible for chat view (can be shown even with Canvas open)
  const showSecondarySidebar = activeView === 'chat';

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-800 font-sans antialiased overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Primary Sidebar (Always Visible) */}
      <PrimarySidebar 
        activeView={activeView} 
        setActiveView={handleViewChange}
        recentProjects={MOCK_PROJECTS}
        onProjectClick={(projectId) => {
          navigate(`/project/${projectId}`);
          setActiveView('projects');
        }}
        onLogoClick={startNewChat}
      />

      {/* Secondary Sidebar - For Chat view */}
      {showSecondarySidebar && (
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          activeView={activeView} 
          setActiveView={setActiveView} 
          loadChatHistory={loadChatHistory} 
          startNewChat={startNewChat} 
          activeChatId={activeChatId} 
          setIsSearchOpen={setIsSearchOpen}
          chatMode={chatMode}
          setChatMode={setChatMode}
          projects={projects}
          onProjectClick={handleProjectClick}
          onNewProject={handleNewProject}
          activeProjectId={activeProjectId}
          chatHistory={chatHistory}
          onArchiveChat={handleArchiveChat}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative bg-[#FDFDFD]">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-[#FDFDFD]/80 backdrop-blur-md border-b border-gray-100/50">
          <div className="flex items-center gap-4">
            {/* Toggle Sidebar Button - show when sidebar is closed */}
            {showSecondarySidebar && !isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Open chat list"
              >
                <PanelLeft size={20} />
              </button>
            )}

            {/* Canvas indicator */}
            {isCanvasOpen && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-600">
                  {artifacts.length} artifact{artifacts.length > 1 ? 's' : ''} open
                </span>
              </div>
            )}
          </div>

        </header>

        {/* Content Area with Canvas Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat/Main View */}
          <div className={`flex-1 overflow-hidden transition-all duration-500 ${isCanvasOpen ? 'border-r border-gray-200' : ''}`}>
            {activeView === 'chat' && (
              <>
                {chatMode === 'library' && (
                  <LibraryView
                    artifacts={libraryArtifacts}
                    onTraceBack={handleTraceBack}
                    onChatWithAsset={handleChatWithAsset}
                    onViewAsset={handleViewAsset}
                  />
                )}
                {chatMode === 'project' && currentProject && (
                  <ChatView 
                    messages={messages} 
                    inputValue={inputValue} 
                    setInputValue={setInputValue} 
                    handleInputCheck={handleInputCheck} 
                    handleSendMessage={handleSendMessage} 
                    showMentionMenu={showMentionMenu} 
                    setShowMentionMenu={setShowMentionMenu} 
                    messagesEndRef={messagesEndRef} 
                    artifacts={artifacts}
                    activeArtifactId={activeArtifactId}
                    onOpenArtifact={openArtifactFromMessage}
                    isCanvasOpen={isCanvasOpen}
                    project={currentProject}
                    availableKnowledge={knowledgeCollections}
                    attachedFiles={currentProject?.attachedFiles}
                    onFilesChange={handleFilesChange}
                    libraryArtifacts={libraryArtifacts}
                    onUpdateProject={handleUpdateProject}
                  />
                )}
                {chatMode === 'default' && (
                  <ChatView 
                    messages={messages} 
                    inputValue={inputValue} 
                    setInputValue={setInputValue} 
                    handleInputCheck={handleInputCheck} 
                    handleSendMessage={handleSendMessage} 
                    showMentionMenu={showMentionMenu} 
                    setShowMentionMenu={setShowMentionMenu} 
                    messagesEndRef={messagesEndRef} 
                    artifacts={artifacts}
                    activeArtifactId={activeArtifactId}
                    onOpenArtifact={openArtifactFromMessage}
                    isCanvasOpen={isCanvasOpen}
                  />
                )}
              </>
            )}
            {activeView === 'projects' && (
              <WorkspaceHub
                projects={projects}
                onProjectClick={(projectId) => {
                  // Navigate to Studio page for the project
                  navigate(`/project/${projectId}`);
                }}
                onNewProject={handleNewProject}
                onNewChat={() => {
                  setActiveView('chat');
                  startNewChat();
                }}
                onImportFile={() => {
                  // Trigger file import
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.click();
                }}
              />
            )}
            {activeView === 'settings' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚙️</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
                  <p className="text-gray-500">Settings & Preferences - Coming Soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Artifact Canvas (Conditionally Rendered) */}
          {isCanvasOpen && (
            <ArtifactCanvas 
              artifacts={artifacts}
              activeArtifactId={activeArtifactId}
              onSetActiveArtifact={setActiveArtifactId}
              onCloseArtifact={closeArtifact}
              onCloseAll={closeAllArtifacts}
            />
          )}
        </div>
      </main>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      
      {/* New Project Modal */}
      <NewProjectModal
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
        onCreateProject={handleCreateProject}
        libraryArtifacts={libraryArtifacts}
      />
    </div>
  );
}
