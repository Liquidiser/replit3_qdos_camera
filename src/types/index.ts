// Media file type definition
export interface MediaFile {
  id: string;
  path: string;
  type: 'photo' | 'video';
  fileName: string;
  mimeType: string;
  size: number;
  timestamp: number;
}

// QR code detection result
export interface QRDetectionResult {
  value: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    origin: [number, number];
    size: [number, number];
  };
}

// Camera permissions result
export interface CameraPermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'never_ask_again';
}

// Upload status type
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
