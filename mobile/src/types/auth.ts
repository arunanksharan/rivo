/**
 * Authentication related type definitions
 */

/**
 * User authentication state
 */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Authenticated user information
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string; // Changed from photoUrl to avatarUrl to match auth service
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: UserRole;
  preferences?: UserPreferences;
}

/**
 * User role for role-based access control
 */
export enum UserRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
}

/**
 * User preferences
 */
export interface UserPreferences {
  notifications: NotificationPreferences;
  searchPreferences: SearchPreferences;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  newListings: boolean;
  priceChanges: boolean;
  savedSearchMatches: boolean;
  viewingReminders: boolean;
}

/**
 * Search preferences
 */
export interface SearchPreferences {
  propertyTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  bedroomsRange: {
    min: number;
    max: number;
  };
  bathroomsRange: {
    min: number;
    max: number;
  };
  locations: string[];
  features: string[];
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Auth provider type
 */
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

/**
 * OAuth response
 */
export interface OAuthResponse {
  provider: AuthProvider;
  token: string;
  user: AuthUser;
}

/**
 * Auth error
 */
export interface AuthError {
  code: string;
  message: string;
}
