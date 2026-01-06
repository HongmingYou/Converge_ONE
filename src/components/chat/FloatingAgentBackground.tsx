import React, { useState, useMemo } from 'react';
import { appRegistry } from '@/lib/app-registry';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FloatingAgentBackgroundProps {
  isInputFocused: boolean;
  isInputHovered: boolean;
  inputCenterX?: number;
  inputCenterY?: number;
}

// Agent 品牌色映射
const AGENT_COLORS: Record<string, string> = {
  framia: '#10B981', // Emerald
  enter: '#6366F1',  // Indigo
  hunter: '#F59E0B', // Amber
  combos: '#8B5CF6', // Violet
};

// Logo 锚点配置（相对于输入框中心，放在快捷指令下方）
const AGENT_POSITIONS: Record<string, { x: number; y: number; rotation: number; size: number; delay: number }> = {
  framia: { x: -220, y: 280, rotation: -5, size: 1, delay: 0 },
  enter: { x: 220, y: 280, rotation: 5, size: 1, delay: 1 },
  hunter: { x: 100, y: 320, rotation: 0, size: 0.85, delay: 2 },
  combos: { x: -100, y: 320, rotation: 0, size: 0.85, delay: 0.5 },
};

export function FloatingAgentBackground({
  isInputFocused,
  isInputHovered,
  inputCenterX = 0,
  inputCenterY = 0,
}: FloatingAgentBackgroundProps) {
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  // 从 appRegistry 获取所有 Agent
  const agents = useMemo(() => {
    return appRegistry.getAll().slice(0, 4); // 只取前4个
  }, []);

  // 计算聚拢偏移量（hover input 时）
  const convergeOffset = isInputHovered && !isInputFocused ? 15 : 0;

  return (
    <TooltipProvider>
      {/* Layer 1: Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
        {agents.map((agent) => {
          const position = AGENT_POSITIONS[agent.id];
          if (!position) return null;

          const glowColor = AGENT_COLORS[agent.id] || '#6366F1';
          const glowX = inputCenterX + position.x;
          const glowY = inputCenterY + position.y;

          return (
            <div
              key={`glow-${agent.id}`}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                left: `${glowX}px`,
                top: `${glowY}px`,
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}
            />
          );
        })}
      </div>

      {/* Layer 2: Floating Agent Logos */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-visible">
        {agents.map((agent) => {
          const position = AGENT_POSITIONS[agent.id];
          if (!position) return null;

          const isHovered = hoveredAgentId === agent.id;
          const glowColor = AGENT_COLORS[agent.id] || '#6366F1';

          // 计算最终位置（考虑聚拢效应）
          // 向中心聚拢：计算从当前位置到中心的方向向量
          const distance = Math.sqrt(position.x * position.x + position.y * position.y);
          const directionX = distance > 0 ? -position.x / distance : 0;
          const directionY = distance > 0 ? -position.y / distance : 0;
          const finalX = position.x + (convergeOffset * directionX);
          const finalY = position.y + (convergeOffset * directionY);

          // 状态样式
          let opacity = 0.7;
          let blur = '0px';
          let scale = position.size;
          let zIndex = 5;

          if (isInputFocused) {
            // Typing/Focus: 退后效应
            opacity = 0.3;
            blur = '4px';
            scale = position.size * 0.9;
          } else if (isHovered) {
            // Hover on Logo: 激活
            opacity = 1.0;
            scale = position.size * 1.1;
            zIndex = 15;
          } else if (isInputHovered) {
            // Hover on Input: 保持默认，但位置会聚拢
            opacity = 0.7;
          }

          return (
            <Tooltip key={agent.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute cursor-pointer pointer-events-auto"
                  style={{
                    left: `${inputCenterX + finalX}px`,
                    top: `${inputCenterY + finalY}px`,
                    transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
                    opacity,
                    filter: blur ? `blur(${blur})` : undefined,
                    zIndex,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  }}
                  onMouseEnter={() => setHoveredAgentId(agent.id)}
                  onMouseLeave={() => setHoveredAgentId(null)}
                >
                  {/* Frosted Glass Container with Animation */}
                  <div
                    className="rounded-2xl backdrop-blur-sm bg-white/60 border border-white/40 shadow-lg p-3"
                    style={{
                      width: '48px',
                      height: '48px',
                      transform: `scale(${scale})`,
                      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      animation: `float-bob 4s ease-in-out infinite`,
                      animationDelay: `${position.delay}s`,
                    }}
                  >
                    <img
                      src={agent.icon}
                      alt={agent.name}
                      className="w-full h-full object-contain"
                      style={{
                        filter: isInputFocused ? 'blur(2px)' : 'none',
                      }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-black/80 text-white border-none px-3 py-2 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <img src={agent.icon} alt={agent.name} className="w-4 h-4 object-contain" />
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

