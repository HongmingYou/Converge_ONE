import React from 'react';
import { Grid, Paperclip, Mic, ArrowUp, X } from 'lucide-react';
import { ArtifactContextData, AIModel, MentionedAsset } from '@/types';
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
  onMentionMenuOpenChange?: (isOpen: boolean) => void;
  selectedModel?: AIModel;
  onModelChange?: (model: AIModel) => void;
  mentionedAssets?: MentionedAsset[];
  onRemoveAsset?: (assetId: string) => void;
}

// Parse text to find @App mentions and render them as badges
function parseTextWithMentions(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const mentionPattern = /@(\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const appName = match[1];
    const app = appRegistry.getByName(appName);

    if (app) {
      // Render as badge
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md mx-0.5 align-middle"
          contentEditable={false}
          data-mention={app.id}
        >
          <img src={app.icon} className="w-4 h-4 object-contain" alt={app.name} />
          <span className="text-sm font-semibold text-gray-900">@{app.name}</span>
        </span>
      );
    } else {
      // Keep as plain text if app not found
      parts.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
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
  mentionedAssets = [],
  onRemoveAsset,
}: InputAreaProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isMentionMenuOpen, setIsMentionMenuOpen] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [mentionTriggerPos, setMentionTriggerPos] = React.useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);

  // Get plain text from contentEditable
  const getPlainText = (): string => {
    if (!editorRef.current) return '';
    
    let text = '';
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Check if it's a mention badge
        const mentionId = el.getAttribute('data-mention');
        if (mentionId) {
          const app = appRegistry.getById(mentionId);
          if (app) {
            text += `@${app.name}`;
          }
        } else if (el.tagName === 'BR') {
          text += '\n';
        } else {
          node.childNodes.forEach(walk);
        }
      }
    };
    
    editorRef.current.childNodes.forEach(walk);
    return text;
  };

  // Set content with rendered mentions
  const setContentWithMentions = (text: string) => {
    if (!editorRef.current) return;
    
    // Clear current content
    editorRef.current.innerHTML = '';
    
    const parts = parseTextWithMentions(text);
    parts.forEach((part, index) => {
      if (typeof part === 'string') {
        // Handle newlines
        const lines = part.split('\n');
        lines.forEach((line, lineIndex) => {
          if (lineIndex > 0) {
            editorRef.current!.appendChild(document.createElement('br'));
          }
          if (line) {
            editorRef.current!.appendChild(document.createTextNode(line));
          }
        });
      } else {
        // It's a React element (badge), we need to create DOM element
        const span = document.createElement('span');
        span.className = 'inline-flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md mx-0.5 align-middle';
        span.contentEditable = 'false';
        
        // Extract app info from the React element
        const mentionMatch = text.match(/@(\w+)/g);
        if (mentionMatch && mentionMatch[index]) {
          const appName = mentionMatch[index].slice(1);
          const app = appRegistry.getByName(appName);
          if (app) {
            span.setAttribute('data-mention', app.id);
            span.innerHTML = `<img src="${app.icon}" class="w-4 h-4 object-contain" alt="${app.name}" /><span class="text-sm font-semibold text-gray-900">@${app.name}</span>`;
          }
        }
        
        editorRef.current!.appendChild(span);
      }
    });
  };

  // Sync external value changes to editor
  React.useEffect(() => {
    if (!editorRef.current) return;
    
    const currentText = getPlainText();
    if (currentText !== value) {
      // Save cursor position
      const selection = window.getSelection();
      const hadFocus = document.activeElement === editorRef.current;
      
      setContentWithMentions(value);
      
      // Restore focus and move cursor to end
      if (hadFocus && selection) {
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [value]);

  // Detect @ trigger for mention menu
  const detectMentionTrigger = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    
    if (textNode.nodeType !== Node.TEXT_NODE) return null;
    
    const text = textNode.textContent || '';
    const cursorPos = range.startOffset;
    const beforeCursor = text.slice(0, cursorPos);
    
    const lastAt = beforeCursor.lastIndexOf('@');
    if (lastAt === -1) return null;
    
    // Check if there's a space before @ (or it's at the start)
    if (lastAt > 0 && beforeCursor[lastAt - 1] !== ' ' && beforeCursor[lastAt - 1] !== '\n') {
      return null;
    }
    
    const query = beforeCursor.slice(lastAt + 1);
    
    // Close menu if there's a space in the query
    if (query.includes(' ') || query.includes('\n')) {
      return null;
    }
    
    return { triggerPos: lastAt, query, textNode, cursorPos };
  };

  const handleInput = () => {
    const newText = getPlainText();
    onChange(newText);

    const mentionData = detectMentionTrigger();
    
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
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection) return;

    // Create the badge element
    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded-md mx-0.5 align-middle';
    badge.contentEditable = 'false';
    badge.setAttribute('data-mention', app.id);
    badge.innerHTML = `<img src="${app.icon}" class="w-4 h-4 object-contain" alt="${app.name}" /><span class="text-sm font-semibold text-gray-900">@${app.name}</span>`;
    
    // Check if there's an @ trigger to replace
    const mentionData = detectMentionTrigger();
    
    if (mentionData) {
      // Replace @query with badge
      const { textNode, triggerPos, cursorPos } = mentionData;
      const text = textNode.textContent || '';
      
      const beforeMention = text.slice(0, triggerPos);
      const afterMention = text.slice(cursorPos);
      
      const beforeNode = document.createTextNode(beforeMention);
      const afterNode = document.createTextNode(' ' + afterMention); // Add space before after text
      
      const parent = textNode.parentNode;
      if (parent) {
        parent.insertBefore(beforeNode, textNode);
        parent.insertBefore(badge, textNode);
        parent.insertBefore(afterNode, textNode);
        parent.removeChild(textNode);
        
        // Move cursor after the space
        const range = document.createRange();
        range.setStart(afterNode, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      // Insert badge at cursor position (when clicked from Grid button)
      if (!selection.rangeCount) {
        // No selection, append to end
        editorRef.current.appendChild(badge);
        editorRef.current.appendChild(document.createTextNode(' '));
      } else {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Insert badge and a space after it
        range.insertNode(document.createTextNode(' '));
        range.insertNode(badge);
        
        // Move cursor after the space
        range.setStartAfter(badge.nextSibling!);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    
    // Update value
    const newText = getPlainText();
    onChange(newText);
    
    setIsMentionMenuOpen(false);
    setMentionQuery('');
    onMentionMenuOpenChange?.(false);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
  };

  // Calculate mention menu position
  const getMentionMenuPosition = () => {
    if (!containerRef.current) return undefined;
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left + 20,
    };
  };

  // Check if there are any @mentions in the text
  const hasMentions = /@\w+/.test(value);

  return (
    <>
      {/* Mentioned Assets Badges */}
      {mentionedAssets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-2">
          {mentionedAssets.map((asset) => (
            <div
              key={asset.id}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-lg border border-gray-200 transition-colors group"
            >
              {/* Thumbnail */}
              <img
                src={asset.thumbnail}
                alt={asset.title}
                className="w-4 h-4 object-cover rounded"
              />
              {/* App Icon */}
              <img
                src={asset.appIcon}
                alt={asset.appName}
                className="w-3.5 h-3.5 object-contain"
              />
              {/* Title */}
              <span className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                {asset.title}
              </span>
              {/* Remove Button */}
              {onRemoveAsset && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAsset(asset.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-300 rounded transition-opacity"
                  title="Remove"
                >
                  <X size={12} className="text-gray-600" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:shadow-indigo-500/10"
      >
        {/* Editable Area with Inline Badges */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className={`
            w-full bg-transparent text-slate-800 py-5 pb-16 focus:outline-none min-h-[72px] max-h-40 overflow-y-auto text-lg
            px-6 relative z-10
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${!value && !isFocused ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400' : ''}
          `}
          style={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          suppressContentEditableWarning
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
              // Open mention menu without inserting @
              if (editorRef.current) {
                editorRef.current.focus();
                setIsMentionMenuOpen(true);
                setMentionQuery('');
                setSelectedMentionIndex(0);
                onMentionMenuOpenChange?.(true);
              }
            }}
            className={`
              p-2.5 rounded-full transition-colors
              ${hasMentions
                ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}
            `}
            title="Select App"
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
