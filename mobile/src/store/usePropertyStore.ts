import { create } from 'zustand';
import { Property } from '@/components/molecules/PropertyCard';

interface PropertyState {
  // Saved/favorited properties
  savedProperties: Property[];
  setSavedProperties: (properties: Property[]) => void;
  addSavedProperty: (property: Property) => void;
  removeSavedProperty: (propertyId: string) => void;
  
  // Recent searches
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  
  // Search filters
  filters: {
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    minSquareFeet: number | null;
    maxSquareFeet: number | null;
    features: string[];
  };
  setFilters: (filters: Partial<PropertyState['filters']>) => void;
  resetFilters: () => void;
}

/**
 * Property store for managing property-related state.
 * Uses Zustand for state management.
 */
const usePropertyStore = create<PropertyState>((set) => ({
  // Saved properties
  savedProperties: [],
  setSavedProperties: (properties) => set({ savedProperties: properties }),
  addSavedProperty: (property) => 
    set((state) => ({
      savedProperties: [...state.savedProperties, property],
    })),
  removeSavedProperty: (propertyId) => 
    set((state) => ({
      savedProperties: state.savedProperties.filter((p) => p.id !== propertyId),
    })),
  
  // Recent searches
  recentSearches: [],
  addRecentSearch: (search) => 
    set((state) => {
      // Remove duplicate if exists
      const filteredSearches = state.recentSearches.filter((s) => s !== search);
      // Add to beginning of array and limit to 10 items
      return {
        recentSearches: [search, ...filteredSearches].slice(0, 10),
      };
    }),
  clearRecentSearches: () => set({ recentSearches: [] }),
  
  // Search filters
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    bathrooms: null,
    minSquareFeet: null,
    maxSquareFeet: null,
    features: [],
  },
  setFilters: (filters) => 
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () => 
    set({
      filters: {
        category: null,
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
        bathrooms: null,
        minSquareFeet: null,
        maxSquareFeet: null,
        features: [],
      },
    }),
}));

export default usePropertyStore;
