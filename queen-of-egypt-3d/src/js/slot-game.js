/**
 * مدير لعبة السلوتس
 * المسؤول عن منطق اللعبة، بما في ذلك الدوران، والنتائج، والمكافآت واللفات المجانية
 */

class SlotGame {
  constructor() {
    // متغيرات اللعبة
    this.credits = 1000000;          // عدد الرقاقات الافتراضي
    this.bet = 10000;                // قيمة الرهان الافتراضية
    this.betValues = [10000, 50000, 100000, 500000, 1000000, 5000000]; // قيم الرهان المتاحة
    this.currentBetIndex = 0;        // مؤشر قيمة الرهان الحالية
    
    // حالة اللعبة
    this.isSpinning = false;         // هل البكرات تدور حالياً؟
    this.autoPlayActive = false;     // هل اللعب التلقائي مفعل؟
    this.autoPlayInterval = null;    // المؤقت للعب التلقائي
    
    // اللفات المجانية
    this.freeSpins = 0;              // عدد اللفات المجانية المتبقية
    this.freeSpinsTotal = 0;         // إجمالي عدد اللفات المجانية في الجولة الحالية
    this.freeSpinsWinnings = 0;      // إجمالي المكاسب من اللفات المجانية
    this.pendingFreeSpins = 0;       // عدد اللفات المجانية المعلقة (لم تبدأ بعد)
    this.specialSymbol = null;       // الرمز الخاص للفات المجانية
    
    // الرموز وقيم المكافآت
    this.symbols = {
      'crown': { name: 'crown', label: 'تاج الملكة', payout: { 3: 20, 4: 100, 5: 500 } },
      'cat': { name: 'cat', label: 'القطة المصرية', payout: { 3: 15, 4: 70, 5: 150 } },
      'falcon': { name: 'falcon', label: 'صقر حورس', payout: { 3: 15, 4: 60, 5: 125 } },
      'snake': { name: 'snake', label: 'الكوبرا', payout: { 3: 10, 4: 40, 5: 100 } },
      'jar': { name: 'jar', label: 'الإناء الفرعوني', payout: { 3: 5, 4: 20, 5: 50 } }
    };
    
    // احتمالية ظهور كل رمز (الرموز الأعلى قيمة لها احتمالية أقل)
    this.symbolProbabilities = {
      'crown': 0.15, // تاج الملكة (أعلى قيمة، احتمالية أقل)
      'cat': 0.17,   // القطة المصرية
      'falcon': 0.19, // صقر حورس
      'snake': 0.23, // الكوبرا
      'jar': 0.26    // الإناء الفرعوني (أقل قيمة، احتمالية أعلى)
    };
    
    // دوال رد الفعل
    this.onCreditsChange = null;     // عند تغيير الرصيد
    this.onBetChange = null;         // عند تغيير الرهان
    this.onSpinStart = null;         // عند بدء الدوران
    this.onSpinEnd = null;           // عند انتهاء الدوران
    this.onWin = null;               // عند الفوز
    this.onFreeSpinsStart = null;    // عند بدء اللفات المجانية
    this.onFreeSpinsEnd = null;      // عند انتهاء اللفات المجانية
    this.onFreeSpinsTrigger = null;  // عند الحصول على لفات مجانية
    
    // خطوط الفوز
    this.paylines = [
      [0, 0, 0, 0, 0], // السطر العلوي
      [1, 1, 1, 1, 1], // السطر الأوسط
      [2, 2, 2, 2, 2], // السطر السفلي
      [0, 1, 2, 1, 0], // شكل V
      [2, 1, 0, 1, 2], // شكل V مقلوب
      [0, 0, 1, 2, 2], // قطري من أعلى اليسار
      [2, 2, 1, 0, 0], // قطري من أسفل اليسار
      [0, 1, 1, 1, 0], // شكل قوس للأعلى
      [2, 1, 1, 1, 2], // شكل قوس للأسفل
      [1, 0, 0, 0, 1]  // شكل قوس عكسي
    ];
    
    // معدلات الفوز
    this.WIN_RATE = 0.38;             // احتمالية الفوز العادية (38%)
    this.FREE_SPINS_WIN_BOOST = 0.25; // زيادة احتمالية الفوز خلال اللفات المجانية (+25%)
    this.FREE_SPINS_TRIGGER_RATE = 0.05; // احتمالية الحصول على لفات مجانية (5%)
    this.FREE_SPINS_RETRIGGER_RATE = 0.08; // احتمالية تجديد اللفات المجانية (8%)
  }

  /**
   * تهيئة اللعبة
   * @param {Object} options - خيارات التهيئة
   */
  init(options = {}) {
    // تعيين الحالة الابتدائية
    if (options.initialCredits) {
      this.credits = options.initialCredits;
    }
    
    // تعيين دوال رد الفعل
    if (options.onCreditsChange) this.onCreditsChange = options.onCreditsChange;
    if (options.onBetChange) this.onBetChange = options.onBetChange;
    if (options.onSpinStart) this.onSpinStart = options.onSpinStart;
    if (options.onSpinEnd) this.onSpinEnd = options.onSpinEnd;
    if (options.onWin) this.onWin = options.onWin;
    if (options.onFreeSpinsStart) this.onFreeSpinsStart = options.onFreeSpinsStart;
    if (options.onFreeSpinsEnd) this.onFreeSpinsEnd = options.onFreeSpinsEnd;
    if (options.onFreeSpinsTrigger) this.onFreeSpinsTrigger = options.onFreeSpinsTrigger;
    
    // تطبيق قيمة الرهان الأولية
    this.updateBet(this.bet);
  }

  /**
   * بدء دوران جديد
   * @returns {Object} نتيجة محاولة الدوران
   */
  spin() {
    // التحقق من الشروط
    if (this.isSpinning) {
      return { success: false, message: 'البكرات تدور بالفعل' };
    }
    
    // التحقق من الرصيد (ليس مطلوباً خلال اللفات المجانية)
    if (this.freeSpins === 0 && this.credits < this.bet) {
      return { success: false, message: 'رصيد غير كافٍ' };
    }
    
    // تعيين حالة الدوران
    this.isSpinning = true;
    
    // خصم الرهان (في حالة ليست لفة مجانية)
    if (this.freeSpins === 0) {
      this.updateCredits(this.credits - this.bet);
    } else {
      // تقليل عدد اللفات المجانية المتبقية
      this.freeSpins--;
    }
    
    // إشعار ببدء الدوران
    if (this.onSpinStart) {
      this.onSpinStart();
    }
    
    // تحديد ما إذا كانت هذه الدورة ستكون فائزة أم لا
    // اعتماداً على معدل الفوز الأساسي + زيادة أثناء اللفات المجانية
    const winBoost = this.freeSpins > 0 ? this.FREE_SPINS_WIN_BOOST : 0;
    const shouldWin = Math.random() <= this.WIN_RATE + winBoost;
    
    // تحديد ما إذا كان سيتم تفعيل اللفات المجانية
    let shouldTriggerFreeSpins = false;
    if (this.freeSpins === 0) {
      // في اللعب العادي
      shouldTriggerFreeSpins = Math.random() <= this.FREE_SPINS_TRIGGER_RATE;
    } else if (this.freeSpins > 0) {
      // في اللفات المجانية (احتمالية أعلى لتجديد اللفات المجانية)
      shouldTriggerFreeSpins = Math.random() <= this.FREE_SPINS_RETRIGGER_RATE;
    }
    
    // توليد نتيجة الدوران
    const spinResult = this._generateSpinResult(shouldWin, shouldTriggerFreeSpins);
    
    // تطبيق النتيجة بعد مدة زمنية (لمحاكاة الدوران)
    setTimeout(() => {
      // حساب الفوز
      const { win, winningLines } = this._calculateWin(spinResult.reels);
      
      // إضافة الفوز إلى الرصيد
      if (win > 0) {
        this.updateCredits(this.credits + win);
        
        // إضافة إلى إجمالي مكاسب اللفات المجانية إذا كنا في وضع اللفات المجانية
        if (this.freeSpins > 0 || this.freeSpinsTotal > 0) {
          this.freeSpinsWinnings += win;
        }
        
        // إشعار بالفوز
        if (this.onWin) {
          // تصنيف الفوز
          let winType = 'normal';
          if (win > this.bet * 50) {
            winType = 'mega';
          } else if (win > this.bet * 30) {
            winType = 'super';
          } else if (win > this.bet * 15) {
            winType = 'big';
          }
          
          this.onWin(win, winType, winningLines);
        }
      }
      
      // التحقق من تفعيل اللفات المجانية
      if (spinResult.freeSpinsTriggered) {
        // تعيين عدد اللفات المجانية المعلقة (ستبدأ عند الضغط على زر البدء)
        this.pendingFreeSpins = 10;
        
        // اختيار رمز خاص للفات المجانية (باستثناء التاج)
        const specialSymbolOptions = Object.keys(this.symbols).filter(s => s !== 'crown');
        this.specialSymbol = specialSymbolOptions[Math.floor(Math.random() * specialSymbolOptions.length)];
        
        // إشعار بالحصول على لفات مجانية
        if (this.onFreeSpinsTrigger) {
          this.onFreeSpinsTrigger(this.pendingFreeSpins, this.specialSymbol);
        }
      }
      
      // التحقق من انتهاء اللفات المجانية
      if (this.freeSpins === 0 && this.freeSpinsTotal > 0) {
        // تعيين متغيرات اللفات المجانية
        const totalFreeSpins = this.freeSpinsTotal;
        const totalWinnings = this.freeSpinsWinnings;
        
        // إعادة تعيين المتغيرات
        this.freeSpinsTotal = 0;
        this.freeSpinsWinnings = 0;
        this.specialSymbol = null;
        
        // إشعار بانتهاء اللفات المجانية
        if (this.onFreeSpinsEnd) {
          setTimeout(() => {
            this.onFreeSpinsEnd(totalFreeSpins, totalWinnings);
          }, 1000);
        }
      }
      
      // إنهاء حالة الدوران
      this.isSpinning = false;
      
      // إشعار بانتهاء الدوران
      if (this.onSpinEnd) {
        this.onSpinEnd(spinResult.reels, win, winningLines);
      }
      
      // استمرار اللعب التلقائي إذا كان مفعلاً
      if (this.autoPlayActive && this.credits >= this.bet) {
        setTimeout(() => {
          this.spin();
        }, 2000);
      }
    }, 100); // انتظار لحظة للسماح بعرض تأثير الدوران في الواجهة
    
    return {
      success: true,
      message: this.freeSpins > 0 ? `لفة مجانية ${this.freeSpinsTotal - this.freeSpins + 1}/${this.freeSpinsTotal}` : 'بدء الدوران'
    };
  }

  /**
   * بدء اللفات المجانية
   * @returns {boolean} نجاح العملية
   */
  startFreeSpins() {
    if (this.pendingFreeSpins <= 0) {
      return false;
    }
    
    // تفعيل اللفات المجانية
    this.freeSpins = this.pendingFreeSpins;
    this.freeSpinsTotal = this.pendingFreeSpins;
    this.freeSpinsWinnings = 0;
    this.pendingFreeSpins = 0;
    
    // إشعار ببدء اللفات المجانية
    if (this.onFreeSpinsStart) {
      this.onFreeSpinsStart(this.freeSpins, this.specialSymbol);
    }
    
    // بدء الدوران الأول
    setTimeout(() => {
      this.spin();
    }, 500);
    
    return true;
  }

  /**
   * زيادة قيمة الرهان
   * @returns {number} قيمة الرهان الجديدة
   */
  increaseBet() {
    this.currentBetIndex = Math.min(this.currentBetIndex + 1, this.betValues.length - 1);
    this.updateBet(this.betValues[this.currentBetIndex]);
    return this.bet;
  }

  /**
   * تقليل قيمة الرهان
   * @returns {number} قيمة الرهان الجديدة
   */
  decreaseBet() {
    this.currentBetIndex = Math.max(this.currentBetIndex - 1, 0);
    this.updateBet(this.betValues[this.currentBetIndex]);
    return this.bet;
  }

  /**
   * تبديل حالة اللعب التلقائي
   * @returns {boolean} الحالة الجديدة للعب التلقائي
   */
  toggleAutoPlay() {
    this.autoPlayActive = !this.autoPlayActive;
    
    // إذا تم تفعيل اللعب التلقائي وليست هناك لفة جارية
    if (this.autoPlayActive && !this.isSpinning && this.credits >= this.bet) {
      this.spin();
    }
    
    return this.autoPlayActive;
  }

  /**
   * تحديث قيمة الرهان
   * @param {number} value - قيمة الرهان الجديدة
   * @private
   */
  updateBet(value) {
    // تعيين قيمة الرهان
    this.bet = value;
    
    // العثور على المؤشر الصحيح
    this.currentBetIndex = this.betValues.indexOf(value);
    if (this.currentBetIndex === -1) {
      // إذا لم يتم العثور على القيمة، حدد المؤشر الأقرب
      this.currentBetIndex = 0;
      for (let i = 0; i < this.betValues.length; i++) {
        if (this.betValues[i] > value) {
          break;
        }
        this.currentBetIndex = i;
      }
      this.bet = this.betValues[this.currentBetIndex];
    }
    
    // إشعار بتغيير الرهان
    if (this.onBetChange) {
      this.onBetChange(this.bet);
    }
  }

  /**
   * تحديث رصيد اللاعب
   * @param {number} value - قيمة الرصيد الجديدة
   * @private
   */
  updateCredits(value) {
    // تعيين قيمة الرصيد
    this.credits = Math.max(0, value);
    
    // إشعار بتغيير الرصيد
    if (this.onCreditsChange) {
      this.onCreditsChange(this.credits);
    }
  }

  /**
   * توليد نتيجة دوران عشوائية
   * @param {boolean} shouldWin - هل يجب أن تكون النتيجة فائزة
   * @param {boolean} shouldTriggerFreeSpins - هل يجب تفعيل اللفات المجانية
   * @returns {Object} نتيجة الدوران
   * @private
   */
  _generateSpinResult(shouldWin, shouldTriggerFreeSpins) {
    // إنشاء مصفوفة البكرات (5 بكرات × 3 صفوف)
    const reels = Array(5).fill(null).map(() => Array(3).fill(null));
    
    // تحديد ما إذا كانت هذه الدورة ستفعل اللفات المجانية
    if (shouldTriggerFreeSpins) {
      // وضع 3 رموز تاج على الأقل لتفعيل اللفات المجانية
      const crownPositions = [];
      
      // اختيار 3 مواضع عشوائية للتيجان
      while (crownPositions.length < 3) {
        const reel = Math.floor(Math.random() * 5);
        const row = Math.floor(Math.random() * 3);
        
        // التأكد من عدم تكرار نفس الموضع
        if (!crownPositions.some(pos => pos.reel === reel && pos.row === row)) {
          crownPositions.push({ reel, row });
        }
      }
      
      // ملء البكرات بالرموز العشوائية
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          // وضع تاج في المواضع المختارة
          if (crownPositions.some(pos => pos.reel === i && pos.row === j)) {
            reels[i][j] = 'crown';
          } else {
            // وضع رمز عشوائي في المواضع الأخرى
            reels[i][j] = this._getRandomSymbol();
          }
        }
      }
      
      return { reels, freeSpinsTriggered: true };
    } else if (shouldWin) {
      // إنشاء نتيجة فائزة - وضع نفس الرمز في خط واحد
      
      // اختيار خط فوز عشوائي
      const paylineIndex = Math.floor(Math.random() * this.paylines.length);
      const payline = this.paylines[paylineIndex];
      
      // اختيار رمز عشوائي للفوز (باستثناء التاج لتجنب تفعيل اللفات المجانية)
      const symbolsWithoutCrown = Object.keys(this.symbols).filter(s => s !== 'crown');
      const winningSymbol = symbolsWithoutCrown[Math.floor(Math.random() * symbolsWithoutCrown.length)];
      
      // عدد البكرات المتطابقة - على الأقل 3 للفوز
      const matchingReels = 3 + Math.floor(Math.random() * 3); // 3 إلى 5 بكرات متطابقة
      
      // ملء البكرات بالرموز العشوائية
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          // وضع الرمز الفائز في المواضع المناسبة على خط الفوز
          if (j === payline[i] && i < matchingReels) {
            reels[i][j] = winningSymbol;
          } else {
            // وضع رمز عشوائي في المواضع الأخرى
            reels[i][j] = this._getRandomSymbol();
          }
        }
      }
      
      return { reels, freeSpinsTriggered: false };
    } else {
      // إنشاء نتيجة غير فائزة - رموز عشوائية بدون نمط
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          reels[i][j] = this._getRandomSymbol();
        }
      }
      
      return { reels, freeSpinsTriggered: false };
    }
  }

  /**
   * اختيار رمز عشوائي بناءً على الاحتمالات المحددة
   * @returns {string} رمز عشوائي
   * @private
   */
  _getRandomSymbol() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const symbol in this.symbolProbabilities) {
      cumulativeProbability += this.symbolProbabilities[symbol];
      if (rand <= cumulativeProbability) {
        return symbol;
      }
    }
    
    // إرجاع الرمز الأقل قيمة كاحتياط في حالة حدوث أخطاء في الاحتمالات
    return 'jar';
  }

  /**
   * حساب الفوز بناءً على الرموز الظاهرة
   * @param {Array<Array<string>>} reels - مصفوفة برموز كل بكرة
   * @returns {Object} نتيجة الفوز والخطوط الفائزة
   * @private
   */
  _calculateWin(reels) {
    let totalWin = 0;
    const winningLines = [];
    
    // التحقق من كل خط فوز
    this.paylines.forEach((payline, paylineIndex) => {
      // استخراج الرموز على هذا الخط
      const lineSymbols = payline.map((row, reelIndex) => {
        if (reelIndex < reels.length && row < reels[reelIndex].length) {
          return reels[reelIndex][row];
        }
        return null;
      });
      
      // التحقق من الفوز على الخط
      const { win, count } = this._checkLineWin(lineSymbols);
      
      // إضافة الفوز إلى الإجمالي
      if (win > 0) {
        totalWin += win;
        
        // تسجيل الخط الفائز
        winningLines.push({
          payline: paylineIndex,
          symbols: lineSymbols.slice(0, count),
          positions: payline.slice(0, count).map((row, reelIndex) => ({ reel: reelIndex, row })),
          win: win
        });
      }
    });
    
    // التحقق من الرمز الخاص في وضع اللفات المجانية
    if (this.freeSpins > 0 && this.specialSymbol) {
      // عد عدد ظهور الرمز الخاص في أي مكان على البكرات
      let specialCount = 0;
      let specialPositions = [];
      
      for (let i = 0; i < reels.length; i++) {
        for (let j = 0; j < reels[i].length; j++) {
          if (reels[i][j] === this.specialSymbol) {
            specialCount++;
            specialPositions.push({ reel: i, row: j });
          }
        }
      }
      
      // حساب الفوز إذا كان هناك 3 رموز خاصة على الأقل
      if (specialCount >= 3) {
        const specialSymbolInfo = this.symbols[this.specialSymbol];
        if (specialSymbolInfo && specialSymbolInfo.payout && specialSymbolInfo.payout[specialCount]) {
          const specialWin = specialSymbolInfo.payout[specialCount] * this.bet;
          totalWin += specialWin;
          
          // تسجيل الفوز الخاص
          winningLines.push({
            payline: -1, // رمز لفوز خاص
            symbols: Array(specialCount).fill(this.specialSymbol),
            positions: specialPositions,
            win: specialWin
          });
        }
      }
    }
    
    return { win: totalWin, winningLines };
  }

  /**
   * التحقق من الفوز على خط معين
   * @param {Array<string>} symbols - الرموز على الخط
   * @returns {Object} نتيجة الفوز وعدد الرموز المتطابقة
   * @private
   */
  _checkLineWin(symbols) {
    const firstSymbol = symbols[0];
    if (!firstSymbol || !this.symbols[firstSymbol]) {
      return { win: 0, count: 0 };
    }
    
    let count = 1;
    
    // عد عدد الرموز المتطابقة بدءًا من اليسار
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol) {
        count++;
      } else {
        break;
      }
    }
    
    // حساب الفوز إذا كان هناك 3 رموز متطابقة على الأقل
    let win = 0;
    const symbolInfo = this.symbols[firstSymbol];
    
    if (count >= 3 && symbolInfo && symbolInfo.payout && symbolInfo.payout[count]) {
      win = symbolInfo.payout[count] * this.bet;
    }
    
    return { win, count };
  }

  /**
   * تحويل النسبة المئوية إلى نص للعرض
   * @param {number} percentage - النسبة المئوية كرقم عشري
   * @returns {string} النسبة المئوية كنص
   */
  formatPercentage(percentage) {
    return `${Math.round(percentage * 100)}%`;
  }

  /**
   * تنسيق الرقم للعرض
   * @param {number} value - الرقم
   * @returns {string} الرقم المنسق
   */
  formatNumber(value) {
    return value.toLocaleString();
  }
  
  /**
   * الحصول على معلومات جدول المكافآت
   * @returns {Array<Object>} معلومات جدول المكافآت
   */
  getPaytableInfo() {
    const paytableInfo = [];
    
    // إضافة معلومات كل رمز
    for (const symbolKey in this.symbols) {
      const symbol = this.symbols[symbolKey];
      
      const symbolInfo = {
        name: symbol.name,
        label: symbol.label,
        payouts: []
      };
      
      // إضافة قيم المكافآت
      for (const count in symbol.payout) {
        symbolInfo.payouts.push({
          count: parseInt(count),
          value: symbol.payout[count],
          win: symbol.payout[count] * this.bet
        });
      }
      
      paytableInfo.push(symbolInfo);
    }
    
    // ترتيب الرموز حسب القيمة (تنازلياً)
    paytableInfo.sort((a, b) => {
      const maxPayoutA = Math.max(...a.payouts.map(p => p.value));
      const maxPayoutB = Math.max(...b.payouts.map(p => p.value));
      return maxPayoutB - maxPayoutA;
    });
    
    return paytableInfo;
  }
  
  /**
   * الحصول على معلومات اللفات المجانية
   * @returns {Object} معلومات اللفات المجانية
   */
  getFreeSpinsInfo() {
    return {
      active: this.freeSpins > 0,
      remaining: this.freeSpins,
      total: this.freeSpinsTotal,
      winnings: this.freeSpinsWinnings,
      specialSymbol: this.specialSymbol ? this.symbols[this.specialSymbol] : null,
      pendingCount: this.pendingFreeSpins
    };
  }
}

// تصدير مدير اللعبة للاستخدام في الملفات الأخرى
const slotGame = new SlotGame();