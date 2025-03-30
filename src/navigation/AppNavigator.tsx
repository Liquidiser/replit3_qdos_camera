import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import CameraScreen from '../screens/CameraScreen';
import MediaGalleryScreen from '../screens/MediaGalleryScreen';
import QRResultScreen from '../screens/QRResultScreen';
import { useTheme } from '../hooks/useTheme';

// Define navigation parameters types
export type RootStackParamList = {
  Main: undefined;
  QRResult: { qrValue: string };
};

export type MainTabParamList = {
  Camera: undefined;
  Gallery: undefined;
};

// Create navigation objects
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator (Camera and Gallery tabs)
const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
          tabBarLabel: 'Scan QR',
        }}
      />
      
      <Tab.Screen
        name="Gallery"
        component={MediaGalleryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="image" size={size} color={color} />
          ),
          tabBarLabel: 'Media',
        }}
      />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="QRResult"
        component={QRResultScreen}
        options={{
          title: 'QR Code Result',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
