import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  View, 
  Share, 
  ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface ShareButtonProps {
  title?: string;
  message: string;
  url?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onShareComplete?: () => void;
  style?: any;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Check this out!',
  message,
  url,
  disabled = false,
  isLoading = false,
  onShareComplete,
  style,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const theme = useTheme();

  // Handle share button press
  const handleShare = async () => {
    if (disabled || isLoading || isSharing) return;
    
    setIsSharing(true);
    
    try {
      // Prepare share content
      const shareContent: any = {
        message,
      };
      
      // Add URL if provided
      if (url) {
        shareContent.url = url;
      }
      
      // Show share dialog
      const result = await Share.share(shareContent, { dialogTitle: title });
      
      if (result.action === Share.sharedAction) {
        if (onShareComplete) {
          onShareComplete();
        }
      }
    } catch (error) {
      console.error('Error sharing content:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled || isLoading || isSharing ? styles.disabledContainer : null,
        style
      ]}
      onPress={handleShare}
      disabled={disabled || isLoading || isSharing}
    >
      {isLoading || isSharing ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <View style={styles.buttonContent}>
          <Feather name="share-2" size={18} color="white" />
          <Text style={styles.text}>Share</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DA1F2', // Twitter blue color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledContainer: {
    backgroundColor: '#a0a0a0',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ShareButton;
