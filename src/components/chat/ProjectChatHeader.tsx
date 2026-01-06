import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Lock } from 'lucide-react';
import { ProjectData } from '@/types/project';
import { KnowledgeCollection } from '@/types';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { Button } from '@/components/ui/button';

interface ProjectChatHeaderProps {
  project: ProjectData;
  onUpdateProject: (updates: Partial<ProjectData>) => void;
  availableKnowledge?: KnowledgeCollection[];
}

export function ProjectChatHeader({
  project,
  onUpdateProject,
  availableKnowledge = [],
}: ProjectChatHeaderProps) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const knowledgeCount = project.knowledgeIds?.length || 0;
  const attachedFilesCount = project.attachedFileIds?.length || 0;
  const hasPrivateContext = knowledgeCount > 0 || attachedFilesCount > 0;

  // Calculate last updated time
  const lastUpdated = project.lastModified || new Date();
  const timeAgo = formatTimeAgo(lastUpdated);

  const handleOpenStudio = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
        {/* Top Row: Title and Actions */}
        <div className="flex items-center justify-between mb-2">
          {/* Left: Project Name with Settings */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Settings size={18} />
            </Button>
          </div>

          {/* Right: Open Studio Button */}
          <Button
            onClick={handleOpenStudio}
            className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span>🚀</span>
            <span>Deep Work in Studio</span>
          </Button>
        </div>

        {/* Metadata Line */}
        {hasPrivateContext && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock size={14} className="text-gray-400" />
            <span>Private Context Active</span>
            <span>•</span>
            <span>Last updated {timeAgo}</span>
          </div>
        )}
      </div>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        project={project}
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onUpdate={onUpdateProject}
        availableKnowledge={availableKnowledge}
      />
    </>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

