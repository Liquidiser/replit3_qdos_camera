import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import RiveAnimation from '../components/RiveAnimation';
import ShareButton from '../components/ShareButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import qrService, { QRCodeData } from '../api/qrService';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

interface QRResultScreenProps {
  route: RouteProp<RootStackParamList, 'QRResult'>;
  navigation: StackNavigationProp<RootStackParamList, 'QRResult'>;
}

const QRResultScreen: React.FC<QRResultScreenProps> = ({ route, navigation }) => {
  const { qrValue } = route.params;
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationSource, setAnimationSource] = useState<string | null>(null);
  
  const { activeQRData } = useAppContext();
  const { colors, theme } = useTheme();

  // Load QR data from API or use already loaded data from context
  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setIsLoading(true);
        
        // If we already have this QR data in context, use it
        if (activeQRData && activeQRData.content === qrValue) {
          setQrData(activeQRData);
          
          // Check for animation
          if (activeQRData.metadata?.animationId) {
            try {
              const animationData = await qrService.getQRAnimation(
                activeQRData.metadata.animationId
              );
              setAnimationSource(animationData.animationUrl);
            } catch (animError) {
              console.error('Failed to load animation:', animError);
            }
          }
        } else {
          // Otherwise fetch from API
          const data = await qrService.getQRCodeData(qrValue);
          setQrData(data);
          
          // Check for animation
          if (data.metadata?.animationId) {
            try {
              const animationData = await qrService.getQRAnimation(
                data.metadata.animationId
              );
              setAnimationSource(animationData.animationUrl);
            } catch (animError) {
              console.error('Failed to load animation:', animError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching QR data:', error);
        setError('Failed to load QR code data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQRData();
  }, [qrValue, activeQRData]);

  // Handle share button press
  const handleShare = () => {
    if (qrData) {
      // Create a shareable message
      const shareMessage = `I scanned a QR code using QDOS Camera App!\n\n${
        qrData.metadata?.title || 'Check out this QR code'
      }\n\n${qrData.content}`;
      
      return shareMessage;
    }
    return 'Check out this QR code I scanned using QDOS Camera App!';
  };

  // Go back to camera screen
  const handleScanAnother = () => {
    navigation.goBack();
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading QR code data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !qrData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error || 'Failed to load QR code data'}
          </Text>
          <Button
            title="Try Again"
            onPress={handleScanAnother}
            variant="primary"
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animation if available */}
        {animationSource && (
          <View style={styles.animationContainer}>
            <RiveAnimation 
              source={animationSource} 
              style={styles.animation}
            />
          </View>
        )}
        
        {/* QR Content Card */}
        <Card
          title={qrData.metadata?.title || 'QR Code Content'}
          subtitle={qrData.metadata?.description}
          style={styles.contentCard}
        >
          <Text style={[styles.contentText, { color: colors.text }]}>
            {qrData.content}
          </Text>
          
          {qrData.metadata?.imageUrl && (
            <Image 
              source={{ uri: qrData.metadata.imageUrl }} 
              style={styles.contentImage}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.metadataContainer}>
            {qrData.type && (
              <View style={styles.metadataItem}>
                <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                  Type:
                </Text>
                <Text style={[styles.metadataValue, { color: colors.text }]}>
                  {qrData.type}
                </Text>
              </View>
            )}
            
            <View style={styles.metadataItem}>
              <Text style={[styles.metadataLabel, { color: colors.textSecondary }]}>
                Scanned:
              </Text>
              <Text style={[styles.metadataValue, { color: colors.text }]}>
                {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Scan Another"
            onPress={handleScanAnother}
            variant="outline"
            icon="camera"
            style={styles.actionButton}
          />
          
          <ShareButton
            message={handleShare()}
            style={styles.shareButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    marginTop: 16,
  },
  animationContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  metadataContainer: {
    marginTop: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    width: 80,
    fontWeight: '500',
  },
  metadataValue: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    flex: 1,
  },
});

export default QRResultScreen;
