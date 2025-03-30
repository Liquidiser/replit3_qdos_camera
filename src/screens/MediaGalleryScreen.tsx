import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Video from 'react-native-video';
import useMediaCapture from '../hooks/useMediaCapture';
import { MediaFile } from '../types';
import { useTheme } from '../hooks/useTheme';
import ShareButton from '../components/ShareButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - 16) / COLUMN_COUNT;

const MediaGalleryScreen: React.FC = () => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { capturedMedia, deleteMedia, loadSavedMedia } = useMediaCapture();
  const { colors, theme } = useTheme();

  // Load saved media on component mount
  useEffect(() => {
    loadSavedMedia().finally(() => setIsLoading(false));
  }, []);

  // Handle media selection for preview
  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
    setIsVideoPlaying(false);
  };

  // Toggle video playback
  const toggleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  // Close media preview
  const handleClosePreview = () => {
    setSelectedMedia(null);
    setIsVideoPlaying(false);
  };

  // Delete selected media
  const handleDeleteMedia = () => {
    if (selectedMedia) {
      Alert.alert(
        'Delete Media',
        'Are you sure you want to delete this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMedia(selectedMedia.id);
                setSelectedMedia(null);
              } catch (error) {
                Alert.alert('Error', 'Failed to delete media');
              }
            }
          },
        ]
      );
    }
  };

  // Refresh the media gallery
  const handleRefresh = () => {
    setIsLoading(true);
    loadSavedMedia().finally(() => setIsLoading(false));
  };

  // Render media item in grid
  const renderMediaItem = ({ item }: { item: MediaFile }) => {
    return (
      <TouchableOpacity 
        style={styles.mediaItem} 
        onPress={() => handleMediaSelect(item)}
      >
        {item.type === 'photo' ? (
          <Image 
            source={{ uri: item.path }} 
            style={styles.mediaThumbnail} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.videoContainer}>
            <Image 
              source={{ uri: item.path }} 
              style={styles.mediaThumbnail} 
              resizeMode="cover"
            />
            <View style={styles.videoIconContainer}>
              <Feather name="play" size={16} color="white" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={theme.dark ? "light-content" : "dark-content"} 
        backgroundColor={colors.background} 
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Media Gallery</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Feather name="refresh-cw" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Loading media...
          </Text>
        </View>
      ) : capturedMedia.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="image" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No media captured yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Media captured from QR codes will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={capturedMedia}
          renderItem={renderMediaItem}
          keyExtractor={item => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.mediaList}
        />
      )}
      
      {/* Media Preview Modal */}
      {selectedMedia && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={handleClosePreview} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>
              {new Date(selectedMedia.timestamp).toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={handleDeleteMedia} style={styles.deleteButton}>
              <Feather name="trash-2" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewContent}>
            {selectedMedia.type === 'photo' ? (
              <Image
                source={{ uri: selectedMedia.path }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <TouchableOpacity
                style={styles.videoPreviewContainer}
                onPress={toggleVideoPlay}
                activeOpacity={1}
              >
                <Video
                  source={{ uri: selectedMedia.path }}
                  style={styles.previewVideo}
                  resizeMode="contain"
                  paused={!isVideoPlaying}
                  repeat={true}
                />
                {!isVideoPlaying && (
                  <View style={styles.playButtonContainer}>
                    <Feather name="play" size={40} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.previewFooter}>
            <Card style={styles.previewCard}>
              <View style={styles.previewInfo}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {selectedMedia.type === 'photo' ? 'Photo' : 'Video'}
                </Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {new Date(selectedMedia.timestamp).toLocaleString()}
                </Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Size:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {Math.round(selectedMedia.size / 1024)} KB
                </Text>
              </View>
              
              <View style={styles.previewActions}>
                <Button
                  title="Delete"
                  onPress={handleDeleteMedia}
                  variant="outline"
                  icon="trash-2"
                  size="small"
                  style={{ marginRight: 10 }}
                />
                
                <ShareButton
                  message="Check out this media from the QDOS Camera App!"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  mediaList: {
    padding: 4,
  },
  mediaItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    padding: 2,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  videoIconContainer: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 100,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  previewTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoPreviewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFooter: {
    padding: 16,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
  },
  previewInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 50,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default MediaGalleryScreen;
