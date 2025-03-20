import { create } from 'zustand';
import { DEFAULT_VOICE_SETTINGS } from '@/utils/constants';

interface VoiceState {
  // Voice assistant settings
  settings: {
    enabled: boolean;
    wake_word: string;
    voice_type: 'male' | 'female';
    volume: number;
  };
  updateSettings: (settings: Partial<VoiceState['settings']>) => void;
  
  // Voice assistant state
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  
  // Voice commands history
  commandHistory: Array<{
    id: string;
    command: string;
    response: string;
    timestamp: number;
  }>;
  addCommand: (command: string, response: string) => void;
  clearCommandHistory: () => void;
}

/**
 * Voice store for managing voice assistant related state.
 * Uses Zustand for state management.
 */
const useVoiceStore = create<VoiceState>((set) => ({
  // Voice settings with defaults
  settings: DEFAULT_VOICE_SETTINGS,
  updateSettings: (newSettings) => 
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  
  // Voice assistant state
  isListening: false,
  setIsListening: (isListening) => set({ isListening }),
  
  // Voice commands history
  commandHistory: [],
  addCommand: (command, response) => 
    set((state) => ({
      commandHistory: [
        {
          id: Date.now().toString(),
          command,
          response,
          timestamp: Date.now(),
        },
        ...state.commandHistory,
      ],
    })),
  clearCommandHistory: () => set({ commandHistory: [] }),
}));

export default useVoiceStore;
