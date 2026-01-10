import { useState, useRef, useCallback } from 'react';
import { AttachedFile } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { getRecentUploads, getRecentUploadsAsync, addRecentUpload, RecentUploadItem } from '@/lib/recent-uploads';

export interface UseFileAttachmentOptions {
  initialFiles?: AttachedFile[];
  onFilesChange?: (files: AttachedFile[]) => void;
}

export interface UseFileAttachmentReturn {
  // State
  files: AttachedFile[];
  recentUploads: RecentUploadItem[];
  isLoadingRecent: boolean;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Actions
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleAddUrl: (url: string) => Promise<void>;
  handleSelectFromLibrary: (artifact: LibraryArtifact) => void;
  handleSelectRecentFile: (item: RecentUploadItem) => void;
  removeFile: (fileId: string) => void;
  loadRecentUploads: () => Promise<void>;
  triggerFileInput: () => void;
  setFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;

  // Helpers
  isFileAttached: (fileId: string) => boolean;
  isLibraryItemAttached: (libraryId: string) => boolean;
}

export function useFileAttachment({
  initialFiles = [],
  onFilesChange,
}: UseFileAttachmentOptions = {}): UseFileAttachmentReturn {
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles);
  const [recentUploads, setRecentUploads] = useState<RecentUploadItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent of changes
  const updateFiles = useCallback((newFiles: AttachedFile[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [onFilesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: AttachedFile[] = selectedFiles.map(file => {
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

    updateFiles([...files, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Refresh recent uploads
    setRecentUploads(getRecentUploads());
  }, [files, updateFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: AttachedFile[] = droppedFiles.map(file => {
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
      updateFiles([...files, ...newFiles]);
    }
  }, [files, updateFiles]);

  const handleAddUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;

    const trimmedUrl = url.trim();

    // Try to extract title from URL
    let title = `Web Page: ${new URL(trimmedUrl).hostname}`;
    try {
      const urlObj = new URL(trimmedUrl);
      title = `Web Page: ${urlObj.hostname}`;
    } catch {
      title = `Web Page: ${trimmedUrl.slice(0, 30)}...`;
    }

    const newFile: AttachedFile = {
      id: `url-${Date.now()}`,
      source: 'url',
      name: title,
      url: trimmedUrl,
      description: `Content from ${trimmedUrl}`,
    };

    updateFiles([...files, newFile]);
  }, [files, updateFiles]);

  const handleSelectFromLibrary = useCallback((artifact: LibraryArtifact) => {
    // Check if already added
    if (files.some(f => f.libraryId === artifact.id)) {
      // Toggle - remove if already selected
      updateFiles(files.filter(f => f.libraryId !== artifact.id));
      return;
    }

    const newFile: AttachedFile = {
      id: `library-${artifact.id}`,
      source: 'library',
      name: artifact.title,
      libraryId: artifact.id,
      type: artifact.type,
    };

    updateFiles([...files, newFile]);
  }, [files, updateFiles]);

  const handleSelectRecentFile = useCallback((item: RecentUploadItem) => {
    // Check if already attached
    if (files.some(f => f.name === item.name)) {
      return;
    }

    const newFile: AttachedFile = {
      id: `recent-${item.id}`,
      source: 'local',
      name: item.name,
      type: item.type,
      size: item.size,
    };

    updateFiles([...files, newFile]);
  }, [files, updateFiles]);

  const removeFile = useCallback((fileId: string) => {
    updateFiles(files.filter(f => f.id !== fileId));
  }, [files, updateFiles]);

  const loadRecentUploads = useCallback(async () => {
    setRecentUploads(getRecentUploads());
    setIsLoadingRecent(true);

    try {
      const uploads = await getRecentUploadsAsync();
      setRecentUploads(uploads);
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isFileAttached = useCallback((fileId: string) => {
    return files.some(f => f.id === fileId);
  }, [files]);

  const isLibraryItemAttached = useCallback((libraryId: string) => {
    return files.some(f => f.libraryId === libraryId);
  }, [files]);

  return {
    files,
    recentUploads,
    isLoadingRecent,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    handleAddUrl,
    handleSelectFromLibrary,
    handleSelectRecentFile,
    removeFile,
    loadRecentUploads,
    triggerFileInput,
    setFiles,
    isFileAttached,
    isLibraryItemAttached,
  };
}
