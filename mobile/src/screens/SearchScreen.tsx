import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { searchProperties } from '@/services/api/properties';
import usePropertyStore from '@/store/usePropertyStore';
import PropertyCard from '@/components/molecules/PropertyCard';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import {
  PROPERTY_CATEGORIES,
  PRICE_RANGES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
} from '@/utils/constants';

/**
 * SearchScreen component for searching and filtering properties.
 */
const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  const { filters, setFilters, resetFilters, recentSearches, addRecentSearch } = usePropertyStore();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ ...filters });
  const [isSearching, setIsSearching] = useState(false);
  
  // Search properties query
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchProperties', searchQuery, filters],
    queryFn: () => {
      // Only search if there's a query or active filters
      if (!searchQuery && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
        return Promise.resolve([]);
      }
      
      // Build search params
      const params: Record<string, any> = {};
      
      if (searchQuery) {
        params.query = searchQuery;
      }
      
      if (filters.category) {
        params.category = filters.category;
      }
      
      if (filters.minPrice) {
        params.min_price = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        params.max_price = filters.maxPrice;
      }
      
      if (filters.bedrooms) {
        params.min_bedrooms = filters.bedrooms;
      }
      
      if (filters.bathrooms) {
        params.min_bathrooms = filters.bathrooms;
      }
      
      if (filters.minSquareFeet) {
        params.min_square_feet = filters.minSquareFeet;
      }
      
      if (filters.features && filters.features.length > 0) {
        params.features = filters.features.join(',');
      }
      
      return searchProperties(params);
    },
    enabled: isSearching || Object.values(filters).some(v => v && (!Array.isArray(v) || v.length > 0)),
  });
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(() => {
      setIsSearching(true);
      refetch();
    }, 500),
    [refetch]
  );
  
  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch();
  };
  
  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
    }
    setIsSearching(true);
    refetch();
  };
  
  // Apply filters
  const applyFilters = () => {
    setFilters(activeFilters);
    setShowFilters(false);
    setIsSearching(true);
    refetch();
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setActiveFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      minSquareFeet: null,
      maxSquareFeet: null,
      features: [],
    });
  };
  
  // Select category
  const handleCategorySelect = (category: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };
  
  // Select price range
  const handlePriceSelect = (min: number | null, max: number | null) => {
    setActiveFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };
  
  // Select bedroom option
  const handleBedroomSelect = (value: number | null) => {
    setActiveFilters(prev => ({
      ...prev,
      bedrooms: value,
    }));
  };
  
  // Select bathroom option
  const handleBathroomSelect = (value: number | null) => {
    setActiveFilters(prev => ({
      ...prev,
      bathrooms: value,
    }));
  };
  
  // Toggle feature selection
  const toggleFeature = (feature: string) => {
    setActiveFilters(prev => {
      const features = [...(prev.features || [])];
      const index = features.indexOf(feature);
      
      if (index >= 0) {
        features.splice(index, 1);
      } else {
        features.push(feature);
      }
      
      return {
        ...prev,
        features,
      };
    });
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => 
    v !== null && (!Array.isArray(v) || v.length > 0)
  ).length;
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Find Properties
        </Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
          <Ionicons
            name="search-outline"
            size={20}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <TextInput
            className="flex-1 ml-2 text-gray-900 dark:text-white"
            placeholder="Search by location, property name..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2"
            onPress={() => setShowFilters(true)}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text className="ml-2 text-gray-700 dark:text-gray-300">
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Results */}
      {isLoading ? (
        <LoadingIndicator message="Searching properties..." />
      ) : error ? (
        <ErrorMessage
          message="Failed to search properties"
          onRetry={refetch}
        />
      ) : searchResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-6 py-2">
              <PropertyCard
                property={item}
                onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
                horizontal
              />
            </View>
          )}
          contentContainerClassName="py-4"
        />
      ) : isSearching ? (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="search"
            size={64}
            color={isDark ? '#4B5563' : '#9CA3AF'}
          />
          <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
            No properties found matching your search criteria
          </Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity
              className="mt-4 bg-primary-100 dark:bg-primary-900 px-4 py-2 rounded-lg"
              onPress={() => {
                resetFilters();
                setActiveFilters({
                  category: null,
                  minPrice: null,
                  maxPrice: null,
                  bedrooms: null,
                  bathrooms: null,
                  minSquareFeet: null,
                  maxSquareFeet: null,
                  features: [],
                });
                refetch();
              }}
            >
              <Text className="text-primary-600 dark:text-primary-400">
                Reset Filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Recent Searches
              </Text>
              <View className="flex-row flex-wrap">
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mr-2 mb-2"
                    onPress={() => {
                      setSearchQuery(search);
                      handleSearch();
                    }}
                  >
                    <Text className="text-gray-700 dark:text-gray-300">
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Popular Categories */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Popular Categories
            </Text>
            <View className="flex-row flex-wrap">
              {PROPERTY_CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 mr-3 mb-3 items-center shadow-sm"
                  style={{ width: '30%' }}
                  onPress={() => {
                    setActiveFilters(prev => ({ ...prev, category: category.value }));
                    setFilters({ category: category.value });
                    setIsSearching(true);
                    refetch();
                  }}
                >
                  <View className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center mb-2">
                    <Ionicons
                      name={
                        category.value === 'house' ? 'home-outline' :
                        category.value === 'apartment' ? 'business-outline' :
                        category.value === 'condo' ? 'business-outline' :
                        category.value === 'townhouse' ? 'home-outline' :
                        category.value === 'land' ? 'map-outline' :
                        'storefront-outline'
                      }
                      size={24}
                      color={isDark ? '#93C5FD' : '#2563EB'}
                    />
                  </View>
                  <Text className="text-gray-700 dark:text-gray-300 text-center">
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Popular Searches */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Popular Searches
            </Text>
            <View className="space-y-3">
              {['Luxury Homes', 'Apartments with Pool', 'Near Downtown', 'New Construction', 'Waterfront Properties'].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                  onPress={() => {
                    setSearchQuery(item);
                    handleSearch();
                  }}
                >
                  <Ionicons
                    name="trending-up-outline"
                    size={24}
                    color={isDark ? '#93C5FD' : '#2563EB'}
                  />
                  <Text className="ml-3 text-gray-700 dark:text-gray-300">
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 mt-24 bg-white dark:bg-gray-900 rounded-t-3xl">
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Filters
                </Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Property Type */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Property Type
                  </Text>
                  <View className="flex-row flex-wrap">
                    {PROPERTY_CATEGORIES.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                          activeFilters.category === category.value
                            ? 'bg-primary-600 dark:bg-primary-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onPress={() => handleCategorySelect(category.value)}
                      >
                        <Text
                          className={`${
                            activeFilters.category === category.value
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Price Range */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Price Range
                  </Text>
                  <View className="flex-row flex-wrap">
                    {PRICE_RANGES.map((range, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                          activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max
                            ? 'bg-primary-600 dark:bg-primary-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onPress={() => handlePriceSelect(range.min, range.max)}
                      >
                        <Text
                          className={`${
                            activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {range.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Bedrooms */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Bedrooms
                  </Text>
                  <View className="flex-row">
                    {BEDROOM_OPTIONS.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                          activeFilters.bedrooms === option.value
                            ? 'bg-primary-600 dark:bg-primary-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onPress={() => handleBedroomSelect(option.value)}
                      >
                        <Text
                          className={`${
                            activeFilters.bedrooms === option.value
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Bathrooms */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Bathrooms
                  </Text>
                  <View className="flex-row">
                    {BATHROOM_OPTIONS.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                          activeFilters.bathrooms === option.value
                            ? 'bg-primary-600 dark:bg-primary-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onPress={() => handleBathroomSelect(option.value)}
                      >
                        <Text
                          className={`${
                            activeFilters.bathrooms === option.value
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Features */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Features
                  </Text>
                  <View className="flex-row flex-wrap">
                    {['Pool', 'Garden', 'Garage', 'Fireplace', 'Air Conditioning', 'Gym', 'Balcony', 'Elevator'].map((feature, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                          activeFilters.features?.includes(feature.toLowerCase())
                            ? 'bg-primary-600 dark:bg-primary-700'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onPress={() => toggleFeature(feature.toLowerCase())}
                      >
                        <Text
                          className={`${
                            activeFilters.features?.includes(feature.toLowerCase())
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {feature}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
              
              {/* Action Buttons */}
              <View className="flex-row mt-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg mr-2"
                  onPress={handleResetFilters}
                >
                  <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary-600 dark:bg-primary-700 py-3 rounded-lg"
                  onPress={applyFilters}
                >
                  <Text className="text-center text-white font-medium">
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SearchScreen;
