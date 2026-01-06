import React from 'react';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { ArtifactStatus, AppType } from '@/types';

interface AppWorkingCardProps {
  appType: AppType;
  appName: string;
  appIcon: string;
  status: ArtifactStatus;
  outputImage?: string;
  onViewInCanvas?: () => void;
}

const STATUS_CONFIG: Record<AppType, { color: string; messages: { status: string; text: string }[] }> = {
  framia: {
    color: 'teal',
    messages: [
      { status: 'thinking', text: 'Thinking...' },
      { status: 'generating', text: 'Generating images...' },
      { status: 'building', text: 'Building design...' },
    ]
  },
  enter: {
    color: 'violet',
    messages: [
      { status: 'thinking', text: 'Analyzing requirements...' },
      { status: 'generating', text: 'Writing code...' },
      { status: 'building', text: 'Building application...' },
    ]
  },
  hunter: {
    color: 'orange',
    messages: [
      { status: 'thinking', text: 'Searching...' },
      { status: 'generating', text: 'Analyzing results...' },
      { status: 'building', text: 'Compiling report...' },
    ]
  },
  combos: {
    color: 'blue',
    messages: [
      { status: 'thinking', text: 'Processing...' },
      { status: 'generating', text: 'Generating content...' },
      { status: 'building', text: 'Finalizing...' },
    ]
  }
};

export function AppWorkingCard({ 
  appType, 
  appName, 
  appIcon, 
  status, 
  outputImage,
  onViewInCanvas 
}: AppWorkingCardProps) {
  const config = STATUS_CONFIG[appType];
  const currentMessage = config.messages.find(m => m.status === status) || config.messages[0];
  const isCompleted = status === 'completed';

  // Handle card click to open Canvas
  const handleCardClick = () => {
    if (onViewInCanvas) {
      onViewInCanvas();
    }
  };

  const colorClasses = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
      progressBg: 'bg-teal-100',
      progressBar: 'bg-teal-500',
      badge: 'bg-teal-100 text-teal-700'
    },
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      progressBg: 'bg-violet-100',
      progressBar: 'bg-violet-500',
      badge: 'bg-violet-100 text-violet-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      progressBg: 'bg-orange-100',
      progressBar: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      progressBg: 'bg-blue-100',
      progressBar: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700'
    }
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <div 
      onClick={handleCardClick}
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 min-w-[280px] max-w-[320px] transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.01]`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-gray-100">
          <img src={appIcon} alt={appName} className="w-6 h-6 object-contain" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{appName}</span>
            {isCompleted ? (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 size={10} />
                Done
              </span>
            ) : (
              <span className={`px-2 py-0.5 ${colors.badge} text-xs font-medium rounded-full animate-pulse`}>
                Working
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status / Preview */}
      {!isCompleted ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 size={14} className="animate-spin" />
            <span>{currentMessage.text}</span>
          </div>
          <div className={`h-1.5 ${colors.progressBg} rounded-full overflow-hidden`}>
            <div 
              className={`h-full ${colors.progressBar} rounded-full transition-all duration-1000`}
              style={{ 
                width: status === 'thinking' ? '30%' : status === 'generating' ? '60%' : '90%',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Thumbnail Preview */}
          {outputImage && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
              <img 
                src={outputImage} 
                alt="Output preview" 
                className="w-full h-24 object-cover"
              />
            </div>
          )}
          
          {/* View in Canvas hint */}
          <div className={`w-full flex items-center justify-center gap-2 px-3 py-2 ${colors.bg} ${colors.text} border ${colors.border} rounded-lg text-sm font-medium`}>
            <ExternalLink size={14} />
            Click to view in Canvas
          </div>
        </div>
      )}
    </div>
  );
}
