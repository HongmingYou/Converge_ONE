import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { appRegistry } from '@/lib/app-registry';
import { findAppsByCategory } from '@/lib/capability-matcher';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectApp: (app: { name: string; icon: string; id: string }) => void;
  trigger?: React.ReactNode;
}

const CATEGORIES = [
  { id: 'design', label: 'Design & Creative', icon: '🎨' },
  { id: 'development', label: 'Development', icon: '💻' },
  { id: 'research', label: 'Research & Analysis', icon: '🔍' },
  { id: 'automation', label: 'Automation', icon: '🔄' },
];

export function AppPalette({ open, onOpenChange, onSelectApp, trigger }: AppPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get apps grouped by provider
  const getGroupedApps = () => {
    try {
      const allApps = appRegistry.getAll();
      const builtIn = allApps.filter(app => app.provider === 'native');
      const mcp = allApps.filter(app => app.provider === 'mcp');

      // Filter by search query
      const filterApps = (apps: import('@/types/mcp').MCPApp[]) => {
        if (!searchQuery) return apps;
        const query = searchQuery.toLowerCase();
        return apps.filter(app =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.capabilities.primary.some(cap => cap.includes(query)) ||
          app.triggers.keywords.some(kw => kw.toLowerCase().includes(query))
        );
      };

      return {
        builtIn: filterApps(builtIn),
        mcp: filterApps(mcp),
      };
    } catch (error) {
      console.error('Error getting apps:', error);
      return { builtIn: [], mcp: [] };
    }
  };

  const groupedApps = getGroupedApps();

  const handleSelectApp = (app: import('@/types/mcp').MCPApp) => {
    onSelectApp({
      name: app.name,
      icon: app.icon,
      id: app.id,
    });
    if (onOpenChange) onOpenChange(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent className="w-[600px] p-0" align="start" side="top">
        <div className="flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Select App</h2>
              {onOpenChange && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          {!searchQuery && (
            <div className="px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === null
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                All Apps
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${selectedCategory === cat.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Apps List - Grouped */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Built-in AI Apps */}
              {groupedApps.builtIn.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Built-in AI Apps
                  </h3>
                  <div className="space-y-2">
                    {groupedApps.builtIn.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                      >
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-10 h-10 object-contain rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{app.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Apps (MCP) */}
              {groupedApps.mcp.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Connected Apps (MCP)
                  </h3>
                  <div className="space-y-2">
                    {groupedApps.mcp.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                      >
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-10 h-10 object-contain rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{app.name}</h3>
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              MCP
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">{app.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {groupedApps.builtIn.length === 0 && groupedApps.mcp.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>No apps found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

