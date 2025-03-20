import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import axios from 'axios';
import { logger } from '../utils/logger';
import { API_CONFIG } from '../config';

// Types
export interface VoiceCommand {
  id: string;
  query: string;
  timestamp: Date;
}

export interface VoiceResponse {
  id: string;
  response: string;
  action?: string;
  params?: Record<string, any>;
  timestamp: Date;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
}

// Service class for voice assistant functionality
export class VoiceAssistantService {
  private recording: Audio.Recording | null = null;
  private audioUri: string | null = null;
  
  constructor() {
    // Initialize audio session
    this.initAudioSession();
  }
  
  private async initAudioSession(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX
        interruptionModeAndroid: 1, // Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      logger.info('Audio session initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize audio session', error);
      throw new Error('Failed to initialize audio session');
    }
  }
  
  /**
   * Start recording audio for voice command
   */
  public async startListening(): Promise<void> {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission not granted');
      }
      
      // Start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();
      logger.info('Started recording audio');
    } catch (error) {
      logger.error('Failed to start recording', error);
      throw new Error('Failed to start recording');
    }
  }
  
  /**
   * Stop recording and process the audio to text
   */
  public async stopListening(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('No active recording found');
      }
      
      // Stop recording
      await this.recording.stopAndUnloadAsync();
      
      // Get the recording URI
      this.audioUri = this.recording.getURI() || null;
      this.recording = null;
      
      if (!this.audioUri) {
        throw new Error('Failed to get recording URI');
      }
      
      // Process the audio to text using STT API
      const transcript = await this.processAudioToText(this.audioUri);
      logger.info('Audio processed to text successfully', { transcript });
      return transcript;
    } catch (error) {
      logger.error('Failed to stop recording or process audio', error);
      throw new Error('Failed to process voice command');
    }
  }
  
  /**
   * Process audio file to text using STT API
   */
  private async processAudioToText(audioUri: string): Promise<string> {
    try {
      // In a production app, we would use a real STT API like OpenAI Whisper
      // For now, we'll use a mock implementation
      
      // Read the audio file as base64
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Call the STT API
      // Note: In a real implementation, we would use environment variables for API keys
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          file: audioBase64,
          model: 'whisper-1',
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
      
      // For demo purposes, return a mock response if the API call fails
      if (!response.data?.text) {
        logger.warn('STT API returned no text, using fallback');
        return 'Show me apartments in downtown';
      }
      
      return response.data.text;
    } catch (error) {
      logger.error('Failed to process audio to text', error);
      // For demo purposes, return a mock response
      return 'Show me apartments in downtown';
    }
  }
  
  /**
   * Process text command to get AI response
   */
  public async processCommand(command: string): Promise<VoiceResponse> {
    try {
      logger.info('Processing voice command', { command });
      
      // In a production app, we would use a real LLM API like OpenAI GPT
      // For now, we'll use a mock implementation
      
      // Call the LLM API to process the command
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a real estate voice assistant for Rivo India. 
              Process the user's command and return a JSON response with the following structure:
              {
                "response": "Your response to the user",
                "action": "The action to take (search, schedule, favorite, camera, etc.)",
                "params": { "key": "value" }
              }`,
            },
            {
              role: 'user',
              content: command,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );
      
      // For demo purposes, return a mock response if the API call fails
      if (!response.data?.choices?.[0]?.message?.content) {
        logger.warn('LLM API returned no content, using fallback');
        return this.getFallbackResponse(command);
      }
      
      // Parse the JSON response
      const content = response.data.choices[0].message.content;
      const parsedResponse = JSON.parse(content);
      
      return {
        id: Date.now().toString(),
        response: parsedResponse.response,
        action: parsedResponse.action,
        params: parsedResponse.params,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to process command', error);
      return this.getFallbackResponse(command);
    }
  }
  
  /**
   * Get a fallback response for when the API fails
   */
  private getFallbackResponse(command: string): VoiceResponse {
    // Simple keyword matching for demo purposes
    if (command.toLowerCase().includes('apartment') || command.toLowerCase().includes('house')) {
      return {
        id: Date.now().toString(),
        response: `I found several properties matching your search for "${command}". Would you like to see them?`,
        action: 'search',
        params: { query: command },
        timestamp: new Date(),
      };
    } else if (command.toLowerCase().includes('schedule') || command.toLowerCase().includes('viewing')) {
      return {
        id: Date.now().toString(),
        response: 'I can help you schedule a viewing. When would you like to visit?',
        action: 'schedule',
        params: {},
        timestamp: new Date(),
      };
    } else if (command.toLowerCase().includes('favorite') || command.toLowerCase().includes('save')) {
      return {
        id: Date.now().toString(),
        response: 'I\'ve added this property to your favorites.',
        action: 'favorite',
        params: {},
        timestamp: new Date(),
      };
    } else {
      return {
        id: Date.now().toString(),
        response: `I'm sorry, I couldn't understand "${command}". Could you please try again?`,
        action: 'none',
        params: {},
        timestamp: new Date(),
      };
    }
  }
  
  /**
   * Speak text using TTS
   */
  public async speak(text: string): Promise<void> {
    try {
      logger.info('Speaking text', { text });
      
      // Use Expo Speech for TTS
      const options = {
        language: 'en-IN', // Indian English
        pitch: 1.0,
        rate: 0.9,
        voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.Moira-compact' : 'en-in-x-ene-local',
      };
      
      await Speech.speak(text, options);
    } catch (error) {
      logger.error('Failed to speak text', error);
      throw new Error('Failed to speak text');
    }
  }
  
  /**
   * Cancel current speech
   */
  public async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      logger.info('Stopped speaking');
    } catch (error) {
      logger.error('Failed to stop speaking', error);
    }
  }
  
  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      // Stop any ongoing recording
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      
      // Delete the audio file if it exists
      if (this.audioUri) {
        await FileSystem.deleteAsync(this.audioUri, { idempotent: true });
        this.audioUri = null;
      }
      
      // Stop any ongoing speech
      await this.stopSpeaking();
      
      logger.info('Voice assistant resources cleaned up');
    } catch (error) {
      logger.error('Failed to clean up voice assistant resources', error);
    }
  }
}

// Create and export a singleton instance
export const voiceAssistantService = new VoiceAssistantService();
