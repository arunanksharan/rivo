import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { useAuth } from './AuthProvider';

// Define voice assistant context type
interface VoiceAssistantContextType {
  isEnabled: boolean;
  isSpeaking: boolean;
  voiceType: string;
  toggleVoiceAssistant: () => void;
  setVoiceAssistantEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  setVoiceType: (voiceType: string) => void;
  availableVoices: Voice[];
}

// Voice type definition
interface Voice {
  id: string;
  name: string;
  language: string;
  quality?: string;
}

// Speech type definitions
interface SpeechVoice {
  identifier?: string;
  name: string;
  language: string;
  quality?: string;
}

interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

// Default voices for different platforms
const DEFAULT_VOICES: Record<string, Voice[]> = {
  ios: [
    {
      id: 'com.apple.voice.enhanced.en-US.Samantha',
      name: 'Samantha',
      language: 'en-US',
      quality: 'enhanced',
    },
    {
      id: 'com.apple.voice.premium.en-US.Evan',
      name: 'Evan',
      language: 'en-US',
      quality: 'premium',
    },
  ],
  android: [
    { id: 'en-us-x-sfg#female_1', name: 'Female Voice', language: 'en-US' },
    { id: 'en-us-x-sfg#male_1', name: 'Male Voice', language: 'en-US' },
  ],
  default: [{ id: 'default', name: 'Default Voice', language: 'en-US' }],
};

// Voice assistant provider props
interface VoiceAssistantProviderProps {
  children: ReactNode;
}

// Create voice assistant context
const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

/**
 * VoiceAssistantProvider component that manages voice assistant functionality.
 * Provides voice assistant context to all child components.
 */
export const VoiceAssistantProvider: React.FC<VoiceAssistantProviderProps> = ({ children }) => {
  // Get auth context
  const { user } = useAuth();

  // Initialize state
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceType, setVoiceType] = useState<string>('default');
  const [availableVoices, setAvailableVoices] = useState<Voice[]>(
    DEFAULT_VOICES[Platform.OS] || DEFAULT_VOICES.default,
  );

  // Load voice assistant settings from storage on mount
  useEffect(() => {
    const loadVoiceAssistantSettings = async (): Promise<void> => {
      try {
        const storedSettings = await AsyncStorage.getItem('@voice_assistant_settings');

        if (storedSettings !== null) {
          const settings = JSON.parse(storedSettings);
          setIsEnabled(settings.isEnabled);
          setVoiceType(settings.voiceType || 'default');
        }
      } catch (error) {
        console.error('Error loading voice assistant settings:', error);
      }
    };

    loadVoiceAssistantSettings();

    // Load available voices from the device
    const loadAvailableVoices = async (): Promise<void> => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (voices && voices.length > 0) {
          const formattedVoices: Voice[] = voices.map((voice: SpeechVoice) => ({
            id: voice.identifier || voice.name,
            name: voice.name,
            language: voice.language,
            quality: voice.quality,
          }));
          setAvailableVoices(formattedVoices);
        }
      } catch (error) {
        console.error('Error loading available voices:', error);
        // Fallback to default voices
        setAvailableVoices(DEFAULT_VOICES[Platform.OS] || DEFAULT_VOICES.default);
      }
    };

    loadAvailableVoices();

    // Clean up speech when component unmounts
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [isSpeaking]);

  // Save voice assistant settings when they change
  useEffect(() => {
    const saveVoiceAssistantSettings = async (): Promise<void> => {
      try {
        const settings = {
          isEnabled,
          voiceType,
        };
        await AsyncStorage.setItem('@voice_assistant_settings', JSON.stringify(settings));

        // If user is logged in, sync settings with backend
        if (user) {
          // This would be an API call to update user preferences
          // For now, we'll just log it
          console.log('Syncing voice assistant settings with backend for user:', user.id);
        }
      } catch (error) {
        console.error('Error saving voice assistant settings:', error);
      }
    };

    saveVoiceAssistantSettings();
  }, [isEnabled, voiceType, user]);

  // Toggle voice assistant
  const toggleVoiceAssistant = (): void => {
    setIsEnabled((prev) => !prev);
  };

  // Set voice assistant enabled state
  const setVoiceAssistantEnabled = (enabled: boolean): void => {
    setIsEnabled(enabled);
  };

  // Speak text
  const speak = async (text: string): Promise<void> => {
    if (!isEnabled) return;

    try {
      // Stop any ongoing speech
      if (isSpeaking) {
        await Speech.stop();
      }

      // Set options based on selected voice type
      const options: SpeechOptions = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      };

      // If voice type is not default, set the voice
      if (voiceType !== 'default') {
        options.voice = voiceType;
      }

      // Start speaking
      setIsSpeaking(true);

      await Speech.speak(text, {
        ...options,
        onDone: () => setIsSpeaking(false),
        onError: (error: Error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
        },
      });
    } catch (error) {
      console.error('Error speaking:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = async (): Promise<void> => {
    if (isSpeaking) {
      try {
        await Speech.stop();
        setIsSpeaking(false);
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  };

  // Context value
  const contextValue: VoiceAssistantContextType = {
    isEnabled,
    isSpeaking,
    voiceType,
    toggleVoiceAssistant,
    setVoiceAssistantEnabled,
    speak,
    stopSpeaking,
    setVoiceType,
    availableVoices,
  };

  // Render provider
  return (
    <VoiceAssistantContext.Provider value={contextValue}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};

/**
 * Custom hook to use the voice assistant context.
 * @returns VoiceAssistantContextType
 * @throws Error if used outside of VoiceAssistantProvider
 */
export const useVoiceAssistant = (): VoiceAssistantContextType => {
  const context = useContext(VoiceAssistantContext);

  if (context === undefined) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }

  return context;
};
