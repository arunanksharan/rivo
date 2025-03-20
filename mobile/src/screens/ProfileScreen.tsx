import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import useVoiceStore from '@/store/useVoiceStore';
import { updateUserProfile } from '@/services/api/users';

/**
 * ProfileScreen component for displaying and editing user profile information.
 * Includes settings for theme, voice assistant, and account management.
 */
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark, toggleTheme } = useTheme();
  const { profile, isAuthenticated, signOut, updateProfile } = useAuth();
  const { settings: voiceSettings, updateSettings: updateVoiceSettings } = useVoiceStore();
  const queryClient = useQueryClient();
  
  // Local state
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      updateProfile(data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });
  
  // Handle avatar selection
  const handleSelectAvatar = async () => {
    if (!isAuthenticated) return;
    
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
          updateProfileMutation.mutate({
            avatar_url: result.assets[0].uri,
          });
          setIsUpdatingAvatar(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error selecting avatar:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      setIsUpdatingAvatar(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };
  
  // Toggle voice assistant
  const toggleVoiceAssistant = (value: boolean) => {
    updateVoiceSettings({ enabled: value });
  };
  
  // Toggle voice type
  const toggleVoiceType = () => {
    updateVoiceSettings({
      voice_type: voiceSettings.voice_type === 'female' ? 'male' : 'female',
    });
  };
  
  // Render sign in button if not authenticated
  const renderAuthSection = () => {
    if (!isAuthenticated) {
      return (
        <View className="items-center mt-4">
          <TouchableOpacity
            className="bg-primary-600 dark:bg-primary-700 py-3 px-6 rounded-lg w-full"
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
          >
            <Text className="text-white font-medium text-center">
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-3"
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Text className="text-primary-600 dark:text-primary-400">
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-12 pb-6 bg-white dark:bg-gray-800">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Profile
          </Text>
          
          {/* Profile Info */}
          <View className="flex-row items-center">
            <TouchableOpacity
              className="relative"
              onPress={handleSelectAvatar}
              disabled={!isAuthenticated || isUpdatingAvatar}
            >
              {isUpdatingAvatar ? (
                <View className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                  <ActivityIndicator color="#2563EB" />
                </View>
              ) : (
                <>
                  {profile?.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 items-center justify-center">
                      <Text className="text-primary-600 dark:text-primary-400 text-xl font-bold">
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
                      </Text>
                    </View>
                  )}
                  {isAuthenticated && (
                    <View className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-1">
                      <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
            
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.full_name || 'Guest User'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400">
                {profile?.email || 'Sign in to access your profile'}
              </Text>
              {isAuthenticated && (
                <TouchableOpacity
                  className="mt-2"
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Text className="text-primary-600 dark:text-primary-400">
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {renderAuthSection()}
        </View>
        
        {/* Settings Sections */}
        <View className="px-6 py-6">
          {/* Appearance */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Appearance
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                onPress={toggleTheme}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={22}
                    color={isDark ? "#93C5FD" : "#2563EB"}
                  />
                  <Text className="ml-3 text-gray-800 dark:text-gray-200">
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Voice Assistant */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Voice Assistant
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="mic-outline"
                    size={22}
                    color={isDark ? "#93C5FD" : "#2563EB"}
                  />
                  <Text className="ml-3 text-gray-800 dark:text-gray-200">
                    Enable Voice Assistant
                  </Text>
                </View>
                <Switch
                  value={voiceSettings.enabled}
                  onValueChange={toggleVoiceAssistant}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                onPress={toggleVoiceType}
                disabled={!voiceSettings.enabled}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={voiceSettings.enabled ? (isDark ? "#93C5FD" : "#2563EB") : "#9CA3AF"}
                  />
                  <Text className={`ml-3 ${voiceSettings.enabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                    Voice Type
                  </Text>
                </View>
                <Text className={`${voiceSettings.enabled ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  {voiceSettings.voice_type === 'female' ? 'Female' : 'Male'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row justify-between items-center p-4"
                onPress={() => navigation.navigate('VoiceAssistantSettings')}
                disabled={!voiceSettings.enabled}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="settings-outline"
                    size={22}
                    color={voiceSettings.enabled ? (isDark ? "#93C5FD" : "#2563EB") : "#9CA3AF"}
                  />
                  <Text className={`ml-3 ${voiceSettings.enabled ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                    Voice Assistant Settings
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={voiceSettings.enabled ? (isDark ? "#9CA3AF" : "#6B7280") : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Account */}
          {isAuthenticated && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Account
              </Text>
              <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <TouchableOpacity
                  className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                  onPress={() => navigation.navigate('SavedProperties')}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="heart-outline"
                      size={22}
                      color={isDark ? "#93C5FD" : "#2563EB"}
                    />
                    <Text className="ml-3 text-gray-800 dark:text-gray-200">
                      Saved Properties
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="notifications-outline"
                      size={22}
                      color={isDark ? "#93C5FD" : "#2563EB"}
                    />
                    <Text className="ml-3 text-gray-800 dark:text-gray-200">
                      Notifications
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                  onPress={() => navigation.navigate('ChangePassword')}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={isDark ? "#93C5FD" : "#2563EB"}
                    />
                    <Text className="ml-3 text-gray-800 dark:text-gray-200">
                      Change Password
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row justify-between items-center p-4"
                  onPress={handleSignOut}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#EF4444"
                    />
                    <Text className="ml-3 text-red-500">
                      Sign Out
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* About */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              About
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                onPress={() => navigation.navigate('Help')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color={isDark ? "#93C5FD" : "#2563EB"}
                  />
                  <Text className="ml-3 text-gray-800 dark:text-gray-200">
                    Help & Support
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700"
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="shield-outline"
                    size={22}
                    color={isDark ? "#93C5FD" : "#2563EB"}
                  />
                  <Text className="ml-3 text-gray-800 dark:text-gray-200">
                    Privacy Policy
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-row justify-between items-center p-4"
                onPress={() => navigation.navigate('About')}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color={isDark ? "#93C5FD" : "#2563EB"}
                  />
                  <Text className="ml-3 text-gray-800 dark:text-gray-200">
                    About Rivo
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* App Version */}
          <View className="items-center mt-6 mb-10">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Rivo v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
