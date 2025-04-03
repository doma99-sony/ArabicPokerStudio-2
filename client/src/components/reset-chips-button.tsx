import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Coins, Lock, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetChipsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState<number>(1000000);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = useAuth();

  const resetChips = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch("/api/debug/reset-chips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          password,
          amount: Number(amount)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "تم إعادة تعيين الرصيد",
          description: data.message || "تم إعادة تعيين رصيدك بنجاح",
        });
        
        // إغلاق مربع الحوار
        setOpen(false);
        
        // تحديث الصفحة لتحديث بيانات المستخدم
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(data.message || "حدث خطأ أثناء إعادة تعيين الرصيد");
        toast({
          title: "خطأ",
          description: data.message || "حدث خطأ أثناء إعادة تعيين الرصيد",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("خطأ في إعادة تعيين الرصيد:", error);
      setError("حدث خطأ أثناء إعادة تعيين الرصيد");
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة تعيين الرصيد",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من صحة الإدخال
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // السماح بالأرقام فقط
    if (/^\d*$/.test(value)) {
      setAmount(value === "" ? 0 : parseInt(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 p-0 h-10 w-10 rounded-full border border-[#D4AF37]/50"
          title="إعادة تعبئة الرصيد"
        >
          <Coins className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            إعادة تعبئة الرصيد
          </DialogTitle>
          <DialogDescription>
            أدخل كلمة المرور والمبلغ الذي ترغب بإضافته إلى رصيدك.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور للمتابعة"
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              المبلغ
            </Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="أدخل المبلغ المطلوب"
              className="col-span-3"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={resetChips}
            disabled={isLoading || !password}
            className="bg-gradient-to-r from-[#D4AF37] to-[#AA8C2C] text-black hover:bg-gradient-to-r hover:from-[#E5C04B] hover:to-[#BF9E37]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            ) : (
              <>
                تأكيد
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}