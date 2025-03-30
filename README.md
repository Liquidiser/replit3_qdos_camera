# QDOS Camera App

A React Native mobile application for QR code scanning with interactive Rive animations and media capture capabilities.

## Features

- QR Code scanning and detection
- Media capture (photo and video)
- Interactive Rive animations
- Background upload with progress tracking
- Social media sharing
- Gallery view for captured media

## Technology Stack

- React Native
- TypeScript
- React Navigation
- Google MLKit (for QR detection on Android)
- Rive React Native (for animations)
- React Native Video
- React Native Camera
- Axios (for API communication)

## Project Structure

- `/src/api` - API service layers
- `/src/components` - Reusable UI components
- `/src/context` - React Context for global state management
- `/src/hooks` - Custom React hooks
- `/src/navigation` - Navigation configuration
- `/src/screens` - App screens
- `/src/styles` - Theme and global styles
- `/src/utils` - Utility functions
- `/assets` - Static assets (images, animations)

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Start Metro server: `npx react-native start`
4. Run on Android: `npx react-native run-android`

## Development Notes

This application is focused on Android implementation. The camera implementation uses Vision Camera and React Native's native modules for QR code detection with Google MLKit.