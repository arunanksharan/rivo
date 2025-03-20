import { Property } from '@/components/molecules/PropertyCard';
import { API_BASE_URL } from '@/utils/constants';

/**
 * Fetch featured properties from the API
 * @returns Promise with array of featured properties
 */
export const fetchFeaturedProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?featured=true`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};

/**
 * Fetch recent properties from the API
 * @returns Promise with array of recent properties
 */
export const fetchRecentProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?sort=created_at&limit=5`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recent properties:', error);
    throw error;
  }
};

/**
 * Fetch a single property by ID
 * @param id - Property ID
 * @returns Promise with property details
 */
export const fetchPropertyById = async (id: string): Promise<Property> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    throw error;
  }
};

/**
 * Search properties with filters
 * @param params - Search parameters
 * @returns Promise with array of properties matching the search criteria
 */
export const searchProperties = async (params: Record<string, string | number | boolean>): Promise<Property[]> => {
  try {
    // Convert params object to URL search params
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/properties?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

/**
 * Save a property to user's favorites
 * @param propertyId - Property ID to save
 * @returns Promise with success message
 */
export const saveProperty = async (propertyId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/saved-properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ property_id: propertyId }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error saving property ${propertyId}:`, error);
    throw error;
  }
};

/**
 * Remove a property from user's favorites
 * @param propertyId - Property ID to remove
 * @returns Promise with success message
 */
export const unsaveProperty = async (propertyId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/saved-properties/${propertyId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error removing saved property ${propertyId}:`, error);
    throw error;
  }
};

/**
 * Fetch user's saved properties
 * @returns Promise with array of saved properties
 */
export const fetchSavedProperties = async (): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/saved-properties`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    throw error;
  }
};
