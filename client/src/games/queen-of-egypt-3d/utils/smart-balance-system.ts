/**
 * نظام ذكي لتوازن الربح والخسارة في لعبة "ملكة مصر 3D"
 * يتحكم في احتمالية الفوز/الخسارة مع الحفاظ على تجربة لاعب ممتعة ومتوازنة
 */

// قيم الرموز المختلفة في اللعبة (تم تحديثها بناءً على الرموز الجديدة)
export enum SymbolValue {
  QUEEN = 300,      // تاج الملكة
  CAT = 200,        // القطة المصرية
  FALCON = 150,     // صقر حورس
  POTTERY = 100,    // الإناء الفخاري
  COBRA = 50        // الكوبرا
}

// أنواع الفوز المختلفة
export enum WinType {
  SMALL_WIN = 'SMALL_WIN',         // ربح صغير
  MEDIUM_WIN = 'MEDIUM_WIN',       // ربح متوسط
  BIG_WIN = 'BIG_WIN',             // ربح كبير
  MEGA_WIN = 'MEGA_WIN',           // ربح ضخم
  SUPER_MEGA_WIN = 'SUPER_MEGA_WIN', // ربح ضخم للغاية
  JACKPOT = 'JACKPOT'              // جاكبوت
}

// واجهة إعدادات النظام الذكي
interface SmartBalanceConfig {
  minBet: number;             // الحد الأدنى للرهان
  maxBet: number;             // الحد الأقصى للرهان
  baseWinChance: number;      // احتمالية الفوز الأساسية (0-1)
  lossStreak: number;         // عدد الخسارات المتتالية الحالية
  winStreak: number;          // عدد مرات الفوز المتتالية الحالية
  balanceRatio: number;       // نسبة التوازن (أقل من 1: ميل للخسارة، أكبر من 1: ميل للربح)
  maxLossStreak: number;      // الحد الأقصى للخسارات المتتالية قبل منح ربح مؤكد
  playerBalance: number;      // رصيد اللاعب الحالي
  playerHistory: GameResult[]; // سجل نتائج اللاعب السابقة
}

// واجهة نتيجة جولة اللعب
export interface GameResult {
  isWin: boolean;              // هل الجولة فوز أم خسارة
  betAmount: number;           // قيمة الرهان
  winAmount: number;           // قيمة الربح (0 في حالة الخسارة)
  winType: WinType | null;     // نوع الفوز (null في حالة الخسارة)
  symbols: number[];           // الرموز التي ظهرت في الدوران
  timestamp: number;           // توقيت الجولة
}

/**
 * فئة النظام الذكي للتوازن
 * تتحكم في نتائج دورات اللاعب بذكاء للحفاظ على تجربة متوازنة
 */
export class SmartBalanceSystem {
  private config: SmartBalanceConfig;
  
  constructor(initialConfig?: Partial<SmartBalanceConfig>) {
    // الإعدادات الافتراضية
    this.config = {
      minBet: 10,
      maxBet: 1000,
      baseWinChance: 0.4,    // 40% فرصة الفوز الأساسية
      lossStreak: 0,
      winStreak: 0,
      balanceRatio: 0.95,    // ميل طفيف للخسارة (95%)
      maxLossStreak: 5,      // بعد 5 خسارات متتالية، زيادة فرصة الفوز بشكل كبير
      playerBalance: 1000,
      playerHistory: []
      
      // دمج الإعدادات المخصصة إذا تم توفيرها
      ,...initialConfig
    };
  }
  
  /**
   * تحديث إعدادات النظام
   */
  public updateConfig(newConfig: Partial<SmartBalanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * الحصول على احتمالية الفوز الحالية استنادا إلى سجل اللاعب والتوازن
   */
  public getCurrentWinProbability(betAmount: number): number {
    let probability = this.config.baseWinChance;
    
    // زيادة احتمالية الفوز مع زيادة عدد الخسارات المتتالية
    if (this.config.lossStreak > 0) {
      // زيادة الاحتمالية بنسبة 10% لكل خسارة متتالية
      probability += 0.1 * this.config.lossStreak;
    }
    
    // تقليل احتمالية الفوز مع زيادة عدد مرات الفوز المتتالية
    if (this.config.winStreak > 1) {
      // تقليل الاحتمالية بنسبة 15% لكل فوز متتالي بعد الأول
      probability -= 0.15 * (this.config.winStreak - 1);
    }
    
    // التأكد من أن الاحتمالية عالية جدا بعد العديد من الخسارات المتتالية
    if (this.config.lossStreak >= this.config.maxLossStreak) {
      probability = 0.9; // 90% احتمالية الفوز بعد سلسلة خسائر طويلة
    }
    
    // ضبط الاحتمالية بناءً على حجم الرهان نسبة إلى رصيد اللاعب
    const betRatio = betAmount / this.config.playerBalance;
    if (betRatio > 0.2) {
      // تقليل فرص الفوز في الرهانات الكبيرة (أكثر من 20% من الرصيد)
      probability *= (1 - betRatio * 0.5);
    }
    
    // تطبيق نسبة التوازن العامة
    probability *= this.config.balanceRatio;
    
    // ضمان أن الاحتمالية في النطاق [0, 1]
    return Math.max(0, Math.min(1, probability));
  }
  
  /**
   * تحديد إذا كانت هذه الجولة ستكون فوزًا أم خسارة
   */
  public determineWinOrLoss(betAmount: number): boolean {
    const winProbability = this.getCurrentWinProbability(betAmount);
    const random = Math.random();
    
    return random < winProbability;
  }
  
  /**
   * تحديد نوع الفوز بناءً على الاحتمالات المختلفة
   */
  public determineWinType(betAmount: number): WinType {
    const random = Math.random();
    
    // توزيع احتمالات أنواع الفوز
    if (random < 0.01) {
      return WinType.JACKPOT;          // 1% فرصة للجاكبوت
    } else if (random < 0.03) {
      return WinType.SUPER_MEGA_WIN;   // 2% فرصة للفوز الضخم للغاية
    } else if (random < 0.08) {
      return WinType.MEGA_WIN;         // 5% فرصة للفوز الضخم
    } else if (random < 0.20) {
      return WinType.BIG_WIN;          // 12% فرصة للفوز الكبير
    } else if (random < 0.50) {
      return WinType.MEDIUM_WIN;       // 30% فرصة للفوز المتوسط
    } else {
      return WinType.SMALL_WIN;        // 50% فرصة للفوز الصغير
    }
  }
  
  /**
   * حساب مقدار الربح بناءً على نوع الفوز وقيمة الرهان
   */
  public calculateWinAmount(betAmount: number, winType: WinType): number {
    switch (winType) {
      case WinType.JACKPOT:
        return betAmount * 50;       // 50x الرهان
      case WinType.SUPER_MEGA_WIN:
        return betAmount * 25;       // 25x الرهان
      case WinType.MEGA_WIN:
        return betAmount * 15;       // 15x الرهان
      case WinType.BIG_WIN:
        return betAmount * 7;        // 7x الرهان
      case WinType.MEDIUM_WIN:
        return betAmount * 3;        // 3x الرهان
      case WinType.SMALL_WIN:
        return betAmount * 1.5;      // 1.5x الرهان
      default:
        return 0;
    }
  }
  
  /**
   * توليد الرموز للدوران بناءً على نتيجة الفوز/الخسارة
   */
  public generateSymbols(isWin: boolean, winType: WinType | null): number[] {
    // في هذا المثال، نستخدم أرقام من 0 إلى 4 لتمثيل الرموز المختلفة
    // 0 = تاج الملكة، 1 = القطة، 2 = الصقر، 3 = الإناء، 4 = الكوبرا
    
    const symbols: number[] = [];
    
    // في هذا المثال البسيط، نفترض أن لدينا 5 مواقع للرموز
    for (let i = 0; i < 5; i++) {
      // في حالة الفوز، نجعل بعض الرموز متطابقة
      if (isWin) {
        if (winType === WinType.JACKPOT) {
          // جاكبوت: كل الرموز تاج الملكة (0)
          symbols.push(0);
        } else if (winType === WinType.SUPER_MEGA_WIN || winType === WinType.MEGA_WIN) {
          // فوز ضخم: معظم الرموز قطة (1)
          symbols.push(i < 4 ? 1 : Math.floor(Math.random() * 5));
        } else if (winType === WinType.BIG_WIN) {
          // فوز كبير: معظم الرموز صقر (2)
          symbols.push(i < 3 ? 2 : Math.floor(Math.random() * 5));
        } else if (winType === WinType.MEDIUM_WIN) {
          // فوز متوسط: بعض الرموز إناء (3)
          symbols.push(i < 3 ? 3 : Math.floor(Math.random() * 5));
        } else {
          // فوز صغير: بعض الرموز كوبرا (4)
          symbols.push(i < 2 ? 4 : Math.floor(Math.random() * 5));
        }
      } else {
        // في حالة الخسارة، نجعل الرموز متنوعة بدون نمط فوز
        symbols.push(Math.floor(Math.random() * 5));
      }
    }
    
    return symbols;
  }
  
  /**
   * تنفيذ دوران وإنتاج نتيجة
   */
  public spin(betAmount: number): GameResult {
    // التأكد من أن الرهان ضمن الحدود المسموح بها
    const validBetAmount = Math.max(this.config.minBet, Math.min(this.config.maxBet, betAmount));
    
    // تحديد إذا كانت النتيجة فوز أم خسارة
    const isWin = this.determineWinOrLoss(validBetAmount);
    
    let winType: WinType | null = null;
    let winAmount = 0;
    
    if (isWin) {
      // في حالة الفوز، تحديد نوع الفوز ومقدار الربح
      winType = this.determineWinType(validBetAmount);
      winAmount = this.calculateWinAmount(validBetAmount, winType);
      
      // تحديث سلاسل الربح/الخسارة
      this.config.winStreak++;
      this.config.lossStreak = 0;
    } else {
      // في حالة الخسارة
      this.config.lossStreak++;
      this.config.winStreak = 0;
    }
    
    // توليد الرموز المناسبة
    const symbols = this.generateSymbols(isWin, winType);
    
    // إنشاء كائن النتيجة
    const result: GameResult = {
      isWin,
      betAmount: validBetAmount,
      winAmount,
      winType,
      symbols,
      timestamp: Date.now()
    };
    
    // تحديث رصيد اللاعب
    this.config.playerBalance = this.config.playerBalance - validBetAmount + winAmount;
    
    // إضافة النتيجة إلى سجل اللاعب
    this.config.playerHistory.push(result);
    
    // الاحتفاظ بآخر 20 نتيجة فقط لتوفير الذاكرة
    if (this.config.playerHistory.length > 20) {
      this.config.playerHistory = this.config.playerHistory.slice(-20);
    }
    
    return result;
  }
  
  /**
   * الحصول على ملخص لأداء اللاعب
   */
  public getPlayerSummary() {
    const history = this.config.playerHistory;
    const totalSpins = history.length;
    const wins = history.filter(result => result.isWin).length;
    const totalBet = history.reduce((sum, result) => sum + result.betAmount, 0);
    const totalWon = history.reduce((sum, result) => sum + result.winAmount, 0);
    
    return {
      currentBalance: this.config.playerBalance,
      totalSpins,
      wins,
      winRate: totalSpins > 0 ? (wins / totalSpins) : 0,
      totalBet,
      totalWon,
      profit: totalWon - totalBet,
      lossStreak: this.config.lossStreak,
      winStreak: this.config.winStreak
    };
  }
}

// تصدير نسخة افتراضية من النظام للاستخدام المباشر
export const defaultSmartBalance = new SmartBalanceSystem({
  balanceRatio: 0.97, // ضبط التوازن لتجربة لعب أفضل (ميل طفيف للخسارة)
});