import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native';

// Mock data for property inventory
const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Modern Apartment with Great View',
    description: 'This beautiful property features modern amenities, spacious rooms, and natural lighting throughout. Located in a prime area with easy access to transportation, shopping, and dining options.',
    price: '₹1,25,00,000',
    type: 'Apartment',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,500 sqft',
    location: {
      address: 'Koramangala, Bangalore, Karnataka, India',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    imageUri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    createdAt: new Date('2023-10-15'),
    tags: ['Modern', 'City View', 'Spacious'],
  },
  {
    id: '2',
    title: 'Luxury Villa with Private Pool',
    description: 'Exquisite luxury villa with private pool and garden. Features high-end finishes, smart home technology, and spacious living areas perfect for entertaining guests.',
    price: '₹4,50,00,000',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 4.5,
    area: '3,200 sqft',
    location: {
      address: 'Whitefield, Bangalore, Karnataka, India',
      latitude: 12.9698,
      longitude: 77.7499,
    },
    imageUri: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHZpbGxhfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    createdAt: new Date('2023-10-10'),
    tags: ['Luxury', 'Pool', 'Garden'],
  },
  {
    id: '3',
    title: 'Commercial Office Space in Business District',
    description: 'Prime commercial office space in the heart of the business district. Open floor plan with modern amenities, high-speed internet, and 24/7 security.',
    price: '₹2,75,00,000',
    type: 'Commercial',
    bedrooms: 0,
    bathrooms: 2,
    area: '2,000 sqft',
    location: {
      address: 'MG Road, Bangalore, Karnataka, India',
      latitude: 12.9757,
      longitude: 77.6011,
    },
    imageUri: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b2ZmaWNlJTIwc3BhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
    createdAt: new Date('2023-10-05'),
    tags: ['Commercial', 'Business District', 'Modern'],
  },
];

// Property type for TypeScript
interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  imageUri: string;
  createdAt: Date;
  tags: string[];
}

export default function PropertyInventoryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Filter properties based on search query and selected filter
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = !selectedFilter || property.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle property deletion
  const handleDeleteProperty = (propertyId: string) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property from your inventory?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProperties(prevProperties => 
              prevProperties.filter(property => property.id !== propertyId)
            );
          },
        },
      ]
    );
  };
  
  // Handle property edit
  const handleEditProperty = (propertyId: string) => {
    // In a real app, this would navigate to an edit screen
    Alert.alert('Feature Coming Soon', 'Property editing will be available soon.');
  };
  
  // Handle property share
  const handleShareProperty = (propertyId: string) => {
    // In a real app, this would open a share dialog
    Alert.alert('Feature Coming Soon', 'Property sharing will be available soon.');
  };
  
  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(prevFilter => prevFilter === filter ? null : filter);
  };
  
  // Render filter chips
  const renderFilterChips = () => {
    const filters = ['Apartment', 'Villa', 'Commercial', 'House', 'Land'];
    
    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && { 
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => handleFilterSelect(filter)}
            >
              <Text 
                variant="caption" 
                color={selectedFilter === filter ? theme.colors.white : theme.colors.text}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // Render property item
  const renderPropertyItem = ({ item }: { item: Property }) => (
    <Card style={styles.propertyCard}>
      <Image source={{ uri: item.imageUri }} style={styles.propertyImage} />
      
      <View style={styles.propertyContent}>
        <View style={styles.propertyHeader}>
          <Text variant="subtitle1" style={styles.propertyTitle}>{item.title}</Text>
          
          <View style={styles.propertyActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditProperty(item.id)}
            >
              <Ionicons name="pencil-outline" size={18} color={theme.colors.gray600} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShareProperty(item.id)}
            >
              <Ionicons name="share-outline" size={18} color={theme.colors.gray600} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteProperty(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetail}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.primary} />
            <Text variant="subtitle2" style={styles.propertyDetailText}>{item.price}</Text>
          </View>
          
          <View style={styles.propertyDetail}>
            <Ionicons name="home-outline" size={16} color={theme.colors.primary} />
            <Text variant="body2" style={styles.propertyDetailText}>{item.type}</Text>
          </View>
          
          <View style={styles.propertyDetail}>
            <Ionicons name="bed-outline" size={16} color={theme.colors.primary} />
            <Text variant="body2" style={styles.propertyDetailText}>
              {item.bedrooms} {item.bedrooms === 1 ? 'Bed' : 'Beds'}
            </Text>
          </View>
          
          <View style={styles.propertyDetail}>
            <Ionicons name="water-outline" size={16} color={theme.colors.primary} />
            <Text variant="body2" style={styles.propertyDetailText}>
              {item.bathrooms} {item.bathrooms === 1 ? 'Bath' : 'Baths'}
            </Text>
          </View>
          
          <View style={styles.propertyDetail}>
            <Ionicons name="resize-outline" size={16} color={theme.colors.primary} />
            <Text variant="body2" style={styles.propertyDetailText}>{item.area}</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={theme.colors.gray600} />
          <Text variant="caption" style={styles.locationText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text variant="caption" color={theme.colors.primary}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => router.push(`/(app)/property/${item.id}`)}
        >
          <Text variant="button" color={theme.colors.primary}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="home-outline" size={64} color={theme.colors.gray400} />
      <Text variant="h5" style={styles.emptyStateTitle}>No Properties Found</Text>
      <Text variant="body2" color={theme.colors.textLight} style={styles.emptyStateText}>
        {searchQuery 
          ? 'No properties match your search criteria. Try a different search term or filter.'
          : 'Your property inventory is empty. Add properties by capturing them with the camera.'}
      </Text>
      
      {!searchQuery && (
        <Button
          title="Capture Property"
          leftIcon={<Ionicons name="camera-outline" size={20} color={theme.colors.white} />}
          onPress={() => router.push('/(app)/property-camera')}
          style={styles.captureButton}
        />
      )}
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Property Inventory</Text>
        <Text variant="body2" color={theme.colors.textLight}>
          Manage your property listings
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search properties..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={theme.colors.gray500} />}
          containerStyle={styles.searchInput}
        />
        
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(app)/property-camera')}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      
      {renderFilterChips()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body2" style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          renderItem={renderPropertyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 24,
  },
  propertyCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  propertyContent: {
    padding: 16,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyTitle: {
    flex: 1,
    marginRight: 8,
  },
  propertyActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  propertyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  propertyDetailText: {
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 4,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  captureButton: {
    minWidth: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
});
