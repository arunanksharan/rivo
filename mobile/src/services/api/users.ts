import { API_BASE_URL } from '@/utils/constants';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Update user profile data
 * @param profileData - Partial profile data to update
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Fetch current user profile
 * @returns Promise with user profile
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Promise with success message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Update user notification settings
 * @param settings - Notification settings to update
 * @returns Promise with updated notification settings
 */
export const updateNotificationSettings = async (
  settings: Record<string, boolean>
): Promise<Record<string, boolean>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/notification-settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Fetch user notification settings
 * @returns Promise with notification settings
 */
export const fetchNotificationSettings = async (): Promise<Record<string, boolean>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/notification-settings`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param password - User password for confirmation
 * @returns Promise with success message
 */
export const deleteAccount = async (password: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
