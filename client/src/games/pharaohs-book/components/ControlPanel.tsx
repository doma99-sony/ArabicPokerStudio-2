interface ControlPanelProps {
  bet: number;
  credits: number;
  changeBet: (amount: number) => void;
  spin: () => void;
  spinning: boolean;
  freeSpins: number;
  autoPlay: boolean;
  toggleAutoPlay: () => void;
}

/**
 * مكون لوحة التحكم للعبة كتاب الفرعون
 */
export default function ControlPanel({
  bet,
  credits,
  changeBet,
  spin,
  spinning,
  freeSpins,
  autoPlay,
  toggleAutoPlay
}: ControlPanelProps) {
  return (
    <div className="controls-panel">
      <div className="flex flex-wrap justify-between items-center gap-2">
        {/* التحكم بالرهان */}
        <div className="bet-controls flex items-center">
          <button 
            onClick={() => changeBet(-1)} 
            className="btn-bet-change text-white bg-[#B22222] px-3 py-1 rounded-l"
            disabled={spinning || bet <= 1}
          >
            -
          </button>
          <div className="bet-amount bg-[#2C3E50] text-[#D4AF37] px-3 py-1">
            {bet}
          </div>
          <button 
            onClick={() => changeBet(1)} 
            className="btn-bet-change text-white bg-[#006400] px-3 py-1 rounded-r"
            disabled={spinning || bet >= 100}
          >
            +
          </button>
          <span className="text-white mx-2">الرهان</span>
        </div>

        {/* معلومات الرصيد والدورات المجانية */}
        <div className="chips-info flex items-center gap-2">
          {freeSpins > 0 && (
            <div className="free-spins px-2 py-1 bg-[#D4AF37] text-black text-sm rounded-md">
              {freeSpins} دورة مجانية
            </div>
          )}
        </div>

        {/* زر الدوران */}
        <button 
          onClick={spin} 
          disabled={spinning || (credits < bet && freeSpins === 0)}
          className={`spin-button bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold py-2 px-6 rounded-full ${spinning ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
        >
          {spinning ? 'جاري الدوران...' : 'دوران'}
        </button>

        {/* اللعب التلقائي */}
        <button 
          onClick={toggleAutoPlay}
          className={`auto-play-button ${autoPlay ? 'bg-[#B22222]' : 'bg-[#2C3E50]'} text-white py-1 px-4 rounded`}
          disabled={spinning || (credits < bet && freeSpins === 0)}
        >
          {autoPlay ? 'إيقاف التلقائي' : 'اللعب التلقائي'}
        </button>
      </div>
      
      {/* أزرار استخدام مجموعات الرهان السريعة */}
      <div className="quick-bet-buttons flex justify-center mt-3 gap-2">
        <button 
          onClick={() => changeBet(-bet + 1)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning || bet === 1}
        >
          الحد الأدنى (1)
        </button>
        <button 
          onClick={() => changeBet(-bet + 5)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning}
        >
          5
        </button>
        <button 
          onClick={() => changeBet(-bet + 10)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning}
        >
          10
        </button>
        <button 
          onClick={() => changeBet(-bet + 25)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning}
        >
          25
        </button>
        <button 
          onClick={() => changeBet(-bet + 50)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning}
        >
          50
        </button>
        <button 
          onClick={() => changeBet(-bet + 100)} 
          className="quick-bet-button bg-[#1A2530] text-white py-1 px-2 rounded text-xs"
          disabled={spinning}
        >
          الحد الأقصى (100)
        </button>
      </div>
    </div>
  );
}