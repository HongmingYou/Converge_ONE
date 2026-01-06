import type { AppCapability } from '@/types/onboarding';

const APP_CAPABILITIES_DATA: Record<string, Omit<AppCapability, 'icon'>> = {
  Framia: {
    name: 'Framia',
    capabilities: [
      'Generate visual designs and graphics',
      'Create marketing materials',
      'Design UI/UX mockups',
      'Produce video content',
    ],
    useCases: [
      'Design product posters',
      'Create social media graphics',
      'Generate presentation slides',
    ],
    description: 'AI-powered design tool for creating visuals',
  },
  Enter: {
    name: 'Enter',
    capabilities: [
      'Generate website code',
      'Build web applications',
      'Create React components',
      'Develop full-stack apps',
    ],
    useCases: [
      'Build landing pages',
      'Create web applications',
      'Generate component code',
    ],
    description: 'Build applications with AI-generated code',
  },
  Hunter: {
    name: 'Hunter',
    capabilities: [
      'Market research and analysis',
      'Competitor intelligence',
      'Data compilation and reports',
      'Trend analysis',
    ],
    useCases: [
      'Research market trends',
      'Analyze competitors',
      'Generate research reports',
    ],
    description: 'Research and analyze market data',
  },
  Combos: {
    name: 'Combos',
    capabilities: [
      'Automate workflows',
      'Schedule tasks',
      'Integrate APIs',
      'Create pipelines',
    ],
    useCases: [
      'Automate content publishing',
      'Schedule data collection',
      'Create integration workflows',
    ],
    description: 'Automate workflows and processes',
  },
};

export function getAppCapabilities(appName: string): Omit<AppCapability, 'icon'> {
  return APP_CAPABILITIES_DATA[appName] || {
    name: appName,
    capabilities: [],
    useCases: [],
    description: '',
  };
}

