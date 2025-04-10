/**
 * مدير واجهة المستخدم
 * المسؤول عن التفاعل مع عناصر واجهة المستخدم وتحديثها
 */

class UIManager {
  constructor() {
    // عناصر واجهة المستخدم
    this.elements = {
      // الشاشات الرئيسية
      loadingScreen: null,
      introCinematic: null,
      gameContainer: null,
      
      // واجهة اللعبة
      balanceAmount: null,
      betAmount: null,
      spinButton: null,
      decreaseBetButton: null,
      increaseBetButton: null,
      autoPlayButton: null,
      muteButton: null,
      backButton: null,
      
      // معلومات اللفات المجانية
      freeSpinsInfo: null,
      freeSpinsCount: null,
      freeSpinsWinnings: null,
      
      // شاشة الانتقال للفات المجانية
      freeSpinsTransition: null,
      pendingFreeSpins: null,
      specialSymbol: null,
      startFreeSpinsButton: null,
      
      // شاشة نتيجة اللفات المجانية
      freeSpinsResults: null,
      winTypeText: null,
      totalFreeSpinsWinnings: null,
      continueAfterFreeSpinsButton: null,
      
      // شاشة الفوز الكبير
      bigWinScreen: null,
      bigWinText: null,
      bigWinAmount: null,
      
      // جدول المكافآت
      paytableModal: null,
      paytableGrid: null,
      closePaytableButton: null,
      
      // أخرى
      loadingBar: null,
      loadingText: null,
      skipIntroButton: null,
    };
    
    // حالة واجهة المستخدم
    this.isAutoPlayActive = false;
    this.isMuted = false;
    this.currentScreen = 'loading'; // 'loading', 'intro', 'game'
    
    // دوال رد الفعل
    this.onSpin = null;
    this.onIncreaseBtn = null;
    this.onDecreaseBtn = null;
    this.onToggleAutoPlay = null;
    this.onToggleMute = null;
    this.onStartFreeSpins = null;
    this.onContinueAfterFreeSpins = null;
    this.onBackToHome = null;
    this.onSkipIntro = null;
  }

  /**
   * تهيئة مدير واجهة المستخدم
   * @param {Object} options - خيارات التهيئة
   */
  init(options = {}) {
    // تعيين دوال رد الفعل
    if (options.onSpin) this.onSpin = options.onSpin;
    if (options.onIncreaseBtn) this.onIncreaseBtn = options.onIncreaseBtn;
    if (options.onDecreaseBtn) this.onDecreaseBtn = options.onDecreaseBtn;
    if (options.onToggleAutoPlay) this.onToggleAutoPlay = options.onToggleAutoPlay;
    if (options.onToggleMute) this.onToggleMute = options.onToggleMute;
    if (options.onStartFreeSpins) this.onStartFreeSpins = options.onStartFreeSpins;
    if (options.onContinueAfterFreeSpins) this.onContinueAfterFreeSpins = options.onContinueAfterFreeSpins;
    if (options.onBackToHome) this.onBackToHome = options.onBackToHome;
    if (options.onSkipIntro) this.onSkipIntro = options.onSkipIntro;
    
    // تعيين عناصر واجهة المستخدم
    this._initElements();
    
    // تعيين أحداث النقر
    this._setupEventListeners();
  }

  /**
   * تعيين مراجع لعناصر واجهة المستخدم
   * @private
   */
  _initElements() {
    // الشاشات الرئيسية
    this.elements.loadingScreen = document.getElementById('loading-screen');
    this.elements.introCinematic = document.getElementById('intro-cinematic');
    this.elements.gameContainer = document.getElementById('game-container');
    
    // واجهة اللعبة
    this.elements.balanceAmount = document.getElementById('balance-amount');
    this.elements.betAmount = document.getElementById('bet-amount');
    this.elements.spinButton = document.getElementById('spin-button');
    this.elements.decreaseBetButton = document.getElementById('decrease-bet');
    this.elements.increaseBetButton = document.getElementById('increase-bet');
    this.elements.autoPlayButton = document.getElementById('auto-spin');
    this.elements.muteButton = document.getElementById('mute-button');
    this.elements.backButton = document.getElementById('back-button');
    
    // معلومات اللفات المجانية
    this.elements.freeSpinsInfo = document.getElementById('free-spins-info');
    this.elements.freeSpinsCount = document.getElementById('free-spins-count');
    this.elements.freeSpinsWinnings = document.getElementById('free-spins-winnings');
    
    // شاشة الانتقال للفات المجانية
    this.elements.freeSpinsTransition = document.getElementById('free-spins-transition');
    this.elements.pendingFreeSpins = document.getElementById('pending-free-spins');
    this.elements.specialSymbol = document.getElementById('special-symbol');
    this.elements.startFreeSpinsButton = document.getElementById('start-free-spins');
    
    // شاشة نتيجة اللفات المجانية
    this.elements.freeSpinsResults = document.getElementById('free-spins-results');
    this.elements.winTypeText = document.getElementById('win-type-text');
    this.elements.totalFreeSpinsWinnings = document.getElementById('total-free-spins-winnings');
    this.elements.continueAfterFreeSpinsButton = document.getElementById('continue-after-free-spins');
    
    // شاشة الفوز الكبير
    this.elements.bigWinScreen = document.getElementById('big-win-screen');
    this.elements.bigWinText = document.getElementById('big-win-text');
    this.elements.bigWinAmount = document.getElementById('big-win-amount');
    
    // جدول المكافآت
    this.elements.paytableModal = document.getElementById('paytable-modal');
    this.elements.paytableGrid = document.querySelector('.paytable-grid');
    this.elements.closePaytableButton = document.getElementById('close-paytable');
    
    // أخرى
    this.elements.loadingBar = document.querySelector('.progress-fill');
    this.elements.loadingText = document.querySelector('.loading-text');
    this.elements.skipIntroButton = document.getElementById('skip-intro');
  }

  /**
   * إعداد أحداث النقر
   * @private
   */
  _setupEventListeners() {
    // زر الدوران
    if (this.elements.spinButton) {
      this.elements.spinButton.addEventListener('click', () => {
        if (this.onSpin) this.onSpin();
      });
    }
    
    // زر زيادة الرهان
    if (this.elements.increaseBetButton) {
      this.elements.increaseBetButton.addEventListener('click', () => {
        if (this.onIncreaseBtn) this.onIncreaseBtn();
      });
    }
    
    // زر تقليل الرهان
    if (this.elements.decreaseBetButton) {
      this.elements.decreaseBetButton.addEventListener('click', () => {
        if (this.onDecreaseBtn) this.onDecreaseBtn();
      });
    }
    
    // زر اللعب التلقائي
    if (this.elements.autoPlayButton) {
      this.elements.autoPlayButton.addEventListener('click', () => {
        this.isAutoPlayActive = !this.isAutoPlayActive;
        this.elements.autoPlayButton.classList.toggle('active', this.isAutoPlayActive);
        
        if (this.onToggleAutoPlay) this.onToggleAutoPlay(this.isAutoPlayActive);
      });
    }
    
    // زر كتم الصوت
    if (this.elements.muteButton) {
      this.elements.muteButton.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        this.elements.muteButton.querySelector('.sound-icon').textContent = this.isMuted ? '🔇' : '🔊';
        
        if (this.onToggleMute) this.onToggleMute(this.isMuted);
      });
    }
    
    // زر بدء اللفات المجانية
    if (this.elements.startFreeSpinsButton) {
      this.elements.startFreeSpinsButton.addEventListener('click', () => {
        this.hideElement(this.elements.freeSpinsTransition);
        
        if (this.onStartFreeSpins) this.onStartFreeSpins();
      });
    }
    
    // زر الاستمرار بعد اللفات المجانية
    if (this.elements.continueAfterFreeSpinsButton) {
      this.elements.continueAfterFreeSpinsButton.addEventListener('click', () => {
        this.hideElement(this.elements.freeSpinsResults);
        
        if (this.onContinueAfterFreeSpins) this.onContinueAfterFreeSpins();
      });
    }
    
    // زر العودة
    if (this.elements.backButton) {
      this.elements.backButton.addEventListener('click', () => {
        if (this.onBackToHome) this.onBackToHome();
      });
    }
    
    // زر تخطي المقدمة
    if (this.elements.skipIntroButton) {
      this.elements.skipIntroButton.addEventListener('click', () => {
        this.showGameScreen();
        
        if (this.onSkipIntro) this.onSkipIntro();
      });
    }
    
    // زر إغلاق جدول المكافآت
    if (this.elements.closePaytableButton) {
      this.elements.closePaytableButton.addEventListener('click', () => {
        this.hideElement(this.elements.paytableModal);
      });
    }
  }

  /**
   * تحديث رصيد اللاعب
   * @param {number} value - قيمة الرصيد الجديدة
   */
  updateBalance(value) {
    if (this.elements.balanceAmount) {
      this.elements.balanceAmount.textContent = this._formatNumber(value);
      
      // إضافة تأثير بصري لتغير الرصيد
      this.elements.balanceAmount.classList.add('balance-change');
      setTimeout(() => {
        this.elements.balanceAmount.classList.remove('balance-change');
      }, 500);
    }
  }

  /**
   * تحديث قيمة الرهان
   * @param {number} value - قيمة الرهان الجديدة
   */
  updateBet(value) {
    if (this.elements.betAmount) {
      this.elements.betAmount.textContent = this._formatNumber(value);
    }
  }

  /**
   * تحديث حالة زر الدوران
   * @param {boolean} isSpinning - هل البكرات تدور حالياً؟
   */
  updateSpinButton(isSpinning) {
    if (this.elements.spinButton) {
      this.elements.spinButton.disabled = isSpinning;
      this.elements.spinButton.textContent = isSpinning ? 'يدور...' : 'لف!';
      
      if (isSpinning) {
        this.elements.spinButton.classList.add('spinning');
      } else {
        this.elements.spinButton.classList.remove('spinning');
      }
    }
  }

  /**
   * تحديث معلومات اللفات المجانية
   * @param {Object} freeSpinsInfo - معلومات اللفات المجانية
   */
  updateFreeSpinsInfo(freeSpinsInfo) {
    if (freeSpinsInfo.active) {
      // عرض معلومات اللفات المجانية
      this.showElement(this.elements.freeSpinsInfo);
      
      // تحديث العداد
      if (this.elements.freeSpinsCount) {
        this.elements.freeSpinsCount.textContent = freeSpinsInfo.remaining;
      }
      
      // تحديث المكاسب
      if (this.elements.freeSpinsWinnings) {
        this.elements.freeSpinsWinnings.textContent = this._formatNumber(freeSpinsInfo.winnings);
      }
    } else {
      // إخفاء معلومات اللفات المجانية
      this.hideElement(this.elements.freeSpinsInfo);
    }
  }

  /**
   * عرض شاشة الانتقال للفات المجانية
   * @param {number} count - عدد اللفات المجانية
   * @param {string} specialSymbol - الرمز الخاص للفات المجانية
   */
  showFreeSpinsTransition(count, specialSymbol) {
    // تحديث المعلومات
    if (this.elements.pendingFreeSpins) {
      this.elements.pendingFreeSpins.textContent = count;
    }
    
    // عرض الرمز الخاص
    if (this.elements.specialSymbol) {
      // تعيين خلفية ديناميكية للرمز أو صورة الرمز
      // في تطبيق حقيقي، ستعرض هنا نموذج 3D للرمز
      this.elements.specialSymbol.innerHTML = '';
      
      const symbolLabel = document.createElement('div');
      symbolLabel.className = 'special-symbol-label';
      
      // اختيار الرمز المناسب
      switch (specialSymbol) {
        case 'cat':
          symbolLabel.textContent = '🐈';
          symbolLabel.style.fontSize = '50px';
          break;
        case 'falcon':
          symbolLabel.textContent = '🦅';
          symbolLabel.style.fontSize = '50px';
          break;
        case 'snake':
          symbolLabel.textContent = '🐍';
          symbolLabel.style.fontSize = '50px';
          break;
        case 'jar':
          symbolLabel.textContent = '🏺';
          symbolLabel.style.fontSize = '50px';
          break;
        default:
          symbolLabel.textContent = specialSymbol;
      }
      
      this.elements.specialSymbol.appendChild(symbolLabel);
    }
    
    // عرض الشاشة
    this.showElement(this.elements.freeSpinsTransition);
  }

  /**
   * عرض شاشة نتيجة اللفات المجانية
   * @param {number} totalFreeSpins - إجمالي عدد اللفات المجانية
   * @param {number} totalWinnings - إجمالي المكاسب
   * @param {string} winType - نوع الفوز
   */
  showFreeSpinsResults(totalFreeSpins, totalWinnings, winType = 'normal') {
    // تحديث النص حسب نوع الفوز
    if (this.elements.winTypeText) {
      switch (winType) {
        case 'mega':
          this.elements.winTypeText.textContent = 'عرباوي وين! 🇪🇬✨';
          this.elements.winTypeText.style.fontSize = '40px';
          break;
        case 'super':
          this.elements.winTypeText.textContent = 'Super Win! 💥';
          this.elements.winTypeText.style.fontSize = '38px';
          break;
        case 'big':
          this.elements.winTypeText.textContent = 'Big Win! 🥳';
          this.elements.winTypeText.style.fontSize = '36px';
          break;
        default:
          this.elements.winTypeText.textContent = 'انتهت اللفات المجانية!';
          this.elements.winTypeText.style.fontSize = '32px';
      }
    }
    
    // تحديث إجمالي المكاسب
    if (this.elements.totalFreeSpinsWinnings) {
      this.elements.totalFreeSpinsWinnings.textContent = this._formatNumber(totalWinnings);
    }
    
    // تطبيق الفئة المناسبة لنوع الفوز
    if (this.elements.freeSpinsResults) {
      this.elements.freeSpinsResults.className = 'fullscreen-overlay';
      
      switch (winType) {
        case 'mega':
          this.elements.freeSpinsResults.classList.add('mega-win');
          break;
        case 'super':
          this.elements.freeSpinsResults.classList.add('super-win');
          break;
        case 'big':
          this.elements.freeSpinsResults.classList.add('big-win');
          break;
        default:
          this.elements.freeSpinsResults.classList.add('normal-win');
      }
    }
    
    // عرض الشاشة
    this.showElement(this.elements.freeSpinsResults);
  }

  /**
   * عرض شاشة الفوز الكبير
   * @param {number} amount - قيمة الفوز
   * @param {string} winType - نوع الفوز
   */
  showBigWin(amount, winType = 'big') {
    // تحديث نص نوع الفوز
    if (this.elements.bigWinText) {
      switch (winType) {
        case 'mega':
          this.elements.bigWinText.textContent = 'عرباوي وين! 🇪🇬';
          this.elements.bigWinText.style.fontSize = '46px';
          break;
        case 'super':
          this.elements.bigWinText.textContent = 'Super Win!';
          this.elements.bigWinText.style.fontSize = '44px';
          break;
        default:
          this.elements.bigWinText.textContent = 'Big Win!';
          this.elements.bigWinText.style.fontSize = '42px';
      }
    }
    
    // تحديث قيمة الفوز
    if (this.elements.bigWinAmount) {
      // تحريك العداد تدريجياً
      this._animateCounter(this.elements.bigWinAmount, 0, amount, 3000);
    }
    
    // تطبيق الفئة المناسبة لنوع الفوز
    if (this.elements.bigWinScreen) {
      this.elements.bigWinScreen.className = 'fullscreen-overlay';
      
      switch (winType) {
        case 'mega':
          this.elements.bigWinScreen.classList.add('mega-win');
          break;
        case 'super':
          this.elements.bigWinScreen.classList.add('super-win');
          break;
        default:
          this.elements.bigWinScreen.classList.add('big-win');
      }
    }
    
    // عرض الشاشة
    this.showElement(this.elements.bigWinScreen);
    
    // إخفاء الشاشة بعد فترة
    setTimeout(() => {
      this.hideElement(this.elements.bigWinScreen);
    }, 6000);
  }

  /**
   * تحديث شريط التقدم للتحميل
   * @param {number} progress - نسبة التقدم (0-1)
   */
  updateLoadingProgress(progress) {
    // تحديث شريط التقدم
    if (this.elements.loadingBar) {
      this.elements.loadingBar.style.width = `${progress * 100}%`;
    }
    
    // تحديث النص
    if (this.elements.loadingText) {
      this.elements.loadingText.textContent = `${Math.round(progress * 100)}%`;
    }
    
    // إذا اكتمل التحميل، انتقل إلى المشهد السينمائي الافتتاحي
    if (progress >= 1) {
      setTimeout(() => {
        this.showIntroCinematic();
      }, 1000);
    }
  }

  /**
   * عرض المشهد السينمائي الافتتاحي
   */
  showIntroCinematic() {
    // إخفاء شاشة التحميل وعرض المشهد السينمائي
    this.hideElement(this.elements.loadingScreen);
    this.showElement(this.elements.introCinematic);
    
    // تعيين الشاشة الحالية
    this.currentScreen = 'intro';
    
    // بعد فترة زمنية، سننتقل تلقائياً إلى شاشة اللعبة
    setTimeout(() => {
      if (this.currentScreen === 'intro') {
        this.showGameScreen();
      }
    }, 15000); // 15 ثانية للمشهد السينمائي
  }

  /**
   * عرض شاشة اللعبة الرئيسية
   */
  showGameScreen() {
    // إخفاء المشهد السينمائي وعرض شاشة اللعبة
    this.hideElement(this.elements.introCinematic);
    this.showElement(this.elements.gameContainer);
    
    // تعيين الشاشة الحالية
    this.currentScreen = 'game';
  }

  /**
   * عرض جدول المكافآت
   * @param {Array<Object>} paytableInfo - معلومات جدول المكافآت
   */
  showPaytable(paytableInfo) {
    // تفريغ الشبكة
    if (this.elements.paytableGrid) {
      this.elements.paytableGrid.innerHTML = '';
      
      // إنشاء عناصر جدول المكافآت
      paytableInfo.forEach(symbol => {
        const symbolCard = document.createElement('div');
        symbolCard.className = 'symbol-card';
        
        // عنوان الرمز
        const symbolTitle = document.createElement('h3');
        symbolTitle.textContent = symbol.label;
        symbolCard.appendChild(symbolTitle);
        
        // صورة الرمز (في تطبيق حقيقي، ستعرض هنا نموذج 3D للرمز)
        const symbolImage = document.createElement('div');
        symbolImage.className = 'symbol-image';
        
        // اختيار الرمز المناسب
        switch (symbol.name) {
          case 'crown':
            symbolImage.textContent = '👑';
            symbolImage.style.fontSize = '40px';
            break;
          case 'cat':
            symbolImage.textContent = '🐈';
            symbolImage.style.fontSize = '40px';
            break;
          case 'falcon':
            symbolImage.textContent = '🦅';
            symbolImage.style.fontSize = '40px';
            break;
          case 'snake':
            symbolImage.textContent = '🐍';
            symbolImage.style.fontSize = '40px';
            break;
          case 'jar':
            symbolImage.textContent = '🏺';
            symbolImage.style.fontSize = '40px';
            break;
          default:
            symbolImage.textContent = symbol.name;
        }
        
        symbolCard.appendChild(symbolImage);
        
        // قيم المكافآت
        const payoutsList = document.createElement('ul');
        payoutsList.className = 'payouts-list';
        
        symbol.payouts.forEach(payout => {
          const payoutItem = document.createElement('li');
          payoutItem.textContent = `${payout.count}x: ${this._formatNumber(payout.win)}`;
          payoutsList.appendChild(payoutItem);
        });
        
        symbolCard.appendChild(payoutsList);
        
        // إضافة البطاقة إلى الشبكة
        this.elements.paytableGrid.appendChild(symbolCard);
      });
    }
    
    // عرض الشاشة
    this.showElement(this.elements.paytableModal);
  }

  /**
   * عرض عنصر واجهة المستخدم
   * @param {HTMLElement} element - العنصر المراد عرضه
   */
  showElement(element) {
    if (element) {
      element.classList.remove('hidden');
    }
  }

  /**
   * إخفاء عنصر واجهة المستخدم
   * @param {HTMLElement} element - العنصر المراد إخفاؤه
   */
  hideElement(element) {
    if (element) {
      element.classList.add('hidden');
    }
  }

  /**
   * تحريك عداد من قيمة إلى أخرى
   * @param {HTMLElement} element - عنصر العداد
   * @param {number} start - القيمة الابتدائية
   * @param {number} end - القيمة النهائية
   * @param {number} duration - مدة الحركة بالمللي ثانية
   * @private
   */
  _animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // حساب القيمة الحالية
      const currentValue = Math.floor(start + progress * (end - start));
      
      // تحديث النص
      element.textContent = this._formatNumber(currentValue);
      
      // استمرار الحركة إذا لم تكتمل بعد
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }

  /**
   * تنسيق الرقم للعرض
   * @param {number} value - الرقم
   * @returns {string} الرقم المنسق
   * @private
   */
  _formatNumber(value) {
    return value.toLocaleString();
  }
}

// تصدير مدير واجهة المستخدم للاستخدام في الملفات الأخرى
const uiManager = new UIManager();