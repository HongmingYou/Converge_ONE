import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Check, X } from 'lucide-react';
import { AttachedFile } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LibraryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange: (files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
  initialFiles?: AttachedFile[];
}

export function LibraryPickerModal({
  open,
  onOpenChange,
  onFilesChange,
  libraryArtifacts = [],
  initialFiles = [],
}: LibraryPickerModalProps) {
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(
    new Set(initialFiles.filter(f => f.source === 'library' && f.libraryId).map(f => f.libraryId!))
  );

  const handleSelectLibrary = (artifact: LibraryArtifact) => {
    const newSelected = new Set(selectedLibraryIds);
    let newFiles = [...files];

    if (newSelected.has(artifact.id)) {
      newSelected.delete(artifact.id);
      newFiles = newFiles.filter(f => f.libraryId !== artifact.id);
    } else {
      newSelected.add(artifact.id);
      const newFile: AttachedFile = {
        id: `library-${artifact.id}`,
        source: 'library',
        name: artifact.title,
        libraryId: artifact.id,
        type: artifact.type,
      };
      newFiles.push(newFile);
    }
    
    setSelectedLibraryIds(newSelected);
    setFiles(newFiles);
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.libraryId) {
      setSelectedLibraryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.libraryId!);
        return newSet;
      });
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClose = () => {
    onFilesChange(files);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFiles(initialFiles);
    setSelectedLibraryIds(new Set(initialFiles.filter(f => f.source === 'library' && f.libraryId).map(f => f.libraryId!)));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white border border-gray-200 shadow-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <BookOpen size={20} className="text-purple-600" />
            </div>
            Load from Library
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0 mt-4">
          {libraryArtifacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-12">
              <div>
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No library artifacts available</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-1 gap-2 pr-4">
                {libraryArtifacts.map((artifact) => {
                  const isSelected = selectedLibraryIds.has(artifact.id);
                  return (
                    <button
                      key={artifact.id}
                      onClick={() => handleSelectLibrary(artifact)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        isSelected
                          ? "bg-purple-50 border-purple-200"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                        <Check size={16} className="text-purple-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Selected Files Preview */}
        {files.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="text-xs font-medium text-gray-500 mb-2">
              Selected Files ({files.length})
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-1 pr-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <BookOpen size={14} className="text-purple-500 shrink-0" />
                    <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
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
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6"
          >
            Load Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

