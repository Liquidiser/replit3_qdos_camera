import { useRef, useEffect, useState } from 'react';
import { Frame } from 'react-native-vision-camera';
import { NativeModules } from 'react-native';
import qrService, { QRCodeData } from '../api/qrService';

// Interface for QR code scanning result
interface QRResult {
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

/**
 * Custom hook for QR code scanning
 */
export const useQRScanner = () => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastDetectedCode = useRef<string | null>(null);
  const lastDetectionTime = useRef<number>(0);

  // Define a scan cooldown to prevent multiple rapid detections
  const SCAN_COOLDOWN_MS = 2000;

  /**
   * Reset scanning state
   */
  const resetScanner = () => {
    setIsScanning(true);
    lastDetectedCode.current = null;
    lastDetectionTime.current = 0;
  };

  /**
   * Process a QR code scan result
   */
  const processQRCode = async (qrValue: string): Promise<QRCodeData | null> => {
    try {
      const data = await qrService.getQRCodeData(qrValue);
      // Log the scan event (non-blocking)
      qrService.submitQRScan(data.id).catch(err => {
        console.warn('Failed to log QR scan:', err);
      });
      return data;
    } catch (error) {
      console.error('Error processing QR code:', error);
      setError('Failed to process QR code data');
      return null;
    }
  };

  /**
   * Scan QR code from a camera frame
   */
  const scanQRCode = (frame: Frame): QRResult | null => {
    // Check if scanning is active and cooldown has passed
    const now = Date.now();
    if (!isScanning || now - lastDetectionTime.current < SCAN_COOLDOWN_MS) {
      return null;
    }

    try {
      // Use the native QR detector module
      if (NativeModules.QRDetectorModule) {
        const result = NativeModules.QRDetectorModule.detectQRCode(frame);
        
        if (result && result.value) {
          // Check if this is a new code or repeated scan
          if (lastDetectedCode.current !== result.value) {
            lastDetectedCode.current = result.value;
            lastDetectionTime.current = now;
            
            // Process the QR code data (in component that uses this hook)
            return result;
          }
        }
      } else {
        // Fallback method if native module is not available
        console.warn('Native QR detector module not available, using fallback method');
        // Implement fallback QR detection if needed
      }
    } catch (error) {
      console.error('QR scan error:', error);
    }
    
    return null;
  };

  return {
    qrData,
    isScanning,
    error,
    scanQRCode,
    processQRCode,
    resetScanner,
    setIsScanning,
  };
};
