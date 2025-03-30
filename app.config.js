module.exports = {
  name: "QDOS Camera",
  slug: "qdos-camera",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.qdoscamera",
    buildNumber: "1.0.0"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.qdoscamera",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "your-eas-project-id" // This will be replaced when you run eas build
    }
  },
  plugins: [
    [
      "react-native-vision-camera",
      {
        "cameraPermissionText": "QDOS Camera needs access to your camera",
        "enableMicrophonePermission": true,
        "microphonePermissionText": "QDOS Camera needs access to your microphone for videos"
      }
    ]
  ]
};