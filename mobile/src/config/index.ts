/**
 * Application configuration
 * 
 * This file loads environment variables from the .env file using react-native-dotenv.
 * For local development, copy .env.example to .env and update the values as needed.
 * 
 * IMPORTANT: Never commit the .env file to version control. It should be in .gitignore.
 */

import {
  API_BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  GOOGLE_MAPS_API_KEY,
  VOICE_ASSISTANT_API_URL,
  VOICE_RECOGNITION_KEYWORD,
  ENABLE_VOICE_ASSISTANT,
  ENABLE_PROPERTY_CAMERA,
  ENABLE_LOCATION_FEATURES,
  ENABLE_SOCIAL_AUTH,
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  CACHE_DURATION_MS,
  MAX_PROPERTY_IMAGES,
  MAX_VOICE_RECORDING_SECONDS,
  USE_MOCK_DATA,
  ENABLE_LOGGING,
  LOG_LEVEL,
} from '@env';

// Helper function to parse boolean environment variables
const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  return value.toLowerCase() === 'true';
};

// Helper function to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: API_BASE_URL || 'https://api.example.com',
  
  // Authentication
  SUPABASE_URL: SUPABASE_URL || 'https://mock-supabase-instance.supabase.co',
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY || 'mock-anon-key-for-development-purposes-only',
  
  // Maps and Location
  GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY || 'mock-google-maps-api-key',
  
  // Voice Assistant
  VOICE_ASSISTANT_API_URL: VOICE_ASSISTANT_API_URL || 'https://api.example.com/voice-assistant',
  VOICE_RECOGNITION_KEYWORD: VOICE_RECOGNITION_KEYWORD || 'Rivo Start',
};

// Feature Flags
export const FEATURES = {
  ENABLE_VOICE_ASSISTANT: parseBool(ENABLE_VOICE_ASSISTANT) || true,
  ENABLE_PROPERTY_CAMERA: parseBool(ENABLE_PROPERTY_CAMERA) || true,
  ENABLE_LOCATION_FEATURES: parseBool(ENABLE_LOCATION_FEATURES) || true,
  ENABLE_SOCIAL_AUTH: parseBool(ENABLE_SOCIAL_AUTH) || false,
};

// App Settings
export const APP_SETTINGS = {
  DEFAULT_LANGUAGE: DEFAULT_LANGUAGE || 'en',
  DEFAULT_THEME: DEFAULT_THEME || 'light',
  CACHE_DURATION_MS: parseNumber(CACHE_DURATION_MS, 3600000), // Default: 1 hour
  MAX_PROPERTY_IMAGES: parseNumber(MAX_PROPERTY_IMAGES, 10),
  MAX_VOICE_RECORDING_SECONDS: parseNumber(MAX_VOICE_RECORDING_SECONDS, 60),
};

// Development Settings
export const DEV_SETTINGS = {
  USE_MOCK_DATA: parseBool(USE_MOCK_DATA) || true,
  ENABLE_LOGGING: parseBool(ENABLE_LOGGING) || true,
  LOG_LEVEL: LOG_LEVEL || 'debug',
};

// Export a default config object
export default {
  API_CONFIG,
  FEATURES,
  APP_SETTINGS,
  DEV_SETTINGS,
};
