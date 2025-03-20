import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  message?: string;
}

/**
 * LoadingIndicator component displays a loading spinner with an optional message.
 * 
 * @param size - Size of the spinner ('small' or 'large')
 * @param message - Optional message to display below the spinner
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  message,
}) => {
  const { isDark } = useTheme();

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size={size} color="#2563EB" />
      {message && (
        <Text className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {message}
        </Text>
      )}
    </View>
  );
};

export default LoadingIndicator;
