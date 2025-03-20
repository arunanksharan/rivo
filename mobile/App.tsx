import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { Navigation } from '@/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Asyncstorage has been extracted from react-native',
  'Constants.platform.ios.model has been deprecated',
]);

export default function App() {
  // Set up any app-wide effects
  useEffect(() => {
    // Initialize any services or listeners here
    return () => {
      // Clean up any listeners or services
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SupabaseProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <NavigationContainer>
                  <Navigation />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SupabaseProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
