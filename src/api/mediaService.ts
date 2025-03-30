import apiClient from './apiClient';
import { Platform } from 'react-native';
// Using RNFS for file transfers and uploads
import RNFS from 'react-native-fs';

export interface MediaUploadParams {
  qrId: string;
  mediaType: 'photo' | 'video';
  filePath: string;
  fileName: string;
  mimeType: string;
  metadata?: { [key: string]: any };
}

// Updated response interface based on API specification
export interface UploadUrlResponse {
  s3url: string;
  id: string;
}

// Mapped to our internal structure for compatibility
export interface MappedUploadUrlResponse {
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
  getUploadUrl: async (params: Omit<MediaUploadParams, 'filePath'>): Promise<MappedUploadUrlResponse> => {
    try {
      // Using the endpoint from API specification
      const response = await apiClient.get<UploadUrlResponse>('/api/media/get-signed-url', { 
        'bucket-prefix': 'posts'
      });
      
      // Map the response to our internal structure
      return {
        uploadUrl: response.s3url,
        mediaId: response.id,
        // We'll assume fields is empty since the API doesn't specify any
        fields: {}
      };
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

      // Use RNFS for upload
      const uploadOptions = {
        toUrl: uploadData.uploadUrl,
        files: [{
          name: 'file',
          filename: params.fileName,
          filepath: params.filePath,
          filetype: params.mimeType
        }],
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        fields: uploadData.fields || {},
        begin: (res: any) => {
          console.log('Upload has begun', res);
        },
        progress: (res: any) => {
          if (res && onProgress) {
            const written = res.bytesWritten || 0;
            const total = res.totalBytes || 1; // Avoid division by zero
            if (total > 0) {
              onProgress(written / total);
            }
          }
        }
      };
      
      return await RNFS.uploadFiles(uploadOptions).promise;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new Error('Failed to upload media. Please try again.');
    }
  },

  /**
   * Create a new QR post with the uploaded media
   * @param qrId The ID of the QR code
   * @param imageUrl The URL of the uploaded image
   * @param subject The subject/title
   * @param context Additional context
   * @param narrative Detailed narrative/description
   */
  createQRPost: async (
    qrId: string, 
    imageUrl: string, 
    subject: string, 
    context: string, 
    narrative: string
  ): Promise<void> => {
    try {
      await apiClient.post('/qr/create', {
        qr_code: `https://qdos.bz/${qrId}`,
        subject,
        context,
        narrative,
        image_url: imageUrl
      });
    } catch (error) {
      console.error('Error creating QR post:', error);
      throw new Error('Failed to create post with uploaded media. Please try again.');
    }
  }
};

export default mediaService;
