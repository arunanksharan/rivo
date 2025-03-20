import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

/**
 * ErrorMessage component displays an error message with an optional retry button.
 * Used when data fetching or operations fail.
 * 
 * @param message - Error message to display
 * @param onRetry - Optional callback function to retry the operation
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
}) => {
  const { isDark } = useTheme();

  return (
    <View className="items-center justify-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <Ionicons
        name="alert-circle-outline"
        size={32}
        color={isDark ? '#FCA5A5' : '#EF4444'}
      />
      <Text className="mt-2 text-red-700 dark:text-red-300 text-center px-4">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          className="mt-4 bg-white dark:bg-gray-800 py-2 px-4 rounded-lg border border-red-300 dark:border-red-800"
          onPress={onRetry}
        >
          <Text className="text-red-600 dark:text-red-400 font-medium">
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;
