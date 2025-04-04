import { create } from 'zustand';
import { useEffect, useRef } from 'react';

type SoundId = 'button_click' | 'card_deal' | 'chip_toss';

const soundPaths: Record<SoundId, string> = {
  button_click: '/sounds/ui/button_click.mp3',
  card_deal: '/sounds/game/card_deal.mp3',
  chip_toss: '/sounds/game/chip_toss.mp3'
};

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

export const useSoundSystem = () => {
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

  const play = (soundId: SoundId) => {
    try {
      const path = soundPaths[soundId];
      const audio = audioCache[path] || new Audio(path);
      audio.play().catch(console.error);
    } catch (error) {
      console.error(`Failed to play sound ${soundId}:`, error);
    }
  };

  return { play };
};