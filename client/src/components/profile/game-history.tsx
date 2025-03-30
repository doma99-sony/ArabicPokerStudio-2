import { GameHistoryItem } from "@/types";

interface GameHistoryProps {
  history: GameHistoryItem[];
}

export function GameHistory({ history }: GameHistoryProps) {
  return (
    <div className="bg-deepBlack p-4 rounded-lg border border-gold/20">
      <h3 className="text-xl font-bold text-gold mb-4 font-cairo">تاريخ المباريات</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-gold/20">
              <th className="pb-2 text-gold/90 font-tajawal">التاريخ</th>
              <th className="pb-2 text-gold/90 font-tajawal">الطاولة</th>
              <th className="pb-2 text-gold/90 font-tajawal">النتيجة</th>
              <th className="pb-2 text-gold/90 font-tajawal">الرقائق</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((game) => (
                <tr key={game.id} className="border-b border-slate/20">
                  <td className="py-3 text-white font-roboto">{game.date}</td>
                  <td className="py-3 text-white font-tajawal">{game.tableName}</td>
                  <td className={`py-3 ${game.result === 'win' ? 'text-green-500' : 'text-casinoRed'} font-tajawal`}>
                    {game.result === 'win' ? 'فوز' : 'خسارة'}
                  </td>
                  <td className={`py-3 ${game.result === 'win' ? 'text-green-500' : 'text-casinoRed'} font-roboto`}>
                    {game.result === 'win' ? '+' : ''}{game.chipsChange.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400 font-tajawal">
                  لا توجد مباريات سابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
