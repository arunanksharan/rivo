import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { API_CONFIG } from '@/config';
import { logger } from '@/utils/logger';

// Initialize Supabase client
export const supabase = createClient(
  API_CONFIG.SUPABASE_URL, 
  API_CONFIG.SUPABASE_ANON_KEY
);

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export const authService = {
  /**
   * Sign up a new user
   */
  signUp: async ({ email, password, firstName, lastName }: SignUpParams) => {
    logger.info('Attempting to sign up user', { email, firstName, lastName });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      logger.error('Signup error', error);
      throw new Error(error.message);
    }

    logger.info('Signup successful', { userId: data.user?.id });
    return data;
  },

  /**
   * Sign in an existing user
   */
  signIn: async ({ email, password }: SignInParams) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  /**
   * Get the current user
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      return null;
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || '',
      firstName: data.user.user_metadata?.first_name,
      lastName: data.user.user_metadata?.last_name,
      phone: data.user.user_metadata?.phone,
      avatarUrl: data.user.user_metadata?.avatar_url,
    };

    return user;
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (params: UpdateProfileParams) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone,
        avatar_url: params.avatarUrl,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },
};
