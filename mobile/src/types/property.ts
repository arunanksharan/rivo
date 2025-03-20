/**
 * Property related type definitions
 */

/**
 * Property listing information
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: Address;
  features: PropertyFeatures;
  images: PropertyImage[];
  type: PropertyType;
  status: PropertyStatus;
  listedDate: string;
  agent: Agent;
  stats: PropertyStats;
  amenities: string[];
  tags: string[];
  favorite?: boolean;
  virtualTour?: string;
  floorPlan?: string;
  nearbyPlaces?: NearbyPlace[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Property address
 */
export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
}

/**
 * Property features
 */
export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: 'sqft' | 'sqm';
  lotSize?: number;
  lotSizeUnit?: 'sqft' | 'sqm' | 'acre' | 'hectare';
  yearBuilt?: number;
  parking?: {
    type: 'garage' | 'carport' | 'street' | 'none';
    spaces: number;
  };
  heating?: string;
  cooling?: string;
  basement?: boolean;
  flooring?: string[];
  appliances?: string[];
}

/**
 * Property image
 */
export interface PropertyImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  isPrimary: boolean;
  roomType?: string;
  createdAt: string;
}

/**
 * Property type
 */
export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OTHER = 'other',
}

/**
 * Property status
 */
export enum PropertyStatus {
  FOR_SALE = 'for_sale',
  FOR_RENT = 'for_rent',
  SOLD = 'sold',
  PENDING = 'pending',
  CONTINGENT = 'contingent',
  COMING_SOON = 'coming_soon',
}

/**
 * Property agent information
 */
export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  agency?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * Property statistics
 */
export interface PropertyStats {
  daysOnMarket: number;
  viewCount: number;
  favoriteCount: number;
  pricePerSqFt: number;
  priceHistory?: PriceHistoryItem[];
}

/**
 * Price history item
 */
export interface PriceHistoryItem {
  date: string;
  price: number;
  event: 'listed' | 'price_change' | 'sold';
}

/**
 * Nearby place
 */
export interface NearbyPlace {
  id: string;
  name: string;
  type: 'school' | 'restaurant' | 'park' | 'shopping' | 'hospital' | 'transport' | 'other';
  distance: number;
  rating?: number;
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Property search filters
 */
export interface PropertySearchFilters {
  query?: string;
  propertyType?: PropertyType[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  bedroomsRange?: {
    min?: number;
    max?: number;
  };
  bathroomsRange?: {
    min?: number;
    max?: number;
  };
  areaRange?: {
    min?: number;
    max?: number;
  };
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
      radius: number; // in miles or km
    };
  };
  features?: string[];
  status?: PropertyStatus[];
  sortBy?: 'price_asc' | 'price_desc' | 'date_newest' | 'date_oldest';
  limit?: number;
  offset?: number;
}

/**
 * Property search results
 */
export interface PropertySearchResults {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Saved search
 */
export interface SavedSearch {
  id: string;
  name: string;
  filters: PropertySearchFilters;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Property viewing appointment
 */
export interface PropertyViewing {
  id: string;
  propertyId: string;
  property: Property;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Property inquiry
 */
export interface PropertyInquiry {
  id: string;
  propertyId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Property note (for voice notes feature)
 */
export interface PropertyNote {
  id: string;
  propertyId: string;
  userId: string;
  title?: string;
  content: string;
  audioUrl?: string;
  transcription?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
