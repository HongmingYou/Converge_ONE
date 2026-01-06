import { useState, useEffect } from 'react';
import { AppType } from '@/types';
import {
  getOnboardingState,
  markProductIntroCompleted,
  markAppGuideCompleted,
  isProductIntroCompleted,
  isAppGuideCompleted,
} from '@/lib/onboarding-storage';
import type { OnboardingState } from '@/types/onboarding';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(getOnboardingState());

  useEffect(() => {
    // Sync with localStorage on mount
    setState(getOnboardingState());
  }, []);

  const completeProductIntro = () => {
    markProductIntroCompleted();
    setState(getOnboardingState());
  };

  const completeAppGuide = (appType: 'framia' | 'enter' | 'hunter' | 'combos') => {
    markAppGuideCompleted(appType);
    setState(getOnboardingState());
  };

  const shouldShowProductIntro = !state.productIntroCompleted;
  const shouldShowAppGuide = (appType: AppType) => {
    const appKey = appType as 'framia' | 'enter' | 'hunter' | 'combos';
    return !state.appGuides[appKey];
  };

  return {
    state,
    shouldShowProductIntro,
    shouldShowAppGuide,
    completeProductIntro,
    completeAppGuide,
    isProductIntroCompleted: isProductIntroCompleted(),
    isAppGuideCompleted,
  };
}


