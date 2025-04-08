import { Card, GamePhase, PlayerAction, calculateHandStrength, evaluatePlayerHand, rotateDealer, determineBlindPositions, determineFirstToAct, createDeck, shuffleDeck } from './poker-engine';
// استيراد مكتبة pokersolver
import * as pokerSolver from 'pokersolver';

/**
 * واجهة اللاعب في اللعبة
 */
export interface GamePlayer {
  id: number;                // معرف اللاعب
  username: string;          // اسم اللاعب
  chips: number;             // رقائق اللاعب
  position: number;          // موقع اللاعب على الطاولة
  cards: Card[];             // بطاقات اللاعب
  folded: boolean;           // هل انسحب اللاعب؟
  betAmount: number;         // مبلغ الرهان الحالي
  isAllIn: boolean;          // هل وضع اللاعب كل رقائقه؟
  isActive: boolean;         // هل اللاعب نشط؟
  isCurrentTurn: boolean;    // هل دور اللاعب الحالي؟
  avatar?: string | null;    // صورة اللاعب
  isAI?: boolean;            // هل هو لاعب وهمي (ذكاء اصطناعي)؟
}

/**
 * واجهة حالة الجولة
 */
export interface GameRound {
  roundNumber: number;               // رقم الجولة
  deck: Card[];                      // مجموعة البطاقات
  communityCards: Card[];            // بطاقات المجتمع المكشوفة
  pot: number;                       // المبلغ الإجمالي في البوت
  sidePots: SidePot[];               // البوت الجانبية في حالة All-In
  currentBet: number;                // قيمة الرهان الحالي
  minRaise: number;                  // الحد الأدنى للزيادة
  dealer: number;                    // موقع الموزع
  smallBlind: {position: number, amount: number};  // المكفوف الصغير (الموقع والقيمة)
  bigBlind: {position: number, amount: number};    // المكفوف الكبير (الموقع والقيمة)
  currentTurn: number;               // دور اللاعب الحالي
  lastRaisePosition: number;         // موقع آخر لاعب قام بالزيادة
  gamePhase: GamePhase;              // مرحلة اللعبة الحالية
  bettingRoundComplete: boolean;     // هل انتهت جولة المراهنة الحالية؟
  actionHistory: GameAction[];       // سجل الإجراءات في الجولة الحالية
  turnStartTime: number;             // وقت بدء دور اللاعب الحالي
  turnTimeLimit: number;             // الحد الزمني المسموح لكل دور (بالثواني)
  turnTimeoutId?: NodeJS.Timeout;    // معرف مؤقت انتهاء الوقت
}

/**
 * واجهة البوت الجانبي (في حالة All-In)
 */
export interface SidePot {
  amount: number;            // قيمة البوت الجانبي
  eligiblePlayers: number[]; // معرفات اللاعبين المؤهلين لهذا البوت
}

/**
 * واجهة إجراء في اللعبة
 */
export interface GameAction {
  playerId: number;          // معرف اللاعب
  action: PlayerAction;      // نوع الإجراء (طي، تمرير، مجاراة، زيادة، كل الرقائق)
  amount?: number;           // قيمة الإجراء (إن وجدت)
  timestamp: number;         // وقت تنفيذ الإجراء
}

/**
 * واجهة نتيجة إجراء في اللعبة
 */
export interface ActionResult {
  success: boolean;          // هل نجح الإجراء؟
  message?: string;          // رسالة توضيحية (إن وجدت)
  gameStateChanged?: boolean; // هل تغيرت حالة اللعبة؟
  gamePhaseChanged?: boolean; // هل تغيرت مرحلة اللعبة؟
  roundComplete?: boolean;    // هل انتهت الجولة؟
  winners?: WinnerInfo[];     // معلومات الفائزين (إن وجدت)
}

/**
 * واجهة معلومات الفائز
 */
export interface WinnerInfo {
  playerId: number;          // معرف اللاعب الفائز
  handDescription: string;   // وصف اليد الفائزة
  winningAmount: number;     // المبلغ الذي فاز به
  potNumber: number;         // رقم البوت (الرئيسي = 0، الجانبي > 0)
}

/**
 * واجهة حالة اللعبة
 */
export interface GameState {
  players: GamePlayer[];           // اللاعبين في اللعبة
  currentRound: GameRound;         // الجولة الحالية
  blindAmount: {small: number, big: number}; // قيم المكفوفين الصغير والكبير
  minBuyIn: number;                // الحد الأدنى للدخول
  maxBuyIn: number;                // الحد الأقصى للدخول
  isRunning: boolean;              // هل اللعبة جارية؟
  waitingForPlayers: boolean;      // هل ننتظر لاعبين إضافيين؟
  tableCardReveals: number;        // عدد بطاقات المجتمع المكشوفة
}

/**
 * فئة إدارة اللعبة
 */
export class GameManager {
  private state: GameState;
  
  /**
   * إنشاء مدير اللعبة جديد
   */
  constructor(
    blindAmount: {small: number, big: number} = {small: 5, big: 10},
    minBuyIn: number = 200,
    maxBuyIn: number = 2000
  ) {
    // تهيئة الحالة الأولية قبل استدعاء createNewRound
    this.state = {
      players: [],
      currentRound: {
        roundNumber: 0,
        deck: [],
        communityCards: [],
        pot: 0,
        sidePots: [],
        currentBet: 0,
        minRaise: blindAmount.big,
        dealer: 0,
        smallBlind: { position: 0, amount: blindAmount.small },
        bigBlind: { position: 0, amount: blindAmount.big },
        currentTurn: -1,
        lastRaisePosition: 0,
        gamePhase: GamePhase.PREFLOP,
        bettingRoundComplete: false,
        actionHistory: [],
        turnStartTime: 0,
        turnTimeLimit: 30
      },
      blindAmount,
      minBuyIn,
      maxBuyIn,
      isRunning: false,
      waitingForPlayers: true,
      tableCardReveals: 0
    };
    
    // بعد تهيئة الحالة الأولية، إنشاء جولة جديدة
    this.state.currentRound = this.createNewRound(0);
  }
  
  /**
   * الحصول على حالة اللعبة الحالية (نسخة للقراءة فقط)
   */
  public getGameState(): Readonly<GameState> {
    return this.state;
  }
  
  /**
   * إضافة لاعب إلى اللعبة
   */
  public addPlayer(
    id: number,
    username: string,
    chips: number,
    avatar?: string | null,
    position?: number,
    isAI: boolean = false
  ): {success: boolean, message?: string} {
    // التحقق من قيم الشريحة
    if (chips < this.state.minBuyIn) {
      return {
        success: false,
        message: `يجب أن يكون لديك على الأقل ${this.state.minBuyIn} رقاقة للانضمام.`
      };
    }
    
    if (chips > this.state.maxBuyIn) {
      chips = this.state.maxBuyIn;
    }
    
    // التحقق من عدم وجود اللاعب بالفعل
    if (this.state.players.some(p => p.id === id)) {
      return {
        success: false,
        message: 'أنت بالفعل في هذه اللعبة.'
      };
    }
    
    // التحقق من وجود مساحة في الطاولة
    if (this.state.players.length >= 9) {
      return {
        success: false,
        message: 'الطاولة ممتلئة. يرجى المحاولة لاحقاً.'
      };
    }
    
    // تحديد موقع اللاعب
    let playerPosition = position;
    if (playerPosition === undefined || this.state.players.some(p => p.position === playerPosition)) {
      // البحث عن موقع متاح
      const usedPositions = this.state.players.map(p => p.position);
      for (let pos = 0; pos < 9; pos++) {
        if (!usedPositions.includes(pos)) {
          playerPosition = pos;
          break;
        }
      }
    }
    
    // إنشاء لاعب جديد
    const newPlayer: GamePlayer = {
      id,
      username,
      chips,
      position: playerPosition || 0,
      cards: [],
      folded: false,
      betAmount: 0,
      isAllIn: false,
      isActive: true,
      isCurrentTurn: false,
      avatar,
      isAI
    };
    
    // إضافة اللاعب إلى القائمة
    this.state.players.push(newPlayer);
    
    // بدء اللعبة إذا وصلنا إلى الحد الأدنى للاعبين (2)
    if (this.state.players.length >= 2 && this.state.waitingForPlayers) {
      this.state.waitingForPlayers = false;
      this.startNewRound();
    }
    
    return {
      success: true
    };
  }
  
  /**
   * إزالة لاعب من اللعبة
   */
  public removePlayer(playerId: number): {success: boolean, message?: string, chips?: number} {
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      return {
        success: false,
        message: 'اللاعب غير موجود في هذه اللعبة.'
      };
    }
    
    const player = this.state.players[playerIndex];
    const chips = player.chips;
    
    // إزالة اللاعب
    this.state.players.splice(playerIndex, 1);
    
    // تحديث حالة اللعبة إذا كان اللاعب في دوره الحالي
    if (player.isCurrentTurn) {
      this.moveToNextPlayer();
    }
    
    // إنهاء الجولة إذا بقي أقل من لاعبين
    if (this.state.players.length < 2) {
      this.state.isRunning = false;
      this.state.waitingForPlayers = true;
    }
    
    return {
      success: true,
      chips
    };
  }
  
  /**
   * تنفيذ إجراء من قبل لاعب
   */
  public performAction(playerId: number, action: PlayerAction, amount?: number): ActionResult {
    // التحقق من وجود اللاعب
    const playerIndex = this.state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return {
        success: false,
        message: 'اللاعب غير موجود في هذه اللعبة.'
      };
    }
    
    const player = this.state.players[playerIndex];
    
    // التحقق من أن الدور هو دور اللاعب
    if (!player.isCurrentTurn) {
      return {
        success: false,
        message: 'ليس دورك.'
      };
    }
    
    // التحقق من أن اللاعب لم ينسحب أو يكون all-in
    if (player.folded || player.isAllIn) {
      return {
        success: false,
        message: player.folded ? 'لقد انسحبت من هذه الجولة.' : 'لقد وضعت كل رقائقك بالفعل.'
      };
    }
    
    // تسجيل الإجراء في التاريخ
    const actionRecord: GameAction = {
      playerId,
      action,
      amount,
      timestamp: Date.now()
    };
    
    this.state.currentRound.actionHistory.push(actionRecord);
    
    // تنفيذ الإجراء حسب نوعه
    let actionResult: ActionResult = { success: true };
    
    switch (action) {
      case PlayerAction.FOLD:
        actionResult = this.handleFold(player);
        break;
        
      case PlayerAction.CHECK:
        actionResult = this.handleCheck(player);
        break;
        
      case PlayerAction.CALL:
        actionResult = this.handleCall(player);
        break;
        
      case PlayerAction.RAISE:
        actionResult = this.handleRaise(player, amount || 0);
        break;
        
      case PlayerAction.ALL_IN:
        actionResult = this.handleAllIn(player);
        break;
        
      default:
        return {
          success: false,
          message: 'إجراء غير صالح.'
        };
    }
    
    // تحديث الحالة إذا نجح الإجراء
    if (actionResult.success) {
      // الانتقال إلى اللاعب التالي إذا لم تنتهِ الجولة
      if (!actionResult.roundComplete) {
        const nextTurnResult = this.moveToNextPlayer();
        
        // تحديث حالة تغيير المرحلة
        if (nextTurnResult.phaseChanged) {
          actionResult.gamePhaseChanged = true;
        }
      }
    }
    
    return actionResult;
  }
  
  /**
   * التعامل مع إجراء الانسحاب (Fold)
   */
  private handleFold(player: GamePlayer): ActionResult {
    // تعليم اللاعب كمنسحب
    player.folded = true;
    player.isCurrentTurn = false;
    
    // التحقق من انتهاء الجولة (لاعب واحد فقط متبقي)
    const activePlayers = this.state.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      // انتهت الجولة، اللاعب المتبقي هو الفائز
      const winner = activePlayers[0];
      
      // إعداد نتيجة الفوز
      const winnerInfo: WinnerInfo = {
        playerId: winner.id,
        handDescription: 'الفوز بانسحاب الجميع',
        winningAmount: this.state.currentRound.pot,
        potNumber: 0
      };
      
      // تحديث رقائق اللاعب الفائز
      winner.chips += this.state.currentRound.pot;
      
      return {
        success: true,
        gameStateChanged: true,
        roundComplete: true,
        winners: [winnerInfo]
      };
    }
    
    return {
      success: true,
      gameStateChanged: true
    };
  }
  
  /**
   * التعامل مع إجراء التمرير (Check)
   */
  private handleCheck(player: GamePlayer): ActionResult {
    // التحقق من إمكانية التمرير (لا يوجد رهان حالي)
    if (this.state.currentRound.currentBet > player.betAmount) {
      return {
        success: false,
        message: 'لا يمكن التمرير. يجب عليك المجاراة أو الزيادة أو الانسحاب.'
      };
    }
    
    // تنفيذ التمرير
    player.isCurrentTurn = false;
    
    return {
      success: true,
      gameStateChanged: true
    };
  }
  
  /**
   * التعامل مع إجراء المجاراة (Call)
   */
  private handleCall(player: GamePlayer): ActionResult {
    const currentBet = this.state.currentRound.currentBet;
    const amountToCall = currentBet - player.betAmount;
    
    // التحقق من عدم الحاجة للمجاراة (لا يوجد رهان)
    if (amountToCall === 0) {
      return this.handleCheck(player);
    }
    
    // التحقق من كفاية الرقائق
    if (player.chips <= amountToCall) {
      // اللاعب لا يملك رقائق كافية، يذهب all-in بدلاً من المجاراة
      return this.handleAllIn(player);
    }
    
    // تنفيذ المجاراة
    player.chips -= amountToCall;
    player.betAmount = currentBet;
    this.state.currentRound.pot += amountToCall;
    player.isCurrentTurn = false;
    
    return {
      success: true,
      gameStateChanged: true
    };
  }
  
  /**
   * التعامل مع إجراء الزيادة (Raise)
   */
  private handleRaise(player: GamePlayer, amount: number): ActionResult {
    const currentBet = this.state.currentRound.currentBet;
    const minRaise = this.state.currentRound.minRaise;
    const totalBet = player.betAmount + amount;
    
    // التحقق من أن الزيادة تلبي الحد الأدنى
    if (totalBet < currentBet + minRaise) {
      return {
        success: false,
        message: `يجب أن تكون الزيادة على الأقل ${minRaise} رقاقة فوق الرهان الحالي.`
      };
    }
    
    // التحقق من كفاية الرقائق
    if (player.chips < amount) {
      return {
        success: false,
        message: 'ليس لديك رقائق كافية لهذه الزيادة.'
      };
    }
    
    // تنفيذ الزيادة
    player.chips -= amount;
    this.state.currentRound.pot += amount;
    player.betAmount += amount;
    this.state.currentRound.currentBet = player.betAmount;
    this.state.currentRound.minRaise = player.betAmount - currentBet; // تحديث الحد الأدنى للزيادة
    this.state.currentRound.lastRaisePosition = player.position;
    player.isCurrentTurn = false;
    
    // إعادة تعيين حالة إكمال جولة المراهنة
    this.state.currentRound.bettingRoundComplete = false;
    
    return {
      success: true,
      gameStateChanged: true
    };
  }
  
  /**
   * التعامل مع إجراء وضع كل الرقائق (All-In)
   */
  private handleAllIn(player: GamePlayer): ActionResult {
    const chips = player.chips;
    const currentBet = this.state.currentRound.currentBet;
    const totalBet = player.betAmount + chips;
    
    // تنفيذ الـ all-in
    player.chips = 0;
    this.state.currentRound.pot += chips;
    player.betAmount += chips;
    player.isAllIn = true;
    player.isCurrentTurn = false;
    
    // إذا كان المبلغ الإجمالي أكبر من الرهان الحالي، فهذا يعتبر زيادة
    if (totalBet > currentBet) {
      this.state.currentRound.currentBet = totalBet;
      this.state.currentRound.minRaise = totalBet - currentBet; // تحديث الحد الأدنى للزيادة
      this.state.currentRound.lastRaisePosition = player.position;
      
      // إنشاء بوت جانبي إذا لزم الأمر
      this.createSidePots();
      
      // إعادة تعيين حالة إكمال جولة المراهنة
      this.state.currentRound.bettingRoundComplete = false;
    }
    
    return {
      success: true,
      gameStateChanged: true
    };
  }
  
  /**
   * الانتقال إلى اللاعب التالي
   */
  private moveToNextPlayer(): { phaseChanged: boolean } {
    let phaseChanged = false;
    const round = this.state.currentRound;
    const activePlayers = this.state.players.filter(p => !p.folded && !p.isAllIn && p.isActive);
    
    // إيقاف مؤقت الدور الحالي إذا كان نشطاً
    if (round.turnTimeoutId) {
      clearTimeout(round.turnTimeoutId);
      round.turnTimeoutId = undefined;
    }
    
    // التحقق من انتهاء جولة المراهنة
    if (
      this.isBettingRoundComplete() ||
      activePlayers.length <= 1 ||
      this.state.players.every(p => p.folded || p.isAllIn || p.betAmount === round.currentBet)
    ) {
      // انتهت جولة المراهنة، الانتقال إلى المرحلة التالية
      round.bettingRoundComplete = true;
      phaseChanged = this.moveToNextPhase();
      return { phaseChanged };
    }
    
    // العثور على اللاعب الحالي
    const currentPlayerIndex = this.state.players.findIndex(p => p.isCurrentTurn);
    let nextPlayerIndex = -1;
    
    // تعيين isCurrentTurn للاعب الحالي إلى false
    if (currentPlayerIndex !== -1) {
      this.state.players[currentPlayerIndex].isCurrentTurn = false;
    }
    
    // العثور على اللاعب التالي النشط
    for (let i = 1; i <= this.state.players.length; i++) {
      const index = (currentPlayerIndex + i) % this.state.players.length;
      const player = this.state.players[index];
      
      if (!player.folded && !player.isAllIn && player.isActive) {
        nextPlayerIndex = index;
        break;
      }
    }
    
    // إذا لم يتم العثور على أي لاعب نشط، انتقل إلى المرحلة التالية
    if (nextPlayerIndex === -1) {
      round.bettingRoundComplete = true;
      phaseChanged = this.moveToNextPhase();
      return { phaseChanged };
    }
    
    // تعيين الدور إلى اللاعب التالي
    this.state.players[nextPlayerIndex].isCurrentTurn = true;
    round.currentTurn = this.state.players[nextPlayerIndex].position;
    round.turnStartTime = Date.now();
    
    // إعداد مؤقت لانتهاء الوقت
    this.setTurnTimer(this.state.players[nextPlayerIndex].id);
    
    return { phaseChanged };
  }
  
  /**
   * الانتقال إلى المرحلة التالية من اللعبة
   */
  private moveToNextPhase(): boolean {
    const round = this.state.currentRound;
    
    // تحديث جميع اللاعبين لبدء جولة مراهنة جديدة
    for (const player of this.state.players) {
      player.isCurrentTurn = false;
    }
    
    // إضافة سجل للتاريخ يوضح نهاية المرحلة الحالية
    round.actionHistory.push({
      playerId: -1, // -1 يشير إلى إجراء النظام
      action: PlayerAction.CHECK, // استخدام CHECK كإجراء افتراضي
      timestamp: Date.now(),
      amount: 0
    });
    
    // تحديد المرحلة الحالية والانتقال إلى المرحلة التالية
    let newPhase: GamePhase;
    
    switch (round.gamePhase) {
      case GamePhase.PREFLOP:
        // كشف بطاقات الفلوب (3 بطاقات)
        this.dealCommunityCards(3);
        newPhase = GamePhase.FLOP;
        break;
        
      case GamePhase.FLOP:
        // كشف بطاقة التيرن (البطاقة الرابعة)
        this.dealCommunityCards(1);
        newPhase = GamePhase.TURN;
        break;
        
      case GamePhase.TURN:
        // كشف بطاقة الريفر (البطاقة الخامسة)
        this.dealCommunityCards(1);
        newPhase = GamePhase.RIVER;
        break;
        
      case GamePhase.RIVER:
        // انتهاء الجولة، إظهار البطاقات
        return this.handleShowdown();
        
      default:
        return false;
    }
    
    // اسجل المرحلة الجديدة في سجل التاريخ
    round.gamePhase = newPhase;
    round.actionHistory.push({
      playerId: -1, // -1 يشير إلى إجراء النظام
      action: PlayerAction.CHECK, // استخدام CHECK كإجراء افتراضي
      timestamp: Date.now(),
      amount: 0
    });
    
    // إعادة تعيين متغيرات المراهنة لجولة جديدة
    round.currentBet = 0;
    round.minRaise = this.state.blindAmount.big;
    round.bettingRoundComplete = false;
    
    // إعادة تعيين قيم الرهان للاعبين، مع الاحتفاظ بإجمالي الرهانات في البوت
    for (const player of this.state.players) {
      if (!player.folded && !player.isAllIn) {
        player.betAmount = 0;
      }
    }
    
    // تعيين اللاعب الأول في الجولة الجديدة
    const firstPlayerPosition = determineFirstToAct(
      round.dealer,
      this.state.players.length,
      round.gamePhase
    );
    
    // العثور على أول لاعب نشط
    let found = false;
    for (let i = 0; i < this.state.players.length; i++) {
      const position = (firstPlayerPosition + i) % this.state.players.length;
      const player = this.state.players.find(p => p.position === position && !p.folded && !p.isAllIn);
      
      if (player) {
        player.isCurrentTurn = true;
        round.currentTurn = player.position;
        round.turnStartTime = Date.now();
        
        // إعداد مؤقت لدور اللاعب الجديد
        this.setTurnTimer(player.id);
        
        found = true;
        break;
      }
    }
    
    // إذا لم يتم العثور على لاعب نشط، انتقل إلى مرحلة إظهار البطاقات
    if (!found) {
      // إذا وصلنا إلى الريفر بالفعل، انتقل مباشرة إلى الـ showdown
      if (round.gamePhase === GamePhase.RIVER) {
        return this.handleShowdown();
      }
      
      // وإلا، انتقل إلى المرحلة التالية
      return this.moveToNextPhase();
    }
    
    return true;
  }
  
  /**
   * التعامل مع مرحلة إظهار البطاقات وحساب الفائز (Showdown)
   */
  private handleShowdown(): boolean {
    const round = this.state.currentRound;
    round.gamePhase = GamePhase.SHOWDOWN;
    
    // جمع اللاعبين النشطين (غير المنسحبين)
    const activePlayers = this.state.players.filter(p => !p.folded);
    
    // إذا بقي لاعب واحد فقط، فهو الفائز تلقائياً
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      winner.chips += round.pot;
      
      // إعداد نتيجة الفوز
      const winnerInfo: WinnerInfo = {
        playerId: winner.id,
        handDescription: 'الفوز بانسحاب الجميع',
        winningAmount: round.pot,
        potNumber: 0
      };
      
      // إعادة تعيين القيم استعداداً للجولة التالية
      this.resetForNextRound([winnerInfo]);
      
      return true;
    }
    
    // كشف جميع بطاقات اللاعبين
    activePlayers.forEach(player => {
      // عند المرحلة النهائية، يتم كشف جميع البطاقات
      player.cards.forEach(card => {
        card.hidden = false;
      });
    });
    
    // تقييم أيدي جميع اللاعبين بأستخدام pokersolver للحصول على تقييم دقيق
    const playerHands = activePlayers.map(player => {
      const evaluation = evaluatePlayerHand(player.cards, round.communityCards);
      return {
        player,
        evaluation,
        handStrength: evaluation.strength
      };
    });
    
    // توفير تفاصيل عن اليد لكل لاعب
    const handDetails = playerHands.map(ph => {
      return {
        playerId: ph.player.id,
        username: ph.player.username,
        handType: ph.evaluation.handType,
        description: ph.evaluation.description,
        strength: ph.evaluation.strength
      };
    });
    
    // إضافة تفاصيل اليد إلى سجل التاريخ للرجوع إليها لاحقًا
    round.actionHistory.push({
      playerId: -1, // -1 للإشارة إلى أنه حدث نظام
      action: PlayerAction.CHECK, // استخدام CHECK كنوع إجراء افتراضي
      timestamp: Date.now(),
      amount: 0,
      // يمكن إضافة معلومات مخصصة هنا أيضًا
    });
    
    // ترتيب اللاعبين حسب قوة اليد (من الأقوى إلى الأضعف) باستخدام التقييم المحسن
    playerHands.sort((a, b) => b.handStrength - a.handStrength);
    
    // تقسيم البوت بين الفائزين
    let winners: WinnerInfo[] = [];
    
    // التعامل مع البوت الرئيسي
    const mainPotWinners = this.determineWinners(playerHands, round.pot, 0);
    winners = winners.concat(mainPotWinners);
    
    // التعامل مع البوت الجانبية إذا وجدت
    for (let i = 0; i < round.sidePots.length; i++) {
      const sidePot = round.sidePots[i];
      const eligiblePlayers = playerHands.filter(ph => 
        sidePot.eligiblePlayers.includes(ph.player.id)
      );
      
      const sidePotWinners = this.determineWinners(eligiblePlayers, sidePot.amount, i + 1);
      winners = winners.concat(sidePotWinners);
    }
    
    // إضافة معلومات الفائزين إلى سجل التاريخ
    if (winners.length > 0) {
      const winnerIds = winners.map(w => w.playerId);
      const winnerUsernames = winners.map(w => {
        const player = this.state.players.find(p => p.id === w.playerId);
        return player ? player.username : 'غير معروف';
      });
      
      round.actionHistory.push({
        playerId: -2, // -2 للإشارة إلى إعلان الفائزين
        action: PlayerAction.CHECK, // استخدام CHECK كنوع إجراء افتراضي
        timestamp: Date.now(),
        amount: 0,
        // يمكن إضافة معلومات مخصصة هنا أيضًا
      });
    }
    
    // إعادة تعيين القيم استعداداً للجولة التالية
    this.resetForNextRound(winners);
    
    return true;
  }
  
  /**
   * تحديد الفائزين وتوزيع البوت باستخدام مكتبة pokersolver
   */
  private determineWinners(
    rankedPlayers: { player: GamePlayer; evaluation: any; handStrength: number }[],
    potAmount: number,
    potNumber: number
  ): WinnerInfo[] {
    // إذا لم يكن هناك لاعبين، أرجع قائمة فارغة
    if (rankedPlayers.length === 0) {
      return [];
    }
    
    const winners: WinnerInfo[] = [];
    
    // استخدام solverResult الأصلي من تقييم اليد
    // هذا يسمح لنا باستخدام وظيفة المقارنة المدمجة في pokersolver
    const solverResults = rankedPlayers
      .filter(p => p.evaluation && p.evaluation.solverResult)
      .map(p => p.evaluation.solverResult);
    
    // إذا تمكنا من استخدام pokersolver للمقارنة
    if (solverResults.length === rankedPlayers.length && solverResults.length > 0) {
      // استخدام Hand.winners لتحديد الأيدي الفائزة
      const winningHands = pokerSolver.Hand.winners(solverResults);
      
      // تحديد اللاعبين الذين يملكون الأيدي الفائزة
      const potWinners = rankedPlayers.filter(p => 
        winningHands.some((wh: any) => 
          wh.name === p.evaluation.solverResult.name && 
          JSON.stringify(wh.cards) === JSON.stringify(p.evaluation.solverResult.cards)
        )
      );
      
      // حساب المبلغ الذي يفوز به كل لاعب
      const winAmount = Math.floor(potAmount / potWinners.length);
      
      // توزيع البوت على الفائزين
      for (const winner of potWinners) {
        winner.player.chips += winAmount;
        
        winners.push({
          playerId: winner.player.id,
          handDescription: winner.evaluation.description,
          winningAmount: winAmount,
          potNumber
        });
      }
    } else {
      // طريقة احتياطية: استخدام handStrength كما كان سابقًا
      const highestStrength = Math.max(...rankedPlayers.map(p => p.handStrength));
      const potWinners = rankedPlayers.filter(p => p.handStrength === highestStrength);
      const winAmount = Math.floor(potAmount / potWinners.length);
      
      // توزيع البوت على الفائزين
      for (const winner of potWinners) {
        winner.player.chips += winAmount;
        
        winners.push({
          playerId: winner.player.id,
          handDescription: winner.evaluation.description,
          winningAmount: winAmount,
          potNumber
        });
      }
    }
    
    return winners;
  }
  
  /**
   * إعادة تعيين اللعبة للجولة التالية
   */
  private resetForNextRound(winners: WinnerInfo[]): void {
    // إزالة اللاعبين الذين ليس لديهم رقائق
    this.state.players = this.state.players.filter(p => p.chips > 0);
    
    // إذا بقي أقل من لاعبين، انتظر لاعبين جدد
    if (this.state.players.length < 2) {
      this.state.isRunning = false;
      this.state.waitingForPlayers = true;
      return;
    }
    
    // إعداد جولة جديدة
    this.startNewRound();
  }
  
  /**
   * بدء جولة جديدة
   */
  private startNewRound(): void {
    // تدوير موقع الموزع
    const newDealerPosition = rotateDealer(
      this.state.currentRound.dealer,
      this.state.players.length
    );
    
    // إنشاء جولة جديدة
    this.state.currentRound = this.createNewRound(newDealerPosition);
    this.state.isRunning = true;
    
    // توزيع البطاقات على اللاعبين
    this.dealPlayerCards();
    
    // وضع المكفوفين (small blind & big blind)
    this.placeBlindBets();
    
    // تحديد أول لاعب
    const firstToAct = determineFirstToAct(
      newDealerPosition,
      this.state.players.length,
      GamePhase.PREFLOP
    );
    
    // العثور على اللاعب الفعلي الذي سيلعب أولاً
    for (let i = 0; i < this.state.players.length; i++) {
      const position = (firstToAct + i) % this.state.players.length;
      const player = this.state.players.find(p => p.position === position);
      
      if (player && !player.folded && !player.isAllIn) {
        player.isCurrentTurn = true;
        this.state.currentRound.currentTurn = player.position;
        this.state.currentRound.turnStartTime = Date.now();
        
        // إعداد مؤقت لانتهاء وقت اللاعب
        this.setTurnTimer(player.id);
        break;
      }
    }
  }
  
  /**
   * إنشاء جولة جديدة
   */
  private createNewRound(dealerPosition: number): GameRound {
    // إنشاء وخلط مجموعة البطاقات
    const deck = shuffleDeck(createDeck());
    
    // تحديد مواقع المكفوفين - استخدام 2 كقيمة افتراضية لعدد اللاعبين إذا كانت players غير موجودة
    const playerCount = this.state?.players?.length || 2;
    const blindPositions = determineBlindPositions(dealerPosition, playerCount);
    
    // استخدام blindAmount من this.state إذا كان موجودًا، وإلا استخدام القيم الافتراضية
    const smallBlindAmount = this.state?.blindAmount?.small || 5;
    const bigBlindAmount = this.state?.blindAmount?.big || 10;
    
    return {
      roundNumber: this.state?.currentRound ? this.state.currentRound.roundNumber + 1 : 1,
      deck,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentBet: bigBlindAmount,
      minRaise: bigBlindAmount,
      dealer: dealerPosition,
      smallBlind: {
        position: blindPositions.smallBlind,
        amount: smallBlindAmount
      },
      bigBlind: {
        position: blindPositions.bigBlind,
        amount: bigBlindAmount
      },
      currentTurn: -1,
      lastRaisePosition: blindPositions.bigBlind,
      gamePhase: GamePhase.PREFLOP,
      bettingRoundComplete: false,
      actionHistory: [],
      turnStartTime: 0,
      turnTimeLimit: 30 // 30 ثانية للدور
    };
  }
  
  /**
   * توزيع البطاقات على اللاعبين
   */
  private dealPlayerCards(): void {
    // إعادة تعيين بطاقات اللاعبين وحالاتهم
    for (const player of this.state.players) {
      player.cards = [];
      player.folded = false;
      player.betAmount = 0;
      player.isAllIn = false;
      player.isCurrentTurn = false;
    }
    
    // توزيع بطاقتين لكل لاعب
    for (let i = 0; i < 2; i++) {
      for (const player of this.state.players) {
        if (this.state.currentRound.deck.length > 0) {
          const card = this.state.currentRound.deck.pop()!;
          player.cards.push(card);
        }
      }
    }
  }
  
  /**
   * توزيع بطاقات المجتمع (community cards)
   */
  private dealCommunityCards(count: number): void {
    const round = this.state.currentRound;
    
    for (let i = 0; i < count; i++) {
      if (round.deck.length > 0) {
        const card = round.deck.pop()!;
        card.hidden = false; // بطاقات المجتمع مكشوفة دائماً
        round.communityCards.push(card);
      }
    }
    
    this.state.tableCardReveals += count;
  }
  
  /**
   * وضع المكفوفين (small blind & big blind)
   */
  private placeBlindBets(): void {
    const round = this.state.currentRound;
    
    // العثور على لاعب المكفوف الصغير
    const smallBlindPlayer = this.state.players.find(p => p.position === round.smallBlind.position);
    
    // العثور على لاعب المكفوف الكبير
    const bigBlindPlayer = this.state.players.find(p => p.position === round.bigBlind.position);
    
    // وضع المكفوف الصغير
    if (smallBlindPlayer) {
      const smallBlindAmount = Math.min(smallBlindPlayer.chips, round.smallBlind.amount);
      smallBlindPlayer.chips -= smallBlindAmount;
      smallBlindPlayer.betAmount = smallBlindAmount;
      round.pot += smallBlindAmount;
      
      // التحقق من all-in
      if (smallBlindPlayer.chips === 0) {
        smallBlindPlayer.isAllIn = true;
      }
    }
    
    // وضع المكفوف الكبير
    if (bigBlindPlayer) {
      const bigBlindAmount = Math.min(bigBlindPlayer.chips, round.bigBlind.amount);
      bigBlindPlayer.chips -= bigBlindAmount;
      bigBlindPlayer.betAmount = bigBlindAmount;
      round.pot += bigBlindAmount;
      
      // تحديث الرهان الحالي
      round.currentBet = bigBlindAmount;
      
      // التحقق من all-in
      if (bigBlindPlayer.chips === 0) {
        bigBlindPlayer.isAllIn = true;
      }
    }
  }
  
  /**
   * إنشاء بوت جانبية (side pots) في حالة all-in
   */
  private createSidePots(): void {
    const round = this.state.currentRound;
    const activePlayers = this.state.players.filter(p => !p.folded);
    
    // التحقق من وجود لاعبين all-in
    const allInPlayers = activePlayers.filter(p => p.isAllIn);
    if (allInPlayers.length === 0) {
      return;
    }
    
    // ترتيب اللاعبين حسب قيمة الرهان (من الأقل إلى الأكبر)
    const sortedPlayers = [...activePlayers].sort((a, b) => a.betAmount - b.betAmount);
    
    // إعادة تعيين البوت الجانبية
    round.sidePots = [];
    
    // إنشاء البوت الجانبية من أصغر all-in بيت
    let processedBet = 0;
    for (const player of sortedPlayers) {
      if (player.isAllIn) {
        const currentBet = player.betAmount;
        const potAmount = (currentBet - processedBet) * sortedPlayers.length;
        
        // تحديد اللاعبين المؤهلين لهذا البوت
        const eligiblePlayers = sortedPlayers.filter(p => p.betAmount >= currentBet).map(p => p.id);
        
        // إنشاء البوت الجانبي
        round.sidePots.push({
          amount: potAmount,
          eligiblePlayers
        });
        
        processedBet = currentBet;
      }
    }
  }
  
  /**
   * إعداد مؤقت لانتهاء وقت دور اللاعب
   */
  private setTurnTimer(playerId: number): void {
    const round = this.state.currentRound;
    
    // إلغاء أي مؤقت سابق
    if (round.turnTimeoutId) {
      clearTimeout(round.turnTimeoutId);
    }
    
    // إعداد مؤقت جديد
    round.turnTimeoutId = setTimeout(() => {
      // اتخاذ إجراء تلقائي عند انتهاء الوقت
      const player = this.state.players.find(p => p.id === playerId);
      if (player && player.isCurrentTurn) {
        // إذا كان اللاعب يمكنه التمرير، سيفعل ذلك، وإلا سينسحب
        if (player.betAmount === round.currentBet) {
          this.performAction(playerId, PlayerAction.CHECK);
        } else {
          this.performAction(playerId, PlayerAction.FOLD);
        }
      }
    }, round.turnTimeLimit * 1000);
  }
  
  /**
   * التحقق من اكتمال جولة المراهنة
   */
  private isBettingRoundComplete(): boolean {
    const round = this.state.currentRound;
    
    // إذا كانت الجولة مكتملة بالفعل
    if (round.bettingRoundComplete) {
      return true;
    }
    
    // جمع اللاعبين النشطين
    const activePlayers = this.state.players.filter(p => !p.folded && !p.isAllIn);
    
    // إذا بقي لاعب واحد فقط أو أقل، الجولة مكتملة
    if (activePlayers.length <= 1) {
      return true;
    }
    
    // التحقق من أن جميع اللاعبين قد راهنوا بنفس المبلغ
    const allBetsEqual = activePlayers.every(p => p.betAmount === round.currentBet);
    
    // التحقق من أن كل لاعب قد لعب دوره منذ آخر زيادة
    let lastRaisePlayerIndex = -1;
    for (let i = 0; i < this.state.players.length; i++) {
      if (this.state.players[i].position === round.lastRaisePosition) {
        lastRaisePlayerIndex = i;
        break;
      }
    }
    
    // الحصول على آخر لاعب قام بإجراء
    const lastActionIndex = round.actionHistory.length - 1;
    let lastPlayerAction = -1;
    if (lastActionIndex >= 0) {
      const lastAction = round.actionHistory[lastActionIndex];
      const lastPlayer = this.state.players.find(p => p.id === lastAction.playerId);
      if (lastPlayer) {
        lastPlayerAction = this.state.players.indexOf(lastPlayer);
      }
    }
    
    // إذا كان آخر لاعب قام بإجراء هو اللاعب قبل آخر من رفع، وجميع الرهانات متساوية
    return allBetsEqual && (lastPlayerAction === lastRaisePlayerIndex - 1 || lastPlayerAction === this.state.players.length - 1 && lastRaisePlayerIndex === 0);
  }
}