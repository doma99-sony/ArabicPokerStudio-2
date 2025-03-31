import { GameTable, GameState, Card, GameAction } from "../shared/types";
import { createDeck, shuffleDeck, dealCards, remainingCards } from "./card-utils";

// Interface for game room player
interface GamePlayer {
  id: number;
  username: string;
  chips: number;
  avatar?: string | null;
  position: number;
  cards: Card[];
  folded: boolean;
  betAmount: number;
  isAllIn: boolean;
}

// Interface for game round
interface GameRound {
  roundNumber: number;
  deck: Card[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  dealer: number;
  smallBlind: number;
  bigBlind: number;
  currentTurn: number;
  lastRaisePosition: number;
  gameStatus: "waiting" | "preflop" | "flop" | "turn" | "river" | "showdown";
}

// Result interface for player actions
interface ActionResult {
  success: boolean;
  message?: string;
  gameState?: GameState;
  gameEnded?: boolean;
  results?: {
    playerId: number;
    chipsChange: number;
  }[];
}

// Game room class to manage a poker table
export interface GameRoom {
  // Methods
  getGameStateForPlayer(playerId: number): GameState;
  addPlayer(playerId: number, username: string, chips: number, avatar?: string | null, position?: number, isAI?: boolean): { success: boolean; message?: string };
  removePlayer(playerId: number): { success: boolean; message?: string; chips?: number };
  performAction(playerId: number, action: GameAction, amount?: number): ActionResult;
}

// Create a new game room for a table
const gameStateCache = new Map<number, GameState>();

export function createGameRoom(table: GameTable): GameRoom {
  // Players in the game
  const players: Map<number, GamePlayer> = new Map();
  
  // Cache cleanup
  setInterval(() => {
    gameStateCache.clear();
  }, 60000);
  
  // Current game round
  let round: GameRound = {
    roundNumber: 1,
    deck: shuffleDeck(createDeck()),
    communityCards: [],
    pot: 0,
    currentBet: 0,
    dealer: 0,
    smallBlind: table.smallBlind,
    bigBlind: table.bigBlind,
    currentTurn: 0,
    lastRaisePosition: 0,
    gameStatus: "waiting"
  };
  
  // Get available positions
  const getAvailablePosition = (): number => {
    const positions = Array.from(players.values()).map(p => p.position);
    for (let i = 0; i < table.maxPlayers; i++) {
      if (!positions.includes(i)) {
        return i;
      }
    }
    return -1; // No positions available
  };
  
  // Get next player's turn with improved performance
  const getNextPlayerTurn = (currentPosition: number): number => {
    const playerArray = Array.from(players.values());
    if (playerArray.length <= 1) return -1;
    
    const maxPosition = playerArray.length;
    let next = (currentPosition + 1) % maxPosition;
    const startPosition = next;
    
    do {
      const player = playerArray.find(p => p.position === next);
      if (player && !player.folded && player.chips > 0) {
        return player.id;
      }
      next = (next + 1) % maxPosition;
    } while (next !== startPosition);
    
    return -1;
  };
  
  // Check if round is complete (all players have acted)
  const isRoundComplete = (): boolean => {
    const playerArray = Array.from(players.values());
    
    // Check if all active players have bet the same amount or folded or are all-in
    let activePlayers = 0;
    let matchedBets = 0;
    
    for (const player of playerArray) {
      if (!player.folded) {
        activePlayers++;
        if (player.isAllIn || player.betAmount === round.currentBet) {
          matchedBets++;
        }
      }
    }
    
    return matchedBets === activePlayers;
  };
  
  // Advance to the next stage of the game
  const advanceGameStage = (): void => {
    // Reset player bets for the new round
    for (const player of players.values()) {
      round.pot += player.betAmount;
      player.betAmount = 0;
    }
    
    round.currentBet = 0;
    
    switch (round.gameStatus) {
      case "waiting":
      case "showdown":
        // Start a new round
        startNewRound();
        break;
      case "preflop":
        // Deal the flop (first three community cards)
        round.gameStatus = "flop";
        round.communityCards = dealCards(round.deck, 3);
        round.deck = remainingCards(round.deck, 3);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        break;
      case "flop":
        // Deal the turn (fourth community card)
        round.gameStatus = "turn";
        const turnCard = dealCards(round.deck, 1);
        round.communityCards = [...round.communityCards, ...turnCard];
        round.deck = remainingCards(round.deck, 1);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        break;
      case "turn":
        // Deal the river (fifth community card)
        round.gameStatus = "river";
        const riverCard = dealCards(round.deck, 1);
        round.communityCards = [...round.communityCards, ...riverCard];
        round.deck = remainingCards(round.deck, 1);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        break;
      case "river":
        // Go to showdown
        round.gameStatus = "showdown";
        // Reveal all cards
        for (const player of players.values()) {
          player.cards = player.cards.map(card => ({ ...card, hidden: false }));
        }
        break;
    }
  };
  
  // Start a new round
  const startNewRound = (): void => {
    round.roundNumber++;
    round.deck = shuffleDeck(createDeck());
    round.communityCards = [];
    round.pot = 0;
    round.currentBet = 0;
    
    // Reset player states
    for (const player of players.values()) {
      player.folded = false;
      player.betAmount = 0;
      player.isAllIn = false;
    }
    
    // Move dealer button
    if (players.size > 0) {
      round.dealer = getNextPlayerTurn(round.dealer);
    }
    
    // Deal cards to players
    for (const player of players.values()) {
      player.cards = dealCards(round.deck, 2).map(card => ({ ...card, hidden: false }));
      round.deck = remainingCards(round.deck, 2);
    }
    
    // Set small and big blinds
    const smallBlindPlayer = getNextPlayerTurn(round.dealer);
    if (smallBlindPlayer !== -1) {
      const player = players.get(smallBlindPlayer);
      if (player) {
        // Post small blind
        const smallBlindAmount = Math.min(player.chips, round.smallBlind);
        player.betAmount = smallBlindAmount;
        player.chips -= smallBlindAmount;
        if (player.chips === 0) player.isAllIn = true;
        round.currentBet = smallBlindAmount;
      }
    }
    
    const bigBlindPlayer = getNextPlayerTurn(smallBlindPlayer);
    if (bigBlindPlayer !== -1) {
      const player = players.get(bigBlindPlayer);
      if (player) {
        // Post big blind
        const bigBlindAmount = Math.min(player.chips, round.bigBlind);
        player.betAmount = bigBlindAmount;
        player.chips -= bigBlindAmount;
        if (player.chips === 0) player.isAllIn = true;
        round.currentBet = bigBlindAmount;
      }
    }
    
    // Set the first player to act (after big blind)
    round.currentTurn = getNextPlayerTurn(bigBlindPlayer);
    round.gameStatus = "preflop";
  };
  
  // Determine winners and distribute pot
  const endRound = (): { playerId: number; chipsChange: number }[] => {
    // In a real implementation, we would evaluate hands and determine winners
    // For simplicity, let's just award the pot to the last active player
    // or split it evenly among active players
    
    const activePlayers = Array.from(players.values()).filter(p => !p.folded);
    const results: { playerId: number; chipsChange: number }[] = [];
    
    if (activePlayers.length === 1) {
      // Only one player left, they win the pot
      const winner = activePlayers[0];
      winner.chips += round.pot;
      
      results.push({
        playerId: winner.id,
        chipsChange: round.pot
      });
      
      // All other players lost their bets
      for (const player of players.values()) {
        if (player.id !== winner.id) {
          const lostChips = player.betAmount;
          results.push({
            playerId: player.id,
            chipsChange: -lostChips
          });
        }
      }
    } else if (activePlayers.length > 1) {
      // Multiple players in showdown, split pot evenly (simplified)
      const splitAmount = Math.floor(round.pot / activePlayers.length);
      const remainder = round.pot % activePlayers.length;
      
      for (let i = 0; i < activePlayers.length; i++) {
        const player = activePlayers[i];
        let winAmount = splitAmount;
        
        // Add remainder to first player (simplified)
        if (i === 0) winAmount += remainder;
        
        player.chips += winAmount;
        
        results.push({
          playerId: player.id,
          chipsChange: winAmount - player.betAmount
        });
      }
      
      // Players who folded lost their bets
      for (const player of players.values()) {
        if (player.folded) {
          const lostChips = player.betAmount;
          results.push({
            playerId: player.id,
            chipsChange: -lostChips
          });
        }
      }
    }
    
    return results;
  };
  
  // Check if the game is over (only one player left or showdown complete)
  const isGameOver = (): boolean => {
    const activePlayers = Array.from(players.values()).filter(p => !p.folded);
    return activePlayers.length <= 1 || round.gameStatus === "showdown";
  };
  
  // Convert internal game state to client-facing game state for a specific player
  const getGameStateForPlayer = (playerId: number): GameState => {
    const playerArray = Array.from(players.values());
    const currentPlayer = players.get(playerId);
    
    // Map players to positions visible to the current player
    const positionedPlayers: PlayerPosition[] = playerArray.map(player => {
      return {
        id: player.id,
        username: player.username,
        chips: player.chips,
        avatar: player.avatar || "",
        position: player.id === playerId ? "bottom" : 
                 player.position === (currentPlayer?.position || 0) + 1 ? "bottomRight" :
                 player.position === (currentPlayer?.position || 0) + 2 ? "right" :
                 player.position === (currentPlayer?.position || 0) + 3 ? "top" : "left",
        isCurrentPlayer: player.id === playerId,
        isTurn: round.currentTurn === player.id,
        isActive: true, // تعيين جميع اللاعبين كنشطين
        isAllIn: player.isAllIn || false,
        isVIP: false, // يمكن تغييرها لاحقًا بناءً على حالة VIP للاعب
        cards: player.id === playerId || round.gameStatus === "showdown" 
               ? player.cards 
               : player.cards.map(card => ({ ...card, hidden: true })),
        folded: player.folded,
        betAmount: player.betAmount
      };
    });
    
    return {
      id: table.id,
      tableName: table.name,
      players: positionedPlayers,
      communityCards: round.communityCards,
      pot: round.pot,
      dealer: round.dealer,
      currentTurn: round.currentTurn,
      smallBlind: round.smallBlind,
      bigBlind: round.bigBlind,
      round: round.roundNumber,
      currentBet: round.currentBet,
      userChips: currentPlayer?.chips || 0,
      gameStatus: round.gameStatus
    };
  };
  
  // Add a player to the game
  const addPlayer = (
    playerId: number, 
    username: string, 
    chips: number, 
    avatar?: string | null,
    requestedPosition?: number,
    isAI?: boolean
  ): { success: boolean; message?: string } => {
    if (players.has(playerId)) {
      return { success: false, message: "اللاعب موجود بالفعل في اللعبة" };
    }
    
    if (players.size >= table.maxPlayers) {
      return { success: false, message: "الطاولة ممتلئة" };
    }
    
    if (chips < table.minBuyIn) {
      return { success: false, message: "رقاقات غير كافية للانضمام" };
    }
    
    // If a specific position is requested, check if it's available
    let position = -1;
    
    if (requestedPosition !== undefined) {
      // Check if the requested position is valid and available
      const positions = Array.from(players.values()).map(p => p.position);
      if (requestedPosition >= 0 && requestedPosition < table.maxPlayers && !positions.includes(requestedPosition)) {
        position = requestedPosition;
      } else {
        // If requested position is taken, fall back to any available position
        position = getAvailablePosition();
      }
    } else {
      // Get any available position
      position = getAvailablePosition();
    }
    
    if (position === -1) {
      return { success: false, message: "لا توجد مواضع متاحة" };
    }
    
    // Create a new player
    const player: GamePlayer = {
      id: playerId,
      username,
      chips,
      avatar,
      position,
      cards: [],
      folded: false,
      betAmount: 0,
      isAllIn: false
    };
    
    players.set(playerId, player);
    
    // If this is the first player, make them the dealer
    if (players.size === 1) {
      round.dealer = playerId;
    }
    
    // If we have enough players and game isn't started yet, start the game
    if (players.size >= 2 && round.gameStatus === "waiting") {
      startNewRound();
    }
    
    // If this player is an AI, automatically take actions when it's their turn
    if (isAI && playerId < 0) {
      // Setup a timer to simulate AI decision making for AI players
      setInterval(() => {
        // Only take action if it's this AI's turn
        if (round.currentTurn === playerId && players.has(playerId)) {
          const aiPlayer = players.get(playerId);
          if (!aiPlayer) return;
          
          // AI decision making logic (simplified)
          setTimeout(() => {
            let aiAction: GameAction;
            let aiAmount: number | undefined;
            
            // Random decision with bias toward safer plays
            const rand = Math.random();
            
            // If no current bet, check most of the time (70%) otherwise raise (30%)
            if (round.currentBet === 0 || round.currentBet === aiPlayer.betAmount) {
              if (rand < 0.7) {
                aiAction = "check";
              } else {
                aiAction = "raise";
                aiAmount = round.currentBet + Math.min(
                  Math.floor(aiPlayer.chips * 0.2), // Bet up to 20% of chips
                  round.bigBlind * 2 // Or double the big blind
                );
              }
            } else {
              // If there's a bet, fold 30%, call 50%, raise 20%
              if (rand < 0.3) {
                aiAction = "fold";
              } else if (rand < 0.8) {
                aiAction = "call";
              } else {
                aiAction = "raise";
                aiAmount = round.currentBet + Math.min(
                  Math.floor(aiPlayer.chips * 0.2),
                  round.bigBlind * 2
                );
              }
            }
            
            // Execute the AI's action
            performAction(playerId, aiAction, aiAmount);
          }, 1000); // Slight delay to make it feel more natural
        }
      }, 2000); // Check every 2 seconds if it's AI's turn
    }
    
    return { success: true };
  };
  
  // Remove a player from the game
  const removePlayer = (
    playerId: number
  ): { success: boolean; message?: string; chips?: number } => {
    const player = players.get(playerId);
    if (!player) {
      return { success: false, message: "اللاعب غير موجود في اللعبة" };
    }
    
    // Return the player's chips
    const returnedChips = player.chips;
    
    // Remove the player
    players.delete(playerId);
    
    // If this was the current player, move to the next player
    if (round.currentTurn === playerId) {
      round.currentTurn = getNextPlayerTurn(player.position);
    }
    
    // If only one player remains, they win the pot
    if (players.size === 1 && round.gameStatus !== "waiting") {
      const lastPlayer = Array.from(players.values())[0];
      lastPlayer.chips += round.pot;
      round.gameStatus = "waiting";
    }
    
    // If no players remain, reset the game
    if (players.size === 0) {
      round = {
        roundNumber: 1,
        deck: shuffleDeck(createDeck()),
        communityCards: [],
        pot: 0,
        currentBet: 0,
        dealer: 0,
        smallBlind: table.smallBlind,
        bigBlind: table.bigBlind,
        currentTurn: 0,
        lastRaisePosition: 0,
        gameStatus: "waiting"
      };
    }
    
    return { success: true, chips: returnedChips };
  };
  
  // Perform a game action (fold, check, call, raise, all-in)
  const performAction = (
    playerId: number, 
    action: GameAction, 
    amount?: number
  ): ActionResult => {
    // Check if it's the player's turn
    if (round.currentTurn !== playerId) {
      return { success: false, message: "ليس دورك" };
    }
    
    const player = players.get(playerId);
    if (!player) {
      return { success: false, message: "اللاعب غير موجود في اللعبة" };
    }
    
    // Handle actions
    switch (action) {
      case "fold":
        player.folded = true;
        break;
        
      case "check":
        // Can only check if there's no current bet
        if (round.currentBet > 0) {
          return { success: false, message: "لا يمكنك المتابعة، هناك رهان حالي" };
        }
        break;
        
      case "call":
        // Call the current bet
        const callAmount = Math.min(player.chips, round.currentBet - player.betAmount);
        player.chips -= callAmount;
        player.betAmount += callAmount;
        if (player.chips === 0) player.isAllIn = true;
        break;
        
      case "raise":
        // Raise the bet
        if (!amount || amount <= round.currentBet) {
          return { success: false, message: "يجب أن يكون مبلغ الرفع أكبر من الرهان الحالي" };
        }
        
        if (amount > player.chips + player.betAmount) {
          return { success: false, message: "لا تملك رقاقات كافية للرفع بهذا المبلغ" };
        }
        
        const raiseAmount = amount - player.betAmount;
        player.chips -= raiseAmount;
        player.betAmount = amount;
        round.currentBet = amount;
        round.lastRaisePosition = player.position;
        if (player.chips === 0) player.isAllIn = true;
        break;
        
      case "allIn":
        // Go all-in
        const allInAmount = player.chips;
        player.betAmount += allInAmount;
        player.chips = 0;
        player.isAllIn = true;
        
        // If all-in amount is greater than current bet, update current bet
        if (player.betAmount > round.currentBet) {
          round.currentBet = player.betAmount;
          round.lastRaisePosition = player.position;
        }
        break;
        
      default:
        return { success: false, message: "إجراء غير صالح" };
    }
    
    // Move to the next player
    round.currentTurn = getNextPlayerTurn(player.position);
    
    // Check if round is complete
    if (isRoundComplete()) {
      // If game is over, end the round and return results
      if (isGameOver()) {
        const results = endRound();
        return { 
          success: true, 
          gameEnded: true,
          results
        };
      } else {
        // Advance to the next stage
        advanceGameStage();
      }
    }
    
    return { success: true };
  };
  
  return {
    getGameStateForPlayer,
    addPlayer,
    removePlayer,
    performAction
  };
}
