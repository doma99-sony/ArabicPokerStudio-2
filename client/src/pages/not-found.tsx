import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-deepBlack">
      <Card className="w-full max-w-md mx-4 bg-slate/20 border-gold/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-casinoRed" />
            <h1 className="text-2xl font-bold text-gold font-cairo">404 الصفحة غير موجودة</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-gold/80 font-tajawal">
            لم يتم العثور على الصفحة التي تبحث عنها
          </p>
          
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-gold hover:bg-darkGold text-deepBlack font-bold py-2 rounded transition-colors font-cairo"
          >
            العودة إلى الصفحة الرئيسية
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
