import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/store/AuthContext';
import { AuthUser } from '@/types/auth';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(true);
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  };
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              console.error('Sign out error:', error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            // In a real app, we would call an API to delete the account
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileImageContainer}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Text variant="h4" color={theme.colors.white}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
        )}
        {isEditing && (
          <TouchableOpacity 
            style={[styles.editImageButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // In a real app, we would open an image picker
              Alert.alert('Feature Coming Soon', 'Profile image upload will be available soon.');
            }}
          >
            <Ionicons name="camera" size={16} color={theme.colors.white} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.profileInfo}>
        {!isEditing ? (
          <>
            <Text variant="h4">{user?.firstName} {user?.lastName}</Text>
            <Text variant="body2" color={theme.colors.textLight}>{user?.email}</Text>
            {user?.phone && (
              <Text variant="body2" color={theme.colors.textLight}>{user?.phone}</Text>
            )}
          </>
        ) : (
          <View style={styles.editProfileForm}>
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              containerStyle={styles.formInput}
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              containerStyle={styles.formInput}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              editable={false}
              containerStyle={styles.formInput}
            />
            <TextInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              containerStyle={styles.formInput}
              keyboardType="phone-pad"
            />
            
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setIsEditing(false);
                  setFirstName(user?.firstName || '');
                  setLastName(user?.lastName || '');
                  setPhone(user?.phone || '');
                }}
                style={styles.cancelButton}
              />
              <Button
                title="Save"
                onPress={handleSaveProfile}
                style={styles.saveButton}
              />
            </View>
          </View>
        )}
      </View>
      
      {!isEditing && (
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderAccountSection = () => (
    <Card style={styles.section}>
      <Text variant="subtitle1" style={styles.sectionTitle}>Account</Text>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/saved-properties')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="heart-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Saved Properties</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/saved-searches')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="search-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Saved Searches</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/viewing-history')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Viewing History</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/scheduled-viewings')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Scheduled Viewings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
    </Card>
  );
  
  const renderPreferencesSection = () => (
    <Card style={styles.section}>
      <Text variant="subtitle1" style={styles.sectionTitle}>Preferences</Text>
      
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="body1">Push Notifications</Text>
            <Text variant="caption" color={theme.colors.textLight}>
              Receive notifications about new properties and updates
            </Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: theme.colors.gray300, true: theme.colors.primary + '70' }}
          thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.gray500}
        />
      </View>
      
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="body1">Email Updates</Text>
            <Text variant="caption" color={theme.colors.textLight}>
              Receive emails about new properties and market updates
            </Text>
          </View>
        </View>
        <Switch
          value={emailUpdatesEnabled}
          onValueChange={setEmailUpdatesEnabled}
          trackColor={{ false: theme.colors.gray300, true: theme.colors.primary + '70' }}
          thumbColor={emailUpdatesEnabled ? theme.colors.primary : theme.colors.gray500}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/notification-settings')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Notification Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
    </Card>
  );
  
  const renderSupportSection = () => (
    <Card style={styles.section}>
      <Text variant="subtitle1" style={styles.sectionTitle}>Support</Text>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/help-center')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Help Center</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/contact-support')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Contact Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/privacy-policy')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="shield-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => router.push('/(app)/terms-of-service')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuItemIcon, { backgroundColor: theme.colors.primary + '10' }]}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text variant="body1">Terms of Service</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray500} />
      </TouchableOpacity>
    </Card>
  );
  
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        title="Sign Out"
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOutButton}
        leftIcon={<Ionicons name="log-out-outline" size={20} color={theme.colors.text} />}
      />
      
      <Button
        title="Delete Account"
        variant="outline"
        onPress={handleDeleteAccount}
        style={[styles.deleteAccountButton, { borderColor: theme.colors.error }]}
        textStyle={{ color: theme.colors.error }}
        leftIcon={<Ionicons name="trash-outline" size={20} color={theme.colors.error} />}
      />
    </View>
  );
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {renderProfileHeader()}
      
      {!isEditing && (
        <>
          {renderAccountSection()}
          {renderPreferencesSection()}
          {renderSupportSection()}
          {renderActionButtons()}
          
          <View style={styles.appInfo}>
            <Text variant="caption" color={theme.colors.textLight} style={styles.appVersion}>
              Rivo Real Estate v1.0.0
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editProfileForm: {
    width: '100%',
  },
  formInput: {
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    marginBottom: 12,
  },
  deleteAccountButton: {
    marginBottom: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appVersion: {
    textAlign: 'center',
  },
});
