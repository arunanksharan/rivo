/**
 * Application configuration
 * 
 * In a production app, these values would be loaded from environment variables
 * or a secure configuration service. For this demo, we're using mock values.
 */

// API Configuration
export const API_CONFIG = {
  // Base URLs
  BASE_URL: 'https://api.example.com',
  
  // Authentication
  SUPABASE_URL: 'https://mock-supabase-instance.supabase.co',
  SUPABASE_ANON_KEY: 'mock-anon-key-for-development-purposes-only',
  
  // Maps and Location
  GOOGLE_MAPS_API_KEY: 'mock-google-maps-api-key',
  
  // Voice Assistant
  VOICE_ASSISTANT_API_URL: 'https://api.example.com/voice-assistant',
  VOICE_RECOGNITION_KEYWORD: 'Rivo Start',
};

// Feature Flags
export const FEATURES = {
  ENABLE_VOICE_ASSISTANT: true,
  ENABLE_PROPERTY_CAMERA: true,
  ENABLE_LOCATION_FEATURES: true,
  ENABLE_SOCIAL_AUTH: false,
};

// App Settings
export const APP_SETTINGS = {
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_THEME: 'light',
  CACHE_DURATION_MS: 1000 * 60 * 60, // 1 hour
  MAX_PROPERTY_IMAGES: 10,
  MAX_VOICE_RECORDING_SECONDS: 60,
};

// Development Settings
export const DEV_SETTINGS = {
  USE_MOCK_DATA: true,
  ENABLE_LOGGING: true,
  LOG_LEVEL: 'debug',
};

// Export a default config object
export default {
  API_CONFIG,
  FEATURES,
  APP_SETTINGS,
  DEV_SETTINGS,
};
