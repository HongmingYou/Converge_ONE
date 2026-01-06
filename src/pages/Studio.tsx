import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Mic, 
  Sparkles, 
  Play, 
  MoreHorizontal,
  Layout,
  List,
  Grid,
  PenTool,
  ArrowRight,
  Maximize2,
  Clock,
  Plus,
  Database,
  PanelLeft,
  PanelRight,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Folder,
  Check
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PrimarySidebar } from '@/components/PrimarySidebar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { MOCK_PROJECTS } from '@/data/mockProject';

interface DataSource {
  id: string;
  name: string;
  type: 'document' | 'database' | 'api' | 'audio';
  size: string;
  lastUpdated: string;
  isSelected?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHighlighted?: boolean;
  citations?: number[];
}

interface Note {
  id: number;
  type: 'note' | 'audio-clip';
  title: string;
  content: string;
  tags: string[];
  date: string;
  duration?: string;
  isNew?: boolean;
}

// Mock data - replace with real data
const MOCK_SOURCES: DataSource[] = [
  { id: '1', name: 'Q3 2024 Financial Report.pdf', type: 'document', size: '2.4 MB', lastUpdated: '2h ago', isSelected: true },
  { id: '2', name: 'Project Titan Architecture', type: 'document', size: '856 KB', lastUpdated: '5h ago', isSelected: true },
  { id: '3', name: 'Competitor Analysis.txt', type: 'document', size: '124 KB', lastUpdated: '1d ago', isSelected: false },
  { id: '4', name: 'Meeting_Oct12.mp3', type: 'audio', size: '12.5 MB', lastUpdated: '2d ago', isSelected: false },
];

const MOCK_CHAT_HISTORY: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '基于 Q3 财报，帮我总结一下主要增长点。',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    role: 'assistant',
    content: '根据 Q3 财报，主要增长点如下：\n\n**云服务收入同比增长 45%**\n主要得益于新企业客户的签约。这表明我们在企业级市场的渗透率正在稳步提升。\n\n**移动端广告业务回暖**\n环比增长 12%，这是一个非常积极的信号，尤其是在上半年广告市场整体疲软的背景下。\n\n**海外市场拓展顺利**\n亚太地区贡献了新增利润的 30%，证明了全球化战略的有效性。',
    timestamp: new Date(Date.now() - 3500000),
    citations: [1, 2]
  },
];

const MOCK_NOTES: Note[] = [
  {
    id: 101,
    type: 'note',
    title: 'Q3 核心增长摘要',
    content: '云服务增长 45%，移动广告回暖。亚太地区表现强劲，成为新的利润增长引擎。',
    tags: ['Finance', 'Q3'],
    date: '2h ago'
  },
  {
    id: 102,
    type: 'note',
    title: '技术架构风险点',
    content: '目前微服务拆分粒度过细，导致服务间调用延迟增加。建议在 Q4 进行服务合并优化。',
    tags: ['Tech', 'Risk'],
    date: '1d ago'
  },
  {
    id: 103,
    type: 'audio-clip',
    title: 'CEO 关于 AI 战略的发言',
    content: 'Audio clip extracted from 00:14:20. "AI is not just a feature, it is the foundation."',
    duration: '02:14',
    tags: ['Strategy'],
    date: '2d ago'
  }
];

export default function Studio() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get('card_id');
  const msgId = searchParams.get('msg_id');
  const sourceCardId = searchParams.get('source_card_id');
  
  // Get project data if projectId matches a project
  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  
  const [sources, setSources] = useState<DataSource[]>(MOCK_SOURCES);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(MOCK_CHAT_HISTORY);
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [input, setInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(true);
  const [draggedSource, setDraggedSource] = useState<DataSource | null>(null);
  const [isDraggingOverInput, setIsDraggingOverInput] = useState(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [isInputFloating, setIsInputFloating] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // New State for Mode
  const [workMode, setWorkMode] = useState<'read' | 'write'>('read');
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['sources', 'notes']);
  const [activeView, setActiveView] = useState<'chat' | 'projects'>('projects');
  const [selectedModel, setSelectedModel] = useState<'Claude-4.5' | 'Gemini-3-Pro' | 'GPT-5'>('Claude-4.5');
  const [showModelMenu, setShowModelMenu] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  
  // Track scroll for header border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Track scroll in chat area for input floating
  useEffect(() => {
    // Only used in read mode for the floating input interaction
    if (workMode !== 'read') return;

    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop } = scrollArea;
      const isScrolled = scrollTop > 100;
      setIsInputFloating(isScrolled);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [workMode]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Context restoration effect
  useEffect(() => {
    if (cardId || msgId || sourceCardId) {
      // Simulate context restoration
      const timer = setTimeout(() => {
        // 1. From Dashboard "Open Context" - highlight related data sources
        if (cardId) {
          setSources(prev => prev.map(source => 
            source.id === '1' ? { ...source, isSelected: true } : source
          ));
        }

        // 2. From Agent Stream "Investigate" - load source card context
        if (sourceCardId) {
          setSources(prev => prev.map(source => 
            source.id === '1' ? { ...source, isSelected: true } : source
          ));
        }

        // 3. Scroll to and highlight the specific message
        if (msgId) {
          setChatHistory(prev => prev.map((msg, idx) => 
            idx === 1 ? { ...msg, isHighlighted: true } : msg
          ));

          // Scroll to highlighted message
          setTimeout(() => {
            const highlightedElement = document.querySelector('[data-highlighted="true"]');
            if (highlightedElement) {
              highlightedElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });
            }
          }, 100);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [cardId, msgId, sourceCardId]);

  // Clear highlight after 3 seconds
  useEffect(() => {
    const highlighted = chatHistory.find(msg => msg.isHighlighted);
    if (highlighted) {
      const timer = setTimeout(() => {
        setChatHistory(prev => prev.map(msg => ({ ...msg, isHighlighted: false })));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [chatHistory]);

  const toggleSource = (sourceId: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId ? { ...source, isSelected: !source.isSelected } : source
    ));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsgId = Date.now().toString();
    setChatHistory(prev => [...prev, { 
      id: newMsgId, 
      role: 'user', 
      content: input,
      timestamp: new Date()
    }]);
    const userInput = input;
    setInput('');
    setIsAIThinking(true);
    
    setTimeout(() => {
      setIsAIThinking(false);
      setChatHistory(prev => [...prev, {
        id: (newMsgId + 1).toString(),
        role: 'assistant',
        content: '好的，我已经捕捉到了这个关键信息。这是一条非常有价值的洞察，我已将其整理为新的笔记卡片。',
        timestamp: new Date(),
        citations: []
      }]);
      setNotes(prev => [{
        id: Date.now(),
        type: 'note',
        title: 'User Insight',
        content: userInput,
        tags: ['New'],
        date: 'Just now',
        isNew: true
      }, ...prev]);
    }, 800);
  };

  const handleDragStart = (source: DataSource) => (e: React.DragEvent) => {
    setDraggedSource(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', source.id);
  };

  const handleDragEnd = () => {
    setDraggedSource(null);
    setIsDraggingOverInput(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverInput(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverInput(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverInput(false);
    
    if (draggedSource) {
      // Set input with document-based query
      setInput(`基于 ${draggedSource.name}，`);
      inputRef.current?.focus();
      // Optionally auto-send or just focus input
    }
    
    setDraggedSource(null);
  };

  const getSourceIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'database':
        return Database;
      case 'api':
        return Sparkles;
      case 'audio':
        return Mic;
    }
  };

  // Mock breadcrumb data
  const breadcrumbItems = [
    { label: 'Project', path: '/' },
    { label: project?.name || 'Project', path: `/project/${projectId}` },
  ];

  const renderSourcesPanelContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-50/30 bg-white sticky top-0 z-10">
        <h2 className="font-serif font-bold text-lg">Sources</h2>
        <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium">
          {sources.filter(s => s.isSelected).length}/{sources.length}
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {sources.map(source => {
            const Icon = getSourceIcon(source.type);
            const isDragging = draggedSource?.id === source.id;
            const isHighlighted = highlightedSourceId === source.id;
            return (
              <motion.div 
                key={source.id}
                draggable
                onDragStart={handleDragStart(source) as any}
                onDragEnd={handleDragEnd}
                onClick={() => toggleSource(source.id)}
                animate={{
                  backgroundColor: isHighlighted 
                    ? 'rgba(255, 107, 0, 0.15)' 
                    : source.isSelected 
                      ? 'rgba(255, 243, 224, 0.5)' 
                      : 'transparent',
                  borderColor: isHighlighted 
                    ? 'rgba(255, 107, 0, 0.4)' 
                    : source.isSelected 
                      ? 'rgba(255, 107, 0, 0.2)' 
                      : 'transparent',
                  scale: isHighlighted ? 1.02 : 1,
                }}
                transition={{
                  duration: 0.2,
                  repeat: isHighlighted ? Infinity : 0,
                  repeatType: 'reverse' as const,
                  repeatDelay: 0.5,
                }}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl cursor-move transition-all duration-200 border",
                  isDragging && 'opacity-50 scale-95'
                )}
              >
                <div className={cn(
                  "transition-colors",
                  source.isSelected ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'
                )}>
                  <Icon size={18} />
                </div>
                <span className={cn(
                  "text-sm truncate flex-1",
                  source.isSelected ? 'font-medium text-gray-900' : 'text-gray-600'
                )}>
                  {source.name}
                </span>
                {source.isSelected && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
                {isHighlighted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-xl border-2 border-orange-400 pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-gray-50/30">
        <button className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-medium hover:bg-white hover:border-orange-200 hover:text-orange-600 hover:shadow-sm transition-all">
          <Plus size={16} /> Add Source
        </button>
      </div>
    </>
  );

  const renderFileTreePanelContent = () => (
    <>
        <div className="h-16 flex items-center px-5 border-b border-gray-50/30 bg-white sticky top-0 z-10">
            <h2 className="font-serif font-bold text-lg">Files</h2>
        </div>
        <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
                {/* Sources Folder */}
                <div>
                    <button 
                        onClick={() => setExpandedFolders(prev => prev.includes('sources') ? prev.filter(f => f !== 'sources') : [...prev, 'sources'])}
                        className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        {expandedFolders.includes('sources') ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                        <Folder size={16} className="text-orange-500" fill="currentColor" fillOpacity={0.2} />
                        Sources
                    </button>
                    <AnimatePresence>
                        {expandedFolders.includes('sources') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4"
                            >
                                <div className="pl-2 border-l border-gray-100 py-1 space-y-0.5">
                                    {sources.map(source => {
                                        const Icon = getSourceIcon(source.type);
                                        return (
                                            <div 
                                                key={source.id} 
                                                draggable
                                                onDragStart={handleDragStart(source)}
                                                onDragEnd={handleDragEnd}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-600 group"
                                            >
                                                <Icon size={14} className="text-gray-400 group-hover:text-gray-600" />
                                                <span className="truncate">{source.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notes Folder */}
                <div>
                    <button 
                        onClick={() => setExpandedFolders(prev => prev.includes('notes') ? prev.filter(f => f !== 'notes') : [...prev, 'notes'])}
                        className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        {expandedFolders.includes('notes') ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                        <Folder size={16} className="text-blue-500" fill="currentColor" fillOpacity={0.2} />
                        Notes
                    </button>
                    <AnimatePresence>
                        {expandedFolders.includes('notes') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-4"
                            >
                                <div className="pl-2 border-l border-gray-100 py-1 space-y-0.5">
                                    {notes.filter(n => n.type === 'note').map(note => (
                                        <div 
                                            key={note.id}
                                            onClick={() => setActiveNoteId(note.id)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors",
                                                activeNoteId === note.id ? "bg-orange-50 text-orange-700 font-medium" : "hover:bg-gray-50 text-gray-600"
                                            )}
                                        >
                                            <FileText size={14} className={activeNoteId === note.id ? "text-orange-500" : "text-gray-400"} />
                                            <span className="truncate">{note.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </ScrollArea>
    </>
  );

  const renderChatContent = (isCompact: boolean) => (
    <>
         {/* Panel Header */}
         <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-50/30">
            <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-orange-500" />
                <span className="font-medium text-sm text-gray-500">AI Assistant</span>
            </div>
            <div className="flex gap-1 items-center">
                {/* Model Selector */}
                <div className="relative" ref={modelMenuRef}>
                    <button 
                        onClick={() => setShowModelMenu(!showModelMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-sm font-medium"
                    >
                        <Sparkles size={14} className="text-orange-500" />
                        <span>{selectedModel}</span>
                        <ChevronDown size={14} className={cn(
                            "transition-transform text-gray-400",
                            showModelMenu && "rotate-180"
                        )} />
                    </button>
                    
                    {/* Model Dropdown Menu */}
                    <AnimatePresence>
                        {showModelMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                            >
                                {(['Claude-4.5', 'Gemini-3-Pro', 'GPT-5'] as const).map((model) => (
                                    <button
                                        key={model}
                                        onClick={() => {
                                            setSelectedModel(model);
                                            setShowModelMenu(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between",
                                            selectedModel === model 
                                                ? "bg-orange-50 text-orange-700 font-medium" 
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        <span>{model}</span>
                                        {selectedModel === model && (
                                            <Check size={14} className="text-orange-600" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                  <Clock size={16}/>
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                  <MoreHorizontal size={16}/>
                </button>
            </div>
        </div>

        {/* Chat Content Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className={cn("py-6 space-y-6 scroll-smooth", isCompact ? "px-4" : "px-8")} ref={chatContainerRef}>
            {chatHistory.map(msg => (
              <motion.div
                key={msg.id}
                data-highlighted={msg.isHighlighted}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  backgroundColor: msg.isHighlighted 
                    ? 'rgba(254, 243, 199, 0.5)' 
                    : 'transparent'
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex flex-col",
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                {msg.role === 'user' ? (
                  <div className="bg-[#F4F4F2] px-4 py-3 rounded-2xl rounded-tr-sm text-gray-800 text-[14px] font-medium leading-relaxed max-w-[90%]">
                    {msg.content}
                  </div>
                ) : (
                  <div className={cn("max-w-full group", isCompact ? "" : "pr-4")}>
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
                                  onMouseEnter={() => sourceId && setHighlightedSourceId(sourceId)}
                                  onMouseLeave={() => setHighlightedSourceId(null)}
                                  className="text-orange-600 underline decoration-orange-300 cursor-pointer hover:text-orange-700 transition-colors"
                                >
                                  {parts.map((part, idx) => 
                                    percentageMatch?.includes(part) ? (
                                      <span key={idx} className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs">
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
                                      <span key={idx} className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-semibold text-xs">
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
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded">
                        <PenTool size={10}/> Save
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            <div className="h-24" ref={chatEndRef}></div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        {isCompact ? (
            // Fixed bottom input for Right Panel
            <div 
                className="p-4 border-t border-gray-100 bg-white"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                 <div className={cn(
                    "relative transition-all",
                    isDraggingOverInput && "scale-105"
                 )}>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isDraggingOverInput ? "Drop file..." : "Ask AI..."} 
                        className={cn(
                            "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 pr-10 transition-all",
                            isDraggingOverInput && "border-orange-400 bg-orange-50/50"
                        )}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isAIThinking}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all",
                          input.trim() 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-gray-300'
                        )}
                    >
                        <ArrowRight size={16} />
                    </button>
                 </div>
            </div>
        ) : (
            // Floating input for Center Panel
            <motion.div 
              className={cn(
                "absolute bottom-6",
                isInputFloating ? "left-1/2 -translate-x-1/2 w-[600px]" : "left-6 right-6"
              )}
              animate={{
                opacity: isInputFloating ? 0.9 : 1,
              }}
              transition={{ duration: 0.3 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
                <div className={cn(
                  "bg-white p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border flex items-center gap-2 ring-1 ring-black/5 transition-all",
                  isDraggingOverInput 
                    ? "border-orange-400 ring-orange-200 shadow-[0_8px_30px_rgba(255,107,0,0.2)] scale-105" 
                    : "border-gray-100",
                  isInputFloating && "backdrop-blur-md bg-white/90"
                )}>
                    {isAIThinking && (
                        <div className="flex items-center gap-1.5 px-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-75"></span>
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-150"></span>
                        </div>
                    )}
                    <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center transition-all flex-shrink-0">
                        <Plus size={20} />
                    </button>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isDraggingOverInput ? "Drop file here..." : "Ask anything..."} 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-base text-gray-800 placeholder-gray-400 h-10 px-2 focus:outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isAIThinking}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                          input.trim() && !isAIThinking
                            ? 'bg-black text-white hover:bg-gray-800 hover:scale-105' 
                            : 'bg-gray-100 text-gray-300'
                        )}
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        )}
    </>
  );

  const renderEditorPanelContent = () => {
    const activeNote = notes.find(n => n.id === activeNoteId);
    return (
        <>
            <div className="h-16 flex items-center justify-between px-8 border-b border-gray-50/30">
                <div className="flex items-center gap-3">
                    <span className="text-gray-400"><FileText size={18}/></span>
                    <span className="font-serif font-bold text-lg text-gray-800">
                        {activeNote ? activeNote.title : 'Untitled'}
                    </span>
                    {activeNote?.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <span className="text-xs text-gray-400 flex items-center">
                        {activeNote ? `Last edited ${activeNote.date}` : ''}
                    </span>
                </div>
            </div>
            
            <ScrollArea className="flex-1">
                <div className="max-w-3xl mx-auto py-12 px-12">
                     {activeNote ? (
                        <div className="prose prose-lg prose-slate max-w-none">
                            <textarea 
                                value={activeNote.content}
                                onChange={(e) => setNotes(prev => prev.map(n => n.id === activeNote.id ? {...n, content: e.target.value} : n))}
                                className="w-full h-[calc(100vh-300px)] resize-none outline-none border-none text-gray-700 text-lg leading-relaxed bg-transparent font-serif placeholder:text-gray-300"
                                placeholder="Start writing..."
                            />
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FileText size={48} strokeWidth={1} className="mb-4 text-gray-300"/>
                            <p>Select a note from the file tree to start editing</p>
                        </div>
                     )}
                </div>
            </ScrollArea>
        </>
    );
  };

  const renderNotesPanelContent = () => (
    <>
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-50/30 sticky top-0 bg-white z-10">
            <h2 className="font-serif font-bold text-lg">Studio</h2>
            {/* View Mode Toggles */}
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                    )}
                >
                    <Grid size={14} />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "p-1.5 rounded-md transition-all",
                        viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'
                    )}
                >
                    <List size={14} />
                </button>
            </div>
        </div>
        
        {/* Tools Grid */}
        <div className="px-5 py-4 border-b border-gray-50/30">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Create</span>
            <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Play size={12} fill="currentColor"/>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-orange-700">Audio</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Layout size={12} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700">Deck</span>
                </button>
            </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-3 bg-[#FAFAFA]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Recent Notes</span>
                {notes.map(note => (
                    <motion.div 
                        key={note.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-1">
                                {note.tags.map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-[9px] uppercase font-bold text-gray-500 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {note.type === 'audio-clip' && <Mic size={12} className="text-orange-500" />}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug group-hover:text-orange-700 transition-colors">
                            {note.title}
                        </h3>
                        
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                            {note.content}
                        </p>

                        <div className="mt-3 pt-2 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">{note.date}</span>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded text-gray-500 transition-all">
                                <Maximize2 size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen bg-[#FAFAF9] font-sans text-[#1A1A1A] overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Left Navigation Sidebar */}
      <PrimarySidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        recentProjects={MOCK_PROJECTS}
        onProjectClick={(projectId) => navigate(`/project/${projectId}`)}
        onLogoClick={() => navigate('/')}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global Header */}
        <header 
          ref={headerRef}
          className={cn(
            "flex-shrink-0 h-16 flex items-center justify-between px-8 z-40 transition-all duration-300",
            "bg-white/60 backdrop-blur-md",
            isScrolled && "border-b border-gray-200/50"
          )}
        >
          <div className="flex items-center gap-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="flex items-center gap-2">
            {(cardId || msgId || sourceCardId) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full"
              >
                {sourceCardId ? 'Context loaded from Agent Stream' : 'Context restored from Dashboard'}
              </motion.div>
            )}
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 mx-2 p-1 bg-gray-100/80 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setWorkMode('read')}
                className={cn(
                  "p-1.5 rounded-md transition-all flex items-center gap-2",
                  workMode === 'read' 
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-400 hover:text-gray-600"
                )}
                title="Read Mode"
              >
                <BookOpen size={16} />
                {workMode === 'read' && <span className="text-xs font-medium pr-1">Read</span>}
              </button>
              <button
                onClick={() => setWorkMode('write')}
                className={cn(
                  "p-1.5 rounded-md transition-all flex items-center gap-2",
                  workMode === 'write' 
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-400 hover:text-gray-600"
                )}
                title="Write Mode"
              >
                <PenTool size={16} />
                {workMode === 'write' && <span className="text-xs font-medium pr-1">Write</span>}
              </button>
            </div>

            {/* Panel Toggle Buttons */}
            <div className="flex items-center gap-1 mx-2 px-2 py-1 bg-white/50 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setShowSources(!showSources)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  showSources 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                title={showSources ? "Hide Sources" : "Show Sources"}
              >
                <PanelLeft size={16} />
              </button>
              <button
                onClick={() => setShowStudio(!showStudio)}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  showStudio 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
                title={showStudio ? "Hide Studio" : "Show Studio"}
              >
                <PanelRight size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Project */}
        <main className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden min-h-0">
        
        {/* === Left Panel === */}
        <motion.div
          initial={false}
          animate={{
            width: showSources ? 280 : 0,
            opacity: showSources ? 1 : 0,
            marginRight: showSources ? 0 : -24,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
        >
            {workMode === 'read' ? renderSourcesPanelContent() : renderFileTreePanelContent()}
        </motion.div>

        {/* === Center Panel === */}
        <motion.div
          initial={false}
          animate={{
            flex: 1,
            maxWidth: workMode === 'read' && !showSources && !showStudio ? '1200px' : '100%',
            marginLeft: workMode === 'read' && !showSources && !showStudio ? 'auto' : 0,
            marginRight: workMode === 'read' && !showSources && !showStudio ? 'auto' : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden relative"
        >
             {workMode === 'read' ? renderChatContent(false) : renderEditorPanelContent()}
        </motion.div>

        {/* === Right Panel === */}
        <motion.div
          initial={false}
          animate={{
            width: showStudio ? 340 : 0,
            opacity: showStudio ? 1 : 0,
            marginLeft: showStudio ? 0 : -24,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 flex flex-col bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50/50 overflow-hidden"
        >
            {workMode === 'read' ? renderNotesPanelContent() : renderChatContent(true)}
        </motion.div>

      </main>
      </div>
    </div>
  );
}

