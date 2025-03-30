import { useState } from "react";
import { useLocation } from "wouter";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [, navigate] = useLocation();
  
  return (
    <div className="fixed inset-0 bg-deepBlack bg-opacity-90 flex items-center justify-center z-50">
      <div 
        className="relative max-w-md w-full mx-4 bg-slate bg-opacity-95 rounded-xl overflow-hidden" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="absolute inset-0 bg-deepBlack bg-opacity-80"></div>
        
        <div className="relative p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2 font-cairo">بوكر تكساس هولدم</h1>
            <p className="text-gold/80 font-tajawal">
              {activeTab === AuthTab.Login ? "تسجيل الدخول للعب" : "تسجيل حساب جديد"}
            </p>
          </div>
          
          {activeTab === AuthTab.Login ? (
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab(AuthTab.Register)}
                className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-3 rounded transition-colors font-cairo"
              >
                تسجيل الدخول
              </button>
              <p className="text-center text-gold/70 text-sm">
                ليس لديك حساب؟{" "}
                <button
                  onClick={() => setActiveTab(AuthTab.Register)}
                  className="text-gold underline hover:text-lightGold"
                >
                  سجل الآن
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab(AuthTab.Login)}
                className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-3 rounded transition-colors font-cairo"
              >
                إنشاء حساب
              </button>
              <p className="text-center text-gold/70 text-sm">
                لديك حساب بالفعل؟{" "}
                <button
                  onClick={() => setActiveTab(AuthTab.Login)}
                  className="text-gold underline hover:text-lightGold"
                >
                  سجل الدخول
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
