// مكون جدول المدفوعات للعبة صياد السمك
import React, { useState } from 'react';
import { Symbol, SymbolType } from '../types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface PaytableDisplayProps {
  symbols: Symbol[];
  onClose: () => void;
}

/**
 * مكون جدول المدفوعات
 * يعرض معلومات عن الرموز وقيم المكافآت
 */
const PaytableDisplay: React.FC<PaytableDisplayProps> = ({
  symbols,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('symbols');
  
  // تصنيف الرموز
  const specialSymbols = symbols.filter(
    symbol => symbol.isWild || symbol.isScatter
  );
  
  const fishSymbols = symbols.filter(
    symbol => [
      SymbolType.GOLDEN_FISH,
      SymbolType.SHARK,
      SymbolType.TUNA,
      SymbolType.SALMON,
      SymbolType.SQUID,
      SymbolType.BLUE_WHALE,
      SymbolType.TREASURE
    ].includes(symbol.type)
  );
  
  const cardSymbols = symbols.filter(
    symbol => [
      SymbolType.A,
      SymbolType.K,
      SymbolType.Q,
      SymbolType.J,
      SymbolType.TEN
    ].includes(symbol.type)
  );
  
  return (
    <div className="paytable-overlay">
      <Card className="paytable-panel">
        <CardHeader>
          <CardTitle className="paytable-title">جدول المدفوعات</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="close-button" 
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="paytable-content">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="paytable-tabs"
          >
            <TabsList className="paytable-tabs-list">
              <TabsTrigger value="symbols">الرموز</TabsTrigger>
              <TabsTrigger value="paylines">خطوط الدفع</TabsTrigger>
              <TabsTrigger value="features">المميزات</TabsTrigger>
            </TabsList>
            
            {/* قسم الرموز */}
            <TabsContent value="symbols" className="paytable-tab-content">
              {/* الرموز الخاصة */}
              <div className="symbol-section">
                <h3 className="section-title">الرموز الخاصة</h3>
                <div className="symbol-grid">
                  {specialSymbols.map(symbol => (
                    <div key={symbol.id} className="paytable-symbol-card">
                      <img src={symbol.image} alt={symbol.type} className="symbol-image" />
                      <div className="symbol-info">
                        <div className="symbol-name">
                          {symbol.isWild ? 'صياد (Wild)' : 'صندوق الطُعم (Scatter)'}
                        </div>
                        <div className="symbol-value">
                          <div>5x: {symbol.payout.five}x</div>
                          <div>4x: {symbol.payout.four}x</div>
                          <div>3x: {symbol.payout.three}x</div>
                        </div>
                        {symbol.isWild && (
                          <div className="symbol-description">
                            يحل محل أي رمز آخر باستثناء Scatter.
                          </div>
                        )}
                        {symbol.isScatter && (
                          <div className="symbol-description">
                            3 أو أكثر تمنح لفات مجانية.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* رموز الأسماك */}
              <div className="symbol-section">
                <h3 className="section-title">رموز الأسماك</h3>
                <div className="symbol-grid">
                  {fishSymbols.map(symbol => (
                    <div key={symbol.id} className="paytable-symbol-card">
                      <img src={symbol.image} alt={symbol.type} className="symbol-image" />
                      <div className="symbol-info">
                        <div className="symbol-name">
                          {getSymbolName(symbol.type)}
                        </div>
                        <div className="symbol-value">
                          <div>5x: {symbol.payout.five}x</div>
                          <div>4x: {symbol.payout.four}x</div>
                          <div>3x: {symbol.payout.three}x</div>
                        </div>
                        {(
                          symbol.type === SymbolType.GOLDEN_FISH ||
                          symbol.type === SymbolType.SHARK ||
                          symbol.type === SymbolType.TUNA ||
                          symbol.type === SymbolType.SALMON ||
                          symbol.type === SymbolType.SQUID ||
                          symbol.type === SymbolType.BLUE_WHALE
                        ) && (
                          <div className="symbol-description">
                            يحمل قيمة خلال اللفات المجانية.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* رموز الكروت */}
              <div className="symbol-section">
                <h3 className="section-title">رموز الكروت</h3>
                <div className="symbol-grid">
                  {cardSymbols.map(symbol => (
                    <div key={symbol.id} className="paytable-symbol-card">
                      <img src={symbol.image} alt={symbol.type} className="symbol-image" />
                      <div className="symbol-info">
                        <div className="symbol-name">
                          {getSymbolName(symbol.type)}
                        </div>
                        <div className="symbol-value">
                          <div>5x: {symbol.payout.five}x</div>
                          <div>4x: {symbol.payout.four}x</div>
                          <div>3x: {symbol.payout.three}x</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* قسم خطوط الدفع */}
            <TabsContent value="paylines" className="paytable-tab-content">
              <div className="paylines-info">
                <h3 className="section-title">معلومات عن خطوط الدفع</h3>
                <ul className="paylines-list">
                  <li>اللعبة تحتوي على 20 خط دفع.</li>
                  <li>يمكنك اختيار عدد خطوط الدفع النشطة من 10 إلى 20.</li>
                  <li>الفوز يتم احتسابه من اليسار إلى اليمين.</li>
                  <li>يجب وجود 3 رموز متطابقة على الأقل للفوز.</li>
                  <li>الرمز Wild (الصياد) يمكن أن يحل محل أي رمز آخر باستثناء Scatter.</li>
                </ul>
                
                <div className="paylines-diagram">
                  {/* هنا يمكن إضافة صورة توضيحية لخطوط الدفع */}
                  <div className="paylines-grid">
                    {Array.from({ length: 5 }).map((_, reelIndex) => (
                      <div key={reelIndex} className="paylines-reel">
                        {Array.from({ length: 3 }).map((_, rowIndex) => (
                          <div key={rowIndex} className="paylines-cell"></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* قسم المميزات */}
            <TabsContent value="features" className="paytable-tab-content">
              <div className="features-info">
                <h3 className="section-title">اللفات المجانية</h3>
                <div className="feature-detail">
                  <div className="feature-icon">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="feature-text">
                    <p>عند ظهور 3 أو أكثر من رموز Scatter (صندوق الطُعم)، تحصل على لفات مجانية.</p>
                    <ul>
                      <li>3 رموز Scatter = 15 لفة مجانية</li>
                      <li>4 رموز Scatter = 20 لفة مجانية</li>
                      <li>5 رموز Scatter = 25 لفة مجانية</li>
                    </ul>
                  </div>
                </div>
                
                <h3 className="section-title">ميزة جمع الأسماك</h3>
                <div className="feature-detail">
                  <div className="feature-icon">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="feature-text">
                    <p>خلال اللفات المجانية، تحمل رموز الأسماك قيمًا نقدية.</p>
                    <p>عند ظهور رمز الصياد (Wild)، يجمع كل قيم الأسماك المرئية.</p>
                    <p>عند جمع 4 صيادين، يزداد المضاعف.</p>
                    <ul>
                      <li>4 صيادين = مضاعف ×2</li>
                      <li>8 صيادين = مضاعف ×3</li>
                      <li>12 صياد = مضاعف ×10</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="paytable-footer">
          <div className="paytable-navigation">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setActiveTab(
                activeTab === 'symbols' ? 'features' : 
                activeTab === 'paylines' ? 'symbols' : 'paylines'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setActiveTab(
                activeTab === 'symbols' ? 'paylines' : 
                activeTab === 'paylines' ? 'features' : 'symbols'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

/**
 * الحصول على اسم الرمز
 */
function getSymbolName(type: SymbolType): string {
  switch (type) {
    case SymbolType.FISHERMAN:
      return 'صياد';
    case SymbolType.TACKLE_BOX:
      return 'صندوق الطُعم';
    case SymbolType.TREASURE:
      return 'كنز';
    case SymbolType.GOLDEN_FISH:
      return 'سمكة ذهبية';
    case SymbolType.SHARK:
      return 'قرش';
    case SymbolType.TUNA:
      return 'تونة';
    case SymbolType.SALMON:
      return 'سلمون';
    case SymbolType.SQUID:
      return 'حبار';
    case SymbolType.BLUE_WHALE:
      return 'حوت أزرق';
    case SymbolType.A:
      return 'A';
    case SymbolType.K:
      return 'K';
    case SymbolType.Q:
      return 'Q';
    case SymbolType.J:
      return 'J';
    case SymbolType.TEN:
      return '10';
    default:
      return 'غير معروف';
  }
}

export default PaytableDisplay;