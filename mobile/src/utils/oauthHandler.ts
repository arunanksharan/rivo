import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  TokenResponse,
} from 'expo-auth-session';
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
 * Handles the OAuth flow for mobile applications using direct Google integration
 * @param provider The OAuth provider (e.g., 'google')
 * @returns Promise with the OAuth result
 */
export const handleOAuthLogin = async (
  provider: 'google' | 'apple' | 'facebook'
) => {
  logger.info(`Starting ${provider} OAuth flow with direct integration`);

  try {
    // For Google OAuth, we'll use a direct approach
    if (provider === 'google') {
      return await handleGoogleLogin();
    } else {
      // For other providers, use the standard Supabase flow
      return await handleSupabaseOAuth(provider);
    }
  } catch (error) {
    logger.error('OAuth error', error);
    throw error;
  }
};

/**
 * Handle Google login using Expo's AuthSession
 */
const handleGoogleLogin = async () => {
  try {
    // Get the discovery document for Google
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    // Set up the redirect URI for Expo Go
    let redirectUri;

    if (Constants.appOwnership === 'expo') {
      // For Expo Go, use the Expo-specific redirect
      redirectUri = Linking.createURL('auth/callback');
      logger.info('Using Expo Go specific redirect URI', { redirectUri });
    } else {
      // For standalone app, use the app scheme
      redirectUri = makeRedirectUri({
        scheme: 'rivorealestate',
        path: 'auth/callback',
        preferLocalhost: false,
      });
    }

    logger.info('Google OAuth redirect URI', { redirectUri });

    // Create a random state string to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);

    // Get the appropriate client ID based on platform
    let clientId = GOOGLE_CONFIG.webClientId;
    if (Platform.OS === 'ios') {
      clientId = GOOGLE_CONFIG.iosClientId;
    } else if (Platform.OS === 'android') {
      clientId = GOOGLE_CONFIG.androidClientId;
    } else if (Constants.appOwnership === 'expo') {
      clientId = GOOGLE_CONFIG.expoClientId;
    }

    // Set up the auth request
    const authUrl = new URL(discovery.authorizationEndpoint);
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('prompt', 'select_account');

    logger.info('Opening Google auth URL', { url: authUrl.toString() });

    // Open the auth URL in a browser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl.toString(),
      redirectUri
    );

    if (result.type === 'success') {
      const { url } = result;
      logger.info('Auth successful, processing redirect', { url });

      // Parse the URL to get the authorization code
      const responseUrl = new URL(url);
      const code = responseUrl.searchParams.get('code');
      const returnedState = responseUrl.searchParams.get('state');

      // Verify the state to prevent CSRF attacks
      if (returnedState !== state) {
        throw new Error('Invalid state parameter');
      }

      if (!code) {
        throw new Error('No code returned from Google');
      }

      logger.info('Got authorization code, exchanging for token');

      // Exchange the code for a token
      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: '', // Client secret is not needed for mobile apps
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        logger.error('Token exchange failed', tokenData);
        throw new Error('Failed to exchange code for token');
      }

      logger.info('Got token, signing in with Supabase');

      // Use the ID token to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokenData.id_token,
      });

      if (error) {
        logger.error('Supabase sign in failed', error);
        throw error;
      }

      logger.info('Successfully signed in with Google');
      return data;
    } else {
      logger.info('Auth cancelled or failed', { resultType: result.type });
      throw new Error('Google sign in was cancelled or failed');
    }
  } catch (error) {
    logger.error('Google login error', error);
    throw error;
  }
};

/**
 * Handle OAuth using Supabase's built-in flow
 */
const handleSupabaseOAuth = async (
  provider: 'google' | 'apple' | 'facebook'
) => {
  try {
    // Create a redirect URI based on the environment
    let redirectUri;

    if (Constants.appOwnership === 'expo') {
      // For Expo Go, use the Expo-specific redirect
      redirectUri = Linking.createURL('auth/callback');
      logger.info('Using Expo Go specific redirect URI', { redirectUri });
    } else {
      // For standalone app, use the app scheme
      redirectUri = makeRedirectUri({
        scheme: 'rivorealestate',
        path: 'auth/callback',
        preferLocalhost: false,
      });
    }

    logger.info('Supabase OAuth redirect URI', { redirectUri });

    // Start the OAuth flow with Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
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

    // Handle the result
    if (result.type === 'success') {
      logger.info('OAuth successful, processing result', { url: result.url });

      // Extract the code from the URL
      const { url } = result;
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
    logger.error('Supabase OAuth error', error);
    throw error;
  }
};
