import { useState, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { logger } from '@/utils/logger';

interface UseVoiceAssistantProps {
  onTranscriptComplete?: (transcript: string) => void;
  activationKeyword?: string;
}

interface UseVoiceAssistantReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  error: Error | null;
  isActivated: boolean;
}

/**
 * Hook for voice assistant functionality including speech recognition and text-to-speech
 */
export const useVoiceAssistant = (props?: UseVoiceAssistantProps): UseVoiceAssistantReturn => {
  const { 
    onTranscriptComplete,
    activationKeyword = 'Rivo Start'
  } = props || {};
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  
  // Reference to the recording object
  const recordingRef = useRef<Audio.Recording | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      
      if (isListening) {
        stopListening();
      }
      
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [isListening, isSpeaking]);
  
  /**
   * Start listening for voice input
   */
  const startListening = async (): Promise<void> => {
    try {
      setError(null);
      setIsListening(true);
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access microphone was denied');
      }
      
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // DoNotMix value
        interruptionModeAndroid: 1, // DoNotMix value
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      
      // In a real app, this would be connected to a speech-to-text service
      // For this example, we'll simulate it with a timeout
      setTimeout(() => {
        if (isListening) {
          // Simulate transcription result
          const mockTranscript = 'This is a beautiful property with a modern kitchen and spacious living room.';
          setTranscript(mockTranscript);
          
          // Call the completion callback if provided
          if (onTranscriptComplete) {
            onTranscriptComplete(mockTranscript);
          }
          
          // Stop listening automatically
          stopListening();
        }
      }, 3000);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Voice assistant error:', error);
      setError(error);
      setIsListening(false);
    }
  };
  
  /**
   * Stop listening for voice input
   */
  const stopListening = async (): Promise<void> => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        
        // In a real app, we would send the audio to a speech-to-text service here
        // and get back the transcript
        
        recordingRef.current = null;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Error stopping recording:', error);
      setError(error);
    } finally {
      setIsListening(false);
    }
  };
  
  /**
   * Speak text using text-to-speech
   */
  const speak = async (text: string): Promise<void> => {
    try {
      setIsSpeaking(true);
      
      await Speech.speak(text, {
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setIsSpeaking(false);
        },
        onError: (error) => {
          logger.error('Speech error:', error);
          setIsSpeaking(false);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logger.error('Text-to-speech error:', error);
      setError(error);
      setIsSpeaking(false);
    }
  };
  
  /**
   * Check if the transcript contains the activation keyword
   */
  useEffect(() => {
    if (transcript && transcript.toLowerCase().includes(activationKeyword.toLowerCase())) {
      setIsActivated(true);
    }
  }, [transcript, activationKeyword]);
  
  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
    isSpeaking,
    error,
    isActivated,
  };
};
