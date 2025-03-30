import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { MediaFile } from '../types';

// Define base directories for app storage
const APP_DIRECTORY = 'QDOS';
const MEDIA_DIRECTORY = `${APP_DIRECTORY}/media`;
const CACHE_DIRECTORY = `${APP_DIRECTORY}/cache`;

// Define full paths based on platform
const BASE_PATH = Platform.OS === 'ios' 
  ? `${RNFS.DocumentDirectoryPath}/${APP_DIRECTORY}`
  : `${RNFS.ExternalDirectoryPath}/${APP_DIRECTORY}`;

const MEDIA_PATH = `${BASE_PATH}/media`;
const CACHE_PATH = `${BASE_PATH}/cache`;

/**
 * Initialize all required app directories
 * @returns Promise resolving when directories are created
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    // Create main app directory
    await RNFS.mkdir(BASE_PATH, { NSURLIsExcludedFromBackupKey: true });
    
    // Create media storage directory
    await RNFS.mkdir(MEDIA_PATH, { NSURLIsExcludedFromBackupKey: true });
    
    // Create cache directory
    await RNFS.mkdir(CACHE_PATH, { NSURLIsExcludedFromBackupKey: true });
    
    console.log('Storage directories initialized successfully');
  } catch (error) {
    console.error('Error initializing storage directories:', error);
    throw new Error('Failed to initialize storage');
  }
};

/**
 * Save a media file to local storage
 * @param sourcePath Temporary path of the captured media
 * @param type Type of media (photo or video)
 * @returns Promise resolving to MediaFile object with file details
 */
export const saveMediaToStorage = async (
  sourcePath: string,
  type: 'photo' | 'video'
): Promise<MediaFile> => {
  try {
    // Ensure directories exist
    await RNFS.mkdir(MEDIA_PATH, { NSURLIsExcludedFromBackupKey: true });
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const extension = type === 'photo' ? 'jpg' : 'mp4';
    const fileName = `${type}_${timestamp}.${extension}`;
    const destinationPath = `${MEDIA_PATH}/${fileName}`;
    
    // Copy the file from temporary path to our app storage
    await RNFS.copyFile(sourcePath, destinationPath);
    
    // Get file info (size, etc.)
    const fileInfo = await RNFS.stat(destinationPath);
    
    return {
      id: `${timestamp}`,
      path: destinationPath,
      type,
      fileName,
      mimeType: type === 'photo' ? 'image/jpeg' : 'video/mp4',
      size: fileInfo.size,
      timestamp,
    };
  } catch (error) {
    console.error('Error saving media to storage:', error);
    throw new Error('Failed to save media file');
  }
};

/**
 * Delete a media file from storage
 * @param filePath Path to the file
 * @returns Promise resolving when the file is deleted
 */
export const deleteMediaFile = async (filePath: string): Promise<void> => {
  try {
    // Check if file exists
    const exists = await RNFS.exists(filePath);
    if (!exists) {
      console.warn(`File doesn't exist: ${filePath}`);
      return;
    }
    
    // Delete the file
    await RNFS.unlink(filePath);
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw new Error('Failed to delete media file');
  }
};

/**
 * Load all media files from storage
 * @returns Promise resolving to array of MediaFile objects
 */
export const loadAllMedia = async (): Promise<MediaFile[]> => {
  try {
    // Ensure directory exists
    await RNFS.mkdir(MEDIA_PATH, { NSURLIsExcludedFromBackupKey: true });
    
    // Read directory contents
    const files = await RNFS.readDir(MEDIA_PATH);
    
    // Process each file to extract metadata
    const mediaFiles: MediaFile[] = await Promise.all(
      files
        .filter(file => {
          // Filter only our media files by naming pattern
          return file.name.startsWith('photo_') || file.name.startsWith('video_');
        })
        .map(async (file) => {
          // Extract type and timestamp from filename
          const isPhoto = file.name.startsWith('photo_');
          const type = isPhoto ? 'photo' : 'video';
          const timestamp = parseInt(
            file.name.substring(type.length + 1, file.name.lastIndexOf('.')),
            10
          );
          
          return {
            id: `${timestamp}`,
            path: file.path,
            type,
            fileName: file.name,
            mimeType: isPhoto ? 'image/jpeg' : 'video/mp4',
            size: file.size,
            timestamp,
          };
        })
    );
    
    // Sort by timestamp descending (newest first)
    return mediaFiles.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading media files:', error);
    return [];
  }
};

/**
 * Clear the application cache directory
 * @returns Promise resolving when cache is cleared
 */
export const clearCache = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(CACHE_PATH);
    if (exists) {
      // Delete cache directory and recreate it
      await RNFS.unlink(CACHE_PATH);
      await RNFS.mkdir(CACHE_PATH, { NSURLIsExcludedFromBackupKey: true });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw new Error('Failed to clear cache');
  }
};

/**
 * Get the total size of all stored media files
 * @returns Promise resolving to the total size in bytes
 */
export const getMediaStorageSize = async (): Promise<number> => {
  try {
    const mediaFiles = await loadAllMedia();
    
    // Sum up the size of all media files
    return mediaFiles.reduce((total, file) => total + file.size, 0);
  } catch (error) {
    console.error('Error calculating media storage size:', error);
    return 0;
  }
};

/**
 * Check if there's enough storage space available
 * @param requiredBytes Number of bytes required
 * @returns Promise resolving to boolean indicating if space is available
 */
export const hasEnoughStorage = async (requiredBytes: number): Promise<boolean> => {
  try {
    // Get device free space info
    const deviceInfo = await RNFS.getFSInfo();
    
    // Require at least the requested bytes plus 10MB buffer
    const minRequired = requiredBytes + 10 * 1024 * 1024;
    
    return deviceInfo.freeSpace > minRequired;
  } catch (error) {
    console.error('Error checking storage space:', error);
    // Default to true if we can't determine
    return true;
  }
};
