import apiClient from './apiClient';

// Define interfaces for QR code data based on API specification
export interface QRCodeData {
  id: string;
  qr_id: string;
  content: string;
  type: string;
  subject: string;
  context: string;
  narrative: string;
  land_riv: string;
  port_riv: string;
  metadata?: {
    title?: string;
    description?: string;
    animationId?: string;
    actionType?: string;
    [key: string]: any;
  };
  timestamp: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

/**
 * Service for QR code-related API operations
 */
const qrService = {
  /**
   * Retrieve QR code data from the API
   * @param qrValue - Scanned QR code value or ID
   * @returns QR code data object
   */
  getQRCodeData: async (qrValue: string): Promise<QRCodeData> => {
    try {
      // Extract qr_id from the QR value if needed
      const qrId = qrValue.includes('/') ? qrValue.split('/').pop() : qrValue;
      
      // Call the details endpoint as specified in the API doc
      const response = await apiClient.get<ApiResponse<QRCodeData>>(`/qr/details/${qrId}`);
      
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error retrieving QR code data:', error);
      throw new Error('Failed to retrieve QR code data. Please try again.');
    }
  },

  /**
   * Submit a new QR code post to the API
   * @param data - QR code post data
   */
  createQRPost: async (data: {
    qr_code: string;
    subject: string;
    context: string;
    narrative: string;
    image_url: string;
  }): Promise<void> => {
    try {
      await apiClient.post('/qr/create', data);
    } catch (error) {
      console.error('Error creating QR post:', error);
      throw new Error('Failed to create QR post. Please try again.');
    }
  },

  /**
   * Generate a Twitter post link for sharing
   * @param qrId - QR code ID
   * @returns Object containing the Twitter link
   */
  generateTwitterLink: async (qrId: string): Promise<{ twitter_link: string }> => {
    try {
      return await apiClient.get<{ twitter_link: string }>('/twitter/generate-link', { reference_id: qrId });
    } catch (error) {
      console.error('Error generating Twitter link:', error);
      throw new Error('Failed to generate sharing link. Please try again.');
    }
  },

  /**
   * Delete a QR code entry
   * @param qrId - ID of the QR code to delete
   */
  deleteQRCode: async (qrId: string): Promise<void> => {
    try {
      await apiClient.delete(`/qr/${qrId}`);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error('Failed to delete QR code. Please try again.');
    }
  },
};

export default qrService;
