import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NarutoPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const goBack = () => {
    navigate("/");
  };

  return (
    <div 
      className="min-h-screen text-white py-4 px-6"
      style={{
        backgroundColor: '#1a1a2e',
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" className="text-white hover:text-gold transition-colors" onClick={goBack}>
            <ArrowLeft className="ml-2" />
            <span className="font-cairo">العودة للوبي</span>
          </Button>

          <h1 className="text-3xl font-bold text-[#ff9d00] font-cairo">ناروتو - قريباً</h1>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div 
            className="p-8 rounded-lg max-w-4xl w-full border border-[#ff9d00]/30 bg-[#16213e]"
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
              <li className="text-lg">شخصيات مميزة من عالم ناروتو</li>
              <li className="text-lg">قتال تكتيكي مع تقنيات النينجا</li>
              <li className="text-lg">قصة مشوقة ومهام متنوعة</li>
              <li className="text-lg">رسومات عالية الجودة</li>
            </ul>
            <div className="mt-10 text-center">
              <Button 
                className="bg-[#ff9d00] hover:bg-[#ff9d00]/80 text-black font-bold px-10 py-6 rounded-full text-xl" 
                disabled
              >
                <span className="font-cairo">قريباً - ترقب الإطلاق</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}