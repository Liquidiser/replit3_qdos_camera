import { Camera } from 'react-native-vision-camera';
import { Alert, Linking, Platform } from 'react-native';
import { CameraPermissionResult } from '../types';

/**
 * Request camera permission from the user
 * @returns Promise resolving to a boolean indicating if permission was granted
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const permission = await Camera.requestCameraPermission();
  
  if (permission === 'denied') {
    showPermissionSettings('Camera permission is required to scan QR codes and take photos/videos.');
    return false;
  }
  
  if (permission === 'restricted' || permission === 'authorized') {
    // iOS: restricted means parental controls, authorized means granted
    // We consider both as granted
    return true;
  }
  
  return permission === 'granted';
};

/**
 * Request microphone permission for video recording
 * @returns Promise resolving to a boolean indicating if permission was granted
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  const permission = await Camera.requestMicrophonePermission();
  
  if (permission === 'denied') {
    showPermissionSettings('Microphone permission is required to record videos with audio.');
    return false;
  }
  
  if (permission === 'restricted' || permission === 'authorized') {
    return true;
  }
  
  return permission === 'granted';
};

/**
 * Check camera permission status
 * @returns Promise resolving to the current camera permission status
 */
export const checkCameraPermission = async (): Promise<CameraPermissionResult> => {
  const permission = await Camera.getCameraPermissionStatus();
  const granted = permission === 'granted' || permission === 'authorized';
  
  return {
    granted,
    status: granted ? 'granted' : permission === 'not-determined' ? 'denied' : 'never_ask_again',
  };
};

/**
 * Check microphone permission status
 * @returns Promise resolving to the current microphone permission status
 */
export const checkMicrophonePermission = async (): Promise<CameraPermissionResult> => {
  const permission = await Camera.getMicrophonePermissionStatus();
  const granted = permission === 'granted' || permission === 'authorized';
  
  return {
    granted,
    status: granted ? 'granted' : permission === 'not-determined' ? 'denied' : 'never_ask_again',
  };
};

/**
 * Request both camera and microphone permissions at once
 * @returns Promise resolving to a boolean indicating if both permissions were granted
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  const cameraPermission = await requestCameraPermission();
  const microphonePermission = await requestMicrophonePermission();
  
  return cameraPermission && microphonePermission;
};

/**
 * Show alert prompting user to go to settings to enable permissions
 * @param message Message explaining why the permission is needed
 */
export const showPermissionSettings = (message: string): void => {
  Alert.alert(
    'Permission Required',
    `${message}\n\nPlease enable it in your device settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Settings', 
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        } 
      }
    ]
  );
};

/**
 * Check if user has granted all required permissions for the app to function
 * @returns Promise resolving to a boolean indicating if all permissions are granted
 */
export const checkAllPermissions = async (): Promise<boolean> => {
  const camera = await checkCameraPermission();
  const microphone = await checkMicrophonePermission();
  
  return camera.granted && microphone.granted;
};
