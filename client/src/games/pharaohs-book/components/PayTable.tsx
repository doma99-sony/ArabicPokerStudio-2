import { useState } from 'react';

interface PayTableProps {
  bet: number;
}

/**
 * مكون جدول المكافآت للعبة كتاب الفرعون
 */
export default function PayTable({ bet }: PayTableProps) {
  const [expanded, setExpanded] = useState(false);

  // جدول المكافآت (قيم الرمز × الرهان)
  const payouts = {
    'pharaoh': { 2: 5, 3: 20, 4: 100, 5: 500 },
    'book': { 3: 18, 4: 80, 5: 200 },
    'anubis': { 3: 15, 4: 70, 5: 150 },
    'eye': { 3: 15, 4: 60, 5: 125 },
    'scarab': { 3: 10, 4: 40, 5: 100 },
    'a': { 3: 5, 4: 20, 5: 50 },
    'k': { 3: 5, 4: 15, 5: 40 },
    'q': { 3: 3, 4: 10, 5: 30 },
    'j': { 3: 3, 4: 10, 5: 30 },
    '10': { 3: 2, 4: 5, 5: 25 }
  };

  // الرموز ووصفها
  const symbols = [
    { name: 'pharaoh', icon: '🧙‍♂️', label: 'الفرعون' },
    { name: 'book', icon: '📕', label: 'الكتاب' },
    { name: 'anubis', icon: '🐕', label: 'أنوبيس' },
    { name: 'eye', icon: '👁️', label: 'عين حورس' },
    { name: 'scarab', icon: '🪲', label: 'الجعران' },
    { name: 'a', icon: 'A', label: 'A' },
    { name: 'k', icon: 'K', label: 'K' },
    { name: 'q', icon: 'Q', label: 'Q' },
    { name: 'j', icon: 'J', label: 'J' },
    { name: '10', icon: '10', label: '10' }
  ];

  // حساب قيمة المكافأة مع الرهان الحالي
  const calculatePayout = (symbolName: string, count: number) => {
    const symbol = symbolName as keyof typeof payouts;
    if (payouts[symbol] && payouts[symbol][count as keyof typeof payouts[symbol]]) {
      return payouts[symbol][count as keyof typeof payouts[symbol]] * bet;
    }
    return 0;
  };

  // تبديل حالة العرض (موسع/مطوي)
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`paytable mt-4 bg-[#1A2530]/90 border border-[#D4AF37] rounded ${expanded ? 'p-4' : 'p-2'} text-white transition-all duration-300`}>
      <div 
        className="text-center text-[#D4AF37] mb-2 font-bold cursor-pointer flex items-center justify-center gap-1"
        onClick={toggleExpanded}
      >
        <span>جدول المكافآت</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </div>
      
      {expanded ? (
        <>
          <div className="p-2 bg-[#0A1A1A]/50 rounded mb-2 text-center">
            <div className="text-[#D4AF37] font-bold mb-1">قواعد اللعبة</div>
            <div className="text-xs">
              <p>• ٣ كتب أو أكثر تمنح ١٠ دورات مجانية</p>
              <p>• في الدورات المجانية يتم اختيار رمز خاص يتوسع</p>
              <p>• تبدأ خطوط الفوز من اليسار إلى اليمين</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* القسم الأول: الرموز عالية القيمة */}
            <div className="space-y-2">
              <div className="text-[#D4AF37] font-bold mb-1">الرموز عالية القيمة</div>
              {symbols.slice(0, 5).map(symbol => (
                <div key={symbol.name} className="flex items-center justify-between py-1 border-b border-[#D4AF37]/20">
                  <div className="flex items-center gap-2">
                    <div className="symbol-mini w-6 h-6 flex items-center justify-center bg-[#2C3E50] rounded border border-[#D4AF37]/30">
                      <span>{symbol.icon}</span>
                    </div>
                    <span>{symbol.label}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {Object.entries(payouts[symbol.name as keyof typeof payouts])
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([count, multiplier]) => (
                        <div key={count} className="text-center">
                          <div className="text-[#D4AF37]">{count}×</div>
                          <div>{calculatePayout(symbol.name, Number(count))}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* القسم الثاني: الرموز منخفضة القيمة */}
            <div className="space-y-2">
              <div className="text-[#D4AF37] font-bold mb-1">الرموز منخفضة القيمة</div>
              {symbols.slice(5).map(symbol => (
                <div key={symbol.name} className="flex items-center justify-between py-1 border-b border-[#D4AF37]/20">
                  <div className="flex items-center gap-2">
                    <div className="symbol-mini w-6 h-6 flex items-center justify-center bg-[#2C3E50] rounded border border-[#D4AF37]/30">
                      <span>{symbol.icon}</span>
                    </div>
                    <span>{symbol.label}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {Object.entries(payouts[symbol.name as keyof typeof payouts])
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([count, multiplier]) => (
                        <div key={count} className="text-center">
                          <div className="text-[#D4AF37]">{count}×</div>
                          <div>{calculatePayout(symbol.name, Number(count))}</div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-5 gap-1 text-xs">
          <div>🧙‍♂️ 5× {calculatePayout('pharaoh', 5)}</div>
          <div>📕 5× {calculatePayout('book', 5)}</div>
          <div>🐕 5× {calculatePayout('anubis', 5)}</div>
          <div>👁️ 5× {calculatePayout('eye', 5)}</div>
          <div>🪲 5× {calculatePayout('scarab', 5)}</div>
        </div>
      )}
    </div>
  );
}