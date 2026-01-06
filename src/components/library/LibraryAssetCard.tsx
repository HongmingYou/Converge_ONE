import React from 'react';
import { LibraryArtifact } from '@/types';
import { Link2, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LibraryAssetCardProps {
  artifact: LibraryArtifact;
  onTraceBack: () => void;
  onChatWithAsset: () => void;
  onView: () => void;
}

export function LibraryAssetCard({
  artifact,
  onTraceBack,
  onChatWithAsset,
  onView,
}: LibraryAssetCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'code':
        return '💻';
      case 'document':
        return '📄';
      case 'workflow':
        return '⚙️';
      default:
        return '📦';
    }
  };

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Thumbnail */}
      <div
        className="aspect-video bg-gray-100 relative overflow-hidden cursor-pointer"
        onClick={onView}
      >
        {artifact.thumbnail ? (
          <img
            src={artifact.thumbnail}
            alt={artifact.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {getTypeIcon(artifact.type)}
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-gray-900">
              <Eye size={14} />
              View Details
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Agent Icon */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
            {artifact.title}
          </h3>
          <img
            src={artifact.appIcon}
            alt={artifact.appName}
            className="w-5 h-5 rounded ml-2 flex-shrink-0"
            title={artifact.appName}
          />
        </div>

        {/* Session Info */}
        {artifact.sessionTitle && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
            From: {artifact.sessionTitle}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={onChatWithAsset}
          >
            <MessageSquare size={12} className="mr-1" />
            Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-2"
            onClick={onTraceBack}
            title="Trace back to original conversation"
          >
            <Link2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}

