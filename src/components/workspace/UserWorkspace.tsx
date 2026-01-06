import React, { useState } from 'react';
import { Upload, FileText, MessageSquare, StickyNote, FileDown, Plus, X, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Workspace, WorkspaceSource, WorkspaceChatMessage, WorkspaceNote, WorkspaceOutput } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface UserWorkspaceProps {
  workspace: Workspace;
  onBack: () => void;
}

export function UserWorkspace({ workspace, onBack }: UserWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'chat' | 'notes' | 'outputs'>('sources');
  const [sources, setSources] = useState<WorkspaceSource[]>([]);
  const [chatMessages, setChatMessages] = useState<WorkspaceChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [outputs, setOutputs] = useState<WorkspaceOutput[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const newSource: WorkspaceSource = {
        id: `source-${Date.now()}-${Math.random()}`,
        workspaceId: workspace.id,
        title: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        uploadedAt: Date.now(),
        indexed: false,
      };
      setSources(prev => [...prev, newSource]);
    });

    setIsUploadDialogOpen(false);
  };

  const getFileType = (filename: string): WorkspaceSource['type'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'txt') return 'txt';
    if (ext === 'md') return 'md';
    if (ext === 'csv') return 'csv';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    return 'txt';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage: WorkspaceChatMessage = {
      id: `msg-${Date.now()}`,
      workspaceId: workspace.id,
      role: 'user',
      content: chatInput,
      createdAt: Date.now(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: WorkspaceChatMessage = {
        id: `msg-${Date.now() + 1}`,
        workspaceId: workspace.id,
        role: 'assistant',
        content: `Based on the ${sources.length} sources in this workspace, here's what I found...`,
        sources: sources.slice(0, 2).map(s => s.id),
        createdAt: Date.now() + 1,
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleQuickCreate = (type: 'slides' | 'summary' | 'report') => {
    const newOutput: WorkspaceOutput = {
      id: `output-${Date.now()}`,
      workspaceId: workspace.id,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`,
      content: `Generated ${type} content`,
      createdAt: Date.now(),
    };
    setOutputs(prev => [...prev, newOutput]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div className="text-3xl">{workspace.icon || '📁'}</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-sm text-gray-500">{workspace.description || 'Knowledge workspace'}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="sources">
              <FileText size={16} className="mr-2" />
              Sources ({sources.length})
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare size={16} className="mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote size={16} className="mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="outputs">
              <FileDown size={16} className="mr-2" />
              Outputs ({outputs.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          {/* Sources Tab */}
          <TabsContent value="sources" className="p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Knowledge Base</h2>
                <Button
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="bg-slate-900 hover:bg-indigo-600 text-white"
                >
                  <Upload size={18} className="mr-2" />
                  Upload Sources
                </Button>
              </div>

              {sources.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">No sources yet</p>
                  <p className="text-sm text-gray-400 mb-4">Upload documents to build your knowledge base</p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    Upload Your First Source
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sources.map(source => (
                    <div
                      key={source.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <FileText size={24} className="text-indigo-600" />
                        <button className="text-gray-400 hover:text-gray-600">
                          <X size={16} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{source.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{source.type}</span>
                        <span>{source.size}</span>
                        {source.indexed && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Indexed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto space-y-6">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <Sparkles size={48} className="mx-auto text-indigo-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-500">Ask questions about your knowledge base</p>
                  </div>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {msg.content}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Referenced {msg.sources.length} source(s)
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="Ask about your knowledge base..."
                  className="flex-1"
                />
                <Button onClick={handleSendChat} disabled={!chatInput.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
                <Button>
                  <Plus size={18} className="mr-2" />
                  New Note
                </Button>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <StickyNote size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map(note => (
                    <div key={note.id} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{note.title}</h3>
                      <p className="text-gray-600 text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Outputs Tab */}
          <TabsContent value="outputs" className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Create</h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleQuickCreate('slides')}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                  >
                    <FileDown size={32} className="mx-auto mb-2 text-indigo-600" />
                    <div className="font-semibold text-gray-900">Generate Slides</div>
                    <div className="text-sm text-gray-500 mt-1">Create presentation</div>
                  </button>
                  <button
                    onClick={() => handleQuickCreate('summary')}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                  >
                    <FileText size={32} className="mx-auto mb-2 text-indigo-600" />
                    <div className="font-semibold text-gray-900">Create Summary</div>
                    <div className="text-sm text-gray-500 mt-1">Generate document</div>
                  </button>
                  <button
                    onClick={() => handleQuickCreate('report')}
                    className="p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
                  >
                    <FileDown size={32} className="mx-auto mb-2 text-indigo-600" />
                    <div className="font-semibold text-gray-900">Export Report</div>
                    <div className="text-sm text-gray-500 mt-1">Full analysis</div>
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Outputs</h2>
              {outputs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileDown size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No outputs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outputs.map(output => (
                    <div key={output.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{output.title}</h3>
                        <p className="text-sm text-gray-500">{output.type}</p>
                      </div>
                      <Button className="bg-gray-100 hover:bg-gray-200">Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Sources</DialogTitle>
            <DialogDescription>
              Upload documents to build your knowledge base. Supported formats: PDF, DOCX, TXT, MD, CSV, Images
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md,.csv,.jpg,.jpeg,.png"
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Choose Files
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

