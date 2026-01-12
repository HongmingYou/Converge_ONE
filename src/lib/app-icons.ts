/**
 * 统一的应用图标配置
 * 所有应用图标的 URL 都在这里定义，避免在多个文件中重复
 */

export const APP_ICONS = {
  Hunter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/screenshot-20251226-012900_54ec.png',
  Enter: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (2)_aeae.png',
  Combos: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (3)_6a15.png',
  Framia: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/whiteboard_exported_image (4)_ef96.png',
} as const;

/**
 * 小写键名的版本（用于某些地方需要小写键名）
 */
export const APP_ICONS_LOWER = {
  hunter: APP_ICONS.Hunter,
  enter: APP_ICONS.Enter,
  combos: APP_ICONS.Combos,
  framia: APP_ICONS.Framia,
} as const;

/**
 * Converge AI Logo
 */
export const CONVERGE_LOGO = 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100000006/image_remove_bg_5abc.png';

/**
 * 获取应用图标 URL
 */
export function getAppIcon(appName: string): string {
  const normalizedName = appName.charAt(0).toUpperCase() + appName.slice(1).toLowerCase();
  return APP_ICONS[normalizedName as keyof typeof APP_ICONS] || APP_ICONS.Framia;
}
