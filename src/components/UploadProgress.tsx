import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Easing 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  isComplete: boolean;
  isError: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  isComplete,
  isError,
  onCancel,
  onRetry,
  onDismiss,
}) => {
  const theme = useTheme();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Truncate long file names
  const truncatedFileName = fileName.length > 20 
    ? `${fileName.substring(0, 17)}...` 
    : fileName;
  
  // Calculate progress percentage
  const progressPercent = Math.min(Math.round(progress * 100), 100);
  
  // Update progress animation when progress changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  // Map progress value to width percentage
  const width = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Status Icon */}
      <View style={[
        styles.iconContainer, 
        isComplete ? styles.completeIcon : isError ? styles.errorIcon : styles.uploadingIcon
      ]}>
        <Feather 
          name={isComplete ? 'check' : isError ? 'alert-circle' : 'upload'} 
          size={20} 
          color="white" 
        />
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.fileName}>{truncatedFileName}</Text>
        
        {/* Progress Bar */}
        {!isComplete && !isError && (
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width, backgroundColor: theme.colors.primary }
              ]} 
            />
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        )}
        
        {/* Status Text */}
        {isComplete && (
          <Text style={[styles.statusText, { color: theme.colors.success }]}>
            Upload complete
          </Text>
        )}
        
        {isError && (
          <Text style={[styles.statusText, { color: theme.colors.error }]}>
            Upload failed
          </Text>
        )}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!isComplete && !isError && onCancel && (
          <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
            <Feather name="x" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        
        {isError && onRetry && (
          <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
            <Feather name="refresh-cw" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        
        {(isComplete || isError) && onDismiss && (
          <TouchableOpacity style={styles.actionButton} onPress={onDismiss}>
            <Feather name="trash-2" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadingIcon: {
    backgroundColor: '#2196F3',
  },
  completeIcon: {
    backgroundColor: '#4CAF50',
  },
  errorIcon: {
    backgroundColor: '#F44336',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
});

export default UploadProgress;
