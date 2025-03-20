import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

// Mock data for property listings
const PROPERTY_LISTINGS = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    address: '123 Main St, New York, NY',
    price: '$2,500,000',
    beds: 3,
    baths: 2,
    area: '1,200 sqft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    type: 'Apartment',
    isNew: true,
  },
  {
    id: '2',
    title: 'Luxury Villa with Pool',
    address: '456 Ocean Ave, Miami, FL',
    price: '$4,800,000',
    beds: 5,
    baths: 4,
    area: '3,500 sqft',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',
    type: 'Villa',
    isNew: false,
  },
  {
    id: '3',
    title: 'Cozy Suburban Home',
    address: '789 Oak Dr, Austin, TX',
    price: '$850,000',
    beds: 4,
    baths: 3,
    area: '2,200 sqft',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    type: 'House',
    isNew: true,
  },
  {
    id: '4',
    title: 'Waterfront Condo with View',
    address: '101 Harbor Dr, San Diego, CA',
    price: '$1,950,000',
    beds: 2,
    baths: 2,
    area: '1,100 sqft',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
    type: 'Condo',
    isNew: false,
  },
  {
    id: '5',
    title: 'Historic Brownstone',
    address: '222 Park Ave, Boston, MA',
    price: '$3,200,000',
    beds: 4,
    baths: 3,
    area: '2,800 sqft',
    image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126',
    type: 'Townhouse',
    isNew: false,
  },
  {
    id: '6',
    title: 'Mountain View Cabin',
    address: '555 Pine Rd, Denver, CO',
    price: '$975,000',
    beds: 3,
    baths: 2,
    area: '1,800 sqft',
    image: 'https://images.unsplash.com/photo-1542889601-399c4f3a8402',
    type: 'Cabin',
    isNew: true,
  },
];

// Filter options
const PROPERTY_TYPES = ['All', 'House', 'Apartment', 'Condo', 'Villa', 'Townhouse', 'Cabin'];
const PRICE_RANGES = [
  { label: 'Any', min: 0, max: Number.MAX_SAFE_INTEGER },
  { label: 'Under $500k', min: 0, max: 500000 },
  { label: '$500k - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $2M', min: 1000000, max: 2000000 },
  { label: '$2M - $5M', min: 2000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: Number.MAX_SAFE_INTEGER },
];

export default function SearchScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ query: string }>();
  
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState(PROPERTY_LISTINGS);
  const [filteredProperties, setFilteredProperties] = useState(PROPERTY_LISTINGS);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [bedsFilter, setBedsFilter] = useState(0);
  const [bathsFilter, setBathsFilter] = useState(0);
  
  useEffect(() => {
    if (params.query) {
      handleSearch(params.query);
    }
  }, [params.query]);
  
  const handleSearch = (query: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = PROPERTY_LISTINGS.filter(property => 
        property.title.toLowerCase().includes(query.toLowerCase()) ||
        property.address.toLowerCase().includes(query.toLowerCase()) ||
        property.type.toLowerCase().includes(query.toLowerCase())
      );
      setProperties(filtered);
      applyFilters(filtered);
      setIsLoading(false);
    }, 1000);
  };
  
  const applyFilters = (propertiesToFilter = properties) => {
    let filtered = [...propertiesToFilter];
    
    // Apply property type filter
    if (selectedPropertyType !== 'All') {
      filtered = filtered.filter(property => property.type === selectedPropertyType);
    }
    
    // Apply price range filter
    filtered = filtered.filter(property => {
      const priceValue = parseInt(property.price.replace(/[^0-9]/g, ''));
      return priceValue >= selectedPriceRange.min && priceValue <= selectedPriceRange.max;
    });
    
    // Apply beds filter
    if (bedsFilter > 0) {
      filtered = filtered.filter(property => property.beds >= bedsFilter);
    }
    
    // Apply baths filter
    if (bathsFilter > 0) {
      filtered = filtered.filter(property => property.baths >= bathsFilter);
    }
    
    setFilteredProperties(filtered);
  };
  
  const resetFilters = () => {
    setSelectedPropertyType('All');
    setSelectedPriceRange(PRICE_RANGES[0]);
    setBedsFilter(0);
    setBathsFilter(0);
    setFilteredProperties(properties);
  };
  
  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/(app)/property/[id]',
      params: { id: propertyId },
    });
  };
  
  const renderPropertyItem = ({ item }: { item: typeof PROPERTY_LISTINGS[0] }) => (
    <TouchableOpacity
      style={styles.propertyItem}
      onPress={() => handlePropertyPress(item.id)}
      activeOpacity={0.9}
    >
      <Card elevation={1} padding={false}>
        <View style={styles.propertyImageContainer}>
          <Image
            source={{ uri: `${item.image}?w=500&auto=format&q=80` }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
          {item.isNew && (
            <View style={[styles.newTag, { backgroundColor: theme.colors.primary }]}>
              <Text variant="caption" color={theme.colors.white}>NEW</Text>
            </View>
          )}
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.propertyContent}>
          <Text variant="subtitle1" style={styles.propertyTitle}>
            {item.title}
          </Text>
          <Text variant="body2" color={theme.colors.textLight} style={styles.propertyAddress}>
            {item.address}
          </Text>
          <Text variant="subtitle1" color={theme.colors.primary} style={styles.propertyPrice}>
            {item.price}
          </Text>
          <View style={styles.propertyFeatures}>
            <View style={styles.propertyFeature}>
              <Ionicons name="bed-outline" size={16} color={theme.colors.gray600} />
              <Text variant="body2" color={theme.colors.gray600} style={styles.featureText}>
                {item.beds} Beds
              </Text>
            </View>
            <View style={styles.propertyFeature}>
              <Ionicons name="water-outline" size={16} color={theme.colors.gray600} />
              <Text variant="body2" color={theme.colors.gray600} style={styles.featureText}>
                {item.baths} Baths
              </Text>
            </View>
            <View style={styles.propertyFeature}>
              <Ionicons name="resize-outline" size={16} color={theme.colors.gray600} />
              <Text variant="body2" color={theme.colors.gray600} style={styles.featureText}>
                {item.area}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  const renderFilterChips = () => (
    <View style={styles.filterChipsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { 
              backgroundColor: showFilters 
                ? theme.colors.primary 
                : theme.colors.gray100,
              borderColor: showFilters 
                ? theme.colors.primary 
                : theme.colors.gray300,
            }
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options-outline" 
            size={16} 
            color={showFilters ? theme.colors.white : theme.colors.gray700} 
          />
          <Text 
            variant="body2" 
            color={showFilters ? theme.colors.white : theme.colors.gray700}
            style={styles.filterChipText}
          >
            Filters
          </Text>
        </TouchableOpacity>
        
        {selectedPropertyType !== 'All' && (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: theme.colors.primary + '20',
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => {
              setSelectedPropertyType('All');
              applyFilters();
            }}
          >
            <Text variant="body2" color={theme.colors.primary} style={styles.filterChipText}>
              {selectedPropertyType}
            </Text>
            <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        {selectedPriceRange.label !== 'Any' && (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: theme.colors.primary + '20',
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => {
              setSelectedPriceRange(PRICE_RANGES[0]);
              applyFilters();
            }}
          >
            <Text variant="body2" color={theme.colors.primary} style={styles.filterChipText}>
              {selectedPriceRange.label}
            </Text>
            <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        {bedsFilter > 0 && (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: theme.colors.primary + '20',
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => {
              setBedsFilter(0);
              applyFilters();
            }}
          >
            <Text variant="body2" color={theme.colors.primary} style={styles.filterChipText}>
              {bedsFilter}+ Beds
            </Text>
            <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        
        {bathsFilter > 0 && (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { 
                backgroundColor: theme.colors.primary + '20',
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={() => {
              setBathsFilter(0);
              applyFilters();
            }}
          >
            <Text variant="body2" color={theme.colors.primary} style={styles.filterChipText}>
              {bathsFilter}+ Baths
            </Text>
            <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
  
  const renderFilters = () => (
    <View style={[styles.filtersContainer, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterSection}>
        <Text variant="subtitle2" style={styles.filterTitle}>Property Type</Text>
        <View style={styles.propertyTypeOptions}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.propertyTypeOption,
                { 
                  backgroundColor: selectedPropertyType === type 
                    ? theme.colors.primary 
                    : theme.colors.gray100,
                }
              ]}
              onPress={() => {
                setSelectedPropertyType(type);
                applyFilters();
              }}
            >
              <Text 
                variant="body2" 
                color={selectedPropertyType === type ? theme.colors.white : theme.colors.text}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text variant="subtitle2" style={styles.filterTitle}>Price Range</Text>
        <View style={styles.priceRangeOptions}>
          {PRICE_RANGES.map((range, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.priceRangeOption,
                { 
                  backgroundColor: selectedPriceRange.label === range.label 
                    ? theme.colors.primary 
                    : theme.colors.gray100,
                }
              ]}
              onPress={() => {
                setSelectedPriceRange(range);
                applyFilters();
              }}
            >
              <Text 
                variant="body2" 
                color={selectedPriceRange.label === range.label ? theme.colors.white : theme.colors.text}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text variant="subtitle2" style={styles.filterTitle}>Bedrooms</Text>
        <View style={styles.bedroomsOptions}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.bedroomOption,
                { 
                  backgroundColor: bedsFilter === num 
                    ? theme.colors.primary 
                    : theme.colors.gray100,
                }
              ]}
              onPress={() => {
                setBedsFilter(num);
                applyFilters();
              }}
            >
              <Text 
                variant="body2" 
                color={bedsFilter === num ? theme.colors.white : theme.colors.text}
              >
                {num === 0 ? 'Any' : num === 5 ? '5+' : num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterSection}>
        <Text variant="subtitle2" style={styles.filterTitle}>Bathrooms</Text>
        <View style={styles.bathroomsOptions}>
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.bathroomOption,
                { 
                  backgroundColor: bathsFilter === num 
                    ? theme.colors.primary 
                    : theme.colors.gray100,
                }
              ]}
              onPress={() => {
                setBathsFilter(num);
                applyFilters();
              }}
            >
              <Text 
                variant="body2" 
                color={bathsFilter === num ? theme.colors.white : theme.colors.text}
              >
                {num === 0 ? 'Any' : num === 5 ? '5+' : num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.filterActions}>
        <Button
          title="Reset Filters"
          variant="outline"
          onPress={resetFilters}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Apply Filters"
          onPress={() => {
            applyFilters();
            setShowFilters(false);
          }}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for properties, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={theme.colors.gray500} />}
          rightIcon={<Ionicons name="options-outline" size={20} color={theme.colors.gray500} />}
          onRightIconPress={() => setShowFilters(!showFilters)}
          containerStyle={styles.searchInput}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        
        <View style={styles.viewToggle}>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              styles.viewToggleButtonActive,
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <Ionicons name="list" size={20} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton, 
              { backgroundColor: theme.colors.gray200 }
            ]}
            onPress={() => router.push('/(app)/map-view')}
          >
            <Ionicons name="map-outline" size={20} color={theme.colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>
      
      {renderFilterChips()}
      
      {showFilters && renderFilters()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body1" style={styles.loadingText}>Searching properties...</Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text variant="body1">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Ionicons name="funnel-outline" size={16} color={theme.colors.gray700} />
              <Text variant="body2" style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredProperties}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.propertyList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color={theme.colors.gray300} />
                <Text variant="subtitle1" style={styles.emptyTitle}>No properties found</Text>
                <Text variant="body2" color={theme.colors.textLight} style={styles.emptyText}>
                  Try adjusting your search or filters to find what you're looking for
                </Text>
                <Button
                  title="Reset Filters"
                  onPress={resetFilters}
                  style={styles.resetButton}
                />
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  viewToggle: {
    flexDirection: 'row',
    marginLeft: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterChipsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    marginHorizontal: 4,
  },
  filtersContainer: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
  },
  propertyTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyTypeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  priceRangeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceRangeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  bedroomsOptions: {
    flexDirection: 'row',
  },
  bedroomOption: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
  },
  bathroomsOptions: {
    flexDirection: 'row',
  },
  bathroomOption: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
  },
  filterActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    marginLeft: 4,
  },
  propertyList: {
    padding: 16,
    paddingTop: 0,
  },
  propertyItem: {
    marginBottom: 16,
  },
  propertyImageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  newTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyContent: {
    padding: 16,
  },
  propertyTitle: {
    marginBottom: 4,
  },
  propertyAddress: {
    marginBottom: 8,
  },
  propertyPrice: {
    marginBottom: 12,
  },
  propertyFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    width: 200,
  },
});
