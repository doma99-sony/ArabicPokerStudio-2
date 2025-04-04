import { create } from 'zustand';
import { useEffect, useRef } from 'react';

// Define sound categories
type SoundCategory = 'ui' | 'game' | 'ambient' | 'win' | 'notification';

// Define sound IDs
type SoundId = 
  // UI sounds
  | 'button_click'
  | 'menu_open'
  | 'menu_close'
  
  // Game action sounds
  | 'card_deal'
  | 'card_flip'
  | 'chip_stack'
  | 'chip_toss'
  | 'check'
  | 'fold'
  | 'raise'
  | 'call'
  | 'all_in'
  | 'turn_start'
  | 'shuffle'
  
  // Ambient sounds
  | 'casino_ambient'
  | 'arabic_music'
  | 'table_ambient'
  
  // Win/lose sounds
  | 'win_hand'
  | 'lose_hand'
  | 'win_pot'
  | 'celebration'
  
  // Notification sounds
  | 'message'
  | 'alert'
  | 'time_warning';

// Define sound paths - these will be loaded from the public directory
const soundPaths: Record<SoundId, string> = {
  // UI sounds
  button_click: '/sounds/ui/button_click.mp3',
  menu_open: '/sounds/ui/menu_open.mp3',
  menu_close: '/sounds/ui/menu_close.mp3',
  
  // Game action sounds
  card_deal: '/sounds/game/card_deal.mp3',
  card_flip: '/sounds/game/card_flip.mp3',
  chip_stack: '/sounds/game/chip_stack.mp3',
  chip_toss: '/sounds/game/chip_toss.mp3',
  check: '/sounds/game/check.mp3',
  fold: '/sounds/game/fold.mp3',
  raise: '/sounds/game/raise.mp3',
  call: '/sounds/game/call.mp3',
  all_in: '/sounds/game/all_in.mp3',
  turn_start: '/sounds/game/turn_start.mp3',
  shuffle: '/sounds/game/shuffle.mp3',
  
  // Ambient sounds
  casino_ambient: '/sounds/ambient/casino_ambient.mp3',
  arabic_music: '/sounds/ambient/arabic_music.mp3',
  table_ambient: '/sounds/ambient/table_ambient.mp3',
  
  // Win/lose sounds
  win_hand: '/sounds/win/win_hand.mp3',
  lose_hand: '/sounds/win/lose_hand.mp3',
  win_pot: '/sounds/win/win_pot.mp3',
  celebration: '/sounds/win/celebration.mp3',
  
  // Notification sounds
  message: '/sounds/notification/message.mp3',
  alert: '/sounds/notification/alert.mp3',
  time_warning: '/sounds/notification/time_warning.mp3'
};

// Map each sound ID to its category
const soundCategories: Record<SoundId, SoundCategory> = {
  button_click: 'ui',
  menu_open: 'ui',
  menu_close: 'ui',
  
  card_deal: 'game',
  card_flip: 'game',
  chip_stack: 'game',
  chip_toss: 'game',
  check: 'game',
  fold: 'game',
  raise: 'game',
  call: 'game',
  all_in: 'game',
  turn_start: 'game',
  shuffle: 'game',
  
  casino_ambient: 'ambient',
  arabic_music: 'ambient',
  table_ambient: 'ambient',
  
  win_hand: 'win',
  lose_hand: 'win',
  win_pot: 'win',
  celebration: 'win',
  
  message: 'notification',
  alert: 'notification',
  time_warning: 'notification'
};

// Define the state interface for volume and mute settings
interface SoundState {
  masterVolume: number;
  categoryVolumes: Record<SoundCategory, number>;
  isMuted: boolean;
  categoryMuted: Record<SoundCategory, boolean>;
  
  // Methods
  setMasterVolume: (volume: number) => void;
  setCategoryVolume: (category: SoundCategory, volume: number) => void;
  toggleMute: () => void;
  toggleCategoryMute: (category: SoundCategory) => void;
  resetSettings: () => void;
}

// Use Zustand to create a store for managing sound settings
export const useSoundStore = create<SoundState>((set) => {
  // Try to load settings from localStorage
  let savedSettings;
  try {
    const savedData = localStorage.getItem('soundSettings');
    if (savedData) {
      savedSettings = JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Failed to load sound settings:', error);
  }
  
  // Default settings
  const defaultState = {
    masterVolume: 0.5,
    categoryVolumes: {
      ui: 0.7,
      game: 0.8,
      ambient: 0.3,
      win: 0.8,
      notification: 0.6,
    },
    isMuted: false,
    categoryMuted: {
      ui: false,
      game: false,
      ambient: false,
      win: false,
      notification: false,
    },
  };
  
  // Merge saved settings with defaults
  const initialState = savedSettings ? { ...defaultState, ...savedSettings } : defaultState;
  
  return {
    // State
    ...initialState,
    
    // Methods
    setMasterVolume: (volume: number) => 
      set((state) => {
        const newState = { ...state, masterVolume: volume };
        localStorage.setItem('soundSettings', JSON.stringify(newState));
        return newState;
      }),
      
    setCategoryVolume: (category: SoundCategory, volume: number) => 
      set((state) => {
        const newCategoryVolumes = { ...state.categoryVolumes, [category]: volume };
        const newState = { ...state, categoryVolumes: newCategoryVolumes };
        localStorage.setItem('soundSettings', JSON.stringify(newState));
        return newState;
      }),
      
    toggleMute: () => 
      set((state) => {
        const newState = { ...state, isMuted: !state.isMuted };
        localStorage.setItem('soundSettings', JSON.stringify(newState));
        return newState;
      }),
      
    toggleCategoryMute: (category: SoundCategory) => 
      set((state) => {
        const newCategoryMuted = { 
          ...state.categoryMuted, 
          [category]: !state.categoryMuted[category] 
        };
        const newState = { ...state, categoryMuted: newCategoryMuted };
        localStorage.setItem('soundSettings', JSON.stringify(newState));
        return newState;
      }),
      
    resetSettings: () => 
      set(() => {
        const newState = { ...defaultState };
        localStorage.setItem('soundSettings', JSON.stringify(newState));
        return newState;
      }),
  };
});

// Audio cache to prevent reloading sounds
const audioCache: Record<string, HTMLAudioElement> = {};

// Function to preload a sound
const preloadSound = (soundId: SoundId) => {
  const path = soundPaths[soundId];
  if (!audioCache[path]) {
    const audio = new Audio(path);
    audio.load();
    audioCache[path] = audio;
  }
  return audioCache[path];
};

// Interface for the sound system hook
interface UseSoundSystem {
  play: (soundId: SoundId) => void;
  playWithVolume: (soundId: SoundId, volume: number) => void;
  loop: (soundId: SoundId, shouldLoop?: boolean) => void;
  stop: (soundId: SoundId) => void;
  stopAll: () => void;
  preloadSounds: (soundIds: SoundId[]) => void;
}

// Custom hook for playing sounds
export const useSoundSystem = (): UseSoundSystem => {
  const soundState = useSoundStore();
  const activeLoops = useRef<Record<string, HTMLAudioElement>>({});
  
  // Preload common UI sounds on mount
  useEffect(() => {
    const commonSounds: SoundId[] = ['button_click', 'card_deal', 'chip_toss'];
    commonSounds.forEach(preloadSound);
    
    // Clean up any playing sounds on unmount
    return () => {
      Object.values(activeLoops.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      activeLoops.current = {};
    };
  }, []);
  
  // Function to calculate the actual volume for a sound
  const calculateVolume = (soundId: SoundId) => {
    const { masterVolume, categoryVolumes, isMuted, categoryMuted } = soundState;
    const category = soundCategories[soundId];
    
    // Return 0 volume if master or category is muted
    if (isMuted || categoryMuted[category]) {
      return 0;
    }
    
    // Calculate volume by multiplying master and category volumes
    return masterVolume * categoryVolumes[category];
  };
  
  // Function to play a sound
  const play = (soundId: SoundId) => {
    const volume = calculateVolume(soundId);
    if (volume <= 0) return; // Don't play sounds if muted
    
    try {
      const path = soundPaths[soundId];
      const audio = audioCache[path] || new Audio(path);
      
      // Clone the audio element for simultaneous plays
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = volume;
      audioClone.play().catch(error => {
        // Handle autoplay restrictions
        console.warn(`Sound autoplay failed: ${error.message}`);
      });
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
    }
  };
  
  // Function to play a sound with a specific volume override
  const playWithVolume = (soundId: SoundId, volumeOverride: number) => {
    const baseVolume = calculateVolume(soundId);
    if (baseVolume <= 0) return; // Don't play sounds if muted
    
    const finalVolume = Math.min(baseVolume * volumeOverride, 1);
    
    try {
      const path = soundPaths[soundId];
      const audio = audioCache[path] || new Audio(path);
      
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = finalVolume;
      audioClone.play().catch(error => {
        console.warn(`Sound autoplay failed: ${error.message}`);
      });
    } catch (error) {
      console.error(`Failed to play sound ${soundId} with custom volume:`, error);
    }
  };
  
  // Function to play a looping sound (like ambient music)
  const loop = (soundId: SoundId, shouldLoop = true) => {
    const volume = calculateVolume(soundId);
    const path = soundPaths[soundId];
    
    // Stop the sound if it's already looping
    if (activeLoops.current[soundId]) {
      activeLoops.current[soundId].pause();
      activeLoops.current[soundId].currentTime = 0;
      delete activeLoops.current[soundId];
    }
    
    if (!shouldLoop) return;
    if (volume <= 0) return; // Don't play if muted
    
    try {
      const audio = new Audio(path);
      audio.loop = true;
      audio.volume = volume;
      
      // Store reference to stop later
      activeLoops.current[soundId] = audio;
      
      audio.play().catch(error => {
        console.warn(`Looping sound autoplay failed: ${error.message}`);
        delete activeLoops.current[soundId];
      });
    } catch (error) {
      console.error(`Failed to loop sound ${soundId}:`, error);
    }
  };
  
  // Function to stop a specific looping sound
  const stop = (soundId: SoundId) => {
    if (activeLoops.current[soundId]) {
      activeLoops.current[soundId].pause();
      activeLoops.current[soundId].currentTime = 0;
      delete activeLoops.current[soundId];
    }
  };
  
  // Function to stop all looping sounds
  const stopAll = () => {
    Object.values(activeLoops.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeLoops.current = {};
  };
  
  // Function to preload a list of sounds
  const preloadSounds = (soundIds: SoundId[]) => {
    soundIds.forEach(preloadSound);
  };
  
  // Update the volume of all active loops when settings change
  useEffect(() => {
    Object.entries(activeLoops.current).forEach(([soundId, audio]) => {
      audio.volume = calculateVolume(soundId as SoundId);
    });
  }, [soundState.masterVolume, soundState.categoryVolumes, soundState.isMuted, soundState.categoryMuted]);
  
  return {
    play,
    playWithVolume,
    loop,
    stop,
    stopAll,
    preloadSounds
  };
};

// Export types for use in other components
export type { SoundId, SoundCategory };