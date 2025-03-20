import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { MainStackParamList } from '@/navigation';
import { fetchFeaturedProperties, fetchRecentProperties } from '@/services/api/properties';
import PropertyCard from '@/components/molecules/PropertyCard';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * HomeScreen component displaying featured and recent properties.
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { profile } = useAuth();
  const { isDark } = useTheme();

  // Fetch featured properties
  const {
    data: featuredProperties,
    isLoading: isFeaturedLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: fetchFeaturedProperties,
  });

  // Fetch recent properties
  const {
    data: recentProperties,
    isLoading: isRecentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ['recentProperties'],
    queryFn: fetchRecentProperties,
  });

  // Handle refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFeatured(), refetchRecent()]);
    setRefreshing(false);
  }, [refetchFeatured, refetchRecent]);

  // Navigate to voice assistant
  const handleVoiceAssistant = () => {
    navigation.navigate('VoiceAssistant');
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-600 dark:text-gray-300 text-base">
                Hello, {profile?.full_name?.split(' ')[0] || 'there'}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                Find your perfect home
              </Text>
            </View>
            <TouchableOpacity
              className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center"
              onPress={handleVoiceAssistant}
            >
              <Ionicons
                name="mic-outline"
                size={22}
                color={isDark ? '#93C5FD' : '#2563EB'}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mt-6"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
            <Text className="ml-2 text-gray-500 dark:text-gray-400">
              Search for properties...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Featured Properties */}
        <View className="mt-6 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Featured Properties
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-600 dark:text-primary-400">See All</Text>
            </TouchableOpacity>
          </View>

          {isFeaturedLoading ? (
            <LoadingIndicator />
          ) : featuredError ? (
            <ErrorMessage
              message="Failed to load featured properties"
              onRetry={refetchFeatured}
            />
          ) : (
            <FlatList
              data={featuredProperties}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <PropertyCard
                  property={item}
                  onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
                  style={{ width: 280, marginRight: 16 }}
                />
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No featured properties available
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Recent Properties */}
        <View className="mt-8 px-6 pb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Properties
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-600 dark:text-primary-400">See All</Text>
            </TouchableOpacity>
          </View>

          {isRecentLoading ? (
            <LoadingIndicator />
          ) : recentError ? (
            <ErrorMessage
              message="Failed to load recent properties"
              onRetry={refetchRecent}
            />
          ) : (
            <View className="space-y-4">
              {recentProperties?.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
                  horizontal
                />
              ))}
              {recentProperties?.length === 0 && (
                <View className="items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No recent properties available
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
