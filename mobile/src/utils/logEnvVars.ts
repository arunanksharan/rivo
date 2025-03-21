/**
 * Utility function to log environment variables
 * Used for debugging purposes
 */
export const logEnvironmentVariables = () => {
  console.log('Environment Variables:');
  
  // API Configuration
  console.log('API_BASE_URL:', process.env.API_BASE_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '****' : 'not set');
  
  // Maps and Location
  console.log('GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? '****' : 'not set');
  
  // Voice Assistant
  console.log('VOICE_ASSISTANT_API_URL:', process.env.VOICE_ASSISTANT_API_URL);
  console.log('VOICE_RECOGNITION_KEYWORD:', process.env.VOICE_RECOGNITION_KEYWORD);
  
  // Feature Flags
  console.log('ENABLE_VOICE_ASSISTANT:', process.env.ENABLE_VOICE_ASSISTANT);
  console.log('ENABLE_PROPERTY_CAMERA:', process.env.ENABLE_PROPERTY_CAMERA);
  console.log('ENABLE_LOCATION_FEATURES:', process.env.ENABLE_LOCATION_FEATURES);
  console.log('ENABLE_SOCIAL_AUTH:', process.env.ENABLE_SOCIAL_AUTH);
  
  // App Settings
  console.log('DEFAULT_LANGUAGE:', process.env.DEFAULT_LANGUAGE);
  console.log('DEFAULT_THEME:', process.env.DEFAULT_THEME);
  console.log('CACHE_DURATION_MS:', process.env.CACHE_DURATION_MS);
  console.log('MAX_PROPERTY_IMAGES:', process.env.MAX_PROPERTY_IMAGES);
  console.log('MAX_VOICE_RECORDING_SECONDS:', process.env.MAX_VOICE_RECORDING_SECONDS);
  
  // Development Settings
  console.log('USE_MOCK_DATA:', process.env.USE_MOCK_DATA);
  console.log('ENABLE_LOGGING:', process.env.ENABLE_LOGGING);
  console.log('LOG_LEVEL:', process.env.LOG_LEVEL);
};
