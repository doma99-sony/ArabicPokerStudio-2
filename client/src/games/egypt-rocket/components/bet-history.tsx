import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BetHistoryProps {
  history: Array<{ multiplier: number, timestamp: Date }>;
}

const BetHistory = ({ history }: BetHistoryProps) => {
  return (
    <div className="w-full">
      <h3 className="text-[#D4AF37] font-bold mb-3 text-center">تاريخ الجولات</h3>
      
      {history.length === 0 ? (
        <div className="text-center text-gray-400 py-4">لا يوجد تاريخ سابق</div>
      ) : (
        <div className="space-y-2">
          {history.map((item, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-2 rounded-lg bg-black/30 border border-[#D4AF37]/20"
            >
              <div>
                <div 
                  className={`font-mono font-bold text-lg ${
                    item.multiplier < 1.5 ? 'text-red-500' : 
                    item.multiplier < 3 ? 'text-yellow-500' : 
                    'text-green-500'
                  }`}
                >
                  {item.multiplier.toFixed(2)}x
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(item.timestamp, { 
                    addSuffix: true,
                    locale: ar // استخدام اللغة العربية لتنسيق الوقت
                  })}
                </div>
              </div>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  item.multiplier < 1.5 ? 'bg-red-500/20 text-red-500' : 
                  item.multiplier < 3 ? 'bg-yellow-500/20 text-yellow-500' : 
                  'bg-green-500/20 text-green-500'
                }`}
              >
                <span>
                  {item.multiplier < 1.5 ? '💥' : 
                   item.multiplier < 3 ? '🙂' : 
                   item.multiplier < 5 ? '🤑' : '🔥'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* إحصائيات سريعة */}
      {history.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-black/30 border border-[#D4AF37]/20">
          <h4 className="text-center text-sm text-[#D4AF37] mb-2">الإحصائيات</h4>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-sm font-bold">
                {history.reduce((max, curr) => Math.max(max, curr.multiplier), 0).toFixed(2)}x
              </div>
              <div className="text-xs text-gray-400">أعلى مضاعف</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">
                {(history.reduce((sum, curr) => sum + curr.multiplier, 0) / history.length).toFixed(2)}x
              </div>
              <div className="text-xs text-gray-400">المتوسط</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">
                {history.reduce((min, curr) => Math.min(min, curr.multiplier), Infinity).toFixed(2)}x
              </div>
              <div className="text-xs text-gray-400">أدنى مضاعف</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetHistory;