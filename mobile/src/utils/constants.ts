/**
 * Application-wide constants
 */

// API configuration
export const API_BASE_URL = 'http://localhost:8000/api';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'rivo_auth_token',
  USER_PROFILE: 'rivo_user_profile',
  THEME_PREFERENCE: 'rivo_theme_preference',
  VOICE_SETTINGS: 'rivo_voice_settings',
};

// Property categories
export const PROPERTY_CATEGORIES = [
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Land', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
];

// Price ranges
export const PRICE_RANGES = [
  { label: 'Under $100k', min: 0, max: 100000 },
  { label: '$100k - $200k', min: 100000, max: 200000 },
  { label: '$200k - $300k', min: 200000, max: 300000 },
  { label: '$300k - $500k', min: 300000, max: 500000 },
  { label: '$500k - $750k', min: 500000, max: 750000 },
  { label: '$750k - $1M', min: 750000, max: 1000000 },
  { label: 'Over $1M', min: 1000000, max: null },
];

// Bedroom options
export const BEDROOM_OPTIONS = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '5+', value: 5 },
];

// Bathroom options
export const BATHROOM_OPTIONS = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

// Voice assistant settings
export const VOICE_TYPES = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
];

// Default voice settings
export const DEFAULT_VOICE_SETTINGS = {
  enabled: true,
  wake_word: 'Hey Rivo',
  voice_type: 'female',
  volume: 0.8,
};

// Animation durations
export const ANIMATION = {
  DURATION_SHORT: 200,
  DURATION_MEDIUM: 300,
  DURATION_LONG: 500,
};

// Image placeholder
export const DEFAULT_PROPERTY_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

// Map default region
export const DEFAULT_MAP_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
