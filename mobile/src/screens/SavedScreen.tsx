import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { fetchSavedProperties, unsaveProperty } from '@/services/api/properties';
import usePropertyStore from '@/store/usePropertyStore';
import PropertyCard from '@/components/molecules/PropertyCard';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ErrorMessage from '@/components/atoms/ErrorMessage';

/**
 * SavedScreen component displays the user's saved/favorited properties.
 */
const SavedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { setSavedProperties } = usePropertyStore();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch saved properties
  const {
    data: savedProperties,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['savedProperties'],
    queryFn: fetchSavedProperties,
    enabled: isAuthenticated,
    onSuccess: (data) => {
      setSavedProperties(data);
    },
  });
  
  // Unsave property mutation
  const unsaveMutation = useMutation({
    mutationFn: unsaveProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
    },
    onError: (error) => {
      console.error('Error removing saved property:', error);
      Alert.alert('Error', 'Failed to remove property from saved list. Please try again.');
    },
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Remove saved property
  const handleRemoveSaved = (propertyId: string) => {
    Alert.alert(
      'Remove Property',
      'Are you sure you want to remove this property from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => unsaveMutation.mutate(propertyId),
        },
      ]
    );
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (!isAuthenticated) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons
            name="heart-outline"
            size={64}
            color={isDark ? '#4B5563' : '#9CA3AF'}
          />
          <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center text-lg font-medium">
            Sign in to view saved properties
          </Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-500 text-center mb-6">
            Save properties to compare them or view them later
          </Text>
          <TouchableOpacity
            className="bg-primary-600 dark:bg-primary-700 py-3 px-6 rounded-lg"
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text className="text-white font-medium text-center">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons
          name="heart-outline"
          size={64}
          color={isDark ? '#4B5563' : '#9CA3AF'}
        />
        <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center text-lg font-medium">
          No saved properties yet
        </Text>
        <Text className="mt-2 text-gray-500 dark:text-gray-500 text-center mb-6">
          Properties you save will appear here
        </Text>
        <TouchableOpacity
          className="bg-primary-600 dark:bg-primary-700 py-3 px-6 rounded-lg"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        >
          <Text className="text-white font-medium text-center">
            Browse Properties
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render property item
  const renderPropertyItem = ({ item }: { item: any }) => (
    <View className="px-6 py-2">
      <PropertyCard
        property={item}
        onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
        horizontal
      />
      <TouchableOpacity
        className="absolute top-4 right-8 bg-white dark:bg-gray-800 w-8 h-8 rounded-full items-center justify-center shadow-sm z-10"
        onPress={() => handleRemoveSaved(item.id)}
      >
        <Ionicons
          name="heart"
          size={18}
          color="#F87171"
        />
      </TouchableOpacity>
    </View>
  );
  
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        {/* Header */}
        <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Properties
          </Text>
        </View>
        
        {renderEmptyState()}
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Properties
        </Text>
      </View>
      
      {/* Saved Properties List */}
      {isLoading ? (
        <LoadingIndicator message="Loading saved properties..." />
      ) : error ? (
        <ErrorMessage
          message="Failed to load saved properties"
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={savedProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderPropertyItem}
          contentContainerClassName="py-4"
          ListEmptyComponent={renderEmptyState}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

export default SavedScreen;
