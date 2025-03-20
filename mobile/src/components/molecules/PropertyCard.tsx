import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

// Define property type
export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  category: string;
  images: string[];
  is_featured?: boolean;
}

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  horizontal?: boolean;
  style?: ViewStyle;
}

/**
 * PropertyCard component displaying property information.
 * Used in property listings and search results.
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  horizontal = false,
  style,
}) => {
  const { isDark } = useTheme();

  // Format price with commas
  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString()}`;
  };

  return (
    <TouchableOpacity
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm ${
        horizontal ? 'flex-row' : 'flex-col'
      }`}
      style={[
        horizontal ? styles.horizontalCard : styles.verticalCard,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Property Image */}
      <View
        className={`${horizontal ? 'w-1/3' : 'w-full'} relative`}
        style={horizontal ? styles.horizontalImageContainer : styles.verticalImageContainer}
      >
        <Image
          source={{ uri: property.images[0] || 'https://via.placeholder.com/300x200?text=No+Image' }}
          className="w-full h-full"
          style={{ resizeMode: 'cover' }}
        />
        {property.is_featured && (
          <View className="absolute top-2 left-2 bg-primary-600 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">Featured</Text>
          </View>
        )}
        <TouchableOpacity className="absolute top-2 right-2 bg-white dark:bg-gray-800 w-8 h-8 rounded-full items-center justify-center">
          <Ionicons
            name="heart-outline"
            size={18}
            color={isDark ? '#D1D5DB' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Property Details */}
      <View
        className={`${horizontal ? 'w-2/3 p-3' : 'w-full p-4'}`}
      >
        <View className="flex-row items-center mb-1">
          <View className="bg-secondary-100 dark:bg-secondary-900 px-2 py-0.5 rounded">
            <Text className="text-secondary-800 dark:text-secondary-200 text-xs font-medium">
              {property.category.charAt(0).toUpperCase() + property.category.slice(1)}
            </Text>
          </View>
        </View>

        <Text
          className="text-gray-900 dark:text-white font-bold"
          style={horizontal ? styles.horizontalTitle : styles.verticalTitle}
          numberOfLines={1}
        >
          {property.title}
        </Text>

        <Text
          className="text-gray-500 dark:text-gray-400 text-xs mb-2"
          numberOfLines={1}
        >
          {property.address}
        </Text>

        <Text className="text-primary-600 dark:text-primary-400 font-bold text-base mb-2">
          {formatPrice(property.price)}
        </Text>

        <View className="flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="bed-outline" size={16} color={isDark ? '#D1D5DB' : '#6B7280'} />
            <Text className="text-gray-600 dark:text-gray-300 text-xs ml-1">
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="water-outline" size={16} color={isDark ? '#D1D5DB' : '#6B7280'} />
            <Text className="text-gray-600 dark:text-gray-300 text-xs ml-1">
              {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="square-outline" size={16} color={isDark ? '#D1D5DB' : '#6B7280'} />
            <Text className="text-gray-600 dark:text-gray-300 text-xs ml-1">
              {property.square_feet} ft²
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  verticalCard: {
    height: 300,
  },
  horizontalCard: {
    height: 120,
  },
  verticalImageContainer: {
    height: 180,
  },
  horizontalImageContainer: {
    height: '100%',
  },
  verticalTitle: {
    fontSize: 16,
  },
  horizontalTitle: {
    fontSize: 14,
  },
});

// Use memo to prevent unnecessary re-renders
export default memo(PropertyCard);
