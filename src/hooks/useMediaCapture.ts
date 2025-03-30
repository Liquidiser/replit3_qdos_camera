import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { MediaFile } from '../types';
import mediaService from '../api/mediaService';

interface UseMediaCaptureProps {
  onMediaCaptured?: (media: MediaFile) => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (mediaId: string) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Custom hook for handling media capture and storage
 */
export default function useMediaCapture({
  onMediaCaptured,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
}: UseMediaCaptureProps = {}) {
  const [capturedMedia, setCapturedMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);

  /**
   * Save a captured photo or video to local storage
   */
  const saveMedia = async (
    path: string, 
    type: 'photo' | 'video'
  ): Promise<MediaFile> => {
    try {
      // Create directory if it doesn't exist
      const mediaDir = `${RNFS.DocumentDirectoryPath}/QDOS/media`;
      await RNFS.mkdir(mediaDir, { NSURLIsExcludedFromBackupKey: true });
      
      // Generate unique filename
      const timestamp = new Date().getTime();
      const extension = type === 'photo' ? 'jpg' : 'mp4';
      const fileName = `${type}_${timestamp}.${extension}`;
      const destinationPath = `${mediaDir}/${fileName}`;
      
      // Copy the temporary file to our app's storage
      await RNFS.copyFile(path, destinationPath);
      
      // Get file info (size, etc.)
      const fileInfo = await RNFS.stat(destinationPath);
      
      const media: MediaFile = {
        id: `${timestamp}`,
        path: destinationPath,
        type,
        fileName,
        mimeType: type === 'photo' ? 'image/jpeg' : 'video/mp4',
        size: fileInfo.size,
        timestamp,
      };
      
      // Add to captured media list
      setCapturedMedia(prev => [media, ...prev]);
      
      // Call callback if provided
      if (onMediaCaptured) {
        onMediaCaptured(media);
      }
      
      return media;
    } catch (error) {
      console.error('Error saving media:', error);
      throw new Error('Failed to save media file');
    }
  };

  /**
   * Upload media to server
   */
  const uploadMedia = async (
    media: MediaFile,
    qrId: string,
    metadata: Record<string, any> = {}
  ): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentUploadId(media.id);
      
      // Prepare upload parameters
      const uploadParams = {
        qrId,
        mediaType: media.type,
        filePath: media.path,
        fileName: media.fileName,
        mimeType: media.mimeType,
        metadata: {
          ...metadata,
          deviceInfo: {
            platform: Platform.OS,
            version: Platform.Version,
          },
        },
      };
      
      // Upload the media with progress tracking
      const result = await mediaService.uploadMedia(
        uploadParams,
        (progress) => {
          setUploadProgress(progress);
          if (onUploadProgress) {
            onUploadProgress(progress);
          }
        }
      );
      
      // Extract media ID from response
      const mediaId = result?.data?.mediaId || result?.mediaId || '';
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(mediaId);
      }
      
      return mediaId;
    } catch (error) {
      console.error('Error uploading media:', error);
      if (onUploadError) {
        onUploadError(error instanceof Error ? error : new Error('Upload failed'));
      }
      throw error;
    } finally {
      setIsUploading(false);
      setCurrentUploadId(null);
    }
  };

  /**
   * Delete media from local storage
   */
  const deleteMedia = async (mediaId: string): Promise<void> => {
    try {
      const media = capturedMedia.find(m => m.id === mediaId);
      
      if (media) {
        // Delete the file
        await RNFS.unlink(media.path);
        
        // Update state
        setCapturedMedia(prev => prev.filter(m => m.id !== mediaId));
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new Error('Failed to delete media file');
    }
  };

  /**
   * Load previously saved media from storage
   */
  const loadSavedMedia = async (): Promise<void> => {
    try {
      const mediaDir = `${RNFS.DocumentDirectoryPath}/QDOS/media`;
      
      // Create directory if it doesn't exist
      await RNFS.mkdir(mediaDir, { NSURLIsExcludedFromBackupKey: true });
      
      // Read directory contents
      const files = await RNFS.readDir(mediaDir);
      
      const mediaFiles: MediaFile[] = await Promise.all(
        files.map(async (file) => {
          const nameParts = file.name.split('_');
          const type = nameParts[0] as 'photo' | 'video';
          const timestamp = parseInt(nameParts[1].split('.')[0], 10);
          
          return {
            id: `${timestamp}`,
            path: file.path,
            type,
            fileName: file.name,
            mimeType: type === 'photo' ? 'image/jpeg' : 'video/mp4',
            size: file.size,
            timestamp,
          };
        })
      );
      
      // Sort by timestamp descending (newest first)
      mediaFiles.sort((a, b) => b.timestamp - a.timestamp);
      
      setCapturedMedia(mediaFiles);
    } catch (error) {
      console.error('Error loading saved media:', error);
    }
  };

  // Load saved media when the hook is initialized
  useEffect(() => {
    loadSavedMedia();
  }, []);

  return {
    capturedMedia,
    isUploading,
    uploadProgress,
    currentUploadId,
    saveMedia,
    uploadMedia,
    deleteMedia,
    loadSavedMedia,
  };
}
