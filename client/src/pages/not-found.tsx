import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { redirectToHome } from "@/components/navigation/home-redirect";

export default function NotFound() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // توجيه تلقائي إلى اللوبي بعد ثوانٍ قليلة
  useEffect(() => {
    const timer = setTimeout(() => {
      redirectToHome(navigate, user);
    }, 1500); // انتظر 1.5 ثانية قبل الانتقال
    
    return () => clearTimeout(timer);
  }, [navigate, user]);
  
  // انتقال فوري عند النقر على الزر
  const handleReturnHome = () => {
    redirectToHome(navigate, user);
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <Card className="w-full max-w-md mx-4 bg-black/70 border-[#D4AF37]/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-[#D4AF37] font-cairo">404 الصفحة غير موجودة</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-[#D4AF37]/80 font-tajawal">
            لم يتم العثور على الصفحة التي تبحث عنها
          </p>
          
          <p className="mt-4 mb-6 text-xs text-[#D4AF37]/60 font-tajawal animate-pulse">
            سيتم توجيهك تلقائيًا إلى الصفحة الرئيسية...
          </p>
          
          <Button 
            onClick={handleReturnHome}
            className="w-full bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold py-2 rounded transition-colors font-cairo"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
