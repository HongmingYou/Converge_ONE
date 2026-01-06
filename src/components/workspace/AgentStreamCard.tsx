import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CardData } from '@/types/project';
import { getAgentAvatar, getAgentColor } from '@/lib/card-icons';

// UI 组件需要从外部传入或适配
interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

interface AvatarFallbackProps {
  className?: string;
  children: React.ReactNode;
}

interface AgentStreamCardProps {
  data: CardData;
  onInvestigate: (cardId: number) => void;
  // UI 组件可以通过 props 传入，或者需要适配
  Avatar?: React.ComponentType<AvatarProps>;
  AvatarFallback?: React.ComponentType<AvatarFallbackProps>;
}

export function AgentStreamCard({ 
  data, 
  onInvestigate,
  Avatar,
  AvatarFallback 
}: AgentStreamCardProps) {
  const agentColor = getAgentColor(data.agent.type);
  const agentAvatar = getAgentAvatar(data.agent.type);

  // 如果没有传入 Avatar 组件，使用简单的 div
  const AvatarComponent = Avatar || (({ className, children }: AvatarProps) => (
    <div className={className}>{children}</div>
  ));
  const AvatarFallbackComponent = AvatarFallback || (({ className, children }: AvatarFallbackProps) => (
    <div className={className}>{children}</div>
  ));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex-shrink-0 w-[280px] h-[160px] bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group cursor-pointer"
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header: Agent Info + Timestamp */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AvatarComponent className="h-6 w-6">
              <AvatarFallbackComponent className={`text-[10px] font-bold ${agentColor}`}>
                {agentAvatar}
              </AvatarFallbackComponent>
            </AvatarComponent>
            <span className="text-xs font-semibold text-stone-700">
              {data.agent.displayName || data.agent.name}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">
            {data.timeAgo}
          </span>
        </div>

        {/* Summary Text */}
        <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1 mb-3">
          {data.summary}
        </p>

        {/* Bottom: Source Icon + Investigate Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-stone-100 flex items-center justify-center">
              <span className="text-[10px]">{data.agent.emoji || '📊'}</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono uppercase">
              {data.sourcePlatform}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvestigate(data.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50"
          >
            Investigate
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

