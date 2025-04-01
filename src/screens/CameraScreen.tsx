import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  Text, 
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CameraView from '../components/CameraView';
import MediaPreview from '../components/MediaPreview';
import qrService from '../api/qrService';
import { useAppContext } from '../context/AppContext';
import useMediaCapture from '../hooks/useMediaCapture';
import { getOrientationAwareAnimationSource } from '../utils/animations';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [capturedMediaPath, setCapturedMediaPath] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'photo' | 'video'>('photo');
  const [animationSource, setAnimationSource] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState<boolean>(true);
  
  const { 
    isQRDetected, 
    activeQRData, 
    setIsQRDetected, 
    setActiveQRData, 
    addCapturedMedia,
    setIsUploadingMedia,
    setUploadProgress,
  } = useAppContext();
  
  // Detect device orientation
  useEffect(() => {
    const detectOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setIsPortrait(height > width);
    };
    
    // Initial detection
    detectOrientation();
    
    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', detectOrientation);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Update animation source when orientation changes
  useEffect(() => {
    if (activeQRData && isQRDetected) {
      // Get and set the appropriate animation based on orientation
      setAnimationSource(
        getOrientationAwareAnimationSource(
          activeQRData.port_riv,
          activeQRData.land_riv,
          isPortrait
        )
      );
    }
  }, [isPortrait, activeQRData, isQRDetected]);
  
  const {
    isUploading,
    uploadProgress,
    saveMedia,
    uploadMedia,
  } = useMediaCapture({
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onUploadComplete: () => {
      setIsUploadingMedia(false);
      
      // Navigate to QR result screen after upload
      if (qrValue) {
        navigation.navigate('QRResult', { qrValue });
      }
    },
    onUploadError: (error) => {
      setIsUploadingMedia(false);
      Alert.alert('Upload Error', 'Failed to upload media. Please try again.');
    },
  });

  // Handle QR code detection
  const handleQRCodeDetected = async (qrData: string) => {
    setQrValue(qrData);
    
    try {
      // Retrieve QR code data from API
      const data = await qrService.getQRCodeData(qrData);
      setActiveQRData(data);
      
      // Use the animation utilities to get the correct animation source
      setAnimationSource(
        getOrientationAwareAnimationSource(
          data.port_riv,
          data.land_riv,
          isPortrait
        )
      );
      
      // Set QR detected state
      setIsQRDetected(true);
    } catch (error) {
      console.error('Error fetching QR data:', error);
      Alert.alert(
        'QR Code Error',
        'Unable to process this QR code. Please try scanning again.'
      );
      setIsQRDetected(false);
    }
  };

  // Handle captured media from camera
  const handleMediaCaptured = (path: string, type: 'photo' | 'video') => {
    setCapturedMediaPath(path);
    setCapturedMediaType(type);
  };

  // Upload the captured media
  const handleAcceptMedia = async () => {
    if (capturedMediaPath && activeQRData) {
      try {
        setIsUploadingMedia(true);
        
        // Save media to local storage
        const mediaFile = await saveMedia(capturedMediaPath, capturedMediaType);
        
        // Add to app context
        addCapturedMedia(mediaFile.path, mediaFile.type);
        
        // Upload to server
        await uploadMedia(mediaFile, activeQRData.id, {
          qrContent: activeQRData.content,
          qrType: activeQRData.type,
        });
      } catch (error) {
        console.error('Error handling media:', error);
        setIsUploadingMedia(false);
        Alert.alert('Error', 'Failed to process media. Please try again.');
      }
    }
  };

  // Retake photo/video
  const handleRetakeMedia = () => {
    setCapturedMediaPath(null);
  };

  // Clear media preview
  const handleCloseMediaPreview = () => {
    setCapturedMediaPath(null);
    // Reset QR detection if user cancels the media capture
    setIsQRDetected(false);
    setActiveQRData(null);
    setQrValue(null);
  };

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (capturedMediaPath) {
          handleCloseMediaPreview();
          return true;
        }
        if (isQRDetected) {
          setIsQRDetected(false);
          setActiveQRData(null);
          setQrValue(null);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [capturedMediaPath, isQRDetected])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {capturedMediaPath ? (
        // Show media preview when photo/video has been captured
        <MediaPreview
          mediaPath={capturedMediaPath}
          mediaType={capturedMediaType}
          onClose={handleCloseMediaPreview}
          onAccept={handleAcceptMedia}
          onRetake={handleRetakeMedia}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      ) : (
        // Show camera view for scanning and capturing
        <View style={styles.cameraContainer}>
          <CameraView
            onQRCodeDetected={handleQRCodeDetected}
            onMediaCaptured={handleMediaCaptured}
            animationSource={animationSource || undefined}
          />
          
          {/* QR detection overlay */}
          {isQRDetected && activeQRData && (
            <View style={styles.qrDetectedContainer}>
              <Text style={styles.qrDetectedText}>
                QR Code Detected
              </Text>
              <Text style={styles.qrInstructionText}>
                Take a photo or video related to this QR code
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  qrDetectedContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    alignItems: 'center',
  },
  qrDetectedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrInstructionText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CameraScreen;
