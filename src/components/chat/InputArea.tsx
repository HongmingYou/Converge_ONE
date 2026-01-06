import React from 'react';
import { Grid, Paperclip, Mic, ArrowUp, X } from 'lucide-react';
import { ArtifactContextData, AIModel } from '@/types';
import { AppMentionMenu } from './AppMentionMenu';
import { appRegistry } from '@/lib/app-registry';
import { ModelSelector } from './ModelSelector';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  selectedApp: { name: string; icon: string } | null;
  onSelectApp: (app: { name: string; icon: string; id: string }) => void;
  onRemoveApp: () => void;
  availableContext: ArtifactContextData[];
  onRemoveContext?: (contextId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onMentionMenuOpenChange?: (isOpen: boolean) => void; // Add callback for menu state
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
}

export function InputArea({
  value,
  onChange,
  onSend,
  selectedApp,
  onSelectApp,
  onRemoveApp,
  availableContext,
  onRemoveContext,
  placeholder = "What would you like to create?",
  disabled = false,
  onMentionMenuOpenChange,
  selectedModel = 'claude-4.5',
  onModelChange,
}: InputAreaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [mentionTriggerPos, setMentionTriggerPos] = React.useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = React.useState(0);

  // Detect @ or / trigger
  const detectMentionTrigger = (text: string, cursorPos: number) => {
    // Find the last @ or / before cursor
    const beforeCursor = text.slice(0, cursorPos);
    const lastAt = beforeCursor.lastIndexOf('@');
    const lastSlash = beforeCursor.lastIndexOf('/');
    const triggerPos = Math.max(lastAt, lastSlash);

    if (triggerPos === -1) return null;

    // Check if there's a space before the trigger (or it's at the start)
    if (triggerPos > 0 && beforeCursor[triggerPos - 1] !== ' ' && beforeCursor[triggerPos - 1] !== '\n') {
      return null;
    }

    // Get the query after the trigger
    const query = beforeCursor.slice(triggerPos + 1);
    
    // Close menu if there's a space in the query
    if (query.includes(' ') || query.includes('\n')) {
      return null;
    }

    return { triggerPos, query, trigger: beforeCursor[triggerPos] };
  };

  const handleTextChange = (newValue: string) => {
    onChange(newValue);

    const cursorPos = textareaRef.current?.selectionStart || 0;
    const mentionData = detectMentionTrigger(newValue, cursorPos);

    if (mentionData) {
      setIsMentionMenuOpen(true);
      setMentionQuery(mentionData.query);
      setMentionTriggerPos(mentionData.triggerPos);
      setSelectedMentionIndex(0);
      onMentionMenuOpenChange?.(true);
    } else {
      setIsMentionMenuOpen(false);
      setMentionQuery('');
      onMentionMenuOpenChange?.(false);
    }
  };

  const handleMentionSelect = (app: { name: string; icon: string; id: string }) => {
    // Remove the @query or /query from text since we show the badge
    const beforeTrigger = value.slice(0, mentionTriggerPos);
    const afterQuery = value.slice(mentionTriggerPos + mentionQuery.length + 1);
    const newValue = `${beforeTrigger}${afterQuery}`;
    
    onChange(newValue);
    onSelectApp(app);
    setIsMentionMenuOpen(false);
    setMentionQuery('');
    onMentionMenuOpenChange?.(false);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      // Set cursor position to where the mention started
      textareaRef.current?.setSelectionRange(mentionTriggerPos, mentionTriggerPos);
    }, 0);
  };

  // Get filtered apps for keyboard navigation
  const getFilteredApps = () => {
    const allApps = appRegistry.getAll();
    if (!mentionQuery.trim()) return allApps;

    const lowerQuery = mentionQuery.toLowerCase();
    return allApps.filter((app: any) =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.capabilities.primary.some((cap: string) => cap.includes(lowerQuery))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention menu navigation
    if (isMentionMenuOpen) {
      const filteredApps = getFilteredApps();
      const maxIndex = filteredApps.length - 1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.min(prev + 1, maxIndex));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (filteredApps[selectedMentionIndex]) {
          handleMentionSelect(filteredApps[selectedMentionIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMentionMenuOpen(false);
        setMentionQuery('');
        onMentionMenuOpenChange?.(false);
        return;
      }
    }

    // Normal send behavior
    if (e.key === 'Enter' && !e.shiftKey && !isMentionMenuOpen) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }

    if (e.key === 'Backspace' && value === '' && selectedApp) {
      onRemoveApp();
    }
  };

  // Calculate mention menu position (follow input box, aligned to left-bottom)
  const getMentionMenuPosition = () => {
    if (!containerRef.current) return undefined;
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8, // Position below the input with 8px gap
      left: rect.left + 20, // Align with left side (with some padding)
    };
  };

  return (
    <>
      {/* Input Container */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-indigo-500/10"
      >
        {/* Selected App Badge */}
        {selectedApp && (
          <div className="absolute top-5 left-6 z-20 flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg select-none animate-in fade-in zoom-in-95 duration-200">
            <img src={selectedApp.icon} className="w-5 h-5 object-contain" alt={selectedApp.name} />
            <span className="text-sm font-bold text-gray-900">@{selectedApp.name}</span>
            <button
              onClick={onRemoveApp}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedApp ? "Ask anything..." : placeholder}
          style={{ paddingLeft: selectedApp ? '160px' : undefined }}
          disabled={disabled}
          className={`
            w-full bg-transparent text-slate-800 py-5 pb-16 focus:outline-none resize-none max-h-40 min-h-[72px] text-lg placeholder:text-slate-400
            px-6 relative z-10
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Left Toolbar (Apps & Attach) */}
        <div className="absolute left-3 bottom-3 flex items-center gap-2 z-20">
          <button
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Upload file to ONE's Project"
          >
            <Paperclip size={20} />
          </button>
          <button
            onClick={() => {
              setIsMentionMenuOpen(true);
              onMentionMenuOpenChange?.(true);
            }}
            className={`
              p-2.5 rounded-full transition-colors
              ${selectedApp
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}
            `}
            title="Select App (@)"
          >
            <Grid size={20} />
          </button>
        </div>

        {/* Right Toolbar (Model Selector, Voice & Send) */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2 z-20">
          {onModelChange && (
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          )}
          <button
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Voice input"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className={`
              h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300
              ${value.trim() && !disabled
                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg hover:shadow-indigo-500/30 hover:scale-105'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            <ArrowUp size={20} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Mention Menu */}
      <AppMentionMenu
        isOpen={isMentionMenuOpen}
        query={mentionQuery}
        onSelect={handleMentionSelect}
        onClose={() => {
          setIsMentionMenuOpen(false);
          setMentionQuery('');
          onMentionMenuOpenChange?.(false);
        }}
        position={getMentionMenuPosition()}
        selectedIndex={selectedMentionIndex}
        onIndexChange={setSelectedMentionIndex}
      />
    </>
  );
}
