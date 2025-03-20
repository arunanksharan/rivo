import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { logger } from '@/utils/logger';
import { VoiceResponse } from '@/services/voice-assistant';

// Sample voice commands for suggestions
const SAMPLE_COMMANDS = [
  'Show me houses under $1 million',
  'Find apartments with 2+ bedrooms in downtown',
  'Schedule a viewing for tomorrow at 3 PM',
  'Add this property to my favorites',
  'Take a photo of this property',
  'Set a reminder for open house on Sunday',
  'Compare these two properties',
  "What's the market trend in this area?",
];

export default function VoiceAssistantScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    type: 'user' | 'assistant';
    text: string;
    timestamp: Date;
  }>>([
    {
      id: '1',
      type: 'assistant',
      text: 'Hello! I\'m your real estate voice assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  
  // Ref for scrolling to bottom of conversation
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Use the voice assistant hook
  const {
    isListening,
    isProcessing,
    transcript,
    response,
    error,
    startListening,
    stopListening,
    cancelListening,
    processTextCommand,
  } = useVoiceAssistant({
    onResponse: handleVoiceResponse,
  });
  
  // Start pulsing animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).stop();
    }
  }, [isListening, pulseAnim]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      logger.error('Voice assistant error', { error });
    }
  }, [error]);
  
  // Handle voice response
  function handleVoiceResponse(voiceResponse: VoiceResponse) {
    // Add assistant response to conversation
    addMessageToConversation('assistant', voiceResponse.response);
    
    // Handle action if applicable
    if (voiceResponse.action && voiceResponse.action !== 'none') {
      handleAssistantAction(voiceResponse.action, voiceResponse.params || {});
    }
  }
  
  // Add a message to the conversation history
  function addMessageToConversation(type: 'user' | 'assistant', text: string) {
    const newMessage = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    
    setConversationHistory(prev => [...prev, newMessage]);
    
    // Scroll to bottom after message is added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }
  
  // Handle assistant actions
  function handleAssistantAction(action: string, params: Record<string, any>) {
    logger.info('Handling assistant action', { action, params });
    
    switch (action) {
      case 'search':
        // Navigate to search screen with query
        setTimeout(() => {
          router.push({
            pathname: '/(app)/search',
            params: { query: params.query },
          });
        }, 1500);
        break;
      case 'schedule':
        // Navigate to schedule viewing screen
        setTimeout(() => {
          router.push({
            pathname: '/(app)/schedule-viewing',
            params: { propertyId: params.propertyId },
          });
        }, 1500);
        break;
      case 'favorite':
        // Add to favorites
        Alert.alert('Added to Favorites', 'Property has been added to your favorites.');
        break;
      case 'camera':
        // Open camera
        Alert.alert('Camera', 'Opening camera to take a photo of the property.');
        break;
      case 'map':
        // Navigate to map view
        setTimeout(() => {
          router.push('/(app)/map-view');
        }, 1500);
        break;
      default:
        logger.warn('Unknown action', { action });
        break;
    }
  }
  
  // Handle microphone button press
  const handleMicPress = async () => {
    try {
      if (isListening) {
        await stopListening();
      } else {
        await startListening();
      }
    } catch (error) {
      logger.error('Failed to handle mic press', error);
      Alert.alert('Error', 'Failed to process voice command. Please try again.');
    }
  };
  
  // Handle suggestion press
  const handleSuggestionPress = async (suggestion: string) => {
    try {
      // Add user message to conversation
      addMessageToConversation('user', suggestion);
      
      // Process the suggestion as a text command
      await processTextCommand(suggestion);
    } catch (error) {
      logger.error('Failed to process suggestion', error);
      Alert.alert('Error', 'Failed to process suggestion. Please try again.');
    }
  };
  
  // Handle text input submission
  const handleTextInputSubmit = async () => {
    if (!textInput.trim()) return;
    
    try {
      const text = textInput.trim();
      setTextInput('');
      
      // Add user message to conversation
      addMessageToConversation('user', text);
      
      // Process the text command
      await processTextCommand(text);
    } catch (error) {
      logger.error('Failed to process text input', error);
      Alert.alert('Error', 'Failed to process text command. Please try again.');
    }
  };
  
  // Render conversation history
  const renderConversationHistory = () => (
    <ScrollView
      ref={scrollViewRef}
      style={styles.conversationContainer}
      contentContainerStyle={styles.conversationContent}
      showsVerticalScrollIndicator={false}
    >
      {conversationHistory.map((message) => (
        <View
          key={message.id}
          style={[
            styles.messageContainer,
            message.type === 'user' ? styles.userMessage : styles.assistantMessage,
            message.type === 'user' 
              ? { backgroundColor: theme.colors.primary + '15' }
              : { backgroundColor: theme.colors.gray100 },
          ]}
        >
          <Text variant="body2">{message.text}</Text>
          <Text variant="caption" color={theme.colors.textLight} style={styles.messageTime}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      ))}
      
      {/* Show transcript while listening */}
      {isListening && transcript && (
        <View
          style={[
            styles.messageContainer,
            styles.userMessage,
            { backgroundColor: theme.colors.primary + '15', opacity: 0.7 }
          ]}
        >
          <Text variant="body2" style={styles.transcriptText}>{transcript}...</Text>
        </View>
      )}
      
      {/* Show processing indicator */}
      {isProcessing && (
        <View
          style={[
            styles.messageContainer,
            styles.assistantMessage,
            { backgroundColor: theme.colors.gray100 }
          ]}
        >
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text variant="body2" style={styles.processingText}>Processing...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
  
  // Render suggestions
  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text variant="subtitle2" style={styles.suggestionsTitle}>Try saying...</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContent}
      >
        {SAMPLE_COMMANDS.map((command, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionChip,
              { 
                backgroundColor: theme.colors.gray100,
                borderColor: theme.colors.gray300,
              }
            ]}
            onPress={() => handleSuggestionPress(command)}
            disabled={isListening || isProcessing}
          >
            <Text variant="body2">{command}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  // Render voice controls
  const renderVoiceControls = () => (
    <View style={styles.voiceControlsContainer}>
      {showTextInput ? (
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Type your message..."
            value={textInput}
            onChangeText={setTextInput}
            containerStyle={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={handleTextInputSubmit}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleTextInputSubmit}
            disabled={!textInput.trim() || isProcessing}
          >
            <Ionicons name="send" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.micButton,
            { backgroundColor: isListening ? theme.colors.error : theme.colors.primary }
          ]}
          onPress={handleMicPress}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.micButtonInner,
              { transform: [{ scale: isListening ? pulseAnim : 1 }] }
            ]}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={32}
              color={theme.colors.white}
            />
          </Animated.View>
        </TouchableOpacity>
      )}
      
      <Text variant="body2" color={theme.colors.textLight} style={styles.micInstructions}>
        {isListening 
          ? 'Listening... Tap to stop'
          : showTextInput 
            ? 'Type your message and press send'
            : 'Tap the microphone and speak'}
      </Text>
      
      <View style={styles.voiceActionsContainer}>
        <Button
          title={showTextInput ? "Use Voice" : "Type Instead"}
          variant="outline"
          onPress={() => setShowTextInput(!showTextInput)}
          leftIcon={
            <Ionicons 
              name={showTextInput ? "mic-outline" : "chatbubble-outline"} 
              size={20} 
              color={theme.colors.text} 
            />
          }
          style={styles.typeButton}
          disabled={isListening || isProcessing}
        />
        <Button
          title="Help"
          variant="outline"
          onPress={() => router.push('/(app)/voice-assistant-help')}
          leftIcon={<Ionicons name="help-circle-outline" size={20} color={theme.colors.text} />}
          style={styles.helpButton}
          disabled={isListening || isProcessing}
        />
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="h4">Voice Assistant</Text>
        <Text variant="body2" color={theme.colors.textLight}>
          Ask me anything about real estate
        </Text>
      </View>
      
      {renderConversationHistory()}
      {renderSuggestions()}
      {renderVoiceControls()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageTime: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
  },
  transcriptText: {
    fontStyle: 'italic',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingBottom: 8,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  voiceControlsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micInstructions: {
    textAlign: 'center',
    marginBottom: 24,
  },
  voiceActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  typeButton: {
    flex: 1,
    marginRight: 8,
  },
  helpButton: {
    flex: 1,
    marginLeft: 8,
  },
});
