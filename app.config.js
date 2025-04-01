// Base configuration
const config = {
  name: "QDOS Camera",
  slug: "replit3qdoscamera",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.qdoscamera",
    buildNumber: "1.0.0",
  },
  android: {
    package: "com.qdoscamera",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    versionCode: 1,
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
    ],
    jsEngine: "hermes",
    fabric: {
      enabled: true,
      surfaceRegistryBinding: true
    }
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    eas: {
      projectId: "6ceb2eb2-a4c9-4361-aa43-05675791799a", // This will be replaced when you run eas build
    },
  },
  plugins: [
    [
      "react-native-vision-camera",
      {
        cameraPermissionText: "QDOS Camera needs access to your camera",
        enableMicrophonePermission: true,
        microphonePermissionText:
          "QDOS Camera needs access to your microphone for videos",
      },
    ],
  ],
};

// Export the configuration
module.exports = config;
