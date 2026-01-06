import React, { useState } from 'react';
import { FileText, Plus, X, Link, Upload, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AttachedFile } from '@/types/project';
import { KnowledgeCollection, LibraryArtifact } from '@/types';
import { cn } from '@/lib/utils';

interface AddFilesButtonProps {
  attachedFiles?: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  availableKnowledge?: KnowledgeCollection[];
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fileCount = attachedFiles.length;

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    const newFile: AttachedFile = {
      id: `url-${Date.now()}`,
      source: 'url',
      name: urlInput.trim(),
      url: urlInput.trim(),
    };
    
    onFilesChange([...attachedFiles, newFile]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleUploadLocal = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: AttachedFile[] = files.map(file => ({
      id: `local-${Date.now()}-${file.name}`,
      source: 'local',
      name: file.name,
      file,
      size: formatFileSize(file.size),
      type: file.type,
    }));
    
    onFilesChange([...attachedFiles, ...newFiles]);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(attachedFiles.filter(f => f.id !== fileId));
  };

  const handleSelectFromLibrary = (artifact: LibraryArtifact) => {
    const newFile: AttachedFile = {
      id: `library-${artifact.id}`,
      source: 'library',
      name: artifact.title,
      libraryId: artifact.id,
      type: artifact.type,
    };
    
    // Check if already added
    if (attachedFiles.some(f => f.libraryId === artifact.id)) {
      return;
    }
    
    onFilesChange([...attachedFiles, newFile]);
    setShowLibraryDialog(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: AttachedFile) => {
    if (file.source === 'url') return <Link size={14} className="text-blue-500" />;
    if (file.source === 'library') return <BookOpen size={14} className="text-purple-500" />;
    return <FileText size={14} className="text-gray-500" />;
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
                  <Link size={14} className="mr-2" />
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
                        handleAddUrl();
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
                    onClick={handleAddUrl}
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
            {attachedFiles.length > 0 && (
              <div className="border-t border-gray-200 pt-3">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Selected Files ({attachedFiles.length})
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      {getFileIcon(file)}
                      <span className="flex-1 text-xs text-gray-700 truncate">
                        {file.name}
                      </span>
                      {file.size && (
                        <span className="text-xs text-gray-400">
                          {file.size}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveFile(file.id)}
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
      <Dialog open={showLibraryDialog} onOpenChange={setShowLibraryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select from Library</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {libraryArtifacts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No library artifacts available
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {libraryArtifacts.map((artifact) => {
                  const isSelected = attachedFiles.some(f => f.libraryId === artifact.id);
                  return (
                    <button
                      key={artifact.id}
                      onClick={() => handleSelectFromLibrary(artifact)}
                      disabled={isSelected}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                        isSelected
                          ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50 border-gray-200 hover:border-gray-300"
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
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {artifact.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {artifact.type} • {new Date(artifact.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-xs text-indigo-600 font-medium shrink-0">
                          Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

