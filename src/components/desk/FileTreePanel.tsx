import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Mic,
  Sparkles,
  Database,
  ChevronRight,
  Folder as FolderIcon,
  FilePlus,
  FolderPlus,
  Upload,
  Image,
  Presentation,
  Network,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { DataSource, Note, ActiveItem } from '@/types/desk';

interface FileTreePanelProps {
  sources: DataSource[];
  notes: Note[];
  activeItem: ActiveItem | null;
  onItemSelect: (item: ActiveItem) => void;
  onCreateNote: (parentId?: string | number) => void;
  onCreateFolder: (parentId?: string | number) => void;
  onDeleteNote: (id: string | number) => void;
  onRenameNote: (id: string | number, newTitle: string) => void;
  onToggleFolder: (id: string | number) => void;
  onOpenAddFilesModal: () => void;
  onDragStart: (source: DataSource) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function FileTreePanel({
  sources,
  notes,
  activeItem,
  onItemSelect,
  onCreateNote,
  onCreateFolder,
  onDeleteNote,
  onRenameNote,
  onToggleFolder,
  onOpenAddFilesModal,
  onDragStart,
  onDragEnd,
}: FileTreePanelProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['sources', 'asset']);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Split notes by creator
  const agentFiles = notes.filter((n) => n.createdBy === 'agent' && !n.parentId);
  const userFiles = notes.filter((n) => n.createdBy === 'user' && !n.parentId);

  const toggleVirtualFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((f) => f !== folderId) : [...prev, folderId]
    );
  };

  const startRenaming = (note: Note) => {
    setEditingId(note.id);
    setEditingName(note.title);
  };

  const handleRename = () => {
    if (editingId && editingName.trim()) {
      onRenameNote(editingId, editingName.trim());
    }
    setEditingId(null);
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

  const getFileIcon = (note: Note) => {
    if (note.isLoading) {
      return <Loader2 size={16} className="text-orange-500 animate-spin flex-shrink-0" />;
    }
    if (note.fileType === 'infographic') {
      return (
        <Image
          size={16}
          className={cn('flex-shrink-0', activeItem?.id === note.id ? 'text-orange-500' : 'text-emerald-500')}
        />
      );
    }
    if (note.fileType === 'ppt') {
      return (
        <Presentation
          size={16}
          className={cn('flex-shrink-0', activeItem?.id === note.id ? 'text-orange-500' : 'text-red-500')}
        />
      );
    }
    if (note.fileType === 'mindmap') {
      return (
        <Network
          size={16}
          className={cn('flex-shrink-0', activeItem?.id === note.id ? 'text-orange-500' : 'text-purple-500')}
        />
      );
    }
    if (note.type === 'audio-clip') {
      return (
        <Mic
          size={16}
          className={cn('flex-shrink-0', activeItem?.id === note.id ? 'text-orange-500' : 'text-amber-500')}
        />
      );
    }
    return (
      <FileText
        size={16}
        className={cn('flex-shrink-0', activeItem?.id === note.id ? 'text-orange-500' : 'text-gray-400')}
      />
    );
  };

  // Render item in virtual folder (Sources or Asset)
  const renderVirtualFolderItem = (item: Note | DataSource, isSource = false) => {
    if (isSource) {
      const source = item as DataSource;
      const Icon = getSourceIcon(source.type);
      return (
        <div
          key={source.id}
          draggable
          onDragStart={onDragStart(source)}
          onDragEnd={onDragEnd}
          onClick={() => onItemSelect({ id: source.id, type: 'source', data: source })}
          className={cn(
            'flex items-center h-7 pl-8 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group',
            activeItem?.id === source.id && 'bg-orange-50 text-orange-700'
          )}
        >
          <Icon
            size={16}
            className={cn(
              'flex-shrink-0 mr-2',
              activeItem?.id === source.id ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
            )}
          />
          <span className="truncate">{source.name}</span>
        </div>
      );
    }

    const note = item as Note;
    return (
      <div
        key={note.id}
        onClick={() => {
          if (note.isLoading) return;
          onItemSelect({ id: note.id, type: 'asset', data: note });
        }}
        className={cn(
          'flex items-center h-7 pl-8 pr-2 text-[13px] cursor-pointer group',
          note.isLoading ? 'text-gray-400 cursor-wait' : 'text-gray-700 hover:bg-gray-100/80',
          activeItem?.id === note.id && !note.isLoading && 'bg-orange-50 text-orange-700'
        )}
      >
        <span className="mr-2">{getFileIcon(note)}</span>
        <span className={cn('truncate', note.isLoading && 'italic')}>
          {note.title}
          {note.isLoading && <span className="ml-1.5 text-[11px] text-gray-400">(生成中...)</span>}
        </span>
      </div>
    );
  };

  // Render file tree item (user files with folder support)
  const renderFileTreeItem = (item: Note, level = 0) => {
    const hasChildren = notes.some((n) => n.parentId === item.id);
    const paddingLeft = level * 12 + 8;

    return (
      <div key={item.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              onClick={() => {
                if (item.isLoading) return;
                if (item.type === 'folder') {
                  onToggleFolder(item.id);
                } else {
                  onItemSelect({ id: item.id, type: 'note', data: item });
                }
              }}
              className={cn(
                'flex items-center h-7 pr-2 text-[13px] transition-colors group relative',
                item.isLoading
                  ? 'cursor-wait text-gray-400'
                  : 'cursor-pointer hover:bg-gray-100/80 text-gray-700',
                activeItem?.id === item.id && !item.isLoading && 'bg-orange-50 text-orange-700'
              )}
              style={{ paddingLeft }}
            >
              {/* Folder arrow or spacer */}
              {item.type === 'folder' ? (
                <ChevronRight
                  size={16}
                  className={cn(
                    'text-gray-400 transition-transform flex-shrink-0 mr-0.5',
                    item.isExpanded && 'rotate-90',
                    !hasChildren && 'opacity-0'
                  )}
                />
              ) : (
                <span className="w-[16px] flex-shrink-0 mr-0.5" />
              )}

              {/* Icon */}
              {item.type === 'folder' ? (
                <FolderIcon size={16} className="text-blue-500 fill-blue-500/20 flex-shrink-0 mr-2" />
              ) : (
                <span className="mr-2">{getFileIcon(item)}</span>
              )}

              {/* File name */}
              {editingId === item.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="flex-1 bg-white border border-blue-400 rounded px-1.5 py-0.5 text-[13px] focus:outline-none min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={cn('truncate flex-1', item.isLoading && 'text-gray-400 italic')}>
                  {item.title}
                  {item.isLoading && <span className="ml-1.5 text-[11px] text-gray-400">(生成中...)</span>}
                </span>
              )}

              {/* Folder hover actions */}
              {item.type === 'folder' && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateFolder(item.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                    title="New Folder"
                  >
                    <FolderPlus size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateNote(item.id);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"
                    title="New Note"
                  >
                    <FilePlus size={14} />
                  </button>
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => startRenaming(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </ContextMenuItem>
            {item.type === 'folder' && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => onCreateNote(item.id)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onCreateFolder(item.id)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </ContextMenuItem>
              </>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDeleteNote(item.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Recursive Children */}
        <AnimatePresence>
          {item.type === 'folder' && item.isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {notes
                .filter((n) => n.parentId === item.id)
                .map((child) => renderFileTreeItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="font-semibold text-[13px] text-gray-600 uppercase tracking-wide">Files</h2>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onOpenAddFilesModal}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
            title="Upload Files"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => onCreateFolder()}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={() => onCreateNote()}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
            title="New Note"
          >
            <FilePlus size={16} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {/* Sources Folder */}
          <div>
            <div
              onClick={() => toggleVirtualFolder('sources')}
              className="flex items-center h-7 pl-2 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group"
            >
              <ChevronRight
                size={16}
                className={cn(
                  'text-gray-400 transition-transform flex-shrink-0 mr-0.5',
                  expandedFolders.includes('sources') && 'rotate-90'
                )}
              />
              <FolderIcon size={16} className="text-orange-500 fill-orange-500/20 flex-shrink-0 mr-2" />
              <span className="font-medium">Sources</span>
              <span className="text-[11px] text-gray-400 ml-auto">{sources.length}</span>
            </div>
            <AnimatePresence>
              {expandedFolders.includes('sources') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {sources.length === 0 ? (
                    <div className="h-7 pl-8 flex items-center text-[12px] text-gray-400 italic">
                      No sources yet
                    </div>
                  ) : (
                    sources.map((source) => renderVirtualFolderItem(source, true))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Asset Folder (Agent generated) */}
          <div>
            <div
              onClick={() => toggleVirtualFolder('asset')}
              className="flex items-center h-7 pl-2 pr-2 hover:bg-gray-100/80 cursor-pointer text-[13px] text-gray-700 group"
            >
              <ChevronRight
                size={16}
                className={cn(
                  'text-gray-400 transition-transform flex-shrink-0 mr-0.5',
                  expandedFolders.includes('asset') && 'rotate-90'
                )}
              />
              <Sparkles size={16} className="text-purple-500 flex-shrink-0 mr-2" />
              <span className="font-medium">Asset</span>
              <span className="text-[11px] text-gray-400 ml-auto">{agentFiles.length}</span>
            </div>
            <AnimatePresence>
              {expandedFolders.includes('asset') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {agentFiles.length === 0 ? (
                    <div className="h-7 pl-8 flex items-center text-[12px] text-gray-400 italic">
                      No assets yet
                    </div>
                  ) : (
                    agentFiles.map((item) => renderVirtualFolderItem(item, false))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Files */}
          {userFiles.map((item) => renderFileTreeItem(item, 0))}
        </div>
      </ScrollArea>
    </>
  );
}
