import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * LoadingScreen component displayed during app initialization.
 * Shows a loading spinner and app logo.
 */
const LoadingScreen: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* App Logo Placeholder */}
      <View className="w-24 h-24 items-center justify-center mb-4 rounded-xl bg-primary-600">
        <Text className="text-white text-3xl font-bold">Rivo</Text>
      </View>
      
      {/* Loading Indicator */}
      <ActivityIndicator size="large" color="#2563EB" />
      
      {/* Loading Text */}
      <Text className="mt-4 text-gray-600 dark:text-gray-300 text-base">
        Loading your experience...
      </Text>
    </View>
  );
};

export default LoadingScreen;
