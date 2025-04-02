import { useEffect, useRef } from 'react';
import { useSoundSystem, SoundId } from '@/hooks/use-sound-system';
import { GameState, GameAction } from '@/types';

// Define a local interface for game round actions to avoid TypeScript errors
interface GameRoundAction {
  id: string;
  round: number;
  action: string;
  player: string;
  playerId?: number;
  amount?: number;
  timestamp: number;
}

// Extend GameState interface to include gameHistory
interface GameStateWithHistory extends GameState {
  gameHistory?: GameRoundAction[];
}

interface SoundEffectsManagerProps {
  gameState: GameStateWithHistory | null;
  previousGameState: GameStateWithHistory | null;
}

export function SoundEffectsManager({ gameState, previousGameState }: SoundEffectsManagerProps) {
  const { play, loop, stop } = useSoundSystem();
  const prevGameStatusRef = useRef<string | null | undefined>(null);
  const prevHistoryLengthRef = useRef<number>(0);
  const ambientSoundStartedRef = useRef<boolean>(false);
  
  // Get the most recent game action
  const getLastGameAction = (): GameRoundAction | null => {
    if (!gameState || !gameState.gameHistory || gameState.gameHistory.length === 0) {
      return null;
    }
    
    return gameState.gameHistory[gameState.gameHistory.length - 1];
  };
  
  // Play ambient music when entering game
  useEffect(() => {
    if (gameState && !ambientSoundStartedRef.current) {
      // Play ambient casino music when game loads
      loop('arabic_music');
      ambientSoundStartedRef.current = true;
      
      // Clean up when component unmounts
      return () => {
        stop('arabic_music');
        ambientSoundStartedRef.current = false;
      };
    }
  }, [gameState, loop, stop]);
  
  // Play sounds based on changes in game state
  useEffect(() => {
    if (!gameState) return;
    
    // Check if game status changed
    const currentGameStatus = gameState.gameStatus;
    if (prevGameStatusRef.current !== currentGameStatus) {
      // Play status change sounds
      switch (currentGameStatus) {
        case 'waiting':
          // No specific sound for waiting
          break;
        case 'preflop':
          play('shuffle');
          setTimeout(() => play('card_deal'), 500);
          break;
        case 'flop':
          play('card_flip');
          break;
        case 'turn':
          play('card_flip');
          break;
        case 'river':
          play('card_flip');
          break;
        case 'showdown':
          play('card_flip');
          setTimeout(() => play('celebration'), 1000);
          break;
      }
      
      prevGameStatusRef.current = currentGameStatus;
    }
    
    // Check for new game history actions
    if (gameState.gameHistory && gameState.gameHistory.length > prevHistoryLengthRef.current) {
      // Get the most recent action
      const lastAction = getLastGameAction();
      
      if (lastAction) {
        // Play sound based on action type
        switch (lastAction.action) {
          case 'fold':
            play('fold');
            break;
          case 'check':
            play('check');
            break;
          case 'call':
            play('call');
            play('chip_toss');
            break;
          case 'raise':
            play('raise');
            play('chip_stack');
            break;
          case 'all_in':
            play('all_in');
            play('chip_stack');
            setTimeout(() => play('chip_stack'), 200);
            break;
          case 'win':
            play('win_hand');
            setTimeout(() => play('chip_stack'), 500);
            break;
          case 'timeout':
            play('time_warning');
            break;
          case 'start_round':
            play('shuffle');
            break;
          case 'deal_cards':
            play('card_deal');
            break;
        }
      }
      
      prevHistoryLengthRef.current = gameState.gameHistory.length;
    }
    
    // Check for current player's turn
    if (previousGameState && gameState) {
      // Find the player whose turn it is now but wasn't before
      const currentPlayerTurn = gameState.players.find(p => p.isTurn);
      const previousPlayerTurn = previousGameState.players.find(p => p.isTurn);
      
      if (currentPlayerTurn && 
          (!previousPlayerTurn || currentPlayerTurn.id !== previousPlayerTurn.id)) {
        // New player turn - play turn sound
        play('turn_start');
      }
      
      // Check if community cards changed
      if (previousGameState.communityCards.length < gameState.communityCards.length) {
        // New community cards revealed
        play('card_flip');
      }
    }
    
  }, [gameState, previousGameState, play, loop, stop]);
  
  // This component doesn't render anything - it just manages sounds
  return null;
}