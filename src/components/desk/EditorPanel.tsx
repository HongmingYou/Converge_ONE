import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  X,
  Save,
  Bold,
  Italic,
  Link,
  Highlighter,
  Wand2,
  Type,
  List as ListIcon,
  Quote,
  Code,
  Sparkles,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DataSource, Note, ActiveItem, SlashCommand } from '@/types/desk';

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', icon: Type, description: 'Big section heading' },
  { id: 'h2', label: 'Heading 2', icon: Type, description: 'Medium section heading' },
  { id: 'h3', label: 'Heading 3', icon: Type, description: 'Small section heading' },
  { id: 'bullet', label: 'Bulleted List', icon: ListIcon, description: 'Create a bulleted list' },
  { id: 'numbered', label: 'Numbered List', icon: ListIcon, description: 'Create a numbered list' },
  { id: 'quote', label: 'Quote', icon: Quote, description: 'Capture a quote' },
  { id: 'code', label: 'Code Block', icon: Code, description: 'Insert a code block' },
  { id: 'ai', label: 'AI Assist', icon: Wand2, description: 'Get AI help with writing' },
];

interface EditorPanelProps {
  activeItem: ActiveItem | null;
  onClose: () => void;
  onNoteUpdate: (noteId: string | number, updates: Partial<Note>) => void;
  onSave: () => Promise<void>;
}

export function EditorPanel({ activeItem, onClose, onNoteUpdate, onSave }: EditorPanelProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Update word count
  useEffect(() => {
    if (activeItem?.type === 'note') {
      const activeNote = activeItem.data as Note;
      const words = activeNote.content.trim().split(/\s+/).filter((w) => w.length > 0).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [activeItem]);

  // Handle text selection for floating toolbar
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setShowFloatingToolbar(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();

      if (text.length > 0 && editorRef.current?.contains(range.commonAncestorContainer)) {
        setSelectedText(text);
        const rect = range.getBoundingClientRect();
        setFloatingToolbarPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        });
        setShowFloatingToolbar(true);
      } else {
        setShowFloatingToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const lastLine = textBeforeCursor.split('\n').pop() || '';

    if (e.key === '/' && lastLine.trim() === '') {
      e.preventDefault();
      setShowSlashMenu(true);
      setSlashQuery('');
      setSelectedSlashIndex(0);
    } else if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => Math.min(prev + 1, SLASH_COMMANDS.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedSlashIndex];
        if (command) {
          handleSlashCommand(command);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
      } else if (e.key.length === 1) {
        setSlashQuery((prev) => prev + e.key);
      }
    }
  };

  const handleSlashCommand = (command: SlashCommand) => {
    if (activeItem?.type !== 'note') return;
    const activeNote = activeItem.data as Note;
    if (!editorRef.current) return;

    let insertText = '';
    switch (command.id) {
      case 'h1':
        insertText = '# ';
        break;
      case 'h2':
        insertText = '## ';
        break;
      case 'h3':
        insertText = '### ';
        break;
      case 'bullet':
        insertText = '- ';
        break;
      case 'numbered':
        insertText = '1. ';
        break;
      case 'quote':
        insertText = '> ';
        break;
      case 'code':
        insertText = '```\n\n```';
        break;
      case 'ai':
        // Trigger AI assist - could be implemented later
        break;
    }

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = activeNote.content.substring(0, start - 1) + insertText + activeNote.content.substring(end);

    onNoteUpdate(activeNote.id, { content: newContent });
    setShowSlashMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length - 1, start + insertText.length - 1);
    }, 0);
  };

  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  if (!activeItem) return null;

  // Source Preview Mode
  if (activeItem.type === 'source') {
    const source = activeItem.data as DataSource;
    return (
      <div className="flex flex-col h-full bg-[#FAFAF9]">
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{source.name}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                {source.type} • {source.size}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Open Original
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl flex-1 overflow-auto p-12 flex flex-col items-center justify-center text-gray-400">
            <FileText size={64} strokeWidth={1} className="mb-6 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Preview Mode</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">
              This file is in read-only mode. You can reference it in chat or create a note from it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Asset View Mode
  if (activeItem.type === 'asset') {
    const note = activeItem.data as Note;
    return (
      <div className="flex flex-col h-full bg-[#FAFAF9]">
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-50 flex items-center justify-center">
                <Sparkles size={14} className="text-purple-500" />
              </div>
              <span className="text-sm font-semibold text-gray-900">{note.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
              Add to Notes
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl flex-1 overflow-auto p-8">
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
              <span className="text-sm text-gray-400 font-medium">Asset Visualization</span>
              <span className="text-xs text-gray-400 mt-1">{note.fileType || 'Generic Asset'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Note Edit Mode
  const activeNote = activeItem.data as Note;

  return (
    <>
      {/* Editor Header */}
      <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            title="Close Editor"
          >
            <X size={16} />
          </button>
          <span className="text-gray-400">
            <FileText size={18} />
          </span>
          <span className="font-serif font-bold text-lg text-gray-800">{activeNote.title}</span>
          {activeNote.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400">{wordCount} words</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              isSaving
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            )}
          >
            <Save size={14} />
            {isSaving ? 'Saving...' : 'Saved'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative bg-white">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto py-12 px-12 relative">
            <div className="prose prose-lg prose-slate max-w-none relative">
              <textarea
                ref={editorRef}
                value={activeNote.content}
                onChange={(e) => onNoteUpdate(activeNote.id, { content: e.target.value })}
                onKeyDown={handleEditorKeyDown}
                className="w-full min-h-[calc(100vh-300px)] resize-none outline-none border-none text-gray-700 text-lg leading-relaxed bg-transparent font-serif placeholder:text-gray-300"
                placeholder="Type '/' for commands..."
              />

              {/* Slash Command Menu */}
              <AnimatePresence>
                {showSlashMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[280px] mt-2"
                    style={{ top: editorRef.current ? editorRef.current.selectionStart : 0 }}
                  >
                    {filteredCommands.map((cmd, idx) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => handleSlashCommand(cmd)}
                          className={cn(
                            'w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors',
                            idx === selectedSlashIndex
                              ? 'bg-orange-50 text-orange-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <Icon
                            size={18}
                            className={idx === selectedSlashIndex ? 'text-orange-600' : 'text-gray-400'}
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{cmd.label}</div>
                            <div className="text-xs text-gray-500">{cmd.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Format Toolbar */}
              <AnimatePresence>
                {showFloatingToolbar && selectedText && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
                    style={{
                      top: floatingToolbarPosition.top,
                      left: floatingToolbarPosition.left,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bold">
                      <Bold size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Italic">
                      <Italic size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Link">
                      <Link size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Highlight">
                      <Highlighter size={16} className="text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="AI Rewrite">
                      <Wand2 size={16} className="text-orange-600" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
