import { FileText, Image, Code, Presentation } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { RecentArtifact, ArtifactFileType } from '@/types/project';
import { useNavigate } from 'react-router-dom';

interface RecentWorkCardProps {
  artifact: RecentArtifact;
  onClick?: (artifact: RecentArtifact) => void;
}

const getFileTypeIcon = (fileType: ArtifactFileType) => {
  switch (fileType) {
    case 'doc':
      return <FileText size={20} className="text-gray-700" />;
    case 'image':
      return <Image size={20} className="text-gray-700" />;
    case 'code':
      return <Code size={20} className="text-gray-700" />;
    case 'slide':
      return <Presentation size={20} className="text-gray-700" />;
    case 'note':
      return <FileText size={20} className="text-gray-700" />;
    default:
      return <FileText size={20} className="text-gray-700" />;
  }
};

export function RecentWorkCard({ artifact, onClick }: RecentWorkCardProps) {
  const navigate = useNavigate();

  const timeAgo = formatDistanceToNow(artifact.lastModifiedTime, {
    addSuffix: true,
    locale: zhCN,
  });

  const handleClick = () => {
    if (onClick) {
      onClick(artifact);
    } else {
      // Default behavior: navigate to project write mode with file auto-opened
      // TODO: Implement navigation to project write mode with file ID
      navigate(`/project/${artifact.projectId}?file=${artifact.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="h-[120px] bg-white border border-[#E5E7EB] rounded-xl p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer text-left group"
    >
      <div className="flex flex-col h-full">
        {/* Icon (top-left) */}
        <div className="flex-shrink-0 mb-3">
          {getFileTypeIcon(artifact.fileType)}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[#111827] truncate mb-2 flex-shrink-0">
          {artifact.title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-[#6B7280] mt-auto">
          {artifact.projectName} • {timeAgo}
        </p>
      </div>
    </button>
  );
}


