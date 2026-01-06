import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { AppCapability } from '@/types/onboarding';

interface AppCapabilityCardProps {
  capability: AppCapability;
  onSelect?: () => void;
  compact?: boolean;
}

export function AppCapabilityCard({ 
  capability, 
  onSelect,
  compact = false 
}: AppCapabilityCardProps) {
  if (compact) {
    return (
      <div 
        onClick={onSelect}
        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-3">
          <img src={capability.icon} alt={capability.name} className="w-8 h-8 object-contain" />
          <div>
            <h3 className="font-semibold text-gray-900">{capability.name}</h3>
            <p className="text-xs text-gray-500">{capability.description}</p>
          </div>
        </div>
        <div className="space-y-1">
          {capability.capabilities.slice(0, 2).map((cap, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={12} className="text-indigo-500 shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-4">
        <img src={capability.icon} alt={capability.name} className="w-12 h-12 object-contain" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">{capability.name}</h3>
          <p className="text-sm text-gray-500">{capability.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Core Capabilities</h4>
        <div className="space-y-2">
          {capability.capabilities.map((cap, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
              <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>

      {capability.useCases.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Use Cases</h4>
          <div className="flex flex-wrap gap-2">
            {capability.useCases.map((useCase, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      )}

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Use {capability.name}
        </button>
      )}
    </div>
  );
}

