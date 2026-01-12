import React, { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Clock,
  Check,
  Search,
  Link as LinkIcon,
  X,
  Loader2,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttachedFile } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { useFileAttachment } from '@/hooks/use-file-attachment';
import { cn, formatTimeAgo, getFileIconType } from '@/lib/utils';
import { LibraryPickerModal } from '@/components/LibraryPickerModal';
import { RecentUploadItem } from '@/lib/recent-uploads';
import { Skeleton } from '@/components/ui/skeleton';

// File icon component
function FileIcon({ file, size = 16 }: { file: { type?: string; source?: string }; size?: number }) {
  const iconType = getFileIconType(file);

  switch (iconType) {
    case 'image':
      return <ImageIcon size={size} className="text-blue-500" />;
    case 'url':
      return <LinkIcon size={size} className="text-blue-500" />;
    case 'search':
      return <Search size={size} className="text-green-500" />;
    case 'library':
      return <BookOpen size={size} className="text-purple-500" />;
    default:
      return <FileText size={size} className="text-gray-500" />;
  }
}

// ===== Compact Popover Version =====
interface AddFilesPopoverProps {
  attachedFiles?: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
}

export function AddFilesPopover({
  attachedFiles = [],
  onFilesChange,
  libraryArtifacts = [],
}: AddFilesPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);

  const {
    recentUploads,
    isLoadingRecent,
    fileInputRef,
    handleFileSelect,
    handleSelectRecentFile,
    triggerFileInput,
    loadRecentUploads,
  } = useFileAttachment({
    initialFiles: attachedFiles,
    onFilesChange,
  });

  useEffect(() => {
    if (showRecentModal) {
      loadRecentUploads();
    }
  }, [showRecentModal, loadRecentUploads]);

  const handleUploadClick = () => {
    triggerFileInput();
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleRecentClick = () => {
    setIsOpen(false);
    setShowRecentModal(true);
  };

  const handleLibraryClick = () => {
    setIsOpen(false);
    setShowLibraryModal(true);
  };

  const handleLibraryFilesChange = (files: AttachedFile[]) => {
    onFilesChange(files);
    setShowLibraryModal(false);
  };

  const handleRecentFileSelect = (item: RecentUploadItem) => {
    handleSelectRecentFile(item);
    setShowRecentModal(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Add files"
          >
            <Plus size={20} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-48 p-1 shadow-lg border-slate-100 rounded-lg"
        >
          <div className="flex flex-col gap-0.5">
            <button
              onClick={handleUploadClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'hover:bg-slate-100 transition-colors text-left',
                'focus:outline-none focus:bg-slate-100'
              )}
            >
              <Upload size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Upload files</span>
            </button>

            <button
              onClick={handleRecentClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'hover:bg-slate-100 transition-colors text-left',
                'focus:outline-none focus:bg-slate-100'
              )}
            >
              <Clock size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Recent uploaded</span>
            </button>

            <button
              onClick={handleLibraryClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'hover:bg-slate-100 transition-colors text-left',
                'focus:outline-none focus:bg-slate-100'
              )}
            >
              <BookOpen size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Load from library</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.json"
      />

      {/* Recent Uploaded Modal */}
      <Dialog open={showRecentModal} onOpenChange={setShowRecentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={16} className="text-amber-600" />
              </div>
              Recent Uploaded
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {isLoadingRecent ? (
              <div className="py-8 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUploads.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No recent uploads found</div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-1">
                  {recentUploads.map((item) => {
                    const isAttached = attachedFiles.some((f) => f.name === item.name);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleRecentFileSelect(item)}
                        disabled={isAttached}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                          isAttached
                            ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        )}
                      >
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <FileIcon file={{ type: item.type }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            {item.size && <span>{item.size}</span>}
                            <span>•</span>
                            <span>{formatTimeAgo(item.uploadedAt)}</span>
                          </div>
                        </div>
                        {isAttached && <Check size={16} className="text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Modal */}
      {showLibraryModal && (
        <LibraryPickerModal
          open={showLibraryModal}
          onOpenChange={setShowLibraryModal}
          onFilesChange={handleLibraryFilesChange}
          libraryArtifacts={libraryArtifacts}
          initialFiles={attachedFiles}
        />
      )}
    </>
  );
}

// ===== Full Modal Version =====
interface UnifiedAddFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange: (files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
  initialFiles?: AttachedFile[];
}

export function UnifiedAddFilesModal({
  open,
  onOpenChange,
  onFilesChange,
  libraryArtifacts = [],
  initialFiles = [],
}: UnifiedAddFilesModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const {
    files,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleAddUrl,
    handleSelectFromLibrary,
    removeFile,
    setFiles,
    isLibraryItemAttached,
  } = useFileAttachment({
    initialFiles,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setFiles(initialFiles);
      setUrlInput('');
      setActiveTab('upload');
    }
  }, [open, initialFiles, setFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropWrapper = (e: React.DragEvent) => {
    setIsDragging(false);
    handleDrop(e);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsFetchingUrl(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Brief delay for UX
    await handleAddUrl(urlInput);
    setUrlInput('');
    setIsFetchingUrl(false);
  };

  const handleClose = () => {
    onFilesChange(files);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFiles(initialFiles);
    setUrlInput('');
    onOpenChange(false);
  };

  const getSourceLabel = (source: AttachedFile['source']) => {
    switch (source) {
      case 'url':
        return 'URL';
      case 'search':
        return 'Search';
      case 'library':
        return 'Library';
      default:
        return 'Local';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white border border-gray-200 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
            Add Files
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'upload' | 'url' | 'library')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={14} />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon size={14} />
              URL
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen size={14} />
              Library
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 flex flex-col min-h-0 mt-0">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropWrapper}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex-1 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 flex items-center justify-center',
                  isDragging
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,image/*"
                />
                <div className="text-center">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors',
                      isDragging ? 'bg-indigo-100' : 'bg-gray-100'
                    )}
                  >
                    <Upload size={24} className={isDragging ? 'text-indigo-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop files here or <span className="text-indigo-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC, TXT, MD, CSV, Images supported</p>
                </div>
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="flex-1 flex flex-col min-h-0 mt-0">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL (e.g., https://example.com/article)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleUrlSubmit} disabled={!urlInput.trim() || isFetchingUrl}>
                    {isFetchingUrl ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  The page title and description will be automatically fetched.
                </p>
              </div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="flex-1 flex flex-col min-h-0 mt-0">
              {libraryArtifacts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-8">
                  <div>
                    <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No library artifacts available</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="grid grid-cols-1 gap-2">
                    {libraryArtifacts.map((artifact) => {
                      const isSelected = isLibraryItemAttached(artifact.id);
                      return (
                        <button
                          key={artifact.id}
                          onClick={() => handleSelectFromLibrary(artifact)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                            isSelected
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          )}
                        >
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            {artifact.thumbnail ? (
                              <img
                                src={artifact.thumbnail}
                                alt={artifact.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <FileText size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{artifact.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {artifact.type} • {new Date(artifact.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {isSelected && <Check size={16} className="text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Selected Files ({files.length})</div>
            <ScrollArea className="max-h-32">
              <div className="space-y-1">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                    <FileIcon file={file} size={14} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">{getSourceLabel(file.source)}</span>
                      </div>
                      {file.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{file.description}</p>
                      )}
                    </div>
                    {file.size && <span className="text-xs text-gray-400 shrink-0">{file.size}</span>}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity shrink-0"
                    >
                      <X size={12} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
          <Button type="button" variant="ghost" onClick={handleCancel} className="text-gray-600 hover:text-gray-900">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleClose}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
          >
            Add Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===== Button Version (with file count display) =====
interface AddFilesButtonProps {
  attachedFiles?: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  availableKnowledge?: any[]; // Not used but kept for compatibility
  libraryArtifacts?: LibraryArtifact[];
}

export function AddFilesButton({
  attachedFiles = [],
  onFilesChange,
  availableKnowledge = [],
  libraryArtifacts = [],
}: AddFilesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);

  const {
    files,
    fileInputRef,
    handleFileSelect,
    handleAddUrl,
    handleSelectFromLibrary,
    removeFile,
  } = useFileAttachment({
    initialFiles: attachedFiles,
    onFilesChange,
  });

  const fileCount = files.length;

  const handleAddUrlClick = async () => {
    if (!urlInput.trim()) return;
    await handleAddUrl(urlInput);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleUploadLocal = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "h-7 px-3 rounded-full flex items-center gap-2 transition-all duration-200",
              "text-xs font-medium",
              fileCount > 0
                ? "bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900"
                : "bg-transparent border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
            )}
            title="Add files to project"
          >
            {fileCount > 0 ? (
              <>
                <FileText size={14} className="text-gray-500" />
                <span>{fileCount} file{fileCount > 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Add Files</span>
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          align="center" 
          side="top" 
          sideOffset={8}
          className="w-96 p-0"
        >
          <div className="p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Add Files
              </h3>
              <p className="text-xs text-gray-500">
                Add files from Library, URL, or upload locally
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowLibraryDialog(true)}
              >
                <BookOpen size={14} className="mr-2" />
                From Library
              </Button>
              
              {!showUrlInput ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowUrlInput(true)}
                >
                  <LinkIcon size={14} className="mr-2" />
                  From URL
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddUrlClick();
                      }
                      if (e.key === 'Escape') {
                        setShowUrlInput(false);
                        setUrlInput('');
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAddUrlClick}
                    disabled={!urlInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleUploadLocal}
              >
                <Upload size={14} className="mr-2" />
                Upload Local
              </Button>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Selected Files ({files.length})
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <FileIcon file={file} size={14} />
                      <span className="flex-1 text-xs text-gray-700 truncate">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-xs text-gray-400">
                          {file.size}
                        </span>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      >
                        <X size={12} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Library Selection Dialog */}
      {showLibraryDialog && (
        <LibraryPickerModal
          open={showLibraryDialog}
          onOpenChange={setShowLibraryDialog}
          onFilesChange={(newFiles) => {
            onFilesChange(newFiles);
            setShowLibraryDialog(false);
          }}
          libraryArtifacts={libraryArtifacts}
          initialFiles={files}
        />
      )}
    </>
  );
}

// Re-export for backward compatibility
export { UnifiedAddFilesModal as AddFilesModal };
