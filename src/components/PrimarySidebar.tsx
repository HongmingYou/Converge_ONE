import React from 'react';
import { MessageSquare, Folder, Settings, Bell } from 'lucide-react';
import { ViewMode } from '@/types';
import { ProjectData } from '@/types/project';

interface PrimarySidebarProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  recentProjects?: ProjectData[];
  onProjectClick?: (projectId: string) => void;
  onLogoClick?: () => void;
}

export function PrimarySidebar({ 
  activeView, 
  setActiveView,
  recentProjects = [],
  onProjectClick,
  onLogoClick,
}: PrimarySidebarProps) {
  const navItems = [
    { id: 'chat', icon: <MessageSquare size={20} />, label: 'Chat' },
    { id: 'projects', icon: <Folder size={20} />, label: 'Project' },
  ];

  return (
    <div className="w-[60px] bg-black h-full flex flex-col items-center py-4 gap-4 z-50 flex-shrink-0 relative">
      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="w-10 h-10 flex items-center justify-center mb-4 cursor-pointer hover:opacity-90 transition-opacity group relative"
      >
         <img 
           src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/image_remove_bg_5abc.png" 
           alt="Logo" 
           className="w-8 h-8 object-contain brightness-0 invert" 
         />
         <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
           Home
         </span>
      </button>

      {navItems.map((item) => (
        <div key={item.id} className="relative">
          <button
            onClick={() => {
              setActiveView(item.id as ViewMode);
            }}
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative
              ${activeView === item.id 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'}
            `}
          >
            {item.icon}
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {item.label}
            </span>
          </button>
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-3 items-center">
         {/* Notifications Button */}
         <button
           className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group text-gray-400 hover:text-white hover:bg-white/10"
         >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Notifications
            </span>
         </button>

         {/* Settings Button */}
         <button
           onClick={() => setActiveView('settings')}
           className={`
             w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group relative
             ${activeView === 'settings' 
               ? 'bg-white/20 text-white' 
               : 'text-gray-400 hover:text-white hover:bg-white/10'}
           `}
         >
            <Settings size={20} />
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Settings
            </span>
         </button>

         {/* User Avatar */}
         <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-90">
            Y
         </div>
      </div>
    </div>
  );
}
