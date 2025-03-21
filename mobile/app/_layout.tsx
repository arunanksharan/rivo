// import { Stack } from 'expo-router';
// import { useTheme } from '@/theme/ThemeProvider';

// /**
//  * Root layout for the entire application
//  * Configures global navigation settings
//  */
// export default function RootLayout() {
//   const { theme } = useTheme();

//   return (
//     <Stack
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: theme.colors.background,
//         },
//         headerTintColor: theme.colors.text,
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         },
//         headerShadowVisible: false,
//         contentStyle: {
//           backgroundColor: theme.colors.background,
//         },
//       }}
//     >
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//       <Stack.Screen name="(app)" options={{ headerShown: false }} />
//     </Stack>
//   );
// }

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/store/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-gesture-handler';
import { logEnvironmentVariables } from '@/utils/logEnvVars';
import { View, Text } from 'react-native';

// Create a client for React Query
const queryClient = new QueryClient();

/**
 * Root layout for the entire application
 * Configures global navigation settings and providers
 */
export default function RootLayout() {
  // Log environment variables on app startup
  useEffect(() => {
    logEnvironmentVariables();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={({ route, navigation }) => ({
                headerShown: false,
              })}
            />
          </SafeAreaProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Error boundary for Expo Router
export function ErrorBoundary(props: { error: Error }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Text
        style={{
          color: 'red',
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        Error: {props.error.message}
      </Text>
      <Text
        style={{
          color: '#333',
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Something went wrong in the app.
      </Text>
    </View>
  );
}
