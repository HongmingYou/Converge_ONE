import React, { useState } from 'react';
import { ProjectData } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KnowledgeCollection } from '@/types';

interface ProjectSettingsModalProps {
  project: ProjectData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<ProjectData>) => void;
  availableKnowledge?: KnowledgeCollection[];
}

export function ProjectSettingsModal({
  project,
  open,
  onOpenChange,
  onUpdate,
  availableKnowledge = [],
}: ProjectSettingsModalProps) {
  const [systemPrompt, setSystemPrompt] = useState(project.systemPrompt || '');
  const [selectedKnowledgeIds, setSelectedKnowledgeIds] = useState<string[]>(
    project.knowledgeIds || []
  );

  const handleSave = () => {
    onUpdate({
      systemPrompt: systemPrompt.trim() || undefined,
      knowledgeIds: selectedKnowledgeIds.length > 0 ? selectedKnowledgeIds : undefined,
    });
    onOpenChange(false);
  };

  const toggleKnowledge = (knowledgeId: string) => {
    setSelectedKnowledgeIds(prev =>
      prev.includes(knowledgeId)
        ? prev.filter(id => id !== knowledgeId)
        : [...prev, knowledgeId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure custom instructions and knowledge sources for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">Custom Instructions (System Prompt)</Label>
            <Textarea
              id="system-prompt"
              placeholder="e.g., You are a financial analyst expert. Always provide data-driven insights..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              These instructions will be automatically included in all conversations within this project.
            </p>
          </div>

          {/* Knowledge Sources */}
          <div className="space-y-2">
            <Label>Knowledge Sources (RAG)</Label>
            <p className="text-xs text-gray-500 mb-3">
              Select knowledge collections to enable private data context for this project.
            </p>
            {availableKnowledge.length === 0 ? (
              <div className="p-4 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                No knowledge collections available. Create one in Settings.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {availableKnowledge.map(knowledge => (
                  <label
                    key={knowledge.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedKnowledgeIds.includes(knowledge.id)}
                      onChange={() => toggleKnowledge(knowledge.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{knowledge.icon || '📚'}</span>
                        <span className="font-medium text-sm text-gray-900">
                          {knowledge.name}
                        </span>
                        {knowledge.isGlobalContext && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Global
                          </span>
                        )}
                      </div>
                      {knowledge.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {knowledge.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {knowledge.itemCount} {knowledge.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

