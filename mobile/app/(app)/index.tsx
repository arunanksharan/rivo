import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/AuthContext';

// Mock data for featured properties
const FEATURED_PROPERTIES = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    address: '123 Main St, New York, NY',
    price: '$2,500,000',
    beds: 3,
    baths: 2,
    area: '1,200 sqft',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
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
  },
];

// Mock data for recent searches
const RECENT_SEARCHES = [
  {
    id: '1',
    query: 'Apartments in Manhattan',
    results: 245,
  },
  {
    id: '2',
    query: 'Houses with pool in Miami',
    results: 123,
  },
  {
    id: '3',
    query: 'Condos near Central Park',
    results: 78,
  },
];

// Quick action items
const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Buy',
    icon: 'home-outline',
    color: '#2563EB',
  },
  {
    id: '2',
    title: 'Rent',
    icon: 'key-outline',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Sell',
    icon: 'cash-outline',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Estimate',
    icon: 'calculator-outline',
    color: '#EF4444',
  },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(app)/search',
        params: { query: searchQuery },
      });
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    router.push({
      pathname: '/(app)/property/[id]',
      params: { id: propertyId },
    });
  };

  const renderPropertyCard = ({ item }: { item: typeof FEATURED_PROPERTIES[0] }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => handlePropertyPress(item.id)}
      activeOpacity={0.9}
    >
      <Card elevation={2} padding={false} style={styles.propertyCardInner}>
        <Image
          source={{ uri: `${item.image}?w=500&auto=format&q=80` }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <View style={styles.propertyInfo}>
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

  const renderQuickAction = ({ item }: { item: typeof QUICK_ACTIONS[0] }) => (
    <TouchableOpacity style={styles.quickAction}>
      <View style={[styles.quickActionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text variant="body2" style={styles.quickActionTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }: { item: typeof RECENT_SEARCHES[0] }) => (
    <TouchableOpacity
      style={[styles.recentSearch, { borderColor: theme.colors.border }]}
      onPress={() => {
        setSearchQuery(item.query);
        handleSearch();
      }}
    >
      <View style={styles.recentSearchContent}>
        <Ionicons name="time-outline" size={16} color={theme.colors.gray500} />
        <View style={styles.recentSearchText}>
          <Text variant="body2">{item.query}</Text>
          <Text variant="caption" color={theme.colors.textLight}>
            {item.results} properties
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.gray500} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text variant="body2" color={theme.colors.textLight}>
            Hello, {user?.firstName || 'Guest'}
          </Text>
          <Text variant="h4">Find Your Dream Home</Text>
        </View>
        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: theme.colors.gray100 }]}
          onPress={() => router.push('/(app)/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for properties, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Ionicons name="search-outline" size={20} color={theme.colors.gray500} />}
          rightIcon={<Ionicons name="options-outline" size={20} color={theme.colors.gray500} />}
          onRightIconPress={() => router.push('/(app)/search-filters')}
          containerStyle={styles.searchInput}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={styles.quickActionsContainer}>
        <FlatList
          data={QUICK_ACTIONS}
          renderItem={renderQuickAction}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsList}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text variant="subtitle1">Featured Properties</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/featured')}>
            <Text variant="body2" color={theme.colors.primary}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={FEATURED_PROPERTIES}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.propertyList}
        />
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text variant="subtitle1">Recent Searches</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/recent-searches')}>
            <Text variant="body2" color={theme.colors.primary}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentSearchList}>
          {RECENT_SEARCHES.map((item) => (
            <React.Fragment key={item.id}>{renderRecentSearch({ item })}</React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.voiceAssistantPromo}>
        <View style={styles.voiceAssistantContent}>
          <Text variant="subtitle1" color={theme.colors.white}>
            Try Voice Assistant
          </Text>
          <Text variant="body2" color={theme.colors.white} style={styles.voiceAssistantText}>
            Search properties, schedule viewings, and more with voice commands
          </Text>
          <TouchableOpacity
            style={[styles.voiceAssistantButton, { backgroundColor: theme.colors.white }]}
            onPress={() => router.push('/(app)/voice-assistant')}
          >
            <Text variant="button" color={theme.colors.primary}>
              Try Now
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.voiceAssistantIconContainer}>
          <View style={styles.voiceAssistantIcon}>
            <Ionicons name="mic" size={32} color={theme.colors.white} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 0,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsList: {
    paddingHorizontal: 16,
  },
  quickAction: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 70,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  propertyList: {
    paddingHorizontal: 12,
  },
  propertyCard: {
    width: 280,
    marginHorizontal: 8,
  },
  propertyCardInner: {
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  propertyInfo: {
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
  recentSearchList: {
    paddingHorizontal: 20,
  },
  recentSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recentSearchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchText: {
    marginLeft: 12,
  },
  voiceAssistantPromo: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  voiceAssistantContent: {
    flex: 3,
  },
  voiceAssistantText: {
    marginTop: 4,
    marginBottom: 16,
    opacity: 0.9,
  },
  voiceAssistantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  voiceAssistantIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceAssistantIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
