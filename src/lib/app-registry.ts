import { MCPApp, AppProvider } from '@/types/mcp';
import { AppType } from '@/types';

/**
 * App Registry - 应用注册中心
 * 支持动态注册、查询和匹配应用
 */
class AppRegistry {
  private apps: Map<string, MCPApp> = new Map();
  private appIcons: Record<string, string> = {};

  constructor() {
    // 初始化内置 Apps
    this.registerBuiltInApps();
  }

  /**
   * 注册应用
   */
  register(app: MCPApp): void {
    this.apps.set(app.id, app);
    this.appIcons[app.name] = app.icon;
  }

  /**
   * 获取内置 App
   */
  getBuiltInApps(): MCPApp[] {
    return Array.from(this.apps.values()).filter(app => app.provider === 'native');
  }

  /**
   * 批量注册应用
   */
  registerBatch(apps: MCPApp[]): void {
    apps.forEach(app => this.register(app));
  }

  /**
   * 获取所有应用
   */
  getAll(): MCPApp[] {
    return Array.from(this.apps.values());
  }

  /**
   * 根据 ID 获取应用
   */
  getById(id: string): MCPApp | undefined {
    return this.apps.get(id);
  }

  /**
   * 根据名称获取应用
   */
  getByName(name: string): MCPApp | undefined {
    return Array.from(this.apps.values()).find(app => app.name === name);
  }

  /**
   * 根据能力查找应用
   */
  findByCapability(capability: string): MCPApp[] {
    return Array.from(this.apps.values()).filter(app =>
      app.capabilities.primary.includes(capability) ||
      app.capabilities.secondary.includes(capability)
    );
  }

  /**
   * 根据关键词匹配应用
   */
  findByKeyword(text: string): Array<{ app: MCPApp; score: number }> {
    const lowerText = text.toLowerCase();
    const matches: Array<{ app: MCPApp; score: number }> = [];

    this.apps.forEach(app => {
      let score = 0;

      // 关键词匹配
      app.triggers.keywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        if (lowerText.includes(lowerKeyword)) {
          score += lowerKeyword.length; // 长关键词权重更高
        }
      });

      // 正则匹配
      app.triggers.patterns.forEach(pattern => {
        if (pattern.test(lowerText)) {
          score += 10; // 正则匹配权重更高
        }
      });

      if (score > 0) {
        matches.push({ app, score });
      }
    });

    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * 根据分类获取应用
   */
  findByCategory(category: string): MCPApp[] {
    return Array.from(this.apps.values()).filter(app =>
      app.metadata?.category === category
    );
  }

  /**
   * 获取应用图标
   */
  getIcon(appName: string): string {
    return this.appIcons[appName] || '';
  }

  /**
   * 初始化内置应用
   */
  private registerBuiltInApps(): void {
    const APP_ICONS = {
      Hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
      Enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
      Combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
      Framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
    };

    // Framia
    this.register({
      id: 'framia',
      name: 'Framia',
      icon: APP_ICONS.Framia,
      description: 'Create visual designs and graphics',
      provider: 'native',
      capabilities: {
        primary: ['design', 'graphics', 'visual'],
        secondary: ['ui', 'mockup', 'branding', 'poster', 'banner'],
      },
      triggers: {
        keywords: [
          '设计', '画', '海报', '图片', '视觉', 'UI', '视频',
          'design', 'poster', 'image', 'visual', 'graphic', 'video',
          'mockup', 'banner', 'logo', 'icon', 'illustration', 'draw', 'paint',
        ],
        patterns: [
          /设计.*/i,
          /create.*design/i,
          /make.*visual/i,
        ],
      },
      input: {
        accepts: ['text', 'context'],
      },
      output: {
        type: 'image',
        formats: ['png', 'jpg', 'svg'],
      },
      metadata: {
        category: 'design',
        tags: ['design', 'visual', 'graphics'],
      },
    });

    // Enter
    this.register({
      id: 'enter',
      name: 'Enter',
      icon: APP_ICONS.Enter,
      description: 'Build applications and write code',
      provider: 'native',
      capabilities: {
        primary: ['code', 'build', 'develop'],
        secondary: ['web', 'app', 'programming', 'react', 'typescript'],
      },
      triggers: {
        keywords: [
          '代码', '开发', '网站', '应用',
          'code', 'develop', 'programming', 'web', 'application', 'software',
          'react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript',
          'build', 'website', 'app',
        ],
        patterns: [
          /写.*代码/i,
          /build.*app/i,
          /create.*website/i,
          /develop.*/i,
        ],
        contextTypes: ['design', 'image'],
      },
      input: {
        accepts: ['text', 'context', 'image'],
      },
      output: {
        type: 'code',
        formats: ['react', 'typescript', 'javascript', 'html'],
      },
      metadata: {
        category: 'development',
        tags: ['code', 'development', 'web'],
      },
    });

    // Hunter
    this.register({
      id: 'hunter',
      name: 'Hunter',
      icon: APP_ICONS.Hunter,
      description: 'Research and analyze information',
      provider: 'native',
      capabilities: {
        primary: ['research', 'analyze', 'search'],
        secondary: ['market', 'competitor', 'data', 'insight', 'trend'],
      },
      triggers: {
        keywords: [
          '调研', '分析', '报告', '搜索',
          'research', 'analyze', 'report', 'search', 'investigate', 'study',
          'market', 'competitor', 'analysis', 'data', 'insight', 'trend', 'survey',
        ],
        patterns: [
          /调研.*/i,
          /分析.*/i,
          /research.*/i,
          /analyze.*/i,
        ],
      },
      input: {
        accepts: ['text', 'file'],
      },
      output: {
        type: 'document',
        formats: ['pdf', 'markdown', 'text'],
      },
      metadata: {
        category: 'research',
        tags: ['research', 'analysis', 'data'],
      },
    });

    // Combos
    this.register({
      id: 'combos',
      name: 'Combos',
      icon: APP_ICONS.Combos,
      description: 'Automate workflows and integrate services',
      provider: 'native',
      capabilities: {
        primary: ['automate', 'workflow', 'integrate'],
        secondary: ['process', 'pipeline', 'schedule', 'task', 'api'],
      },
      triggers: {
        keywords: [
          '自动化', '工作流', '流程',
          'automate', 'workflow', 'automation', 'process', 'pipeline',
          'schedule', 'task', 'integration', 'api', 'trigger', 'action',
        ],
        patterns: [
          /自动化.*/i,
          /workflow.*/i,
          /automate.*/i,
        ],
      },
      input: {
        accepts: ['text', 'context'],
      },
      output: {
        type: 'action',
        formats: ['json', 'yaml'],
      },
      metadata: {
        category: 'automation',
        tags: ['automation', 'workflow', 'integration'],
      },
    });
  }
}

// 导出单例
export const appRegistry = new AppRegistry();

// 导出类型
export type { MCPApp };

