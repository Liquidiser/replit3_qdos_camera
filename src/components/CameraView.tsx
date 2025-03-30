import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, Text, Dimensions } from 'react-native';
import { Camera, CameraPosition, useCameraDevices } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import QRScanner from './QRScanner';
import RiveAnimation from './RiveAnimation';
import { requestCameraPermission } from '../utils/permissions';
import useCamera from '../hooks/useCamera';
import { useAppContext } from '../context/AppContext';

interface CameraViewProps {
  onQRCodeDetected: (qrData: string) => void;
  onMediaCaptured: (path: string, type: 'photo' | 'video') => void;
  animationSource?: string;
}

const CameraView: React.FC<CameraViewProps> = ({
  onQRCodeDetected,
  onMediaCaptured,
  animationSource,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { isQRDetected, theme } = useAppContext();
  
  const isFocused = useIsFocused();
  
  const {
    cameraRef,
    devices,
    device,
    flash,
    cameraPosition,
    setCameraPosition,
    takePhoto,
    startRecording,
    stopRecording,
    toggleFlash,
  } = useCamera();

  // Check for camera permission on mount
  useEffect(() => {
    (async () => {
      const cameraPermission = await requestCameraPermission();
      setHasPermission(cameraPermission);
    })();
  }, []);

  // Handle photo capture
  const handleTakePhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo?.path) {
        onMediaCaptured(photo.path, 'photo');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Handle video recording start
  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Handle video recording stop
  const handleStopRecording = async () => {
    try {
      const video = await stopRecording();
      if (video?.path) {
        onMediaCaptured(video.path, 'video');
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
    }
  };

  // Toggle between front and back camera
  const toggleCameraPosition = () => {
    setCameraPosition(
      cameraPosition === 'back' ? 'front' : 'back'
    );
  };

  // Handle permissions not granted
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubText}>
          Please grant camera permission to use the QR scanner
        </Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isFocused}
        photo={true}
        video={true}
        audio={true}
        enableZoomGesture
        enableFpsGraph
      >
        {/* QR Code Scanner */}
        <QRScanner
          onQRCodeDetected={onQRCodeDetected}
          isActive={isFocused && !isRecording}
        />

        {/* Animation Overlay */}
        {animationSource && isQRDetected && (
          <RiveAnimation 
            source={animationSource} 
            style={styles.animation}
          />
        )}
      </Camera>

      {/* Camera Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={toggleFlash}
          disabled={isRecording}
        >
          <Feather 
            name={flash === 'off' ? 'zap-off' : 'zap'} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>

        <View style={styles.captureContainer}>
          {isRecording ? (
            <TouchableOpacity 
              style={[styles.captureButton, styles.recordingButton]} 
              onPress={handleStopRecording}
            >
              <View style={styles.stopRecordingIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={handleTakePhoto}
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={toggleCameraPosition}
          disabled={isRecording}
        >
          <Feather name="refresh-cw" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Record Video Button */}
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.activeRecordButton]}
        onPress={isRecording ? handleStopRecording : handleStartRecording}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'STOP' : 'RECORD'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  recordingButton: {
    backgroundColor: 'red',
  },
  stopRecordingIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  activeRecordButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  permissionSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  animation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default CameraView;
