import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] bg-opacity-90 flex items-center justify-center">
      <div 
        className="relative max-w-md w-full mx-4 bg-slate bg-opacity-95 rounded-xl overflow-hidden shadow-lg" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="absolute inset-0 bg-[#0A0A0A] bg-opacity-80"></div>
        
        <div className="relative p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">بوكر تكساس هولدم</h1>
            <p className="text-[#D4AF37]/80">
              {activeTab === AuthTab.Login ? "تسجيل الدخول للعب" : "تسجيل حساب جديد"}
            </p>
          </div>
          
          {activeTab === AuthTab.Login ? (
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم المستخدم</label>
                <Input 
                  type="text" 
                  className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">كلمة المرور</label>
                <Input 
                  type="password" 
                  className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A] font-bold py-3 px-4 rounded-md transition-all"
              >
                دخول
              </Button>
              
              <div className="flex justify-between text-sm">
                <button 
                  type="button" 
                  className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
                >
                  نسيت كلمة المرور؟
                </button>
                <button
                  type="button"
                  className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
                  onClick={() => setActiveTab(AuthTab.Register)}
                >
                  إنشاء حساب
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-1">اسم المستخدم</label>
                <Input 
                  type="text" 
                  className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">البريد الإلكتروني</label>
                <Input 
                  type="email" 
                  className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              
              <div>
                <label className="block text-white mb-1">كلمة المرور</label>
                <Input 
                  type="password" 
                  className="w-full bg-[#0A0A0A]/70 border border-[#D4AF37]/30 rounded py-2 px-3 text-white focus:outline-none focus:border-[#D4AF37]" 
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A] font-bold py-3 px-4 rounded-md transition-all"
              >
                تسجيل
              </Button>
              
              <div className="text-center text-sm">
                <button
                  type="button"
                  className="text-[#D4AF37]/90 hover:text-[#D4AF37]"
                  onClick={() => setActiveTab(AuthTab.Login)}
                >
                  لديك حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
