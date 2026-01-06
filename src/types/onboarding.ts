import { AppType } from './index';

// Onboarding state structure
export interface OnboardingState {
  productIntroCompleted: boolean;
  appGuides: {
    framia: boolean;
    enter: boolean;
    hunter: boolean;
    combos: boolean;
  };
}

// App recommendation result
export interface AppRecommendation {
  appName: string;
  appType: AppType;
  appIcon: string;
  matchScore: number;
  matchReason: string;
}

// Quick action mapping configuration
export interface QuickActionConfig {
  app: string;
  appIcon: string;
  defaultPrompt: string;
  description: string;
}

// App capability information
export interface AppCapability {
  name: string;
  icon: string;
  capabilities: string[];
  useCases: string[];
  description: string;
}


