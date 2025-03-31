import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// صفحة للانضمام المباشر إلى طاولة محددة
export default function DirectTablePage() {
  const { tableId } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من معرف الطاولة
  const parsedTableId = tableId ? parseInt(tableId) : null;

  // الانضمام إلى الطاولة
  const joinTableMutation = useMutation({
    mutationFn: async (tableId: number) => {
      const response = await fetch(`/api/game/${tableId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل الانضمام إلى الطاولة");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      console.log("تم الانضمام بنجاح للطاولة:", data);
      
      // حفظ معرف الطاولة في التخزين المحلي
      localStorage.setItem("tableId", variables.toString());
      
      // إعادة توجيه المستخدم إلى صفحة اللعب المبسطة
      navigate(`/game-simple/${variables}`);
    },
    onError: (error: Error) => {
      setError(error.message);
      console.error("خطأ أثناء الانضمام للطاولة:", error);
      toast({
        title: "فشل الانضمام إلى الطاولة",
        description: error.message,
        variant: "destructive",
      });
      
      // العودة إلى الصفحة الرئيسية بعد فترة قصيرة
      setTimeout(() => {
        navigate("/");
      }, 3000);
    },
  });

  useEffect(() => {
    if (!parsedTableId) {
      setError("معرف الطاولة غير صالح");
      setLoading(false);
      
      // العودة إلى الصفحة الرئيسية بعد فترة قصيرة
      setTimeout(() => {
        navigate("/");
      }, 3000);
      return;
    }

    // محاولة الانضمام للطاولة
    joinTableMutation.mutate(parsedTableId);
  }, [parsedTableId, navigate, joinTableMutation]);

  // عرض شاشة التحميل
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black/80">
      <div className="text-center p-6 rounded-lg shadow-2xl bg-black/70 border border-[#D4AF37]/20 backdrop-blur-md">
        {loading && !error ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">جاري الانضمام إلى الطاولة {parsedTableId}...</h2>
            <p className="text-gray-300">يرجى الانتظار قليلاً بينما نجهز طاولة اللعب</p>
          </>
        ) : error ? (
          <>
            <div className="h-16 w-16 mx-auto mb-4 text-red-500">❌</div>
            <h2 className="text-xl font-bold text-white mb-2">فشل الانضمام إلى الطاولة</h2>
            <p className="text-red-400">{error}</p>
            <p className="text-gray-300 mt-4">سيتم إعادة توجيهك تلقائيًا...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}