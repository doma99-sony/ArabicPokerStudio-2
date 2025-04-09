interface ControlPanelProps {
  bet: number;
  credits: number;
  changeBet: (amount: number) => void;
  spin: () => void;
  spinning: boolean;
  freeSpins: number;
  autoPlay: boolean;
  toggleAutoPlay: () => void;
  isMuted?: boolean;
  toggleMute?: () => void;
}

// قيم الرهان الثابتة
const BET_VALUES = [10000, 100000, 500000, 1000000, 5000000, 10000000];

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
  toggleAutoPlay,
  isMuted = false,
  toggleMute = () => {}
}: ControlPanelProps) {
  return (
    <div className="controls-panel">
      <div className="flex flex-wrap justify-between items-center gap-2">
        {/* الدورات المجانية في أعلى اللوحة */}
        {freeSpins > 0 && (
          <div className="free-spins-badge absolute top-[-50px] left-0 right-0 mx-auto w-max z-20 bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black py-2 px-6 rounded-full text-xl font-bold shadow-lg animate-pulse">
            {freeSpins} دورة مجانية متبقية
          </div>
        )}

        {/* التحكم بالرهان - قائمة منسدلة */}
        <div className="bet-controls flex items-center">
          <div className="relative">
            <select 
              value={bet}
              onChange={(e) => changeBet(parseInt(e.target.value) - bet)}
              disabled={spinning || freeSpins > 0}
              className="bet-select bg-[#2C3E50] text-[#D4AF37] px-3 py-2 rounded border-2 border-[#D4AF37] appearance-none pr-10 font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {BET_VALUES.map(value => (
                <option key={value} value={value}>
                  {value.toLocaleString()}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#D4AF37]">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
            </div>
          </div>
          <span className="text-white mx-2 font-bold">الرهان</span>
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
      
      {/* أزرار الرهان السريعة */}
      <div className="quick-bet-buttons flex flex-wrap justify-center mt-4 gap-2">
        {BET_VALUES.map(value => (
          <button 
            key={value}
            onClick={() => changeBet(value - bet)} 
            className={`quick-bet-button ${bet === value ? 'bg-[#D4AF37] text-black' : 'bg-[#1A2530] text-white'} py-1 px-3 rounded text-sm font-bold transition-colors`}
            disabled={spinning || freeSpins > 0}
          >
            {value.toLocaleString()}
          </button>
        ))}
        
        {/* زر كتم الصوت */}
        <button 
          onClick={toggleMute}
          className={`sound-button bg-[#1A2530] text-white py-1 px-3 rounded text-sm flex items-center ml-2`}
        >
          {isMuted ? (
            // أيقونة الصوت المغلق
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          ) : (
            // أيقونة الصوت المفعل
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          )}
          <span className="mr-1">{isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}</span>
        </button>
      </div>

      {/* عرض الرصيد الحالي */}
      <div className="credits-display flex justify-center mt-3">
        <div className="bg-[#0A1A1A] text-[#D4AF37] py-1 px-4 rounded-full border border-[#D4AF37] font-bold">
          الرصيد: {credits.toLocaleString()}
        </div>
      </div>
    </div>
  );
}