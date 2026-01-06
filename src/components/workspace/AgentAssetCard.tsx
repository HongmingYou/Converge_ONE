import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Pin, 
  PinOff, 
  Link as LinkIcon, 
  Sparkles, 
  Download,
  Code,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Workflow
} from 'lucide-react';
import { AgentAssetData, AssetType } from '@/types/project';
import { getAgentAppAvatar, getAgentAppColor } from '@/lib/card-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AgentAssetCardProps {
  data: AgentAssetData;
  onTrace?: (conversationId: string, messageId: string) => void;
  onRemix?: (asset: AgentAssetData) => void;
  onSave?: (asset: AgentAssetData) => void;
  onPin?: (assetId: string, pinned: boolean) => void;
}

const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case 'document':
      return FileText;
    case 'image':
      return ImageIcon;
    case 'code':
      return Code;
    case 'data':
      return BarChart3;
    case 'workflow':
      return Workflow;
    default:
      return FileText;
  }
};

const renderAssetPreview = (asset: AgentAssetData) => {
  const { type, preview } = asset;

  if (typeof preview === 'string') {
    // Simple URL preview
    if (type === 'image') {
      return (
        <div className="w-full h-32 overflow-hidden rounded-lg">
          <img 
            src={preview} 
            alt={asset.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  }

  // Structured preview object
  switch (type) {
    case 'document':
      return (
        <div className="w-full h-32 bg-gradient-to-br from-stone-50 to-stone-100 rounded-lg p-3 border border-stone-200">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
              {preview.title || asset.title}
            </h4>
            {(preview.previewLines || []).slice(0, 3).map((line: string, idx: number) => (
              <p key={idx} className="text-[10px] text-stone-600 line-clamp-1">
                {line}
              </p>
            ))}
          </div>
        </div>
      );
    
    case 'code':
      return (
        <div className="w-full h-32 bg-stone-900 rounded-lg p-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-stone-400 font-mono">
              {preview.language || 'code'}
            </span>
          </div>
          <pre className="text-[10px] text-stone-300 font-mono line-clamp-4">
            {preview.snippet || '// Code preview...'}
          </pre>
        </div>
      );
    
    case 'data':
      return (
        <div className="w-full h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-orange-600" />
            <span className="text-xs font-semibold text-orange-900">Key Metrics</span>
          </div>
          <div className="space-y-1">
            {Object.entries(preview.keyMetrics || {}).slice(0, 3).map(([key, value], idx) => (
              <div key={idx} className="flex justify-between text-[10px]">
                <span className="text-orange-700">{key}:</span>
                <span className="text-orange-900 font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'workflow':
      return (
        <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 flex items-center justify-center">
          <div className="text-center">
            <Workflow size={24} className="text-blue-600 mx-auto mb-2" />
            <span className="text-xs font-semibold text-blue-900">Workflow</span>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

export function AgentAssetCard({
  data,
  onTrace,
  onRemix,
  onSave,
  onPin,
}: AgentAssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const agentColor = getAgentAppColor(data.agent.type);
  const agentAvatar = getAgentAppAvatar(data.agent.type);
  const AssetIcon = getAssetIcon(data.type);

  const handleTrace = () => {
    if (onTrace) {
      onTrace(data.conversationId, data.messageId);
    } else {
      // Default: navigate to chat with message ID
      navigate(`/chat?msg_id=${data.messageId}`);
    }
  };

  const handleRemix = () => {
    if (onRemix) {
      onRemix(data);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
  };

  const handlePin = () => {
    if (onPin) {
      onPin(data.id, !data.isPinned);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex-shrink-0 w-[320px] bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-6 w-6">
              {data.agent.icon ? (
                <AvatarImage src={data.agent.icon} alt={data.agent.name} />
              ) : null}
              <AvatarFallback className={`text-[10px] font-bold ${agentColor}`}>
                {agentAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-stone-700 truncate">
                  {data.agent.displayName || data.agent.name}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  {data.actionLabel}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePin();
              }}
              className="p-1 hover:bg-stone-100 rounded transition-colors"
            >
              {data.isPinned ? (
                <Pin size={14} className="text-orange-600" />
              ) : (
                <PinOff size={14} className="text-stone-400" />
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-stone-100 rounded transition-colors"
                >
                  <MoreHorizontal size={14} className="text-stone-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTrace}>
                  <LinkIcon size={14} className="mr-2" />
                  Trace to Source
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRemix}>
                  <Sparkles size={14} className="mr-2" />
                  Remix
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSave}>
                  <Download size={14} className="mr-2" />
                  Save to Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Body - Asset Preview */}
      <div className="p-4 pb-3">
        {renderAssetPreview(data)}
      </div>

      {/* Footer - Context & Hover Actions */}
      <div className="px-4 pb-4 relative">
        {/* Source Context */}
        <p className="text-[10px] text-stone-500 mb-2 line-clamp-1">
          {data.sourceContext}
        </p>

        {/* Hover Action Bar (Glassmorphism) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-md border-t border-stone-200 rounded-b-2xl flex items-center justify-center gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleTrace();
              }}
              className="h-7 px-2 text-xs"
            >
              <LinkIcon size={12} className="mr-1" />
              Trace
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemix();
              }}
              className="h-7 px-2 text-xs bg-orange-600 hover:bg-orange-700"
            >
              <Sparkles size={12} className="mr-1" />
              Remix
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="h-7 px-2 text-xs"
            >
              <Download size={12} className="mr-1" />
              Save
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

