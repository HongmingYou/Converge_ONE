import { AppType } from '@/types';
import type { AppRecommendation } from '@/types/onboarding';
import { APP_ICONS } from '@/lib/app-icons';

// Keywords for each app
const APP_KEYWORDS: Record<string, string[]> = {
  Framia: [
    '设计', '画', '海报', '图片', '视觉', 'UI', '视频', 'create video',
    'design', 'poster', 'image', 'visual', 'graphic', 'video', 'mockup',
    'banner', 'logo', 'icon', 'illustration', 'draw', 'paint'
  ],
  Enter: [
    '代码', '开发', '网站', '应用', 'build', 'website', 'app',
    'code', 'develop', 'programming', 'web', 'application', 'software',
    'react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript'
  ],
  Hunter: [
    '调研', '分析', '报告', '搜索', 'research', 'analyze',
    'report', 'search', 'investigate', 'study', 'market', 'competitor',
    'analysis', 'data', 'insight', 'trend', 'survey'
  ],
  Combos: [
    '自动化', '工作流', '流程', 'automate', 'workflow',
    'automation', 'process', 'pipeline', 'schedule', 'task',
    'integration', 'api', 'trigger', 'action'
  ],
};

// Match reasons for each app
const MATCH_REASONS: Record<string, string> = {
  Framia: 'Detected design or visual content keywords',
  Enter: 'Detected development or coding keywords',
  Hunter: 'Detected research or analysis keywords',
  Combos: 'Detected automation or workflow keywords',
};

/**
 * Calculate match score for an app based on input text
 */
function calculateMatchScore(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerText.includes(lowerKeyword)) {
      // Longer keywords get higher weight
      score += lowerKeyword.length;
    }
  });

  return score;
}

/**
 * Match apps based on input text
 * Returns recommendations sorted by match score
 */
export function matchApps(inputText: string): AppRecommendation[] {
  if (!inputText || inputText.trim().length === 0) {
    return [];
  }

  const recommendations: AppRecommendation[] = [];

  Object.entries(APP_KEYWORDS).forEach(([appName, keywords]) => {
    const score = calculateMatchScore(inputText, keywords);
    if (score > 0) {
      const appType = appName.toLowerCase() as AppType;
      recommendations.push({
        appName,
        appType,
        appIcon: APP_ICONS[appName as keyof typeof APP_ICONS],
        matchScore: score,
        matchReason: MATCH_REASONS[appName] || 'Keyword match',
      });
    }
  });

  // Sort by score (descending) and return top 3
  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

/**
 * Get app icon by name
 */
export function getAppIcon(appName: string): string {
  return APP_ICONS[appName as keyof typeof APP_ICONS] || '';
}


