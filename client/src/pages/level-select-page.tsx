import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LevelSelector } from "@/components/lobby/level-selector";

export default function LevelSelectPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // التحقق من تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-gold border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A17] to-[#111] py-8">
      <div className="container mx-auto px-4">
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">بوكر عرباوي</h1>
          <p className="text-gray-400">اختر مستوى اللعب المناسب لك</p>
        </div>
        
        {/* معلومات اللاعب */}
        {user && (
          <div className="bg-black/40 p-4 rounded-lg border border-gold/30 mb-8 max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-gray-300 text-sm">اللاعب:</span>
                <span className="text-white font-bold">{user.username}</span>
              </div>
              <div>
                <span className="block text-gray-300 text-sm">الرصيد:</span>
                <span className="text-gold font-bold">{user.chips?.toLocaleString()} رقاقة</span>
              </div>
            </div>
          </div>
        )}
        
        {/* مكون اختيار المستوى */}
        <LevelSelector />
      </div>
    </div>
  );
}