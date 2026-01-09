import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, Edit3, PanelLeftClose, Package, Folder, Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { ViewMode, ChatMode } from '@/types';
import { MOCK_HISTORY } from '@/data/mock';
import { ProjectData } from '@/types/project';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  activeChatId: string | null;
  loadChatHistory: (id: string) => void;
  startNewChat: () => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  // New props for Library and Projects
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  projects: ProjectData[];
  onProjectClick: (projectId: string) => void;
  onNewProject: () => void;
  activeProjectId?: string | null;
  // Drag and drop props
  chatHistory?: Array<{ id: string; title: string; time: string; projectId?: string }>;
  onArchiveChat?: (chatId: string, projectId: string) => void;
}

interface SidebarItemProps {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  rightElement,
  className = '',
}: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
        ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="w-[18px] h-[18px] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[15px] font-medium">{label}</span>
      </div>
      {rightElement}
    </div>
  );
}

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeView,
  setActiveView,
  activeChatId,
  loadChatHistory,
  startNewChat,
  setIsSearchOpen,
  chatMode,
  setChatMode,
  projects,
  onProjectClick,
  onNewProject,
  activeProjectId,
  chatHistory = MOCK_HISTORY,
  onArchiveChat,
}: SidebarProps) {
  // Drag and drop state
  const [draggedChatId, setDraggedChatId] = useState<string | null>(null);
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Expanded projects state
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set());
  
  // Filter out chats that are already archived
  const recentChats = chatHistory.filter(chat => !chat.projectId);
  
  // Helper to get chats for a project
  const getProjectChats = (projectId: string) => {
    return chatHistory.filter(chat => chat.projectId === projectId);
  };
  
  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjectIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };
  
  const handleLibraryClick = () => {
    setChatMode('library');
    // Reset chat selection when switching to library
    if (activeChatId) {
      loadChatHistory(''); // Clear active chat
    }
  };

  const handleProjectClick = (projectId: string) => {
    setChatMode('project');
    onProjectClick(projectId);
    // Reset chat selection when switching to project
    if (activeChatId) {
      loadChatHistory(''); // Clear active chat
    }
  };

  const handleRecentChatClick = (chatId: string) => {
    setChatMode('default');
    loadChatHistory(chatId);
  };

  const handleNewChatClick = () => {
    setChatMode('default');
    startNewChat();
  };

  // Drag handlers for Recent chats
  const handleDragStart = (chatId: string) => (e: React.DragEvent) => {
    setDraggedChatId(chatId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', chatId);
  };

  const handleDragEnd = () => {
    setDraggedChatId(null);
    setDragOverProjectId(null);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // Drop handlers for Projects
  const handleDragOver = (projectId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverProjectId(projectId);
    
    // Auto-expand on hover (0.5s delay)
    if (!hoverTimeout) {
      const timeout = setTimeout(() => {
        // Auto-expand project when dragging over it
        setExpandedProjectIds(prev => {
          const newSet = new Set(prev);
          newSet.add(projectId);
          return newSet;
        });
      }, 500);
      setHoverTimeout(timeout);
    }
  };

  const handleDragLeave = () => {
    setDragOverProjectId(null);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const handleDrop = (projectId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedChatId && onArchiveChat) {
      onArchiveChat(draggedChatId, projectId);
    }
    
    setDraggedChatId(null);
    setDragOverProjectId(null);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div className={`
      h-full bg-[#F9F9F9] border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
      ${isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-r-0'}
    `}>
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={20} />
        </button>
      </div>

      {/* Top Actions Section */}
      <div className="px-2 space-y-0.5 mb-4">
        <SidebarItem
          icon={<Edit3 size={16} />}
          label="New Chat"
          onClick={handleNewChatClick}
        />
        <SidebarItem
          icon={<Search size={16} />}
          label="Search"
          onClick={() => setIsSearchOpen(true)}
        />
        <SidebarItem
          icon={<Package size={16} />}
          label="Library"
          active={chatMode === 'library'}
          onClick={handleLibraryClick}
        />
      </div>

      {/* Projects Section */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</span>
        <button
          onClick={onNewProject}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded transition-colors"
          title="New Project"
        >
          <Plus size={14} />
        </button>
      </div>
      
      <div className="px-2 space-y-0.5 mb-4">
        {projects.map(project => {
          const isDragOver = dragOverProjectId === project.id;
          const isDragging = draggedChatId !== null;
          const isExpanded = expandedProjectIds.has(project.id);
          const projectChats = getProjectChats(project.id);
          const hasChats = projectChats.length > 0;
          
          return (
            <div key={project.id} className="space-y-0.5">
              {/* Project Item */}
              <div
                onDragOver={handleDragOver(project.id)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(project.id)}
                className={`
                  group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                  ${chatMode === 'project' && activeProjectId === project.id 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'}
                  ${isDragOver ? 'bg-indigo-50 border-2 border-indigo-300 border-dashed' : ''}
                  ${isDragging && !isDragOver ? 'opacity-60' : ''}
                `}
              >
                <div className="flex items-center flex-1 min-w-0">
                  {/* Zone 1: 文件夹图标 (固定 20px) */}
                  <div className="w-5 flex items-center justify-center flex-shrink-0">
                    <Folder size={16} />
                  </div>

                  {/* Zone 2: 展开控制区 (固定 20px) */}
                  <div 
                    className="w-5 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectExpansion(project.id);
                    }}
                  >
                    <ChevronRight 
                      size={14} 
                      className={cn(
                        "text-gray-400 transition-transform hover:text-gray-600",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </div>

                  {/* Zone 3: 文字区 */}
                  <span 
                    className="text-[15px] font-medium truncate flex-1 ml-2 cursor-pointer"
                    onClick={() => {
                      handleProjectClick(project.id);
                      // 自动展开
                      setExpandedProjectIds(prev => new Set(prev).add(project.id));
                    }}
                  >
                    {project.name}
                  </span>
                </div>
              </div>

              {/* Nested chats - shown when expanded */}
              {isExpanded && (
                <div className="ml-5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {hasChats ? (
                    projectChats.map(chat => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setChatMode('project');
                          onProjectClick(project.id);
                          loadChatHistory(chat.id);
                        }}
                        className={`
                          group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
                          ${chatMode === 'project' && activeChatId === chat.id 
                            ? 'bg-gray-200 text-gray-900' 
                            : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-900'}
                          truncate
                        `}
                      >
                        <MessageSquare size={14} className="shrink-0" />
                        <span className="text-[13px] font-medium truncate">{chat.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400 italic select-none">
                      (No chats yet)
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-400 italic">
            No projects yet
          </div>
        )}
      </div>

      {/* Recents Section */}
      <div className="px-4 mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recents</span>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {recentChats.map(item => {
          const isDragging = draggedChatId === item.id;
          
          return (
            <div
              key={item.id}
              draggable
              onDragStart={handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onClick={() => handleRecentChatClick(item.id)}
              className={`
                group flex items-center justify-between px-3 py-2 rounded-lg cursor-move transition-all duration-200
                ${chatMode === 'default' && activeChatId === item.id 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'}
                ${isDragging ? 'opacity-50 scale-95' : ''}
                truncate
              `}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                  <MessageSquare size={16} />
                </div>
                <span className="text-[15px] font-medium truncate">{item.title}</span>
              </div>
            </div>
          );
        })}
        {recentChats.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-400 italic">
            No recent chats
          </div>
        )}
      </div>
    </div>
  );
}
