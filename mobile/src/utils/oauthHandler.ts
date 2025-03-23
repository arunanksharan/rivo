import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, AuthSessionResult } from 'expo-auth-session';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from '@/services/auth';
import { logger } from '@/utils/logger';
import { API_CONFIG } from '@/config';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Define Google OAuth configuration
const GOOGLE_CONFIG = {
  expoClientId: API_CONFIG.GOOGLE_EXPO_CLIENT_ID,
  webClientId: API_CONFIG.GOOGLE_WEB_CLIENT_ID,
  iosClientId: API_CONFIG.GOOGLE_IOS_CLIENT_ID,
  androidClientId: API_CONFIG.GOOGLE_ANDROID_CLIENT_ID,
};

/**
 * Helper function to check if running in Expo Go
 */
const isRunningInExpoGo = () => {
  return Constants.executionEnvironment === 'storeClient';
};

/**
 * Creates the appropriate redirect URI based on the current environment
 */
const getRedirectUri = () => {
  if (isRunningInExpoGo()) {
    // For Expo Go, we need to use the Expo auth proxy
    // This is critical for Expo Go to handle the redirect properly
    // return makeRedirectUri({
    //   // The native option is better for Expo Go
    //   // native: 'rivorealestate://auth/callback',
    //   useProxy: true,
    // } as any);
    return {
      redirectUri:
        'https://auth.expo.io/arunanksharan/rivo-real-estate/auth/callback',
    };
  } else {
    // For standalone app, use the app scheme
    return makeRedirectUri({
      scheme: 'rivorealestate',
      path: 'auth/callback',
    });
  }
};

/**
 * Handles the OAuth flow for mobile applications
 * @param provider The OAuth provider (e.g., 'google')
 * @returns Promise with the OAuth result
 */
export const handleOAuthLogin = async (
  provider: 'google' | 'apple' | 'facebook'
) => {
  logger.info(`Starting ${provider} OAuth flow`);

  try {
    // Get the appropriate redirect URI
    const redirectUri = getRedirectUri();
    logger.info('Using redirect URI', { redirectUri });

    // Start the OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUri,
        // Important: Set to true for Expo Go to work properly
        skipBrowserRedirect: true,
        queryParams: {
          // Request offline access for refresh tokens
          access_type: 'offline',
          // Force consent screen to ensure refresh token is always provided
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('OAuth initialization error', error);
      throw error;
    }

    if (!data?.url) {
      logger.error('No OAuth URL returned');
      throw new Error('No OAuth URL returned from Supabase');
    }

    logger.info('Opening OAuth URL in browser', { url: data.url });

    // Open the URL in a web browser
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

    logger.info('WebBrowser result', {
      type: result.type,
    });

    // Handle the result
    if (result.type === 'success') {
      logger.info('OAuth successful, processing result');

      // For TypeScript compatibility, we need to cast the result
      const authResult = result as WebBrowser.WebBrowserAuthSessionResult & {
        url: string;
      };

      if (!authResult.url) {
        throw new Error('No URL returned from auth session');
      }

      // Extract the code from the URL
      const url = authResult.url;
      const params = new URL(url).searchParams;
      const code = params.get('code');

      if (code) {
        logger.info('Got authorization code, exchanging for session');

        // Exchange the code for a session
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          logger.error('Session exchange error', error);
          throw error;
        }

        logger.info('OAuth complete, session established');
        return data;
      } else {
        // Try to extract from fragment if not in query params
        const fragmentParams = new URLSearchParams(url.split('#')[1] || '');
        const fragmentCode = fragmentParams.get('code');

        if (fragmentCode) {
          logger.info(
            'Got authorization code from fragment, exchanging for session'
          );
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(fragmentCode);

          if (error) {
            logger.error('Session exchange error', error);
            throw error;
          }

          logger.info('OAuth complete, session established');
          return data;
        }

        logger.error('No code found in redirect URL', { url });
        throw new Error('No authorization code found in redirect URL');
      }
    } else {
      logger.info('OAuth flow cancelled or failed', {
        resultType: result.type,
      });
      throw new Error(`${provider} sign in was cancelled or failed`);
    }
  } catch (error) {
    logger.error('OAuth error', error);
    throw error;
  }
};
