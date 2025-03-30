import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";

enum AuthTab {
  Login,
  Register
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>(AuthTab.Login);
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Redirect to lobby if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center"
         style={{ 
           backgroundImage: "url('/images/egyptian-background.jpg')",
           backgroundSize: "cover",
           backgroundPosition: "center"
         }}>
      <div className="absolute inset-0 bg-[#0A0A0A]/70 backdrop-blur-sm"></div>
      
      <div className="relative max-w-md w-full mx-4 rounded-xl overflow-hidden shadow-lg z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">بوكر تكساس هولدم</h1>
            <p className="text-[#D4AF37]/80">
              {activeTab === AuthTab.Login ? "تسجيل الدخول للعب" : "تسجيل حساب جديد"}
            </p>
          </div>
          
          {activeTab === AuthTab.Login ? (
            <LoginForm onSwitchToRegister={() => setActiveTab(AuthTab.Register)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setActiveTab(AuthTab.Login)} />
          )}
        </div>
      </div>
    </div>
  );
}
