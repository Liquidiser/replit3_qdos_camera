# QDOS Camera App

A React Native mobile application designed for intuitive QR code scanning with dynamic Rive animations and advanced media capture functionalities.

## Features

- Real-time QR code scanning and detection
- High-quality photo and video capture
- Dynamic Rive animations as camera overlays
- Background media upload with progress tracking
- Twitter sharing functionality
- Media gallery for reviewing captured content
- Customizable camera controls (flash, camera switching)
- API integration for QR code data retrieval

## Technology Stack

- **Framework**: React Native
- **Language**: TypeScript
- **Camera**: react-native-vision-camera
- **Animations**: rive-react-native
- **Storage**: react-native-fs
- **Navigation**: React Navigation (Stack and Bottom Tabs)
- **API Client**: Axios
- **Media**: react-native-video
- **Social Sharing**: react-native-share
- **QR Detection**: Google MLKit (native Android integration)
- **Build System**: Expo EAS Build

## Project Structure

```
/
├── android/                # Android native code
├── assets/                 # Static assets
│   ├── animations/         # Rive animation files
│   ├── images/             # App images and icons
├── src/
│   ├── api/                # API service layers and clients
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── context/            # React Context for global state
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   ├── styles/             # Theme and global styles
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── app.config.js           # Expo configuration
└── eas.json                # EAS Build configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- JDK 11
- Android Studio with Android SDK
- EAS CLI (for building): `npm install -g eas-cli`

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/Liquidiser/replit3_qdos_camera.git
   cd qdos-camera
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start Metro server:
   ```
   npx react-native start
   ```

4. Run on Android:
   ```
   npx react-native run-android
   ```

### Building with EAS

This project uses Expo Application Services (EAS) for building the application. The configuration is defined in `eas.json`.

1. Log in to your Expo account:
   ```
   eas login
   ```

2. Configure your project (if not already):
   ```
   eas build:configure
   ```

3. Build a development APK:
   ```
   eas build -p android --profile development
   ```

4. Build a preview APK (for testing):
   ```
   eas build -p android --profile preview
   ```

5. Build a production app bundle:
   ```
   eas build -p android --profile production
   ```

For more details on the EAS build process, see the `eas-scripts.txt` file.

## API Integration

The app integrates with a QR code service API with the following functionality:
- QR code data retrieval
- Media upload with signed URLs
- Twitter sharing integration

## Native Modules

The app uses custom native modules for QR code detection with Google MLKit. The native implementation is located in:
- `/android/app/src/main/java/com/qdoscamera/QRDetectorModule.java`

## Development Notes

This application is currently focused on Android implementation. The camera implementation uses Vision Camera and custom native modules for QR code detection with Google MLKit.

Rive animations are used as overlays to enhance the user experience when scanning QR codes. The animations can be dynamically loaded from an API or from local assets stored in the `assets/animations/` directory.

### Rive Animations

The app includes two local Rive animation files:
- `assets/animations/port.riv` - Used in portrait mode
- `assets/animations/land.riv` - Used in landscape mode

When a QR code is scanned, the app will automatically select the appropriate animation based on the device orientation. If the API returns custom animation URLs in the QR code data, those will be used instead of the local files.

## License

MIT