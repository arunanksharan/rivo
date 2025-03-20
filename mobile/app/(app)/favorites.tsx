import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/AuthContext';

// Mock data for favorite properties
const INITIAL_FAVORITES = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    address: '123 Main St, New York, NY',
    price: '$2,500,000',
    beds: 3,
    baths: 2,
    area: '1,200 sqft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    dateAdded: '2023-09-15T14:30:00Z',
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
    dateAdded: '2023-09-10T09:15:00Z',
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
    dateAdded: '2023-09-05T16:45:00Z',
  },
];

// Mock data for saved searches
const SAVED_SEARCHES = [
  {
    id: '1',
    name: 'Downtown Apartments',
    criteria: 'Apartments in Manhattan, 2+ beds, $1M-$3M',
    lastUpdated: '2023-09-15T14:30:00Z',
    newResults: 3,
  },
  {
    id: '2',
    name: 'Suburban Homes',
    criteria: 'Houses in Austin, 3+ beds, 2+ baths, Under $1M',
    lastUpdated: '2023-09-10T09:15:00Z',
    newResults: 5,
  },
];

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties');
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [savedSearches, setSavedSearches] = useState(SAVED_SEARCHES);
  
  const handleRemoveFavorite = (propertyId: string) => {
    Alert.alert(
      'Remove from Favorites',
      'Are you sure you want to remove this property from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setFavorites(favorites.filter(property => property.id !== propertyId));
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleRemoveSavedSearch = (searchId: string) => {
    Alert.alert(
      'Remove Saved Search',
      'Are you sure you want to remove this saved search?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setSavedSearches(savedSearches.filter(search => search.id !== searchId));
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/(app)/property/[id]',
      params: { id: propertyId },
    });
  };
  
  const handleSavedSearchPress = (searchId: string) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      router.push({
        pathname: '/(app)/search',
        params: { query: search.criteria.split(',')[0] },
      });
    }
  };
  
  const renderPropertyItem = ({ item }: { item: typeof INITIAL_FAVORITES[0] }) => (
    <Card elevation={1} style={styles.propertyCard}>
      <TouchableOpacity
        style={styles.propertyCardInner}
        onPress={() => handlePropertyPress(item.id)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: `${item.image}?w=500&auto=format&q=80` }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
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
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.colors.error + '20' }]}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="close" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Card>
  );
  
  const renderSavedSearchItem = ({ item }: { item: typeof SAVED_SEARCHES[0] }) => (
    <Card elevation={1} style={styles.savedSearchCard}>
      <TouchableOpacity
        style={styles.savedSearchCardInner}
        onPress={() => handleSavedSearchPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.savedSearchContent}>
          <View style={styles.savedSearchHeader}>
            <Text variant="subtitle1" style={styles.savedSearchName}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.colors.error + '20' }]}
              onPress={() => handleRemoveSavedSearch(item.id)}
            >
              <Ionicons name="close" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
          <Text variant="body2" color={theme.colors.textLight} style={styles.savedSearchCriteria}>
            {item.criteria}
          </Text>
          <View style={styles.savedSearchFooter}>
            <Text variant="caption" color={theme.colors.gray600}>
              Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
            </Text>
            {item.newResults > 0 && (
              <View style={[styles.newResultsBadge, { backgroundColor: theme.colors.primary }]}>
                <Text variant="caption" color={theme.colors.white}>
                  {item.newResults} new
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
  
  const renderEmptyFavorites = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart" size={64} color={theme.colors.gray300} />
      <Text variant="subtitle1" style={styles.emptyTitle}>No favorites yet</Text>
      <Text variant="body2" color={theme.colors.textLight} style={styles.emptyText}>
        Start browsing properties and add them to your favorites
      </Text>
      <Button
        title="Browse Properties"
        onPress={() => router.push('/(app)/search')}
        style={styles.browseButton}
      />
    </View>
  );
  
  const renderEmptySavedSearches = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={64} color={theme.colors.gray300} />
      <Text variant="subtitle1" style={styles.emptyTitle}>No saved searches</Text>
      <Text variant="body2" color={theme.colors.textLight} style={styles.emptyText}>
        Save your search criteria to get notified about new matching properties
      </Text>
      <Button
        title="Start Searching"
        onPress={() => router.push('/(app)/search')}
        style={styles.browseButton}
      />
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Your Favorites</Text>
        {user && (
          <Text variant="body2" color={theme.colors.textLight}>
            {user.firstName} {user.lastName}
          </Text>
        )}
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'properties' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('properties')}
        >
          <Text
            variant="subtitle2"
            color={activeTab === 'properties' ? theme.colors.primary : theme.colors.gray600}
          >
            Saved Properties
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'searches' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary }
            ]
          ]}
          onPress={() => setActiveTab('searches')}
        >
          <Text
            variant="subtitle2"
            color={activeTab === 'searches' ? theme.colors.primary : theme.colors.gray600}
          >
            Saved Searches
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'properties' ? (
        <FlatList
          data={favorites}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyFavorites}
        />
      ) : (
        <FlatList
          data={savedSearches}
          renderItem={renderSavedSearchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptySavedSearches}
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
    padding: 20,
    paddingBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  propertyCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  propertyCardInner: {
    flexDirection: 'row',
    position: 'relative',
  },
  propertyImage: {
    width: 120,
    height: '100%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  propertyContent: {
    flex: 1,
    padding: 12,
  },
  propertyTitle: {
    marginBottom: 4,
  },
  propertyAddress: {
    marginBottom: 8,
  },
  propertyPrice: {
    marginBottom: 8,
  },
  propertyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    marginLeft: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedSearchCard: {
    marginBottom: 16,
  },
  savedSearchCardInner: {
    position: 'relative',
  },
  savedSearchContent: {
    padding: 16,
  },
  savedSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedSearchName: {
    flex: 1,
    marginRight: 8,
  },
  savedSearchCriteria: {
    marginBottom: 12,
  },
  savedSearchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newResultsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    width: 200,
  },
});
