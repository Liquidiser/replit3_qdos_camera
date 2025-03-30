import apiClient from './apiClient';
import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

export interface MediaUploadParams {
  qrId: string;
  mediaType: 'photo' | 'video';
  filePath: string;
  fileName: string;
  mimeType: string;
  metadata?: { [key: string]: any };
}

export interface UploadUrlResponse {
  uploadUrl: string;
  mediaId: string;
  fields?: { [key: string]: string };
}

/**
 * Service for media upload and processing
 */
const mediaService = {
  /**
   * Request a signed URL for media upload
   * @param params - Upload request parameters
   * @returns Upload URL and related data
   */
  getUploadUrl: async (params: Omit<MediaUploadParams, 'filePath'>): Promise<UploadUrlResponse> => {
    try {
      return await apiClient.post<UploadUrlResponse>('/media/upload-url', {
        qrId: params.qrId,
        mediaType: params.mediaType,
        fileName: params.fileName,
        mimeType: params.mimeType,
        metadata: params.metadata || {},
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw new Error('Failed to prepare media upload. Please try again.');
    }
  },

  /**
   * Upload media file to server
   * @param params - Upload parameters
   * @param onProgress - Progress callback
   * @returns Media metadata from server
   */
  uploadMedia: async (
    params: MediaUploadParams,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    try {
      // Get the signed upload URL
      const uploadData = await mediaService.getUploadUrl({
        qrId: params.qrId,
        mediaType: params.mediaType,
        fileName: params.fileName,
        mimeType: params.mimeType,
        metadata: params.metadata,
      });

      // Prepare form data if using S3 or similar service
      const formData = new FormData();
      if (uploadData.fields) {
        Object.entries(uploadData.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      // Use background upload for large files
      return await ReactNativeBlobUtil.fetch(
        'POST',
        uploadData.uploadUrl,
        {
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'file',
            filename: params.fileName,
            type: params.mimeType,
            data: ReactNativeBlobUtil.wrap(params.filePath),
          },
          ...Object.entries(uploadData.fields || {}).map(([key, value]) => ({
            name: key,
            data: value,
          })),
        ]
      ).uploadProgress((written, total) => {
        if (onProgress) {
          onProgress(written / total);
        }
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media. Please try again.');
    }
  },

  /**
   * Get metadata for a previously uploaded media
   * @param mediaId - ID of the media to retrieve
   * @returns Media metadata
   */
  getMediaMetadata: async (mediaId: string): Promise<any> => {
    try {
      return await apiClient.get<any>(`/media/${mediaId}`);
    } catch (error) {
      console.error('Error retrieving media metadata:', error);
      throw new Error('Failed to get media information. Please try again.');
    }
  },
};

export default mediaService;
