import React from 'react';
import { Monitor, Layout, Code, Edit3, Search, Zap, MoreHorizontal } from 'lucide-react';
import type { QuickActionConfig } from '@/types/onboarding';
import { getAppCapabilities } from '@/lib/app-capabilities';
import { AppCapabilityCard } from './AppCapabilityCard';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const APP_ICONS = {
  Framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
  Enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
  Hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
  Combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
};

export const QUICK_ACTION_MAPPING: Record<string, QuickActionConfig> = {
  'Create Video': {
    app: 'Framia',
    appIcon: APP_ICONS.Framia,
    defaultPrompt: 'Create a promotional video script for',
    description: 'Generate video content and scripts',
  },
  'Design': {
    app: 'Framia',
    appIcon: APP_ICONS.Framia,
    defaultPrompt: 'Design a',
    description: 'Create visual designs and graphics',
  },
  'Build Website': {
    app: 'Enter',
    appIcon: APP_ICONS.Enter,
    defaultPrompt: 'Build a website for',
    description: 'Generate website code and layouts',
  },
  'Develop App': {
    app: 'Enter',
    appIcon: APP_ICONS.Enter,
    defaultPrompt: 'Develop an app that',
    description: 'Create application code and features',
  },
  'Research': {
    app: 'Hunter',
    appIcon: APP_ICONS.Hunter,
    defaultPrompt: 'Research and analyze',
    description: 'Conduct market research and analysis',
  },
  'Automate': {
    app: 'Combos',
    appIcon: APP_ICONS.Combos,
    defaultPrompt: 'Create an automated workflow for',
    description: 'Automate tasks and processes',
  },
};

const QUICK_ACTION_ICONS: Record<string, React.ReactNode> = {
  'Create Video': <Monitor size={16} />,
  'Design': <Edit3 size={16} />,
  'Build Website': <Layout size={16} />,
  'Develop App': <Code size={16} />,
  'Research': <Search size={16} />,
  'Automate': <Zap size={16} />,
};

interface QuickActionButtonProps {
  label: string;
  onClick: (config: QuickActionConfig) => void;
}

export function QuickActionButton({ label, onClick }: QuickActionButtonProps) {
  const config = QUICK_ACTION_MAPPING[label];
  const icon = QUICK_ACTION_ICONS[label] || <MoreHorizontal size={16} />;
  const capability = config ? getAppCapabilities(config.app) : null;

  if (!config) {
    return (
      <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group">
          <img src={config.appIcon} alt={config.app} className="w-4 h-4 object-contain" />
          {icon}
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {capability && (
          <div className="p-4">
            <AppCapabilityCard
              capability={{
                ...capability,
                icon: config.appIcon,
              }}
              onSelect={() => onClick(config)}
              compact
            />
            <button
              onClick={() => onClick(config)}
              className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Use {config.app}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}


