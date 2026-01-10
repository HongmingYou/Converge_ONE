import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  MoreHorizontal,
  PenTool,
  ArrowRight,
  Check,
  ChevronDown,
  Image,
  Presentation,
  Network,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types/desk';
import { AIModel, ChatbotMode } from '@/types';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isAIThinking: boolean;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  chatbotMode: ChatbotMode;
  onModeChange: (mode: ChatbotMode) => void;
  isDraggingOverInput: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onSourceHover?: (sourceId: string | null) => void;
  isCompact?: boolean;
}

export function ChatPanel({
  chatHistory,
  input,
  onInputChange,
  onSend,
  isAIThinking,
  selectedModel,
  onModelChange,
  chatbotMode,
  onModeChange,
  isDraggingOverInput,
  onDragOver,
  onDragLeave,
  onDrop,
  onSourceHover,
  isCompact = false,
}: ChatPanelProps) {
  const [showModelMenu, setShowModelMenu] = useState(false);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Close model menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false);
      }
    };

    if (showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelMenu]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const setQuickInput = (text: string) => {
    onInputChange(text);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Panel Header */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-50/30">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-orange-500" />
          <span className="font-medium text-sm text-gray-500">AI Assistant</span>
        </div>
        <div className="flex gap-1 items-center">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <Clock size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Chat Content Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className={cn('py-6 space-y-4 scroll-smooth', isCompact ? 'px-4' : 'px-8')}>
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              data-highlighted={msg.isHighlighted}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                backgroundColor: msg.isHighlighted ? 'rgba(254, 243, 199, 0.5)' : 'transparent',
              }}
              transition={{ duration: 0.3 }}
              className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}
            >
              {msg.role === 'user' ? (
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tr-sm text-gray-800 text-[14px] font-medium leading-relaxed max-w-[85%] shadow-sm">
                  {msg.content}
                </div>
              ) : (
                <div className={cn('max-w-full group', isCompact ? '' : 'pr-4')}>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="prose prose-slate max-w-none">
                      <div className="font-serif text-[15px] leading-7 text-[#2C2C2C]">
                        {msg.content.split('\n').map((line, i) => {
                          const citationMatch = line.match(/Q3\s*财报|Q3\s*Financial\s*Report/i);
                          const sourceId = citationMatch ? '1' : null;
                          const percentageMatch = line.match(/(\d+%)/g);
                          const parts = line.split(/(\d+%)/g);

                          return (
                            <div key={i} className="mb-3">
                              {line.startsWith('**') ? (
                                <strong className="block text-gray-900 font-bold font-serif text-base mb-1 mt-4">
                                  {line.replace(/\*\*/g, '')}
                                </strong>
                              ) : citationMatch ? (
                                <span
                                  onMouseEnter={() => onSourceHover?.(sourceId)}
                                  onMouseLeave={() => onSourceHover?.(null)}
                                  className="text-orange-600 underline decoration-orange-300 cursor-pointer hover:text-orange-700 transition-colors"
                                >
                                  {parts.map((part, idx) =>
                                    percentageMatch?.includes(part) ? (
                                      <span
                                        key={idx}
                                        className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs"
                                      >
                                        {part}
                                      </span>
                                    ) : (
                                      <span key={idx}>{part}</span>
                                    )
                                  )}
                                </span>
                              ) : percentageMatch ? (
                                <span>
                                  {parts.map((part, idx) =>
                                    percentageMatch.includes(part) ? (
                                      <span
                                        key={idx}
                                        className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs"
                                      >
                                        {part}
                                      </span>
                                    ) : (
                                      <span key={idx}>{part}</span>
                                    )
                                  )}
                                </span>
                              ) : (
                                <span>{line}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Context Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                        <PenTool size={10} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          <div className="h-24" ref={chatEndRef}></div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setQuickInput('帮我生成一张信息图')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
          >
            <Image size={14} className="text-orange-500" />
            <span>InfoGraphic</span>
          </button>
          <button
            onClick={() => setQuickInput('帮我生成一个PPT演示文稿')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
          >
            <Presentation size={14} className="text-orange-500" />
            <span>PPT</span>
          </button>
          <button
            onClick={() => setQuickInput('帮我生成一个思维导图')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-all"
          >
            <Network size={14} className="text-orange-500" />
            <span>MindStudio</span>
          </button>
        </div>

        {/* Input Box */}
        <div
          className={cn(
            'relative bg-gray-50 border border-gray-200 rounded-xl transition-all',
            isDraggingOverInput && 'scale-105 border-orange-400 bg-orange-50/50'
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDraggingOverInput ? 'Drop file...' : 'Ask AI...'}
            className={cn(
              'w-full bg-transparent border-none rounded-xl px-4 pt-3 pb-12 text-sm focus:outline-none focus:ring-0 resize-none transition-all',
              'min-h-[120px] max-h-[200px]'
            )}
            rows={3}
          />

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-t border-gray-200 rounded-b-xl bg-gray-50/50">
            {/* Left: Mode Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => onModeChange('chat')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  chatbotMode === 'chat'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Chat
              </button>
              <button
                onClick={() => onModeChange('agent')}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-all',
                  chatbotMode === 'agent'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Agent
              </button>
            </div>

            {/* Right: Model Selector and Send Button */}
            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative" ref={modelMenuRef}>
                <button
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Sparkles size={12} className="text-orange-500" />
                  <span className="capitalize">{selectedModel.replace('-', ' ')}</span>
                  <ChevronDown
                    size={12}
                    className={cn('text-gray-400 transition-transform', showModelMenu && 'rotate-180')}
                  />
                </button>

                {/* Model Dropdown Menu */}
                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                    >
                      {(['claude-4.5', 'gemini-3-pro', 'gpt-5'] as AIModel[]).map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            onModelChange(model);
                            setShowModelMenu(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
                            selectedModel === model
                              ? 'bg-orange-50 text-orange-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <span className="capitalize">{model.replace('-', ' ')}</span>
                          {selectedModel === model && <Check size={14} className="text-orange-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Send Button */}
              <button
                onClick={onSend}
                disabled={!input.trim() || isAIThinking}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  input.trim() && !isAIThinking
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-gray-300 cursor-not-allowed'
                )}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
