import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { voiceAssistantService, VoiceCommand, VoiceResponse } from '@/services/voice-assistant';
import { logger } from '@/utils/logger';

interface UseVoiceAssistantProps {
  onResponse?: (response: VoiceResponse) => void;
  autoSpeak?: boolean;
}

interface UseVoiceAssistantReturn {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  response: VoiceResponse | null;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
  processTextCommand: (text: string) => Promise<void>;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
}

/**
 * Custom hook for using the voice assistant service
 * 
 * @param onResponse - Optional callback for when a response is received
 * @param autoSpeak - Whether to automatically speak responses
 * @returns Voice assistant state and methods
 */
export function useVoiceAssistant({
  onResponse,
  autoSpeak = true,
}: UseVoiceAssistantProps = {}): UseVoiceAssistantReturn {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  // Clean up resources when app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background, clean up resources
        try {
          await voiceAssistantService.cleanup();
          setIsListening(false);
          setIsProcessing(false);
        } catch (error) {
          logger.error('Failed to clean up voice assistant resources', error);
        }
      }
      
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      voiceAssistantService.cleanup().catch(error => {
        logger.error('Failed to clean up voice assistant resources', error);
      });
    };
  }, []);
  
  // Start listening for voice commands
  const startListening = useCallback(async () => {
    try {
      setError(null);
      setIsListening(true);
      await voiceAssistantService.startListening();
      logger.info('Started listening for voice commands');
    } catch (error) {
      setIsListening(false);
      setError('Failed to start listening. Please check microphone permissions.');
      logger.error('Failed to start listening', error);
    }
  }, []);
  
  // Stop listening and process the voice command
  const stopListening = useCallback(async () => {
    try {
      if (!isListening) return;
      
      setIsListening(false);
      setIsProcessing(true);
      
      // Process the audio to text
      const text = await voiceAssistantService.stopListening();
      setTranscript(text);
      
      // Process the text command
      await processCommand(text);
    } catch (error) {
      setIsProcessing(false);
      setError('Failed to process voice command. Please try again.');
      logger.error('Failed to process voice command', error);
    }
  }, [isListening]);
  
  // Cancel listening without processing
  const cancelListening = useCallback(async () => {
    try {
      setIsListening(false);
      setIsProcessing(false);
      await voiceAssistantService.cleanup();
      logger.info('Cancelled listening');
    } catch (error) {
      setError('Failed to cancel listening.');
      logger.error('Failed to cancel listening', error);
    }
  }, []);
  
  // Process a text command directly
  const processTextCommand = useCallback(async (text: string) => {
    try {
      setTranscript(text);
      setIsProcessing(true);
      await processCommand(text);
    } catch (error) {
      setIsProcessing(false);
      setError('Failed to process text command. Please try again.');
      logger.error('Failed to process text command', error);
    }
  }, []);
  
  // Internal method to process a command
  const processCommand = async (text: string) => {
    try {
      // Process the command
      const voiceResponse = await voiceAssistantService.processCommand(text);
      
      // Update state
      setResponse(voiceResponse);
      setIsProcessing(false);
      
      // Call the onResponse callback if provided
      if (onResponse) {
        onResponse(voiceResponse);
      }
      
      // Speak the response if autoSpeak is enabled
      if (autoSpeak) {
        await voiceAssistantService.speak(voiceResponse.response);
      }
      
      return voiceResponse;
    } catch (error) {
      setIsProcessing(false);
      setError('Failed to process command. Please try again.');
      logger.error('Failed to process command', error);
      throw error;
    }
  };
  
  // Speak text
  const speak = useCallback(async (text: string) => {
    try {
      await voiceAssistantService.speak(text);
    } catch (error) {
      setError('Failed to speak text.');
      logger.error('Failed to speak text', error);
    }
  }, []);
  
  // Stop speaking
  const stopSpeaking = useCallback(async () => {
    try {
      await voiceAssistantService.stopSpeaking();
    } catch (error) {
      logger.error('Failed to stop speaking', error);
    }
  }, []);
  
  return {
    isListening,
    isProcessing,
    transcript,
    response,
    error,
    startListening,
    stopListening,
    cancelListening,
    processTextCommand,
    speak,
    stopSpeaking,
  };
}
