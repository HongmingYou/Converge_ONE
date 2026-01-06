import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
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

  const handleOpenStudio = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-12 flex items-center justify-between">
        {/* Left: Project Name and Settings */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{project.name}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-400 hover:text-gray-600 shrink-0 ml-auto"
          >
            <Settings size={16} />
          </Button>
        </div>

        {/* Right: Open Studio Button */}
        <Button
          onClick={handleOpenStudio}
          className="bg-black text-white hover:bg-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0 ml-4"
        >
          <span>🚀</span>
          <span>Deep Work in Studio</span>
        </Button>
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

