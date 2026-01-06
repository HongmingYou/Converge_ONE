import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Download, Share2, Loader2, Code, Layout, Link2 } from 'lucide-react';
import { Artifact, ArtifactStatus, AppType } from '@/types';

interface ArtifactCanvasProps {
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onSetActiveArtifact: (id: string) => void;
  onCloseArtifact: (id: string) => void;
  onCloseAll: () => void;
}

// Status messages per app type
const STATUS_MESSAGES: Record<AppType, { status: string; text: string; emoji: string }[]> = {
  framia: [
    { status: 'thinking', text: 'Thinking...', emoji: '🤔' },
    { status: 'generating', text: 'Generating images...', emoji: '🎨' },
    { status: 'building', text: 'Building design...', emoji: '✨' },
  ],
  enter: [
    { status: 'thinking', text: 'Analyzing requirements...', emoji: '🧠' },
    { status: 'generating', text: 'Writing code...', emoji: '💻' },
    { status: 'building', text: 'Building application...', emoji: '🚀' },
  ],
  hunter: [
    { status: 'thinking', text: 'Searching...', emoji: '🔍' },
    { status: 'generating', text: 'Analyzing results...', emoji: '📊' },
    { status: 'building', text: 'Compiling report...', emoji: '📋' },
  ],
  combos: [
    { status: 'thinking', text: 'Processing...', emoji: '⚙️' },
    { status: 'generating', text: 'Generating content...', emoji: '📝' },
    { status: 'building', text: 'Finalizing...', emoji: '✅' },
  ],
};

// Color config per app type
const APP_COLORS: Record<AppType, { from: string; to: string; accent: string }> = {
  framia: { from: 'from-teal-50', to: 'to-emerald-50', accent: 'teal' },
  enter: { from: 'from-violet-50', to: 'to-purple-50', accent: 'violet' },
  hunter: { from: 'from-orange-50', to: 'to-amber-50', accent: 'orange' },
  combos: { from: 'from-blue-50', to: 'to-indigo-50', accent: 'blue' },
};

export function ArtifactCanvas({ 
  artifacts, 
  activeArtifactId, 
  onSetActiveArtifact, 
  onCloseArtifact,
  onCloseAll 
}: ArtifactCanvasProps) {
  const activeArtifact = artifacts.find(a => a.id === activeArtifactId);
  const [dots, setDots] = useState('');

  // Animate dots for loading state
  useEffect(() => {
    if (activeArtifact && activeArtifact.status !== 'completed') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 400);
      return () => clearInterval(interval);
    }
  }, [activeArtifact]);

  const handleEditInApp = (artifact: Artifact) => {
    if (artifact.editUrl) {
      // Add focus parameter for deep linking (in production, this would be component-specific)
      const deepLinkUrl = `${artifact.editUrl}?focus=main&artifact=${artifact.id}`;
      window.open(deepLinkUrl, '_blank');
    }
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCloseArtifact(id);
  };

  if (!activeArtifact) return null;

  const messages = STATUS_MESSAGES[activeArtifact.appType];
  const colors = APP_COLORS[activeArtifact.appType];
  const currentMessageIndex = messages.findIndex(m => m.status === activeArtifact.status);
  const currentMessage = messages[currentMessageIndex] || messages[0];

  return (
    <div className="w-[480px] h-full bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-500">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-gray-100 bg-gray-50/50">
        {/* Tabs */}
        <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide">
          {artifacts.map((artifact) => (
            <button
              key={artifact.id}
              onClick={() => onSetActiveArtifact(artifact.id)}
              className={`
                group flex items-center gap-2 px-4 py-3 border-r border-gray-100 min-w-0 max-w-[160px] transition-all
                ${artifact.id === activeArtifactId 
                  ? 'bg-white border-b-2 border-b-gray-900 -mb-px' 
                  : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <img src={artifact.appIcon} alt="" className="w-4 h-4 object-contain shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">{artifact.appName}</span>
              
              {/* Status indicator */}
              {artifact.status === 'completed' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              )}
              
              {/* Close button */}
              <button
                onClick={(e) => handleCloseTab(e, artifact.id)}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <X size={12} />
              </button>
            </button>
          ))}
        </div>

        {/* Close All Button */}
        <button 
          onClick={onCloseAll}
          className="p-2 mx-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          title="Close Canvas"
        >
          <X size={18} />
        </button>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Context Indicator - Show when artifact has context data */}
        {activeArtifact.status === 'completed' && activeArtifact.contextData && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top duration-300">
            <Link2 size={14} className="text-indigo-600" />
            <span className="text-indigo-700 font-medium">Using Context:</span>
            <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-md border border-indigo-200">
              <span className="text-indigo-600 font-semibold">{activeArtifact.contextData.sourceName}</span>
              {activeArtifact.contextData.dataSize && (
                <span className="text-xs text-indigo-400">({activeArtifact.contextData.dataSize})</span>
              )}
            </div>
            <span className="text-xs text-indigo-500 italic">
              {activeArtifact.contextData.summary.slice(0, 60)}...
            </span>
          </div>
        )}
        
        {activeArtifact.status !== 'completed' ? (
          // Loading State
          <div className={`h-full flex flex-col items-center justify-center bg-gradient-to-br ${colors.from} via-white ${colors.to} relative`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute top-1/4 left-1/4 w-32 h-32 bg-${colors.accent}-200/30 rounded-full blur-3xl animate-pulse`} />
              <div className={`absolute bottom-1/3 right-1/4 w-40 h-40 bg-${colors.accent}-200/20 rounded-full blur-3xl animate-pulse delay-300`} />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Animated Logo */}
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                  <img src={activeArtifact.appIcon} alt="" className="w-12 h-12 object-contain" />
                </div>
                <div className={`absolute -inset-2 border-2 border-${colors.accent}-300/50 rounded-2xl animate-spin`} style={{ animationDuration: '3s' }} />
              </div>

              {/* Status Text */}
              <div className="text-center">
                <div className="flex items-center gap-2 text-2xl mb-2">
                  <span>{currentMessage.emoji}</span>
                  <span className="font-medium text-gray-700">{currentMessage.text}{dots}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {activeArtifact.appName} is working on your request
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-3 mt-8">
                {messages.map((msg, index) => (
                  <div 
                    key={msg.status}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      index <= currentMessageIndex 
                        ? `bg-${colors.accent}-100 text-${colors.accent}-700` 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentMessageIndex ? (
                      <span className={`text-${colors.accent}-500`}>✓</span>
                    ) : index === currentMessageIndex ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : null}
                    {msg.text.replace('...', '')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Completed State
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 flex items-center justify-center bg-gray-50 overflow-auto">
              {activeArtifact.appType === 'enter' ? (
                // Enter: Software Preview
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl ring-1 ring-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    {/* Mock App Header */}
                    <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="px-3 py-1 bg-white rounded text-xs text-gray-500 border border-gray-200">
                          enter.pro/preview
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview Image */}
                    {activeArtifact.output && (
                      <img 
                        src={activeArtifact.output} 
                        alt="App Preview" 
                        className="w-full h-auto"
                      />
                    )}
                    
                    {/* Edit Button Overlay */}
                    <button 
                      onClick={() => handleEditInApp(activeArtifact)}
                      className="absolute top-12 right-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 hover:scale-105"
                    >
                      <Code size={16} />
                      Open in Enter
                    </button>
                  </div>
                </div>
              ) : (
                // Default: Image Preview (Framia, Hunter, etc.)
                <div className="relative group max-w-full max-h-full">
                  <img 
                    src={activeArtifact.output || ''} 
                    alt="Generated Content" 
                    className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-xl shadow-2xl ring-1 ring-gray-200 animate-in fade-in zoom-in-95 duration-500"
                  />
                  {/* Edit Button */}
                  <button 
                    onClick={() => handleEditInApp(activeArtifact)}
                    className={`absolute top-3 right-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-${colors.accent}-500 to-emerald-500 text-white rounded-lg font-medium hover:from-${colors.accent}-600 hover:to-emerald-600 transition-all shadow-lg shadow-${colors.accent}-500/30 hover:shadow-${colors.accent}-500/40 hover:scale-105 animate-in fade-in zoom-in-95 duration-300`}
                  >
                    <ExternalLink size={16} />
                    Edit in {activeArtifact.appName}
                  </button>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={18} />
                  <span className="text-sm font-medium">Download</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
