import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
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
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
    },
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
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
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
    location: {
      latitude: 32.7157,
      longitude: -117.1611,
    },
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
    location: {
      latitude: 42.3601,
      longitude: -71.0589,
    },
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
    location: {
      latitude: 39.7392,
      longitude: -104.9903,
    },
  },
];

// Default region (USA)
const DEFAULT_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 40,
  longitudeDelta: 40,
};

// City regions for quick navigation
const CITY_REGIONS = [
  {
    name: 'New York',
    region: {
      latitude: 40.7128,
      longitude: -74.0060,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    name: 'Miami',
    region: {
      latitude: 25.7617,
      longitude: -80.1918,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    name: 'Austin',
    region: {
      latitude: 30.2672,
      longitude: -97.7431,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    name: 'San Diego',
    region: {
      latitude: 32.7157,
      longitude: -117.1611,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    name: 'Boston',
    region: {
      latitude: 42.3601,
      longitude: -71.0589,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
  {
    name: 'Denver',
    region: {
      latitude: 39.7392,
      longitude: -104.9903,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    },
  },
];

const { width, height } = Dimensions.get('window');

export default function MapViewScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    lat?: string;
    lng?: string;
    propertyId?: string;
  }>();
  
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedProperty, setSelectedProperty] = useState<typeof PROPERTY_LISTINGS[0] | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  
  useEffect(() => {
    // If lat and lng are provided, center the map on those coordinates
    if (params.lat && params.lng) {
      const newRegion = {
        latitude: parseFloat(params.lat),
        longitude: parseFloat(params.lng),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      
      // If propertyId is provided, select that property
      if (params.propertyId) {
        const property = PROPERTY_LISTINGS.find(p => p.id === params.propertyId);
        if (property) {
          setSelectedProperty(property);
        }
      }
    }
  }, [params.lat, params.lng, params.propertyId]);
  
  const handleMarkerPress = (property: typeof PROPERTY_LISTINGS[0]) => {
    setSelectedProperty(property);
  };
  
  const handlePropertyCardPress = () => {
    if (selectedProperty) {
      router.push({
        pathname: '/(app)/property/[id]',
        params: { id: selectedProperty.id },
      });
    }
  };
  
  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };
  
  const navigateToCity = (cityRegion: Region) => {
    setRegion(cityRegion);
    setShowCitySelector(false);
  };
  
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsScale
      >
        {PROPERTY_LISTINGS.map((property) => (
          <Marker
            key={property.id}
            coordinate={property.location}
            title={property.title}
            description={property.price}
            onPress={() => handleMarkerPress(property)}
          >
            <View style={[
              styles.markerContainer,
              selectedProperty?.id === property.id && { 
                backgroundColor: theme.colors.primary,
                transform: [{ scale: 1.1 }],
              }
            ]}>
              <Text 
                variant="caption" 
                color={selectedProperty?.id === property.id ? theme.colors.white : theme.colors.text}
                style={styles.markerText}
              >
                {property.price}
              </Text>
            </View>
            <Callout tooltip>
              <View style={[styles.calloutContainer, { backgroundColor: theme.colors.white }]}>
                <Text variant="subtitle2">{property.title}</Text>
                <Text variant="caption" color={theme.colors.textLight}>{property.address}</Text>
                <Text variant="subtitle2" color={theme.colors.primary}>{property.price}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
          onPress={() => setShowCitySelector(!showCitySelector)}
        >
          <Ionicons name="location" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mapControlButton, { backgroundColor: theme.colors.white }]}
          onPress={() => router.push('/(app)/search')}
        >
          <Ionicons name="search" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* City Selector */}
      {showCitySelector && (
        <View style={[styles.citySelectorContainer, { backgroundColor: theme.colors.white }]}>
          <Text variant="subtitle2" style={styles.citySelectorTitle}>Quick Navigation</Text>
          <View style={styles.cityButtonsContainer}>
            {CITY_REGIONS.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.cityButton, { backgroundColor: theme.colors.gray100 }]}
                onPress={() => navigateToCity(city.region)}
              >
                <Text variant="body2">{city.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      {/* Selected Property Card */}
      {selectedProperty && (
        <TouchableOpacity 
          style={styles.selectedPropertyContainer}
          onPress={handlePropertyCardPress}
          activeOpacity={0.9}
        >
          <Card elevation={3} style={styles.selectedPropertyCard}>
            <View style={styles.selectedPropertyContent}>
              <Image
                source={{ uri: `${selectedProperty.image}?w=200&auto=format&q=80` }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
              <View style={styles.propertyDetails}>
                <Text variant="subtitle2" numberOfLines={1} style={styles.propertyTitle}>
                  {selectedProperty.title}
                </Text>
                <Text variant="caption" color={theme.colors.textLight} numberOfLines={1}>
                  {selectedProperty.address}
                </Text>
                <Text variant="subtitle1" color={theme.colors.primary} style={styles.propertyPrice}>
                  {selectedProperty.price}
                </Text>
                <View style={styles.propertyFeatures}>
                  <View style={styles.propertyFeature}>
                    <Ionicons name="bed-outline" size={14} color={theme.colors.gray600} />
                    <Text variant="caption" color={theme.colors.gray600} style={styles.featureText}>
                      {selectedProperty.beds}
                    </Text>
                  </View>
                  <View style={styles.propertyFeature}>
                    <Ionicons name="water-outline" size={14} color={theme.colors.gray600} />
                    <Text variant="caption" color={theme.colors.gray600} style={styles.featureText}>
                      {selectedProperty.baths}
                    </Text>
                  </View>
                  <View style={styles.propertyFeature}>
                    <Ionicons name="resize-outline" size={14} color={theme.colors.gray600} />
                    <Text variant="caption" color={theme.colors.gray600} style={styles.featureText}>
                      {selectedProperty.area}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePropertyCardPress}
              >
                <Text variant="button" color={theme.colors.white}>View</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>
      )}
      
      {/* Filter Button */}
      <TouchableOpacity 
        style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(app)/search-filters')}
      >
        <Ionicons name="options" size={24} color={theme.colors.white} />
        <Text variant="button" color={theme.colors.white} style={styles.filterButtonText}>
          Filters
        </Text>
      </TouchableOpacity>
      
      {/* List View Button */}
      <TouchableOpacity 
        style={[styles.listViewButton, { backgroundColor: theme.colors.white }]}
        onPress={() => router.push('/(app)/search')}
      >
        <Ionicons name="list" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  mapControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    flexDirection: 'row',
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  citySelectorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  citySelectorTitle: {
    marginBottom: 12,
  },
  cityButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  markerText: {
    fontWeight: 'bold',
  },
  calloutContainer: {
    width: 160,
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedPropertyContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  selectedPropertyCard: {
    overflow: 'hidden',
  },
  selectedPropertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  propertyDetails: {
    flex: 1,
    padding: 12,
  },
  propertyTitle: {
    marginBottom: 4,
  },
  propertyPrice: {
    marginVertical: 4,
  },
  propertyFeatures: {
    flexDirection: 'row',
    marginTop: 4,
  },
  propertyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    marginLeft: 4,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  filterButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filterButtonText: {
    marginLeft: 8,
  },
  listViewButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
