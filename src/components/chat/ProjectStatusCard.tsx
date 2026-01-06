import React from 'react';
import { ProjectData } from '@/types/project';
import { KnowledgeCollection } from '@/types';

interface ProjectStatusCardProps {
  project: ProjectData;
  availableKnowledge?: KnowledgeCollection[];
  onQuickAction: (action: string) => void;
}

const PROJECT_QUICK_ACTIONS = [
  { id: 'summarize', label: 'Summarize updates' },
  { id: 'draft', label: 'Draft new section' },
  { id: 'continue', label: 'Continue last discussion' },
];

export function ProjectStatusCard({
  project,
  availableKnowledge = [],
  onQuickAction,
}: ProjectStatusCardProps) {
  // Count context sources
  // knowledgeIds represent PDFs/documents, attachedFileIds represent Links
  const pdfCount = project.knowledgeIds?.length || 0;
  const linkCount = project.attachedFileIds?.length || 0;
  
  const totalSources = pdfCount + linkCount;

  return (
    <div className="h-full flex flex-col items-center p-8 animate-in fade-in zoom-in-95 duration-700 relative">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl">
        {/* Quick Actions - Context-aware chips */}
        {totalSources > 0 && (
          <div className="w-full max-w-3xl mb-6">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {PROJECT_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onQuickAction(action.id)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-medium text-gray-700 hover:text-indigo-700"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

