import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { NavigationContainer } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';

// Screens
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import SavedScreen from '@/screens/SavedScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import PropertyDetailsScreen from '@/screens/PropertyDetailsScreen';
import VoiceAssistantScreen from '@/screens/VoiceAssistantScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import VoiceAssistantSettingsScreen from '@/screens/VoiceAssistantSettingsScreen';
import ChangePasswordScreen from '@/screens/ChangePasswordScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import LoadingScreen from '@/screens/LoadingScreen';

// Type definitions for navigation
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  PropertyDetails: { propertyId: string };
  VoiceAssistant: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  VoiceAssistantSettings: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Search: undefined;
  Saved: undefined;
  Profile: undefined;
};

// Create navigation stacks
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const MainTabs = createBottomTabNavigator();

// Auth navigator component
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

// Main tabs navigator component
const MainTabsNavigator = () => {
  const { isDark } = useTheme();
  
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// Main navigator component
const MainNavigator = () => (
  <MainStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <MainStack.Screen name="MainTabs" component={MainTabsNavigator} />
    <MainStack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
    <MainStack.Screen name="VoiceAssistant" component={VoiceAssistantScreen} />
    <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
    <MainStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <MainStack.Screen name="Notifications" component={NotificationsScreen} />
    <MainStack.Screen name="VoiceAssistantSettings" component={VoiceAssistantSettingsScreen} />
  </MainStack.Navigator>
);

// Root navigator component
export const Navigation = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return <NavigationContainer>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
};

// Keep the default export for backward compatibility
export default Navigation;
