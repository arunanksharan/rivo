import { Redirect } from 'expo-router';
import { useAuth } from '@/store/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Root index file for Expo Router
 * Redirects to the appropriate route based on authentication state
 */
export default function Index() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Redirect based on authentication state
  if (user) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
