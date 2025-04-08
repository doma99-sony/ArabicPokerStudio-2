// بيانات تجريبية للعبة البوكر
import { GamePhase } from './poker-engine';

// تعريف بيانات اللعبة التجريبية
export const mockGameState = {
  tableId: 1,
  players: [
    {
      id: 1, // سيتم استبداله بمعرف المستخدم الحقيقي
      username: 'أنت', // سيتم استبداله باسم المستخدم الحقيقي
      chips: 1200,
      betAmount: 20,
      isActive: true,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: true,
      isCurrentTurn: true,
      position: 0,
      cards: [
        { suit: 'hearts', rank: 'A', hidden: false },
        { suit: 'spades', rank: 'K', hidden: false }
      ],
      folded: false,
      isAllIn: false
    },
    {
      id: 2,
      username: 'لاعب 2',
      chips: 950,
      betAmount: 40,
      isActive: true,
      isDealer: true,
      isBigBlind: true,
      isSmallBlind: false,
      isCurrentTurn: false,
      position: 1,
      cards: [
        { suit: 'diamonds', rank: 'Q', hidden: true },
        { suit: 'clubs', rank: 'J', hidden: true }
      ],
      folded: false,
      isAllIn: false
    },
    {
      id: 3,
      username: 'لاعب 3',
      chips: 1500,
      betAmount: 0,
      isActive: true,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: false,
      isCurrentTurn: false,
      position: 2,
      cards: [
        { suit: 'hearts', rank: '10', hidden: true },
        { suit: 'spades', rank: '9', hidden: true }
      ],
      folded: true,
      isAllIn: false
    },
    {
      id: 4,
      username: 'لاعب 4',
      chips: 2000,
      betAmount: 40,
      isActive: true,
      isDealer: false,
      isBigBlind: false,
      isSmallBlind: false,
      isCurrentTurn: false,
      position: 3,
      cards: [
        { suit: 'clubs', rank: '5', hidden: true },
        { suit: 'diamonds', rank: '5', hidden: true }
      ],
      folded: false,
      isAllIn: false
    }
  ],
  currentRound: {
    pot: 100,
    communityCards: [
      { suit: 'hearts', rank: '10', hidden: false },
      { suit: 'diamonds', rank: 'J', hidden: false },
      { suit: 'spades', rank: 'Q', hidden: false },
      { suit: 'clubs', rank: 'K', hidden: false },
      { suit: 'hearts', rank: '2', hidden: false }
    ],
    currentBet: 40,
    minRaise: 40,
    gamePhase: GamePhase.RIVER
  },
  blindAmount: {
    small: 20,
    big: 40
  }
};

// تحديث البيانات التجريبية مع معلومات المستخدم
export const getMockGameState = (userId: number | undefined, username: string | undefined) => {
  // نسخة جديدة من البيانات التجريبية
  const gameState = JSON.parse(JSON.stringify(mockGameState));
  
  // تحديث بيانات اللاعب المحلي
  if (gameState.players.length > 0) {
    gameState.players[0].id = userId || 1;
    gameState.players[0].username = username || 'أنت';
  }
  
  return gameState;
};

// محاكاة تنفيذ إجراء لاعب
export const simulatePlayerAction = (gameState: any, playerId: number, action: string, amount?: number) => {
  // نسخة جديدة من حالة اللعبة
  const newGameState = JSON.parse(JSON.stringify(gameState));
  
  // العثور على اللاعب
  const playerIndex = newGameState.players.findIndex((p: any) => p.id === playerId);
  if (playerIndex === -1) return newGameState;
  
  const player = newGameState.players[playerIndex];
  
  // تنفيذ الإجراء المناسب
  switch (action) {
    case 'fold':
      player.folded = true;
      break;
      
    case 'check':
      // لا تغيير في الرقائق
      break;
      
    case 'call':
      const callAmount = newGameState.currentRound.currentBet - player.betAmount;
      player.chips -= callAmount;
      player.betAmount = newGameState.currentRound.currentBet;
      newGameState.currentRound.pot += callAmount;
      break;
      
    case 'raise':
      if (amount && amount > 0) {
        const raiseAmount = amount - player.betAmount;
        player.chips -= raiseAmount;
        player.betAmount = amount;
        newGameState.currentRound.currentBet = amount;
        newGameState.currentRound.pot += raiseAmount;
      }
      break;
      
    case 'all_in':
      const allInAmount = player.chips;
      newGameState.currentRound.pot += allInAmount;
      player.betAmount += allInAmount;
      player.chips = 0;
      player.isAllIn = true;
      if (player.betAmount > newGameState.currentRound.currentBet) {
        newGameState.currentRound.currentBet = player.betAmount;
      }
      break;
  }
  
  // تبديل الدور للاعب التالي
  player.isCurrentTurn = false;
  
  // العثور على اللاعب التالي الذي لم يطوي أوراقه ولم يضع كل رقائقه
  let nextPlayerIndex = (playerIndex + 1) % newGameState.players.length;
  while (
    nextPlayerIndex !== playerIndex && 
    (newGameState.players[nextPlayerIndex].folded || newGameState.players[nextPlayerIndex].isAllIn)
  ) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newGameState.players.length;
  }
  
  // إذا عدنا إلى نفس اللاعب، ننتقل للمرحلة التالية
  if (nextPlayerIndex === playerIndex || nextPlayerIndex === 0) {
    // الانتقال للمرحلة التالية
    switch (newGameState.currentRound.gamePhase) {
      case GamePhase.PREFLOP:
        newGameState.currentRound.gamePhase = GamePhase.FLOP;
        break;
      case GamePhase.FLOP:
        newGameState.currentRound.gamePhase = GamePhase.TURN;
        break;
      case GamePhase.TURN:
        newGameState.currentRound.gamePhase = GamePhase.RIVER;
        break;
      case GamePhase.RIVER:
        newGameState.currentRound.gamePhase = GamePhase.SHOWDOWN;
        break;
    }
    
    // إعادة تعيين مراهنات الجولة الحالية
    newGameState.players.forEach((p: any) => {
      p.betAmount = 0;
    });
    
    // تعيين أول لاعب نشط
    const firstActiveIndex = newGameState.players.findIndex((p: any) => !p.folded && !p.isAllIn);
    if (firstActiveIndex !== -1) {
      newGameState.players[firstActiveIndex].isCurrentTurn = true;
    }
  } else {
    // تعيين اللاعب التالي
    newGameState.players[nextPlayerIndex].isCurrentTurn = true;
  }
  
  return newGameState;
};