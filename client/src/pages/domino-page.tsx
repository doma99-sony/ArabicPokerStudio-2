import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function DominoPage() {
  const [, navigate] = useLocation();
  const [showInfo, setShowInfo] = useState(false);
  
  // تأثير مضيء للعناصر
  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 15px 5px rgba(212, 175, 55, 0.7)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-black to-[#0A0A0A] text-white">
      {/* خلفية هالات ذهبية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4AF37]/10 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full filter blur-[120px]"></div>
      </div>
      
      {/* الشريط العلوي */}
      <div className="relative z-10 bg-black shadow-lg border-b border-[#D4AF37]/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-[#D4AF37] flex items-center space-x-2 rtl:space-x-reverse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span className="font-bold">الرئيسية</span>
          </button>
          
          <h1 className="text-lg font-bold text-[#D4AF37]">لعبة الدومينو</h1>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-9 h-9 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* المحتوى الرئيسي */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-2">لعبة الدومينو العربية</h2>
          <p className="text-white/70">استمتع بلعب الدومينو بالطريقة العربية الأصيلة</p>
        </div>
        
        {/* عرض معلومات اللعبة */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-black/60 border border-[#D4AF37]/20 rounded-lg shadow-lg"
            >
              <h3 className="text-[#D4AF37] font-bold mb-2">كيفية اللعب</h3>
              <ul className="text-white/80 text-sm space-y-2 list-disc list-inside rtl:pr-4">
                <li>يحصل كل لاعب على 7 أحجار دومينو في بداية اللعبة</li>
                <li>اللاعب الذي يملك الدومينو الأعلى يبدأ اللعب</li>
                <li>في دورك، يجب عليك وضع حجر دومينو بحيث تتطابق أرقامه مع الأحجار المكشوفة</li>
                <li>إذا لم تستطع اللعب، يجب أن تأخذ حجرًا من البنك</li>
                <li>الفائز هو أول من ينتهي من كل أحجاره</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* أنماط لعب الدومينو */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* لعبة الدومينو التقليدية */}
          <motion.div
            whileHover="hover"
            initial="hidden"
            animate="visible"
            variants={glowVariants}
            className="relative overflow-hidden aspect-[3/4] rounded-xl border-2 border-[#D4AF37]/40 shadow-lg group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10"></div>
            
            {/* صورة الخلفية */}
            <div className="absolute inset-0 bg-black">
              <img 
                src="/assets/domino/domino-classic.png" 
                alt="دومينو تقليدي" 
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* تأثير توهج متحرك */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 animate-pulse-slow"></div>
            </div>
            
            {/* المعلومات */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white mb-2">دومينو تقليدي</h3>
              <p className="text-white/70 text-sm mb-3">استمتع بلعب الدومينو بالطريقة العربية التقليدية مع أصدقائك</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full border border-[#D4AF37]/30">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span>
                  4,125 لاعب متصل
                </span>
                
                <button 
                  onClick={() => alert("سيتم فتح لعبة الدومينو التقليدية")}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold px-4 py-1.5 rounded-lg text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300 animate-glow"
                >
                  العب الآن
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* لعبة دومينو الدبل 6 */}
          <motion.div
            whileHover="hover"
            initial="hidden"
            animate="visible"
            variants={glowVariants}
            className="relative overflow-hidden aspect-[3/4] rounded-xl border-2 border-[#D4AF37]/40 shadow-lg group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10"></div>
            
            {/* صورة الخلفية */}
            <div className="absolute inset-0 bg-black">
              <img 
                src="/assets/domino/domino-double6.png" 
                alt="دومينو الدبل 6" 
                className="w-full h-full object-cover opacity-80"
              />
              
              {/* تأثير توهج متحرك */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 animate-pulse-slow"></div>
            </div>
            
            {/* المعلومات */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-bold text-white mb-2">دومينو الدبل 6</h3>
              <p className="text-white/70 text-sm mb-3">النسخة المحترفة من الدومينو حيث تبدأ اللعبة بالدبل 6</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full border border-[#D4AF37]/30">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse"></span>
                  2,789 لاعب متصل
                </span>
                
                <button 
                  onClick={() => alert("سيتم فتح لعبة دومينو الدبل 6")}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold px-4 py-1.5 rounded-lg text-sm hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all duration-300 animate-glow"
                >
                  العب الآن
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* بطولات الدومينو */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#D4AF37] mb-4">بطولات الدومينو القادمة</h2>
          
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/50 border border-[#D4AF37]/20 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-white">بطولة كأس الدومينو العربي</h3>
                <p className="text-sm text-white/60">تبدأ بعد: 2 يوم و 4 ساعات</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    128 مشارك
                  </span>
                </div>
              </div>
              <div>
                <div className="text-center">
                  <span className="block text-[#D4AF37] font-bold">10,000</span>
                  <span className="text-xs text-white/60">رقاقة ذهبية</span>
                </div>
                <button className="mt-2 text-xs bg-[#D4AF37]/80 hover:bg-[#D4AF37] text-black font-bold px-3 py-1 rounded transition-colors duration-200">
                  اشترك الآن
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="bg-black/50 border border-[#D4AF37]/20 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-white">بطولة محترفي الدومينو</h3>
                <p className="text-sm text-white/60">تبدأ بعد: 5 أيام</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    96 مشارك
                  </span>
                </div>
              </div>
              <div>
                <div className="text-center">
                  <span className="block text-[#D4AF37] font-bold">5,000</span>
                  <span className="text-xs text-white/60">رقاقة ذهبية</span>
                </div>
                <button className="mt-2 text-xs bg-[#D4AF37]/80 hover:bg-[#D4AF37] text-black font-bold px-3 py-1 rounded transition-colors duration-200">
                  اشترك الآن
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* شريط القائمة السفلي */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#D4AF37]/30 p-3 flex justify-around items-center z-20">
        <button 
          onClick={() => navigate("/")}
          className="flex flex-col items-center justify-center space-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-xs text-white/80">الرئيسية</span>
        </button>
        
        <button className="flex flex-col items-center justify-center space-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <span className="text-xs text-white/80">إنشاء طاولة</span>
        </button>
        
        <button className="flex flex-col items-center justify-center space-y-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span className="text-xs text-white/80">التصنيفات</span>
        </button>
        
        <button 
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center justify-center space-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4AF37]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="text-xs text-white/80">الملف الشخصي</span>
        </button>
      </div>
    </div>
  );
}