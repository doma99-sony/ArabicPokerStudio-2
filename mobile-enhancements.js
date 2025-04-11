// mobile-enhancements.js
// تحسينات خاصة للأجهزة المحمولة لتطبيق بوكر عرباوي
// Mobile-specific enhancements for Poker 3arabawy App

document.addEventListener('DOMContentLoaded', function() {
  // تهيئة تحسينات الأجهزة المحمولة
  initMobileEnhancements();
});

function initMobileEnhancements() {
  // التعرف على نوع الجهاز
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // إضافة فئة للجسم للتعامل مع تحسينات CSS الخاصة
    document.body.classList.add('is-mobile-app');
    
    // تحسين أحداث اللمس
    enhanceTouchEvents();
    
    // تعطيل تكبير/تصغير الصفحة
    disableZoom();
    
    // تحسين أداء الرسومات
    optimizeRendering();
    
    // إضافة دعم الاهتزاز عند الفوز
    setupVibration();
    
    // تخصيص شريط الحالة باستخدام Capacitor
    setupStatusBar();
    
    // منع قفل الشاشة أثناء اللعب
    preventScreenLock();
    
    // التعامل مع توجيه الشاشة
    handleOrientation();
    
    console.log('تم تفعيل تحسينات الجوال');
  }
}

function enhanceTouchEvents() {
  // تعزيز استجابة أزرار اللعبة للمس
  const gameButtons = document.querySelectorAll('.game-button, .action-button, [role="button"]');
  
  gameButtons.forEach(button => {
    // إضافة تأثير عند النقر
    button.addEventListener('touchstart', function(e) {
      this.classList.add('touch-active');
    });
    
    button.addEventListener('touchend', function(e) {
      this.classList.remove('touch-active');
    });
    
    // تحسين منطقة النقر (جعلها أكبر)
    if (button.offsetWidth < 44 || button.offsetHeight < 44) {
      button.style.minWidth = '44px';
      button.style.minHeight = '44px';
    }
  });
  
  // تحسين تمرير الشاشة في مناطق معينة
  setupSmoothScrolling();
}

function setupSmoothScrolling() {
  // تطبيق التمرير السلس على عناصر القوائم والمحادثات
  const scrollableElements = document.querySelectorAll('.chat-messages, .game-list, .player-list');
  
  scrollableElements.forEach(element => {
    element.style.overscrollBehavior = 'contain';
    element.style.webkitOverflowScrolling = 'touch';
  });
}

function disableZoom() {
  // منع المستخدم من تكبير/تصغير الشاشة
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // إضافة مستمع للنقر المزدوج
  let lastTapTime = 0;
  document.addEventListener('touchend', function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 300 && tapLength > 0) {
      e.preventDefault();
    }
    
    lastTapTime = currentTime;
  });
}

function optimizeRendering() {
  // تحسين الأداء أثناء التمرير
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (!document.body.classList.contains('is-scrolling')) {
      document.body.classList.add('is-scrolling');
    }
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      document.body.classList.remove('is-scrolling');
    }, 200);
  });
  
  // استخدام CSS لتعطيل الرسوم المتحركة أثناء التمرير
  const style = document.createElement('style');
  style.textContent = `
    .is-scrolling * {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
    }
  `;
  document.head.appendChild(style);
}

function setupVibration() {
  // تفعيل الاهتزاز عند أحداث معينة إذا كان مدعومًا
  if ('vibrate' in navigator) {
    // اهتزاز عند الفوز
    document.addEventListener('game-win', function() {
      navigator.vibrate([100, 50, 200]);
    });
    
    // اهتزاز خفيف عند القيام بحركة
    document.addEventListener('player-action', function() {
      navigator.vibrate(30);
    });
    
    // اهتزاز أطول عند بدء لعبة جديدة
    document.addEventListener('game-start', function() {
      navigator.vibrate([50, 25, 50, 25, 50]);
    });
    
    console.log('تم تفعيل دعم الاهتزاز للموبايل');
  }
}

function setupStatusBar() {
  // استخدام الواجهة البرمجية للـ Capacitor لتخصيص شريط الحالة
  try {
    if (window.Capacitor && window.Capacitor.Plugins.StatusBar) {
      const { StatusBar } = window.Capacitor.Plugins;
      
      // تعيين لون شريط الحالة ليتطابق مع سمة التطبيق
      StatusBar.setBackgroundColor({ color: '#006400' });
      
      // تعيين نمط النص في شريط الحالة
      StatusBar.setStyle({ style: 'DARK' });
      
      console.log('تم تخصيص شريط الحالة');
    }
  } catch (e) {
    console.warn('خطأ في تهيئة شريط الحالة:', e);
  }
}

function preventScreenLock() {
  // منع قفل الشاشة أثناء اللعب الفعلي
  try {
    if ('wakeLock' in navigator) {
      let wakeLock = null;
      
      // طلب قفل الإيقاظ عند بدء اللعبة
      document.addEventListener('game-start', async function() {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('تم تفعيل منع قفل الشاشة');
        } catch (e) {
          console.warn('لا يمكن تفعيل منع قفل الشاشة:', e);
        }
      });
      
      // تحرير قفل الإيقاظ عند انتهاء اللعبة
      document.addEventListener('game-end', function() {
        if (wakeLock) {
          wakeLock.release();
          wakeLock = null;
          console.log('تم إلغاء منع قفل الشاشة');
        }
      });
      
      // إعادة طلب القفل عند استئناف التطبيق
      document.addEventListener('visibilitychange', async function() {
        if (document.visibilityState === 'visible' && wakeLock === null) {
          try {
            wakeLock = await navigator.wakeLock.request('screen');
          } catch (e) {
            console.warn('لا يمكن إعادة تفعيل منع قفل الشاشة:', e);
          }
        }
      });
    } else if (window.Capacitor) {
      // يمكن استخدام بديل عبر Capacitor إن وجد
      console.log('استخدام Capacitor لمنع قفل الشاشة');
    }
  } catch (e) {
    console.warn('خطأ في منع قفل الشاشة:', e);
  }
}

function handleOrientation() {
  // التعامل مع تغيير اتجاه الشاشة
  window.addEventListener('orientationchange', function() {
    // تأخير إعادة تنظيم واجهة المستخدم حتى يتم إكمال التغيير
    setTimeout(function() {
      repositionGameElements();
    }, 300);
  });
}

function repositionGameElements() {
  // إعادة تنظيم عناصر اللعبة بناءً على اتجاه الشاشة
  const isLandscape = window.innerWidth > window.innerHeight;
  
  // تحديد العناصر التي تحتاج إلى إعادة تنظيم
  const gameTable = document.querySelector('.poker-table');
  const actionBar = document.querySelector('.action-buttons');
  const chatBox = document.querySelector('.chat-container');
  
  if (isLandscape) {
    // تخطيط أفقي للشاشة
    if (gameTable) gameTable.classList.add('landscape-mode');
    if (actionBar) actionBar.classList.add('landscape-mode');
    if (chatBox) chatBox.classList.add('landscape-mode');
    
    document.body.classList.add('landscape-mode');
    document.body.classList.remove('portrait-mode');
  } else {
    // تخطيط عمودي للشاشة
    if (gameTable) gameTable.classList.remove('landscape-mode');
    if (actionBar) actionBar.classList.remove('landscape-mode');
    if (chatBox) actionBar.classList.remove('landscape-mode');
    
    document.body.classList.remove('landscape-mode');
    document.body.classList.add('portrait-mode');
  }
  
  // إطلاق حدث مخصص للاستجابة للتغيير
  window.dispatchEvent(new CustomEvent('layout-changed', {
    detail: { isLandscape }
  }));
}

// تصدير الوظائف للاستخدام في أماكن أخرى من التطبيق
export {
  initMobileEnhancements,
  enhanceTouchEvents,
  setupVibration,
  handleOrientation
};