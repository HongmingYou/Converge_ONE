import { useState, useEffect, useCallback } from 'react';
import { matchApps } from '@/lib/capability-matcher';
import type { AppRecommendation } from '@/types/onboarding';
import { ArtifactContextData } from '@/types';

/**
 * Hook for app recommendation based on input text
 * Now supports context-aware matching
 */
export function useAppRecommendation(
  inputText: string,
  isFocused: boolean,
  context: ArtifactContextData[] = []
) {
  const [recommendations, setRecommendations] = useState<AppRecommendation[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Debounce the matching to avoid excessive calculations
  useEffect(() => {
    if (!isFocused) {
      setIsVisible(false);
      return;
    }

    if (!inputText || inputText.trim().length === 0) {
      setIsVisible(false);
      setRecommendations([]);
      return;
    }

    // Show recommendations after a short delay
    const timer = setTimeout(() => {
      const matches = matchApps(inputText, context);
      if (matches.length > 0) {
        setRecommendations(matches);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [inputText, isFocused, context]);

  const hideRecommendations = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showRecommendations = useCallback(() => {
    if (inputText && inputText.trim().length > 0) {
      const matches = matchApps(inputText, context);
      if (matches.length > 0) {
        setRecommendations(matches);
        setIsVisible(true);
      }
    }
  }, [inputText, context]);

  return {
    recommendations,
    isVisible,
    hideRecommendations,
    showRecommendations,
  };
}

