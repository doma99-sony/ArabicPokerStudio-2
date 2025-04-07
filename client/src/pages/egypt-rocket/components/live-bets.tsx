import { formatChips } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface LiveBetsProps {
  bets: Array<{
    username: string;
    amount: number;
    multiplier: number | null;
    profit: number | null;
    isCashedOut: boolean;
  }>;
}

const LiveBets = ({ bets }: LiveBetsProps) => {
  const { user } = useAuth();
  
  return (
    <div className="w-full">
      <h3 className="text-[#D4AF37] font-bold mb-3 text-center">الرهانات الحية</h3>
      
      {bets.length === 0 ? (
        <div className="text-center text-gray-400 py-4">لا توجد رهانات حالية</div>
      ) : (
        <div className="space-y-2">
          {bets.map((bet, index) => {
            const isCurrentUser = user?.username === bet.username;
            
            return (
              <div 
                key={index} 
                className={`p-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/40' 
                    : 'bg-black/30 border border-[#D4AF37]/20'
                } transition-colors duration-300`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      bet.isCashedOut 
                        ? 'bg-green-500' 
                        : (bet.profit !== null && bet.profit < 0) 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500 animate-pulse'
                    }`}></div>
                    <div className="font-medium text-base">
                      {bet.username} {isCurrentUser && '(أنت)'}
                    </div>
                  </div>
                  <div className="text-[#D4AF37] font-medium text-base">
                    {formatChips(bet.amount)}
                  </div>
                </div>
                
                {/* معلومات المضاعف والربح */}
                {bet.multiplier !== null && (
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <div className={`${
                      bet.isCashedOut 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    } text-sm font-medium`}>
                      {bet.isCashedOut ? 'جمع عند' : 'تحطم عند'} {bet.multiplier.toFixed(2)}x
                    </div>
                    <div className={`${
                      bet.profit && bet.profit > 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    } font-bold text-sm`}>
                      {bet.profit && bet.profit > 0 ? '+' : ''}{formatChips(bet.profit || 0)}
                    </div>
                  </div>
                )}
                
                {/* حالة الانتظار */}
                {bet.multiplier === null && (
                  <div className="flex justify-center items-center mt-1">
                    <div className="text-yellow-500 flex items-center text-sm font-medium">
                      <span className="mr-1">في انتظار الإطلاق</span>
                      <div className="flex space-x-1 rtl:space-x-reverse">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* إحصائيات الرهانات الحية */}
      {bets.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-black/30 border border-[#D4AF37]/20">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400">عدد الرهانات</div>
              <div className="font-bold text-sm">{bets.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">إجمالي الرهانات</div>
              <div className="font-bold text-sm text-[#D4AF37]">{formatChips(bets.reduce((sum, bet) => sum + bet.amount, 0))}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">المجموع للجمع</div>
              <div className="font-bold text-sm text-green-500">{formatChips(
                bets
                  .filter(bet => bet.isCashedOut && bet.profit !== null && bet.profit > 0)
                  .reduce((sum, bet) => sum + (bet.profit || 0), 0)
              )}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBets;