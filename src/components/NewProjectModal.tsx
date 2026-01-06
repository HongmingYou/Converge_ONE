import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Upload, X, FileText, File } from 'lucide-react';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (name: string, files: File[]) => void;
}

export function NewProjectModal({ open, onOpenChange, onCreateProject }: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    onCreateProject(projectName.trim(), files);
    
    // Reset state
    setProjectName('');
    setFiles([]);
    onOpenChange(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext || '')) {
      return <FileText size={16} className="text-blue-500" />;
    }
    return <File size={16} className="text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleClose = () => {
    setProjectName('');
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-white border border-gray-200 shadow-xl">
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

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Documents <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200
                ${isDragging 
                  ? 'border-indigo-400 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
              />
              
              <div className="flex flex-col items-center gap-2 text-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-colors
                  ${isDragging ? 'bg-indigo-100' : 'bg-gray-100'}
                `}>
                  <Upload size={20} className={isDragging ? 'text-indigo-600' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop files here or <span className="text-indigo-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, TXT, MD, CSV supported
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(file)}
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
  );
}


