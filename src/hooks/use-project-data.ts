import { useMemo, useCallback } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { ProjectSource, ProjectFile, AttachedFile, ProjectConversation } from '@/types/project';
import { DataSource, Note, ChatMessage } from '@/types/desk';
import { formatTimeAgo } from '@/lib/utils';

/**
 * Convert ProjectSource to DataSource for display
 */
function convertProjectSourceToDataSource(source: ProjectSource): DataSource {
  const getType = (sourceType: ProjectSource['type']): DataSource['type'] => {
    if (sourceType === 'file') {
      const mimeType = source.metadata.mimeType || '';
      if (mimeType.startsWith('audio/')) return 'audio';
      return 'document';
    }
    return 'document';
  };

  return {
    id: source.id,
    name: source.name,
    type: getType(source.type),
    size: source.metadata.size || 'Unknown',
    lastUpdated: formatTimeAgo(source.metadata.uploadedAt),
    isSelected: false,
  };
}

/**
 * Convert ProjectFile to Note for display
 */
function convertProjectFileToNote(file: ProjectFile): Note {
  const getFileType = (type: ProjectFile['type']): Note['type'] => {
    if (type === 'folder') return 'folder';
    if (type === 'audio-clip') return 'audio-clip';
    return 'note';
  };

  return {
    id: file.id,
    type: getFileType(file.type),
    title: file.title,
    content: file.content,
    tags: file.metadata.tags,
    date: formatTimeAgo(file.metadata.updatedAt),
    parentId: file.parentId,
    isExpanded: file.metadata.isExpanded,
    isLoading: file.metadata.isLoading,
    fileType:
      file.type === 'infographic'
        ? 'infographic'
        : file.type === 'ppt'
          ? 'ppt'
          : file.type === 'mindmap'
            ? 'mindmap'
            : undefined,
    sourceId: file.sourceId,
    createdBy: file.createdBy,
  };
}

/**
 * Convert AttachedFile to DataSource for fallback display
 */
function convertAttachedFileToDataSource(file: AttachedFile): DataSource {
  return {
    id: file.id,
    name: file.name,
    type: 'document',
    size: file.size || 'Unknown',
    lastUpdated: 'Just now',
    isSelected: false,
  };
}

export interface UseProjectDataOptions {
  projectId: string | undefined;
}

export interface UseProjectDataReturn {
  // Project data
  project: ReturnType<ReturnType<typeof useProjects>['getProject']>;
  sources: DataSource[];
  notes: Note[];
  chatHistory: ChatMessage[];
  conversations: ProjectConversation[];
  attachedFiles: AttachedFile[];

  // Update functions
  updateProject: ReturnType<typeof useProjects>['updateProject'];
  updateSources: (sources: DataSource[]) => void;
  updateNotes: (notes: Note[]) => void;
  updateChatHistory: (messages: ChatMessage[]) => void;
  addNote: (note: Note) => void;
  updateNote: (noteId: string | number, updates: Partial<Note>) => void;
  deleteNote: (noteId: string | number) => void;
  addChatMessage: (message: ChatMessage) => void;

  // File operations
  handleFilesChange: (files: AttachedFile[]) => void;
}

/**
 * Hook to manage project data with simplified data flow.
 * Data flows from ProjectContext -> derived display data.
 * Updates go through ProjectContext, which triggers re-render with new derived data.
 */
export function useProjectData({ projectId }: UseProjectDataOptions): UseProjectDataReturn {
  const { getProject, updateProject } = useProjects();
  const project = projectId ? getProject(projectId) : null;

  // Derive display data from project - memoized to prevent unnecessary re-renders
  const sources = useMemo<DataSource[]>(() => {
    if (!project) return [];

    // Use project.sources if available, fallback to attachedFiles
    if (project.sources && project.sources.length > 0) {
      return project.sources.map(convertProjectSourceToDataSource);
    }

    if (project.attachedFiles && project.attachedFiles.length > 0) {
      return project.attachedFiles.map(convertAttachedFileToDataSource);
    }

    return [];
  }, [project]);

  const notes = useMemo<Note[]>(() => {
    if (!project?.files) return [];
    return project.files.map(convertProjectFileToNote);
  }, [project]);

  const chatHistory = useMemo<ChatMessage[]>(() => {
    if (!project?.conversations?.[0]?.messages) return [];
    return project.conversations[0].messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      citations: msg.citations?.map(String),
    }));
  }, [project]);

  const conversations = useMemo<ProjectConversation[]>(() => {
    return project?.conversations || [];
  }, [project]);

  const attachedFiles = useMemo<AttachedFile[]>(() => {
    return project?.attachedFiles || [];
  }, [project]);

  // Update functions that go through ProjectContext
  const updateSources = useCallback(
    (newSources: DataSource[]) => {
      if (!projectId) return;

      // Convert DataSource back to ProjectSource for storage
      const projectSources: ProjectSource[] = newSources.map((source) => ({
        id: source.id,
        type: 'file' as const,
        name: source.name,
        content: '',
        metadata: {
          size: source.size,
          uploadedAt: Date.now(),
          indexed: false,
        },
      }));

      updateProject(projectId, {
        sources: projectSources,
        sourcesCount: projectSources.length,
      });
    },
    [projectId, updateProject]
  );

  const updateNotes = useCallback(
    (newNotes: Note[]) => {
      if (!projectId) return;

      // Convert Note back to ProjectFile for storage
      const projectFiles: ProjectFile[] = newNotes.map((note) => ({
        id: String(note.id),
        type: note.fileType || (note.type as ProjectFile['type']),
        title: note.title,
        content: note.content,
        parentId: note.parentId ? String(note.parentId) : undefined,
        sourceId: note.sourceId,
        createdBy: note.createdBy,
        metadata: {
          tags: note.tags,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isExpanded: note.isExpanded,
          isLoading: note.isLoading,
        },
      }));

      updateProject(projectId, { files: projectFiles });
    },
    [projectId, updateProject]
  );

  const addNote = useCallback(
    (note: Note) => {
      if (!projectId || !project) return;

      const newFile: ProjectFile = {
        id: String(note.id),
        type: note.fileType || (note.type as ProjectFile['type']),
        title: note.title,
        content: note.content,
        parentId: note.parentId ? String(note.parentId) : undefined,
        sourceId: note.sourceId,
        createdBy: note.createdBy,
        metadata: {
          tags: note.tags,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isExpanded: note.isExpanded,
          isLoading: note.isLoading,
        },
      };

      updateProject(projectId, {
        files: [newFile, ...(project.files || [])],
      });
    },
    [projectId, project, updateProject]
  );

  const updateNote = useCallback(
    (noteId: string | number, updates: Partial<Note>) => {
      if (!projectId || !project) return;

      const updatedFiles = (project.files || []).map((file) => {
        if (file.id === String(noteId)) {
          return {
            ...file,
            title: updates.title ?? file.title,
            content: updates.content ?? file.content,
            metadata: {
              ...file.metadata,
              tags: updates.tags ?? file.metadata.tags,
              updatedAt: Date.now(),
              isExpanded: updates.isExpanded ?? file.metadata.isExpanded,
              isLoading: updates.isLoading ?? file.metadata.isLoading,
            },
          };
        }
        return file;
      });

      updateProject(projectId, { files: updatedFiles });
    },
    [projectId, project, updateProject]
  );

  const deleteNote = useCallback(
    (noteId: string | number) => {
      if (!projectId || !project) return;

      const filteredFiles = (project.files || []).filter((file) => file.id !== String(noteId));
      updateProject(projectId, { files: filteredFiles });
    },
    [projectId, project, updateProject]
  );

  const updateChatHistory = useCallback(
    (messages: ChatMessage[]) => {
      if (!projectId || !project) return;

      const conversations = project.conversations || [];
      const firstConversation = conversations[0] || {
        id: 'default',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        citations: msg.citations,
      }));

      updateProject(projectId, {
        conversations: [
          {
            ...firstConversation,
            messages: updatedMessages,
            updatedAt: new Date(),
          },
          ...conversations.slice(1),
        ],
      });
    },
    [projectId, project, updateProject]
  );

  const addChatMessage = useCallback(
    (message: ChatMessage) => {
      if (!projectId || !project) return;

      const conversations = project.conversations || [];
      const firstConversation = conversations[0] || {
        id: 'default',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newMessage = {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: message.content,
        timestamp: message.timestamp,
        citations: message.citations,
      };

      updateProject(projectId, {
        conversations: [
          {
            ...firstConversation,
            messages: [...firstConversation.messages, newMessage],
            updatedAt: new Date(),
          },
          ...conversations.slice(1),
        ],
      });
    },
    [projectId, project, updateProject]
  );

  const handleFilesChange = useCallback(
    (newFiles: AttachedFile[]) => {
      if (!projectId || !project) return;

      // Convert AttachedFile to ProjectSource
      const newSources: ProjectSource[] = newFiles.map((file) => ({
        id: file.id,
        type:
          file.source === 'library'
            ? 'library'
            : file.source === 'url'
              ? 'url'
              : file.source === 'search'
                ? 'search'
                : 'file',
        name: file.name,
        content: file.description || '',
        metadata: {
          size: file.size,
          uploadedAt: Date.now(),
          indexed: false,
          mimeType: file.type,
        },
        attachedFileId: file.id,
      }));

      // Merge with existing sources (avoid duplicates)
      const existingSourceIds = new Set(project.sources?.map((s) => s.id) || []);
      const uniqueNewSources = newSources.filter((s) => !existingSourceIds.has(s.id));
      const updatedSources = [...(project.sources || []), ...uniqueNewSources];

      updateProject(projectId, {
        attachedFiles: newFiles,
        sources: updatedSources,
        sourcesCount: updatedSources.length,
      });
    },
    [projectId, project, updateProject]
  );

  return {
    project,
    sources,
    notes,
    chatHistory,
    conversations,
    attachedFiles,
    updateProject,
    updateSources,
    updateNotes,
    updateChatHistory,
    addNote,
    updateNote,
    deleteNote,
    addChatMessage,
    handleFilesChange,
  };
}
