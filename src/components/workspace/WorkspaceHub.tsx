import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ProjectData, RecentArtifact } from '@/types/project';
import { RecentWorkCard } from './RecentWorkCard';
import { ProjectListItem } from './ProjectListItem';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { MOCK_RECENT_ARTIFACTS } from '@/data/mockProject';

interface WorkspaceHubProps {
  // 数据
  projects?: ProjectData[];
  recentArtifacts?: RecentArtifact[];
  
  // 事件处理
  onProjectClick?: (projectId: string) => void;
  onNewProject?: () => void;
  onNewChat?: () => void;
  onImportFile?: () => void;
}

export function WorkspaceHub({
  projects = [],
  recentArtifacts = MOCK_RECENT_ARTIFACTS,
  onProjectClick,
  onNewProject,
  onNewChat,
  onImportFile,
}: WorkspaceHubProps) {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    onProjectClick?.(projectId);
  };

  const handleNewProject = () => {
    onNewProject?.();
  };

  // Filter non-empty artifacts and sort by lastModifiedTime DESC, take top 3
  const recentWorkArtifacts = recentArtifacts
    .filter(artifact => !artifact.isEmpty)
    .sort((a, b) => b.lastModifiedTime.getTime() - a.lastModifiedTime.getTime())
    .slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-[#F9FAFB] font-sans">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 border-b border-[#E5E7EB]">
        <div className="max-w-[1600px] mx-auto">
          {/* Title Row */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="font-serif font-bold text-5xl text-[#111827]">
                Projects
              </h1>
            </div>

            {/* Start New Work Button */}
            <Button
              onClick={handleNewProject}
              className="bg-[#000000] hover:bg-[#000000]/90 text-white rounded-lg gap-2"
            >
              <Plus size={18} />
              Start New Work
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Section 1: Recent Work */}
          {recentWorkArtifacts.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wide text-[#6B7280] mb-4 font-medium">
                Recent Files
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {recentWorkArtifacts.map((artifact) => (
                  <RecentWorkCard
                    key={artifact.id}
                    artifact={artifact}
                    onClick={(artifact) => {
                      // Navigate to project write mode with file auto-opened
                      navigate(`/project/${artifact.projectId}?file=${artifact.id}`);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: All Projects */}
          <section>
            <div className="mb-4">
              <h2 className="font-serif font-bold text-2xl text-[#111827] mb-2">
                All Projects
              </h2>
            </div>

            {projects.length === 0 ? (
              /* Empty State */
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-[#6B7280] mb-6">
                    Create your first project to start collaborating with AI agents.
                  </p>
                  <Button
                    onClick={handleNewProject}
                    variant="outline"
                    className="border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6]"
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                {/* List Header */}
                <div className="h-12 flex items-center gap-4 px-4 bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                  <div className="flex-1">NAME</div>
                  <div className="flex-shrink-0 w-20">SOURCES</div>
                  <div className="flex-shrink-0 w-[200px]">LAST ACTIVE</div>
                  <div className="flex-shrink-0 w-[100px]">MODIFIED</div>
                  <div className="flex-shrink-0 w-8"></div>
                </div>

                {/* List Items */}
                <AnimatePresence mode="popLayout">
                  {projects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      onClick={handleProjectClick}
                      DropdownMenu={DropdownMenu}
                      DropdownMenuTrigger={DropdownMenuTrigger}
                      DropdownMenuContent={DropdownMenuContent}
                      DropdownMenuItem={DropdownMenuItem}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
