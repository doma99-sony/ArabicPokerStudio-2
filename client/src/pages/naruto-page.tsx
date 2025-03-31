import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Image } from "@/components/ui/image";
import { ChatBox } from "@/components/lobby/chat-box";

export default function NarutoPage({ params }: { params?: { tableId?: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // التحقق من وجود المستخدم
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // التعامل مع تشغيل/إيقاف الصوت
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // العودة للصفحة السابقة
  const goBack = () => {
    navigate("/");
  };

  return (
    <div 
  className="min-h-screen text-white py-4 px-6"
  style={{
    backgroundImage: 'url("/assets/images/naruto-bg.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    loading: 'lazy'
  }}
>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" className="text-white hover:text-gold transition-colors" onClick={goBack}>
            <ArrowLeft className="ml-2" />
            <span className="font-cairo">العودة للوبي</span>
          </Button>

          <h1 className="text-3xl font-bold text-[#ff9d00] font-cairo naruto-glow">ناروتو - قريباً</h1>

          <Button variant="ghost" className="text-white hover:text-[#ff9d00] transition-colors" onClick={toggleMute}>
            {isMuted ? <VolumeX className="ml-2" /> : <Volume2 className="ml-2" />}
            <span className="font-cairo">{isMuted ? "تشغيل الصوت" : "كتم الصوت"}</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center naruto-container">
          <div className="rounded-lg overflow-hidden shadow-2xl mb-8 max-w-4xl w-full">
            <video 
              ref={videoRef}
              className="w-full h-auto" 
              autoPlay 
              loop 
              muted
              playsInline
              controls
            >
              <source src="/assets/naruto-video.mp4" type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          </div>

          <div 
            className="p-8 rounded-lg max-w-4xl w-full border border-[#ff9d00]/30"
            style={{
              backgroundImage: 'url("/assets/images/naruto-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(26, 26, 46, 0.95)',
              loading: 'lazy'
            }}
          >
            <h2 className="text-2xl font-bold text-[#ff9d00] mb-6 font-cairo">لعبة ناروتو - قريباً</h2>
            <p className="text-white mb-6 font-cairo leading-relaxed text-lg">
              استعد لتجربة مثيرة في عالم ناروتو! قريباً ستتمكن من خوض معارك حماسية واستخدام قدرات النينجا الخاصة بك.
              انضم إلى أبطال ناروتو في مغامرات لا تنسى مع رسومات مذهلة وأسلوب لعب فريد.
            </p>
            <p className="text-[#ff9d00] mb-4 font-cairo text-xl">
              الميزات القادمة:
            </p>
            <ul className="list-disc list-inside text-white space-y-3 font-cairo mb-8">
              <li className="text-lg">شخصيات من عالم ناروتو</li>
              <li className="text-lg">معارك مثيرة بنظام قتال تكتيكي</li>
              <li className="text-lg">قدرات خاصة (جوتسو) لكل شخصية</li>
              <li className="text-lg">جوائز وترقيات للشخصيات</li>
              <li className="text-lg">منافسة مع لاعبين آخرين</li>
            </ul>

            <div className="mt-10 text-center">
              <Button 
                className="bg-[#ff9d00] hover:bg-[#ff9d00]/80 text-black font-bold px-10 py-6 rounded-full naruto-glow text-xl" 
                disabled
              >
                <span className="font-cairo">قريباً - ترقب الإطلاق</span>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-start gap-8 mb-12">
              {/* Chat Section */}
              <div className="w-full md:w-auto">
                <div className="bg-[#1a1a2e] p-6 rounded-lg max-w-4xl w-full border border-[#ff9d00]/30">
                  <h2 className="text-2xl font-bold text-[#ff9d00] mb-6 font-cairo">الدردشة</h2>
                  <div className="bg-black/30 rounded-lg p-4 h-[300px] overflow-y-auto mb-4" dir="ltr">
                    <ChatBox />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}