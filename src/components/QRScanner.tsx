import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFrameProcessor, runOnJS } from 'react-native-vision-camera';
import { useAppContext } from '../context/AppContext';
import { useQRScanner } from '../hooks/useQRScanner';
import { Feather } from '@expo/vector-icons';

interface QRScannerProps {
  onQRCodeDetected: (qrData: string) => void;
  isActive: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onQRCodeDetected, isActive }) => {
  const { isQRDetected, setIsQRDetected } = useAppContext();
  const { scanQRCode } = useQRScanner();

  // Process each frame from the camera to detect QR codes
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!isActive) return;

    try {
      const qrCode = scanQRCode(frame);
      
      if (qrCode && qrCode.value) {
        runOnJS(handleQRCodeDetected)(qrCode.value);
      }
    } catch (error) {
      // Silently handle errors in frame processing
      console.error('QR frame processor error:', error);
    }
  }, [isActive]);

  // Handle detected QR code
  const handleQRCodeDetected = (qrValue: string) => {
    if (!isQRDetected) {
      setIsQRDetected(true);
      onQRCodeDetected(qrValue);
    }
  };

  // Reset QR detection state when component is unmounted or inactive
  useEffect(() => {
    if (!isActive) {
      setIsQRDetected(false);
    }
    
    return () => {
      setIsQRDetected(false);
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      {/* QR Scan indicator */}
      {!isQRDetected && isActive && (
        <View style={styles.scanArea}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
        </View>
      )}
      
      {/* QR Detected indicator */}
      {isQRDetected && (
        <View style={styles.detectedContainer}>
          <View style={styles.detectedIndicator}>
            <Feather name="check-circle" size={24} color="#4CAF50" />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  topRight: {
    right: 0,
    left: undefined,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
    top: undefined,
    left: undefined,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  detectedContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  detectedIndicator: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScanner;
