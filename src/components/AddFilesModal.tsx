import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Search, 
  Link as LinkIcon, 
  BookOpen, 
  X, 
  FileText, 
  Check,
  Loader2
} from 'lucide-react';
import { AttachedFile, WebSearchResult } from '@/types/project';
import { LibraryArtifact } from '@/types';
import { MOCK_WEB_SEARCH_RESULTS } from '@/data/mock';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesChange: (files: AttachedFile[]) => void;
  libraryArtifacts?: LibraryArtifact[];
  initialFiles?: AttachedFile[];
}

export function AddFilesModal({
  open,
  onOpenChange,
  onFilesChange,
  libraryArtifacts = [],
  initialFiles = [],
}: AddFilesModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'url' | 'library'>('upload');
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WebSearchResult[]>([]);
  const [selectedSearchIds, setSelectedSearchIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  
  // URL state
  const [urlInput, setUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  
  // Library state
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(
    new Set(initialFiles.filter(f => f.source === 'library' && f.libraryId).map(f => f.libraryId!))
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: AttachedFile[] = Array.from(e.target.files).map(file => ({
        id: `local-${Date.now()}-${file.name}`,
        source: 'local',
        name: file.name,
        file,
        size: formatFileSize(file.size),
        type: file.type,
      }));
      setFiles(prev => [...prev, ...newFiles]);
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
      const newFiles: AttachedFile[] = Array.from(e.dataTransfer.files).map(file => ({
        id: `local-${Date.now()}-${file.name}`,
        source: 'local',
        name: file.name,
        file,
        size: formatFileSize(file.size),
        type: file.type,
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use mock results (filtered by query if needed)
    const results = MOCK_WEB_SEARCH_RESULTS.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results.length > 0 ? results : MOCK_WEB_SEARCH_RESULTS);
    setIsSearching(false);
  };

  const toggleSearchResult = (resultId: string) => {
    const newSelected = new Set(selectedSearchIds);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
      // Remove from files
      setFiles(prev => prev.filter(f => f.searchResultId !== resultId));
    } else {
      newSelected.add(resultId);
      const result = searchResults.find(r => r.id === resultId);
      if (result) {
        const newFile: AttachedFile = {
          id: `search-${resultId}`,
          source: 'search',
          name: result.title,
          url: result.url,
          searchResultId: resultId,
          description: result.snippet,
        };
        setFiles(prev => [...prev, newFile]);
      }
    }
    setSelectedSearchIds(newSelected);
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    
    setIsFetchingUrl(true);
    // Simulate URL metadata fetching
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock metadata
    const url = urlInput.trim();
    const mockTitle = `Web Page: ${new URL(url).hostname}`;
    const mockDescription = `Content from ${url}`;
    
    const newFile: AttachedFile = {
      id: `url-${Date.now()}`,
      source: 'url',
      name: mockTitle,
      url: url,
      description: mockDescription,
    };
    
    setFiles(prev => [...prev, newFile]);
    setUrlInput('');
    setIsFetchingUrl(false);
  };

  const handleSelectLibrary = (artifact: LibraryArtifact) => {
    const newSelected = new Set(selectedLibraryIds);
    if (newSelected.has(artifact.id)) {
      newSelected.delete(artifact.id);
      setFiles(prev => prev.filter(f => f.libraryId !== artifact.id));
    } else {
      newSelected.add(artifact.id);
      const newFile: AttachedFile = {
        id: `library-${artifact.id}`,
        source: 'library',
        name: artifact.title,
        libraryId: artifact.id,
        type: artifact.type,
      };
      setFiles(prev => [...prev, newFile]);
    }
    setSelectedLibraryIds(newSelected);
  };

  const removeFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file?.searchResultId) {
      setSelectedSearchIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.searchResultId!);
        return newSet;
      });
    }
    if (file?.libraryId) {
      setSelectedLibraryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.libraryId!);
        return newSet;
      });
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file: AttachedFile) => {
    switch (file.source) {
      case 'url':
        return <LinkIcon size={14} className="text-blue-500" />;
      case 'search':
        return <Search size={14} className="text-green-500" />;
      case 'library':
        return <BookOpen size={14} className="text-purple-500" />;
      default:
        return <FileText size={14} className="text-gray-500" />;
    }
  };

  const getSourceLabel = (source: AttachedFile['source']) => {
    switch (source) {
      case 'url':
        return '🔗 URL';
      case 'search':
        return '🔍 Search';
      case 'library':
        return '📚 Library';
      default:
        return '📁 Local';
    }
  };

  const handleClose = () => {
    onFilesChange(files);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFiles(initialFiles);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedSearchIds(new Set());
    setUrlInput('');
    setSelectedLibraryIds(new Set(initialFiles.filter(f => f.source === 'library' && f.libraryId).map(f => f.libraryId!)));
    onOpenChange(false);
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
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={14} />
              Upload
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search size={14} />
              Search
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
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex-1 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 flex items-center justify-center",
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
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
                />
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors",
                    isDragging ? 'bg-indigo-100' : 'bg-gray-100'
                  )}>
                    <Upload size={24} className={isDragging ? 'text-indigo-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop files here or <span className="text-indigo-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, TXT, MD, CSV supported
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="flex-1 flex flex-col min-h-0 mt-0">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search the web..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || isSearching}
                  >
                    {isSearching ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-2">
                      {searchResults.map((result) => {
                        const isSelected = selectedSearchIds.has(result.id);
                        return (
                          <button
                            key={result.id}
                            onClick={() => toggleSearchResult(result.id)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-all",
                              isSelected
                                ? "bg-indigo-50 border-indigo-200"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded border-2 border-indigo-600 bg-indigo-600 flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded border-2 border-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {result.favicon && (
                                    <img src={result.favicon} alt="" className="w-4 h-4" />
                                  )}
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {result.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {result.snippet}
                                </p>
                                <p className="text-xs text-blue-600 truncate mt-1">
                                  {result.url}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No results found. Try a different search query.
                  </div>
                )}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim() || isFetchingUrl}
                  >
                    {isFetchingUrl ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      'Add'
                    )}
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
                      const isSelected = selectedLibraryIds.has(artifact.id);
                      return (
                        <button
                          key={artifact.id}
                          onClick={() => handleSelectLibrary(artifact)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                            isSelected
                              ? "bg-indigo-50 border-indigo-200"
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
                            <Check size={16} className="text-indigo-600 shrink-0" />
                          )}
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
            <div className="text-xs font-medium text-gray-500 mb-2">
              Selected Files ({files.length})
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {getSourceLabel(file.source)}
                        </span>
                      </div>
                      {file.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {file.description}
                        </p>
                      )}
                    </div>
                    {file.size && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {file.size}
                      </span>
                    )}
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
          >
            Add Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

