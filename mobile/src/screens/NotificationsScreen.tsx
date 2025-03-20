import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { MainStackParamList } from '@/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { fetchNotificationSettings, updateNotificationSettings } from '@/services/api/users';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';
import ErrorMessage from '@/components/atoms/ErrorMessage';

// Mock notification data (in a real app, this would come from an API)
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New property match',
    message: 'We found a new property that matches your search criteria.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    type: 'match',
  },
  {
    id: '2',
    title: 'Price drop alert',
    message: 'A property you saved has dropped in price by $25,000.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    read: true,
    type: 'price',
  },
  {
    id: '3',
    title: 'New message',
    message: 'You have a new message from John Doe regarding 123 Main St.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: false,
    type: 'message',
  },
  {
    id: '4',
    title: 'Viewing reminder',
    message: 'Your property viewing at 456 Oak Ave is scheduled for tomorrow at 2:00 PM.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    type: 'reminder',
  },
];

/**
 * NotificationsScreen component for displaying user notifications and managing notification settings.
 */
const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  
  // Local state
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch notification settings
  const {
    data: notificationSettings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: fetchNotificationSettings,
    // In a real app, this would be enabled based on authentication status
    enabled: true,
  });
  
  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['notificationSettings'], data);
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    },
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    
    if (activeTab === 'settings') {
      await refetchSettings();
    } else {
      // In a real app, this would fetch notifications from an API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    setRefreshing(false);
  };
  
  // Toggle notification setting
  const toggleSetting = (key: string, value: boolean) => {
    if (!notificationSettings) return;
    
    updateSettingsMutation.mutate({
      ...notificationSettings,
      [key]: value,
    });
  };
  
  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-100 dark:border-gray-700 ${
        !item.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onPress={() => {
        markAsRead(item.id);
        // In a real app, navigate to the relevant screen based on notification type
      }}
    >
      <View className="flex-row items-start">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          getNotificationIconBackground(item.type)
        }`}>
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color="#FFFFFF"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-gray-900 dark:text-white">
              {item.title}
            </Text>
            {!item.read && (
              <View className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </View>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            {item.message}
          </Text>
          <Text className="text-gray-500 dark:text-gray-500 text-xs mt-2">
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return 'home-outline';
      case 'price':
        return 'pricetag-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'reminder':
        return 'calendar-outline';
      default:
        return 'notifications-outline';
    }
  };
  
  // Get notification icon background based on type
  const getNotificationIconBackground = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-green-500';
      case 'price':
        return 'bg-purple-500';
      case 'message':
        return 'bg-blue-500';
      case 'reminder':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Render notification settings
  const renderNotificationSettings = () => {
    if (isLoadingSettings) {
      return <LoadingIndicator message="Loading notification settings..." />;
    }
    
    if (isErrorSettings) {
      return (
        <ErrorMessage
          message="Failed to load notification settings"
          onRetry={refetchSettings}
        />
      );
    }
    
    if (!notificationSettings) {
      return (
        <View className="p-6 items-center">
          <Text className="text-gray-600 dark:text-gray-400">
            No notification settings available
          </Text>
        </View>
      );
    }
    
    return (
      <View className="px-6 py-4">
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </Text>
        
        <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
          <View className="p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200 font-medium">
                Push Notifications
              </Text>
              <Switch
                value={notificationSettings.push_enabled ?? true}
                onValueChange={(value) => toggleSetting('push_enabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Receive notifications on your device
            </Text>
          </View>
          
          <View className="p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200 font-medium">
                Email Notifications
              </Text>
              <Switch
                value={notificationSettings.email_enabled ?? true}
                onValueChange={(value) => toggleSetting('email_enabled', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Receive notifications via email
            </Text>
          </View>
        </View>
        
        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Notification Types
        </Text>
        
        <View className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <View className="p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200">
                New Property Matches
              </Text>
              <Switch
                value={notificationSettings.property_matches ?? true}
                onValueChange={(value) => toggleSetting('property_matches', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <View className="p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200">
                Price Changes
              </Text>
              <Switch
                value={notificationSettings.price_changes ?? true}
                onValueChange={(value) => toggleSetting('price_changes', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <View className="p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200">
                New Messages
              </Text>
              <Switch
                value={notificationSettings.new_messages ?? true}
                onValueChange={(value) => toggleSetting('new_messages', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 dark:text-gray-200">
                Reminders
              </Text>
              <Switch
                value={notificationSettings.reminders ?? true}
                onValueChange={(value) => toggleSetting('reminders', value)}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </Text>
          
          <View style={{ width: 24 }} />
        </View>
        
        {/* Tabs */}
        <View className="flex-row mt-4">
          <TouchableOpacity
            className={`flex-1 py-2 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-primary-600 dark:border-primary-400'
                : 'border-b border-gray-200 dark:border-gray-700'
            }`}
            onPress={() => setActiveTab('notifications')}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'notifications'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Notifications
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary-600 dark:border-primary-400'
                : 'border-b border-gray-200 dark:border-gray-700'
            }`}
            onPress={() => setActiveTab('settings')}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'settings'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content */}
      {activeTab === 'notifications' ? (
        <>
          {/* Notification Actions */}
          {notifications.length > 0 && (
            <View className="flex-row justify-between items-center px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <TouchableOpacity onPress={markAllAsRead}>
                <Text className="text-primary-600 dark:text-primary-400">
                  Mark all as read
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={clearAllNotifications}>
                <Text className="text-red-500">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Notification List */}
          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#3B82F6']}
                  tintColor={isDark ? '#93C5FD' : '#3B82F6'}
                />
              }
            />
          ) : (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#3B82F6']}
                  tintColor={isDark ? '#93C5FD' : '#3B82F6'}
                />
              }
            >
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={isDark ? '#4B5563' : '#9CA3AF'}
              />
              <Text className="text-gray-600 dark:text-gray-400 text-lg font-medium mt-4 text-center">
                No notifications
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-center mt-2">
                You don't have any notifications yet.
                We'll notify you when there's something new.
              </Text>
            </ScrollView>
          )}
        </>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
              tintColor={isDark ? '#93C5FD' : '#3B82F6'}
            />
          }
        >
          {renderNotificationSettings()}
        </ScrollView>
      )}
    </View>
  );
};

export default NotificationsScreen;
