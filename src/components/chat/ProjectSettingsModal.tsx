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

interface ProjectSettingsModalProps {
  project: ProjectData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<ProjectData>) => void;
}

export function ProjectSettingsModal({
  project,
  open,
  onOpenChange,
  onUpdate,
}: ProjectSettingsModalProps) {
  const [systemPrompt, setSystemPrompt] = useState(project.systemPrompt || '');

  const handleSave = () => {
    onUpdate({
      systemPrompt: systemPrompt.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure custom instructions for this project.
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

