import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { changePassword } from '@/services/api/users';

// Form validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * ChangePasswordScreen component for updating user password.
 */
const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  
  // Local state
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormData, string>>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (error) => {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please check your current password and try again.');
    },
  });
  
  // Handle input change
  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    try {
      // Validate form data
      passwordSchema.parse(formData);
      
      // Update password
      changePasswordMutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our format
        const formattedErrors: Partial<Record<keyof PasswordFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof PasswordFormData;
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error('Validation error:', error);
        Alert.alert('Error', 'Please check your inputs and try again.');
      }
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    if (field === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (field === 'new') {
      setShowNewPassword(!showNewPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
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
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Change Password
            </Text>
          </View>
        </View>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            <Text className="text-gray-600 dark:text-gray-400 mb-6">
              Your password must be at least 8 characters long and include a mix of letters, numbers, and symbols for better security.
            </Text>
            
            {/* Form Fields */}
            <View className="space-y-6">
              {/* Current Password */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Current Password
                </Text>
                <View className={`flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-4 ${
                  errors.currentPassword ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                }`}>
                  <TextInput
                    className="flex-1 py-3 text-gray-900 dark:text-white"
                    placeholder="Enter your current password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.currentPassword}
                    onChangeText={(text) => handleChange('currentPassword', text)}
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('current')}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </Text>
                )}
              </View>
              
              {/* New Password */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  New Password
                </Text>
                <View className={`flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-4 ${
                  errors.newPassword ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                }`}>
                  <TextInput
                    className="flex-1 py-3 text-gray-900 dark:text-white"
                    placeholder="Enter your new password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.newPassword}
                    onChangeText={(text) => handleChange('newPassword', text)}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('new')}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </Text>
                )}
              </View>
              
              {/* Confirm Password */}
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Confirm New Password
                </Text>
                <View className={`flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-4 ${
                  errors.confirmPassword ? 'border border-red-500' : 'border border-gray-200 dark:border-gray-700'
                }`}>
                  <TextInput
                    className="flex-1 py-3 text-gray-900 dark:text-white"
                    placeholder="Confirm your new password"
                    placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleChange('confirmPassword', text)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('confirm')}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={isDark ? '#9CA3AF' : '#6B7280'}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Save Button */}
        <View className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            className={`bg-primary-600 dark:bg-primary-700 py-3 rounded-lg ${
              changePasswordMutation.isPending ? 'opacity-70' : ''
            }`}
            onPress={handleSubmit}
            disabled={changePasswordMutation.isPending}
          >
            <Text className="text-white font-medium text-center">
              {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;
