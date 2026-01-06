import { OnboardingState } from '@/types/onboarding';

const STORAGE_KEY = 'converge_onboarding_state';

const DEFAULT_STATE: OnboardingState = {
  productIntroCompleted: false,
  appGuides: {
    framia: false,
    enter: false,
    hunter: false,
    combos: false,
  },
};

/**
 * Get onboarding state from localStorage
 */
export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as OnboardingState;
    }
  } catch (error) {
    console.warn('Failed to parse onboarding state from localStorage:', error);
  }

  return DEFAULT_STATE;
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save onboarding state to localStorage:', error);
  }
}

/**
 * Mark product intro as completed
 */
export function markProductIntroCompleted(): void {
  const state = getOnboardingState();
  state.productIntroCompleted = true;
  saveOnboardingState(state);
}

/**
 * Mark app guide as completed
 */
export function markAppGuideCompleted(appType: 'framia' | 'enter' | 'hunter' | 'combos'): void {
  const state = getOnboardingState();
  state.appGuides[appType] = true;
  saveOnboardingState(state);
}

/**
 * Check if product intro is completed
 */
export function isProductIntroCompleted(): boolean {
  return getOnboardingState().productIntroCompleted;
}

/**
 * Check if app guide is completed
 */
export function isAppGuideCompleted(appType: 'framia' | 'enter' | 'hunter' | 'combos'): boolean {
  return getOnboardingState().appGuides[appType];
}

/**
 * Reset onboarding state (for testing/debugging)
 */
export function resetOnboardingState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset onboarding state:', error);
  }
}


