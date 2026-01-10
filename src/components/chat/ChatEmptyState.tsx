import React from 'react';
import { Sparkles, Palette, Code, Search, Workflow, Settings, FileText, PenTool, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InputArea } from './InputArea';
import { AppRecommendation } from '../app-selection/AppRecommendation';
import { appRegistry } from '@/lib/app-registry';
import { ArtifactContextData, KnowledgeCollection, AIModel, LibraryArtifact } from '@/types';
import type { AppRecommendation as AppRecommendationType } from '@/types/onboarding';
import { ProjectData, AttachedFile } from '@/types/project';
import { AddFilesButton } from './UnifiedAddFiles';
import { FloatingAgentBackground } from './FloatingAgentBackground';
import { ProjectSettingsModal } from './ProjectSettingsModal';

const APP_ICONS = {
  hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
  enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
  combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
  framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
};

const QUICK_ACTIONS = [
  { 
    id: 'design',
    icon: Palette, 
    label: 'Design Poster', 
    template: `@Framia Generate Poster for my café`, 
  },
  { 
    id: 'build',
    icon: Code, 
    label: 'Build App', 
    template: `@Enter Build a landing page for my startup`, 
  },
  { 
    id: 'research',
    icon: Search, 
    label: 'Research', 
    template: `@Hunter Research market trends for AI in 2026`, 
  },
  { 
    id: 'combos',
    icon: Workflow, 
    label: 'Combos', 
    template: `@Framia Generate a logo for my menswear brand "Converge", then use @Enter to build a modern website`, 
  },
];

interface ChatEmptyStateProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: (text?: string, app?: { name: string; icon: string; id?: string }) => void;
  selectedApp: { name: string; icon: string } | null;
  onSelectApp: (app: { name: string; icon: string; id: string }) => void;
  onRemoveApp: () => void;
  availableContext: ArtifactContextData[];
  recommendations: AppRecommendationType[];
  showRecommendations: boolean;
  onRecommendationSelect: (rec: AppRecommendationType) => void;
  onCloseRecommendations: () => void;
  isInputFocused: boolean;
  // Project mode props
  project?: ProjectData;
  availableKnowledge?: KnowledgeCollection[];
  attachedFiles?: AttachedFile[];
  onFilesChange?: (files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
  onUpdateProject?: (updates: Partial<ProjectData>) => void;
  placeholder?: string;
  // Model selector props
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
}

const PROJECT_QUICK_ACTIONS = [
  { id: 'summarize', label: 'Summarize updates', icon: FileText },
  { id: 'draft', label: 'Draft new section', icon: PenTool },
  { id: 'continue', label: 'Continue last discussion', icon: MessageSquare },
];

export function ChatEmptyState({
  inputValue,
  setInputValue,
  onSend,
  selectedApp,
  onSelectApp,
  onRemoveApp,
  availableContext,
  recommendations,
  showRecommendations,
  onRecommendationSelect,
  onCloseRecommendations,
  isInputFocused,
  project,
  availableKnowledge = [],
  attachedFiles = [],
  onFilesChange,
  libraryArtifacts = [],
  onUpdateProject,
  placeholder,
  selectedModel = 'claude-4.5',
  onModelChange,
}: ChatEmptyStateProps) {
  const navigate = useNavigate();
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Project mode: Show compact layout with Add Files button
  const isProjectMode = !!project;

  // Get all apps for the dock
  const allApps = React.useMemo(() => {
    try {
      return appRegistry.getAll().slice(0, 4);
    } catch (error) {
      console.error('Error getting apps from registry:', error);
      return [];
    }
  }, []);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    // Set the template text - @App mentions will be rendered as inline badges
    setInputValue(action.template);
    
    // Focus the editor after setting value
    setTimeout(() => {
      const editor = document.querySelector('[contenteditable="true"]') as HTMLElement;
      editor?.focus();
    }, 100);
  };

  const handleProjectQuickAction = (actionId: string) => {
    // Map project quick actions to prompts
    const actionPrompts: Record<string, string> = {
      summarize: `Summarize the latest updates and key insights from ${project?.name}`,
      draft: `Draft a new section for ${project?.name}`,
      continue: `Continue the last discussion about ${project?.name}`,
    };
    
    const prompt = actionPrompts[actionId] || '';
    if (prompt) {
      setInputValue(prompt);
      // Focus input after setting value
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        textarea?.focus();
      }, 100);
    }
  };

  // Count context sources for quick actions visibility
  const knowledgeCount = project?.knowledgeIds?.length || 0;
  const attachedFilesCount = attachedFiles.length || project?.attachedFileIds?.length || 0;
  const totalSources = knowledgeCount + attachedFilesCount;

  // Navigation handlers
  const handleOpenStudio = () => {
    if (project) {
      navigate(`/project/${project.id}`);
    }
  };

  // Project mode: Render compact layout
  if (isProjectMode && project) {
    return (
      <>
        <div ref={containerRef} className="min-h-full w-full flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-visible">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-10 min-h-[calc(100vh-120px)]">
            {/* Title and Subtitle */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                {project.name}
              </h1>
              <p className="text-lg text-gray-500">
                {project.description || 'Chat with your project data and get AI-powered insights'}
              </p>
            </div>

            {/* Toolbar Row: Add Files, Deep Work, Settings */}
            <div className="mb-6 flex items-center justify-center gap-3 relative z-20">
              {/* Add Files Button */}
              {onFilesChange && (
                <AddFilesButton
                  attachedFiles={attachedFiles}
                  onFilesChange={onFilesChange}
                  availableKnowledge={availableKnowledge}
                  libraryArtifacts={libraryArtifacts}
                />
              )}

              {/* Deep Work in Studio Button */}
              <button
                onClick={handleOpenStudio}
                className="h-7 px-4 rounded-full flex items-center gap-2 transition-all duration-200 bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 hover:border-indigo-300 text-xs font-medium"
              >
                <span>🚀</span>
                <span>Deep Work in Desk</span>
              </button>

              {/* Settings Button */}
              {onUpdateProject && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 hover:border-indigo-300"
                  title="Project Settings"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>

            {/* Input Area */}
            <div
              ref={inputContainerRef}
              className="w-full max-w-3xl relative mb-6 z-20"
            >
              <InputArea
                value={inputValue}
                onChange={setInputValue}
                onSend={onSend}
                selectedApp={selectedApp}
                onSelectApp={onSelectApp}
                onRemoveApp={onRemoveApp}
                availableContext={availableContext}
                placeholder={placeholder || `Chat with ${project.name} data...`}
                onMentionMenuOpenChange={setIsMentionMenuOpen}
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                attachedFiles={attachedFiles}
                onFilesChange={onFilesChange}
                libraryArtifacts={libraryArtifacts}
              />

              {/* App Recommendation */}
              {showRecommendations && isInputFocused && !isMentionMenuOpen && (
                <AppRecommendation
                  recommendations={recommendations}
                  isVisible={showRecommendations}
                  onSelect={onRecommendationSelect}
                  onClose={onCloseRecommendations}
                />
              )}
            </div>

            {/* Quick Actions - Only show if there are sources, placed below input */}
            {totalSources > 0 && (
              <div className="w-full max-w-3xl mt-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {PROJECT_QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleProjectQuickAction(action.id)}
                        className="px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50/80 transition-all text-xs font-medium text-gray-600 hover:text-indigo-700 flex items-center gap-1.5"
                      >
                        <Icon size={14} className="text-gray-500" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Settings Modal */}
        {onUpdateProject && (
          <ProjectSettingsModal
            project={project}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            onUpdate={onUpdateProject}
          />
        )}
      </>
    );
  }

  // Default mode: Generic welcome screen
  const [isInputHovered, setIsInputHovered] = React.useState(false);
  const [inputCenter, setInputCenter] = React.useState({ x: 0, y: 0 });

  // 更新输入框中心位置（相对于父容器）- 仅用于默认模式
  React.useEffect(() => {
    if (!isProjectMode) {
      const updateInputCenter = () => {
        if (inputContainerRef.current && containerRef.current) {
          const inputRect = inputContainerRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          setInputCenter({
            x: inputRect.left + inputRect.width / 2 - containerRect.left,
            y: inputRect.top + inputRect.height / 2 - containerRect.top,
          });
        }
      };

      const timer = setTimeout(updateInputCenter, 100);
      window.addEventListener('resize', updateInputCenter);
      window.addEventListener('scroll', updateInputCenter, true);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateInputCenter);
        window.removeEventListener('scroll', updateInputCenter, true);
      };
    }
  }, [isProjectMode]);

  return (
    <div ref={containerRef} className="min-h-full w-full flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-visible">
      {/* Floating Agent Background - Only for default mode */}
      {!isProjectMode && (
        <FloatingAgentBackground
          isInputFocused={isInputFocused}
          isInputHovered={isInputHovered}
          inputCenterX={inputCenter.x}
          inputCenterY={inputCenter.y}
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-10">
        {/* Welcome Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Converge ONE
            </h1>
          </div>
          <p className="text-lg text-gray-500 mt-2">
            The AI Workspace where Humans Lead and Expert Agents Work
          </p>
        </div>

        {/* Input Area */}
        <div
          ref={inputContainerRef}
          className="w-full max-w-3xl relative mb-6 z-20"
          onMouseEnter={() => setIsInputHovered(true)}
          onMouseLeave={() => setIsInputHovered(false)}
        >
          <InputArea
            value={inputValue}
            onChange={setInputValue}
            onSend={onSend}
            selectedApp={selectedApp}
            onSelectApp={onSelectApp}
            onRemoveApp={onRemoveApp}
            availableContext={availableContext}
            placeholder={placeholder || "What would you like to create?"}
            onMentionMenuOpenChange={setIsMentionMenuOpen}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            attachedFiles={attachedFiles}
            onFilesChange={onFilesChange}
            libraryArtifacts={libraryArtifacts}
          />

          {/* App Recommendation */}
          {showRecommendations && isInputFocused && !isMentionMenuOpen && (
            <AppRecommendation
              recommendations={recommendations}
              isVisible={showRecommendations}
              onSelect={onRecommendationSelect}
              onClose={onCloseRecommendations}
            />
          )}
        </div>

        {/* Quick Actions - 1x4 Outline Cards */}
        <div className="w-full max-w-3xl mb-4">
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex flex-col items-center justify-center gap-2 px-2 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-center group h-full"
                >
                  <Icon size={18} className="text-gray-500 group-hover:text-indigo-600 transition-colors" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium text-gray-700 leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
