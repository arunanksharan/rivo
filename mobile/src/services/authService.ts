import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_CONFIG } from '@/config';
import { logger } from '@/utils/logger';
import { apiClient } from './apiClient';

// Storage keys for tokens
const ACCESS_TOKEN_KEY = 'rivo_access_token';
const REFRESH_TOKEN_KEY = 'rivo_refresh_token';

// User interface
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  authProvider: string;
}

// Auth params interfaces
export interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface UpdateProfileParams {
  fullName?: string;
}

// Token interface
interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

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
    // For Expo Go, use a special format
    return makeRedirectUri({
      native: 'rivorealestate://auth/callback',
    });
  } else {
    // For standalone app, use the app scheme
    return makeRedirectUri({
      scheme: 'rivorealestate',
      path: 'auth/callback',
    });
  }
};

/**
 * Authentication service for handling all auth operations
 */
export const authService = {
  /**
   * Sign up a new user
   */
  signUp: async ({
    email,
    password,
    fullName,
  }: SignUpParams): Promise<AuthUser> => {
    logger.info('Attempting to sign up user', { email, fullName });

    try {
      const response = await apiClient.post<AuthTokens>('/auth/register', {
        email,
        password,
        full_name: fullName,
      });

      // Save tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
      await AsyncStorage.setItem(
        REFRESH_TOKEN_KEY,
        response.data.refresh_token
      );

      // Get user info
      return await authService.getCurrentUser();
    } catch (error) {
      logger.error('Sign up failed', error);
      throw error;
    }
  },

  /**
   * Sign in an existing user
   */
  signIn: async ({ email, password }: SignInParams): Promise<AuthUser> => {
    logger.info('Attempting to sign in user', { email });

    try {
      // Create form data for OAuth2 password flow
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post<AuthTokens>(
        '/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Save tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
      await AsyncStorage.setItem(
        REFRESH_TOKEN_KEY,
        response.data.refresh_token
      );

      // Get user info
      return await authService.getCurrentUser();
    } catch (error) {
      logger.error('Sign in failed', error);
      throw error;
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async (): Promise<AuthUser> => {
    logger.info('Starting Google OAuth signin');

    try {
      // Get Google auth URL from backend
      const authUrlResponse = await apiClient.get<{
        auth_url: string;
        state: string;
      }>('/auth/google/auth-url');
      const { auth_url } = authUrlResponse.data;

      // Open browser for authentication
      const redirectUri = getRedirectUri();
      logger.info('Opening Google auth URL', { redirectUri });

      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        redirectUri
      );

      if (result.type === 'success') {
        // For TypeScript compatibility
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

        if (!code) {
          throw new Error('No authorization code found in redirect URL');
        }

        // Exchange code for tokens
        const tokenResponse = await apiClient.post<AuthTokens>(
          '/auth/google/callback',
          {
            code,
            redirect_uri: redirectUri,
          }
        );

        // Save tokens
        await AsyncStorage.setItem(
          ACCESS_TOKEN_KEY,
          tokenResponse.data.access_token
        );
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          tokenResponse.data.refresh_token
        );

        // Get user info
        return await authService.getCurrentUser();
      } else {
        throw new Error('Google sign in was cancelled or failed');
      }
    } catch (error) {
      logger.error('Google sign in failed', error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    logger.info('Signing out user');

    try {
      // Remove tokens from storage
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      logger.error('Sign out failed', error);
      throw error;
    }
  },

  /**
   * Get the current user
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    logger.info('Getting current user');

    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        throw new Error('Auth session missing!');
      }

      // Set authorization header
      apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${accessToken}`;

      // Get user info
      const response = await apiClient.get<AuthUser>('/auth/me');
      return response.data;
    } catch (error) {
      logger.error('Get current user failed', error);

      // If token is expired, try to refresh
      if (error.response && error.response.status === 401) {
        try {
          await authService.refreshToken();
          return await authService.getCurrentUser();
        } catch (refreshError) {
          logger.error('Token refresh failed', refreshError);
          throw refreshError;
        }
      }

      throw error;
    }
  },

  /**
   * Refresh the access token
   */
  refreshToken: async (): Promise<void> => {
    logger.info('Refreshing access token');

    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        throw new Error('Refresh token missing!');
      }

      const response = await apiClient.post<AuthTokens>('/auth/refresh-token', {
        refresh_token: refreshToken,
      });

      // Save new tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
      await AsyncStorage.setItem(
        REFRESH_TOKEN_KEY,
        response.data.refresh_token
      );

      // Update authorization header
      apiClient.defaults.headers.common['Authorization'] =
        `Bearer ${response.data.access_token}`;
    } catch (error) {
      logger.error('Token refresh failed', error);

      // If refresh fails, sign out
      await authService.signOut();
      throw error;
    }
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (params: UpdateProfileParams): Promise<AuthUser> => {
    logger.info('Updating user profile');

    try {
      const response = await apiClient.patch<AuthUser>('/users/me', {
        full_name: params.fullName,
      });

      return response.data;
    } catch (error) {
      logger.error('Update profile failed', error);
      throw error;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<void> => {
    logger.info('Requesting password reset', { email });

    try {
      await apiClient.post('/auth/reset-password', { email });
    } catch (error) {
      logger.error('Password reset request failed', error);
      throw error;
    }
  },

  /**
   * Initialize the auth service
   * Sets up the API client with the stored token if available
   */
  init: async (): Promise<void> => {
    logger.info('Initializing auth service');

    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

      if (accessToken) {
        apiClient.defaults.headers.common['Authorization'] =
          `Bearer ${accessToken}`;
      }
    } catch (error) {
      logger.error('Auth service initialization failed', error);
    }
  },
};

// Initialize the auth service
authService.init().catch((error) => {
  logger.error('Failed to initialize auth service', error);
});
