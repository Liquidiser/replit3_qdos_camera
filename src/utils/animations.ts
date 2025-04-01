/**
 * Utilities for working with Rive animations
 */

/**
 * Get the full path or URL for a Rive animation resource
 * @param source The animation source (filename or URL)
 * @param isPortrait Whether the device is in portrait orientation
 * @returns The processed animation source
 */
export const getAnimationSource = (
  source: string | null | undefined,
  isPortrait: boolean = true
): string => {
  // If no source provided, use default animations based on orientation
  if (!source) {
    return isPortrait ? 'port.riv' : 'land.riv';
  }
  
  // Check if source is a URL
  if (source.startsWith('http')) {
    return source;
  }
  
  // For local files, ensure they're referenced correctly
  // This handles both "filename.riv" and "path/to/filename.riv" formats
  return source;
};

/**
 * Check if a Rive animation source is a URL or local resource
 * @param source Animation source string
 * @returns Boolean indicating if the source is a URL
 */
export const isAnimationUrl = (source: string): boolean => {
  return source.startsWith('http');
};

/**
 * Get the appropriate animation source based on orientation
 * @param portraitSource Portrait orientation animation source
 * @param landscapeSource Landscape orientation animation source
 * @param isPortrait Current device orientation
 * @returns The appropriate animation source
 */
export const getOrientationAwareAnimationSource = (
  portraitSource: string | null | undefined,
  landscapeSource: string | null | undefined,
  isPortrait: boolean = true
): string => {
  if (isPortrait) {
    return getAnimationSource(portraitSource || 'port.riv', true);
  } else {
    return getAnimationSource(landscapeSource || 'land.riv', false);
  }
};