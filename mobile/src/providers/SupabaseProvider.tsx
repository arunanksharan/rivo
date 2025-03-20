import React, { createContext, useContext, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Define environment variables interface
interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Get environment variables
const getAppConfig = (): AppConfig => {
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check your app.config.js file.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
};

// Create a custom storage adapter for Supabase using Expo SecureStore
const createSecureStoreAdapter = () => {
  return {
    getItem: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
      return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  };
};

// Create Supabase client
const createSupabaseClient = (): SupabaseClient => {
  const { supabaseUrl, supabaseAnonKey } = getAppConfig();
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: createSecureStoreAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

// Create Supabase context
const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

// Supabase provider props
interface SupabaseProviderProps {
  children: ReactNode;
}

/**
 * SupabaseProvider component that provides Supabase client to all child components.
 */
export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  // Initialize Supabase client
  const supabase = React.useMemo(() => createSupabaseClient(), []);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

/**
 * Custom hook to use the Supabase client.
 * @returns SupabaseClient
 * @throws Error if used outside of SupabaseProvider
 */
export const useSupabase = (): SupabaseClient => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
