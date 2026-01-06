import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { AppType } from '@/types';

const APP_GUIDES: Record<AppType, { title: string; description: string; tips: string[] }> = {
  framia: {
    title: 'Using Framia for Design',
    description: 'Framia helps you create visual designs, graphics, and marketing materials.',
    tips: [
      'Describe what you want to design (e.g., "a product poster")',
      'Be specific about style, colors, and content',
      'You can refine designs after they\'re generated',
    ],
  },
  enter: {
    title: 'Using Enter for Development',
    description: 'Enter generates code and builds applications based on your requirements.',
    tips: [
      'Describe the app or website you want to build',
      'Mention specific features or technologies',
      'You can edit the generated code in Enter',
    ],
  },
  hunter: {
    title: 'Using Hunter for Research',
    description: 'Hunter helps you research markets, analyze competitors, and generate reports.',
    tips: [
      'Ask specific research questions',
      'Mention what you want to analyze',
      'Hunter will compile comprehensive reports',
    ],
  },
  combos: {
    title: 'Using Combos for Automation',
    description: 'Combos creates automated workflows to streamline your processes.',
    tips: [
      'Describe the workflow you want to automate',
      'Mention triggers and actions',
      'You can schedule and customize workflows',
    ],
  },
};

interface AppGuideTooltipProps {
  appType: AppType;
  appName: string;
  appIcon: string;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function AppGuideTooltip({
  appType,
  appName,
  appIcon,
  onClose,
  position = 'bottom',
}: AppGuideTooltipProps) {
  const guide = APP_GUIDES[appType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Lightbulb className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{guide.title}</h3>
              <p className="text-xs text-gray-500">First time using {appName}?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <img src={appIcon} alt={appName} className="w-8 h-8 object-contain" />
            <div>
              <p className="text-sm text-gray-700">{guide.description}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tips</h4>
            {guide.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-indigo-500 font-bold mt-0.5">{idx + 1}.</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

