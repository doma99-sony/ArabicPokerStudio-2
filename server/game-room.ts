import { GameTable, GameState, Card, GameAction } from "../shared/types";
import { createDeck, shuffleDeck, dealCards, dealCardsToPlayer, remainingCards } from "./card-utils";

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
  isAI?: boolean; // إضافة خاصية للاعبين الوهميين
}

// Interface for game round
interface GameRoundAction {
  id: string;
  round: number;
  action: string;
  player: string;
  playerId: number;
  amount?: number;
  timestamp: number;
}

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
  // إضافة متغيرات لتتبع وقت اللاعب الحالي
  turnStartTime: number; // وقت بدء دور اللاعب الحالي (timestamp)
  turnTimeoutId?: NodeJS.Timeout; // معرف مؤقت انتهاء الوقت
  gameHistory: GameRoundAction[]; // سجل أحداث اللعبة
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
    gameStatus: "waiting",
    turnStartTime: Date.now(), // تهيئة وقت بدء الدور
    gameHistory: [] // تهيئة سجل أحداث اللعبة
  };
  
  // مدة مؤقت انتظار اللاعب (12 ثانية)
  const TURN_TIMEOUT_SECONDS = 12;
  
  // إضافة حدث إلى سجل اللعبة
  const addEventToHistory = (action: string, player: string, playerId: number, amount?: number) => {
    const historyItem: GameRoundAction = {
      id: Math.random().toString(36).substring(2, 10), // إنشاء معرف فريد
      round: round.roundNumber,
      action: action,
      player: player,
      playerId: playerId,
      amount: amount,
      timestamp: Date.now()
    };
    
    round.gameHistory.push(historyItem);
    console.log(`تم إضافة حدث للسجل: ${player} - ${action}${amount ? ` (${amount})` : ''}`);
  };
  
  // وظيفة لبدء مؤقت الانتظار للاعب الحالي
  const startTurnTimer = () => {
    // إلغاء أي مؤقت سابق
    if (round.turnTimeoutId) {
      clearTimeout(round.turnTimeoutId);
    }
    
    // تعيين وقت بدء الدور
    round.turnStartTime = Date.now();
    
    // إنشاء مؤقت جديد للدور الحالي
    round.turnTimeoutId = setTimeout(() => {
      // التحقق من أن هناك لاعب حالي
      if (round.currentTurn === -1 || round.gameStatus === "waiting" || round.gameStatus === "showdown") {
        return;
      }
      
      const currentPlayer = players.get(round.currentTurn);
      if (!currentPlayer) return;
      
      console.log(`تم انتهاء وقت اللاعب ${currentPlayer.username} - يتم تنفيذ إجراء تلقائي`);
      
      // إضافة حدث انتهاء الوقت إلى سجل اللعبة
      addEventToHistory("timeout", currentPlayer.username, currentPlayer.id);
      
      // معالجة خاصة للاعبين الوهميين (AI)
      if (currentPlayer.isAI) {
        console.log(`اللاعب ${currentPlayer.username} هو لاعب وهمي (AI)، سيتم اتخاذ قرار ذكي...`);
        
        // حساب قوة اليد (قيمة افتراضية متوسطة)
        let handStrength = 0.5;
              
        // تقييم قوة اليد إذا كانت هناك بطاقات
        if (currentPlayer.cards && currentPlayer.cards.length > 0) {
          // حساب بسيط لقوة اليد بناءً على رتبة البطاقات والتطابق في اللون
          const ranks = currentPlayer.cards.map(card => card.rank);
          const suits = currentPlayer.cards.map(card => card.suit);
          
          // زيادة قوة اليد إذا كان هناك بطاقات مرتفعة (A, K, Q, J, 10)
          const highCards = ranks.filter(r => ["A", "K", "Q", "J", "10"].includes(r));
          handStrength += highCards.length * 0.1;
          
          // زيادة قوة اليد إذا كان هناك زوج (نفس الرتبة)
          if (ranks[0] === ranks[1]) {
            handStrength += 0.3;
          }
          
          // زيادة قوة اليد إذا كان اللون متطابقًا
          if (suits[0] === suits[1]) {
            handStrength += 0.2;
          }
          
          // تعديل قوة اليد بناءً على البطاقات المكشوفة على الطاولة
          if (round.communityCards.length > 0) {
            // زيادة قوة اليد إذا كانت هناك بطاقات تكمل زوجًا
            for (const card of round.communityCards) {
              if (ranks.includes(card.rank)) {
                handStrength += 0.2;
              }
              // زيادة قوة اليد إذا كان هناك احتمال لتكوين لون
              if (suits.includes(card.suit)) {
                handStrength += 0.1;
              }
            }
          }
          
          // تأكد من أن قوة اليد بين 0 و 1
          handStrength = Math.max(0, Math.min(1, handStrength));
        }
              
        // قرار اللاعب الوهمي بناءً على قوة اليد والمرحلة الحالية
        let aiAction: GameAction;
        let aiAmount: number | undefined;
                
        if (round.currentBet > 0 && round.currentBet > currentPlayer.betAmount) {
          // إذا كان هناك رهان، فإن الخيارات هي المطابقة أو الزيادة أو الطي
          const randomFactor = Math.random() * 0.3; // عامل عشوائي للتنويع
          
          if (handStrength + randomFactor > 0.7) {
            // يد قوية - زيادة أو مطابقة
            if (Math.random() < 0.6) {
              aiAction = "raise";
              // تحديد مقدار الزيادة بناءً على قوة اليد
              const maxRaise = Math.min(currentPlayer.chips, round.currentBet * 3);
              const minRaise = round.currentBet * 2;
              aiAmount = Math.floor(minRaise + (maxRaise - minRaise) * handStrength);
            } else {
              aiAction = "call";
            }
          } else if (handStrength + randomFactor > 0.4) {
            // يد متوسطة - مطابقة غالبًا
            if (Math.random() < 0.2) {
              aiAction = "raise";
              aiAmount = Math.floor(round.currentBet * 1.5);
            } else if (Math.random() < 0.7) {
              aiAction = "call";
            } else {
              aiAction = "fold";
            }
          } else {
            // يد ضعيفة - طي غالبًا أو مخادعة أحيانًا
            if (Math.random() < 0.2 && round.gameStatus === "preflop") {
              // في بداية اللعبة، قد يخادع اللاعب الوهمي
              aiAction = "raise";
              aiAmount = Math.floor(round.currentBet * 2);
            } else if (Math.random() < 0.3) {
              aiAction = "call";
            } else {
              aiAction = "fold";
            }
          }
        } else {
          // لا يوجد رهان، فالخيارات هي التحقق أو الرهان
          const randomFactor = Math.random() * 0.3; // عامل عشوائي للتنويع
          
          if (handStrength + randomFactor > 0.6) {
            // يد قوية - رهان غالبًا
            if (Math.random() < 0.8) {
              aiAction = "bet";
              // تحديد مقدار الرهان بناءً على قوة اليد
              const minBet = round.bigBlind;
              const maxBet = Math.min(currentPlayer.chips, round.pot * 0.7);
              aiAmount = Math.floor(minBet + (maxBet - minBet) * handStrength);
            } else {
              aiAction = "check";
            }
          } else if (handStrength + randomFactor > 0.3) {
            // يد متوسطة - تحقق غالبًا
            if (Math.random() < 0.3) {
              aiAction = "bet";
              aiAmount = Math.floor(round.bigBlind * 2);
            } else {
              aiAction = "check";
            }
          } else {
            // يد ضعيفة - تحقق غالبًا أو مخادعة أحيانًا
            if (Math.random() < 0.1) {
              // مخادعة نادرة
              aiAction = "bet";
              aiAmount = Math.floor(round.bigBlind * 3);
            } else {
              aiAction = "check";
            }
          }
        }
        
        console.log(`اللاعب الوهمي ${currentPlayer.username} يتخذ قرارًا: ${aiAction} (قوة اليد: ${handStrength.toFixed(2)})`);
        
        // تنفيذ الإجراء (بدون تأخير إضافي لأن المؤقت قد انتهى بالفعل)
        performAction(currentPlayer.id, aiAction, aiAmount);
        return;
      }
      
      // حساب عدد اللاعبين النشطين (غير المنسحبين)
      const activePlayers = Array.from(players.values()).filter(p => !p.folded);
      
      // إذا كان هناك لاعبين فقط في الطاولة وأحدهما سينسحب الآن، يجب إنهاء اللعبة والإعلان عن الفائز
      if (activePlayers.length === 2) {
        // تحديد اللاعب الآخر (المنافس الذي سيفوز)
        const winner = activePlayers.find(p => p.id !== round.currentTurn);
        
        if (winner) {
          console.log(`ينسحب ${currentPlayer.username} وبالتالي ${winner.username} يفوز تلقائياً`);
          
          // تنفيذ انسحاب اللاعب الحالي واستخراج النتائج
          currentPlayer.folded = true;
          
          // إضافة حدث الانسحاب إلى سجل اللعبة
          addEventToHistory("fold", currentPlayer.username, currentPlayer.id);
          
          // إضافة حدث الفوز إلى سجل اللعبة
          addEventToHistory("win", winner.username, winner.id, round.pot + currentPlayer.betAmount);
          
          // منح الفائز الرقائق من القدر
          winner.chips += round.pot + currentPlayer.betAmount;
          
          // الإعلان عن نهاية اللعبة والفائز
          round.gameStatus = "showdown";
          
          // إلغاء أي مؤقت سابق
          if (round.turnTimeoutId) {
            clearTimeout(round.turnTimeoutId);
            round.turnTimeoutId = undefined;
          }
          
          // إعداد جولة جديدة بعد فترة قصيرة
          setTimeout(() => {
            if (players.size >= 2 && round.gameStatus === "showdown") {
              startNewRound();
            }
          }, 3000);
          
          return;
        }
      }
      
      // في حالة وجود أكثر من لاعبين، نستمر بالمنطق العادي
      // تنفيذ إجراء Fold تلقائيًا للاعب
      performAction(round.currentTurn, "fold");
    }, TURN_TIMEOUT_SECONDS * 1000);
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
    // إلغاء أي مؤقت سابق
    if (round.turnTimeoutId) {
      clearTimeout(round.turnTimeoutId);
      round.turnTimeoutId = undefined;
    }
  
    // Reset player bets for the new round
    for (const player of players.values()) {
      round.pot += player.betAmount;
      player.betAmount = 0;
    }
    
    round.currentBet = 0;
    
    // إضافة سجل بتقدم مرحلة اللعبة
    const stageAction = {
      id: `${Date.now()}-${Math.floor(Math.random()*1000)}`,
      round: round.roundNumber,
      action: round.gameStatus === "preflop" ? "flop" : 
              round.gameStatus === "flop" ? "turn" : 
              round.gameStatus === "turn" ? "river" : 
              round.gameStatus === "river" ? "showdown" : "start_round",
      player: "النظام",
      playerId: -1,
      timestamp: Date.now()
    };
    
    round.gameHistory.push(stageAction);
    
    switch (round.gameStatus) {
      case "waiting":
      case "showdown":
        // Start a new round
        startNewRound();
        break;
      case "preflop":
        // Deal the flop (first three community cards)
        round.gameStatus = "flop";
        let flopCards = [];
        for (let i = 0; i < 3; i++) {
          flopCards.push(...dealCardsToPlayer(round.deck, 1));
        }
        round.communityCards = flopCards;
        console.log("تم توزيع بطاقات الفلوب:", flopCards);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        // بدء مؤقت للاعب الجديد
        if (round.currentTurn !== -1) startTurnTimer();
        break;
      case "flop":
        // Deal the turn (fourth community card)
        round.gameStatus = "turn";
        const turnCard = dealCardsToPlayer(round.deck, 1);
        round.communityCards = [...round.communityCards, ...turnCard];
        console.log("تم توزيع بطاقة التيرن:", turnCard);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        // بدء مؤقت للاعب الجديد
        if (round.currentTurn !== -1) startTurnTimer();
        break;
      case "turn":
        // Deal the river (fifth community card)
        round.gameStatus = "river";
        const riverCard = dealCardsToPlayer(round.deck, 1);
        round.communityCards = [...round.communityCards, ...riverCard];
        console.log("تم توزيع بطاقة الريفر:", riverCard);
        // Set the first active player after the dealer
        round.currentTurn = getNextPlayerTurn(round.dealer);
        // بدء مؤقت للاعب الجديد
        if (round.currentTurn !== -1) startTurnTimer();
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
    console.log("بدء جولة جديدة من اللعب...");
    
    round.roundNumber++;
    round.deck = shuffleDeck(createDeck());
    round.communityCards = [];
    round.pot = 0;
    round.currentBet = 0;
    
    // إضافة حدث بدء جولة جديدة إلى سجل الأحداث
    const startRoundAction: GameRoundAction = {
      id: `${Date.now()}-${Math.floor(Math.random()*1000)}`,
      round: round.roundNumber,
      action: "start_round",
      player: "النظام",
      playerId: -1,
      timestamp: Date.now()
    };
    
    round.gameHistory.push(startRoundAction);
    
    // تعيين حالة اللعبة إلى preflop (بداية الجولة)
    round.gameStatus = "preflop";
    
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
    
    // Deal cards to players with a more exciting sequence
    const playerArray = Array.from(players.values());
    
    // توزيع البطاقات مع إعلانات أفضل وتسلسل أبطأ
    let dealerIndex = playerArray.findIndex(p => p.id === round.dealer);
    if (dealerIndex === -1) dealerIndex = 0;
    
    // إعادة ترتيب المصفوفة لتبدأ من اللاعب الأول بعد الديلر
    const orderedPlayers = [
      ...playerArray.slice(dealerIndex + 1),
      ...playerArray.slice(0, dealerIndex + 1)
    ];
    
    // أولاً توزيع البطاقة الأولى لكل لاعب
    for (const player of orderedPlayers) {
      const firstCard = dealCardsToPlayer(round.deck, 1)[0];
      // تهيئة كروت اللاعب، سيتم إظهارها أو إخفاؤها في getGameStateForPlayer
      player.cards = [{...firstCard, hidden: false}];
      console.log(`تم توزيع البطاقة الأولى للاعب ${player.username}`);
      
      // مسح الكاش لتحديث حالة اللعبة في الإطار التالي
      gameStateCache.clear();
    }
    
    // ثم توزيع البطاقة الثانية لكل لاعب
    for (const player of orderedPlayers) {
      const secondCard = dealCardsToPlayer(round.deck, 1)[0];
      // إضافة البطاقة الثانية
      player.cards.push({...secondCard, hidden: false});
      console.log(`تم توزيع البطاقة الثانية للاعب ${player.username}`);
      
      // مسح الكاش لتحديث حالة اللعبة في الإطار التالي
      gameStateCache.clear();
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
    
    // بدء المؤقت للاعب الأول
    if (round.currentTurn !== -1) {
      startTurnTimer();
      console.log(`بدء مؤقت انتظار للاعب الأول ${round.currentTurn}`);
    }
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
    // اللعبة تنتهي في حالة تبقي لاعب واحد فقط أو في حالة "showdown"
    const activePlayers = Array.from(players.values()).filter(p => !p.folded);
    const gameEnded = activePlayers.length <= 1 || round.gameStatus === "showdown";
    
    if (gameEnded) {
      console.log(`اللعبة انتهت. لاعبين نشطين: ${activePlayers.length}, الحالة: ${round.gameStatus}`);
      // إضافة تسجيل للفائز
      if (activePlayers.length === 1) {
        console.log(`الفائز بالجولة: ${activePlayers[0].username} بسبب انسحاب باقي اللاعبين`);
      }
    }
    
    return gameEnded;
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
    
    // حساب الوقت المتبقي للاعب الحالي (إذا كان دوره)
    let turnTimeLeft: number | undefined = undefined;
    if (round.currentTurn !== -1 && round.gameStatus !== "waiting" && round.gameStatus !== "showdown") {
      const elapsedTime = Math.floor((Date.now() - round.turnStartTime) / 1000);
      turnTimeLeft = Math.max(0, TURN_TIMEOUT_SECONDS - elapsedTime);
    }
    
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
      gameStatus: round.gameStatus,
      turnTimeLeft, // إضافة الوقت المتبقي
      gameHistory: round.gameHistory // إرسال سجل الأحداث للواجهة
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
      isAllIn: false,
      isAI: isAI || false // تعيين حالة اللاعب الوهمي
    };
    
    players.set(playerId, player);
    
    // If this is the first player, make them the dealer
    if (players.size === 1) {
      round.dealer = playerId;
    }
    
    // If we have enough players and game isn't started yet, start the game
    if (players.size >= 2 && round.gameStatus === "waiting") {
      console.log(`بدء جولة جديدة تلقائيًا - عدد اللاعبين: ${players.size}`);
      
      // إضافة تأخير قصير قبل بدء الجولة للتأكد من جاهزية اللاعبين
      setTimeout(() => {
        if (players.size >= 2 && round.gameStatus === "waiting") {
          // تعيين حالة اللعبة مبدئيًا إلى "preflop" لتجنب أي تضارب
          round.gameStatus = "preflop";
          
          // بدء جولة جديدة
          startNewRound();
          
          // تحديث حالة اللعبة وإرسالها للاعبين
          gameStateCache.clear(); // مسح الكاش للتأكد من تحديث الحالة
          
          console.log(`تم بدء جولة جديدة بنجاح - الحالة: ${round.gameStatus}`);
        }
      }, 1000);
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
        gameStatus: "waiting",
        turnStartTime: Date.now(), // إعادة تعيين وقت بدء الدور
        gameHistory: [] // إعادة تعيين سجل الأحداث
      };
      
      // إلغاء أي مؤقت انتظار سابق
      if (round.turnTimeoutId) {
        clearTimeout(round.turnTimeoutId);
        round.turnTimeoutId = undefined;
      }
    }
    
    return { success: true, chips: returnedChips };
  };
  
  // Perform a game action (fold, check, call, raise, all-in)
  const performAction = (
    playerId: number, 
    action: GameAction | "restart_round",  // أضف الدعم الصريح لإجراء إعادة بدء الجولة 
    amount?: number
  ): ActionResult => {
    
    // تحقق أولاً إذا كان الإجراء هو إعادة تشغيل الجولة
    if (action === "restart_round") {
      console.log(`إجراء إعادة تشغيل الجولة من اللاعب ${playerId}`);
      
      // تسجيل الإجراء في تاريخ اللعبة
      const restartActionHistoryItem: GameRoundAction = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        round: round.roundNumber,
        action: "restart_round",
        player: players.get(playerId)?.username || "مجهول",
        playerId,
        timestamp: Date.now()
      };
      round.gameHistory.push(restartActionHistoryItem);
      
      // بدء جولة جديدة
      startNewRound();
      
      // إعادة حالة اللعبة بعد بدء الجولة الجديدة
      return {
        success: true,
        message: "تم بدء جولة جديدة",
        gameState: getGameStateForPlayer(playerId)
      };
    }
    // Check if it's the player's turn
    if (round.currentTurn !== playerId) {
      return { success: false, message: "ليس دورك" };
    }
    
    const player = players.get(playerId);
    if (!player) {
      return { success: false, message: "اللاعب غير موجود في اللعبة" };
    }
    
    // إضافة الإجراء إلى سجل الأحداث
    const actionHistoryItem: GameRoundAction = {
      id: `${Date.now()}-${Math.floor(Math.random()*1000)}`,
      round: round.roundNumber,
      action: action,
      player: player.username,
      playerId: player.id,
      amount: action === "bet" || action === "raise" || action === "call" ? amount : undefined,
      timestamp: Date.now()
    };
    
    round.gameHistory.push(actionHistoryItem);
    
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
        
      case "all_in":
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
        
      case "restart_round":
        // لبدء جولة جديدة من اللعب
        console.log(`طلب إعادة بدء الجولة من اللاعب ${player.username}`);
        
        // تسجيل حدث إعادة تشغيل الجولة
        const restartActionHistoryItem: GameRoundAction = {
          id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          round: round.roundNumber,
          action: "restart_round",
          player: player.username,
          playerId: player.id,
          timestamp: Date.now()
        };
        round.gameHistory.push(restartActionHistoryItem);
        
        // إعادة تعيين حالة اللاعبين
        for (const [_, p] of players) {
          p.folded = false;
          p.betAmount = 0;
          p.isAllIn = false;
          p.cards = [];
        }
        
        // بدء جولة جديدة
        startNewRound();
        
        // إعادة حالة اللعبة المحدثة
        gameStateCache.clear(); // مسح الكاش للتأكد من تحديث الحالة
        return { 
          success: true,
          message: "تم بدء جولة جديدة بنجاح" 
        };
        
      default:
        return { success: false, message: "إجراء غير صالح" };
    }
    
    // Move to the next player
    round.currentTurn = getNextPlayerTurn(player.position);
    
    // إعادة تعيين مؤقت انتظار اللاعب الجديد
    if (round.currentTurn !== -1) {
      startTurnTimer();
      console.log(`بدء مؤقت انتظار للاعب ${round.currentTurn}`);
    }
    
    // Check if round is complete
    if (isRoundComplete()) {
      // If game is over, end the round and return results
      if (isGameOver()) {
        const results = endRound();
        
        // إعادة تعيين حالة اللاعبين لجولة جديدة
        for (const [_, p] of players) {
          p.folded = false;
          p.betAmount = 0;
          p.isAllIn = false;
          p.cards = [];
        }
        
        // بدء جولة جديدة تلقائياً بعد مدة قصيرة
        console.log("الجولة انتهت، جدولة بدء جولة جديدة...");
        setTimeout(() => {
          if (players.size >= 2) {
            console.log("بدء جولة جديدة تلقائياً بعد انتهاء الجولة السابقة...");
            startNewRound();
            // مسح الكاش للتأكد من تحديث الحالة
            gameStateCache.clear();
          }
        }, 2000); // بدء جولة جديدة بعد ثانيتين

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
