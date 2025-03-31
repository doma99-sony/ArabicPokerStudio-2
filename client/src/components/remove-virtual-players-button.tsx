import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function RemoveVirtualPlayersButton() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const removeVirtualPlayersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/system/remove-virtual-players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إزالة اللاعبين الوهميين');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تمت العملية بنجاح",
        description: data.message || "تمت إزالة اللاعبين الوهميين بنجاح",
        variant: "default",
      });
      
      // إغلاق الحوار بعد نجاح العملية
      setOpen(false);
      
      // إعادة تعيين الحقول
      setPassword("");
      
      // إعادة تحميل بيانات الطاولات لتحديث عرض اللاعبين
      queryClient.invalidateQueries({ queryKey: ['/api/tables'] });
    },
    onError: (error: Error) => {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    removeVirtualPlayersMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
        >
          <UserX size={14} className="ml-1" />
          إزالة اللاعبين الوهميين
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">إزالة اللاعبين الوهميين</DialogTitle>
          <DialogDescription className="text-gray-400">
            سيؤدي هذا الإجراء إلى إزالة جميع اللاعبين الوهميين من الطاولات. يرجى إدخال كلمة المرور للمتابعة.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="col-span-4 bg-gray-800 border-gray-700"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={removeVirtualPlayersMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {removeVirtualPlayersMutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <UserX className="ml-2 h-4 w-4" />
                  إزالة اللاعبين الوهميين
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}