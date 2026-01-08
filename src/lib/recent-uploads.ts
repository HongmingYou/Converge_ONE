/**
 * Recent Uploads Storage Utility
 * Manages recently uploaded files in localStorage
 * 
 * For prototype: Uses mock data combined with localStorage
 */

export interface RecentUploadItem {
  id: string;
  name: string;
  type: string;
  size?: string;
  thumbnail?: string; // For images
  uploadedAt: number; // Timestamp
  file?: File; // Original file object (optional, for re-upload)
  isMock?: boolean; // Flag for mock data
}

const STORAGE_KEY = 'converge-recent-uploads';
const MAX_RECENT_UPLOADS = 20;

// Import mock data lazily to avoid circular dependencies
let mockRecentUploads: RecentUploadItem[] | null = null;

async function getMockRecentUploads(): Promise<RecentUploadItem[]> {
  if (mockRecentUploads === null) {
    const { MOCK_RECENT_UPLOADS } = await import('@/data/mock');
    mockRecentUploads = MOCK_RECENT_UPLOADS.map(item => ({ ...item, isMock: true }));
  }
  return mockRecentUploads;
}

/**
 * Get all recent uploads from localStorage + mock data
 * Returns items sorted by uploadedAt descending (newest first)
 */
export function getRecentUploads(): RecentUploadItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const localItems: RecentUploadItem[] = stored ? JSON.parse(stored) : [];
    
    // Combine with mock data (mock data acts as "previous session uploads")
    // Use synchronous mock data for initial render
    const mockItems = mockRecentUploads || [];
    
    // Merge: local items first, then mock items (avoiding duplicates by name)
    const localNames = new Set(localItems.map(item => item.name));
    const combinedItems = [
      ...localItems,
      ...mockItems.filter(item => !localNames.has(item.name))
    ];
    
    // Sort by uploadedAt descending (newest first)
    return combinedItems.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch (error) {
    console.error('Failed to get recent uploads:', error);
    return [];
  }
}

/**
 * Initialize mock data (call this on app startup)
 */
export async function initRecentUploads(): Promise<void> {
  await getMockRecentUploads();
}

/**
 * Get recent uploads with mock data (async version for initial load)
 */
export async function getRecentUploadsAsync(): Promise<RecentUploadItem[]> {
  await getMockRecentUploads();
  return getRecentUploads();
}

/**
 * Add a new upload to recent uploads
 * Maintains max limit by removing oldest items
 */
export function addRecentUpload(file: File | RecentUploadItem): void {
  try {
    const items = getRecentUploads();
    
    let newItem: RecentUploadItem;
    
    if (file instanceof File) {
      // Create new item from File object
      newItem = {
        id: `recent-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatFileSize(file.size),
        uploadedAt: Date.now(),
        // Generate thumbnail for images
        thumbnail: file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : undefined,
      };
    } else {
      // Use provided item, update timestamp if needed
      newItem = {
        ...file,
        uploadedAt: file.uploadedAt || Date.now(),
      };
    }
    
    // Remove duplicate by name (keep newest)
    const filtered = items.filter(item => item.name !== newItem.name);
    
    // Add new item at the beginning
    filtered.unshift(newItem);
    
    // Maintain max limit
    const limited = filtered.slice(0, MAX_RECENT_UPLOADS);
    
    // Clean up old thumbnails before saving
    const toRemove = items.slice(MAX_RECENT_UPLOADS);
    toRemove.forEach(item => {
      if (item.thumbnail && item.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnail);
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to add recent upload:', error);
  }
}

/**
 * Remove a specific upload from recent uploads
 */
export function removeRecentUpload(id: string): void {
  try {
    const items = getRecentUploads();
    const item = items.find(i => i.id === id);
    
    // Clean up thumbnail if exists
    if (item?.thumbnail && item.thumbnail.startsWith('blob:')) {
      URL.revokeObjectURL(item.thumbnail);
    }
    
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove recent upload:', error);
  }
}

/**
 * Clear all recent uploads
 */
export function clearRecentUploads(): void {
  try {
    const items = getRecentUploads();
    
    // Clean up all thumbnails
    items.forEach(item => {
      if (item.thumbnail && item.thumbnail.startsWith('blob:')) {
        URL.revokeObjectURL(item.thumbnail);
      }
    });
    
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recent uploads:', error);
  }
}

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

