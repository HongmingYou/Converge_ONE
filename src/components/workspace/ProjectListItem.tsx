import { motion } from 'framer-motion';
import { FileText, Presentation, Network, MoreHorizontal, Trash2, Edit2, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { ProjectData, ProjectType } from '@/types/project';
import { useState } from 'react';

// UI 组件接口定义，需要从外部传入或适配
interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end' | 'center';
  children: React.ReactNode;
}

interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface ProjectListItemProps {
  project: ProjectData;
  onClick: (projectId: string) => void;
  // UI 组件可以通过 props 传入
  DropdownMenu?: React.ComponentType<DropdownMenuProps>;
  DropdownMenuTrigger?: React.ComponentType<DropdownMenuTriggerProps>;
  DropdownMenuContent?: React.ComponentType<DropdownMenuContentProps>;
  DropdownMenuItem?: React.ComponentType<DropdownMenuItemProps>;
}

const getProjectIcon = (type: ProjectType) => {
  switch (type) {
    case 'note':
      return <FileText size={16} className="text-blue-600" />;
    case 'deck':
      return <Presentation size={16} className="text-orange-600" />;
    case 'mindmap':
      return <Network size={16} className="text-purple-600" />;
  }
};

const getProjectTypeLabel = (type: ProjectType) => {
  switch (type) {
    case 'note':
      return 'Note';
    case 'deck':
      return 'Deck';
    case 'mindmap':
      return 'Mindmap';
  }
};

export function ProjectListItem({ 
  project, 
  onClick,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
}: ProjectListItemProps) {
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(project.lastModified, {
    addSuffix: true,
    locale: zhCN,
  });

  // 如果没有传入 Dropdown 组件，使用简单的 div
  const DropdownMenuComponent = DropdownMenu || (({ children }: DropdownMenuProps) => <>{children}</>);
  const DropdownMenuTriggerComponent = DropdownMenuTrigger || (({ children, asChild }: DropdownMenuTriggerProps) => 
    asChild ? <>{children}</> : <div>{children}</div>
  );
  const DropdownMenuContentComponent = DropdownMenuContent || (({ children, align }: DropdownMenuContentProps) => 
    <div className={`dropdown-content ${align === 'end' ? 'dropdown-content-end' : ''}`}>{children}</div>
  );
  const DropdownMenuItemComponent = DropdownMenuItem || (({ children, className, onClick }: DropdownMenuItemProps) => 
    <div className={className} onClick={onClick}>{children}</div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: '#F3F4F6' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => onClick(project.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="h-16 flex items-center gap-4 px-4 border-b border-[#E5E7EB] hover:border-transparent cursor-pointer group"
    >
      {/* Project Name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#111827] truncate">
          {project.name}
        </h3>
      </div>

      {/* Sources Count */}
      <div className="flex-shrink-0 w-20 text-xs text-[#6B7280]">
        {project.sourcesCount} 📄
      </div>

      {/* Last Active */}
      <div className="flex-shrink-0 w-[200px] text-[13px] text-[#6B7280] truncate">
        {project.lastActivity || 'No recent activity'}
      </div>

      {/* Last Modified */}
      <div className="flex-shrink-0 w-[100px] text-xs text-[#6B7280]">
        {timeAgo}
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 w-8">
        <DropdownMenuComponent>
          <DropdownMenuTriggerComponent asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className={`p-1.5 hover:bg-[#F3F4F6] rounded transition-all ${
                showActions ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <MoreHorizontal size={16} className="text-[#6B7280]" />
            </button>
          </DropdownMenuTriggerComponent>
          <DropdownMenuContentComponent align="end">
            <DropdownMenuItemComponent>
              <Edit2 size={14} className="mr-2" />
              Rename
            </DropdownMenuItemComponent>
            <DropdownMenuItemComponent>
              <Pin size={14} className="mr-2" />
              Pin
            </DropdownMenuItemComponent>
            <DropdownMenuItemComponent className="text-red-600">
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItemComponent>
          </DropdownMenuContentComponent>
        </DropdownMenuComponent>
      </div>
    </motion.div>
  );
}

