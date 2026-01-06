import React, { useEffect, useRef } from 'react';
import { appRegistry } from '@/lib/app-registry';
import { Command } from 'lucide-react';

interface AppMentionMenuProps {
  isOpen: boolean;
  query: string;
  onSelect: (app: { name: string; icon: string; id: string }) => void;
  onClose: () => void;
  position?: { top: number; left: number };
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function AppMentionMenu({
  isOpen,
  query,
  onSelect,
  onClose,
  position,
  selectedIndex = 0,
  onIndexChange,
}: AppMentionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter apps based on query
  const filteredApps = React.useMemo(() => {
    const allApps = appRegistry.getAll();
    if (!query.trim()) return allApps;

    const lowerQuery = query.toLowerCase();
    return allApps.filter(
      (app) =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.description.toLowerCase().includes(lowerQuery) ||
        app.capabilities.primary.some((cap) => cap.includes(lowerQuery))
    );
  }, [query]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (menuRef.current && selectedIndex >= 0) {
      const selectedElement = menuRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }
    : { position: 'absolute', zIndex: 9999 };

  return (
    <div
      ref={menuRef}
      className="w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 py-2 max-h-[360px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
      style={style}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Command size={12} />
          <span className="font-medium">Select an AI App</span>
          {query && (
            <span className="text-gray-400">
              • {filteredApps.length} result{filteredApps.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Apps List */}
      <div className="py-1">
        {filteredApps.length > 0 ? (
          filteredApps.map((app, index) => (
            <button
              key={app.id}
              data-index={index}
              onClick={() => onSelect({ name: app.name, icon: app.icon, id: app.id })}
              onMouseEnter={() => onIndexChange?.(index)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
                ${
                  selectedIndex === index
                    ? 'bg-indigo-50 text-indigo-900'
                    : 'hover:bg-gray-50 text-gray-900'
                }
              `}
            >
              <img
                src={app.icon}
                alt={app.name}
                className="w-8 h-8 object-contain rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                  {app.provider === 'custom' && (
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded font-medium">
                      Custom
                    </span>
                  )}
                  {app.provider === 'mcp' && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">
                      MCP
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {app.description}
                </p>
              </div>
              {selectedIndex === index && (
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px] font-medium text-gray-500">
                  ↵
                </kbd>
              )}
            </button>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-400">
            No apps found matching "{query}"
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">↑</kbd>
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">↓</kbd>
          <span>Navigate</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">↵</kbd>
          <span>Select</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded">Esc</kbd>
          <span>Close</span>
        </div>
      </div>
    </div>
  );
}

