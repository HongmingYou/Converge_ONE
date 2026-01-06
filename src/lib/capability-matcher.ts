import { appRegistry } from './app-registry';
import { ArtifactContextData } from '@/types';
import type { AppRecommendation } from '@/types/onboarding';
import { AppType } from '@/types';

/**
 * Capability Matcher - 通用能力匹配引擎
 * 基于 App Registry 动态匹配，不硬编码关键词
 */

export interface MatchResult {
  app: import('@/types/mcp').MCPApp;
  confidence: number;
  reason: string;
}

/**
 * 匹配应用（基于用户输入）
 */
export function matchApps(
  userInput: string,
  context: ArtifactContextData[] = []
): AppRecommendation[] {
  if (!userInput || userInput.trim().length === 0) {
    return [];
  }

  // 1. 基于关键词匹配
  const keywordMatches = appRegistry.findByKeyword(userInput);

  // 2. 基于上下文增强匹配
  const contextAwareMatches = enhanceWithContext(keywordMatches, context, userInput);

  // 3. 转换为 AppRecommendation 格式
  return contextAwareMatches
    .slice(0, 3) // 返回 top 3
    .map(match => ({
      appName: match.app.name,
      appType: match.app.id as AppType,
      appIcon: match.app.icon,
      matchScore: match.confidence,
      matchReason: match.reason,
    }));
}

/**
 * 基于上下文增强匹配结果
 */
function enhanceWithContext(
  matches: Array<{ app: import('@/types/mcp').MCPApp; score: number }>,
  context: ArtifactContextData[],
  userInput: string
): MatchResult[] {
  const results: MatchResult[] = matches.map(match => {
    let confidence = match.score;
    let reason = `Matched keywords: ${match.app.triggers.keywords.slice(0, 3).join(', ')}`;

    // 检查上下文相关性
    if (context.length > 0 && match.app.triggers.contextTypes) {
      const relevantContext = context.filter(ctx =>
        match.app.triggers.contextTypes!.some(type =>
          ctx.tags.includes(type) || ctx.sourceName.toLowerCase().includes(type)
        )
      );

      if (relevantContext.length > 0) {
        confidence += 20; // 上下文匹配加分
        reason = `Context-aware match: can use ${relevantContext.map(c => c.sourceName).join(', ')}`;
      }
    }

    // 检查能力匹配度
    const inputLower = userInput.toLowerCase();
    const primaryMatches = match.app.capabilities.primary.filter(cap =>
      inputLower.includes(cap)
    );
    if (primaryMatches.length > 0) {
      confidence += 15;
      reason = `Primary capability match: ${primaryMatches.join(', ')}`;
    }

    return {
      app: match.app,
      confidence: Math.min(confidence, 100), // 限制在 0-100
      reason,
    };
  });

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 根据能力查找应用
 */
export function findAppsByCapability(capability: string): import('@/types/mcp').MCPApp[] {
  return appRegistry.findByCapability(capability);
}

/**
 * 根据分类查找应用
 */
export function findAppsByCategory(category: string): import('@/types/mcp').MCPApp[] {
  return appRegistry.findByCategory(category);
}

/**
 * 获取应用图标（向后兼容）
 */
export function getAppIcon(appName: string): string {
  const app = appRegistry.getByName(appName);
  return app?.icon || '';
}


