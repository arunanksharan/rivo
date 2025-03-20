import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTheme } from '../providers/ThemeProvider';
import { useVoiceAssistant } from '../providers/VoiceAssistantProvider';
import { useAuth } from '../providers/AuthProvider';

// Define types for voice preferences
interface VoicePreferences {
  voice_assistant_enabled: boolean;
  voice_type: string;
}

// Define the updateUserPreferences function if it doesn't exist in the API
const updateUserPreferences = async (preferences: VoicePreferences): Promise<VoicePreferences> => {
  try {
    // This is a placeholder implementation - in a real app, this would make an API call
    console.log('Updating user preferences:', preferences);
    return preferences;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * VoiceAssistantSettingsScreen component for managing voice assistant settings
 */
const VoiceAssistantSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { user, updateProfile } = useAuth();
  const {
    isEnabled,
    voiceType,
    toggleVoiceAssistant,
    setVoiceType,
    availableVoices,
    speak,
  } = useVoiceAssistant();

  // Local state for voice selection
  const [selectedVoice, setSelectedVoice] = useState<string>(voiceType);
  const [isTestingSpeech, setIsTestingSpeech] = useState<boolean>(false);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Mutation for updating user preferences
  const { mutate: updatePreferences, isLoading } = useMutation({
    mutationFn: (preferences: VoicePreferences) => updateUserPreferences(preferences),
    onSuccess: _data => {
      // Update local user data
      if (user) {
        // Update profile with new preferences
        updateProfile({
          // In a real app, we would structure this according to the UserProfile type
          // For now, we'll use a simple full_name update to avoid type errors
          full_name: user.user_metadata?.full_name || '',
        });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: error => {
      console.error('Error updating voice assistant preferences:', error);
    },
  });

  // Save changes to voice assistant settings
  const saveChanges = () => {
    // Update local storage via provider
    setVoiceType(selectedVoice);

    // Update backend if user is logged in
    if (user) {
      updatePreferences({
        voice_assistant_enabled: isEnabled,
        voice_type: selectedVoice,
      });
    }

    // Navigate back
    navigation.goBack();
  };

  // Test selected voice
  const testVoice = async (voiceId: string) => {
    setIsTestingSpeech(true);

    try {
      // Temporarily set the voice type for testing
      setVoiceType(voiceId);

      // Speak test message
      await speak('This is a test of the voice assistant. How does this sound?');
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setIsTestingSpeech(false);

      // Reset to the previously selected voice
      setVoiceType(voiceType);
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
    },
    title: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    sectionTitle: {
      color: isDark ? '#E5E7EB' : '#374151',
    },
    text: {
      color: isDark ? '#D1D5DB' : '#4B5563',
    },
    card: {
      backgroundColor: isDark ? '#374151' : '#FFFFFF',
      shadowColor: isDark ? '#000000' : '#6B7280',
    },
    separator: {
      backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
    },
    voiceItem: {
      backgroundColor: isDark ? '#4B5563' : '#F3F4F6',
    },
    voiceItemSelected: {
      backgroundColor: isDark ? '#3B82F6' : '#DBEAFE',
    },
    voiceItemText: {
      color: isDark ? '#F9FAFB' : '#1F2937',
    },
    voiceItemTextSelected: {
      color: isDark ? '#FFFFFF' : '#1D4ED8',
    },
    button: {
      backgroundColor: '#3B82F6',
    },
    buttonDisabled: {
      backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#F9FAFB' : '#1F2937'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.title]}>Voice Assistant Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Enable/Disable Voice Assistant */}
        <View style={[styles.card, dynamicStyles.card]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, dynamicStyles.sectionTitle]}>Voice Assistant</Text>
              <Text style={[styles.settingDescription, dynamicStyles.text]}>
                Enable or disable the voice assistant feature
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={toggleVoiceAssistant}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isEnabled ? '#3B82F6' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* Voice Selection */}
        {isEnabled && (
          <View style={[styles.card, dynamicStyles.card, styles.voiceCard]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Select Voice</Text>
            <Text style={[styles.sectionDescription, dynamicStyles.text]}>
              Choose a voice for your assistant
            </Text>

            <View style={styles.voiceList}>
              {availableVoices.map(voice => (
                <TouchableOpacity
                  key={voice.id}
                  style={[
                    styles.voiceItem,
                    selectedVoice === voice.id
                      ? dynamicStyles.voiceItemSelected
                      : dynamicStyles.voiceItem,
                  ]}
                  onPress={() => setSelectedVoice(voice.id)}
                >
                  <View style={styles.voiceItemContent}>
                    <View style={styles.voiceItemInfo}>
                      <Text
                        style={[
                          styles.voiceItemName,
                          selectedVoice === voice.id
                            ? dynamicStyles.voiceItemTextSelected
                            : dynamicStyles.voiceItemText,
                        ]}
                      >
                        {voice.name}
                      </Text>
                      <Text style={[styles.voiceItemLanguage, dynamicStyles.text]}>
                        {voice.language}
                        {voice.quality ? ` • ${voice.quality}` : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.testButton}
                      onPress={() => testVoice(voice.id)}
                      disabled={isTestingSpeech}
                    >
                      {isTestingSpeech && selectedVoice === voice.id ? (
                        <ActivityIndicator size="small" color="#3B82F6" />
                      ) : (
                        <Ionicons name="play" size={18} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Additional Settings (if needed) */}
        {isEnabled && (
          <View style={[styles.card, dynamicStyles.card]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Advanced Settings</Text>

            {/* Speech Rate */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, dynamicStyles.sectionTitle]}>Speech Rate</Text>
                <Text style={[styles.settingDescription, dynamicStyles.text]}>Normal</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.separator, dynamicStyles.separator]} />

            {/* Speech Pitch */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, dynamicStyles.sectionTitle]}>Speech Pitch</Text>
                <Text style={[styles.settingDescription, dynamicStyles.text]}>Normal</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            isLoading ? dynamicStyles.buttonDisabled : dynamicStyles.button,
          ]}
          onPress={saveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  voiceCard: {
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  voiceList: {
    marginTop: 8,
  },
  voiceItem: {
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  voiceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  voiceItemInfo: {
    flex: 1,
  },
  voiceItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  voiceItemLanguage: {
    fontSize: 12,
  },
  testButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VoiceAssistantSettingsScreen;
