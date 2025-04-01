# QDOS Camera App - Project Specification

## Project Overview

The QDOS Camera App is a React Native mobile application developed primarily for Android, designed to transform QR code scanning into an intelligent, engaging user experience through innovative animation and interaction design. The app combines advanced media capture, QR code detection, and social sharing capabilities to create a seamless and intuitive user experience.

## Technical Architecture

### Core Technologies
- **Frontend Framework**: React Native 0.76.7
- **Language**: TypeScript
- **State Management**: React Context API
- **Navigation**: React Navigation 7.x
- **Animation**: Rive React Native 9.2.0
- **Media Handling**: React Native Vision Camera 4.6.4, React Native Video 6.11.0
- **API Integration**: Axios 1.8.4
- **File System**: React Native FS 2.20.0
- **QR/Barcode Scanning**: Google MLKit (17.0.0)

### Build Environment
- **Gradle Version**: 7.6
- **Java Version**: 17
- **Android SDK**: 
  - Build Tools: 34.0.0
  - Compile SDK: 34
  - Target SDK: 34
  - Min SDK: 26
- **Build System**: EAS (Expo Application Services)
- **NDK Version**: 25.2.9519653

## Application Features

### 1. QR Code Scanning
- Real-time QR code detection using device camera
- Support for both static and dynamic QR codes
- Integration with Google MLKit for accurate and fast scanning
- Custom scanning overlay with visual feedback

### 2. Media Capture
- High-quality photo and video capture
- Support for both front and rear cameras
- Flash control and camera switching
- Support for different aspect ratios and resolutions

### 3. Media Preview & Management
- Preview captured photos and videos before uploading
- Thumbnail gallery of all captured media
- Media playback controls for video
- Media metadata management

### 4. QR Code Data Processing
- Parsing and validation of QR code data
- Support for different QR code content types
- Contextual actions based on QR code content
- Integration with backend API for QR data persistence

### 5. Background Uploads
- Efficient background upload of media files
- Upload progress tracking and notifications
- Retry mechanism for failed uploads
- Automatic handling of network connectivity issues

### 6. Rive Animations
- Dynamic loading of Rive animations based on QR code data
- Support for both portrait and landscape orientations with automatic switching
- Interactive animation states tied to user actions
- Optimized animation performance
- Unified animation utilities for consistent handling of local and remote animation sources
- Intelligent fallback to local animations when network resources are unavailable

### 7. Social Sharing
- Direct sharing to social media platforms
- Custom share previews with metadata
- Support for sharing both media and links
- Twitter integration for instant sharing

## API Specification

### Base URL
`https://api.qrservice.com/v1`

### Authentication
- **Type**: Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Token Storage**: Secure storage with encryption

### Endpoints

#### 1. QR Code Data
- **GET** `/qr/:qrId`
  - Retrieves QR code data using the scanned ID
  - Response includes content, type, subject, context, narrative, and animation references
  - Response format: JSON

#### 2. Media Upload
- **POST** `/media/upload-url`
  - Generates a signed S3 URL for media upload
  - Required fields: qrId, mediaType, fileName, mimeType
  - Response includes uploadUrl and mediaId

- **POST** `/media/confirm/:mediaId`
  - Confirms successful upload to S3
  - Updates database with media metadata
  - Associates media with specific QR code

#### 3. QR Post Creation
- **POST** `/qr/post`
  - Creates a new post associated with a QR code
  - Required fields: qrId, mediaUrl, subject, context, narrative
  - Optional: metadata (JSON object with additional information)

#### 4. Social Sharing
- **GET** `/share/twitter/:qrId`
  - Generates a Twitter sharing link with pre-populated content
  - Returns a shareable URL that includes media preview

#### 5. Media Management
- **GET** `/media/:qrId`
  - Lists all media associated with a QR code
  - Includes URLs, types, and timestamps

- **DELETE** `/media/:mediaId`
  - Removes a specific media item
  - Requires authorization validation

## Data Models

### QR Code Data Model
```typescript
interface QRCodeData {
  id: string;
  qr_id: string;
  content: string;
  type: string;
  subject: string;
  context: string;
  narrative: string;
  land_riv: string;
  port_riv: string;
  metadata?: {
    title?: string;
    description?: string;
    animationId?: string;
    actionType?: string;
    [key: string]: any;
  };
  timestamp: string;
}
```

### Media File Model
```typescript
interface MediaFile {
  id: string;
  path: string;
  type: 'photo' | 'video';
  fileName: string;
  mimeType: string;
  size: number;
  timestamp: number;
}
```

### Media Upload Parameters
```typescript
interface MediaUploadParams {
  qrId: string;
  mediaType: 'photo' | 'video';
  filePath: string;
  fileName: string;
  mimeType: string;
  metadata?: { [key: string]: any };
}
```

## UI/UX Design

### Theme System
- Light and dark mode support
- Consistent color palette across the application
- Responsive layout for different screen sizes
- Accessibility-focused interaction design

### Key Screens
1. **Camera Screen**: Primary interface with camera preview, QR scanner, and capture controls
2. **QR Result Screen**: Displays QR code data with animations and action buttons
3. **Media Gallery Screen**: Grid view of captured media with filtering and sorting options
4. **Media Preview Screen**: Detailed view of selected media with sharing and editing options
5. **Upload Progress Screen**: Visual indicator of upload progress with cancel/retry options

## Performance Considerations

### Media Handling
- Efficient media compression before upload
- Thumbnail generation for gallery view
- Streaming media playback for videos
- Caching mechanism for frequently accessed media

### Animation Performance
- Optimized Rive animations for mobile devices
- Dynamic loading based on device capabilities
- Background loading of animations to prevent UI blocking
- Reduced animation complexity on lower-end devices

### Battery Optimization
- Camera and sensors are disabled when not in use
- Background processes are optimized for battery efficiency
- Network operations batched when possible
- Wake locks are used judiciously

## Security Measures

### Data Protection
- Media files are stored in a secure directory
- Sensitive information is encrypted at rest
- Network communications use HTTPS
- Authentication tokens have appropriate expiration

### Privacy Considerations
- Camera and microphone permissions are requested only when needed
- Users can delete their captured media
- No unnecessary analytics or tracking
- Clear user consent flows for data sharing

## Build Configuration

### Android Gradle Configuration
```groovy
// Top-level build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        compileSdkVersion = 34
        targetSdkVersion = 34
        minSdkVersion = 26
        
        // React Native configuration
        kotlin_version = "1.8.0"
        androidXCore = "1.10.1"
        androidXAnnotation = "1.6.0"
        androidXAppcompat = "1.6.1"
        ndkVersion = "25.2.9519653"
        
        // MLKit for QR detection
        mlkitVersion = "17.0.0"
    }
    // ...
}
```

### EAS Build Configuration
```json
{
  "cli": {
    "version": ">= 3.13.3",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk",
        "gradleProperties": {
          "org.gradle.java.home": "/path/to/jdk-17",
          "org.gradle.jvmargs": "-Xmx2048m -XX:MaxMetaspaceSize=512m"
        }
      },
      "env": {
        "REACT_NATIVE_GRADLE_PROPERTIES_FIX": "true"
      },
      "prebuildCommand": "./eas-build-pre-install.sh && (test -f ./eas-post-install.sh && ./eas-post-install.sh || echo 'No post-install script found')"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleProperties": {
          "org.gradle.java.home": "/path/to/jdk-17",
          "org.gradle.jvmargs": "-Xmx2048m -XX:MaxMetaspaceSize=512m"
        }
      },
      "env": {
        "REACT_NATIVE_GRADLE_PROPERTIES_FIX": "true"
      },
      "prebuildCommand": "./eas-build-pre-install.sh && (test -f ./eas-post-install.sh && ./eas-post-install.sh || echo 'No post-install script found')"
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleProperties": {
          "org.gradle.java.home": "/path/to/jdk-17",
          "org.gradle.jvmargs": "-Xmx4096m -XX:MaxMetaspaceSize=512m"
        }
      },
      "env": {
        "REACT_NATIVE_GRADLE_PROPERTIES_FIX": "true"
      },
      "prebuildCommand": "./eas-build-pre-install.sh && (test -f ./eas-post-install.sh && ./eas-post-install.sh || echo 'No post-install script found')"
    }
  }
}
```

### Gradle Wrapper Configuration (gradle-wrapper.properties)
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

## Testing Strategy

### Unit Testing
- Jest and React Native Testing Library for component testing
- Mock API responses for isolated testing
- Test coverage for critical business logic

### Integration Testing
- End-to-end workflows testing with Detox
- Camera and QR scanning integration tests
- API integration testing with mock servers

### Manual Testing
- Device-specific testing on various Android devices
- Performance testing on low-end devices
- User acceptance testing with focus groups

## Deployment Process

### Development Builds
- Generated using EAS Build with development profile
- Distributed internally through EAS for testing
- Contains additional logging and debugging tools

### Preview Builds
- Generated using EAS Build with preview profile
- Distributed to stakeholders for review
- Nearly production-ready with minimal debugging tools

### Production Builds
- Generated using EAS Build with production profile
- Optimized for performance and size
- Signed with production keystore
- Deployed to Google Play Store

## Future Enhancements

### Planned Features
- iOS support
- Offline mode with synchronized uploads
- Enhanced analytics for QR code engagement
- AR integration for interactive experiences
- Multi-language support

### Technical Improvements
- Migration to Hermes JavaScript engine
- Adoption of the new React Native architecture
- Implementation of Code Push for OTA updates
- Performance optimization for animations

## Known Issues and Limitations

1. Limited support for certain video codecs on older devices
2. QR code detection may be affected in extreme lighting conditions
3. Background uploads may be interrupted by aggressive battery optimization on some devices
4. Animation performance may vary across different device capabilities

---

This specification is a living document and may be updated as the project evolves.

## Recent Updates

### April 1, 2025 - Animation System Enhancements
- Added animations utility module for consistent handling of local and remote animations
- Updated RiveAnimation component to leverage new utilities
- Improved orientation detection and animation source selection
- Added support for fallback animations when network resources are unavailable
- Enhanced documentation for animation usage in the application

Last Updated: April 1, 2025