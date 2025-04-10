import React, { useState } from 'react';
import ScrollBackground from './ScrollBackground';
import AnimatedCoinCounter, { WinType } from './AnimatedCoinCounter';
import EgyptianFrame from './EgyptianFrame';
import EgyptianButton from './EgyptianButton';
import EgyptianIconsGallery from './EgyptianIconsGallery';
import EgyptianScorePanel from './EgyptianScorePanel';

/**
 * مكون لعرض جميع المكونات المصرية في مكان واحد
 * يُستخدم للتطوير والعرض التقديمي
 */
const EgyptianComponentsShowcase: React.FC = () => {
  // حالة البيانات التجريبية
  const [balance, setBalance] = useState<number>(1000);
  const [bet, setBet] = useState<number>(10);
  const [win, setWin] = useState<number>(0);
  const [freeSpin, setFreeSpin] = useState<number>(0);
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [isBackgroundRevealed, setIsBackgroundRevealed] = useState<boolean>(true);
  const [lastWinType, setLastWinType] = useState<WinType | null>(null);
  
  // محاكاة الفوز
  const simulateWin = (winType: WinType) => {
    let winAmount = 0;
    
    switch (winType) {
      case WinType.SMALL_WIN:
        winAmount = bet * 5;
        break;
      case WinType.MEDIUM_WIN:
        winAmount = bet * 10;
        break;
      case WinType.BIG_WIN:
        winAmount = bet * 25;
        break;
      case WinType.MEGA_WIN:
        winAmount = bet * 50;
        break;
      case WinType.SUPER_MEGA_WIN:
        winAmount = bet * 100;
        break;
      case WinType.JACKPOT:
        winAmount = bet * 500;
        break;
    }
    
    setWin(winAmount);
    setLastWinType(winType);
    setBalance(prev => prev + winAmount);
  };
  
  // محاكاة ضبط الرهان
  const handleBetChange = (newBet: number) => {
    setBet(newBet);
  };
  
  // محاكاة ضبط الرهان الأقصى
  const handleMaxBet = () => {
    setBet(100);
  };
  
  // محاكاة تحويل خلفية البردية
  const toggleBackground = () => {
    setIsBackgroundRevealed(!isBackgroundRevealed);
  };
  
  // محاكاة إضافة دورات مجانية
  const addFreeSpin = () => {
    setFreeSpin(prev => prev + 5);
  };
  
  // محاكاة استخدام دورة مجانية
  const useFreeSpin = () => {
    if (freeSpin > 0) {
      setFreeSpin(prev => prev - 1);
    }
  };
  
  return (
    <ScrollBackground 
      isRevealed={isBackgroundRevealed}
      layerImage1="/images/egypt-hieroglyphs-layer.png"
      layerImage2="/images/egypt-symbols-layer.png"
    >
      <div className="w-full min-h-screen py-16 px-4 sm:px-6 text-white">
        <EgyptianFrame variant="gold" className="max-w-4xl mx-auto mb-8">
          <div className="p-4 text-center">
            <h1 className="text-3xl font-bold text-yellow-300 mb-2">معرض المكونات المصرية</h1>
            <p className="text-yellow-100">مجموعة من المكونات بتصميم مصري قديم للاستخدام في لعبة ملكة مصر</p>
          </div>
        </EgyptianFrame>
        
        {/* قسم الإطارات */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">الإطارات المصرية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <EgyptianFrame variant="primary">
              <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-yellow-200">إطار أساسي</h3>
                <p className="text-sm text-yellow-100 mt-2">
                  يمكن استخدامه للعناوين والمحتوى العام
                </p>
              </div>
            </EgyptianFrame>
            
            <EgyptianFrame variant="secondary">
              <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-yellow-200">إطار ثانوي</h3>
                <p className="text-sm text-yellow-100 mt-2">
                  مناسب للمحتوى الإضافي والإحصائيات
                </p>
              </div>
            </EgyptianFrame>
            
            <EgyptianFrame variant="gold" animated>
              <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-yellow-200">إطار ذهبي متحرك</h3>
                <p className="text-sm text-yellow-100 mt-2">
                  لعرض المكافآت والعناصر المهمة
                </p>
              </div>
            </EgyptianFrame>
            
            <EgyptianFrame variant="royal">
              <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-yellow-200">إطار ملكي</h3>
                <p className="text-sm text-yellow-100 mt-2">
                  مناسب للعناصر الملكية والنادرة
                </p>
              </div>
            </EgyptianFrame>
            
            <EgyptianFrame variant="stone">
              <div className="p-4 text-center">
                <h3 className="text-lg font-medium text-yellow-200">إطار حجري</h3>
                <p className="text-sm text-yellow-100 mt-2">
                  يُستخدم للمعلومات والتعليمات
                </p>
              </div>
            </EgyptianFrame>
            
            <EgyptianFrame variant="primary" size="small">
              <div className="p-2 text-center">
                <h3 className="text-sm font-medium text-yellow-200">إطار صغير</h3>
                <p className="text-xs text-yellow-100 mt-1">
                  مناسب للتلميحات والرسائل الصغيرة
                </p>
              </div>
            </EgyptianFrame>
          </div>
        </div>
        
        {/* قسم الأزرار */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">الأزرار المصرية</h2>
          <EgyptianFrame>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <EgyptianButton variant="primary">زر أساسي</EgyptianButton>
              <EgyptianButton variant="secondary">زر ثانوي</EgyptianButton>
              <EgyptianButton variant="gold" glowing>زر ذهبي</EgyptianButton>
              <EgyptianButton variant="royal">زر ملكي</EgyptianButton>
              <EgyptianButton variant="danger">زر خطر</EgyptianButton>
              <EgyptianButton variant="primary" size="small">زر صغير</EgyptianButton>
              <EgyptianButton variant="gold" size="large">زر كبير</EgyptianButton>
              <EgyptianButton variant="primary" disabled>زر معطل</EgyptianButton>
              <EgyptianButton variant="secondary" icon="Ankh">مع أيقونة</EgyptianButton>
              <EgyptianButton variant="gold" icon="Jackpot" iconPosition="right">أيقونة يمين</EgyptianButton>
              <EgyptianButton variant="royal" icon="ScarabBeetle" fullWidth>عرض كامل</EgyptianButton>
            </div>
          </EgyptianFrame>
        </div>
        
        {/* قسم الأيقونات */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">الأيقونات المصرية</h2>
          <EgyptianFrame>
            <div className="p-4">
              <EgyptianIconsGallery 
                onSelectIcon={setSelectedIcon}
                highlightedIcon={selectedIcon}
                size="medium"
              />
            </div>
          </EgyptianFrame>
        </div>
        
        {/* قسم عداد العملات المتحرك */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">عداد العملات المتحرك</h2>
          <EgyptianFrame>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <AnimatedCoinCounter 
                    initialValue={0} 
                    targetValue={win} 
                    size="large"
                    winType={lastWinType}
                  />
                </div>
                <div className="space-y-2">
                  <EgyptianButton variant="primary" onClick={() => simulateWin(WinType.SMALL_WIN)}>
                    فوز صغير (x5)
                  </EgyptianButton>
                  <EgyptianButton variant="primary" onClick={() => simulateWin(WinType.MEDIUM_WIN)}>
                    فوز متوسط (x10)
                  </EgyptianButton>
                  <EgyptianButton variant="secondary" onClick={() => simulateWin(WinType.BIG_WIN)}>
                    فوز كبير (x25)
                  </EgyptianButton>
                  <EgyptianButton variant="gold" onClick={() => simulateWin(WinType.MEGA_WIN)}>
                    فوز ضخم (x50)
                  </EgyptianButton>
                  <EgyptianButton variant="royal" onClick={() => simulateWin(WinType.SUPER_MEGA_WIN)}>
                    فوز خارق (x100)
                  </EgyptianButton>
                  <EgyptianButton variant="royal" glowing onClick={() => simulateWin(WinType.JACKPOT)}>
                    جاكبوت (x500)
                  </EgyptianButton>
                </div>
              </div>
            </div>
          </EgyptianFrame>
        </div>
        
        {/* قسم لوحة النتائج */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">لوحة النتائج</h2>
          <EgyptianFrame>
            <div className="p-4">
              <EgyptianScorePanel 
                balance={balance}
                bet={bet}
                win={win}
                onBetChange={handleBetChange}
                onMaxBet={handleMaxBet}
                showJackpot
                showFreeSpin
                jackpot={50000}
                freeSpin={freeSpin}
                lastWinType={lastWinType}
              />
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <EgyptianButton variant="gold" onClick={addFreeSpin}>
                  أضف دورات مجانية +5
                </EgyptianButton>
                <EgyptianButton variant="secondary" onClick={useFreeSpin} disabled={freeSpin <= 0}>
                  استخدم دورة مجانية
                </EgyptianButton>
              </div>
            </div>
          </EgyptianFrame>
        </div>
        
        {/* قسم خلفية البردية */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">خلفية البردية</h2>
          <EgyptianFrame>
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="text-yellow-100 mb-2">
                  يمكن التبديل بين حالة الطي والفتح للبردية المصرية
                </p>
                <EgyptianButton variant="primary" onClick={toggleBackground}>
                  {isBackgroundRevealed ? 'طي البردية' : 'فتح البردية'}
                </EgyptianButton>
              </div>
            </div>
          </EgyptianFrame>
        </div>
        
        {/* تذييل الصفحة */}
        <div className="max-w-4xl mx-auto text-center">
          <EgyptianFrame variant="primary" size="small">
            <div className="p-2">
              <p className="text-sm text-yellow-200">
                تم تطوير المكونات المصرية لاستخدامها في لعبة ملكة مصر ثلاثية الأبعاد
              </p>
            </div>
          </EgyptianFrame>
        </div>
      </div>
    </ScrollBackground>
  );
};

export default EgyptianComponentsShowcase;