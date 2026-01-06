import React from 'react';
import { User, Edit3 } from 'lucide-react';
import { Message, Artifact, KnowledgeCollection, AIModel } from '@/types';
import { AppWorkingCard } from './AppWorkingCard';
import { AppRecommendation } from './app-selection/AppRecommendation';
import { useAppRecommendation } from '@/hooks/use-app-recommendation';
import { getSessionContext } from '@/lib/context-bus';
import { ChatEmptyState } from './chat/ChatEmptyState';
import { InputArea } from './chat/InputArea';
import type { AppRecommendation as AppRecommendationType } from '@/types/onboarding';
import { ProjectData } from '@/types/project';

// Converge AI Logo URL
const CONVERGE_LOGO = 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/image_remove_bg_5abc.png';

interface ChatViewProps {
  messages: Message[];
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleInputCheck: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: (text?: string, selectedApp?: {name: string, icon: string} | null) => void;
  showMentionMenu: boolean;
  setShowMentionMenu: React.Dispatch<React.SetStateAction<boolean>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onOpenArtifact: (message: Message) => void;
  isCanvasOpen: boolean;
  // Project mode props
  project?: ProjectData;
  availableKnowledge?: KnowledgeCollection[];
  onToggleKnowledge?: (knowledgeId: string) => void;
  onUploadNew?: () => void;
}

export function ChatView({
  messages,
  inputValue,
  setInputValue,
  handleInputCheck,
  handleSendMessage,
  showMentionMenu,
  setShowMentionMenu,
  messagesEndRef,
  artifacts,
  activeArtifactId,
  onOpenArtifact,
  isCanvasOpen,
  project,
  availableKnowledge = [],
  onToggleKnowledge,
  onUploadNew,
}: ChatViewProps) {
  const hasStarted = messages.length > 0;
  const [selectedApp, setSelectedApp] = React.useState<{name: string, icon: string} | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState<AIModel>('claude-4.5');
  
  // Get available context from completed artifacts
  const availableContext = getSessionContext(artifacts);

  // App recommendation hook (with context)
  const { recommendations, isVisible: showRecommendations, hideRecommendations } = useAppRecommendation(inputValue, isInputFocused, availableContext);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue, selectedApp);
      setSelectedApp(null);
    }
    if (e.key === 'Backspace' && inputValue === '' && selectedApp) {
      setSelectedApp(null);
    }
  };

  const handleAppSelect = (app: { name: string; icon: string; id?: string }) => {
    setSelectedApp({ name: app.name, icon: app.icon });
    setIsPopoverOpen(false);
    hideRecommendations();
  };

  const handleRecommendationSelect = (rec: AppRecommendationType) => {
    setSelectedApp({ name: rec.appName, icon: rec.appIcon });
    hideRecommendations();
  };

  const onSendClick = (text?: string, app?: {name: string, icon: string}) => {
    handleSendMessage(text || inputValue, app || selectedApp);
    setSelectedApp(null);
    hideRecommendations();
  };

  // Get artifact for a message
  const getArtifactForMessage = (artifactId?: string): Artifact | undefined => {
    if (!artifactId) return undefined;
    return artifacts.find(a => a.id === artifactId);
  };

  return (
    <div className="flex flex-col h-full relative overflow-visible">
      {/* Scrollable Messages */}
      <div className={`flex-1 px-4 md:px-0 ${hasStarted ? 'overflow-y-auto pb-32' : 'overflow-visible pb-0'}`}>
        {!hasStarted ? (
          <ChatEmptyState
            inputValue={inputValue}
            setInputValue={(val) => handleInputCheck({ target: { value: val } } as React.ChangeEvent<HTMLTextAreaElement>)}
            onSend={onSendClick}
            selectedApp={selectedApp}
            onSelectApp={handleAppSelect}
            onRemoveApp={() => setSelectedApp(null)}
            availableContext={availableContext}
            recommendations={recommendations}
            showRecommendations={showRecommendations}
            onRecommendationSelect={handleRecommendationSelect}
            onCloseRecommendations={hideRecommendations}
            isInputFocused={isInputFocused}
            project={project}
            availableKnowledge={availableKnowledge}
            onToggleKnowledge={onToggleKnowledge}
            onUploadNew={onUploadNew}
            placeholder={project ? `Chat with ${project.name} data...` : undefined}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        ) : (
          <div className={`mx-auto py-8 space-y-10 ${isCanvasOpen ? 'max-w-xl' : 'max-w-3xl'}`}>
            {messages.map((msg: Message) => {
              const artifact = getArtifactForMessage(msg.artifactId);
              
              return (
                <div key={msg.id} className={`flex gap-6 animate-in slide-in-from-bottom-2 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 border overflow-hidden
                    ${msg.role === 'assistant' ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900 border-transparent'}
                  `}>
                    {msg.role === 'assistant' ? (
                      <img src={CONVERGE_LOGO} alt="Converge AI" className="w-6 h-6 object-contain" />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Name Tag */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        {msg.role === 'user' ? 'You' : (msg.agentName || 'Converge AI')}
                      </span>
                      {msg.agentName && <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Agent</span>}
                    </div>
                    
                    {/* User message with selected app badge */}
                    {msg.role === 'user' && msg.selectedApp && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                          <img src={msg.selectedApp.icon} className="w-4 h-4 object-contain" alt="" />
                          <span className="text-xs font-semibold text-gray-700">@{msg.selectedApp.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Text Bubble */}
                    {msg.type === 'text' && (
                      <div className={`
                        px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm
                        ${msg.role === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-sm'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-md shadow-slate-100/50'}
                      `}>
                        {msg.content}
                      </div>
                    )}
                    
                    {/* App Response - Consolidated message */}
                    {msg.type === 'app-response' && msg.appData && (
                      <div className="flex flex-col gap-4">
                        {/* Intro Text */}
                        {msg.appData.introText && (
                          <div className="bg-white border border-slate-100 text-slate-700 rounded-3xl rounded-tl-sm shadow-md shadow-slate-100/50 px-6 py-4 text-[15px] leading-relaxed">
                            {msg.appData.introText}
                          </div>
                        )}
                        
                        {/* App Working Card */}
                        <AppWorkingCard 
                          appType={msg.appData.appType}
                          appName={msg.appData.appName}
                          appIcon={msg.appData.appIcon}
                          status={artifact?.status || msg.appData.status}
                          outputImage={artifact?.output}
                          onViewInCanvas={() => onOpenArtifact(msg)}
                        />
                        
                        {/* Follow-up Text (shown when completed) */}
                        {artifact?.status === 'completed' && msg.appData.followUpText && (
                          <div className="bg-white border border-slate-100 text-slate-700 rounded-3xl rounded-tl-sm shadow-md shadow-slate-100/50 px-6 py-4 text-[15px] leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {msg.appData.followUpText}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Image Attachment */}
                    {msg.type === 'image' && (
                      <div className="group relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 ring-4 ring-white mt-2 cursor-pointer transition-transform hover:scale-[1.01]">
                        <img src={msg.content} alt="Generated" className="w-full max-w-md h-auto" />
                        {/* Elegant Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between p-6">
                          <span className="text-white text-sm font-medium">Generated by DALL-E</span>
                          <button className="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-black border border-white/30 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2">
                            <Edit3 size={14} /> Edit in Canvas
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-24" />
          </div>
        )}
      </div>

      {/* Floating Input Area (Only visible when chat has started) */}
      {hasStarted && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFDFD] via-[#FDFDFD]/90 to-transparent z-20">
          <div className={`mx-auto relative ${isCanvasOpen ? 'max-w-xl' : 'max-w-3xl'}`}>
            {/* Input Area */}
            <InputArea
              value={inputValue}
              onChange={(val) => {
                handleInputCheck({ target: { value: val } } as React.ChangeEvent<HTMLTextAreaElement>);
                if (val.endsWith('@')) {
                  setShowMentionMenu(true);
                } else if (!val.includes('@') && showMentionMenu) {
                  setShowMentionMenu(false);
                }
              }}
              onSend={onSendClick}
              selectedApp={selectedApp}
              onSelectApp={handleAppSelect}
              onRemoveApp={() => setSelectedApp(null)}
              availableContext={availableContext}
              placeholder={project ? `Chat with ${project.name} data...` : "Message Converge.ai..."}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

            {/* App Recommendation */}
            {showRecommendations && isInputFocused && (
              <AppRecommendation
                recommendations={recommendations}
                isVisible={showRecommendations}
                onSelect={handleRecommendationSelect}
                onClose={hideRecommendations}
              />
            )}

            <div className="text-center mt-3 text-xs text-slate-400 font-medium">
              AI can make mistakes. Please verify important information.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

