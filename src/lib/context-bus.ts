import { Artifact, ArtifactContextData, AppType } from '@/types';

/**
 * Extract context data from an artifact
 * This simulates what would come from the App API in production
 */
export function extractContextFromArtifact(artifact: Artifact): ArtifactContextData | null {
  if (!artifact.contextData || artifact.status !== 'completed') {
    return null;
  }
  
  return artifact.contextData;
}

/**
 * Get all available context from current session artifacts
 * Only includes completed artifacts with context data
 */
export function getSessionContext(artifacts: Artifact[]): ArtifactContextData[] {
  return artifacts
    .filter(a => a.status === 'completed' && a.contextData)
    .map(a => a.contextData!)
    .filter(Boolean);
}

/**
 * Build a system prompt that includes context from previous agents
 * This prompt would be sent to the target app along with the user request
 */
export function buildSystemPrompt(
  context: ArtifactContextData[], 
  targetApp: AppType
): string {
  if (context.length === 0) {
    return '';
  }

  const contextSummaries = context
    .map(ctx => `- ${ctx.sourceName}: ${ctx.summary}`)
    .join('\n');

  const prompt = `You have access to the following context from previous work:

${contextSummaries}

Please use this information to inform your response and maintain consistency with previous outputs.

Structured data is available if needed:
${JSON.stringify(context.map(c => ({
  source: c.sourceName,
  data: c.structuredData,
  tags: c.tags
})), null, 2)}`;

  return prompt;
}

/**
 * Check if context is relevant to the target app based on tags
 */
export function isContextRelevant(
  context: ArtifactContextData,
  targetApp: AppType,
  userPrompt: string
): boolean {
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Check if any tags match the user prompt
  const hasMatchingTags = context.tags.some(tag => 
    lowerPrompt.includes(tag.toLowerCase())
  );
  
  return hasMatchingTags;
}

/**
 * Filter context based on relevance
 * Returns only context that's likely useful for the target app
 */
export function filterRelevantContext(
  allContext: ArtifactContextData[],
  targetApp: AppType,
  userPrompt: string
): ArtifactContextData[] {
  // For MVP, return all context
  // In production, you might want to filter by relevance
  return allContext;
}

/**
 * Format context size for display
 */
export function formatContextSize(data: any): string {
  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;
  
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  } else {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  }
}

/**
 * Create mock context data for different app types
 * In production, this would come from the actual App API response
 */
export function createMockContextData(
  artifact: Artifact,
  userPrompt: string
): ArtifactContextData {
  const baseContext: ArtifactContextData = {
    summary: '',
    structuredData: {},
    tags: [],
    sourceArtifactId: artifact.id,
    sourceName: artifact.appName,
  };

  switch (artifact.appType) {
    case 'hunter':
      return {
        ...baseContext,
        summary: `Market research completed: ${artifact.title}`,
        structuredData: {
          type: 'research',
          findings: [
            'Identified key competitors and pricing strategies',
            'Market trends and opportunities analyzed'
          ],
          keyInsights: [
            'Market gap identified in vertical industry customization',
            'Price sensitivity varies by segment'
          ]
        },
        tags: ['research', 'market-analysis', 'competitor', 'pricing', 'trends'],
        dataSize: formatContextSize({ type: 'research', findings: [], insights: [] })
      };

    case 'framia':
      return {
        ...baseContext,
        summary: `Design created: ${artifact.title}`,
        structuredData: {
          type: 'design',
          style: {
            colors: ['#4F46E5', '#10B981'],
            typography: 'Modern sans-serif',
            layout: 'Grid-based'
          },
          components: ['Header', 'Hero Section', 'CTA Button']
        },
        tags: ['design', 'visual', 'ui', 'branding', 'layout'],
        dataSize: formatContextSize({ type: 'design', style: {}, components: [] })
      };

    case 'enter':
      return {
        ...baseContext,
        summary: `Application built: ${artifact.title}`,
        structuredData: {
          type: 'code',
          techStack: ['React', 'TypeScript', 'Tailwind CSS'],
          features: ['Responsive layout', 'Form validation', 'API integration'],
          apiEndpoints: ['/api/users', '/api/data']
        },
        tags: ['code', 'development', 'react', 'typescript', 'web-app'],
        dataSize: formatContextSize({ type: 'code', techStack: [], features: [] })
      };

    case 'combos':
      return {
        ...baseContext,
        summary: `Workflow automated: ${artifact.title}`,
        structuredData: {
          type: 'workflow',
          steps: ['Data collection', 'Processing', 'Publishing'],
          triggers: ['Schedule', 'Event-based'],
          integrations: ['Twitter API', 'Google Sheets']
        },
        tags: ['automation', 'workflow', 'integration', 'process'],
        dataSize: formatContextSize({ type: 'workflow', steps: [], triggers: [] })
      };

    default:
      return baseContext;
  }
}

