import React from 'react';
import { Sparkles, Palette, Code, Search, Workflow } from 'lucide-react';
import { InputArea } from './InputArea';
import { AppRecommendation } from '../app-selection/AppRecommendation';
import { appRegistry } from '@/lib/app-registry';
import { ArtifactContextData, KnowledgeCollection, AIModel } from '@/types';
import type { AppRecommendation as AppRecommendationType } from '@/types/onboarding';
import { ProjectData } from '@/types/project';
import { ProjectStatusCard } from './ProjectStatusCard';
import { FloatingAgentBackground } from './FloatingAgentBackground';
import { ContextPill } from './ContextPill';

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
    template: `Design a promotional poster for [Your Event/Product Name]

Style: Modern, minimalist
Color scheme: [Primary color] with [Accent color]
Include: Title, tagline, date/CTA, and logo placeholder
Size: 1080x1920 (Instagram Story)`, 
    app: 'framia',
  },
  { 
    id: 'build',
    icon: Code, 
    label: 'Build App', 
    template: `Build a landing page for [Your Product/Service]

Features needed:
- Hero section with headline and CTA
- Feature highlights (3-4 key benefits)
- Testimonials section
- Pricing table
- Contact form

Style: Clean, professional, mobile-responsive`, 
    app: 'enter',
  },
  { 
    id: 'research',
    icon: Search, 
    label: 'Research', 
    template: `Research market trends for [Industry/Topic]

Focus areas:
- Current market size and growth rate
- Key players and competitors
- Emerging trends and opportunities
- Target audience demographics
- Regional insights (focus on [Region])

Deliverable: Summary report with data visualizations`, 
    app: 'hunter',
  },
  { 
    id: 'automate',
    icon: Workflow, 
    label: 'Automate', 
    template: `Create an automation workflow for [Task Description]

Trigger: When [trigger event happens]
Actions:
1. [First action]
2. [Second action]
3. [Notification/output]

Integrations needed: [App 1], [App 2]
Frequency: [One-time / Recurring]`, 
    app: 'combos',
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
  onToggleKnowledge?: (knowledgeId: string) => void;
  onUploadNew?: () => void;
  placeholder?: string;
  // Model selector props
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
}

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
  onToggleKnowledge,
  onUploadNew,
  placeholder,
  selectedModel = 'claude-4.5',
  onModelChange,
}: ChatEmptyStateProps) {
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [isInputHovered, setIsInputHovered] = React.useState(false);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inputCenter, setInputCenter] = React.useState({ x: 0, y: 0 });

  // 更新输入框中心位置（相对于父容器）
  React.useEffect(() => {
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

    // 初始计算
    const timer = setTimeout(updateInputCenter, 100);
    
    // 监听窗口大小变化和滚动
    window.addEventListener('resize', updateInputCenter);
    window.addEventListener('scroll', updateInputCenter, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateInputCenter);
      window.removeEventListener('scroll', updateInputCenter, true);
    };
  }, []);

  // Project mode: Show ProjectStatusCard instead of generic welcome
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
    let app = appRegistry.getApp(action.app);
    
    // Fallback manually if registry lookup fails
    if (!app) {
      console.warn(`App ${action.app} not found in registry, using fallback`);
      const appData: Record<string, { name: string; icon: string; id: string }> = {
        framia: { name: 'Framia', icon: APP_ICONS.framia, id: 'framia' },
        enter: { name: 'Enter', icon: APP_ICONS.enter, id: 'enter' },
        hunter: { name: 'Hunter', icon: APP_ICONS.hunter, id: 'hunter' },
        combos: { name: 'Combos', icon: APP_ICONS.combos, id: 'combos' },
      };
      app = appData[action.app] as any;
    }

    if (app) {
      onSelectApp({ name: app.name, icon: app.icon, id: app.id });
      setInputValue(action.template);
    }
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

  // Project mode: Render ProjectStatusCard
  if (isProjectMode && project) {
    return (
      <div ref={containerRef} className="min-h-full w-full flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-visible">
        {/* Floating Agent Background */}
        <FloatingAgentBackground
          isInputFocused={isInputFocused}
          isInputHovered={isInputHovered}
          inputCenterX={inputCenter.x}
          inputCenterY={inputCenter.y}
        />

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-10" style={{ paddingTop: '10%' }}>
          {/* Project Status Card */}
          <ProjectStatusCard
            project={project}
            availableKnowledge={availableKnowledge}
            onQuickAction={handleProjectQuickAction}
          />

          {/* Context Pill */}
          {project && onToggleKnowledge && (
            <div className="mb-4 flex justify-center relative z-20">
              <ContextPill
                project={project}
                availableKnowledge={availableKnowledge}
                onToggleKnowledge={onToggleKnowledge}
                onUploadNew={onUploadNew}
              />
            </div>
          )}

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
              placeholder={placeholder || `Chat with ${project.name} data...`}
              onMentionMenuOpenChange={setIsMentionMenuOpen}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
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
        </div>
      </div>
    );
  }

  // Default mode: Generic welcome screen
  return (
    <div ref={containerRef} className="min-h-full w-full flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-visible">
      {/* Floating Agent Background */}
      <FloatingAgentBackground
        isInputFocused={isInputFocused}
        isInputHovered={isInputHovered}
        inputCenterX={inputCenter.x}
        inputCenterY={inputCenter.y}
      />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative z-10">
        {/* Welcome Header */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={24} className="text-indigo-500" />
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Welcome to Converge ONE
            </h1>
          </div>
          <p className="text-lg text-gray-500 mt-2">
            Your AI-Native project for creating anything
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
