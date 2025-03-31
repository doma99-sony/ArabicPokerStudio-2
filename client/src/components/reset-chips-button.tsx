import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function ResetChipsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const resetChips = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/debug/reset-chips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ amount: 1000000 }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "تم إعادة تعيين الرصيد",
          description: data.message || "تم إعادة تعيين رصيدك بنجاح",
        });
        
        // تحديث الصفحة لتحديث بيانات المستخدم
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "خطأ",
          description: data.message || "حدث خطأ أثناء إعادة تعيين الرصيد",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في إعادة تعيين الرصيد:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة تعيين الرصيد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-black hover:bg-gradient-to-r hover:from-[#E5C04B] hover:to-[#BF9E37]"
      onClick={resetChips}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin ml-2" />
      ) : (
        <>
          <Coins className="ml-2 h-4 w-4" />
          إعادة تعيين الرصيد
        </>
      )}
    </Button>
  );
}