import React, { useState } from 'react';
import { FileText, Plus, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { KnowledgeCollection } from '@/types';
import { ProjectData } from '@/types/project';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContextPillProps {
  project: ProjectData;
  availableKnowledge?: KnowledgeCollection[];
  onToggleKnowledge: (knowledgeId: string) => void;
  onUploadNew?: () => void;
}

export function ContextPill({
  project,
  availableKnowledge = [],
  onToggleKnowledge,
  onUploadNew,
}: ContextPillProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count active sources
  const pdfCount = project.knowledgeIds?.length || 0;
  const linkCount = project.attachedFileIds?.length || 0;
  const totalSources = pdfCount + linkCount;

  // Get selected knowledge items for display
  const selectedKnowledge = availableKnowledge.filter(
    k => project.knowledgeIds?.includes(k.id)
  );

  // Format source text
  const getSourceText = () => {
    if (totalSources === 0) return null;
    if (totalSources === 1) {
      const first = selectedKnowledge[0];
      return first ? first.name : '1 Source Active';
    }
    if (totalSources <= 3) {
      const names = selectedKnowledge.slice(0, 2).map(k => k.name);
      const remaining = totalSources - names.length;
      return remaining > 0 
        ? `${names.join(', ')} + ${remaining} other${remaining > 1 ? 's' : ''}`
        : names.join(', ');
    }
    return `${selectedKnowledge[0]?.name || 'Q3 Financial Report'} + ${totalSources - 1} others`;
  };

  const sourceText = getSourceText();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-7 px-3 rounded-full flex items-center gap-2 transition-all duration-200",
            "text-xs font-medium",
            totalSources > 0
              ? "bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900"
              : "bg-transparent border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
          )}
          title="Click to manage knowledge sources"
        >
          {totalSources > 0 ? (
            <>
              <FileText size={14} className="text-gray-500" />
              <span>{sourceText}</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Add Context</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        align="center" 
        side="top" 
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Knowledge Sources
            </h3>
            <p className="text-xs text-gray-500">
              Select sources to enable private data context
            </p>
          </div>

          {availableKnowledge.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No knowledge collections available
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {availableKnowledge.map(knowledge => {
                const isSelected = project.knowledgeIds?.includes(knowledge.id) || false;
                return (
                  <label
                    key={knowledge.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        onToggleKnowledge(knowledge.id);
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{knowledge.icon || '📄'}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {knowledge.name}
                        </span>
                        {knowledge.isGlobalContext && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">
                            Global
                          </span>
                        )}
                      </div>
                      {knowledge.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {knowledge.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {knowledge.itemCount} {knowledge.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {onUploadNew && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  onUploadNew();
                  setIsOpen(false);
                }}
              >
                <Upload size={14} className="mr-2" />
                Upload New
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}


