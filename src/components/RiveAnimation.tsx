import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, AppState } from 'react-native';
import Rive, { RiveRef, Fit } from 'rive-react-native';

interface RiveAnimationProps {
  source: string;
  style?: any;
  autoPlay?: boolean;
  fit?: Fit;
  artboardName?: string;
  animationName?: string;
  stateMachineName?: string;
}

const { width, height } = Dimensions.get('window');

const RiveAnimation: React.FC<RiveAnimationProps> = ({
  source,
  style,
  autoPlay = true,
  fit = Fit.Contain,
  artboardName,
  animationName,
  stateMachineName,
}) => {
  const riveRef = useRef<RiveRef>(null);
  const appState = useRef(AppState.currentState);

  // Handle app state changes to manage animation playback
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground, resume animation
        riveRef.current?.play();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App has gone to the background, pause animation
        riveRef.current?.pause();
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Auto-play animation when component mounts
  useEffect(() => {
    if (autoPlay && riveRef.current) {
      riveRef.current.play();
    }
    
    return () => {
      if (riveRef.current) {
        riveRef.current.pause();
      }
    };
  }, [autoPlay]);

  // Determine if the source is a URL or a local resource
  const isUrl = source.startsWith('http');
  
  // Always prepend 'animations/' to local resources without paths
  // This ensures we're pointing to the correct directory in the app bundle
  const localResourceName = !isUrl ? 
    (!source.includes('/') ? `animations/${source}` : source) : 
    '';
  
  return (
    <View style={[styles.container, style]}>
      {isUrl ? (
        // For remote URLs
        <Rive
          ref={riveRef}
          url={source}
          artboardName={artboardName}
          animationName={animationName}
          stateMachineName={stateMachineName}
          fit={fit}
          style={styles.animation}
        />
      ) : (
        // For local resources
        <Rive
          ref={riveRef}
          resourceName={localResourceName}
          artboardName={artboardName}
          animationName={animationName}
          stateMachineName={stateMachineName}
          fit={fit}
          style={styles.animation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});

export default RiveAnimation;
