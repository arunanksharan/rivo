import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { updateUserProfile } from '@/services/api/users';

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * EditProfileScreen component for editing user profile information.
 */
const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  const { profile, updateProfile } = useAuth();
  
  // Local state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone_number: profile?.phone_number || '',
    bio: profile?.bio || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatar_url);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      updateProfile(data);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });
  
  // Handle input change
  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Handle avatar selection
  const handleSelectAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUpdatingAvatar(true);
        
        // In a real app, you would upload the image to a server here
        // For this example, we'll simulate an upload with a timeout
        setTimeout(() => {
          setAvatarUrl(result.assets[0].uri);
          setIsUpdatingAvatar(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error selecting avatar:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      setIsUpdatingAvatar(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    try {
      // Validate form data
      profileSchema.parse(formData);
      
      // Prepare data for update
      const updateData = {
        ...formData,
        avatar_url: avatarUrl,
      };
      
      // Update profile
      updateProfileMutation.mutate(updateData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our format
        const formattedErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof ProfileFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error('Validation error:', error);
        Alert.alert('Error', 'Please check your inputs and try again.');
      }
    }
  };
  
  // Discard changes
  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        {/* Header */}
        <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleDiscard}
            >
              <Text className="text-gray-600 dark:text-gray-400">
                Cancel
              </Text>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </Text>
            
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={updateProfileMutation.isPending}
            >
              <Text className="text-primary-600 dark:text-primary-400 font-medium">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Profile Picture */}
            <View className="items-center mb-8">
              <TouchableOpacity
                className="relative"
                onPress={handleSelectAvatar}
                disabled={isUpdatingAvatar}
              >
                {isUpdatingAvatar ? (
                  <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                    <ActivityIndicator color="#2563EB" />
                  </View>
                ) : (
                  <>
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-24 h-24 rounded-full"
                      />
                    ) : (
                      <View className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center">
                        <Text className="text-primary-600 dark:text-primary-400 text-2xl font-bold">
                          {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : '?'}
                        </Text>
                      </View>
                    )}
                    <View className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2">
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                  </>
                )}
              </TouchableOpacity>
              <Text className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Tap to change profile picture
              </Text>
            </View>
            
            {/* Form Fields */}
            <View className="space-y-6">
              {/* Full Name */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Full Name
                </Text>
                <TextInput
                  className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white ${
                    errors.full_name ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={formData.full_name}
                  onChangeText={(text) => handleChange('full_name', text)}
                />
                {errors.full_name && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.full_name}
                  </Text>
                )}
              </View>
              
              {/* Email */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Email
                </Text>
                <TextInput
                  className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white ${
                    errors.email ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={false} // Email is typically not editable
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </Text>
                )}
                <Text className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Email cannot be changed
                </Text>
              </View>
              
              {/* Phone Number */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Phone Number (optional)
                </Text>
                <TextInput
                  className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white ${
                    errors.phone_number ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Enter your phone number"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={formData.phone_number}
                  onChangeText={(text) => handleChange('phone_number', text)}
                  keyboardType="phone-pad"
                />
                {errors.phone_number && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.phone_number}
                  </Text>
                )}
              </View>
              
              {/* Bio */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Bio (optional)
                </Text>
                <TextInput
                  className={`bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white ${
                    errors.bio ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  value={formData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
                {errors.bio && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.bio}
                  </Text>
                )}
                <Text className="text-gray-500 dark:text-gray-500 text-xs mt-1 text-right">
                  {formData.bio?.length || 0}/200
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Save Button for Mobile */}
        <View className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            className={`bg-primary-600 dark:bg-primary-700 py-3 rounded-lg ${
              updateProfileMutation.isPending ? 'opacity-70' : ''
            }`}
            onPress={handleSubmit}
            disabled={updateProfileMutation.isPending}
          >
            <Text className="text-white font-medium text-center">
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
