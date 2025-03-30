import apiClient from './apiClient';

// Define interfaces for QR code data
export interface QRCodeData {
  id: string;
  content: string;
  type: string;
  metadata?: {
    title?: string;
    description?: string;
    animationId?: string;
    actionType?: string;
    [key: string]: any;
  };
  timestamp: string;
}

/**
 * Service for QR code-related API operations
 */
const qrService = {
  /**
   * Retrieve QR code data from the API
   * @param qrValue - Scanned QR code value
   * @returns QR code data object
   */
  getQRCodeData: async (qrValue: string): Promise<QRCodeData> => {
    try {
      return await apiClient.get<QRCodeData>('/qr/decode', { code: qrValue });
    } catch (error) {
      console.error('Error retrieving QR code data:', error);
      throw new Error('Failed to retrieve QR code data. Please try again.');
    }
  },

  /**
   * Submit QR code scan event to the API
   * @param qrId - QR code ID
   * @param metadata - Additional metadata about the scan
   */
  submitQRScan: async (qrId: string, metadata: { [key: string]: any } = {}): Promise<void> => {
    try {
      await apiClient.post('/qr/scan', {
        qrId,
        deviceInfo: {
          platform: 'android',
          timestamp: new Date().toISOString(),
        },
        ...metadata,
      });
    } catch (error) {
      console.error('Error submitting QR scan event:', error);
      // Non-critical error, don't throw
    }
  },

  /**
   * Get animation data associated with a QR code
   * @param animationId - ID of the animation to retrieve
   * @returns Animation configuration object
   */
  getQRAnimation: async (animationId: string): Promise<any> => {
    try {
      return await apiClient.get<any>(`/animations/${animationId}`);
    } catch (error) {
      console.error('Error retrieving animation data:', error);
      throw new Error('Failed to load animation. Please try again.');
    }
  },
};

export default qrService;
