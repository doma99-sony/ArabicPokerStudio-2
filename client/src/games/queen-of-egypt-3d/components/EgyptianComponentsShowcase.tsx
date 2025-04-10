import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import CinematicIntro from './CinematicIntro';
import AnimatedCoinCounter from './AnimatedCoinCounter';

/**
 * معرض مكونات ملكة مصر ثلاثية الأبعاد
 * يعرض جميع المكونات المصرية بطريقة تفاعلية
 */
export default function EgyptianComponentsShowcase() {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [coinValue, setCoinValue] = useState<number>(1000);
  const [introComplete, setIntroComplete] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // دالة لتغيير القسم النشط
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  // دالة لإطلاق تغيير قيمة العملات
  const handleTriggerCoinAnimation = () => {
    setCoinValue(prevValue => prevValue + Math.floor(Math.random() * 1000) + 100);
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white p-4">
      <h1 className="text-3xl font-bold text-amber-400 text-center my-8">معرض مكونات ملكة مصر ثلاثية الأبعاد</h1>
      
      {/* شريط التنقل بين الأقسام */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          onClick={() => handleSectionChange('intro')}
          className={`px-4 py-2 rounded-md ${activeSection === 'intro' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-amber-400'}`}
        >
          المقدمة السينمائية
        </button>
        <button 
          onClick={() => handleSectionChange('coins')}
          className={`px-4 py-2 rounded-md ${activeSection === 'coins' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-amber-400'}`}
        >
          عداد العملات المتحرك
        </button>
        <button 
          onClick={() => handleSectionChange('icons')}
          className={`px-4 py-2 rounded-md ${activeSection === 'icons' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-amber-400'}`}
        >
          الأيقونات المصرية
        </button>
        <button 
          onClick={() => handleSectionChange('frames')}
          className={`px-4 py-2 rounded-md ${activeSection === 'frames' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-amber-400'}`}
        >
          الإطارات المصرية
        </button>
      </div>
      
      {/* قسم المقدمة السينمائية */}
      {activeSection === 'intro' && (
        <div className="showcase-section w-full h-[600px] overflow-hidden rounded-xl relative" ref={containerRef}>
          {!introComplete ? (
            <CinematicIntro 
              onComplete={() => setIntroComplete(true)} 
              skipEnabled={true}
              duration={10}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-black">
              <h2 className="text-2xl font-bold text-amber-400 mb-4">اكتملت المقدمة السينمائية</h2>
              <button 
                onClick={() => setIntroComplete(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
              >
                مشاهدة المقدمة مرة أخرى
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* قسم عداد العملات المتحرك */}
      {activeSection === 'coins' && (
        <div className="showcase-section p-8 bg-gradient-to-b from-gray-900 to-black rounded-xl">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">عداد العملات المتحرك</h2>
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-black/50 p-6 rounded-lg mb-4 w-64">
              <AnimatedCoinCounter 
                initialValue={coinValue - 500}
                targetValue={coinValue}
                size="large"
                duration={2}
              />
            </div>
            
            <button 
              onClick={handleTriggerCoinAnimation}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              إضافة عملات عشوائية
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold text-amber-400 mb-3">عداد صغير</h3>
              <div className="bg-black/30 p-3 rounded-lg">
                <AnimatedCoinCounter 
                  initialValue={100}
                  targetValue={1000}
                  size="small"
                  duration={3}
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold text-amber-400 mb-3">عداد متوسط</h3>
              <div className="bg-black/30 p-3 rounded-lg">
                <AnimatedCoinCounter 
                  initialValue={5000}
                  targetValue={10000}
                  size="medium"
                  duration={3}
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-bold text-amber-400 mb-3">عداد كبير</h3>
              <div className="bg-black/30 p-3 rounded-lg">
                <AnimatedCoinCounter 
                  initialValue={20000}
                  targetValue={100000}
                  size="large"
                  duration={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* قسم الأيقونات المصرية */}
      {activeSection === 'icons' && (
        <div className="showcase-section p-8 bg-gradient-to-b from-gray-900 to-black rounded-xl">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">الأيقونات المصرية</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* أيقونة التاج المصري */}
            <div className="flex flex-col items-center p-4 bg-black/40 rounded-lg">
              <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12" viewBox="0 0 100 100">
                  <path
                    d="M50,20 L70,40 L90,25 L80,65 L20,65 L10,25 L30,40 Z"
                    fill="#FFD700"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className="text-amber-400 text-center">تاج الملكة</p>
            </div>
            
            {/* أيقونة القط المصري */}
            <div className="flex flex-col items-center p-4 bg-black/40 rounded-lg">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12" viewBox="0 0 100 100">
                  <path
                    d="M30,75 L30,40 L70,40 L70,75 C60,85 40,85 30,75 Z"
                    fill="#8B5CF6"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  <circle cx="40" cy="55" r="5" fill="#FFF" />
                  <circle cx="60" cy="55" r="5" fill="#FFF" />
                  <path
                    d="M30,40 L20,20 L35,35 M70,40 L80,20 L65,35"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <p className="text-amber-400 text-center">القط المصري</p>
            </div>
            
            {/* أيقونة صقر حورس */}
            <div className="flex flex-col items-center p-4 bg-black/40 rounded-lg">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12" viewBox="0 0 100 100">
                  <path
                    d="M50,20 C65,20 75,35 75,55 L60,70 L40,70 L25,55 C25,35 35,20 50,20 Z"
                    fill="#F59E0B"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  <circle cx="40" cy="45" r="5" fill="#FFF" />
                  <circle cx="60" cy="45" r="5" fill="#FFF" />
                  <path
                    d="M45,60 L55,60"
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <p className="text-amber-400 text-center">صقر حورس</p>
            </div>
            
            {/* أيقونة الكوبرا */}
            <div className="flex flex-col items-center p-4 bg-black/40 rounded-lg">
              <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mb-2">
                <svg className="w-12 h-12" viewBox="0 0 100 100">
                  <path
                    d="M50,80 C50,80 70,60 70,40 C70,25 60,20 50,20 C40,20 30,25 30,40 C30,60 50,80 50,80 Z"
                    fill="#059669"
                    stroke="#FFF"
                    strokeWidth="1"
                  />
                  <circle cx="40" cy="35" r="3" fill="#FFF" />
                  <circle cx="60" cy="35" r="3" fill="#FFF" />
                  <path
                    d="M40,50 L60,50"
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <p className="text-amber-400 text-center">الكوبرا</p>
            </div>
          </div>
        </div>
      )}
      
      {/* قسم الإطارات المصرية */}
      {activeSection === 'frames' && (
        <div className="showcase-section p-8 bg-gradient-to-b from-gray-900 to-black rounded-xl">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">الإطارات المصرية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* إطار مصري ذهبي */}
            <div className="p-8 border-4 border-amber-600 relative bg-black/40">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amber-500 transform -translate-x-4 -translate-y-4"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amber-500 transform translate-x-4 -translate-y-4"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amber-500 transform -translate-x-4 translate-y-4"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amber-500 transform translate-x-4 translate-y-4"></div>
              
              <h3 className="text-xl font-bold text-amber-400 mb-3 text-center">إطار مصري ذهبي</h3>
              <p className="text-gray-300">
                إطار مستوحى من الزخارف المصرية القديمة، مُزين بحواف ذهبية وزوايا مميزة تعكس الفخامة والأصالة المصرية.
              </p>
            </div>
            
            {/* إطار مصري فرعوني */}
            <div className="p-8 bg-black/40 relative">
              <div className="absolute inset-0 border-8 border-double border-amber-700 m-2"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-6 bg-amber-700 rounded-full flex items-center justify-center">
                <div className="w-10 h-4 bg-amber-500 rounded-full"></div>
              </div>
              
              <h3 className="text-xl font-bold text-amber-400 mb-3 text-center mt-4">إطار فرعوني</h3>
              <p className="text-gray-300">
                إطار بطراز فرعوني مميز يحاكي النقوش القديمة على جدران المعابد، مع تفاصيل دقيقة تضفي الطابع التاريخي.
              </p>
            </div>
            
            {/* إطار مصري للنقوش */}
            <div className="p-8 bg-amber-900/40 relative">
              <div className="absolute inset-0 bg-[url('/patterns/hieroglyphs.png')] opacity-10"></div>
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-900 via-amber-500 to-amber-900"></div>
              <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-amber-900 via-amber-500 to-amber-900"></div>
              <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-amber-900 via-amber-500 to-amber-900"></div>
              <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-amber-900 via-amber-500 to-amber-900"></div>
              
              <h3 className="text-xl font-bold text-amber-400 mb-3 text-center">إطار النقوش الهيروغليفية</h3>
              <p className="text-gray-300">
                إطار مزين بنقوش هيروغليفية تحكي القصص القديمة، مرصع بأحجار كريمة وعناصر ذهبية تعكس ثقافة الفراعنة.
              </p>
            </div>
            
            {/* إطار مصري بسيط */}
            <div className="p-8 bg-gradient-to-r from-amber-900/30 to-amber-700/30 border-l-4 border-amber-500">
              <h3 className="text-xl font-bold text-amber-400 mb-3">إطار الأهرامات</h3>
              <p className="text-gray-300">
                إطار بسيط وأنيق يستوحي تصميمه من شكل الأهرامات المصرية الشامخة، ويتميز بخطوط بسيطة ولون ذهبي دافئ.
              </p>
              
              <div className="mt-4 flex justify-end">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12,2 L2,20 L22,20 Z" fill="#D4AF37" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}