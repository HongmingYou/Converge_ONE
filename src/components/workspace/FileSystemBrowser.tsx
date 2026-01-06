import { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  User,
  FileType,
  Image as ImageIcon,
  Code,
  FileText,
  BarChart3,
  Workflow,
  Clock,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { AgentAssetData, AssetType } from '@/types/project';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentAssetCard } from './AgentAssetCard';

type FolderType = 'time' | 'agent' | 'type' | 'root';
type SortOrder = 'asc' | 'desc';
type SortField = 'name' | 'date' | 'type';

interface FolderNode {
  id: string;
  name: string;
  type: FolderType;
  children: FolderNode[];
  assets: AgentAssetData[];
}

interface FileSystemBrowserProps {
  assets: AgentAssetData[];
  onTrace?: (conversationId: string, messageId: string) => void;
  onRemix?: (asset: AgentAssetData) => void;
  onSave?: (asset: AgentAssetData) => void;
  onPin?: (assetId: string, pinned: boolean) => void;
}

const getAssetTypeIcon = (type: AssetType) => {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'code':
      return Code;
    case 'document':
      return FileText;
    case 'data':
      return BarChart3;
    case 'workflow':
      return Workflow;
    default:
      return FileText;
  }
};

const buildFolderTree = (assets: AgentAssetData[]): FolderNode => {
  const root: FolderNode = {
    id: 'root',
    name: 'All Assets',
    type: 'root',
    children: [],
    assets: [],
  };

  // Time folders (Today, This Week, This Month, Older)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const timeFolders: FolderNode[] = [
    {
      id: 'time-today',
      name: 'Today',
      type: 'time',
      children: [],
      assets: assets.filter(a => a.createdAt >= today),
    },
    {
      id: 'time-week',
      name: 'This Week',
      type: 'time',
      children: [],
      assets: assets.filter(a => a.createdAt >= weekAgo && a.createdAt < today),
    },
    {
      id: 'time-month',
      name: 'This Month',
      type: 'time',
      children: [],
      assets: assets.filter(a => a.createdAt >= monthAgo && a.createdAt < weekAgo),
    },
    {
      id: 'time-older',
      name: 'Older',
      type: 'time',
      children: [],
      assets: assets.filter(a => a.createdAt < monthAgo),
    },
  ];

  // Agent folders
  const agentMap = new Map<string, AgentAssetData[]>();
  assets.forEach(asset => {
    const agentName = asset.agent.name;
    if (!agentMap.has(agentName)) {
      agentMap.set(agentName, []);
    }
    agentMap.get(agentName)!.push(asset);
  });

  const agentFolders: FolderNode[] = Array.from(agentMap.entries()).map(([name, assets]) => ({
    id: `agent-${name}`,
    name: name,
    type: 'agent',
    children: [],
    assets,
  }));

  // Type folders
  const typeMap = new Map<AssetType, AgentAssetData[]>();
  assets.forEach(asset => {
    if (!typeMap.has(asset.type)) {
      typeMap.set(asset.type, []);
    }
    typeMap.get(asset.type)!.push(asset);
  });

  const typeFolders: FolderNode[] = Array.from(typeMap.entries()).map(([type, assets]) => ({
    id: `type-${type}`,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    type: 'type',
    children: [],
    assets,
  }));

  root.children = [
    {
      id: 'by-time',
      name: 'By Time',
      type: 'time',
      children: timeFolders,
      assets: [],
    },
    {
      id: 'by-agent',
      name: 'By Agent',
      type: 'agent',
      children: agentFolders,
      assets: [],
    },
    {
      id: 'by-type',
      name: 'By Type',
      type: 'type',
      children: typeFolders,
      assets: [],
    },
  ];

  return root;
};

export function FileSystemBrowser({
  assets,
  onTrace,
  onRemix,
  onSave,
  onPin,
}: FileSystemBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'by-time', 'by-agent', 'by-type']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [breadcrumbPath, setBreadcrumbPath] = useState<string[]>(['All Assets']);

  const folderTree = useMemo(() => buildFolderTree(assets), [assets]);

  const findFolder = (node: FolderNode, id: string): FolderNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findFolder(child, id);
      if (found) return found;
    }
    return null;
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const selectFolder = (folderId: string, folderName: string) => {
    setSelectedFolder(folderId);
    const folder = findFolder(folderTree, folderId);
    if (folder) {
      // Build breadcrumb path
      const path: string[] = ['All Assets'];
      if (folder.type !== 'root') {
        path.push(folderName);
      }
      setBreadcrumbPath(path);
    }
  };

  const currentFolder = selectedFolder ? findFolder(folderTree, selectedFolder) : folderTree;
  const displayedAssets = currentFolder?.assets || [];

  const sortedAssets = useMemo(() => {
    return [...displayedAssets].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [displayedAssets, sortField, sortOrder]);

  const renderFolderNode = (node: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedFolder === node.id;

    return (
      <div key={node.id}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors
            ${isSelected ? 'bg-orange-100 text-orange-900' : 'hover:bg-stone-100'}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleFolder(node.id);
            }
            selectFolder(node.id, node.name);
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.id);
              }}
              className="p-0.5 hover:bg-stone-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-stone-500" />
              ) : (
                <ChevronRight size={14} className="text-stone-500" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-[14px]" />}
          
          {isExpanded ? (
            <FolderOpen size={16} className="text-orange-600" />
          ) : (
            <Folder size={16} className="text-stone-500" />
          )}
          
          <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
          {node.assets.length > 0 && (
            <span className="text-xs text-stone-400">{node.assets.length}</span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Left Sidebar - Folder Tree */}
      <div className="w-64 border-r border-stone-200 flex flex-col">
        <div className="p-3 border-b border-stone-200">
          <h3 className="text-sm font-semibold text-stone-900">Folders</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {renderFolderNode(folderTree)}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - File List */}
      <div className="flex-1 flex flex-col">
        {/* Header with Breadcrumb and Sort */}
        <div className="p-4 border-b border-stone-200 space-y-3">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbPath.map((path, idx) => (
                <div key={idx} className="flex items-center">
                  {idx > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {idx === breadcrumbPath.length - 1 ? (
                      <BreadcrumbPage>{path}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => {
                          if (idx === 0) {
                            selectFolder('root', 'All Assets');
                          }
                        }}
                      >
                        {path}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="text-xs border border-stone-200 rounded px-2 py-1 bg-white"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-stone-100 rounded"
            >
              {sortOrder === 'asc' ? (
                <SortAsc size={14} className="text-stone-500" />
              ) : (
                <SortDesc size={14} className="text-stone-500" />
              )}
            </button>
            <span className="text-xs text-stone-400 ml-auto">
              {sortedAssets.length} {sortedAssets.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Asset Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {sortedAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                <Folder size={48} className="mb-2 opacity-50" />
                <p className="text-sm">No assets in this folder</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAssets.map(asset => (
                  <AgentAssetCard
                    key={asset.id}
                    data={asset}
                    onTrace={onTrace}
                    onRemix={onRemix}
                    onSave={onSave}
                    onPin={onPin}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

