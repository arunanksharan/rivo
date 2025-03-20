import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Carousel from 'react-native-reanimated-carousel';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { fetchPropertyById, saveProperty, unsaveProperty } from '@/services/api/properties';
import usePropertyStore from '@/store/usePropertyStore';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ErrorMessage from '@/components/atoms/ErrorMessage';
import { DEFAULT_PROPERTY_IMAGE } from '@/utils/constants';

type PropertyDetailsRouteProp = RouteProp<MainStackParamList, 'PropertyDetails'>;

/**
 * PropertyDetailsScreen component displays detailed information about a property.
 * Shows images, price, features, description, and contact options.
 */
const PropertyDetailsScreen: React.FC = () => {
  const route = useRoute<PropertyDetailsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { propertyId } = route.params;
  const { savedProperties } = usePropertyStore();
  
  // State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  // Screen dimensions for carousel
  const screenWidth = Dimensions.get('window').width;
  
  // Fetch property details
  const {
    data: property,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => fetchPropertyById(propertyId),
  });
  
  // Save property mutation
  const saveMutation = useMutation({
    mutationFn: saveProperty,
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
    },
    onError: (error) => {
      console.error('Error saving property:', error);
      Alert.alert('Error', 'Failed to save property. Please try again.');
    },
  });
  
  // Unsave property mutation
  const unsaveMutation = useMutation({
    mutationFn: unsaveProperty,
    onSuccess: () => {
      setIsSaved(false);
      queryClient.invalidateQueries({ queryKey: ['savedProperties'] });
    },
    onError: (error) => {
      console.error('Error removing saved property:', error);
      Alert.alert('Error', 'Failed to remove property from saved list. Please try again.');
    },
  });
  
  // Check if property is saved
  useEffect(() => {
    if (savedProperties.some((p) => p.id === propertyId)) {
      setIsSaved(true);
    }
  }, [savedProperties, propertyId]);
  
  // Toggle save/unsave property
  const toggleSaveProperty = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to save properties.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }
    
    if (isSaved) {
      unsaveMutation.mutate(propertyId);
    } else {
      saveMutation.mutate(propertyId);
    }
  };
  
  // Share property
  const shareProperty = async () => {
    if (!property) return;
    
    try {
      await Share.share({
        message: `Check out this ${property.bedrooms} bedroom ${property.category} for ${formatPrice(property.price)}: ${property.title}`,
        url: `https://rivo.app/properties/${property.id}`,
      });
    } catch (error) {
      console.error('Error sharing property:', error);
    }
  };
  
  // Contact agent
  const contactAgent = () => {
    // In a real app, this would open a chat or call the agent
    Alert.alert(
      'Contact Agent',
      'Would you like to call or message the agent?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL('tel:+1234567890') },
        { text: 'Message', onPress: () => navigation.navigate('Chat', { agentId: '123' }) },
      ]
    );
  };
  
  // Format price with commas
  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString()}`;
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <LoadingIndicator message="Loading property details..." />
      </View>
    );
  }
  
  if (error || !property) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <ErrorMessage
          message="Failed to load property details"
          onRetry={refetch}
        />
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Image Carousel */}
      <View className="relative">
        <Carousel
          width={screenWidth}
          height={300}
          data={property.images.length > 0 ? property.images : [DEFAULT_PROPERTY_IMAGE]}
          scrollAnimationDuration={500}
          onSnapToItem={(index) => setActiveImageIndex(index)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: screenWidth, height: 300 }}
              resizeMode="cover"
            />
          )}
        />
        
        {/* Image indicators */}
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
          {property.images.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === activeImageIndex
                  ? 'bg-white'
                  : 'bg-white/50'
              }`}
            />
          ))}
        </View>
        
        {/* Back button */}
        <TouchableOpacity
          className="absolute top-12 left-4 bg-black/30 rounded-full p-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Action buttons */}
        <View className="absolute top-12 right-4 flex-row">
          <TouchableOpacity
            className="bg-black/30 rounded-full p-2 mr-2"
            onPress={toggleSaveProperty}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#F87171" : "#FFFFFF"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-black/30 rounded-full p-2"
            onPress={shareProperty}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Property header */}
        <View className="p-6 bg-white dark:bg-gray-800">
          <View className="flex-row items-center mb-2">
            <View className="bg-secondary-100 dark:bg-secondary-900 px-2 py-0.5 rounded">
              <Text className="text-secondary-800 dark:text-secondary-200 text-xs font-medium">
                {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
              </Text>
            </View>
            {property.is_featured && (
              <View className="bg-primary-100 dark:bg-primary-900 px-2 py-0.5 rounded ml-2">
                <Text className="text-primary-800 dark:text-primary-200 text-xs font-medium">
                  Featured
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {property.title}
          </Text>
          
          <Text className="text-gray-500 dark:text-gray-400 mb-2">
            {property.address}
          </Text>
          
          <Text className="text-primary-600 dark:text-primary-400 font-bold text-xl mb-4">
            {formatPrice(property.price)}
          </Text>
          
          {/* Property features */}
          <View className="flex-row justify-between py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <View className="items-center">
              <Ionicons name="bed-outline" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-300 mt-1">
                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </Text>
            </View>
            
            <View className="items-center">
              <Ionicons name="water-outline" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-300 mt-1">
                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </Text>
            </View>
            
            <View className="items-center">
              <Ionicons name="square-outline" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-300 mt-1">
                {property.square_feet} ft²
              </Text>
            </View>
            
            <View className="items-center">
              <Ionicons name="calendar-outline" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-300 mt-1">
                2023
              </Text>
            </View>
          </View>
        </View>
        
        {/* Description */}
        <View className="p-6 mt-2 bg-white dark:bg-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Description
          </Text>
          
          <Text className="text-gray-700 dark:text-gray-300 leading-6">
            This beautiful {property.bedrooms} bedroom {property.category} offers modern living in a prime location. 
            With {property.bathrooms} bathrooms and {property.square_feet} square feet of living space, 
            it provides ample room for comfortable living. The property features high ceilings, 
            hardwood floors, and abundant natural light throughout. The kitchen is equipped with 
            stainless steel appliances and granite countertops. Located in a desirable neighborhood 
            with excellent schools, shopping, and dining options nearby.
          </Text>
        </View>
        
        {/* Features */}
        <View className="p-6 mt-2 bg-white dark:bg-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </Text>
          
          <View className="flex-row flex-wrap">
            {['Air Conditioning', 'Heating', 'Parking', 'Laundry', 'Dishwasher', 'Fireplace', 'Garden', 'Pool'].map((feature, index) => (
              <View key={index} className="flex-row items-center mb-3 w-1/2">
                <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                <Text className="text-gray-700 dark:text-gray-300 ml-2">
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Location */}
        <View className="p-6 mt-2 bg-white dark:bg-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Location
          </Text>
          
          <TouchableOpacity
            className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg items-center justify-center"
            onPress={() => navigation.navigate('PropertyMap', { propertyId: property.id })}
          >
            <Ionicons name="map-outline" size={40} color={isDark ? '#D1D5DB' : '#6B7280'} />
            <Text className="text-gray-600 dark:text-gray-400 mt-2">
              Tap to view on map
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Spacing for bottom buttons */}
        <View className="h-24" />
      </ScrollView>
      
      {/* Bottom action buttons */}
      <View className="absolute bottom-0 left-0 right-0 flex-row p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          className="flex-1 bg-white dark:bg-gray-700 py-3 rounded-lg border border-primary-600 dark:border-primary-500 mr-2"
          onPress={() => Linking.openURL(`tel:+1234567890`)}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="call-outline" size={20} color={isDark ? '#93C5FD' : '#2563EB'} />
            <Text className="ml-2 text-primary-600 dark:text-primary-400 font-medium">
              Call
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 bg-primary-600 dark:bg-primary-700 py-3 rounded-lg"
          onPress={contactAgent}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text className="ml-2 text-white font-medium">
              Message
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PropertyDetailsScreen;
