import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  Dimensions 
} from 'react-native';
import Video from 'react-native-video';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface MediaPreviewProps {
  mediaPath: string;
  mediaType: 'photo' | 'video';
  onClose: () => void;
  onAccept: () => void;
  onRetake: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

const { width, height } = Dimensions.get('window');

const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaPath,
  mediaType,
  onClose,
  onAccept,
  onRetake,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<Video>(null);
  const theme = useTheme();

  // Toggle video playback
  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
  };

  // Calculate upload progress percentage
  const progressPercentage = Math.round(uploadProgress * 100);

  return (
    <View style={styles.container}>
      {/* Media Content */}
      {mediaType === 'photo' ? (
        <Image source={{ uri: mediaPath }} style={styles.media} resizeMode="cover" />
      ) : (
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: mediaPath }}
            style={styles.media}
            resizeMode="cover"
            paused={!isPlaying}
            repeat={true}
          />
          
          {/* Video Playback Controls */}
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="white"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Controls Overlay */}
      <View style={styles.controlsContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.uploadingText}>
                Uploading... {progressPercentage}%
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={onRetake}>
                <Feather name="refresh-cw" size={20} color="white" />
                <Text style={styles.actionText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]} 
                onPress={onAccept}
              >
                <Feather name="check" size={20} color="white" />
                <Text style={styles.actionText}>Use This</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Upload Progress Bar */}
      {isUploading && (
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  acceptButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  actionText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 15,
  },
  uploadingText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default MediaPreview;
