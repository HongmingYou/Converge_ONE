import React, { useState, useRef, useEffect } from 'react';
import { Plus, Upload, BookOpen, FileText, Image as ImageIcon, Clock, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AttachedFile } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { getRecentUploads, getRecentUploadsAsync, addRecentUpload, RecentUploadItem } from '@/lib/recent-uploads';
import { LibraryPickerModal } from '@/components/LibraryPickerModal';
import { cn } from '@/lib/utils';

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
  const [recentUploads, setRecentUploads] = useState<RecentUploadItem[]>([]);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Load recent uploads when recent modal opens
  useEffect(() => {
    if (showRecentModal) {
      // First, show what we have synchronously
      setRecentUploads(getRecentUploads());
      
      // Then load mock data asynchronously
      setIsLoadingRecent(true);
      getRecentUploadsAsync().then(uploads => {
        setRecentUploads(uploads);
        setIsLoadingRecent(false);
      });
    }
  }, [showRecentModal]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: AttachedFile[] = files.map(file => {
      // Save to recent uploads
      addRecentUpload(file);

      return {
        id: `local-${Date.now()}-${file.name}`,
        source: 'local',
        name: file.name,
        file,
        size: formatFileSize(file.size),
        type: file.type,
      };
    });

    onFilesChange([...attachedFiles, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Refresh recent uploads
    setRecentUploads(getRecentUploads());
    
    // Close popover after short delay
    setTimeout(() => setIsOpen(false), 300);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRecentFileSelect = (item: RecentUploadItem) => {
    // Check if already attached
    const alreadyAttached = attachedFiles.some(f => f.name === item.name);
    if (alreadyAttached) {
      return;
    }

    // Create AttachedFile from recent upload
    const newFile: AttachedFile = {
      id: `recent-${item.id}`,
      source: 'local',
      name: item.name,
      type: item.type,
      size: item.size,
      // Note: file object may not be available for old uploads
    };

    onFilesChange([...attachedFiles, newFile]);
    setShowRecentModal(false);
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

  const getFileIcon = (item: RecentUploadItem) => {
    if (item.type.startsWith('image/')) {
      return <ImageIcon size={16} className="text-blue-500" />;
    }
    return <FileText size={16} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            {/* Upload files or photos */}
            <button
              onClick={handleUploadClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                "hover:bg-slate-100 transition-colors text-left",
                "focus:outline-none focus:bg-slate-100"
              )}
            >
              <Upload size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Upload files
              </span>
            </button>

            {/* Recent uploaded */}
            <button
              onClick={handleRecentClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                "hover:bg-slate-100 transition-colors text-left",
                "focus:outline-none focus:bg-slate-100"
              )}
            >
              <Clock size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Recent uploaded
              </span>
            </button>

            {/* Load from library */}
            <button
              onClick={handleLibraryClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md",
                "hover:bg-slate-100 transition-colors text-left",
                "focus:outline-none focus:bg-slate-100"
              )}
            >
              <BookOpen size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Load from library
              </span>
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
              <div className="py-8 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : recentUploads.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No recent uploads found
              </div>
            ) : (
              <ScrollArea className="max-h-80">
                <div className="space-y-1">
                  {recentUploads.map((item) => {
                    const isAttached = attachedFiles.some(f => f.name === item.name);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleRecentFileSelect(item)}
                        disabled={isAttached}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          isAttached
                            ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                            {getFileIcon(item)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            {item.size && <span>{item.size}</span>}
                            <span>•</span>
                            <span>{formatTimeAgo(item.uploadedAt)}</span>
                          </div>
                        </div>
                        {isAttached && (
                          <Check size={16} className="text-indigo-600 shrink-0" />
                        )}
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

/**
 * Format timestamp to "time ago" string
 */
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

