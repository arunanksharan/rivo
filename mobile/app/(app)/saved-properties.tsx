import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/AuthContext';

// Mock data for favorite properties (same as in favorites.tsx)
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

export default function SavedPropertiesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  
  const handleRemoveFavorite = (propertyId: string) => {
    Alert.alert(
      'Remove from Saved Properties',
      'Are you sure you want to remove this property from your saved list?',
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
  
  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/(app)/property/[id]',
      params: { id: propertyId },
    });
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
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color={theme.colors.gray400} />
      <Text variant="h5" style={styles.emptyStateTitle}>No Saved Properties</Text>
      <Text variant="body2" color={theme.colors.textLight} style={styles.emptyStateText}>
        You haven't saved any properties yet. Browse listings and tap the heart icon to save properties for later.
      </Text>
      <Button
        title="Browse Properties"
        onPress={() => router.push('/(app)')}
        style={styles.browseButton}
      />
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Saved Properties</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === 'list' && { backgroundColor: theme.colors.primary + '20' },
            ]}
            onPress={() => setViewType('list')}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={viewType === 'list' ? theme.colors.primary : theme.colors.gray500}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === 'grid' && { backgroundColor: theme.colors.primary + '20' },
            ]}
            onPress={() => setViewType('grid')}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color={viewType === 'grid' ? theme.colors.primary : theme.colors.gray500}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={viewType === 'grid' ? 2 : 1}
          key={viewType} // Force re-render when view type changes
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 24,
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
    height: 120,
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
    marginBottom: 4,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    minWidth: 200,
  },
});
