import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from 'lucide-react';
import { AttachedFile } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { format } from 'date-fns';
import { AddFilesModal } from './AddFilesModal';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
}

export function NewProjectModal({ 
  open, 
  onOpenChange, 
  onCreateProject,
  libraryArtifacts = [],
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = useState(false);

  // Set default project name when modal opens
  useEffect(() => {
    if (open) {
      const defaultName = `New Project_${format(new Date(), 'yyyy-MM-dd')}`;
      setProjectName(defaultName);
      setFiles([]);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    onCreateProject(projectName.trim(), files);
    
    // Reset state
    setProjectName('');
    setFiles([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setProjectName('');
    setFiles([]);
    onOpenChange(false);
  };

  const handleFilesChange = (newFiles: AttachedFile[]) => {
    setFiles(newFiles);
    setIsAddFilesModalOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Folder size={20} className="text-white" />
              </div>
              Create New Project
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Project Name Input */}
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-gray-700">
                Project Name
              </label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="h-11 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Files Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Documents <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                {files.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-3">
                      No files added yet
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddFilesModalOpen(true)}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Add Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {files.length} file{files.length > 1 ? 's' : ''} selected
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddFilesModalOpen(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        Add More
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {files.map((file) => {
                        const getSourceIcon = () => {
                          switch (file.source) {
                            case 'url':
                              return '🔗';
                            case 'search':
                              return '🔍';
                            case 'library':
                              return '📚';
                            default:
                              return '📁';
                          }
                        };
                        
                        return (
                          <div
                            key={file.id}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                          >
                            <span className="text-sm">{getSourceIcon()}</span>
                            <span className="text-sm text-gray-700 truncate flex-1">
                              {file.name}
                            </span>
                            {file.size && (
                              <span className="text-xs text-gray-400 shrink-0">
                                {file.size}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!projectName.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
              >
                Create Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Files Modal */}
      <AddFilesModal
        open={isAddFilesModalOpen}
        onOpenChange={setIsAddFilesModalOpen}
        onFilesChange={handleFilesChange}
        libraryArtifacts={libraryArtifacts}
        initialFiles={files}
      />
    </>
  );
}
