/**
 * ملف التحكم الرئيسي
 * يربط كل مكونات اللعبة معًا ويدير تفاعلها
 */

document.addEventListener('DOMContentLoaded', () => {
  // مكونات اللعبة
  const gameComponents = {
    scene3D: scene3DManager,
    audio: audioManager,
    game: slotGame,
    ui: uiManager
  };
  
  // تهيئة كل مكون
  initializeGame(gameComponents);
});

/**
 * تهيئة اللعبة
 * @param {Object} components - مكونات اللعبة (المشهد ثلاثي الأبعاد، الصوت، منطق اللعبة، واجهة المستخدم)
 */
function initializeGame(components) {
  const { scene3D, audio, game, ui } = components;
  
  // إعداد قماش الرسم
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('لم يتم العثور على عنصر canvas');
    return;
  }
  
  // 1. تهيئة مدير الصوت
  audio.loadSounds(
    // عند التقدم في تحميل الصوت
    (progress) => {
      console.log(`تقدم تحميل الصوت: ${Math.round(progress * 100)}%`);
    },
    
    // عند اكتمال تحميل الصوت
    () => {
      console.log('تم تحميل الأصوات بنجاح');
      
      // تشغيل موسيقى الخلفية
      audio.startBackgroundMusic();
    }
  );
  
  // 2. تهيئة مدير واجهة المستخدم
  ui.init({
    // دوال رد الفعل لأزرار واجهة المستخدم
    onSpin: () => {
      const result = game.spin();
      if (result.success) {
        // تحديث حالة زر الدوران
        ui.updateSpinButton(true);
        
        // تشغيل صوت الدوران
        audio.play('spin');
        
        // طلب دوران البكرات من مدير المشهد
        scene3D.spinReels(
          // عند اكتمال الدوران
          (visibleSymbols) => {
            console.log('اكتمل الدوران:', visibleSymbols);
            
            // تحديث حالة زر الدوران
            ui.updateSpinButton(false);
          }
        );
      } else {
        console.log('فشل الدوران:', result.message);
      }
    },
    
    onIncreaseBtn: () => {
      const newBet = game.increaseBet();
      ui.updateBet(newBet);
      audio.play('click');
    },
    
    onDecreaseBtn: () => {
      const newBet = game.decreaseBet();
      ui.updateBet(newBet);
      audio.play('click');
    },
    
    onToggleAutoPlay: (isActive) => {
      game.toggleAutoPlay();
      audio.play('click');
    },
    
    onToggleMute: (isMuted) => {
      audio.setMute(isMuted);
    },
    
    onStartFreeSpins: () => {
      game.startFreeSpins();
      audio.play('freeSpins');
    },
    
    onContinueAfterFreeSpins: () => {
      // إعادة تعيين واجهة اللعبة بعد اللفات المجانية
      console.log('استئناف اللعبة العادية بعد اللفات المجانية');
    },
    
    onBackToHome: () => {
      if (confirm('هل أنت متأكد من الخروج من اللعبة؟')) {
        window.location.href = '/';
      }
    },
    
    onSkipIntro: () => {
      audio.play('click');
    }
  });
  
  // 3. تهيئة منطق اللعبة
  game.init({
    // رد الفعل عند تغيير الرصيد
    onCreditsChange: (credits) => {
      ui.updateBalance(credits);
    },
    
    // رد الفعل عند تغيير الرهان
    onBetChange: (bet) => {
      ui.updateBet(bet);
    },
    
    // رد الفعل عند بدء الدوران
    onSpinStart: () => {
      ui.updateSpinButton(true);
    },
    
    // رد الفعل عند انتهاء الدوران
    onSpinEnd: (reels, win, winningLines) => {
      ui.updateSpinButton(false);
      
      // تحديث معلومات اللفات المجانية
      ui.updateFreeSpinsInfo(game.getFreeSpinsInfo());
      
      // تشغيل تأثير الفوز إذا كان هناك فوز
      if (win > 0) {
        // تشغيل تأثير الفوز على البكرات
        scene3D.playWinAnimation(winningLines.map(line => line.positions));
      }
    },
    
    // رد الفعل عند الفوز
    onWin: (amount, winType, winningLines) => {
      console.log(`فوز: ${amount}, النوع: ${winType}`);
      
      // تشغيل صوت الفوز المناسب
      if (winType === 'mega') {
        audio.play('superWin');
        setTimeout(() => {
          // عرض تأثير الفوز الضخم
          ui.showBigWin(amount, 'mega');
          scene3D.playBigWinAnimation();
        }, 500);
      } else if (winType === 'super') {
        audio.play('bigWin');
        setTimeout(() => {
          // عرض تأثير الفوز الكبير
          ui.showBigWin(amount, 'super');
          scene3D.playBigWinAnimation();
        }, 500);
      } else if (winType === 'big') {
        audio.play('win');
        setTimeout(() => {
          // عرض تأثير الفوز المتوسط
          ui.showBigWin(amount, 'big');
        }, 500);
      } else {
        // فوز عادي
        audio.play('win');
        
        // صوت العملات
        if (amount > game.bet * 2) {
          audio.play('coinDrop');
        }
      }
    },
    
    // رد الفعل عند تفعيل اللفات المجانية
    onFreeSpinsTrigger: (count, specialSymbol) => {
      console.log(`تم تفعيل ${count} لفات مجانية مع الرمز الخاص: ${specialSymbol}`);
      
      // تشغيل صوت اللفات المجانية
      audio.play('freeSpins');
      
      // عرض شاشة الانتقال للفات المجانية
      ui.showFreeSpinsTransition(count, specialSymbol);
    },
    
    // رد الفعل عند بدء اللفات المجانية
    onFreeSpinsStart: (count, specialSymbol) => {
      console.log(`بدء ${count} لفات مجانية مع الرمز الخاص: ${specialSymbol}`);
      
      // تحديث معلومات اللفات المجانية
      ui.updateFreeSpinsInfo(game.getFreeSpinsInfo());
    },
    
    // رد الفعل عند انتهاء اللفات المجانية
    onFreeSpinsEnd: (totalFreeSpins, totalWinnings) => {
      console.log(`انتهت ${totalFreeSpins} لفات مجانية بإجمالي ربح: ${totalWinnings}`);
      
      // تحديد نوع الفوز بناءً على إجمالي المكاسب
      let winType = 'normal';
      if (totalWinnings > game.bet * 50) {
        winType = 'mega';
        audio.play('superWin');
      } else if (totalWinnings > game.bet * 30) {
        winType = 'super';
        audio.play('bigWin');
      } else if (totalWinnings > game.bet * 15) {
        winType = 'big';
        audio.play('win');
      }
      
      // عرض شاشة نتيجة اللفات المجانية
      ui.showFreeSpinsResults(totalFreeSpins, totalWinnings, winType);
    }
  });
  
  // 4. تهيئة المشهد ثلاثي الأبعاد
  scene3D.init(
    canvas,
    
    // عند التقدم في تحميل المشهد
    (progress) => {
      console.log(`تقدم تحميل المشهد: ${Math.round(progress * 100)}%`);
      
      // تحديث شريط التقدم
      ui.updateLoadingProgress(progress);
    },
    
    // عند اكتمال تحميل المشهد
    () => {
      console.log('تم تحميل المشهد بنجاح');
      
      // تحديث القيم الأولية في واجهة المستخدم
      ui.updateBalance(game.credits);
      ui.updateBet(game.bet);
      ui.updateSpinButton(false);
      
      // تجهيز جدول المكافآت
      const paytableInfo = game.getPaytableInfo();
      ui.showPaytable(paytableInfo);
      ui.hideElement(ui.elements.paytableModal);
      
      // بدء المشهد السينمائي الافتتاحي
      setTimeout(() => {
        // تحديث اكتمال التحميل
        ui.updateLoadingProgress(1);
      }, 1000);
    }
  );
  
  // 5. إضافة أحداث النافذة
  window.addEventListener('resize', () => {
    // إعادة ضبط حجم المشهد عند تغيير حجم النافذة
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // تحديث المشهد إذا كان قد تم تهيئته
      if (scene3D) {
        // يتم التعامل مع تغيير الحجم داخل مدير المشهد
      }
    }
  });
  
  // 6. تفعيل التفاعل بالمفاتيح
  document.addEventListener('keydown', (event) => {
    // استخدام مفتاح المسافة للدوران
    if (event.code === 'Space' && !game.isSpinning) {
      event.preventDefault();
      
      // محاكاة النقر على زر الدوران
      if (ui.elements.spinButton) {
        ui.elements.spinButton.click();
      }
    }
  });
}

// التصدير العام
window.queenOfEgypt = {
  scene3D: scene3DManager,
  audio: audioManager,
  game: slotGame,
  ui: uiManager
};