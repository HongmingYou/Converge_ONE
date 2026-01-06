import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AppRecommendation as AppRecommendationType } from '@/types/onboarding';
import { AppCapabilityCard } from './AppCapabilityCard';
import { getAppCapabilities } from '@/lib/app-capabilities';

interface AppRecommendationProps {
  recommendations: AppRecommendationType[];
  isVisible: boolean;
  onSelect: (app: AppRecommendationType) => void;
  onClose: () => void;
}

export function AppRecommendation({
  recommendations,
  isVisible,
  onSelect,
  onClose,
}: AppRecommendationProps) {
  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-30 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Recommended Apps</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendations.map((rec) => {
            const capability = getAppCapabilities(rec.appName);
            return (
              <div
                key={rec.appName}
                onClick={() => onSelect(rec)}
                className="cursor-pointer"
              >
                <AppCapabilityCard
                  capability={{
                    ...capability,
                    icon: rec.appIcon,
                  }}
                  onSelect={() => onSelect(rec)}
                  compact
                />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Match: {Math.round(rec.matchScore)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

