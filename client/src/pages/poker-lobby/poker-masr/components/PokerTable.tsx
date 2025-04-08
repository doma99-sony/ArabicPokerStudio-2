import React from 'react';
import { Card } from '@/components/ui/card';

/**
 * مكون طاولة البوكر - يمثل الطاولة التي يلعب عليها اللاعبون
 */
export default function PokerTable() {
  return (
    <div className="poker-table-container relative w-full h-full flex items-center justify-center">
      <div className="poker-table bg-green-800 rounded-full w-[800px] h-[400px] border-8 border-brown-800 relative overflow-hidden">
        {/* منطقة الجزء الأوسط من الطاولة */}
        <div className="table-center absolute inset-0 flex items-center justify-center">
          <div className="community-cards flex gap-2">
            {/* هنا ستظهر الكروت المشتركة */}
          </div>
        </div>
        
        {/* مواقع اللاعبين (ستتم إضافتها لاحقاً) */}
        <div className="player-positions">
          {/* سيتم إضافة مواقع اللاعبين هنا */}
        </div>
      </div>
    </div>
  );
}