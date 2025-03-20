export const colors = {
  // Primary colors
  primary: '#2563EB', // Blue
  primaryLight: '#60A5FA',
  primaryDark: '#1E40AF',
  
  // Secondary colors
  secondary: '#10B981', // Green
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Neutral colors
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#F3F4F6',
  card: '#FFFFFF',
  
  // Text colors
  text: '#1F2937',
  textLight: '#6B7280',
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
};

export type ColorType = keyof typeof colors;
