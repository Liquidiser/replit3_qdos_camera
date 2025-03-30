import { useState, useRef, useEffect } from 'react';
import { Camera, CameraDevice, CameraDeviceFormat, CameraPosition, PhotoFile, VideoFile } from 'react-native-vision-camera';
import { useCameraDevices } from 'react-native-vision-camera';
import { Alert, Platform } from 'react-native';

interface UseCameraResult {
  cameraRef: React.RefObject<Camera>;
  devices: CameraDevice[];
  device: CameraDevice | null;
  flash: 'off' | 'on';
  cameraPosition: CameraPosition;
  setCameraPosition: (position: CameraPosition) => void;
  takePhoto: () => Promise<PhotoFile | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VideoFile | null>;
  toggleFlash: () => void;
  isRecording: boolean;
}

/**
 * Custom hook for camera functionality
 */
export default function useCamera(): UseCameraResult {
  const cameraRef = useRef<Camera>(null);
  const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoFile | null>(null);

  // Get the appropriate device based on selected position
  const device = cameraPosition === 'back' ? devices.back : devices.front;

  // Toggle flash
  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  // Take a photo
  const takePhoto = async (): Promise<PhotoFile | null> => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flash,
          quality: 90,
          enableShutterSound: true,
        });
        return photo;
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo');
        return null;
      }
    }
    return null;
  };

  // Start video recording
  const startRecording = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        cameraRef.current.startRecording({
          flash: flash,
          fileType: 'mp4',
          onRecordingFinished: (video) => {
            setVideoResult(video);
            setIsRecording(false);
          },
          onRecordingError: (error) => {
            console.error('Video recording error:', error);
            setIsRecording(false);
            Alert.alert('Error', 'Failed to record video');
          },
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  // Stop video recording
  const stopRecording = async (): Promise<VideoFile | null> => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
        // Return the video result once it's available
        return new Promise((resolve) => {
          const checkVideoResult = () => {
            if (videoResult) {
              const result = videoResult;
              setVideoResult(null);
              resolve(result);
            } else {
              setTimeout(checkVideoResult, 100);
            }
          };
          checkVideoResult();
        });
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
        return null;
      }
    }
    return null;
  };

  return {
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
    isRecording,
  };
}
