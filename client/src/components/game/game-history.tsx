import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChevronDown, ChevronUp, History } from "lucide-react";

// تعريف واجهة عنصر السجل
export interface GameHistoryItem {
  id: string;
  round: number;
  action: string;
  player: string;
  amount?: number;
  timestamp: number;
}

interface GameHistoryProps {
  history: GameHistoryItem[];
}

export function GameHistory({ history }: GameHistoryProps) {
  // حالة لعرض/إخفاء قائمة السجل
  const [isExpanded, setIsExpanded] = useState(true);

  // تحويل الإجراء إلى وصف عربي
  const translateAction = (action: string): string => {
    const actions: Record<string, string> = {
      fold: "انسحاب",
      check: "متابعة",
      call: "مجاراة",
      raise: "رفع",
      all_in: "كل الرقاقات",
      start_round: "بداية جولة",
      end_round: "نهاية جولة",
      deal_cards: "توزيع الأوراق",
      flop: "الفلوب",
      turn: "التيرن",
      river: "الريفر",
      showdown: "المكاشفة",
      timeout: "انتهاء الوقت",
      win: "فوز",
    };

    return actions[action] || action;
  };

  // تنسيق الوقت
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // تغيير حالة القائمة
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed top-24 right-0 z-40 w-60 bg-black/80 border-l border-t border-[#D4AF37]/60 rounded-tl-lg shadow-lg transition-all duration-300 transform">
      {/* رأس القائمة */}
      <div 
        className="bg-gradient-to-r from-[#0A3A2A] to-[#1A5B4A] p-2 flex items-center justify-between border-b border-[#D4AF37] cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#D4AF37]" />
          <h3 className="text-[#D4AF37] font-bold text-sm">سجل الأحداث</h3>
          <div className="flex items-center mr-2 text-xs text-white/90 bg-black/30 px-2 py-0.5 rounded-full">
            <span>{history.length}</span>
          </div>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white/80" />
          ) : (
            <ChevronUp className="h-4 w-4 text-white/80" />
          )}
        </div>
      </div>

      {/* جسم القائمة */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <ScrollArea className="h-full max-h-80">
          <div className="p-3 space-y-2">
            {history.length === 0 ? (
              <div className="text-center text-white/60 text-sm p-4">
                لم تبدأ أي أحداث بعد
              </div>
            ) : (
              // عرض الأحداث بالترتيب العكسي (الأحدث أولاً)
              [...history].reverse().map((item) => (
                <div 
                  key={item.id} 
                  className="border-b border-[#D4AF37]/10 pb-1 last:border-0"
                >
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="bg-[#0A3A2A]/80 text-[#D4AF37] px-2 py-0.5 rounded-sm">
                      جولة {item.round}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm">
                    <span className="font-bold text-[#D4AF37]">{item.player}: </span>
                    <span className="mr-1 text-white">
                      {translateAction(item.action)}
                      {item.amount !== undefined && item.amount > 0 ? ` (${item.amount})` : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}