import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/providers/ThemeProvider';
import useVoiceStore from '@/store/useVoiceStore';
import LoadingIndicator from '@/components/atoms/LoadingIndicator';

/**
 * VoiceAssistantScreen component for voice interaction.
 * Allows users to interact with the app using voice commands.
 */
const VoiceAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  
  // Get voice state from store
  const { 
    settings, 
    isListening, 
    setIsListening, 
    commandHistory, 
    addCommand 
  } = useVoiceStore();
  
  // Local state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [processingCommand, setProcessingCommand] = useState(false);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow microphone access to use voice commands.');
        return;
      }
      
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsListening(true);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening) {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };
  
  // Stop recording and process command
  const stopRecording = async () => {
    if (!recording) return;
    
    setIsListening(false);
    setProcessingCommand(true);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        await processVoiceCommand(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setProcessingCommand(false);
    }
  };
  
  // Process the voice command
  const processVoiceCommand = async (audioUri: string) => {
    try {
      // In a real app, you would send the audio to a speech-to-text service
      // For this example, we'll simulate processing with a timeout
      
      // Simulate command processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate a recognized command (in a real app, this would come from the API)
      const simulatedCommand = "Show me properties in San Francisco";
      
      // Process the command (in a real app, this would be more sophisticated)
      const response = handleCommand(simulatedCommand);
      
      // Add to command history
      addCommand(simulatedCommand, response);
      
      // Speak the response
      if (settings.enabled) {
        Speech.speak(response, {
          language: 'en-US',
          voice: settings.voice_type === 'female' ? 'com.apple.ttsbundle.Samantha-compact' : 'com.apple.ttsbundle.Daniel-compact',
          volume: settings.volume,
          rate: 0.9,
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      addCommand("(Couldn't understand)", "I'm sorry, I couldn't understand that. Please try again.");
    } finally {
      setProcessingCommand(false);
    }
  };
  
  // Handle the recognized command
  const handleCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase();
    
    // Simple command handling logic
    if (lowerCommand.includes('show') && lowerCommand.includes('propert')) {
      // Extract location if present
      const locationMatch = lowerCommand.match(/in ([a-zA-Z\s]+)/);
      const location = locationMatch ? locationMatch[1] : null;
      
      if (location) {
        return `Showing properties in ${location}. I found 15 properties matching your criteria.`;
      } else {
        return "Showing all available properties. I found 42 properties for you.";
      }
    } else if (lowerCommand.includes('find') && lowerCommand.includes('bedroom')) {
      // Extract number of bedrooms
      const bedroomMatch = lowerCommand.match(/(\d+)\s*bedroom/);
      const bedrooms = bedroomMatch ? bedroomMatch[1] : null;
      
      if (bedrooms) {
        return `Searching for ${bedrooms} bedroom properties. I found 8 properties matching your criteria.`;
      } else {
        return "How many bedrooms are you looking for?";
      }
    } else if (lowerCommand.includes('price') || lowerCommand.includes('budget')) {
      return "I can help you find properties within your budget. What price range are you looking for?";
    } else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      return "I can help you search for properties, filter by criteria like bedrooms or price, save favorites, and more. Just ask me what you're looking for.";
    } else {
      return "I'm not sure how to help with that yet. You can ask me to show properties, find homes with specific features, or help with your search.";
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);
  
  // Render command history item
  const renderCommandItem = useCallback(({ item }) => (
    <View className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <View className="flex-row items-center mb-2">
        <Ionicons name="person-circle-outline" size={20} color={isDark ? '#D1D5DB' : '#6B7280'} />
        <Text className="ml-2 text-gray-700 dark:text-gray-300 font-medium">
          You
        </Text>
      </View>
      <Text className="text-gray-800 dark:text-gray-200 mb-4">
        {item.command}
      </Text>
      
      <View className="flex-row items-center mb-2">
        <Ionicons name="chatbox-ellipses-outline" size={20} color="#2563EB" />
        <Text className="ml-2 text-primary-600 dark:text-primary-400 font-medium">
          Rivo Assistant
        </Text>
      </View>
      <Text className="text-gray-800 dark:text-gray-200">
        {item.response}
      </Text>
    </View>
  ), [isDark]);
  
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white dark:bg-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-4"
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Voice Assistant
          </Text>
        </View>
      </View>
      
      {/* Command History */}
      <FlatList
        data={commandHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderCommandItem}
        contentContainerClassName="px-6 py-4"
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Ionicons
              name="mic-circle-outline"
              size={64}
              color={isDark ? '#D1D5DB' : '#9CA3AF'}
            />
            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
              Tap the microphone button and ask me about properties, search filters, or anything else you need help with.
            </Text>
          </View>
        }
      />
      
      {/* Voice Control Button */}
      <View className="absolute bottom-0 left-0 right-0 items-center pb-8 pt-4 bg-gray-50 dark:bg-gray-900">
        {processingCommand ? (
          <View className="items-center">
            <LoadingIndicator size="small" message="Processing your request..." />
          </View>
        ) : (
          <TouchableOpacity
            className={`w-16 h-16 rounded-full items-center justify-center ${
              isListening ? 'bg-red-500' : 'bg-primary-600'
            }`}
            onPress={isListening ? stopRecording : startRecording}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isListening ? 'stop' : 'mic'}
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
        
        <Text className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {isListening ? 'Listening...' : 'Tap to speak'}
        </Text>
      </View>
    </View>
  );
};

export default VoiceAssistantScreen;
