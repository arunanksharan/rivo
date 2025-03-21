declare module '@env' {
  // API Configuration
  export const API_BASE_URL: string;

  // Authentication
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;

  // Maps and Location
  export const GOOGLE_MAPS_API_KEY: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_EXPO_CLIENT_ID: string;

  // Voice Assistant
  export const VOICE_ASSISTANT_API_URL: string;
  export const VOICE_RECOGNITION_KEYWORD: string;

  // Feature Flags
  export const ENABLE_VOICE_ASSISTANT: string;
  export const ENABLE_PROPERTY_CAMERA: string;
  export const ENABLE_LOCATION_FEATURES: string;
  export const ENABLE_SOCIAL_AUTH: string;

  // App Settings
  export const DEFAULT_LANGUAGE: string;
  export const DEFAULT_THEME: string;
  export const CACHE_DURATION_MS: string;
  export const MAX_PROPERTY_IMAGES: string;
  export const MAX_VOICE_RECORDING_SECONDS: string;

  // Development Settings
  export const USE_MOCK_DATA: string;
  export const ENABLE_LOGGING: string;
  export const LOG_LEVEL: string;
}
